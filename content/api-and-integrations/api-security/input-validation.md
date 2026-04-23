---
title: Input validation
weight: 60
draft: false
description: "Input validation — проверка входных данных на сервере (обязательна, клиентская — только для UX). Защита от SQL-инъекций (параметризованные запросы, ORM, никогда не конкатенировать пользовательский ввод), XSS (экранирование HTML, CSP), path traversal (нормализация пути, белый список файлов), DoS (ограничение размера, длины, глубины). Типы валидации: типы (число, строка), формат (email, телефон, дата), длина (1–100 символов), диапазон (0–150), белый список (enum), зависимости полей. HTTP статусы: 400 Bad Request (общая ошибка), 422 Unprocessable Entity (синтаксис верен, бизнес-правила нет). Белый список (allowlist) безопаснее чёрного (blocklist). Ошибки: только клиентская валидация, невалидация типов, слишком строгие правила (только латиница), игнорирование Unicode. Инструменты: Pydantic (Python), Joi (JS), Zod (TS), Spring Validation (Java). Санитизация (sanitization) — изменение данных для безопасности (удаление HTML-тегов)."
quiz:
  title: "Проверка знаний"
  passingScore: 3
  questions:
    - question: "Какой главный принцип валидации входных данных подчёркивается в теме?"
      options:
        - "Всегда доверяй данным клиента"
        - "Проверяй только JSON-синтаксис"
        - "Никогда не доверяй входным данным от клиента"
        - "Проверяй только UI, сервер можно не валидировать"
      correctIndex: 2
      explanation: "Входные данные могут быть ошибочными, вредоносными или неожиданными, поэтому им нельзя доверять."

    - question: "Почему клиентская валидация не считается полноценной защитой?"
      options:
        - "Потому что браузер не умеет работать с regex"
        - "Потому что злоумышленник может обойти её и отправить запрос напрямую"
        - "Потому что она работает только на Linux"
        - "Потому что она автоматически удаляет токены"
      correctIndex: 1
      explanation: "Клиентская валидация полезна для UX, но не защищает от обхода через curl, Postman или изменённый фронт."

    - question: "Какой риск напрямую связан с отсутствием валидации входа?"
      options:
        - "SQL-инъекция"
        - "Улучшение производительности"
        - "Снижение числа ошибок"
        - "Автоматическая типизация API"
      correctIndex: 0
      explanation: "В теме прямо перечислены SQL injection, XSS, path traversal и другие последствия плохой валидации."

    - question: "Какая валидация является обязательной с точки зрения безопасности?"
      options:
        - "Только валидация в браузере"
        - "Только валидация в Swagger UI"
        - "Серверная валидация"
        - "Только проверка длины строк на клиенте"
      correctIndex: 2
      explanation: "Серверная валидация — единственный надёжный рубеж защиты."
---
## Введение: Не доверяй никому

Представьте, что вы принимаете заказы в ресторане. Клиент говорит: "Дайте мне пиццу". Вы готовите. А если клиент скажет: "Дайте мне 1000 пицц, и вместо теста — бетон, а вместо сыра — клей"? Вы не станете выполнять такой заказ, даже если клиент настаивает. Вы проверите входные данные.

В мире API то же самое. Клиент может прислать всё что угодно: слишком длинную строку, отрицательный возраст, символы, которые сломают SQL запрос, или скрипт, который украдёт данные другого пользователя.

**Input validation (валидация входных данных)** — это процесс проверки данных, которые клиент отправляет на сервер, перед их использованием. Это первый и самый важный рубеж защиты.

Никогда не доверяйте данным от клиента. Они могут быть ошибочными (пользователь опечатался), вредоносными (злоумышленник пытается взломать систему) или просто неожиданными (старый клиент присылает устаревший формат). Валидация — это то, что отделяет безопасное приложение от дырявого решета.

## Почему важна валидация

| Риск | Пример | Последствие |
| :--- | :--- | :--- |
| **SQL инъекция** | `name: "'; DROP TABLE users; --"` | Удаление таблиц |
| **XSS (Cross-Site Scripting)** | `comment: "<script>stealCookies()</script>"` | Кража сессий |
| **Path traversal** | `filename: "../../../etc/passwd"` | Чтение системных файлов |
| **Переполнение буфера** | `data: "A" * 1000000` | Отказ в обслуживании |
| **Некорректные типы** | `age: "not a number"` | Ошибка приложения |
| **Выход за границы** | `page: -1` | Неожиданное поведение |

