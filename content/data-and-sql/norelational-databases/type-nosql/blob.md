---
title: Blob Store
weight: 70
draft: false
description: "Blob Store — специализированное хранилище для больших бинарных объектов (изображения, видео, бэкапы, логи). Характеристики: плоское пространство имён (контейнер + ключ), HTTP API (PUT/GET/DELETE), высокая пропускная способность, низкая стоимость за гигабайт. Примеры: Amazon S3, Google Cloud Storage, Azure Blob, MinIO. Паттерны использования (хранение пользовательского контента, CDN, предподписанные URL, бэкапы, статические сайты). Отличие от баз данных (нет поиска, нет транзакций, eventual consistency). Интеграция с БД (метаданные в БД, файлы в Blob Store)."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что такое blob/object storage?
    options:
    - База только для SQL-таблиц
    - Графовое хранилище для рекомендаций
    - Хранилище крупных бинарных объектов и файлов с доступом по ключу/идентификатору
    - Система очередей сообщений
    correctIndex: 2
    explanation: Blob store предназначен для файлов, а не для сложных транзакционных связей.
  - question: Когда blob store особенно полезен?
    options:
    - Когда требуется выполнить JOIN по заказам и клиентам
    - Когда нужно хранить изображения, видео, бэкапы, документы или большие бинарные объекты
    - Когда нужна только обработка RPC
    - Когда данные существуют только в RAM
    correctIndex: 1
    explanation: Object storage — естественный выбор для файлового контента.
  - question: Почему blob store обычно не заменяет реляционную БД?
    options:
    - Потому что он не может хранить байты
    - Потому что он работает только локально
    - Потому что в нём нельзя делать загрузку файлов
    - Потому что он хранит объекты, но не решает полноценно задачу структурированных связей и транзакций
    correctIndex: 3
    explanation: Часто метаданные лежат в БД, а сами файлы — в blob/object storage.
  - question: Какой плюс характерен для object storage?
    options:
    - Простое масштабирование и удобная работа с большими файлами по ключам
    - Глобальный строгий SQL-schema enforcement
    - Автоматическая нормализация третьей формы
    - Exactly-once доставка сообщений
    correctIndex: 0
    explanation: Object storage хорошо приспособлен к масштабному хранению контента.
---
## Введение: Где живут фотографии и видео

Представьте, что вы создаете социальную сеть. Миллионы пользователей загружают фотографии, видео, аватарки. Как хранить эти файлы? В реляционной базе данных? В MongoDB? Это плохая идея.

Файлы могут быть большими — фотография 5 МБ, видео 100 МБ. Базы данных не оптимизированы для таких объектов. Они будут:
- Занимать огромное место (с хранением бинарных данных в строках)
- Медленно работать (большие объекты разрушают кеш)
- Дорого масштабироваться (БД для метаданных, а не для файлов)

**Blob Store (Binary Large Object Store)** — это специализированное хранилище для больших бинарных объектов: изображений, видео, аудио, PDF, архивов, резервных копий.

Blob Store — это не база данных в классическом смысле. Это скорее "бесконечный жесткий диск в облаке" с HTTP API. Вы кладете файл, получаете URL, потом читаете файл по этому URL. Нет запросов, нет JOIN, нет транзакций. Только простые операции: положить, получить, удалить, получить список.

## Что такое Blob Store

**Blob Store (Binary Large Object Storage)** — это система хранения неструктурированных данных большого объема. Основные характеристики:

- **Хранение больших объектов:** от байтов до терабайт
- **Плоское пространство имен:** обычно "контейнер" + "ключ" (нет папок, хотя эмулируются)
- **HTTP API:** PUT, GET, DELETE через REST
- **Высокая пропускная способность:** гигабиты в секунду
- **Низкая стоимость:** дешевле, чем базы данных

**Blob** (Binary Large Object) — любой бинарный объект: изображение, видео, PDF, архив, бэкап, лог-файл.

**Важно:** Blob Store не умеет искать внутри объектов. Вы не можете спросить "найди все фотографии с котами". Для этого нужен отдельный индекс (база данных), который хранит метаданные и ссылки на Blob Store.

