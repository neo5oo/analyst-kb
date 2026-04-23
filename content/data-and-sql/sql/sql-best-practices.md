---
title: Лучшие практики
weight: 70
draft: false
description: "Лучшие практики SQL для производительности, читаемости, безопасности и поддержки. Читаемость: понятные имена, алиасы, форматирование, CTE вместо вложенных подзапросов, комментарии."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что относится к хорошим практикам написания SQL?
    options:
    - Всегда писать всё в одну строку
    - Не использовать WHERE для UPDATE
    - Ясные алиасы, явные поля вместо бездумного SELECT *, понятная структура запроса
    - Игнорировать форматирование
    correctIndex: 2
    explanation: Читаемость SQL так же важна, как и его корректность.
  - question: Почему не стоит злоупотреблять SELECT *?
    options:
    - Потому что SELECT * быстрее любых конкретных полей
    - Потому что он тянет лишние столбцы и делает контракт результата менее явным
    - Потому что он запрещён стандартом SQL
    - Потому что с ним нельзя делать JOIN
    correctIndex: 1
    explanation: Явный список полей лучше и для чтения, и для производительности.
  - question: Что важно перед оптимизацией SQL?
    options:
    - Сразу создавать индексы на все поля
    - Сначала переписать всё в Python
    - Избегать любых JOIN априори
    - Сначала понять реальный план выполнения и узкие места
    correctIndex: 3
    explanation: Оптимизация без фактов часто вредит больше, чем помогает.
  - question: Что делает SQL-запрос хорошим с точки зрения командной работы?
    options:
    - Он не только работает, но и понятен другим разработчикам и аналитикам
    - Он максимально короткий любой ценой
    - Он содержит как можно больше вложенности
    - Он использует самые редкие возможности СУБД
    correctIndex: 0
    explanation: Поддерживаемость — это тоже качество запроса.
---
## Введение: Искусство писать хорошие запросы

Написать SQL-запрос, который возвращает правильные данные, — это половина дела. Написать запрос, который делает это быстро, надежно и понятно другим, — это искусство.

Плохо написанный запрос может работать минуты на миллионе строк. Хорошо написанный — миллисекунды. Разница не в магии, а в понимании того, как работают базы данных, и в соблюдении проверенных практик.

Этот документ — сборник лучших практик, которые помогут вам писать эффективные, читаемые и поддерживаемые SQL-запросы. Практики охватывают производительность, читаемость, безопасность и поддержку.

## Читаемость и поддерживаемость

### Пишите понятные имена

```sql
-- Плохо
SELECT a, b, c FROM t WHERE d = 1;

-- Хорошо
SELECT 
    customer_id,
    customer_name,
    order_amount
FROM customers
WHERE is_active = 1;
```

### Используйте алиасы осмысленно

```sql
-- Плохо
SELECT c.name, o.amount, i.quantity
FROM customers c, orders o, items i
WHERE c.id = o.cust_id AND o.id = i.order_id;

-- Хорошо
SELECT 
    c.name AS customer_name,
    o.amount AS order_amount,
    i.quantity AS item_quantity
FROM customers AS c
JOIN orders AS o ON c.id = o.customer_id
JOIN order_items AS i ON o.id = i.order_id;
```

### Форматируйте запросы

```sql
-- Плохо (все в одну строку)
SELECT c.name,o.amount FROM customers c JOIN orders o ON c.id=o.customer_id WHERE o.amount>1000 ORDER BY o.amount DESC;

-- Хорошо (структурированно)
SELECT 
    c.name AS customer_name,
    o.amount AS order_amount
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.amount > 1000
ORDER BY o.amount DESC;
```

### Используйте CTE вместо вложенных подзапросов

```sql
-- Плохо (глубоко вложенный подзапрос)
SELECT * FROM (
    SELECT * FROM (
        SELECT * FROM users WHERE is_active = 1
    ) active_users
    WHERE created_at > '2024-01-01'
) recent_users
WHERE city = 'Москва';

-- Хорошо (CTE — понятно и читаемо)
WITH active_users AS (
    SELECT * FROM users WHERE is_active = 1
),
recent_active_users AS (
    SELECT * FROM active_users WHERE created_at > '2024-01-01'
)
SELECT * FROM recent_active_users WHERE city = 'Москва';
```

### Документируйте сложную логику

```sql
-- Расчет доли рынка по категориям товаров
-- Формула: (продажи категории / общие продажи) * 100
WITH category_sales AS (
    SELECT 
        category_id,
        SUM(amount) AS total
    FROM orders
    WHERE order_date >= '2024-01-01'
    GROUP BY category_id
),
total_sales AS (
    SELECT SUM(amount) AS total FROM orders WHERE order_date >= '2024-01-01'
)
SELECT 
    cs.category_id,
    cs.total AS category_sales,
    ts.total AS overall_sales,
    ROUND(cs.total / ts.total * 100, 2) AS market_share_percent
FROM category_sales cs
CROSS JOIN total_sales ts;
```

