---
title: OpenAPI / Swagger
weight: 10
draft: false
description: OpenAPI (ранее Swagger) — стандарт описания REST API (язык контрактов). Swagger — инструменты для работы со спецификацией (Swagger UI, Editor, Codegen). OpenAPI-документ (YAML/JSON) описывает эндпоинты, параметры, форматы запросов/ответов, модели данных, схемы аутентификации. Позволяет генерировать документацию, клиентские SDK, серверные скелеты, mock-серверы. Аналог OpenAPI для асинхронных систем — AsyncAPI.
quiz:
  title: "Проверка знаний"
  passingScore: 3
  questions:
    - question: "Как в теме различаются OpenAPI и Swagger?"
      options:
        - "OpenAPI — это инструмент, а Swagger — спецификация"
        - "Swagger — это база данных, а OpenAPI — UI для документации"
        - "OpenAPI — это спецификация, а Swagger — набор инструментов для работы с ней"
        - "Это два полностью независимых стандарта"
      correctIndex: 2
      explanation: "В материале подчёркнуто: OpenAPI — стандарт описания REST API, Swagger — экосистема инструментов вокруг него."

    - question: "Какой раздел OpenAPI отвечает за описание эндпоинтов?"
      options:
        - "paths"
        - "security"
        - "tags"
        - "license"
      correctIndex: 0
      explanation: "Именно в paths описываются ресурсы и операции API, например GET /users или POST /orders."

    - question: "Какой подход к именованию эндпоинтов назван хорошим?"
      options:
        - "/getUsers"
        - "/user/{userId}"
        - "/users/{id}"
        - "/fetchAllUsersNow"
      correctIndex: 2
      explanation: "В теме как хороший вариант приведён ресурсный стиль: /users, /users/{id}, /users/{id}/orders."

    - question: "Какая версия OpenAPI рекомендована для новых проектов?"
      options:
        - "Только OpenAPI 2.0"
        - "OpenAPI 3.0 или 3.1"
        - "Только Swagger 1.0"
        - "Любая, различий нет"
      correctIndex: 1
      explanation: "В разделе сравнения версий прямо сказано, что для новых проектов рекомендуется использовать OpenAPI 3.0 или 3.1."
---
## Введение: Язык, на котором говорят API

Представьте, что вы архитектор, проектирующий здание. Вам нужны чертежи, схемы, спецификации. Без них строители будут делать что хотят, а результат окажется далёк от задуманного.

В мире API роль таких чертежей играет **OpenAPI Specification** (ранее известный как Swagger). Это язык описания REST API, понятный и человеку, и машине.

**OpenAPI** — это спецификация (стандарт). **Swagger** — это инструменты от компании SmartBear, которые работают с этой спецификацией. Часто эти термины используют как синонимы, но важно различать: OpenAPI — это "язык", Swagger — это "словарь и переводчик".

OpenAPI описывает: какие эндпоинты есть у API, какие параметры принимает каждый эндпоинт, какие форматы данных возвращает, какие коды ошибок возможны, как аутентифицироваться. Это единый источник правды, который объединяет команды, автоматизирует процессы и предотвращает недопонимание.

## Зачем нужна документация API

### Проблемы без документации

| Проблема | Проявление |
| :--- | :--- |
| **Разработчики не знают, как использовать API** | Частые вопросы в поддержку, неправильные запросы |
| **Фронтенд и бэкенд расходятся** | Один ждёт поле `user_name`, другой отправляет `username` |
| **Нет контракта** | Изменение API ломает клиентов |
| **Трудно тестировать** | Нет спецификации для генерации тестов |
| **Нет автогенерации клиентов** | Каждый язык нужно писать вручную |

### Что даёт OpenAPI

| Преимущество | Объяснение |
| :--- | :--- |
| **Единый источник истины** | Все команды смотрят на один документ |
| **Автоматическая документация** | Swagger UI — интерактивная документация |
| **Генерация клиентов** | SDK на 40+ языках |
| **Генерация серверов** | Скелет кода для бэкенда |
| **Валидация запросов** | Проверка соответствия спецификации |
| **Mock-серверы** | Имитация API до реализации |
| **Интеграция с инструментами** | Postman, Insomnia, CI/CD |