## Blob Store vs другие типы хранения

| Характеристика | Blob Store | Реляционная БД | Документная БД | Файловая система |
| :--- | :--- | :--- | :--- | :--- |
| **Размер объекта** | GB - TB | KB - MB | MB | Без ограничений |
| **Количество объектов** | Миллиарды | Миллионы | Миллионы | Миллионы |
| **Скорость записи** | Высокая (асинхронная) | Средняя | Средняя | Высокая |
| **Скорость чтения** | Высокая (HTTP range) | Средняя | Средняя | Высокая |
| **Метаданные** | Ограниченные (ключ-значение) | Полные (схема) | Гибкие | Атрибуты файла |
| **Поиск внутри** | Нет | Да (SQL) | Да (JSON) | Нет |
| **Цена за ГБ** | Очень низкая | Высокая | Высокая | Средняя |
| **Масштабирование** | Автоматическое | Ручное | Ручное | Ручное |
| **API** | HTTP (REST) | SQL | JSON | POSIX (файловые операции) |

## Как устроен Blob Store

### Основные операции

```http
# Положить объект
PUT /mycontainer/myblob
Content-Type: image/jpeg
Authorization: Bearer token123

[бинарные данные изображения]

# Получить объект
GET /mycontainer/myblob

# Получить часть объекта (Range запрос)
GET /mycontainer/myblob
Range: bytes=0-1023

# Получить метаданные без скачивания
HEAD /mycontainer/myblob

# Удалить объект
DELETE /mycontainer/myblob

# Список объектов
GET /mycontainer?prefix=images/
```

### Контейнеры и ключи

- **Container (контейнер / bucket):** как "коробка" для группы объектов. Единственный уровень группировки.
- **Key (ключ):** уникальный идентификатор объекта в контейнере. Может включать "/" для эмуляции папок.

```
Контейнер: "user-content"
Ключи:
  - "avatars/user123.jpg"
  - "photos/2024/01/15/vacation.jpg"
  - "videos/user456/intro.mp4"
```

### Иерархия в AWS S3

```
Account (аккаунт AWS)
  └── Bucket (контейнер) "my-awesome-app"
        ├── images/
        │     ├── logo.png
        │     └── banner.jpg
        ├── videos/
        │     └── promo.mp4
        └── backups/
              └── db-backup-2024-01-15.sql.gz
```

**Важно:** В S3 нет реальных папок. `images/logo.png` — это просто ключ с символом "/". Эмуляция папок есть в UI, но на API уровне это просто строка.

## Популярные Blob Store

### Amazon S3 (Simple Storage Service)

Самый популярный Blob Store. Стандарт индустрии.

```python
# boto3 (AWS SDK)
import boto3
s3 = boto3.client('s3')

# Загрузка
s3.upload_file('local.jpg', 'my-bucket', 'images/photo.jpg', ExtraArgs={'ContentType': 'image/jpeg'})

# Скачивание
s3.download_file('my-bucket', 'images/photo.jpg', 'downloaded.jpg')

# Получение URL (публичный)
url = f"https://my-bucket.s3.amazonaws.com/images/photo.jpg"

# Получение подписанного URL (временный доступ)
url = s3.generate_presigned_url('get_object', Params={'Bucket': 'my-bucket', 'Key': 'images/photo.jpg'}, ExpiresIn=3600)
```

**Классы хранения S3:**

| Класс | Доступность | Цена | Задержка | Когда использовать |
| :--- | :--- | :--- | :--- | :--- |
| **S3 Standard** | 99.99% | Высокая | Мс | Часто используемые данные |
| **S3 Intelligent-Tiering** | 99.9% | Средняя | Мс | Непредсказуемый доступ |
| **S3 Standard-IA** | 99.9% | Низкая | Мс | Редко используемые (IA = Infrequent Access) |
| **S3 One Zone-IA** | 99.5% | Очень низкая | Мс | Не критичные данные |
| **S3 Glacier Instant** | 99.9% | Низкая | Мс | Архив, но нужен быстрый доступ |
| **S3 Glacier Flexible** | 99.9% | Очень низкая | Минуты | Архив |
| **S3 Glacier Deep Archive** | 99.9% | Минимальная | Часы | Долгосрочный архив |

