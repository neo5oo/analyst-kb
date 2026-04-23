---
title: Основные концепции
weight: 10
draft: false
description: "GraphQL — язык запросов для API (разработан Facebook, открыт в 2015). Клиент сам выбирает нужные поля (нет over-fetching/under-fetching), ответ в той же структуре, один эндпоинт (/graphql). Основные компоненты: типы (Object, Scalar: Int/Float/String/Boolean/ID, Enum, Input), схема (контракт), Query (чтение), Mutation (изменение), Subscription (реальное время, WebSocket). Фрагменты (переиспользование полей), переменные (отделение значений), директивы (@include, @skip). Интроспекция — API самоописывает себя (автодокументация). Резолверы — функции на сервере для каждого поля (parent, args, context, info). Отличие от REST: REST — много эндпоинтов, сервер решает что отдать; GraphQL — один эндпоинт, клиент решает. Преимущества: нет избыточности/недостаточности, один запрос вместо многих, строгая типизация. Недостатки: сложность на сервере (N+1 проблема, DataLoader), кеширование (HTTP кеш не работает, POST запросы), загрузка файлов. Типичные ошибки: игнорирование N+1, слишком глубокие запросы (лимит глубины)."
quiz:
  title: "Проверка знаний"
  passingScore: 3
  questions:
    - question: "Какой базовый принцип GraphQL является главным?"
      options:
        - "Сервер всегда решает, какие поля отдать"
        - "Клиент запрашивает ровно те поля, которые ему нужны"
        - "Каждый ресурс имеет отдельный URL"
        - "Только GET-запросы"
      correctIndex: 1
      explanation: "Это центральная идея GraphQL — клиент сам определяет форму нужных данных."
    - question: "Что обычно является одной точкой входа в GraphQL API?"
      options:
        - "Много endpoint по ресурсам"
        - "Один endpoint, часто /graphql"
        - "Отдельный endpoint на каждое поле"
        - "Только WebSocket"
      correctIndex: 1
      explanation: "GraphQL обычно использует один endpoint и язык запросов поверх него."
    - question: "Что описывает схема GraphQL?"
      options:
        - "Доступные типы, поля и точки входа Query/Mutation/Subscription"
        - "Только CSS стили"
        - "Только SQL индексы"
        - "Только список серверов"
      correctIndex: 0
      explanation: "Схема — формальный контракт между клиентом и сервером."
    - question: "Чем query отличается от mutation в GraphQL?"
      options:
        - "Query меняет данные, mutation читает"
        - "Query читает данные, mutation изменяет"
        - "Разницы нет"
        - "Mutation используется только для подписок"
      correctIndex: 1
      explanation: "Это базовое разграничение корневых типов GraphQL."
---
## Введение: Клиент заказывает музыку

Представьте, что вы зашли в ресторан. В меню десятки блюд. Вы можете заказать только то, что хотите, и ровно в том количестве, которое вам нужно. Вы не обязаны брать комплексный обед, где есть и суп, и салат, и компот. Вы говорите официанту: "Дайте мне только стейк, без гарнира". И вам приносят ровно это.

GraphQL работает по тому же принципу. Клиент сам решает, какие данные ему нужны. Не сервер решает, что отдать, как в REST, где вы получаете весь объект целиком. Клиент пишет запрос, в котором перечисляет поля, которые хочет получить, и сервер возвращает ровно эти поля.

**GraphQL** — это язык запросов для API, разработанный Facebook в 2012 году и открытый в 2015 году. Он позволяет клиенту запрашивать именно те данные, которые ему нужны, и ничего лишнего.

GraphQL — это не просто "альтернатива REST". Это принципиально другой подход к проектированию API. Вместо того чтобы создавать множество эндпоинтов (один на каждый ресурс), GraphQL предоставляет один эндпоинт (обычно `/graphql`) и мощный язык запросов, который позволяет клиенту точно описать, какие данные нужны.

## Три главных принципа GraphQL

GraphQL основан на трёх ключевых идеях:

