---
title: AsyncAPI
weight: 30
draft: false
description: AsyncAPI — спецификация для документирования асинхронных API (события, очереди, стримы). Аналог OpenAPI для Kafka, MQTT, AMQP, WebSocket. Описывает каналы (топики), операции (publish/subscribe), сообщения (форматы, схемы), серверы (брокеры). Позволяет генерировать документацию, код клиентов и серверов, визуализировать потоки событий.
quiz:
  title: "Проверка знаний"
  passingScore: 3
  questions:
    - question: "Что в первую очередь описывает AsyncAPI?"
      options:
        - "REST-эндпоинты, HTTP-методы и статус-коды"
        - "Асинхронные взаимодействия: каналы, сообщения, publish/subscribe"
        - "Только схемы реляционных таблиц"
        - "Только UI-формы и сценарии пользователя"
      correctIndex: 1
      explanation: "AsyncAPI предназначен для документирования асинхронных API: событий, очередей, стримов, каналов и сообщений."

    - question: "Какое ключевое отличие AsyncAPI от OpenAPI подчёркнуто в теме?"
      options:
        - "AsyncAPI используется только для SOAP"
        - "OpenAPI описывает асинхронные системы, а AsyncAPI — синхронные"
        - "OpenAPI описывает запрос-ответ, а AsyncAPI — события, очереди и стримы"
        - "Разницы между ними нет"
      correctIndex: 2
      explanation: "В материале AsyncAPI показан как 'OpenAPI для событий': OpenAPI — для синхронного HTTP API, AsyncAPI — для асинхронных систем."

    - question: "Какой элемент AsyncAPI отвечает за место, куда отправляются сообщения?"
      options:
        - "schemas"
        - "channels"
        - "securitySchemes"
        - "examples"
      correctIndex: 1
      explanation: "Каналы (channels) описывают топики, очереди и другие адреса, через которые идут сообщения."

    - question: "Какая практика названа хорошей при проектировании AsyncAPI?"
      options:
        - "Называть каналы как event1, msg123, user_change"
        - "Не добавлять примеры сообщений, чтобы спецификация была компактнее"
        - "Именовать каналы иерархически, например user.created или order.paid"
        - "Описывать только каналы, но не payload и headers"
      correctIndex: 2
      explanation: "В теме отдельно подчёркнуто, что хорошие имена каналов выглядят как domain.event, например user.created."
---
## Введение: Документирование

Представьте, что вы проектируете почтовое отделение. Клиенты приходят, отправляют письма, получают уведомления. В отличие от телефонного разговора (синхронный запрос-ответ), почта работает асинхронно: вы отправили письмо, оно идёт какое-то время, потом приходит ответ. Нет прямого соединения.

В мире API большинство инструментов (OpenAPI, Postman) заточены под синхронный запрос-ответ: клиент отправил запрос, сервер ответил. Но современные системы всё чаще используют асинхронные паттерны: очереди сообщений (Kafka, RabbitMQ), брокеры событий, WebSocket, MQTT для IoT.

**AsyncAPI** — это спецификация для документирования асинхронных API. Она описывает, какие сообщения отправляются и принимаются, через какие протоколы (Kafka, MQTT, AMQP, WebSocket), какие каналы (топики, очереди) используются, какие форматы данных передаются.

AsyncAPI — это "OpenAPI для событий". Как OpenAPI описывает REST API, так AsyncAPI описывает событийно-ориентированные и потоковые системы. Это единый язык для команд, которые проектируют системы на основе очередей сообщений и событий.

## Синхронный vs Асинхронный API

| Характеристика | Синхронный (REST) | Асинхронный (события, очереди) |
| :--- | :--- | :--- |
| **Время жизни соединения** | Запрос-ответ (короткое) | Долгое (подписка) или отсутствует (отправил и забыл) |
| **Ответ** | Немедленный | Может прийти через минуту, час, день |
| **Направление** | Клиент → Сервер | Может быть любым (Pub/Sub, очередь) |
| **Протоколы** | HTTP/1.1, HTTP/2 | Kafka, MQTT, AMQP, WebSocket, NATS |
| **Связь отправителя и получателя** | Прямая | Через брокер (посредника) |
| **Пример** | GET /users/123 | Пользователь создан → событие в Kafka |