### Google Cloud Storage

Аналог S3 в GCP.

```python
# Google Cloud Storage
from google.cloud import storage
client = storage.Client()
bucket = client.bucket('my-bucket')

# Загрузка
blob = bucket.blob('images/photo.jpg')
blob.upload_from_filename('local.jpg')

# Скачивание
blob.download_to_filename('downloaded.jpg')

# Публичный URL
blob.make_public()
url = blob.public_url
```

**Классы хранения GCS:**
- **Standard:** частый доступ
- **Nearline:** раз в месяц
- **Coldline:** раз в квартал
- **Archive:** раз в год

### Azure Blob Storage

Аналог S3 в Azure.

```python
# Azure Blob Storage
from azure.storage.blob import BlobServiceClient
client = BlobServiceClient.from_connection_string(conn_str)
container_client = client.get_container_client('my-container')

# Загрузка
with open('local.jpg', 'rb') as data:
    container_client.upload_blob('images/photo.jpg', data)

# Скачивание
blob_client = container_client.get_blob_client('images/photo.jpg')
with open('downloaded.jpg', 'wb') as f:
    f.write(blob_client.download_blob().readall())
```

**Уровни доступа Azure:**
- **Hot:** частый доступ
- **Cool:** редкий доступ (30+ дней)
- **Cold:** еще реже (90+ дней)
- **Archive:** архив (180+ дней)

### MinIO

Open-source S3-совместимый Blob Store. Можно запустить у себя.

```bash
# Запуск MinIO в Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"

# Использование через AWS SDK (совместим с S3)
s3 = boto3.client('s3', endpoint_url='http://localhost:9000', aws_access_key_id='minioadmin', aws_secret_access_key='minioadmin')
```

**Характеристики MinIO:**
- 100% совместимость с S3 API
- Open source (GNU AGPL)
- Кластеризация (distributed mode)
- Энтерпрайз-функции (encryption, replication)

### DigitalOcean Spaces / Wasabi / Backblaze B2

Дешевые S3-совместимые альтернативы.

| Сервис | Цена за ГБ | Исходящий трафик | Особенность |
| :--- | :--- | :--- | :--- |
| **AWS S3** | $0.023 | Платный | Стандарт |
| **DigitalOcean Spaces** | $0.02 | Бесплатно (внутри DO) | Простой, предсказуемый |
| **Wasabi** | $0.0069 | Бесплатно (до 2x хранилища) | Очень дешево |
| **Backblaze B2** | $0.006 | Бесплатно (до 3x в день) | Дешево, интеграции |

## Паттерны использования Blob Store

### Паттерн 1: Хранение пользовательского контента (User-Generated Content)

```javascript
// Пользователь загружает аватар
POST /api/users/123/avatar
Content-Type: multipart/form-data

// 1. Принимаем файл в приложении
const avatarFile = request.files.avatar;

// 2. Генерируем уникальный ключ
const key = `avatars/user-123-${Date.now()}.jpg`;

// 3. Загружаем в S3
await s3.upload({
    Bucket: 'my-app-content',
    Key: key,
    Body: avatarFile.data,
    ContentType: avatarFile.mimetype,
    ACL: 'public-read'  // Публичный доступ
});

// 4. Сохраняем URL в базе данных
await db.users.update({ id: 123 }, { avatar_url: `https://my-app-content.s3.amazonaws.com/${key}` });

// 5. Возвращаем URL клиенту
return { avatar_url: `https://my-app-content.s3.amazonaws.com/${key}` };
```

### Паттерн 2: CDN + Blob Store (доставка контента)

```mermaid
graph LR
    A[Пользователь] --> B[CDN (CloudFront / Cloudflare)]
    B --> C[Blob Store (S3)]
    C --> D[Origin]
    
    B -->|Кеширует| E[Edge Location]
