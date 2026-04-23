---
title: DDL (Data Definition Language)
weight: 20
draft: false
description: "DDL — язык определения структуры данных в реляционных БД. Команды: CREATE (создание объектов: TABLE, SCHEMA, INDEX, VIEW, DATABASE, SEQUENCE), ALTER (изменение структуры: ADD/DROP COLUMN, ALTER COLUMN, ADD/DROP CONSTRAINT, RENAME), DROP (удаление объектов: TABLE, INDEX, VIEW, SCHEMA, DATABASE), TRUNCATE (быстрая очистка всех строк, сброс автоинкремента), RENAME (переименование)."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что относится к DDL?
    options:
    - SELECT, INSERT, UPDATE
    - GRANT, REVOKE
    - CREATE, ALTER, DROP, TRUNCATE
    - COMMIT, ROLLBACK
    correctIndex: 2
    explanation: DDL управляет структурой объектов БД.
  - question: Для чего нужен DDL?
    options:
    - Для выполнения бизнес-процессов в BPMN
    - Для создания и изменения схемы базы данных
    - Для публикации сообщений в Kafka
    - Для только чтения пользовательских данных
    correctIndex: 1
    explanation: DDL задаёт таблицы, индексы, представления и другие объекты.
  - question: Что делает ALTER TABLE?
    options:
    - Удаляет все строки с условием
    - Выдаёт права пользователю
    - Фиксирует транзакцию
    - Изменяет структуру существующей таблицы
    correctIndex: 3
    explanation: Через ALTER добавляют колонки, меняют типы и ограничения.
  - question: Почему DDL требует осторожности?
    options:
    - Потому что меняет схему и может повлиять на данные, код и совместимость
    - Потому что DDL всегда работает только локально
    - Потому что DDL нельзя версионировать
    - Потому что DDL не касается продакшена
    correctIndex: 0
    explanation: Схемные изменения — одна из самых чувствительных частей разработки.
---
## Введение: Архитектор базы данных

Представьте, что вы строите дом. Прежде чем заселяться, нужно заложить фундамент, возвести стены, проложить проводку, установить двери и окна. Только после этого можно заносить мебель и жить.

В мире баз данных то же самое. Прежде чем добавлять данные, нужно создать структуру для их хранения: таблицы, индексы, схемы, ограничения. Эту структуру создает **DDL (Data Definition Language)** — язык определения данных.

**DDL** — это набор команд, которые создают, изменяют и удаляют структуры базы данных. Они не работают с самими данными, а работают с "контейнерами" для данных.

| Команда | Назначение | Аналогия в строительстве |
| :--- | :--- | :--- |
| `CREATE` | Создать объект (таблицу, индекс, схему) | Заложить фундамент, возвести стены |
| `ALTER` | Изменить структуру объекта | Пристроить балкон, прорубить окно |
| `DROP` | Удалить объект | Снести дом |
| `TRUNCATE` | Очистить таблицу (удалить все строки) | Вынести всю мебель, но стены оставить |
| `RENAME` | Переименовать объект | Повесить новую табличку на дверь |

Важное отличие от DML (INSERT, UPDATE, DELETE): DDL изменяет структуру, DML изменяет данные. DDL обычно требует более высоких привилегий и часто не может быть откатан (не все DDL операции транзакционны).

## CREATE: Создание структуры

### CREATE TABLE

Самая важная DDL команда. Создает таблицу — контейнер для данных.