## История: Swagger → OpenAPI

| Год | Событие |
| :--- | :--- |
| **2010** | Компания Wordnik создаёт Swagger |
| **2015** | Swagger передан в Linux Foundation, переименован в OpenAPI |
| **2017** | OpenAPI 3.0 — мажорное обновление |
| **2021** | OpenAPI 3.1 — поддержка JSON Schema 2020-12 |

**Важное различие:**
- **Swagger** — инструменты (Swagger UI, Swagger Editor, Swagger Codegen)
- **OpenAPI** — спецификация (стандарт)

Сегодня говорят "OpenAPI спецификация", но используют "Swagger инструменты".

## Структура OpenAPI документа

```yaml
openapi: 3.0.0                      # версия спецификации
info:                               # метаинформация
  title: User API
  description: API для управления пользователями
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com
  license:
    name: MIT

servers:                            # где живёт API
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server

paths:                              # эндпоинты
  /users:
    get:
      summary: Получить список пользователей
      parameters: [...]
      responses: {...}
    post:
      summary: Создать пользователя
      requestBody: {...}
      responses: {...}
  /users/{id}:
    get:
      summary: Получить пользователя по ID
      parameters: [...]
      responses: {...}

components:                         # переиспользуемые части
  schemas: {...}                    # модели данных
  parameters: {...}                 # параметры
  responses: {...}                  # ответы
  securitySchemes: {...}            # схемы аутентификации

security:                           # глобальная аутентификация
  - bearerAuth: []

tags:                               # группировка эндпоинтов
  - name: Users
    description: Операции с пользователями
```


## Основные компоненты OpenAPI (с точки зрения аналитика)

### Info (метаинформация)

```yaml
info:
  title: User API
  description: |
    API для управления пользователями.
    
    **Возможности:**
    * Создание пользователя
    * Получение информации
    * Обновление профиля
    * Удаление пользователя
  version: 1.0.0
  termsOfService: https://example.com/terms
  contact:
    name: API Team
    url: https://example.com/support
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
```

**Что должен определить аналитик:**
- Название API (понятное, отражающее суть)
- Версия (стратегия версионирования)
- Контактная информация для поддержки
- Условия использования (если применимо)

### Servers (окружения)

```yaml
servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
  - url: https://dev-api.example.com/v1
    description: Development
  - url: http://localhost:8080/v1
    description: Local development
```

**Что должен определить аналитик:**
- Какие окружения будут доступны (production, staging, dev)
- Базовые URL для каждого окружения
- Стратегия версионирования в URL

### Paths (эндпоинты)

```yaml
paths:
  /users:
    get:
      summary: Получить список пользователей
      description: Возвращает список пользователей с пагинацией
      operationId: listUsers
      tags:
        - Users
```

**Что должен определить аналитик:**
- Какие эндпоинты нужны
- Именование (ресурсы во множественном числе, `/users`, а не `/getUsers`)
- Иерархия (вложенные ресурсы: `/users/{id}/orders`)

### Parameters (параметры запроса)

| Тип параметра | Где находится | Пример |
| :--- | :--- | :--- |
| **path** | В URL | `/users/{id}` → `id` |
| **query** | После ? | `/users?status=active` → `status` |
| **header** | В заголовке | `X-Request-ID` |
| **cookie** | В куках | `sessionId` |

```yaml
parameters:
  - name: id
    in: path
    required: true
    description: Идентификатор пользователя
    schema:
      type: integer
      example: 123
  - name: status
    in: query
    required: false
    description: Фильтр по статусу
    schema:
      type: string
      enum: [active, pending, blocked]
      default: active
  - name: X-Request-ID
    in: header
    required: false
    description: Идентификатор запроса для трассировки
    schema:
      type: string
```