| Принцип | Суть |
| :--- | :--- |
| **Запрашивай ровно то, что нужно** | Клиент сам выбирает поля. Ничего лишнего. |
| **Получай данные в привычной структуре** | Ответ имеет ту же структуру, что и запрос. |
| **Один эндпоинт** | Все запросы идут на один URL (обычно `/graphql`). |

## 1. Типы (Types)

В GraphQL всё строится вокруг типов. Тип описывает, какие поля есть у объекта и какого они типа.

### Object Type (Объектный тип)

Самый распространённый тип. Описывает объект и его поля.

```graphql
type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
}
```

- `ID` — уникальный идентификатор
- `String`, `Int`, `Float`, `Boolean` — скалярные типы
- `!` означает "не может быть null" (обязательное поле)
- `[Post!]!` — список объектов Post, которые не могут быть null

### Scalar Types (Скалярные типы)

Базовые типы, которые не имеют вложенных полей.

| Тип | Описание | Пример |
| :--- | :--- | :--- |
| `Int` | Целое число | `42`, `-10` |
| `Float` | Число с плавающей точкой | `3.14`, `-0.5` |
| `String` | Строка UTF-8 | `"Hello"`, `"Иван"` |
| `Boolean` | Истина или ложь | `true`, `false` |
| `ID` | Уникальный идентификатор | `"123"`, `"user-42"` |

### Custom Scalars (Пользовательские скалярные типы)

Можно создавать свои скалярные типы.

```graphql
scalar Date
scalar JSON
scalar Email

type User {
    id: ID!
    createdAt: Date!
    metadata: JSON
    email: Email!
}
```

### Enum Types (Перечисления)

Ограниченный набор значений.

```graphql
enum UserRole {
    ADMIN
    MANAGER
    USER
    GUEST
}

type User {
    id: ID!
    role: UserRole!
}
```

### Input Types (Входные типы)

Используются для передачи сложных объектов в мутациях.

```graphql
input CreateUserInput {
    name: String!
    email: String!
    age: Int
    role: UserRole
}

type Mutation {
    createUser(input: CreateUserInput!): User!
}
```

## 2. Схема (Schema)

Схема — это определение всех типов, которые доступны в API. Это контракт между клиентом и сервером.

```graphql
# Определения типов
type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
}

type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
}

# Корневые типы (точки входа)
type Query {
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    post(id: ID!): Post
}

type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: ID!, name: String): User!
    deleteUser(id: ID!): Boolean!
}

type Subscription {
    userCreated: User!
    userUpdated: User!
}
```

### Корневые типы

| Тип | Назначение |
| :--- | :--- |
| `Query` | Чтение данных (аналог GET в REST) |
| `Mutation` | Изменение данных (аналог POST, PUT, DELETE) |
| `Subscription` | Реальное время (WebSocket, события) |

## 3. Запросы (Queries)

Запросы используются для чтения данных.

### Простой запрос

```graphql
query {
    user(id: "123") {
        name
        email
    }
}
```

**Ответ:**

```json
{
    "data": {
        "user": {
            "name": "Иван Петров",
            "email": "ivan@example.com"
        }
    }
}
```

### Вложенные запросы

```graphql
query {
    user(id: "123") {
        name
        email
        posts {
            title
            createdAt
        }
    }
}
```

**Ответ:**

```json
{
    "data": {
        "user": {
            "name": "Иван Петров",
            "email": "ivan@example.com",
            "posts": [
                {"title": "Мой первый пост", "createdAt": "2024-01-15"},
                {"title": "GraphQL это круто", "createdAt": "2024-02-20"}
            ]
        }
    }
}
```

### Запрос с параметрами

```graphql
query {
    users(limit: 10, offset: 20) {
        id
        name
    }
}
```

### Псевдонимы (Aliases)

Позволяют запросить одно и то же поле с разными параметрами.

```graphql
query {
    user1: user(id: "123") {
        name
    }
    user2: user(id: "456") {
        name
    }
}
```

**Ответ:**

```json
{
    "data": {
        "user1": {"name": "Иван"},
        "user2": {"name": "Петр"}
    }
}
```

### Фрагменты (Fragments)

Позволяют переиспользовать набор полей.

```graphql
fragment UserFields on User {
    id
    name
    email
    createdAt
}

query {
    user(id: "123") {
        ...UserFields
    }
    users(limit: 10) {
        ...UserFields
    }
}
```