## Производительность

### Не используйте SELECT *

```sql
-- Плохо (читает все колонки, даже ненужные)
SELECT * FROM users WHERE id = 123;

-- Хорошо (только нужные колонки)
SELECT id, name, email FROM users WHERE id = 123;
```

**Почему:** `SELECT *` заставляет базу данных читать все колонки с диска, даже если вам нужны только две. Это увеличивает время выполнения и объем передаваемых данных.

### Используйте WHERE вместо HAVING для фильтрации строк

```sql
-- Плохо (фильтрация после группировки)
SELECT department, AVG(salary) 
FROM employees
GROUP BY department
HAVING department IN ('IT', 'Sales');

-- Хорошо (фильтрация до группировки)
SELECT department, AVG(salary) 
FROM employees
WHERE department IN ('IT', 'Sales')
GROUP BY department;
```

**Почему:** `WHERE` фильтрует строки до агрегации, уменьшая объем данных для группировки. `HAVING` фильтрует после, заставляя базу данных агрегировать все строки.

### EXISTS лучше IN для проверки существования

```sql
-- Плохо (IN может быть медленным, особенно с большим подзапросом)
SELECT * FROM customers 
WHERE id IN (SELECT customer_id FROM orders);

-- Хорошо (EXISTS останавливается при первом совпадении)
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

**Почему:** `EXISTS` перестает искать после первого совпадения. `IN` собирает все значения подзапроса, а потом сравнивает.

### Избегайте функций в WHERE

```sql
-- Плохо (индекс на created_at не используется)
SELECT * FROM orders WHERE DATE(created_at) = '2024-01-15';

-- Хорошо (индекс используется)
SELECT * FROM orders 
WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16';
```

**Почему:** Функция на колонке делает индекс бесполезным. База данных должна применить функцию к каждой строке.

### Используйте LIMIT для выборки образцов

```sql
-- Посмотреть структуру и примеры данных
SELECT * FROM large_table LIMIT 10;

-- Но будьте осторожны: ORDER BY без LIMIT может быть тяжелым
SELECT * FROM large_table ORDER BY id LIMIT 10;
```

### Индексируйте правильно

```sql
-- Какие колонки индексировать:
-- 1. Колонки в WHERE
-- 2. Колонки в JOIN
-- 3. Колонки в ORDER BY (если часто)

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

### Избегайте OR, используйте UNION или IN

```sql
-- Плохо (OR часто не использует индексы эффективно)
SELECT * FROM users 
WHERE city = 'Москва' OR city = 'СПб';

-- Хорошо (IN лучше)
SELECT * FROM users 
WHERE city IN ('Москва', 'СПб');

-- Для сложных условий — UNION
SELECT * FROM users WHERE city = 'Москва' AND age > 30
UNION
SELECT * FROM users WHERE city = 'СПб' AND status = 'vip';
```

### Используйте UNION ALL вместо UNION, если дубликаты не страшны

```sql
-- Плохо (UNION убирает дубликаты, требует сортировки)
SELECT name FROM active_users
UNION
SELECT name FROM archived_users;

-- Хорошо (UNION ALL просто объединяет, быстрее)
SELECT name FROM active_users
UNION ALL
SELECT name FROM archived_users;
```

### Ограничивайте количество строк в JOIN

```sql
-- Плохо: JOIN двух больших таблиц без фильтрации
SELECT * FROM orders o
JOIN order_items oi ON o.id = oi.order_id;

-- Хорошо: сначала фильтруем, потом JOIN
SELECT * FROM (
    SELECT * FROM orders WHERE order_date >= '2024-01-01'
) o
JOIN order_items oi ON o.id = oi.order_id;
```

## Безопасность

### Используйте параметризованные запросы (никогда не вставляйте значения напрямую)

```sql
-- ОПАСНО! SQL-инъекция
"SELECT * FROM users WHERE name = '" + userName + "'";

-- Безопасно (параметризованный запрос)
PREPARE stmt FROM 'SELECT * FROM users WHERE name = ?';
EXECUTE stmt USING @userName;
```

### Ограничивайте права доступа

```sql
-- Аналитику — только SELECT
GRANT SELECT ON database.* TO 'analyst'@'localhost';

-- Приложению — только необходимые операции
GRANT SELECT, INSERT, UPDATE ON app_db.* TO 'app_user'@'%';
GRANT DELETE ON app_db.logs TO 'app_user'@'%';  -- только если нужно

-- Никогда не давайте ALL PRIVILEGES обычным пользователям
```

