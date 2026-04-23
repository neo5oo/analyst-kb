---
title: Представления
weight: 40
draft: false
description: "Представления — виртуальные таблицы, основанные на сохранённом SQL-запросе, не хранят данные самостоятельно. Обычные представления (non-materialized) всегда актуальны, выполняют запрос при каждом обращении. Материализованные представления хранят копию данных (снимок), очень быстры для чтения, но могут быть устаревшими, требуют периодического REFRESH. Обновляемые представления позволяют INSERT/UPDATE/DELETE при соблюдении условий (одна таблица, нет агрегаций, GROUP BY, DISTINCT). WITH CHECK OPTION запрещает вставку строк, не удовлетворяющих условию представления. Применение: упрощение сложных запросов (JOIN, агрегации), безопасность (скрытие столбцов/строк), логическая абстракция. Синтаксис в PostgreSQL, SQL Server, MySQL, Oracle. Производительность: обычные представления не ускоряют запросы, материализованные — ускоряют за счёт предвычисленных данных. Ошибки: SELECT * (опасно при изменении схемы), глубокие цепочки вложенных представлений, игнорирование CHECK OPTION."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что такое представление (view)?
    options:
    - Физический индекс на диске
    - Отдельный тип партиции Kafka
    - Именованный запрос, который показывает данные как виртуальную таблицу
    - Механизм аутентификации
    correctIndex: 2
    explanation: View помогает скрыть сложность и стандартизировать доступ к данным.
  - question: Зачем использовать views?
    options:
    - Чтобы заменить все таблицы навсегда
    - Чтобы упростить сложные выборки и ограничить доступ к нужному представлению данных
    - Чтобы хранить бинарные файлы
    - Чтобы отключать транзакции
    correctIndex: 1
    explanation: Представления часто используют для удобства и безопасности.
  - question: Чем materialized view отличается от обычного view?
    options:
    - Он всегда равен primary key таблицы
    - Он работает только в памяти браузера
    - Он не связан с SQL
    - Он хранит заранее рассчитанный результат и требует обновления
    correctIndex: 3
    explanation: Материализация ускоряет чтение ценой отдельного обновления.
  - question: Что важно учитывать при работе с view?
    options:
    - Откуда берутся данные, какова актуальность и можно ли через него изменять базовые таблицы
    - View не нуждается в документации
    - View всегда быстрее таблицы
    - View отменяет необходимость в индексах
    correctIndex: 0
    explanation: Представление — это абстракция, которую тоже надо понимать.
---
## Введение: Окно в данные

Представьте, что у вас есть огромный склад с тысячами товаров, разложенных по разным стеллажам, в разных коробках, с разными характеристиками. Вам нужно регулярно показывать менеджеру отчет: какие товары заканчиваются, какие самые дорогие, какие чаще всего заказывают. Каждый раз искать и собирать эти данные вручную — долго и утомительно.

Вместо этого вы можете создать "виртуальную витрину" — место, где уже лежат нужные данные в нужном виде. Вы подходите к витрине и берете готовый отчет. При этом сами товары на складе не перемещаются — витрина просто показывает их в определенном порядке и с определенной фильтрацией.

**Представление (view)** в базе данных — это виртуальная таблица, которая не хранит данные самостоятельно, а является сохраненным SQL-запросом. Когда вы обращаетесь к представлению, база данных выполняет этот запрос и возвращает результат так, как будто это обычная таблица.

Представления не содержат собственных данных — это просто "окна" или "линзы", через которые вы смотрите на данные в реальных таблицах. Изменения в исходных таблицах мгновенно отражаются в представлениях, потому что представления не хранят копии — они каждый раз заново выполняют запрос.

## Зачем нужны представления

### Упрощение сложных запросов

Вместо того чтобы каждый раз писать длинный запрос с множеством JOIN, вы создаете представление и работаете с ним как с простой таблицей.

```sql
-- Без представления (каждый раз писать это)
SELECT 
    o.id AS order_id,
    o.order_date,
    c.name AS customer_name,
    c.email AS customer_email,
    SUM(oi.quantity * oi.price) AS total_amount,
    COUNT(oi.product_id) AS item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_date, c.name, c.email;

-- С представлением
CREATE VIEW order_summary AS
SELECT 
    o.id AS order_id,
    o.order_date,
    c.name AS customer_name,
    c.email AS customer_email,
    SUM(oi.quantity * oi.price) AS total_amount,
    COUNT(oi.product_id) AS item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_date, c.name, c.email;

-- Теперь просто
SELECT * FROM order_summary WHERE total_amount > 1000;
```

