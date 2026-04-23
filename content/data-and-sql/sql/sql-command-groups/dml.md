---
title: DML (Data Manipulation Language)
weight: 10
draft: false
description: "DML — язык манипуляции данными в реляционных БД. Команды: SELECT (чтение: WHERE, ORDER BY, LIMIT, DISTINCT), INSERT (добавление строк: одной, нескольких, INSERT FROM SELECT, RETURNING в PostgreSQL), UPDATE (изменение строк: SET, WHERE, подзапросы, RETURNING), DELETE (удаление строк: WHERE, подзапросы, RETURNING), MERGE / UPSERT (вставка или обновление: INSERT ON CONFLICT в PostgreSQL, INSERT ON DUPLICATE KEY UPDATE в MySQL, MERGE в SQL Server)."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что относится к DML?
    options:
    - CREATE, ALTER, DROP
    - GRANT, REVOKE
    - SELECT, INSERT, UPDATE, DELETE
    - BEGIN, COMMIT, ROLLBACK
    correctIndex: 2
    explanation: DML отвечает за чтение и изменение самих данных.
  - question: Для чего используется DML?
    options:
    - Для создания пользователей и ролей в ОС
    - Для выборки, добавления, изменения и удаления строк
    - Для шифрования сетевого трафика
    - Для рисования архитектурных диаграмм
    correctIndex: 1
    explanation: Это язык манипуляции содержимым таблиц.
  - question: Какой запрос DML чаще всего используют для получения данных?
    options:
    - GRANT
    - TRUNCATE
    - SAVEPOINT
    - SELECT
    correctIndex: 3
    explanation: SELECT — базовая операция чтения данных.
  - question: Что важно помнить о DML-операциях изменения?
    options:
    - Они могут менять реальные данные, поэтому условия WHERE и транзакции критичны
    - UPDATE всегда безопасен без фильтра
    - DELETE нельзя откатить в транзакции
    - INSERT не влияет на таблицу
    correctIndex: 0
    explanation: Ошибочный UPDATE/DELETE без фильтра — классический источник проблем.
---
## Введение: Наполнение базы данных смыслом

Представьте, что архитектор спроектировал дом, строители возвели стены, проложили коммуникации. Дом готов. Но пока он пуст. Чтобы дом стал жилым, нужно занести мебель, повесить картины, поставить посуду на кухню. Наполнить пространство жизнью.

В мире баз данных DDL создает структуру (таблицы, индексы, схемы), а **DML (Data Manipulation Language)** наполняет эту структуру данными. DML — это команды, которые работают с самими данными, а не с их контейнерами.

| Команда | Назначение | Аналогия |
| :--- | :--- | :--- |
| `SELECT` | Чтение данных | Посмотреть, что есть в доме |
| `INSERT` | Добавление новых строк | Принести новую мебель |
| `UPDATE` | Изменение существующих строк | Переставить мебель, поменять цвет стен |
| `DELETE` | Удаление строк | Вынести ненужную мебель |
| `MERGE` | Вставка или обновление (upsert) | Принести, если нет, или обновить, если есть |

DML — это то, с чем аналитик работает чаще всего. `SELECT` — ваша основная команда для получения отчетов. `INSERT`, `UPDATE`, `DELETE` — команды для поддержания данных в актуальном состоянии.

Важное отличие от DDL: DML операции обычно транзакционны. Их можно объединять в транзакции и откатывать (`ROLLBACK`), если что-то пошло не так.

## SELECT: Чтение данных

Самая важная команда для аналитика. `SELECT` позволяет извлекать данные из базы.

### Простейший SELECT

```sql
-- Выбрать все колонки из таблицы
SELECT * FROM users;

-- Выбрать конкретные колонки
SELECT id, name, email FROM users;

-- Выбрать с константой
SELECT id, name, 'active' AS status FROM users;

-- Выбрать с вычислениями
SELECT name, age, age * 12 AS age_months FROM users;
```

### SELECT с фильтрацией (WHERE)