## Два уровня валидации

### 1. Клиентская валидация (UX, не безопасность)

Проверка в браузере (JavaScript). Улучшает пользовательский опыт, но не защищает от злоумышленников.

```html
<input type="email" required>
```

**Злоумышленник может:** Отключить JavaScript, изменить HTML, отправить запрос через curl.

### 2. Серверная валидация (безопасность)

Проверка на сервере. Единственный надёжный способ защиты.

```python
# Серверная валидация (обязательна)
def create_user(name, email, age):
    if not name or len(name) > 100:
        raise ValidationError("Invalid name")
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        raise ValidationError("Invalid email")
    if age < 0 or age > 150:
        raise ValidationError("Invalid age")
    # создание пользователя
```

## Типы валидации

### 1. Валидация типов

Проверка, что данные имеют ожидаемый тип.

| Тип | Ожидание | Проверка |
| :--- | :--- | :--- |
| **Число** | `age: 30` | `isinstance(age, int)` |
| **Строка** | `name: "Иван"` | `isinstance(name, str)` |
| **Массив** | `tags: ["a", "b"]` | `isinstance(tags, list)` |
| **Объект** | `address: {...}` | `isinstance(address, dict)` |

### 2. Валидация формата

Проверка, что данные соответствуют формату.

```python
# Email
re.match(r'^[^@]+@[^@]+\.[^@]+$', email)

# Телефон (Россия)
re.match(r'^\+7\d{10}$', phone)

# Дата
re.match(r'^\d{4}-\d{2}-\d{2}$', date)

# UUID
re.match(r'^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$', uuid)
```

### 3. Валидация длины

Ограничение длины строк, массивов.

| Поле | Ожидание | Проверка |
| :--- | :--- | :--- |
| **Имя** | 1-100 символов | `1 <= len(name) <= 100` |
| **Email** | 5-255 символов | `5 <= len(email) <= 255` |
| **Пароль** | 8-128 символов | `8 <= len(password) <= 128` |
| **Теги** | 0-10 элементов | `0 <= len(tags) <= 10` |

### 4. Валидация диапазона

Ограничение числовых значений.

| Поле | Ожидание | Проверка |
| :--- | :--- | :--- |
| **Возраст** | 0-150 | `0 <= age <= 150` |
| **Цена** | ≥ 0 | `price >= 0` |
| **Страница** | ≥ 1 | `page >= 1` |
| **Процент** | 0-100 | `0 <= percent <= 100` |

### 5. Валидация по белому списку (enum)

Проверка, что значение входит в допустимый набор.

```python
ALLOWED_STATUSES = ['pending', 'active', 'blocked', 'deleted']

def validate_status(status):
    if status not in ALLOWED_STATUSES:
        raise ValidationError(f"Status must be one of {ALLOWED_STATUSES}")
```

### 6. Валидация зависимости полей

Проверка, что поля согласованы.

```python
def validate_order(shipping_address, billing_address):
    if not shipping_address and not billing_address:
        raise ValidationError("At least one address required")
    
    if shipping_address and not billing_address:
        # billing = shipping по умолчанию
        pass
```

## Обработка ошибок валидации

### HTTP статус

| Статус | Когда использовать |
| :--- | :--- |
| **400 Bad Request** | Общая ошибка валидации |
| **422 Unprocessable Entity** | Синтаксис верен, но семантика нет |

**Рекомендация:** Использовать 422 для валидации бизнес-правил.

### Формат ответа

```json
{
    "error": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
        "name": ["Name is required", "Name is too long (max 100)"],
        "age": ["Age must be between 0 and 150"],
        "email": ["Invalid email format"]
    }
}
```

## SQL инъекции

### Проблема

Конкатенация пользовательского ввода в SQL запрос.

```python
# Плохо (SQL инъекция)
user_input = request.GET['name']
query = f"SELECT * FROM users WHERE name = '{user_input}'"
# user_input = "'; DROP TABLE users; --"
# SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
```

### Решение 1: Параметризованные запросы

```python
# Хорошо
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))
```

### Решение 2: ORM

```python
# Django ORM
User.objects.filter(name=user_input)

# SQLAlchemy
session.query(User).filter(User.name == user_input)
```

### Решение 3: Экранирование (если нет выбора)