## Зачем нужна документация асинхронных API

### Проблемы без AsyncAPI

| Проблема | Проявление |
| :--- | :--- |
| **Нет контракта** | Кто отправляет события? Кто их читает? В каком формате? |
| **Трудно отлаживать** | Событие прошло через пять сервисов — кто его потерял? |
| **Сложно проектировать** | Нет единого чертежа системы |
| **Дублирование кода** | Каждый сервис заново описывает одни и те же события |
| **Разные форматы** | Один сервис отправляет JSON, другой — Avro |

### Что даёт AsyncAPI

| Преимущество | Объяснение |
| :--- | :--- |
| **Единый контракт** | Все сервисы договариваются о форматах, каналах, протоколах |
| **Автоматическая документация** | Визуализация потоков событий |
| **Генерация кода** | Клиенты и серверы на 10+ языках |
| **Валидация сообщений** | Проверка соответствия схеме |
| **Визуализация архитектуры** | Понятно, кто что отправляет и получает |

## Основные концепции AsyncAPI

### Канал (Channel)

Канал — это место, куда отправляются сообщения. В разных протоколах это называется по-разному:

| Протокол | Название | Пример |
| :--- | :--- | :--- |
| **Kafka** | Topic | `user.created`, `order.paid` |
| **MQTT** | Topic | `sensors/temperature` |
| **AMQP (RabbitMQ)** | Exchange + Routing key | `orders.*` |
| **WebSocket** | URL + событие | `ws://.../chat` |

### Сообщение (Message)

Сообщение — это данные, которые передаются. AsyncAPI описывает:

- Формат (JSON, Avro, Protobuf, XML)
- Схема (какие поля, какие типы)
- Заголовки (метаданные, например, `correlationId`)

### Операции (Operations)

| Операция | Что значит | Кто |
| :--- | :--- | :--- |
| **subscribe** | Подписка на канал | Клиент получает сообщения |
| **publish** | Публикация в канал | Клиент отправляет сообщения |

## Структура AsyncAPI документа

```yaml
asyncapi: 3.0.0                    # версия спецификации
id: https://example.com/user-events
info:
  title: User Events API
  version: 1.0.0
  description: События жизненного цикла пользователя

servers:                           # брокеры сообщений
  production:
    host: kafka.prod.example.com:9092
    protocol: kafka
    description: Production Kafka
  staging:
    host: kafka.staging.example.com:9092
    protocol: kafka

channels:                          # каналы (топики)
  user.created:
    description: Пользователь создан
    subscribe:                     # кто-то может подписаться
      summary: Получение событий о создании пользователей
      message:
        $ref: '#/components/messages/UserCreated'
    publish:                       # кто-то может публиковать
      summary: Отправка событий о создании пользователей
      message:
        $ref: '#/components/messages/UserCreated'

  user.updated:
    description: Пользователь обновлён
    publish:
      message:
        $ref: '#/components/messages/UserUpdated'

components:
  messages:
    UserCreated:
      summary: Событие создания пользователя
      contentType: application/json
      payload:
        type: object
        required:
          - id
          - email
          - createdAt
        properties:
          id:
            type: integer
            description: Идентификатор пользователя
          email:
            type: string
            format: email
          name:
            type: string
          createdAt:
            type: string
            format: date-time
      headers:
        type: object
        properties:
          messageId:
            type: string
            description: Уникальный ID сообщения
          correlationId:
            type: string
            description: ID для трассировки

    UserUpdated:
      summary: Событие обновления пользователя
      contentType: application/json
      payload:
        type: object
        properties:
          id:
            type: integer
          changes:
            type: object
            additionalProperties: true
          updatedAt:
            type: string
            format: date-time
```

## Компоненты AsyncAPI (подробно)

### Info (метаинформация)

```yaml
info:
  title: Order Events API
  version: 2.1.0
  description: |
    События, связанные с заказами в интернет-магазине.
    
    **События:**
    - `order.created` — заказ создан
    - `order.paid` — заказ оплачен
    - `order.shipped` — заказ отправлен
    - `order.delivered` — заказ доставлен
  contact:
    name: API Team
    email: api@example.com
  license:
    name: MIT
```