```sql
-- Простое условие
SELECT * FROM users WHERE age > 18;

-- Составное условие
SELECT * FROM users WHERE city = 'Москва' AND age BETWEEN 18 AND 65;

-- Несколько значений
SELECT * FROM users WHERE status IN ('active', 'pending');

-- Поиск по шаблону (LIKE)
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Проверка на NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

### SELECT с сортировкой (ORDER BY)

```sql
-- По возрастанию (ASC — по умолчанию)
SELECT name, age FROM users ORDER BY age;

-- По убыванию (DESC)
SELECT name, age FROM users ORDER BY age DESC;

-- По нескольким колонкам
SELECT name, city, age FROM users ORDER BY city ASC, age DESC;

-- По выражению
SELECT name, age * 12 AS age_months FROM users ORDER BY age_months;
```

### SELECT с ограничением количества (LIMIT)

```sql
-- Первые 10 строк
SELECT * FROM users LIMIT 10;

-- С пропуском (пагинация)
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;

-- MySQL альтернатива
SELECT * FROM users ORDER BY id LIMIT 20, 10;
```

### SELECT с удалением дубликатов (DISTINCT)

```sql
-- Уникальные города
SELECT DISTINCT city FROM users;

-- Уникальные пары
SELECT DISTINCT city, status FROM users;

-- Количество уникальных значений
SELECT COUNT(DISTINCT city) FROM users;
```

## INSERT: Добавление данных

### INSERT одной строки

```sql
-- Указание всех колонок
INSERT INTO users (id, name, email, age, city)
VALUES (1, 'Иван', 'ivan@example.com', 30, 'Москва');

-- Без указания колонок (значения для всех по порядку)
INSERT INTO users VALUES (2, 'Петр', 'petr@example.com', 25, 'СПб');

-- Только некоторые колонки (остальные NULL или DEFAULT)
INSERT INTO users (name, email) VALUES ('Анна', 'anna@example.com');
```

### INSERT нескольких строк

```sql
-- Несколько строк в одном запросе (быстрее)
INSERT INTO users (name, email) VALUES 
    ('Иван', 'ivan@example.com'),
    ('Петр', 'petr@example.com'),
    ('Анна', 'anna@example.com');
```

### INSERT с RETURNING (PostgreSQL)

Возвращает вставленные значения (полезно для получения сгенерированных ID).

```sql
-- Вернуть id вставленной строки
INSERT INTO users (name, email) 
VALUES ('Иван', 'ivan@example.com') 
RETURNING id;

-- Вернуть все колонки
INSERT INTO users (name, email) 
VALUES ('Иван', 'ivan@example.com') 
RETURNING *;
```

### INSERT FROM SELECT (копирование данных)

```sql
-- Копирование из другой таблицы
INSERT INTO archive_users (id, name, email, deleted_at)
SELECT id, name, email, NOW() FROM users WHERE is_active = false;
```

## UPDATE: Изменение данных

### UPDATE простой

```sql
-- Обновление одной колонки у всех строк (осторожно!)
UPDATE users SET status = 'inactive';

-- Обновление с условием
UPDATE users SET status = 'active' WHERE email = 'ivan@example.com';

-- Обновление нескольких колонок
UPDATE users 
SET name = 'Иван Петров', email = 'ivan.petrov@example.com' 
WHERE id = 1;
```

### UPDATE с вычислениями

```sql
-- Увеличение зарплаты на 10%
UPDATE employees SET salary = salary * 1.10 WHERE department = 'sales';

-- Изменение на основе другой колонки
UPDATE products SET discounted_price = price * 0.9 WHERE is_on_sale = true;

-- Текущая дата
UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE user_id = 123;
```

### UPDATE с подзапросом

```sql
-- Обновление на основе значения из другой таблицы
UPDATE orders 
SET status = 'shipped' 
WHERE customer_id IN (SELECT id FROM customers WHERE vip = true);

-- PostgreSQL: UPDATE с JOIN
UPDATE orders 
SET status = 'shipped'
FROM customers 
WHERE orders.customer_id = customers.id AND customers.vip = true;
```

### UPDATE с RETURNING (PostgreSQL)

```sql
-- Вернуть обновленные значения
UPDATE users SET last_login = NOW() WHERE id = 123 RETURNING *;