```python
import re
escaped = re.sub(r"['\"\\]", r"\\\g<0>", user_input)
```

## XSS (Cross-Site Scripting)

### Проблема

Злоумышленник вставляет JavaScript в данные, которые потом отображаются другим пользователям.

```python
# Плохо
comment = request.POST['comment']
# comment = "<script>alert('XSS')</script>"
return render(f"<div>{comment}</div>")
```

### Решение 1: Экранирование HTML

```python
import html
safe_comment = html.escape(comment)
# &lt;script&gt;alert('XSS')&lt;/script&gt;
```

### Решение 2: Шаблонизаторы с автоэкранированием

```django
<!-- Django auto-escapes by default -->
<div>{{ comment }}</div>
```

### Решение 3: CSP (Content Security Policy)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com
```

## Path Traversal

### Проблема

Злоумышленник читает файлы за пределами разрешённой директории.

```python
# Плохо
filename = request.GET['file']
# filename = "../../../etc/passwd"
with open(f"/var/www/uploads/{filename}") as f:
    return f.read()
```

### Решение 1: Нормализация пути

```python
import os

filename = request.GET['file']
base_dir = '/var/www/uploads'
safe_path = os.path.normpath(os.path.join(base_dir, filename))
if not safe_path.startswith(base_dir):
    raise ValidationError("Invalid path")
```

### Решение 2: Белый список разрешённых файлов

```python
ALLOWED_FILES = ['avatar.jpg', 'logo.png', 'config.json']
if filename not in ALLOWED_FILES:
    raise ValidationError("File not allowed")
```

## Denial of Service (DoS) защита

### Проблема

Злоумышленник отправляет огромные данные, чтобы перегрузить сервер.

```python
# Плохо
data = request.POST['data']  # может быть 100 MB
process(data)
```

### Решение 1: Ограничение размера

```nginx
# Nginx
client_max_body_size 10M;
```

```python
# Django
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
DATA_UPLOAD_MAX_NUMBER_FILES = 10
```

### Решение 2: Ограничение длины

```python
if len(name) > 100:
    raise ValidationError("Name too long")
```

### Решение 3: Ограничение глубины JSON

```python
def validate_json_depth(obj, max_depth=10, current_depth=0):
    if current_depth > max_depth:
        raise ValidationError("JSON too deep")
    if isinstance(obj, dict):
        for value in obj.values():
            validate_json_depth(value, max_depth, current_depth + 1)
    elif isinstance(obj, list):
        for item in obj:
            validate_json_depth(item, max_depth, current_depth + 1)
```

## Валидация в разных языках и фреймворках

### Python (Pydantic)

```python
from pydantic import BaseModel, Field, validator, EmailStr

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    tags: List[str] = Field(default_factory=list, max_items=10)
    
    @validator('name')
    def name_alphanumeric(cls, v):
        if not v.replace(' ', '').isalpha():
            raise ValueError('Name must contain only letters')
        return v
```

### Python (Django)

```python
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from django import forms

class UserForm(forms.Form):
    name = forms.CharField(min_length=1, max_length=100)
    email = forms.EmailField()
    age = forms.IntegerField(min_value=0, max_value=150)
```

### JavaScript (Joi)

```javascript
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(0).max(150),
    tags: Joi.array().items(Joi.string()).max(10)
});

const { error, value } = schema.validate(req.body);
if (error) {
    return res.status(400).json({ error: error.details });
}
```

### TypeScript (Zod)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().min(0).max(150).optional(),
    tags: z.array(z.string()).max(10).default([])
});

const result = UserSchema.safeParse(req.body);
if (!result.success) {
    return res.status(400).json({ error: result.error });
}
```

### Java (Spring Boot)

```java
import javax.validation.constraints.*;

public class UserCreate {
    @NotBlank @Size(min=1, max=100)
    private String name;
    
    @NotBlank @Email
    private String email;
    
    @Min(0) @Max(150)
    private int age;
    
    @Size(max=10)
    private List<@NotBlank String> tags;
}

// В контроллере
@PostMapping("/users")
public ResponseEntity<?> create(@Valid @RequestBody UserCreate user) {
    // ...
}
```

## Валидация vs Санитизация (Sanitization)