### Безопасность и изоляция данных

Представления позволяют скрыть определенные столбцы или строки от разных групп пользователей.

```sql
-- Таблица employees содержит зарплаты и личные данные
-- Менеджеру по персоналу нужно видеть личные данные, но не зарплаты
CREATE VIEW hr_employees AS
SELECT id, name, phone, email, department, hire_date
FROM employees;

-- Руководителю отдела нужно видеть зарплаты своих сотрудников, но не личные данные
CREATE VIEW dept_employees AS
SELECT id, name, position, salary, hire_date
FROM employees
WHERE department = current_setting('myapp.current_department');
```

### Логическая абстракция

Представления скрывают изменения в структуре таблиц от приложений. Если вы измените схему базы данных, вы можете обновить представление, и приложения продолжат работать без изменений.

```sql
-- Было: одна таблица users
CREATE TABLE users (id INT, name VARCHAR, email VARCHAR);

-- Стало: разделили на person и auth
CREATE TABLE person (id INT, name VARCHAR);
CREATE TABLE auth (user_id INT, email VARCHAR, password_hash VARCHAR);

-- Создаем представление, которое сохраняет старый интерфейс
CREATE VIEW users AS
SELECT p.id, p.name, a.email
FROM person p
JOIN auth a ON p.id = a.user_id;

-- Приложения продолжают работать как раньше
SELECT * FROM users WHERE id = 1;
```

### Предотвращение дублирования кода

Одна и та же логика выборки используется в разных частях системы. Вместо того чтобы копировать запрос в десять мест, вы создаете одно представление.

### База для отчетности

Представления могут быть основой для систем отчетности, предоставляя унифицированный интерфейс к данным независимо от того, как они хранятся.

## Виды представлений

### Обычные представления (Non-materialized views)

Это стандартные представления, которые не хранят данные. Каждый запрос к такому представлению выполняет сохраненный SQL-запрос.

```sql
CREATE VIEW active_customers AS
SELECT * FROM customers WHERE status = 'active' AND last_order_date > NOW() - INTERVAL '1 year';
```

**Преимущества:** Всегда актуальные данные, не занимают место.
**Недостатки:** Каждый запрос выполняет базовый запрос заново.

### Материализованные представления (Materialized views)

Материализованные представления хранят копию данных на диске. Это как снимок (snapshot) данных на момент последнего обновления.

```sql
-- PostgreSQL
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    DATE(order_date) AS sale_date,
    product_id,
    SUM(quantity) AS total_quantity,
    SUM(quantity * price) AS total_amount
FROM orders
JOIN order_items ON orders.id = order_items.order_id
GROUP BY DATE(order_date), product_id;

-- Обновление материализованного представления
REFRESH MATERIALIZED VIEW daily_sales_summary;
```

**Преимущества:** Очень быстрые запросы, можно создавать индексы.
**Недостатки:** Данные могут быть устаревшими, нужно периодически обновлять (REFRESH), занимает место.

### Обновляемые представления (Updatable views)

Некоторые представления позволяют выполнять INSERT, UPDATE, DELETE, которые транслируются в изменения базовых таблиц.

```sql
CREATE VIEW simple_orders AS
SELECT id, customer_id, order_date, status
FROM orders;

-- Это обновление возможно, потому что представление простое
UPDATE simple_orders SET status = 'shipped' WHERE id = 100;
```

**Требования для обновляемости (в PostgreSQL):**
- Представление основано на одной таблице
- Не использует DISTINCT, GROUP BY, HAVING, LIMIT, OFFSET
- Не использует агрегатные функции
- Не использует UNION, INTERSECT, EXCEPT
- Все столбцы базовой таблицы, не включенные в представление, имеют значения по умолчанию или допускают NULL

Для сложных представлений можно использовать INSTEAD OF триггеры (см. тему "Триггеры").

### Параметризованные представления