```sql
-- Простейшая таблица
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT
);

-- Таблица с типами данных и ограничениями
CREATE TABLE products (
    id SERIAL PRIMARY KEY,           -- автоинкремент, первичный ключ
    name VARCHAR(255) NOT NULL,      -- не может быть пустым
    price DECIMAL(10,2) CHECK (price >= 0),  -- проверочное ограничение
    category_id INTEGER REFERENCES categories(id),  -- внешний ключ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

**Типы данных (основные):**

| Тип | Описание | Пример |
| :--- | :--- | :--- |
| `INTEGER`, `INT` | Целое число | 42, -100 |
| `BIGINT` | Большое целое (8 байт) | 9999999999 |
| `DECIMAL(p,s)`, `NUMERIC` | Точное десятичное число | 1234.56 |
| `REAL`, `FLOAT` | Приблизительное число с плавающей точкой | 3.14159 |
| `VARCHAR(n)` | Строка переменной длины (макс n) | "Иван" |
| `TEXT` | Строка неограниченной длины | длинный текст... |
| `DATE` | Дата (без времени) | '2024-01-15' |
| `TIMESTAMP` | Дата и время | '2024-01-15 14:30:00' |
| `BOOLEAN` | Логическое значение | TRUE, FALSE |
| `JSON`, `JSONB` | JSON данные (PostgreSQL) | `{"name": "Иван"}` |
| `UUID` | Универсальный уникальный идентификатор | '123e4567-e89b-12d3-a456-426614174000' |

### CREATE SCHEMA

Схема (schema) — это пространство имен для таблиц. Позволяет группировать таблицы по логическим модулям.

```sql
-- Создание схемы
CREATE SCHEMA sales;
CREATE SCHEMA hr;
CREATE SCHEMA analytics;

-- Создание таблицы в схеме
CREATE TABLE sales.orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    amount DECIMAL(10,2)
);

-- Переключение на схему (PostgreSQL)
SET search_path TO sales, public;

-- Создание схемы с владельцем
CREATE SCHEMA private AUTHORIZATION admin_role;
```

### CREATE INDEX

Индекс ускоряет поиск данных. Будет подробно в других темах.

```sql
-- Обычный индекс (B-Tree)
CREATE INDEX idx_users_email ON users(email);

-- Уникальный индекс
CREATE UNIQUE INDEX idx_users_phone ON users(phone);

-- Составной индекс
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at);

-- Частичный индекс (только для активных пользователей)
CREATE INDEX idx_users_active_email ON users(email) WHERE is_active = TRUE;
```

### CREATE VIEW

Представление (view) — виртуальная таблица, основанная на запросе.

```sql
-- Создание представления
CREATE VIEW active_users AS
SELECT id, name, email FROM users WHERE is_active = TRUE;

-- Использование как таблицы
SELECT * FROM active_users WHERE email LIKE '%@company.com';

-- Материализованное представление (хранит данные)
CREATE MATERIALIZED VIEW daily_sales AS
SELECT DATE(created_at) as sale_date, SUM(amount) as total
FROM orders
GROUP BY DATE(created_at);
```

### CREATE DATABASE

```sql
-- PostgreSQL
CREATE DATABASE myapp;

-- С кодировкой и владельцем
CREATE DATABASE myapp 
    ENCODING 'UTF8' 
    OWNER app_user;

-- MySQL
CREATE DATABASE myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### CREATE SEQUENCE

Последовательность — генератор уникальных чисел.

```sql
-- Создание последовательности
CREATE SEQUENCE order_number_seq START 1000 INCREMENT 1;

-- Использование
SELECT nextval('order_number_seq');  -- 1000
SELECT nextval('order_number_seq');  -- 1001
SELECT currval('order_number_seq');  -- 1001

-- Привязка к столбцу
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq');
```

## ALTER: Изменение структуры

### ALTER TABLE (добавление колонок)

```sql
-- Добавление колонки
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Добавление с значением по умолчанию
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Добавление с NOT NULL (сначала добавить, потом заполнить, потом добавить NOT NULL)
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
UPDATE users SET middle_name = '' WHERE middle_name IS NULL;
ALTER TABLE users ALTER COLUMN middle_name SET NOT NULL;
```

### ALTER TABLE (изменение колонок)

```sql
-- Изменение типа данных
ALTER TABLE users ALTER COLUMN age TYPE SMALLINT;

-- Изменение имени колонки (PostgreSQL)
ALTER TABLE users RENAME COLUMN phone TO contact_phone;

-- Установка значения по умолчанию
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';

-- Удаление значения по умолчанию
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;

-- Добавление NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Удаление NOT NULL
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
```

### ALTER TABLE (ограничения)

```sql
-- Добавление первичного ключа
ALTER TABLE users ADD PRIMARY KEY (id);

-- Добавление внешнего ключа
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer 
    FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Добавление уникальности
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Добавление проверочного ограничения
ALTER TABLE products ADD CONSTRAINT chk_products_price 
    CHECK (price >= 0);

-- Удаление ограничения
ALTER TABLE users DROP CONSTRAINT uk_users_email;
```

