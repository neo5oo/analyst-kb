/**
 * Обновляет frontmatter во всех content/*.md:
 * - удаляет priority, targetAudience, readingTime, tags
 * - задаёт description из текста статьи (заменяет «Краткое описание» и пустое)
 */
import { readFileSync, writeFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");

const REMOVE_LINE_PREFIXES = [
  /^priority:\s*/,
  /^targetAudience:\s*/,
  /^readingTime:\s*/,
];

const PLACEHOLDERS = new Set([
  "краткое описание",
  "краткое описание.",
  "todo",
  "tbd",
  "",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

function splitFrontmatter(raw) {
  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) return null;
  const rest = raw.slice(4);
  const m = /\r?\n---\r?\n/.exec(rest);
  if (!m) return null;
  const fm = rest.slice(0, m.index);
  const body = rest.slice(m.index + m[0].length);
  return { fm, body };
}

function removeFencedCode(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("```", i)) {
      const end = text.indexOf("```", i + 3);
      if (end === -1) break;
      i = end + 3;
      while (i < text.length && /[\r\n]/.test(text[i])) i++;
      continue;
    }
    out += text[i];
    i++;
  }
  return out;
}

function stripMd(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/[`*_#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSummary(body, title, maxLen = 280) {
  body = removeFencedCode(body);
  const paragraphs = body.split(/\n\s*\n/);
  const collected = [];
  for (const block of paragraphs) {
    const b = block.trim();
    if (!b) continue;
    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => l.startsWith("#"))) continue;
    if (b.includes("|") && (b.match(/\|/g) || []).length >= 4) continue;
    const proseLines = [];
    for (const ln of lines) {
      if (ln.startsWith("#")) continue;
      if (/\|/.test(ln) && /---/.test(ln)) continue;
      proseLines.push(ln);
    }
    if (!proseLines.length) continue;
    let chunk = proseLines.join(" ");
    if (/^(- |\d+\.\s)/.test(chunk)) {
      chunk = stripMd(chunk);
      const parts = chunk.split(/\s*-\s+/);
      if (parts.length > 2) {
        chunk = parts[0] + ": " + parts.slice(1, 3).join(" ");
      }
    } else {
      chunk = stripMd(chunk);
    }
    if (chunk.length < 25) continue;
    collected.push(chunk);
    if (collected.join(" ").length > 80) break;
  }
  let text = collected.join(" ").trim();
  if (!text) text = stripMd(title || "");
  text = text.replace(/\s+/g, " ");
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = [];
  let total = 0;
  for (const part of sentences) {
    if (!part) continue;
    if (total + part.length > maxLen && out.length) break;
    out.push(part);
    total += part.length + 1;
    if (total >= maxLen * 0.6 && out.length >= 2) break;
  }
  let result = out.join(" ").trim();
  if (result.length > maxLen) {
    const cut = result.slice(0, maxLen - 1).lastIndexOf(" ");
    result = (cut > 40 ? result.slice(0, cut) : result.slice(0, maxLen - 1)) + "…";
  }
  return result || (stripMd(title) || "Материал базы знаний.");
}

/** Удаляет из массива строк FM блок tags и строки priority/targetAudience/readingTime */
function filterFmLines(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (REMOVE_LINE_PREFIXES.some((re) => re.test(line))) continue;
    if (/^tags:\s*$/.test(line.trim())) {
      while (i + 1 < lines.length && /^\s+-\s/.test(lines[i + 1])) i++;
      continue;
    }
    if (/^tags:\s+\S/.test(line.trim())) {
      // tags: [a, b] одной строкой
      continue;
    }
    out.push(line);
  }
  return out;
}

function parseDescriptionValue(line) {
  const m = /^description:\s*(.*)$/.exec(line);
  if (!m) return null;
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
}

function needsNewDescription(val) {
  const s = (val || "").trim().toLowerCase();
  return PLACEHOLDERS.has(s) || s === "краткое описание";
}

/** description: | или > — не трогаем */
function isMultilineDescriptionStart(line) {
  return /^\s*description:\s*([|>]|-)\s*$/.test(line);
}

function processFile(path) {
  const raw = readFileSync(path, "utf8");
  const sp = splitFrontmatter(raw);
  if (!sp) return false;

  let { fm, body } = sp;
  /** Hugo shortcodes в description ломают YAML — не трогаем такие файлы */
  if (/description:\s*\{\{/.test(fm)) return false;
  const lines = fm.split(/\r?\n/);
  const filtered = filterFmLines(lines);

  let title = "";
  let descLineIdx = -1;
  let descVal = "";
  let skipReplace = false;

  for (let i = 0; i < filtered.length; i++) {
    const line = filtered[i];
    const tm = /^title:\s*(.*)$/.exec(line);
    if (tm) {
      let t = tm[1].trim();
      if (
        (t.startsWith('"') && t.endsWith('"')) ||
        (t.startsWith("'") && t.endsWith("'"))
      )
        t = t.slice(1, -1);
      title = t;
    }
    if (/^\s*description:\s*/.test(line)) {
      descLineIdx = i;
      if (isMultilineDescriptionStart(line)) {
        skipReplace = true;
        break;
      }
      descVal = parseDescriptionValue(line) ?? "";
    }
  }

  if (skipReplace) {
    // только удаление ключей
    const newFm = filtered.join("\n");
    const newRaw = `---\n${newFm}\n---\n${body}`;
    if (newRaw !== raw) {
      writeFileSync(path, newRaw, "utf8");
      return true;
    }
    return false;
  }

  const needDesc = needsNewDescription(descVal);
  const newDesc = needDesc ? firstSummary(body, title) : descVal;

  if (descLineIdx >= 0 && needDesc) {
    filtered[descLineIdx] = `description: ${yamlEscapeScalar(newDesc)}`;
  } else if (needDesc && descLineIdx < 0) {
    // вставить description после draft если есть, иначе после title
    let ins = 0;
    for (let i = 0; i < filtered.length; i++) {
      if (/^draft:\s*/.test(filtered[i])) {
        ins = i + 1;
        break;
      }
      if (/^title:\s*/.test(filtered[i])) ins = i + 1;
    }
    filtered.splice(ins, 0, `description: ${yamlEscapeScalar(newDesc)}`);
  }

  const newFm = filtered.join("\n");
  const newRaw = `---\n${newFm}\n---\n${body}`;
  if (newRaw === raw) return false;
  writeFileSync(path, newRaw, "utf8");
  return true;
}

function yamlEscapeScalar(s) {
  if (/[:#\n\r\t]/.test(s) || s.startsWith('"') || s.startsWith("'")) {
    return (
      '"' +
      s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") +
      '"'
    );
  }
  return s;
}

let n = 0;
for (const p of walk(CONTENT)) {
  try {
    if (processFile(p)) {
      n++;
      console.log(relative(ROOT, p));
    }
  } catch (e) {
    console.error(p, e);
  }
}
console.error(`Updated ${n} files`);