**Что должен определить аналитик:**
- Какие параметры нужны для каждого эндпоинта
- Обязательность параметров
- Допустимые значения (enum)
- Значения по умолчанию
- Формат данных (тип, длина, диапазон)

### Request Body (тело запроса)

```yaml
requestBody:
  required: true
  description: Данные нового пользователя
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/UserCreate'
      examples:
        minimal:
          summary: Минимальный пользователь
          value:
            name: Иван
            email: ivan@example.com
        full:
          summary: Полные данные
          value:
            name: Иван Петров
            email: ivan@example.com
            age: 30
            phone: +7-999-123-45-67
```

### Responses (ответы)

```yaml
responses:
  '200':
    description: Успешный ответ
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  '201':
    description: Пользователь создан
    headers:
      Location:
        description: URL созданного ресурса
        schema:
          type: string
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  '400':
    description: Неверный запрос
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
  '401':
    description: Не авторизован
  '403':
    description: Нет прав
  '404':
    description: Пользователь не найден
  '422':
    description: Ошибка валидации
  '429':
    description: Слишком много запросов
  '500':
    description: Внутренняя ошибка сервера
```

**Что должен определить аналитик:**
- Какие статус-коды возможны для каждого эндпоинта
- Структура тела ответа для каждого статуса
- Заголовки ответа (Location, X-Total-Count, Retry-After)

### Schemas (модели данных)

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: integer
          example: 123
          description: Уникальный идентификатор
        name:
          type: string
          minLength: 1
          maxLength: 100
          example: Иван Петров
        email:
          type: string
          format: email
          example: ivan@example.com
        age:
          type: integer
          minimum: 0
          maximum: 150
          nullable: true
        created_at:
          type: string
          format: date-time
          example: 2024-01-15T10:30:00Z
    
    Error:
      type: object
      properties:
        code:
          type: string
          example: VALIDATION_ERROR
        message:
          type: string
          example: Invalid input data
        details:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
```

**Что должен определить аналитик:**
- Какие сущности существуют в системе
- Какие поля у каждой сущности
- Типы данных полей
- Обязательные поля (required)
- Ограничения (minLength, maxLength, minimum, maximum)
- Форматы (email, date-time, uuid)

## Схемы безопасности (Security Schemes)

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT токен, полученный при аутентификации
    
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API ключ для доступа к публичным эндпоинтам
    
    basicAuth:
      type: http
      scheme: basic
      description: Basic аутентификация
    
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/oauth/authorize
          tokenUrl: https://auth.example.com/oauth/token
          scopes:
            read:users: Чтение пользователей
            write:users: Запись пользователей

# Глобальное применение
security:
  - bearerAuth: []
  - apiKeyAuth: []

# Переопределение на уровне эндпоинта
paths:
  /health:
    get:
      security: []   # без аутентификации
```

**Что должен определить аналитик:**
- Какие способы аутентификации поддерживает API
- Какие эндпоинты требуют аутентификации
- Какие scope нужны для разных операций (OAuth2)

## Практические сценарии использования OpenAPI

### Сценарий 1: Проектирование до разработки

Аналитик пишет OpenAPI спецификацию → команды согласовывают → разработка идёт по контракту.

**Преимущества:**
- Фронтенд и бэкенд не расходятся
- Раннее обнаружение проблем
- Клиенты могут начинать интеграцию до готовности API

### Сценарий 2: Документация для внешних разработчиков

Спецификация → Swagger UI → публичная документация.

**Преимущества:**
- Интерактивная документация
- Примеры запросов
- Возможность тестировать в браузере

### Сценарий 3: Генерация клиентских SDK

Спецификация → OpenAPI Generator → SDK на Python, Java, TypeScript, Go, Ruby, PHP...

**Преимущества:**
- Клиенты получают готовый код
- Меньше ошибок интеграции
- Быстрый старт

### Сценарий 4: Валидация запросов

Спецификация → валидатор → автоматическая проверка входящих запросов.