### ALTER TABLE (удаление колонок)

```sql
-- Удаление колонки (осторожно!)
ALTER TABLE users DROP COLUMN middle_name;

-- Удаление с проверкой зависимости (CASCADE)
ALTER TABLE users DROP COLUMN department_id CASCADE;
```

### ALTER SCHEMA / ALTER INDEX

```sql
-- Переименование схемы
ALTER SCHEMA sales RENAME TO ecommerce;

-- Переименование индекса
ALTER INDEX idx_users_email RENAME TO idx_users_email_lower;

-- Изменение владельца
ALTER TABLE users OWNER TO new_admin;
```

## DROP: Удаление структуры

### DROP TABLE

```sql
-- Удаление таблицы (безвозвратно!)
DROP TABLE users;

-- Удаление с проверкой существования (без ошибки, если нет)
DROP TABLE IF EXISTS users;

-- Каскадное удаление (удаляет зависимые объекты)
DROP TABLE departments CASCADE;
```

**Важно:** DROP TABLE удаляет и данные, и структуру. Операция часто не может быть откатана (не транзакционна в некоторых СУБД).

### DROP INDEX

```sql
-- Удаление индекса
DROP INDEX idx_users_email;

-- Без ошибки, если нет
DROP INDEX IF EXISTS idx_users_phone;
```

### DROP VIEW

```sql
-- Удаление представления
DROP VIEW active_users;

-- Каскадное удаление (удаляет представления, зависящие от этого)
DROP VIEW active_users CASCADE;
```

### DROP SCHEMA

```sql
-- Удаление пустой схемы
DROP SCHEMA old_schema;

-- Удаление схемы со всем содержимым
DROP SCHEMA old_schema CASCADE;
```

### DROP DATABASE

```sql
-- Удаление базы данных (PostgreSQL)
DROP DATABASE myapp;

-- MySQL
DROP DATABASE myapp;
```

## TRUNCATE: Быстрая очистка

`TRUNCATE` удаляет все строки из таблицы, но сохраняет структуру. Это намного быстрее, чем `DELETE FROM table`, потому что не логирует каждую строку.

```sql
-- Очистка таблицы (быстро, не логирует строки)
TRUNCATE TABLE logs;

-- Очистка с переиспользованием места
TRUNCATE TABLE temp_data;

-- Каскадная очистка (очищает связанные таблицы)
TRUNCATE TABLE departments CASCADE;

-- Перезапуск последовательностей (сброс автоинкремента)
TRUNCATE TABLE users RESTART IDENTITY;
```

**TRUNCATE vs DELETE:**

| Характеристика | TRUNCATE | DELETE |
| :--- | :--- | :--- |
| **Скорость** | Очень быстрая | Медленная (построчная) |
| **Логирование** | Минимальное | Каждая строка |
| **Триггеры** | Не срабатывают | Срабатывают |
| **Условие WHERE** | Не поддерживается | Поддерживается |
| **Сброс автоинкремента** | Да (обычно) | Нет |
| **Откат (ROLLBACK)** | Да (в транзакции) | Да |
| **Блокировка** | Высокий уровень | Низкий уровень |

## RENAME: Переименование

```sql
-- Переименование таблицы
ALTER TABLE users RENAME TO app_users;

-- Переименование колонки
ALTER TABLE users RENAME COLUMN phone TO mobile;

-- Переименование индекса
ALTER INDEX idx_users_email RENAME TO idx_app_users_email;
```

## Ограничения (Constraints)

Ограничения — это правила целостности данных. Они обеспечивают, чтобы "плохие" данные не попали в таблицу.

### PRIMARY KEY

Уникальный идентификатор строки. Комбинация UNIQUE + NOT NULL.

```sql
-- Одноколоночный
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT
);

-- Составной (несколько колонок)
CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);
```

### FOREIGN KEY

Ссылка на первичный ключ другой таблицы. Обеспечивает ссылочную целостность.

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount DECIMAL(10,2)
);

-- С каскадным удалением
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2)
);