### Servers (брокеры сообщений)

```yaml
servers:
  production:
    host: kafka.prod.example.com:9092
    protocol: kafka
    description: Production Kafka кластер
    security:
      - sasl: []
  staging:
    host: kafka.staging.example.com:9092
    protocol: kafka
    description: Staging Kafka кластер
  development:
    host: localhost:9092
    protocol: kafka
    description: Local Kafka для разработки

  rabbitmq:
    host: rabbitmq.example.com:5672
    protocol: amqp
    description: RabbitMQ для задач

  mqtt:
    host: mqtt.example.com:1883
    protocol: mqtt
    description: MQTT для IoT устройств
```

### Channels (каналы)

```yaml
channels:
  order.created:
    address: orders.created
    description: Событие создания нового заказа
    messages:
      created:
        $ref: '#/components/messages/OrderCreated'

  order.{status}:
    address: orders.{status}
    description: События изменения статуса заказа
    parameters:
      status:
        description: Статус заказа
        schema:
          type: string
          enum: [paid, shipped, delivered, cancelled]
    messages:
      statusChanged:
        $ref: '#/components/messages/OrderStatusChanged'
```

### Operations (операции)

```yaml
channels:
  user.created:
    description: Канал событий создания пользователей
    
    publish:                    # Сервис может отправлять
      operationId: publishUserCreated
      summary: Отправить событие о создании пользователя
      message:
        $ref: '#/components/messages/UserCreated'
    
    subscribe:                  # Сервис может получать
      operationId: subscribeUserCreated
      summary: Получить событие о создании пользователя
      message:
        $ref: '#/components/messages/UserCreated'
```

### Messages (сообщения)

```yaml
components:
  messages:
    OrderCreated:
      summary: Заказ создан
      contentType: application/json
      headers:
        type: object
        properties:
          messageId:
            type: string
            format: uuid
            description: Уникальный ID сообщения
          correlationId:
            type: string
            description: ID для трассировки
          timestamp:
            type: string
            format: date-time
            description: Время отправки
      payload:
        type: object
        required:
          - orderId
          - customerId
          - totalAmount
          - items
        properties:
          orderId:
            type: integer
            description: ID заказа
          customerId:
            type: integer
            description: ID клиента
          totalAmount:
            type: number
            format: decimal
            description: Общая сумма
          items:
            type: array
            items:
              type: object
              properties:
                productId:
                  type: integer
                quantity:
                  type: integer
                price:
                  type: number
          createdAt:
            type: string
            format: date-time
      examples:
        - name: typical
          summary: Типичный заказ
          headers:
            messageId: 123e4567-e89b-12d3-a456-426614174000
            correlationId: req-789
            timestamp: 2024-01-15T10:30:00Z
          payload:
            orderId: 1001
            customerId: 456
            totalAmount: 5000.00
            items:
              - productId: 123
                quantity: 1
                price: 5000.00
            createdAt: 2024-01-15T10:30:00Z
```

### Schemas (схемы данных)

```yaml
components:
  schemas:
    Money:
      type: object
      properties:
        amount:
          type: number
          minimum: 0
        currency:
          type: string
          pattern: '^[A-Z]{3}$'
          example: RUB
    
    Address:
      type: object
      properties:
        city:
          type: string
        street:
          type: string
        zip:
          type: string
    
    Customer:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
        address:
          $ref: '#/components/schemas/Address'
```

### Security (безопасность)

```yaml
components:
  securitySchemes:
    sasl:
      type: scramSha256
      description: SASL SCRAM-SHA-256 аутентификация
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/token
          scopes:
            read:events: Чтение событий
            write:events: Отправка событий

servers:
  production:
    host: kafka.prod.example.com:9092
    protocol: kafka
    security:
      - sasl: []
```

## Протоколы и их особенности в AsyncAPI

### Kafka