Стандартные представления не принимают параметры. Но эту возможность можно эмулировать через функции, возвращающие таблицу.

```sql
-- PostgreSQL: функция как параметризованное представление
CREATE FUNCTION get_orders_by_customer(p_customer_id INT)
RETURNS TABLE(order_id INT, order_date DATE, total_amount DECIMAL)
LANGUAGE sql
AS $$
    SELECT id, order_date, total_amount
    FROM orders
    WHERE customer_id = p_customer_id;
$$;

-- Использование
SELECT * FROM get_orders_by_customer(123);
```

## Синтаксис и базовая структура

### PostgreSQL

```sql
-- Простое представление
CREATE VIEW active_products AS
SELECT id, name, price, stock
FROM products
WHERE stock > 0 AND is_active = true;

-- Представление с опциями (локальная проверка условий)
CREATE VIEW local_products AS
SELECT id, name, price, stock
FROM products
WHERE stock > 0
WITH LOCAL CHECK OPTION;  -- CHECK OPTION запрещает вставку строк, не удовлетворяющих условию

-- Представление с переименованием столбцов
CREATE VIEW product_info (product_id, product_name, unit_price, available_quantity) AS
SELECT id, name, price, stock
FROM products;

-- Материализованное представление
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS total_sales
FROM orders
GROUP BY DATE_TRUNC('month', order_date);

-- С индексами на материализованном представлении
CREATE INDEX idx_monthly_sales_month ON monthly_sales(month);

-- Обновление материализованного представления (блокирует чтение)
REFRESH MATERIALIZED VIEW monthly_sales;

-- Обновление без блокировки (CONCURRENTLY)
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales;
```

### SQL Server

```sql
-- Простое представление
CREATE VIEW active_products AS
SELECT id, name, price, stock
FROM products
WHERE stock > 0 AND is_active = 1;

-- Представление с SCHEMABINDING (защита от изменений в базовых таблицах)
CREATE VIEW product_info
WITH SCHEMABINDING
AS
SELECT id, name, price, stock
FROM dbo.products
WHERE stock > 0;

-- Индексированное представление (аналог материализованного)
CREATE VIEW monthly_sales
WITH SCHEMABINDING
AS
SELECT 
    DATEADD(month, DATEDIFF(month, 0, order_date), 0) AS month,
    SUM(total_amount) AS total_sales,
    COUNT_BIG(*) AS order_count
FROM dbo.orders
GROUP BY DATEADD(month, DATEDIFF(month, 0, order_date), 0);

-- Создание уникального кластерного индекса материализует представление
CREATE UNIQUE CLUSTERED INDEX idx_monthly_sales_month ON monthly_sales(month);
```

### MySQL

```sql
-- Простое представление
CREATE VIEW active_products AS
SELECT id, name, price, stock
FROM products
WHERE stock > 0 AND is_active = 1;

-- Представление с CHECK OPTION
CREATE VIEW expensive_products AS
SELECT id, name, price
FROM products
WHERE price > 100
WITH CHECK OPTION;  -- Не даст вставить продукт с price <= 100 через это представление

-- Представление с алгоритмом (MERGE или TEMPTABLE)
CREATE ALGORITHM = MERGE VIEW product_names AS
SELECT id, name FROM products;
```

### Oracle

```sql
-- Простое представление
CREATE VIEW active_products AS
SELECT id, name, price, stock
FROM products
WHERE stock > 0 AND is_active = 'Y';

-- Представление с CHECK OPTION
CREATE VIEW expensive_products AS
SELECT id, name, price
FROM products
WHERE price > 100
WITH CHECK OPTION CONSTRAINT chk_expensive_price;

-- Материализованное представление
CREATE MATERIALIZED VIEW monthly_sales
REFRESH COMPLETE ON DEMAND
AS
SELECT 
    TRUNC(order_date, 'MM') AS month,
    SUM(total_amount) AS total_sales
FROM orders
GROUP BY TRUNC(order_date, 'MM');

-- Обновление
EXEC DBMS_MVIEW.REFRESH('monthly_sales');
```

## Обновление данных через представления

### Когда обновление возможно