### Переменные (Variables)

Позволяют отделить значения от структуры запроса.

```graphql
# Запрос
query GetUser($userId: ID!) {
    user(id: $userId) {
        name
        email
    }
}
```

```json
# Переменные
{
    "userId": "123"
}
```

### Директивы (Directives)

Позволяют включать или исключать поля по условию.

| Директива | Назначение |
| :--- | :--- |
| `@include(if: Boolean)` | Включить поле, если условие истинно |
| `@skip(if: Boolean)` | Пропустить поле, если условие истинно |

```graphql
query GetUser($showEmail: Boolean!) {
    user(id: "123") {
        name
        email @include(if: $showEmail)
    }
}
```

## 4. Мутации (Mutations)

Мутации используются для изменения данных.

### Создание (Create)

```graphql
mutation {
    createUser(name: "Иван", email: "ivan@example.com") {
        id
        name
        email
        createdAt
    }
}
```

### Обновление (Update)

```graphql
mutation {
    updateUser(id: "123", name: "Иван Петров") {
        id
        name
        email
    }
}
```

### Удаление (Delete)

```graphql
mutation {
    deleteUser(id: "123")
}
```

### Мутация с переменными

```graphql
mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
        id
        name
    }
}
```

```json
{
    "input": {
        "name": "Иван",
        "email": "ivan@example.com",
        "age": 30
    }
}
```

### Множественные мутации

```graphql
mutation {
    user1: createUser(name: "Иван") {
        id
    }
    user2: createUser(name: "Петр") {
        id
    }
}
```

## 5. Подписки (Subscriptions)

Подписки позволяют получать данные в реальном времени через WebSocket.

```graphql
subscription {
    userCreated {
        id
        name
        email
    }
}
```

**Как это работает:**
1. Клиент открывает WebSocket соединение
2. Отправляет subscription запрос
3. Сервер отправляет данные каждый раз, когда происходит событие

## 6. Интроспекция (Introspection)

GraphQL API сам себя описывает. Клиент может запросить схему API через интроспекцию.

### Запрос типов

```graphql
query {
    __schema {
        types {
            name
            description
        }
    }
}
```

### Запрос конкретного типа

```graphql
query {
    __type(name: "User") {
        name
        fields {
            name
            type {
                name
            }
        }
    }
}
```

**Что даёт интроспекция:**
- Автодокументация
- Автоматическая генерация клиентского кода
- GraphQL Playground (интерактивная документация)

## 7. Resolvers (Резолверы)

На сервере каждый тип и поле имеет резолвер — функцию, которая возвращает данные.

### Пример резолвера (JavaScript)

```javascript
const resolvers = {
    Query: {
        user: (parent, args, context, info) => {
            return db.users.findById(args.id);
        },
        users: (parent, args) => {
            return db.users.findAll({ limit: args.limit, offset: args.offset });
        }
    },
    
    Mutation: {
        createUser: (parent, args) => {
            return db.users.create(args);
        }
    },
    
    User: {
        posts: (parent, args, context) => {
            // parent — это объект пользователя
            return db.posts.findByAuthorId(parent.id);
        }
    }
};
```

### Аргументы резолвера

| Аргумент | Назначение |
| :--- | :--- |
| `parent` | Результат родительского резолвера |
| `args` | Аргументы, переданные в поле |
| `context` | Контекст (аутентификация, база данных) |
| `info` | Информация о запросе |

## Пример полного API

### Схема

```graphql
type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
}

type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: DateTime!
}

type Query {
    user(id: ID!): User
    users(limit: Int = 10, offset: Int = 0): [User!]!
    post(id: ID!): Post
}

type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    updateUser(id: ID!, name: String, email: String, age: Int): User!
    deleteUser(id: ID!): Boolean!
    
    createPost(title: String!, content: String!, authorId: ID!): Post!
}

type Subscription {
    userCreated: User!
    postCreated(postId: ID): Post!
}
```

### Пример запроса

```graphql
query GetUserWithPosts($userId: ID!, $includeEmail: Boolean!) {
    user(id: $userId) {
        id
        name
        email @include(if: $includeEmail)
        posts(limit: 5) {
            title
            createdAt
        }
    }
}
```