```

**Настройка:**
1. Blob Store настроен как origin для CDN
2. CDN кеширует популярный контент (TTL 24 часа)
3. Blob Store раздает только то, что не попало в кеш

### Паттерн 3: Предподписанные URL (временный доступ)

```javascript
// Генерация временной ссылки на приватный файл
function getDownloadUrl(fileKey, userId) {
    // Проверка прав доступа
    if (!userCanAccessFile(userId, fileKey)) {
        throw new Error('Access denied');
    }
    
    // Генерация ссылки на 1 час
    return s3.getSignedUrl('getObject', {
        Bucket: 'my-app-private',
        Key: fileKey,
        Expires: 3600  // 1 час
    });
}
```

### Паттерн 4: Мультипарт аплоад (большие файлы)

Для файлов > 100 МБ лучше использовать мультипарт аплоад (загрузка частями).

```javascript
// Начало мультипарт аплоада
const multipart = await s3.createMultipartUpload({
    Bucket: 'my-app-content',
    Key: 'videos/big-video.mp4'
});

// Загрузка частей (можно параллельно)
const parts = [];
for (let i = 0; i < 10; i++) {
    const part = await s3.uploadPart({
        Bucket: 'my-app-content',
        Key: 'videos/big-video.mp4',
        UploadId: multipart.UploadId,
        PartNumber: i + 1,
        Body: getPartData(i)
    });
    parts.push({ PartNumber: i + 1, ETag: part.ETag });
}

// Завершение
await s3.completeMultipartUpload({
    Bucket: 'my-app-content',
    Key: 'videos/big-video.mp4',
    UploadId: multipart.UploadId,
    MultipartUpload: { Parts: parts }
});
```

### Паттерн 5: Blob Store как бэкап-хранилище

```bash
# PostgreSQL бэкап в S3
pg_dump mydb | gzip | aws s3 cp - s3://my-backups/mydb-$(date +%Y%m%d).sql.gz

# MySQL бэкап
mysqldump mydb | gzip | aws s3 cp - s3://my-backups/mydb-$(date +%Y%m%d).sql.gz

# Логи
aws s3 sync /var/log/myapp/ s3://my-logs/myapp/$(date +%Y/%m/%d)/
```

### Паттерн 6: Статический сайт на Blob Store

```bash
# Загрузка статического сайта в S3
aws s3 sync ./build/ s3://my-static-website/

# Включение хостинга статического сайта
aws s3 website s3://my-static-website/ --index-document index.html --error-document 404.html