**Преимущества:**
- Раннее обнаружение ошибок
- Единые правила валидации
- Снижение нагрузки на бизнес-логику

### Сценарий 5: Mock-серверы

Спецификация → Mock-сервер → имитация API для тестирования.

**Преимущества:**
- Фронтенд может разрабатываться без бэкенда
- Демонстрация API заказчику
- Нагрузочное тестирование

## OpenAPI в процессах аналитика

### Этап: Анализ требований

Аналитик изучает требования к API и определяет:

| Что определить | Вопросы |
| :--- | :--- |
| **Ресурсы** | Какие сущности есть в системе? (Пользователи, заказы, товары) |
| **Операции** | Какие операции нужны? (CRUD, поиск, отчёты) |
| **Связи** | Как ресурсы связаны? (Пользователь → заказы) |
| **Атрибуты** | Какие поля у каждой сущности? |
| **Ограничения** | Какие правила валидации? (длина, диапазон, обязательность) |

### Этап: Проектирование API

Аналитик создаёт черновик спецификации:

```yaml
paths:
  /users:
    get:
      summary: Список пользователей
      parameters:
        - $ref: '#/components/parameters/limit'
        - $ref: '#/components/parameters/offset'
        - name: status
          in: query
          schema:
            $ref: '#/components/schemas/UserStatus'
    post:
      summary: Создание пользователя
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
```

### Этап: Согласование

Аналитик показывает спецификацию:

- **Разработчикам** — реализуемо ли?
- **Тестировщикам** — понятны ли сценарии?
- **Бизнесу** — соответствует ли требованиям?

### Этап: Документирование

Аналитик финализирует спецификацию, добавляет:

- Описания (description) для всех элементов
- Примеры (examples)
- Примечания для разработчиков

### Этап: Поддержка

Аналитик обновляет спецификацию при изменениях API.

## OpenAPI 2.0 vs 3.0 vs 3.1

| Возможность | OpenAPI 2.0 (Swagger 2.0) | OpenAPI 3.0 | OpenAPI 3.1 |
| :--- | :--- | :--- | :--- |
| **Год** | 2015 | 2017 | 2021 |
| **Сервера** | Один URL | Несколько URL | Несколько URL |
| **Примеры** | Только в схеме | `examples`, `example` | Полная поддержка |
| **Компоненты** | `parameters`, `responses`, `definitions` | + `callbacks`, `links`, `examples`, `headers` | + `pathItems`, `webhooks` |
| **Схемы** | Swagger спецификация | Частично JSON Schema | Полная JSON Schema 2020-12 |
| **Аутентификация** | Basic, API Key, OAuth2 | + OpenID Connect | + OAuth2 PKCE |
| **Callback** | Нет | Да (вебхуки) | Да |
| **Переиспользование** | `$ref` ограничен | `$ref` везде | `$ref` с JSON Schema |

**Рекомендация:** Использовать OpenAPI 3.0 или 3.1 для новых проектов.

## Инструменты экосистемы Swagger/OpenAPI

| Инструмент | Назначение |
| :--- | :--- |
| **Swagger Editor** | Редактирование спецификации в браузере |
| **Swagger UI** | Интерактивная документация |
| **Swagger Codegen** | Генерация клиентов, серверов, документации |
| **OpenAPI Generator** | Форк Swagger Codegen с большим функционалом |
| **SwaggerHub** | Платформа для совместной работы над спецификациями |
| **Redoc** | Альтернативный UI (более красивый) |
| **Stoplight** | Платформа для дизайна API |

## Лучшие практики OpenAPI

### Именование

```yaml
# Хорошо
paths:
  /users:           # ресурс во множественном числе
  /users/{id}:      # параметр в фигурных скобках
  /users/{id}/orders  # вложенный ресурс

# Плохо
paths:
  /getUsers:        # глагол в URL
  /user/{userId}:   # непоследовательное именование
```

### Версионирование

```yaml
# Вариант 1: в URL
servers:
  - url: https://api.example.com/v1

# Вариант 2: в заголовке (не рекомендуется)
# Вариант 3: отдельная спецификация на версию
```