```yaml
servers:
  kafka-prod:
    host: kafka-cluster.prod.example.com:9092
    protocol: kafka
    protocolVersion: 3.0

channels:
  user.events:
    address: users
    description: Топик для событий пользователей
    bindings:
      kafka:
        topic: user-events
        partitions: 6
        replicas: 3
```

**Особенности Kafka:**
- Топики могут иметь несколько партиций
- Сообщения могут иметь ключи (key)
- Порядок сообщений гарантирован внутри партиции

### MQTT

```yaml
servers:
  mqtt-prod:
    host: mqtt.example.com:1883
    protocol: mqtt
    protocolVersion: 5

channels:
  sensors:
    address: sensors/{deviceId}/temperature
    description: Поток температурных данных
    parameters:
      deviceId:
        description: ID устройства
        schema:
          type: string
```

**Особенности MQTT:**
- Уровни QoS (0, 1, 2)
- Last Will and Testament (LWT)
- Retained messages

### AMQP (RabbitMQ)

```yaml
servers:
  rabbit-prod:
    host: rabbitmq.example.com:5672
    protocol: amqp
    protocolVersion: 0-9-1

channels:
  orders:
    address: orders.exchange
    description: Exchange для заказов
    bindings:
      amqp:
        exchange: orders
        type: topic
        durable: true
```

**Особенности AMQP:**
- Exchange и Queue
- Routing keys
- Bindings

### WebSocket

```yaml
servers:
  ws-prod:
    host: ws.example.com
    protocol: ws
    protocolVersion: 13

channels:
  chat:
    address: /chat
    description: Чат в реальном времени
```

## Практические сценарии использования

### Сценарий 1: Событийная архитектура микросервисов

**Ситуация:** В системе 20 микросервисов, которые общаются через Kafka. Кто какие события публикует? Кто на какие подписан?

**Действия:**
1. Создать AsyncAPI спецификацию для всех событий
2. Описать каждый топик (канал)
3. Указать, какой сервис публикует (publish), какой подписан (subscribe)
4. Визуализировать потоки событий

**Результат:** Единая карта коммуникаций между сервисами.

### Сценарий 2: IoT платформа

**Ситуация:** Тысячи устройств отправляют телеметрию через MQTT. Нужно стандартизировать форматы сообщений.

**Действия:**
1. Описать каналы для каждого типа устройств
2. Определить схемы сообщений (температура, влажность, GPS)
3. Добавить примеры для разных сценариев

**Результат:** Разработчики прошивок и бэкенда работают по единому контракту.

### Сценарий 3: Аудит и трассировка

**Ситуация:** Нужно понять, почему событие не дошло до получателя.

**Действия:**
1. Описать обязательные заголовки (`correlationId`, `messageId`, `timestamp`)
2. Задокументировать, какие сервисы должны логировать входящие/исходящие события
3. Использовать спецификацию для генерации кода трассировки

**Результат:** Возможность отследить путь события через всю систему.

## AsyncAPI vs OpenAPI

| Характеристика | OpenAPI | AsyncAPI |
| :--- | :--- | :--- |
| **Тип взаимодействия** | Синхронное (запрос-ответ) | Асинхронное (события, очереди) |
| **Протоколы** | HTTP | Kafka, MQTT, AMQP, WebSocket, NATS |
| **Направление** | Клиент → Сервер | Pub/Sub, очередь, стрим |
| **Ответ** | Немедленный | Может прийти позже или не прийти |
| **Состояние** | Stateless (обычно) | Может быть stateful (позиция в топике) |
| **Документация** | Эндпоинты | Каналы (топики, очереди) |
| **Примеры** | GET /users, POST /orders | user.created, order.paid |

### Когда использовать OpenAPI

- REST API
- Запрос-ответ
- Внешние API для партнёров

### Когда использовать AsyncAPI

- Событийно-ориентированные системы
- Микросервисы с брокером сообщений
- IoT (MQTT)
- Стриминг данных (Kafka)
- Real-time обновления (WebSocket)

## Инструменты экосистемы AsyncAPI