-- Вернуть только определенные колонки
UPDATE products SET price = price * 1.1 
WHERE category = 'electronics' 
RETURNING id, name, old_price, price;
```

## DELETE: Удаление данных

### DELETE простой

```sql
-- Удаление всех строк (осторожно!)
DELETE FROM logs;

-- Удаление с условием
DELETE FROM users WHERE is_active = false AND last_login < NOW() - INTERVAL '1 year';

-- Удаление с лимитом (MySQL)
DELETE FROM logs WHERE created_at < '2024-01-01' LIMIT 1000;
```

### DELETE с подзапросом

```sql
-- Удаление заказов несуществующих пользователей
DELETE FROM orders 
WHERE customer_id NOT IN (SELECT id FROM customers);

-- PostgreSQL: DELETE с USING (аналог JOIN)
DELETE FROM orders 
USING customers 
WHERE orders.customer_id = customers.id AND customers.is_deleted = true;
```

### DELETE с RETURNING (PostgreSQL)

```sql
-- Вернуть удаленные строки (полезно для архивации)
DELETE FROM temp_data WHERE created_at < NOW() - INTERVAL '1 day' 
RETURNING *;

-- С логированием
WITH deleted AS (
    DELETE FROM users WHERE is_active = false 
    RETURNING *
)
INSERT INTO users_archive SELECT *, NOW() FROM deleted;
```

### TRUNCATE vs DELETE

```sql
-- DELETE: медленно, логирует каждую строку, можно с WHERE
DELETE FROM logs WHERE created_at < '2024-01-01';

-- TRUNCATE: быстро, не логирует строки, нельзя WHERE
TRUNCATE TABLE logs;
```

## MERGE (Upsert): Вставка или обновление

Ситуация: нужно вставить строку, но если она уже существует — обновить. Это называется "upsert" (UPDATE + INSERT).

### PostgreSQL: INSERT ON CONFLICT

```sql
-- Если email уже существует, обновить имя и возраст
INSERT INTO users (id, name, email, age) 
VALUES (1, 'Иван', 'ivan@example.com', 30)
ON CONFLICT (email) 
DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age;

-- Ничего не делать, если конфликт
INSERT INTO users (id, name, email) 
VALUES (1, 'Иван', 'ivan@example.com')
ON CONFLICT (id) DO NOTHING;

-- С условием
INSERT INTO daily_stats (date, user_id, page_views) 
VALUES ('2024-01-15', 123, 1)
ON CONFLICT (date, user_id) 
DO UPDATE SET page_views = daily_stats.page_views + EXCLUDED.page_views;
```

### MySQL: INSERT ON DUPLICATE KEY UPDATE

```sql
INSERT INTO users (id, name, email, age) 
VALUES (1, 'Иван', 'ivan@example.com', 30)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    age = VALUES(age);
```

### SQL Server: MERGE

```sql
MERGE INTO users AS target
USING (VALUES (1, 'Иван', 'ivan@example.com', 30)) AS source (id, name, email, age)
ON target.id = source.id
WHEN MATCHED THEN
    UPDATE SET name = source.name, age = source.age
WHEN NOT MATCHED THEN
    INSERT (id, name, email, age) VALUES (source.id, source.name, source.email, source.age);
```

## Практические примеры DML

### Пример 1: Регистрация нового пользователя

```sql
-- Проверка, не занят ли email
SELECT id FROM users WHERE email = 'newuser@example.com';

-- Если не занят, вставка
INSERT INTO users (name, email, password_hash, created_at) 
VALUES ('Новый Пользователь', 'newuser@example.com', 'hash...', NOW());
```

### Пример 2: Обновление корзины товаров

```sql
-- Увеличить количество товара в корзине
UPDATE cart_items 
SET quantity = quantity + 1 
WHERE user_id = 123 AND product_id = 456;