Представление может быть обновляемым, если:
- Основано на одной таблице (или на нескольких с INSTEAD OF триггерами)
- Не содержит агрегаций, DISTINCT, GROUP BY, HAVING
- Не содержит оконных функций, UNION, подзапросов в SELECT (зависит от СУБД)
- Все столбцы базовой таблицы, отсутствующие в представлении, имеют значения по умолчанию или допускают NULL

### Примеры обновляемых представлений

```sql
-- Обновляемое представление (простая фильтрация)
CREATE VIEW active_customers AS
SELECT id, name, email, status
FROM customers
WHERE status = 'active';

-- Обновление через представление работает
UPDATE active_customers SET email = 'new@email.com' WHERE id = 1;
INSERT INTO active_customers (id, name, email, status) VALUES (100, 'New', 'new@email.com', 'active');
DELETE FROM active_customers WHERE id = 100;

-- Но нельзя вставить строку, которая не попадает в представление
INSERT INTO active_customers (id, name, email, status) VALUES (101, 'Inactive', 'inactive@email.com', 'inactive');
-- В зависимости от CHECK OPTION, либо ошибка, либо строка вставится, но не будет видна через представление
```

### WITH CHECK OPTION

`WITH CHECK OPTION` запрещает вставку или обновление строк, которые не удовлетворяют условию представления.

```sql
CREATE VIEW active_orders AS
SELECT * FROM orders WHERE status = 'active'
WITH CHECK OPTION;

-- Это вызовет ошибку, так как новый статус не 'active'
UPDATE active_orders SET status = 'completed' WHERE id = 1;  -- Ошибка!

-- Это тоже ошибка
INSERT INTO active_orders (id, customer_id, status) VALUES (100, 1, 'pending');  -- Ошибка!
```

### Обновление через материализованные представления

В большинстве СУБД материализованные представления доступны только для чтения. Изменения нужно делать в базовых таблицах, а затем обновлять представление через REFRESH.

```sql
-- Нельзя
UPDATE monthly_sales SET total_sales = 10000 WHERE month = '2024-01-01';  -- Ошибка!

-- Нужно так
UPDATE orders SET total_amount = 10000 WHERE DATE_TRUNC('month', order_date) = '2024-01-01';
REFRESH MATERIALIZED VIEW monthly_sales;
```

## Представления и производительность

### Обычные представления

Обычные представления не добавляют накладных расходов сверх того запроса, который в них написан. Оптимизатор "разворачивает" представление и оптимизирует итоговый запрос.

```sql
-- Представление
CREATE VIEW active_orders AS
SELECT * FROM orders WHERE status = 'active';

-- Запрос
SELECT * FROM active_orders WHERE customer_id = 123;

-- Оптимизатор видит
SELECT * FROM orders WHERE status = 'active' AND customer_id = 123;
```

**Важно:** Если представление скрывает индексированные столбцы за функциями, индексы не будут использоваться.

```sql
-- Плохо: скрывает столбец за функцией
CREATE VIEW orders_by_year AS
SELECT EXTRACT(YEAR FROM order_date) AS order_year, *
FROM orders;

-- Индекс на order_date не будет использован
SELECT * FROM orders_by_year WHERE order_year = 2024;

-- Лучше
CREATE VIEW orders_by_year AS
SELECT *, EXTRACT(YEAR FROM order_date) AS order_year
FROM orders;

SELECT * FROM orders_by_year WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';
```

### Вложенные представления

Цепочки представлений (view, которое использует другое представление) могут привести к неоптимальным планам, особенно если в цепочке много уровней.

```sql
CREATE VIEW v1 AS SELECT * FROM orders WHERE status = 'active';
CREATE VIEW v2 AS SELECT * FROM v1 WHERE total_amount > 100;
CREATE VIEW v3 AS SELECT * FROM v2 WHERE customer_id IN (SELECT id FROM premium_customers);

-- Запрос к v3 разворачивается в глубоко вложенный запрос
-- Оптимизатор может справиться, но не всегда
```

**Рекомендация:** Ограничивайте глубину вложенности представлений (2-3 уровня).

### Материализованные представления

Материализованные представления значительно ускоряют сложные агрегирующие запросы, но требуют периодического обновления.