-- ON DELETE варианты
-- NO ACTION (по умолчанию) — запретить удаление
-- CASCADE — удалить связанные записи
-- SET NULL — установить NULL
-- SET DEFAULT — установить значение по умолчанию
-- RESTRICT — запретить удаление (немного отличается от NO ACTION)
```

### UNIQUE

Запрещает дублирование значений в колонке (или комбинации колонок).

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20)
);

-- Составной UNIQUE
CREATE TABLE user_roles (
    user_id INTEGER,
    role_id INTEGER,
    UNIQUE (user_id, role_id)
);
```

### CHECK

Проверочное ограничение. Значение должно удовлетворять условию.

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price DECIMAL(10,2) CHECK (price >= 0),
    age_restriction INTEGER CHECK (age_restriction IN (0, 6, 12, 16, 18)),
    discount DECIMAL(5,2) CHECK (discount BETWEEN 0 AND 100)
);

-- CHECK с несколькими колонками
CREATE TABLE events (
    start_date DATE,
    end_date DATE,
    CHECK (end_date > start_date)
);
```

### NOT NULL

Запрещает пустые значения.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL
);
```

### DEFAULT

Значение по умолчанию, если не указано.

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    is_deleted BOOLEAN DEFAULT FALSE
);
```

## Типы данных в деталях

### Числовые типы

| Тип | Размер | Диапазон | Когда использовать |
| :--- | :--- | :--- | :--- |
| `SMALLINT` | 2 байта | -32768 до 32767 | Маленькие числа (возраст, количество) |
| `INTEGER` | 4 байта | -2.1 млрд до 2.1 млрд | Стандартный выбор для ID |
| `BIGINT` | 8 байтов | -9.2 квинтиллионов до 9.2 квинтиллионов | Большие таблицы, счетчики |
| `DECIMAL(10,2)` | Переменный | До 131072 цифр | Деньги, точные расчеты |
| `REAL` | 4 байта | ~6-7 цифр точности | Научные расчеты, геоданные |
| `DOUBLE` | 8 байтов | ~15-16 цифр точности | Более точные научные расчеты |

### Строковые типы

| Тип | Описание | Когда использовать |
| :--- | :--- | :--- |
| `CHAR(n)` | Фиксированная длина (дополняется пробелами) | Коды, фиксированные форматы (ISO коды стран) |
| `VARCHAR(n)` | Переменная длина с максимумом | Имена, адреса, email (99% случаев) |
| `TEXT` | Неограниченная длина | Длинные тексты, описания, статьи |

### Дата и время

| Тип | Описание | Пример |
| :--- | :--- | :--- |
| `DATE` | Только дата | '2024-01-15' |
| `TIME` | Только время | '14:30:00' |
| `TIMESTAMP` | Дата и время | '2024-01-15 14:30:00' |
| `TIMESTAMPTZ` | Дата и время с часовым поясом | '2024-01-15 14:30:00+03' |
| `INTERVAL` | Промежуток времени | '3 days', '2 hours' |

### Специальные типы

```sql
-- JSON/JSONB (PostgreSQL)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    payload JSONB
);
INSERT INTO events (payload) VALUES ('{"user_id": 123, "action": "login"}');

-- UUID
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

-- Массивы (PostgreSQL)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    tags TEXT[]
);
INSERT INTO products (tags) VALUES (ARRAY['electronics', 'sale']);

-- Перечисления (ENUM)
CREATE TYPE user_status AS ENUM ('active', 'pending', 'blocked');
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    status user_status
);
```

## Временные таблицы

Временные таблицы существуют только в течение сессии или транзакции.

```sql
-- Временная таблица (удаляется при закрытии сессии)
CREATE TEMP TABLE temp_orders AS
SELECT * FROM orders WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- Временная таблица с явной структурой
CREATE TEMP TABLE temp_calc (
    id INTEGER,
    value DECIMAL(10,2)
);

-- Локальная временная таблица (только для текущей сессии)
CREATE LOCAL TEMPORARY TABLE local_data (id INT) ON COMMIT DROP;
```

## Схемы и пространства имен

```sql
-- Создание схемы
CREATE SCHEMA app;
CREATE SCHEMA app_private;
CREATE SCHEMA audit;

-- Создание таблицы в схеме
CREATE TABLE app.users (id INT, name TEXT);

-- Поиск таблицы в схеме (search_path)
SHOW search_path;  -- "$user", public
SET search_path TO app, public;