-- Если такой записи нет, вставить
INSERT INTO cart_items (user_id, product_id, quantity) 
VALUES (123, 456, 1)
ON CONFLICT (user_id, product_id) 
DO UPDATE SET quantity = cart_items.quantity + 1;
```

### Пример 3: Архивация старых данных

```sql
-- Копирование старых заказов в архив
INSERT INTO orders_archive 
SELECT * FROM orders WHERE created_at < NOW() - INTERVAL '1 year';

-- Удаление из основной таблицы
DELETE FROM orders WHERE created_at < NOW() - INTERVAL '1 year';
```

### Пример 4: Массовое обновление статусов

```sql
-- Обновить статус заказов, доставленных более 30 дней назад
UPDATE orders 
SET status = 'archived' 
WHERE status = 'delivered' 
  AND delivered_at < NOW() - INTERVAL '30 days';
```

### Пример 5: Выборка для отчета

```sql
SELECT 
    DATE(created_at) AS order_date,
    COUNT(*) AS orders_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM orders
WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;
```

## NULL в DML

NULL — это "неизвестно" или "отсутствует". Это не ноль и не пустая строка.

### Проверка на NULL

```sql
-- NULL не равно NULL
SELECT * FROM users WHERE phone = NULL;  -- НЕ РАБОТАЕТ

-- Правильно
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

### NULL в INSERT и UPDATE

```sql
-- Явная вставка NULL
INSERT INTO users (name, phone) VALUES ('Иван', NULL);

-- UPDATE установить NULL
UPDATE users SET phone = NULL WHERE id = 1;
```

### NULL в сравнениях

```sql
-- Любое сравнение с NULL дает NULL (не TRUE, не FALSE)
SELECT NULL = NULL;   -- NULL
SELECT NULL > 1;      -- NULL
SELECT NULL < 1;      -- NULL

-- Поэтому в WHERE условия с NULL не проходят
SELECT * FROM users WHERE phone = NULL;  -- ничего не вернет
```

### Функции для работы с NULL

```sql
-- COALESCE: первый ненулевой
SELECT name, COALESCE(phone, email, 'Нет контактов') AS contact FROM users;

-- NULLIF: NULL если равны
SELECT NULLIF(age, 0) AS age FROM users;  -- превращает 0 в NULL

-- ISNULL (SQL Server) / IFNULL (MySQL) / NVL (Oracle)
SELECT name, IFNULL(phone, 'Нет телефона') FROM users;
```

## DML и транзакции

DML операции обычно транзакционны. Их можно объединять и откатывать.

```sql
BEGIN;

-- Все операции в одной транзакции
INSERT INTO orders (customer_id, amount) VALUES (123, 5000);
INSERT INTO order_items (order_id, product_id, quantity) VALUES (LASTVAL(), 456, 1);
UPDATE products SET stock = stock - 1 WHERE id = 456;

-- Если все успешно
COMMIT;

-- Если ошибка
ROLLBACK;  -- Откатит все три операции
```

### SELECT для обновления (FOR UPDATE)

Блокирует строки на время транзакции, чтобы другие транзакции не могли их изменить.

```sql
BEGIN;
-- Блокируем строку пользователя
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- Проверяем баланс
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

## Сравнение DML и DDL

| Характеристика | DML | DDL |
| :--- | :--- | :--- |
| **Что изменяет** | Данные | Структуру |
| **Примеры** | SELECT, INSERT, UPDATE, DELETE | CREATE, ALTER, DROP, TRUNCATE |
| **Транзакционность** | Да (можно ROLLBACK) | Зависит от СУБД |
| **Требуемые права** | SELECT, INSERT, UPDATE, DELETE | CREATE, ALTER, DROP |
| **Частота использования** | Очень высокая | Низкая (при изменении схемы) |
| **Возвращает данные** | SELECT — да, остальные — иногда (RETURNING) | Нет |

## Производительность DML операций

### INSERT: пакетная вставка

```sql
-- Плохо: 1000 отдельных запросов
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');
-- ... 998 раз

-- Хорошо: один запрос на 1000 строк
INSERT INTO logs (message) VALUES 
    ('log1'), ('log2'), ... , ('log1000');
```

### UPDATE: массовое обновление

```sql
-- Плохо: по одному обновлению (в цикле)
UPDATE users SET status = 'active' WHERE id = 1;
UPDATE users SET status = 'active' WHERE id = 2;
-- ...