# Настройка публичного доступа
aws s3api put-bucket-policy --bucket my-static-website --policy file://policy.json
```

**policy.json:**

```json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::my-static-website/*"
    }]
}
```

## Blob Store + База данных: Золотая пара

Blob Store не заменяет базу данных. Они работают вместе.

```sql
-- Таблица для метаданных (в PostgreSQL)
CREATE TABLE files (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename TEXT NOT NULL,
    s3_key TEXT NOT NULL,           -- ключ в S3
    s3_bucket TEXT NOT NULL,        -- контейнер
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false
);

-- Индексы для поиска
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_created_at ON files(created_at);
```

**Почему нельзя хранить файлы в базе?**

```sql
-- Плохо: хранение файлов в PostgreSQL
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    data BYTEA  -- бинарные данные
);

-- Проблемы:
-- 1. Большие объекты разрушают кеш PostgreSQL
-- 2. Резервное копирование становится огромным
-- 3. Репликация копирует файлы на все реплики
-- 4. Нельзя использовать CDN
```

**Правильно: метаданные в БД, файлы в Blob Store**

```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    s3_key TEXT NOT NULL  -- только ссылка
);
```

## Преимущества и недостатки

### Преимущества

| Преимущество | Описание |
| :--- | :--- |
| **Безлимитное масштабирование** | Можно хранить эксабайты данных |
| **Низкая стоимость** | $0.01-0.02 за ГБ (в 10-100 раз дешевле БД) |
| **Высокая пропускная способность** | Гигабиты в секунду |
| **Простота** | HTTP API, не нужны запросы |
| **Долговечность** | 99.999999999% (11 девяток) в S3 |
| **Доступность** | 99.99% (SLA) |
| **CDN интеграция** | Легко подключается CloudFront / Cloudflare |

### Недостатки

| Недостаток | Описание |
| :--- | :--- |
| **Нет поиска внутри объектов** | Нельзя найти "все фото с котами" |
| **Нет транзакций** | Нельзя атомарно обновить несколько объектов |
| **Eventual consistency (иногда)** | S3 имеет "read-after-write" consistency, но не для всех операций |
| **Задержки** | 50-200 мс на запрос (не для real-time) |
| **Нет SQL / запросов** | Только PUT, GET, DELETE, LIST |

## Когда использовать Blob Store

### Идеальные сценарии

| Сценарий | Почему подходит |
| :--- | :--- |
| **Изображения, видео, аудио** | Большие файлы, нужен CDN, низкая стоимость |
| **Резервные копии (бэкапы)** | Огромные объемы, редко читаются, архивные классы |
| **Логи и архивы** | Много данных, редко нужны, можно хранить в Glacier |
| **Статические сайты** | HTML, CSS, JS, изображения — идеально |
| **Хранение артефактов (CI/CD)** | Docker образы, сборки, пакеты |
| **Научные данные** | Большие датасеты, симуляции |
| **GDPR compliance** | Легко удалить все данные пользователя (один DELETE) |

### Сомнительные сценарии

| Сценарий | Почему плохо подходит |
| :--- | :--- |
| **Мелкие файлы (< 1 КБ)** | Оверхед; лучше в базу данных |
| **Часто обновляемые файлы** | S3 не оптимизирован для частых UPDATE |
| **Данные, которые нужно часто искать** | Нет поиска; нужна база данных |
| **Real-time приложения** | Высокая задержка (50-200 мс) |

## Распространенные ошибки

### Ошибка 1: Хранение файлов в базе данных

Файл 10 МБ в `BYTEA` колонке PostgreSQL.

**Как исправить:** Храните в Blob Store, в БД — только ссылку.

### Ошибка 2: Публичные ключи без аутентификации

```javascript
// Плохо: прямой доступ без проверки
app.get('/files/:key', async (req, res) => {
    const file = await s3.getObject({ Bucket: 'my-app', Key: req.params.key });
    res.send(file.Body);
});
```

**Как исправить:** Проверяйте права доступа, используйте предподписанные URL.

### Ошибка 3: Использование LIST для миллионов объектов

```javascript
// Плохо: листинг всех объектов
const objects = await s3.listObjectsV2({ Bucket: 'my-bucket' }).promise();
```

**Как исправить:** Храните метаданные в базе данных. LIST используйте только для небольших наборов (с префиксом и лимитом).

### Ошибка 4: Неправильный класс хранения

Хранение часто используемых данных в Glacier (минуты/часы на доступ).

**Как исправить:** Standard для горячих данных, IA для редких, Glacier для архивов.

### Ошибка 5: Один контейнер на все

Все файлы в одном контейнере без организации.

**Как исправить:** Используйте разные контейнеры для разных типов данных (avatars, photos, videos, backups). Используйте префиксы для эмуляции папок.

## Резюме для системного аналитика

1. **Blob Store — это специализированное хранилище для больших бинарных объектов.** Фотографии, видео, бэкапы, логи, статические файлы. Не база данных, а "бесконечный жесткий диск с HTTP API".

2. **Amazon S3 — стандарт индустрии.** Google Cloud Storage, Azure Blob Storage, MinIO — совместимые альтернативы.

3. **Основные операции:** PUT (загрузить), GET (скачать), DELETE (удалить), HEAD (метаданные), LIST (список). Нет SQL, нет JOIN, нет транзакций.

4. **Классы хранения** позволяют оптимизировать стоимость: Standard (частый доступ), IA (редкий), Glacier (архив). Цена за ГБ падает, но растет задержка доступа.

5. **Blob Store + База данных = золотая пара.** Blob Store хранит файлы, база данных хранит метаданные (URL, user_id, размер, теги). Не храните файлы в базе данных — это дорого и медленно.

6. **Предподписанные URL (Presigned URLs)** — механизм временного доступа к приватным файлам. Приложение генерирует URL на 1 час, пользователь скачивает файл напрямую из Blob Store.

7. **CDN + Blob Store** — лучшая практика для доставки контента. CDN кеширует файлы на граничных серверах, уменьшая нагрузку на Blob Store и задержки для пользователей.