| Характеристика | Обычное представление | Материализованное представление |
| :--- | :--- | :--- |
| **Актуальность данных** | Всегда актуальны | На момент последнего REFRESH |
| **Скорость запросов** | Зависит от сложности запроса | Очень быстрая (как таблица) |
| **Возможность индексов** | Нет | Да |
| **Занимает место** | Нет | Да |
| **Время обновления данных** | 0 (автоматически) | Зависит от объема (REFRESH) |
| **Поддержка INSERT/UPDATE/DELETE** | Ограниченно | Нет (только чтение) |

## Продвинутые техники

### Представления с оконными функциями

```sql
CREATE VIEW ranked_products AS
SELECT 
    id,
    name,
    category,
    price,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category,
    AVG(price) OVER (PARTITION BY category) AS avg_price_in_category
FROM products;

-- Найти самый дорогой продукт в каждой категории
SELECT * FROM ranked_products WHERE rank_in_category = 1;
```

### Рекурсивные представления (WITH RECURSIVE)

Некоторые СУБД поддерживают рекурсивные представления для работы с иерархическими данными.

```sql
-- PostgreSQL
CREATE RECURSIVE VIEW employee_hierarchy (id, name, manager_id, level, path) AS
    SELECT id, name, manager_id, 0 AS level, ARRAY[id] AS path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, h.level + 1, h.path || e.id
    FROM employees e
    JOIN employee_hierarchy h ON e.manager_id = h.id;

-- Найти всех подчиненных менеджера с id=5
SELECT * FROM employee_hierarchy WHERE 5 = ANY(path);
```

### Представления для горизонтального и вертикального разделения

**Вертикальное разделение (скрытие столбцов):**

```sql
-- Пользователи видят только определенные столбцы
CREATE VIEW public_employee_data AS
SELECT id, name, department, position
FROM employees;  -- скрыты salary, passport_number, address
```

**Горизонтальное разделение (скрытие строк):**

```sql
-- Менеджер видит только свой отдел
CREATE VIEW my_team AS
SELECT * FROM employees
WHERE department_id = current_setting('myapp.department_id');
```

## Представления в разных СУБД: Сравнение

| Характеристика | PostgreSQL | SQL Server | MySQL | Oracle |
| :--- | :--- | :--- | :--- | :--- |
| **Материализованные представления** | Да | Да (индексированные) | Нет | Да |
| **Обновляемые представления** | Да (с ограничениями) | Да | Да | Да |
| **CHECK OPTION** | Да (LOCAL/CASCADED) | Нет | Да | Да (CONSTRAINT) |
| **WITH READ ONLY** | Нет (только через права) | Да | Нет | Да |
| **Параметризованные представления** | Через функции | Через функции | Через процедуры | Через пакеты |
| **Рекурсивные представления** | Да | Нет (CTE вместо) | Нет | Да |
| **Индексы на представлениях** | Только материализованные | Да (индексированные) | Нет | Только материализованные |
| **SCHEMABINDING** | Нет | Да | Нет | Да |

## Распространенные ошибки при работе с представлениями

### Ошибка 1: Представление представления представления...

Создание длинных цепочек представлений, где каждое добавляет немного логики. Это усложняет отладку и может ухудшить производительность.

```sql
-- Плохо
CREATE VIEW v1 AS SELECT * FROM orders WHERE status = 'active';
CREATE VIEW v2 AS SELECT *, total_amount * 1.2 AS total_with_tax FROM v1;
CREATE VIEW v3 AS SELECT id, customer_id, total_with_tax FROM v2 WHERE total_with_tax > 100;
CREATE VIEW v4 AS SELECT v3.*, c.name FROM v3 JOIN customers c ON v3.customer_id = c.id;

-- Лучше: одно представление с нужной логикой
CREATE VIEW order_analysis AS
SELECT 
    o.id, o.customer_id, c.name,
    o.total_amount * 1.2 AS total_with_tax
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'active' AND o.total_amount * 1.2 > 100;
```

### Ошибка 2: SELECT * в представлениях

```sql
-- Плохо: если в таблицу добавят новый столбец, представление автоматически его включит
CREATE VIEW all_products AS
SELECT * FROM products;

-- Хорошо: явный список столбцов
CREATE VIEW all_products AS
SELECT id, name, price, stock, category_id, is_active FROM products;
```