-- Удаление схемы
DROP SCHEMA app CASCADE;
```

## DDL и транзакции

Важное отличие: в разных СУБД DDL по-разному работает с транзакциями.

### PostgreSQL (транзакционный DDL)

В PostgreSQL почти все DDL операции транзакционны. Можно сделать ROLLBACK после CREATE TABLE.

```sql
BEGIN;
CREATE TABLE test (id INT);
INSERT INTO test VALUES (1);
ROLLBACK;  -- Таблица test исчезнет
```

### MySQL (ограниченно транзакционный)

В MySQL с InnoDB некоторые DDL транзакционны, но не все.

```sql
START TRANSACTION;
CREATE TABLE test (id INT);  -- CREATE TABLE транзакционна
ALTER TABLE test ADD COLUMN name TEXT;  -- ALTER не транзакционна
ROLLBACK;  -- Таблица удалится, но ALTER уже был выполнен
```

### Oracle (нетранзакционный DDL)

В Oracle DDL не транзакционен. Он неявно делает COMMIT перед выполнением.

```sql
BEGIN
    INSERT INTO users VALUES (1);  -- DML
    CREATE TABLE test (id INT);     -- DDL: неявный COMMIT
    ROLLBACK;                       -- Откатит только после CREATE, но не INSERT
END;
```

## Распространенные ошибки

### Ошибка 1: DROP без IF EXISTS

```sql
-- Плохо (вызовет ошибку, если таблицы нет)
DROP TABLE users;

-- Хорошо
DROP TABLE IF EXISTS users;
```

### Ошибка 2: Неправильный порядок FOREIGN KEY

```sql
-- Плохо: ссылается на таблицу, которая еще не создана
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(id)  -- customers не существует
);

-- Хорошо: сначала customers, потом orders
CREATE TABLE customers (id INT PRIMARY KEY);
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT REFERENCES customers(id));
```

### Ошибка 3: Слишком большие VARCHAR

```sql
-- Плохо (VARCHAR(1000) для имени)
name VARCHAR(1000)

-- Хорошо (реалистичный лимит)
name VARCHAR(100)
```

### Ошибка 4: NOT NULL без DEFAULT

```sql
-- Плохо: добавить NOT NULL в существующую таблицу с данными
ALTER TABLE users ADD COLUMN middle_name TEXT NOT NULL;  -- Ошибка!

-- Хорошо: сначала добавить с DEFAULT, потом убрать
ALTER TABLE users ADD COLUMN middle_name TEXT DEFAULT '';
UPDATE users SET middle_name = '' WHERE middle_name IS NULL;
ALTER TABLE users ALTER COLUMN middle_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN middle_name DROP DEFAULT;
```

### Ошибка 5: Каскадное удаление без понимания последствий

```sql
-- Опасно: удалит все заказы при удалении пользователя
ALTER TABLE orders ADD CONSTRAINT fk_orders_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Безопаснее: запретить удаление пользователя с заказами
ALTER TABLE orders ADD CONSTRAINT fk_orders_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
```

## Резюме для системного аналитика

1. **DDL (Data Definition Language)** — язык определения структуры данных. Создает, изменяет и удаляет таблицы, индексы, схемы, ограничения. Не работает с самими данными, работает с "контейнерами".

2. **Основные команды:** `CREATE` (создать), `ALTER` (изменить), `DROP` (удалить), `TRUNCATE` (очистить), `RENAME` (переименовать).

3. **Типы данных** — критически важны. `INTEGER` для ID, `VARCHAR` для строк, `DECIMAL` для денег, `TIMESTAMP` для дат. Неправильный выбор типа ведет к проблемам с производительностью и точностью.

4. **Ограничения (Constraints)** — стражи целостности данных. `PRIMARY KEY` (уникальный идентификатор), `FOREIGN KEY` (ссылка на другую таблицу), `UNIQUE` (уникальность), `CHECK` (проверка условия), `NOT NULL` (обязательное значение).

5. **TRUNCATE vs DELETE:** `TRUNCATE` — быстрая очистка всей таблицы, не логирует строки, сбрасывает автоинкремент. `DELETE` — построчное удаление с условием, медленнее, логируется.

6. **Транзакционность DDL** зависит от СУБД. PostgreSQL поддерживает транзакционный DDL (можно ROLLBACK). MySQL — ограниченно. Oracle — не поддерживает (неявный COMMIT).