#!/usr/bin/env python3
"""
Обновляет frontmatter во всех content/*.md:
- удаляет priority, targetAudience, readingTime, tags
- задаёт description из текста статьи (заменяет плейсхолдер «Краткое описание» и пустое)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Need PyYAML: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

REMOVE_KEYS = frozenset({"priority", "targetAudience", "readingTime", "tags"})
PLACEHOLDERS = frozenset(
    {
        "краткое описание",
        "краткое описание.",
        "todo",
        "tbd",
        "",
    }
)

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"


def split_frontmatter(raw: str) -> tuple[str | None, str]:
    if not raw.startswith("---"):
        return None, raw
    # First line is ---
    lines = raw.split("\n")
    if lines[0].strip() != "---":
        return None, raw
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            fm = "\n".join(lines[1:i])
            body = "\n".join(lines[i + 1 :])
            if body.startswith("\n"):
                body = body[1:]
            elif not body:
                pass
            return fm, body
    return None, raw


def strip_markdown_prose(s: str) -> str:
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"!\[([^\]]*)\]\([^)]+\)", "", s)
    s = re.sub(r"[`*_#]+", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def remove_fenced_code(text: str) -> str:
    out = []
    i = 0
    n = len(text)
    while i < n:
        if text.startswith("```", i):
            end = text.find("```", i + 3)
            if end == -1:
                break
            i = end + 3
            while i < n and text[i] in "\r\n":
                i += 1
            continue
        out.append(text[i])
        i += 1
    return "".join(out)


def first_summary_sentence(body: str, title: str, max_len: int = 280) -> str:
    body = remove_fenced_code(body)
    # убрать первую строку если это одинокий заголовок H1 дублирующий title
    paragraphs = re.split(r"\n\s*\n", body)
    collected = []
    for block in paragraphs:
        block = block.strip()
        if not block:
            continue
        lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
        if not lines:
            continue
        # пропуск чистых заголовков
        if all(ln.startswith("#") for ln in lines):
            continue
        # таблицы — пропуск
        if "|" in block and block.count("|") >= 4:
            continue
        prose_lines = []
        for ln in lines:
            if ln.startswith("#"):
                continue
            if ln.startswith("|") and "---" in ln:
                continue
            prose_lines.append(ln)
        if not prose_lines:
            continue
        chunk = " ".join(prose_lines)
        # списки: взять первые пункты как краткий текст
        if chunk.startswith("- ") or re.match(r"^\d+\.\s", chunk):
            chunk = strip_markdown_prose(chunk)
            # ограничить длину списка — первые 2 пункта
            parts = re.split(r"\s*-\s+", chunk)
            if len(parts) > 2:
                chunk = parts[0] + ": " + " ".join(parts[1:3]) if parts[0] else " ".join(parts[:3])
        else:
            chunk = strip_markdown_prose(chunk)
        if len(chunk) < 25:
            continue
        collected.append(chunk)
        if len(" ".join(collected)) > 80:
            break
    text = " ".join(collected).strip()
    if not text:
        text = strip_markdown_prose(title) if title else ""
    # предложения
    text = re.sub(r"\s+", " ", text)
    # обрезка по предложениям
    out = []
    total = 0
    for part in re.split(r"(?<=[.!?])\s+", text):
        if not part:
            continue
        if total + len(part) > max_len and out:
            break
        out.append(part)
        total += len(part) + 1
        if total >= max_len * 0.6 and len(out) >= 2:
            break
    result = " ".join(out).strip()
    if len(result) > max_len:
        result = result[: max_len - 1].rsplit(" ", 1)[0] + "…"
    return result or (strip_markdown_prose(title) if title else "Материал базы знаний.")


def process_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    fm_raw, body = split_frontmatter(raw)
    if fm_raw is None:
        return False
    try:
        data = yaml.safe_load(fm_raw) or {}
    except yaml.YAMLError:
        print(f"YAML error: {path}", file=sys.stderr)
        return False
    if not isinstance(data, dict):
        return False

    changed = False
    for k in REMOVE_KEYS:
        if k in data:
            del data[k]
            changed = True

    title = data.get("title") or ""
    desc = data.get("description")
    desc_str = (desc if isinstance(desc, str) else "") or ""
    need_desc = (
        not desc_str.strip()
        or desc_str.strip().lower() in PLACEHOLDERS
        or desc_str.strip() == "Краткое описание"
    )
    if need_desc:
        new_d = first_summary_sentence(body, str(title))
        data["description"] = new_d
        changed = True
    elif any(k in fm_raw for k in REMOVE_KEYS):
        # ключи уже удалили из dict — перезапишем файл
        changed = True

    if not changed:
        return False

    # Стабильный порядок ключей для читаемости
    preferred = ["title", "weight", "draft", "description"]
    ordered: dict = {}
    for k in preferred:
        if k in data:
            ordered[k] = data[k]
    for k, v in data.items():
        if k not in ordered:
            ordered[k] = v

    dump = yaml.dump(
        ordered,
        allow_unicode=True,
        default_flow_style=False,
        sort_keys=False,
        width=1000,
    )
    new_raw = "---\n" + dump + "---\n" + body
    if new_raw != raw:
        path.write_text(new_raw, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = 0
    for path in sorted(CONTENT.rglob("*.md")):
        if process_file(path):
            n += 1
            print(path.relative_to(ROOT))
    print(f"Updated {n} files", file=sys.stderr)


if __name__ == "__main__":
    main()