**Почему SELECT * опасен:**
- При добавлении столбца в таблицу представление начинает его возвращать, что может сломать приложения
- При удалении столбца представление ломается
- Порядок столбцов может измениться

### Ошибка 3: Использование представлений как "волшебной палочки" для производительности

Новички часто думают, что если создать представление, запросы к нему будут быстрее. Это не так. Обычные представления не ускоряют запросы — они просто скрывают сложность. Для ускорения нужны индексы на базовых таблицах или материализованные представления.

### Ошибка 4: Представления с DISTINCT, которые пытаются обновлять

```sql
CREATE VIEW unique_customers AS
SELECT DISTINCT customer_id, customer_name FROM orders;

-- Это не сработает (DISTINCT делает представление необновляемым)
UPDATE unique_customers SET customer_name = 'New Name' WHERE customer_id = 1;  -- Ошибка!
```

### Ошибка 5: Игнорирование CHECK OPTION

```sql
CREATE VIEW cheap_products AS
SELECT * FROM products WHERE price < 100;

-- Вставка, которая не попадает в представление (цена 200)
INSERT INTO cheap_products (id, name, price) VALUES (100, 'Expensive', 200);

-- Строка вставилась, но через представление ее не видно
SELECT * FROM cheap_products WHERE id = 100;  -- Пусто

-- Это может сбить с толку пользователей представления
```

**Исправление:** Добавить CHECK OPTION.

```sql
CREATE VIEW cheap_products AS
SELECT * FROM products WHERE price < 100
WITH CHECK OPTION;

INSERT INTO cheap_products (id, name, price) VALUES (100, 'Expensive', 200);  -- Ошибка!
```

## Представления и безопасность

### Ограничение доступа к столбцам

```sql
-- Создаем представление, показывающее только безопасные столбцы
CREATE VIEW public_user_info AS
SELECT id, username, display_name, registration_date
FROM users;  -- скрыты password_hash, email, phone, address

-- Даем доступ к представлению, но не к таблице
GRANT SELECT ON public_user_info TO web_user_role;
REVOKE SELECT ON users FROM web_user_role;
```

### Ограничение доступа к строкам

```sql
-- Представление, показывающее только данные текущего пользователя
CREATE VIEW my_orders AS
SELECT * FROM orders
WHERE customer_id = current_setting('myapp.user_id');

-- Пользователь видит только свои заказы
SELECT * FROM my_orders;
```

### Маскирование данных (Data Masking)

```sql
-- Представление с маскированием чувствительных данных
CREATE VIEW masked_employees AS
SELECT 
    id,
    name,
    department,
    CASE 
        WHEN current_user = 'hr_manager' THEN salary 
        ELSE NULL 
    END AS salary,
    CONCAT(LEFT(phone, 2), '******', RIGHT(phone, 2)) AS masked_phone
FROM employees;

-- HR-менеджер видит реальную зарплату, остальные — NULL
```

## Резюме для системного аналитика

1. **Представление — это виртуальная таблица, основанная на SQL-запросе.** Оно не хранит данные самостоятельно, а каждый раз выполняет сохраненный запрос. Материализованные представления хранят копию данных.

2. **Основные применения:** упрощение сложных запросов, безопасность и изоляция данных, логическая абстракция, предотвращение дублирования кода.

3. **Обычные представления** всегда актуальны, но каждый запрос к ним выполняет базовый запрос. **Материализованные представления** очень быстры, но могут быть устаревшими и требуют периодического обновления.

4. **Простые представления** могут быть обновляемыми (INSERT, UPDATE, DELETE). Сложные представления (с JOIN, GROUP BY, DISTINCT) — обычно нет, но можно использовать INSTEAD OF триггеры.

5. **WITH CHECK OPTION** защищает от вставки строк, которые не удовлетворяют условию представления. Полезно для поддержания целостности.

6. **SELECT * в представлениях — антипаттерн.** Всегда перечисляйте столбцы явно. Иначе добавление или удаление столбцов в базовой таблице сломает представление.

7. **Представления не ускоряют запросы сами по себе.** Для ускорения нужны индексы на базовых таблицах или материализованные представления.

8. **Представления — мощный инструмент безопасности.** Они позволяют дать доступ к части данных (столбцам или строкам), не открывая доступ к базовым таблицам.