| Инструмент | Назначение |
| :--- | :--- |
| **AsyncAPI Studio** | Редактор спецификации в браузере |
| **AsyncAPI Generator** | Генерация кода, документации, диаграмм |
| **Modelina** | Генерация моделей данных (TypeScript, Java, Python) |
| **Parser** | Валидация и парсинг спецификаций |
| **React** | Компоненты для встраивания документации |
| **Spectral** | Линтер для AsyncAPI |

### Генерация кода

```bash
# Генерация документации (HTML)
asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template -o docs

# Генерация клиента для Kafka на Java
asyncapi generate fromTemplate asyncapi.yaml @asyncapi/java-spring-template -o client

# Генерация моделей TypeScript
asyncapi generate fromTemplate asyncapi.yaml @asyncapi/modelina-template -o models
```

## Лучшие практики

### Именование каналов

```yaml
# Хорошо (иерархия, понятно)
channels:
  user.created:
  user.updated:
  user.deleted:
  order.paid:
  order.shipped:

# Плохо
channels:
  event1:
  user_change:
  msg123:
```

### Версионирование событий

```yaml
# Вариант 1: в имени канала
channels:
  user.v1.created:
  user.v2.created:

# Вариант 2: в схеме сообщения
components:
  messages:
    UserCreated:
      payload:
        type: object
        properties:
          version:
            type: string
            const: "1.0"
```

### Обязательные заголовки

```yaml
components:
  messages:
    AnyMessage:
      headers:
        required:
          - messageId
          - timestamp
        properties:
          messageId:
            type: string
            format: uuid
          correlationId:
            type: string
          timestamp:
            type: string
            format: date-time
```

### Документирование ошибок

```yaml
channels:
  order.created:
    subscribe:
      message:
        oneOf:
          - $ref: '#/components/messages/OrderCreated'
          - $ref: '#/components/messages/OrderCreationFailed'

components:
  messages:
    OrderCreationFailed:
      summary: Ошибка создания заказа
      payload:
        type: object
        properties:
          errorCode:
            type: string
          errorMessage:
            type: string
          originalOrderId:
            type: string
```

## Частые ошибки

### Ошибка 1: Путать publish и subscribe

- **publish** — сервис отправляет сообщения
- **subscribe** — сервис получает сообщения

**Решение:** Чётко определять, кто публикует, кто подписан.

### Ошибка 2: Отсутствие схемы сообщений

Описаны каналы, но не описаны форматы сообщений.

**Решение:** Всегда описывать `payload` и `headers`.

### Ошибка 3: Игнорирование версионирования

События меняются, старые подписчики ломаются.

**Решение:** Версионировать события (в имени канала или в схеме).

### Ошибка 4: Слишком много деталей

Спецификация на 5000 строк, которую никто не читает.

**Решение:** Разбивать на несколько спецификаций (по доменам). Использовать `$ref` для переиспользования.

### Ошибка 5: Нет примеров

Только схемы, без примеров.

**Решение:** Добавлять `examples` для каждого сообщения.

## Резюме

1. **AsyncAPI** — спецификация для документирования асинхронных API (события, очереди, стримы). Это "OpenAPI для Kafka, MQTT, RabbitMQ, WebSocket".

2. **Основные компоненты:** `info` (метаинформация), `servers` (брокеры), `channels` (топики, очереди), `operations` (publish/subscribe), `messages` (сообщения), `schemas` (модели данных).

3. **Ключевое отличие от OpenAPI:** OpenAPI описывает синхронные запросы-ответы (HTTP). AsyncAPI описывает асинхронные события (Kafka, MQTT, AMQP, WebSocket).

4. **Когда нужен AsyncAPI:** Событийно-ориентированная архитектура, микросервисы с брокером сообщений, IoT (MQTT), стриминг данных (Kafka), real-time обновления (WebSocket).

5. **Что даёт AsyncAPI:**
   - Единый контракт для всех сервисов
   - Визуализация потоков событий
   - Генерация кода (клиенты, серверы, модели)
   - Валидация сообщений
   - Документация для команд

6. **Инструменты:** AsyncAPI Studio (редактор), AsyncAPI Generator (генерация кода), Modelina (генерация моделей).

7. **Лучшие практики:** Именовать каналы как `domain.event`, версионировать события, добавлять примеры, описывать ошибки.