| Понятие | Что делает | Пример |
| :--- | :--- | :--- |
| **Валидация (Validation)** | Проверяет, соответствует ли данным правилам | `age` должно быть числом от 0 до 150 |
| **Санитизация (Sanitization)** | Изменяет данные, чтобы сделать их безопасными | Удаление HTML тегов из комментария |

### Пример санитизации

```python
import bleach

# Удалить опасные HTML теги
safe_comment = bleach.clean(comment, tags=['b', 'i', 'p'], strip=True)

# Привести email к нижнему регистру
email = email.lower().strip()

# Обрезать пробелы
name = name.strip()
```

## Белый список vs Чёрный список

| Подход | Что делает | Пример |
| :--- | :--- | :--- |
| **Белый список (Allowlist)** | Разрешаем только то, что в списке | `ALLOWED_TAGS = ['b', 'i', 'p']` |
| **Чёрный список (Blocklist)** | Запрещаем то, что в списке | `BLOCKED_TAGS = ['script', 'iframe']` |

**Всегда предпочитайте белый список.** Чёрный список всегда можно обойти.

```python
# Плохо (чёрный список)
BLOCKED = ['<script>', 'javascript:', 'onclick']
if any(bad in input for bad in BLOCKED):
    raise ValidationError("Invalid input")

# Хорошо (белый список)
ALLOWED = re.compile(r'^[a-zA-Z0-9\s\-_]+$')
if not ALLOWED.match(input):
    raise ValidationError("Invalid input")
```

## Валидация для разных типов API

### REST API

```python
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Валидация
    errors = validate_user(data)
    if errors:
        return {'errors': errors}, 422
    
    user = create_user_in_db(data)
    return user, 201
```

### GraphQL

```graphql
input CreateUserInput {
    name: String!
    email: String!
    age: Int
}

type Mutation {
    createUser(input: CreateUserInput!): User!
}
```

```python
# Валидация в резолвере
def resolve_create_user(self, info, input):
    if len(input.name) > 100:
        raise GraphQLError("Name too long")
    # ...
```

### gRPC

```protobuf
message CreateUserRequest {
    string name = 1 [(validate.rules).string = {min_len: 1, max_len: 100}];
    string email = 2 [(validate.rules).string = {email: true}];
    int32 age = 3 [(validate.rules).int32 = {gte: 0, lte: 150}];
}
```

## Распространённые ошибки

### Ошибка 1: Только клиентская валидация

```javascript
// Плохо (только на клиенте)
if (age < 0) alert("Age must be positive");
```

**Исправление:** Всегда проверяйте на сервере.

### Ошибка 2: Невалидация типов

```python
# Плохо
age = request.GET['age']  # строка "30"
if age < 18:  # Python сравнивает строки лексикографически "30" < "18"? нет
    # ...

# Хорошо
age = int(request.GET['age'])
```

### Ошибка 3: Слишком строгая валидация

```python
# Плохо (не учитывает международные форматы)
if not re.match(r'^[A-Za-z]+$', name):
    raise ValidationError("Name must contain only Latin letters")
```

**Исправление:** Использовать разумные ограничения.

### Ошибка 4: Игнорирование Unicode

```python
# Плохо
if not re.match(r'^[a-zA-Z]+$', name):
    # не пропустит "Иван"

# Хорошо
if not re.match(r'^[\w\s]+$', name, re.UNICODE):
```

### Ошибка 5: Раскрытие деталей реализации

```python
# Плохо (SQL инъекция)
query = f"SELECT * FROM users WHERE id = {user_id}"
# user_id = "1 OR 1=1"

# Хорошо
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

## Резюме для системного аналитика

1. **Input validation** — проверка входных данных на сервере. Никогда не доверяйте клиенту. Клиентская валидация — только для удобства пользователей.

2. **Основные риски:** SQL инъекции, XSS, path traversal, DoS, некорректные данные.

3. **Типы валидации:** типы, формат, длина, диапазон, белый список (enum), зависимости полей.

4. **Защита от SQL инъекций:** параметризованные запросы, ORM. Никогда не конкатенируйте пользовательский ввод в SQL.

5. **Защита от XSS:** экранирование HTML, CSP, шаблонизаторы с автоэкранированием.

6. **Защита от path traversal:** нормализация пути, белый список файлов.

7. **Защита от DoS:** ограничение размера, длины, глубины.

8. **Белый список безопаснее чёрного.** Разрешайте только то, что нужно. Запрещать опасные паттерны бесполезно — злоумышленники всегда найдут обход.