-- Хорошо: одним запросом
UPDATE users SET status = 'active' WHERE id IN (1,2,3,...);
```

### DELETE: с лимитом (MySQL)

```sql
-- Удаление большими порциями (чтобы не блокировать таблицу)
DELETE FROM logs WHERE created_at < '2024-01-01' LIMIT 10000;
-- Повторять, пока есть что удалять
```

### UPDATE без индекса

```sql
-- Плохо: полное сканирование таблицы
UPDATE users SET status = 'inactive' WHERE last_login < '2023-01-01';
-- Нужен индекс на last_login

-- Хорошо: индекс создан
CREATE INDEX idx_users_last_login ON users(last_login);
```

## Распространенные ошибки

### Ошибка 1: UPDATE без WHERE

```sql
-- Катастрофа: обновит все строки
UPDATE users SET status = 'active';

-- Всегда проверяйте UPDATE и DELETE перед выполнением
BEGIN;
UPDATE users SET status = 'active' WHERE id = 123;
-- Проверить
SELECT * FROM users WHERE id = 123;
COMMIT;  -- или ROLLBACK
```

### Ошибка 2: DELETE без WHERE

```sql
-- Удалит все строки
DELETE FROM users;

-- Всегда проверяйте
SELECT COUNT(*) FROM users WHERE is_active = false;  -- сколько удалим?
DELETE FROM users WHERE is_active = false;
```

### Ошибка 3: Сравнение с NULL

```sql
-- Не найдет строки с NULL phone
SELECT * FROM users WHERE phone = NULL;  -- неправильно

-- Правильно
SELECT * FROM users WHERE phone IS NULL;
```

### Ошибка 4: Строки без кавычек

```sql
-- Ошибка: текст без кавычек
SELECT * FROM users WHERE name = Иван;

-- Правильно
SELECT * FROM users WHERE name = 'Иван';
```

### Ошибка 5: IN с большим количеством значений

```sql
-- Плохо: 10 000 значений в IN (медленно)
DELETE FROM logs WHERE id IN (1,2,3,...,10000);

-- Лучше: временная таблица
CREATE TEMP TABLE ids_to_delete (id INT);
INSERT INTO ids_to_delete VALUES (1),(2),...,(10000);
DELETE FROM logs WHERE id IN (SELECT id FROM ids_to_delete);
```

## Резюме для системного аналитика

1. **DML (Data Manipulation Language)** — язык манипуляции данными. Команды для чтения (`SELECT`), добавления (`INSERT`), изменения (`UPDATE`) и удаления (`DELETE`) данных.

2. **SELECT** — основная команда аналитика. Фильтрация (`WHERE`), сортировка (`ORDER BY`), ограничение (`LIMIT`), уникальность (`DISTINCT`). SQL запрос — это ваш главный инструмент для получения ответов от базы данных.

3. **INSERT** — добавляет строки. Можно вставлять одну строку, несколько, или результат другого `SELECT`. `RETURNING` (PostgreSQL) возвращает вставленные значения.

4. **UPDATE** — изменяет существующие строки. Всегда проверяйте `WHERE` перед выполнением. `UPDATE без WHERE` обновит все строки таблицы.

5. **DELETE** — удаляет строки. `DELETE без WHERE` удалит все строки. Для полной очистки таблицы `TRUNCATE` быстрее, но не поддерживает условия.

6. **MERGE / UPSERT** — вставка или обновление. `INSERT ON CONFLICT` (PostgreSQL), `INSERT ON DUPLICATE KEY UPDATE` (MySQL), `MERGE` (SQL Server). Позволяет атомарно решить: "вставить, если нет, или обновить, если есть".

7. **NULL — это не ноль и не пустая строка.** Проверять через `IS NULL` и `IS NOT NULL`. Для замены NULL использовать `COALESCE`.

8. **Транзакции** позволяют группировать DML операции. `BEGIN` → операции → `COMMIT` или `ROLLBACK`. Транзакции обеспечивают атомарность (все или ничего).