### Используйте представления (views) для ограничения доступа

```sql
-- Представление, показывающее только нечувствительные данные
CREATE VIEW public_employee_data AS
SELECT id, name, department, position
FROM employees;
-- скрыты salary, passport_number, address

GRANT SELECT ON public_employee_data TO analyst_role;
```

### Экранируйте LIKE-шаблоны

```sql
-- Если пользователь вводит '%' или '_', это может изменить логику поиска
-- Плохо
SELECT * FROM products WHERE name LIKE '%' + user_input + '%';

-- Хорошо (экранирование специальных символов)
SELECT * FROM products 
WHERE name LIKE CONCAT('%', REPLACE(REPLACE(user_input, '%', '\%'), '_', '\_'), '%') 
ESCAPE '\';
```

## Типы данных

### Используйте правильные типы

```sql
-- Плохо
CREATE TABLE users (
    age VARCHAR(10),      -- число в строке
    is_active VARCHAR(3), -- 'yes'/'no'
    price VARCHAR(20)     -- деньги в строке
);

-- Хорошо
CREATE TABLE users (
    age INT,
    is_active BOOLEAN,
    price DECIMAL(10,2)
);
```

### Используйте NOT NULL где возможно

```sql
-- Плохо (NULL везде, где можно)
CREATE TABLE users (
    id INT,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- Хорошо (явные NOT NULL для обязательных полей)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL  -- явно указано, что может быть NULL
);
```

### Используйте DECIMAL для денег, не FLOAT

```sql
-- Плохо (FLOAT может дать неточные результаты)
price FLOAT

-- Хорошо (DECIMAL точен)
price DECIMAL(10,2)
```

**Почему:** FLOAT хранит приблизительные значения. 0.1 + 0.2 может быть 0.30000000000000004. Для денег это неприемлемо.

### Используйте VARCHAR с разумной длиной

```sql
-- Плохо
name VARCHAR(255)   -- для имени? 255 символов?
description TEXT    -- а может, VARCHAR(500) достаточно?

-- Хорошо
name VARCHAR(100)      -- достаточно для 99.9% имен
description VARCHAR(500)  -- если знаем, что описания короткие
detailed_description TEXT   -- если действительно нужен длинный текст
```

## Транзакции

### Держите транзакции короткими

```sql
-- Плохо (долгая транзакция с внешним вызовом)
BEGIN;
SELECT * FROM users WHERE id = 123;
-- вызов внешнего API (5 секунд)
UPDATE users SET status = 'active' WHERE id = 123;
COMMIT;

-- Хорошо (внешние вызовы за пределами транзакции)
user = SELECT * FROM users WHERE id = 123;
-- вызов внешнего API (5 секунд)
BEGIN;
UPDATE users SET status = 'active' WHERE id = 123;
COMMIT;
```

### Всегда обрабатывайте ошибки

```sql
-- Псевдокод (язык приложения)
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Хорошо (с обработкой ошибок)
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
IF (error) THEN
    ROLLBACK;
    RAISE ERROR 'Transaction failed';
ELSE
    COMMIT;
END IF;
```

### Используйте правильный уровень изоляции

```sql
-- Для отчетов, где важна согласованность
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT SUM(amount) FROM orders WHERE status = 'completed';
SELECT SUM(amount) FROM orders WHERE status = 'cancelled';
COMMIT;

-- Для банковских транзакций
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- перевод денег
COMMIT;
```

## JOIN

### Всегда указывайте явные условия JOIN

```sql
-- Плохо (неявный JOIN, легко забыть условие)
SELECT * FROM customers, orders;

-- Хорошо (явный JOIN)
SELECT * FROM customers
JOIN orders ON customers.id = orders.customer_id;
```

### Проверяйте типы JOIN

```sql
-- Плохо (INNER JOIN теряет клиентов без заказов)
SELECT c.name, o.amount
FROM customers c
JOIN orders o ON c.id = o.customer_id;

-- Хорошо (LEFT JOIN сохраняет всех клиентов)
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```

### Избегайте JOIN на неиндексированных колонках

```sql
-- Плохо (медленно, если колонки не индексированы)
SELECT * FROM orders o
JOIN customers c ON o.customer_phone = c.phone;  -- phone без индекса

-- Хорошо (индекс на phone)
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
```

### Ограничивайте количество JOIN

```sql
-- Если нужно больше 5-6 JOIN, возможно, схема требует пересмотра
-- Или стоит использовать материализованные представления
```

## Практические шаблоны

### Пагинация с OFFSET

