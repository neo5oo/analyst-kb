# Analyst KB

База знаний по системному анализу на Hugo с темой Hextra.

## Что внутри

- Структурированные статьи по системному анализу, архитектуре, API и данным.
- Полнотекстовый поиск по контенту.
- Кастомные шаблоны, стили и UI-доработки.
- Русскоязычный контент (`ru-RU`).

## Технологии

- [Hugo](https://gohugo.io/) (extended)
- Тема [Hextra](https://github.com/imfing/hextra) (включена в репозиторий как обычная папка `themes/hextra`)

## Запуск локально

Требования:

- Hugo Extended (рекомендуется версия 0.160+)

Команды:

```bash
hugo server -D
```

Сайт будет доступен на `http://localhost:1313`.

## Production build

```bash
hugo --gc --minify
```

Собранный сайт появляется в папке `public/`.

## Структура проекта

- `content/` — статьи и разделы базы знаний
- `layouts/` — переопределения шаблонов темы
- `assets/` — кастомные CSS/JS/данные поиска
- `static/` — статические файлы
- `themes/hextra/` — исходники темы
- `hugo.toml` — конфигурация сайта

## Публикация в Vercel

Рекомендуемые настройки:

- Framework Preset: `Hugo`
- Build Command: `hugo --gc --minify`
- Output Directory: `public`

Перед прод-деплоем обновите `baseURL` в `hugo.toml` на ваш публичный домен.

## Лицензия

Проект распространяется по лицензии **CC BY-SA 4.0**. Подробности в файле `LICENSE`.

## Контакты

- Telegram: [@neo_61](https://t.me/neo_61)