## GraphQL vs REST: Ключевые отличия

| Аспект | REST | GraphQL |
| :--- | :--- | :--- |
| **Эндпоинты** | Много (один на ресурс) | Один (/graphql) |
| **Получение данных** | Сервер решает, что отдать | Клиент решает, что получить |
| **Избыточность** | Часто (over-fetching) | Нет (запрашиваешь только нужное) |
| **Недостаточность** | Часто (under-fetching) | Нет (можно запросить связанные данные) |
| **Количество запросов** | Может быть много | Обычно один |
| **Версионирование** | URL (v1, v2) | Не нужно (добавляем поля, не удаляем) |
| **Кеширование** | Отличное (HTTP кеш) | Сложнее |
| **Загрузка файлов** | Просто | Сложнее |
| **Сложность** | Проще | Сложнее (особенно на сервере) |

## Преимущества GraphQL

| Преимущество | Объяснение |
| :--- | :--- |
| **Нет over-fetching** | Клиент получает только нужные поля, не больше |
| **Нет under-fetching** | Можно запросить связанные данные в одном запросе |
| **Один запрос** | Вместо нескольких REST вызовов |
| **Строгая типизация** | Схема — контракт между клиентом и сервером |
| **Автодокументация** | Интроспекция даёт документацию бесплатно |
| **Эволюция API** | Добавляйте поля, не удаляйте старые — версионирование не нужно |
| **Удобство для клиентов** | Клиент сам решает, что ему нужно |

## Недостатки GraphQL

| Недостаток | Объяснение |
| :--- | :--- |
| **Сложность на сервере** | Резолверы, N+1 проблема, сложная оптимизация |
| **Кеширование** | HTTP кеш не работает (один эндпоинт, POST запросы) |
| **Загрузка файлов** | Нет встроенной поддержки (нужны расширения) |
| **Перегруженные запросы** | Клиент может запросить слишком глубокую вложенность |
| **Сложность для аналитиков** | Нужно учить GraphQL вместо привычного SQL или REST |
| **Инструменты** | Меньше, чем для REST |

## Распространённые ошибки

### Ошибка 1: Игнорирование N+1 проблемы

```javascript
// Плохо: каждый post вызывает отдельный запрос к БД
User: {
    posts: (parent) => db.posts.findByAuthorId(parent.id)
}
```

**Исправление:** DataLoader для батчинга.

### Ошибка 2: Слишком глубокие запросы

```graphql
query {
    user(id: "123") {
        friends {
            friends {
                friends {
                    friends {
                        name
                    }
                }
            }
        }
    }
}
```

**Исправление:** Лимит глубины запроса (например, 5 уровней).

### Ошибка 3: GraphQL как серебряная пуля

Использование GraphQL для простого CRUD API с тремя таблицами.

**Исправление:** Для простых API REST подходит лучше.

### Ошибка 4: Игнорирование кеширования

Каждый запрос — POST, ничего не кешируется.

**Исправление:** Использовать клиентское кеширование (Apollo Client, Relay), persisted queries, CDN.

### Ошибка 5: Слишком сложные мутации

Одна мутация делает слишком много всего.

**Исправление:** Разделять на несколько мутаций.

## Резюме для системного аналитика

1. **GraphQL — это язык запросов для API.** Клиент сам решает, какие поля ему нужны. Сервер возвращает ровно то, что попросили.

2. **Три главных принципа:** запрашивай ровно то, что нужно; ответ в той же структуре, что и запрос; один эндпоинт.

3. **Схема (Schema)** — контракт API. Описывает типы, запросы (Query), мутации (Mutation), подписки (Subscription).

4. **Запросы (Queries)** — для чтения данных. Мутации — для изменения. Подписки — для реального времени.

5. **Фрагменты (Fragments)** — переиспользование полей. Переменные — отделение значений от структуры. Директивы — условное включение полей.

6. **Интроспекция** позволяет API самоописываться. Автодокументация, автогенерация клиентов.

7. **Резолверы** — функции на сервере, которые возвращают данные для каждого поля.