```sql
-- Страница 1 (первые 50)
SELECT * FROM products ORDER BY id LIMIT 50 OFFSET 0;

-- Страница 2 (следующие 50)
SELECT * FROM products ORDER BY id LIMIT 50 OFFSET 50;

-- Проблема: OFFSET 1000000 заставляет базу данных пропустить миллион строк
-- Решение: keyset pagination (поиск по последнему ID)
SELECT * FROM products 
WHERE id > 12345 
ORDER BY id 
LIMIT 50;
```

### Вставка или обновление (UPSERT)

```sql
-- PostgreSQL
INSERT INTO users (id, name, email) 
VALUES (1, 'Иван', 'ivan@example.com')
ON CONFLICT (id) 
DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- MySQL
INSERT INTO users (id, name, email) 
VALUES (1, 'Иван', 'ivan@example.com')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    email = VALUES(email);
```

### Массовые операции

```sql
-- Плохо: 1000 отдельных INSERT
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');
-- ...

-- Хорошо: один INSERT на 1000 строк
INSERT INTO logs (message) VALUES 
    ('log1'), ('log2'), ..., ('log1000');
```

### EXISTS для проверки существования

```sql
-- Получить клиентов с хотя бы одним заказом
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- Получить клиентов без заказов
SELECT * FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

## Распространенные антипаттерны

### SELECT DISTINCT с JOIN (обычно признак ошибки)

```sql
-- Плохо (DISTINCT скрывает проблему с дубликатами)
SELECT DISTINCT c.name, o.amount
FROM customers c
JOIN orders o ON c.id = o.customer_id;

-- Скорее всего, проблема: JOIN создает дубликаты из-за нескольких заказов
-- Правильно: использовать агрегацию
SELECT c.name, SUM(o.amount)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
```

### Некоррелированный подзапрос в SELECT

```sql
-- Плохо (подзапрос выполняется для каждой строки)
SELECT 
    name,
    (SELECT MAX(salary) FROM employees) AS max_salary
FROM employees;

-- Хорошо (вычислить один раз)
WITH max_salary AS (SELECT MAX(salary) AS max_salary FROM employees)
SELECT e.name, m.max_salary
FROM employees e
CROSS JOIN max_salary m;
```

### Использование функций на индексированных колонках в WHERE

```sql
-- Плохо (индекс не используется)
SELECT * FROM users WHERE LOWER(email) = 'ivan@example.com';

-- Хорошо (хранить email в нижнем регистре или использовать индекс по выражению)
SELECT * FROM users WHERE email = 'ivan@example.com';
-- или
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'ivan@example.com';
```

### LIKE с ведущим wildcard

```sql
-- Плохо (индекс не используется, полное сканирование)
SELECT * FROM products WHERE name LIKE '%phone%';

-- Хорошо (индекс может использоваться)
SELECT * FROM products WHERE name LIKE 'iphone%';

-- Для полнотекстового поиска используйте специализированные инструменты
SELECT * FROM products WHERE MATCH(name) AGAINST('phone');
```

### ORDER BY RAND() для случайной выборки

```sql
-- Плохо (очень медленно на больших таблицах)
SELECT * FROM users ORDER BY RAND() LIMIT 10;

-- Хорошо (случайная выборка с использованием TABLESAMPLE или подзапроса)
-- PostgreSQL
SELECT * FROM users TABLESAMPLE SYSTEM(1) LIMIT 10;

-- Альтернатива: случайный ID из диапазона
SELECT * FROM users WHERE id >= (
    SELECT FLOOR(RANDOM() * (MAX(id) - MIN(id) + 1)) + MIN(id) FROM users
) LIMIT 1;
```

## Резюме для системного аналитика

1. **Читаемость — это поддерживаемость.** Используйте понятные имена, форматируйте запросы, комментируйте сложную логику. CTE (WITH) делает сложные запросы понятными.

2. **Производительность начинается с правильных индексов.** Индексируйте колонки в WHERE, JOIN, ORDER BY. Избегайте функций на индексированных колонках. `EXISTS` обычно быстрее `IN`.

3. **SELECT * — антипаттерн.** Указывайте только нужные колонки. Это уменьшает ввод-вывод и объем передаваемых данных.

4. **Безопасность через параметризацию.** Никогда не вставляйте значения напрямую в строку запроса — это путь к SQL-инъекции.

5. **Правильные типы данных важны.** INT для чисел, DECIMAL для денег, BOOLEAN для флагов, VARCHAR с разумной длиной.

6. **Короткие транзакции — счастливые транзакции.** Держите транзакции короткими, не включайте в них внешние вызовы, обрабатывайте ошибки.

7. **Тестируйте на реальных объемах.** Запрос, работающий быстро на 1000 строках, может умереть на 10 миллионах. Используйте `EXPLAIN` для анализа плана выполнения.