### Описания

```yaml
# Плохо
description: Get user

# Хорошо
description: |
  Возвращает информацию о пользователе по его идентификатору.
  
  **Требуется аутентификация:** Да
  **Права:** Пользователь может видеть только свой профиль, администратор — любые
```

### Примеры

```yaml
# Плохо (нет примеров)
schema:
  type: object
  properties:
    name:
      type: string

# Хорошо
schema:
  type: object
  properties:
    name:
      type: string
      example: Иван Петров
      description: Полное имя пользователя
```

### Ошибки

```yaml
responses:
  '400':
    description: Неверный запрос
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
        examples:
          invalid_email:
            summary: Неверный формат email
            value:
              code: INVALID_EMAIL
              message: Email должен быть в формате user@example.com
          missing_name:
            summary: Отсутствует имя
            value:
              code: MISSING_FIELD
              message: Поле 'name' обязательно
```

## OpenAPI vs другие форматы документации

| Формат | Назначение | Структура | Инструменты |
| :--- | :--- | :--- | :--- |
| **OpenAPI** | REST API | YAML/JSON | Swagger, Redoc |
| **Postman Collection** | Тестирование API | JSON | Postman |
| **API Blueprint** | REST API | Markdown | Apiary, Aglio |
| **RAML** | REST API | YAML | RAML tools |
| **AsyncAPI** | Асинхронные API (Kafka, MQTT) | YAML/JSON | AsyncAPI tools |
| **gRPC Reflection** | gRPC | .proto | grpcurl |

**Вывод:** OpenAPI — стандарт для REST API. Остальные форматы решают другие задачи.

## Частые ошибки

### Ошибка 1: Спецификация не соответствует реальности

Документ живёт отдельно от кода. Со временем расходится.

**Решение:** Генерировать спецификацию из кода (SpringDoc, django-rest-framework-spectacular) или использовать дизайн-ориентированный подход (сначала спецификация).

### Ошибка 2: Отсутствие примеров

Пользователи не понимают, как формировать запросы.

**Решение:** Добавлять `example` для каждого поля и `examples` для запросов/ответов.

### Ошибка 3: Слишком сложная спецификация

Глубокие вложенности, длинные `$ref` цепочки.

**Решение:** Баланс между переиспользованием и читаемостью.

### Ошибка 4: Неполная информация об ошибках

Описаны только успешные ответы.

**Решение:** Описывать все возможные ошибки (400, 401, 403, 404, 422, 429, 500).

### Ошибка 5: Игнорирование `deprecated`

Старые эндпоинты не помечаются как устаревшие.

**Решение:** Добавлять `deprecated: true` и указание на альтернативу.

```yaml
get:
  deprecated: true
  description: Устаревший метод. Используйте `/api/v2/users`
```

## Резюме для системного аналитика

1. **OpenAPI** — это язык описания REST API. Swagger — инструменты для работы со спецификацией. Это единый источник правды для всех участников разработки.

2. **Основные компоненты:** `info` (метаинформация), `servers` (окружения), `paths` (эндпоинты), `parameters` (параметры), `requestBody` (тело запроса), `responses` (ответы), `schemas` (модели данных), `security` (аутентификация).

3. **Что даёт OpenAPI:**
   - Единая документация для всех команд
   - Автоматическая генерация клиентов на 40+ языках
   - Автоматическая генерация серверных скелетов
   - Валидация запросов
   - Mock-серверы для тестирования
   - Интеграция с CI/CD

4. **Роль аналитика в OpenAPI:**
   - Определять ресурсы, операции, атрибуты
   - Проектировать спецификацию до разработки
   - Согласовывать контракт с командами
   - Документировать описания и примеры
   - Поддерживать актуальность спецификации

5. **OpenAPI 3.1 — текущий стандарт.** Поддерживает полную JSON Schema.

6. **Инструменты:** Swagger Editor (создание), Swagger UI (документация), OpenAPI Generator (генерация кода).