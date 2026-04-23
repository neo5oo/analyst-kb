---
title: Агрегация и группировка
weight: 30
draft: false
description: "Агрегация и группировка в SQL. Агрегатные функции: COUNT (количество строк: COUNT() считает все строки, COUNT(column) — только NOT NULL), SUM (сумма), AVG (среднее, игнорирует NULL), MIN, MAX. Группировка (GROUP BY) — разбивает строки на группы по общему признаку, агрегаты вычисляются для каждой группы отдельно. HAVING — фильтрация групп после группировки (WHERE фильтрует строки до группировки). Порядок выполнения: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Для чего нужны агрегатные функции в SQL?
    options:
    - Чтобы создавать индексы
    - Чтобы менять тип колонки
    - Чтобы получать сводные значения: COUNT, SUM, AVG, MIN, MAX
    - Чтобы выдавать права пользователям
    correctIndex: 2
    explanation: Агрегации превращают множество строк в обобщённые показатели.
  - question: Зачем нужен GROUP BY?
    options:
    - Чтобы задать порядок сортировки
    - Чтобы группировать строки перед агрегированием по выбранным полям
    - Чтобы автоматически создать join
    - Чтобы откатить транзакцию
    correctIndex: 1
    explanation: GROUP BY объединяет строки в группы по ключу группировки.
  - question: Чем HAVING отличается от WHERE?
    options:
    - HAVING работает только с DELETE
    - WHERE нельзя использовать без ORDER BY
    - Между ними нет различий
    - HAVING фильтрует уже сформированные группы, а WHERE — строки до группировки
    correctIndex: 3
    explanation: Это одно из ключевых логических отличий в SQL.
  - question: Когда агрегация особенно полезна аналитику?
    options:
    - Когда нужно считать метрики, итоги и срезы по данным
    - Когда нужно только вставить одну строку
    - Когда проектируете mTLS
    - Когда настраиваете RabbitMQ
    correctIndex: 0
    explanation: Агрегатные запросы — основа аналитики в SQL.
---
## Введение: От деталей к смыслу

Представьте, что у вас есть коробка с тысячами Lego-кирпичиков. Вы можете высыпать их на стол и рассматривать каждый по отдельности: вот синий, вот красный, вот длинный, вот короткий. Это детали. Но чтобы понять, что можно построить, нужно ответить на вопросы: "Сколько всего красных кирпичиков?", "Какова средняя длина кирпичиков в коробке?", "Сколько кирпичиков каждого цвета?".

Это уже не детали — это агрегаты, обобщения.

В SQL то же самое. Когда вы делаете `SELECT * FROM orders`, вы видите каждую строку — каждый заказ. Это детали. Но когда бизнес спрашивает: "Сколько всего заказов?", "Какова средняя сумма чека?", "Какая выручка по дням недели?" — вам нужны не детали, а агрегированные данные.

**Агрегация** — это процесс вычисления одного значения из набора строк. `COUNT` (количество), `SUM` (сумма), `AVG` (среднее), `MIN` (минимум), `MAX` (максимум) — это агрегатные функции.

**Группировка** (`GROUP BY`) — это механизм, который разбивает строки на группы по общему признаку, а затем применяет агрегацию к каждой группе отдельно.

Без агрегации и группировки вы можете ответить только на вопросы о конкретных записях. С ними — на вопросы о трендах, статистике и бизнес-показателях.

## Агрегатные функции

### COUNT — количество строк

```sql
-- Общее количество строк в таблице
SELECT COUNT(*) FROM users;

-- Количество непустых значений в колонке
SELECT COUNT(email) FROM users;

-- Количество уникальных значений
SELECT COUNT(DISTINCT city) FROM users;

-- COUNT с условием (через CASE)
SELECT COUNT(CASE WHEN age > 18 THEN 1 END) AS adults FROM users;
```

**Важно:** `COUNT(*)` считает все строки, включая NULL. `COUNT(column)` считает только строки, где column не NULL.

### SUM — сумма

```sql
-- Общая сумма заказов
SELECT SUM(amount) FROM orders;

-- Сумма заказов за январь
SELECT SUM(amount) FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';

-- Сумма с условием внутри SUM
SELECT SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_revenue FROM orders;
```

### AVG — среднее арифметическое

```sql
-- Средняя сумма заказа
SELECT AVG(amount) FROM orders;

-- Средняя сумма только завершенных заказов
SELECT AVG(amount) FROM orders WHERE status = 'completed';

-- AVG игнорирует NULL
SELECT AVG(rating) FROM reviews;  -- NULL не учитываются
```

### MIN / MAX — минимум и максимум

```sql
-- Минимальная и максимальная сумма заказа
SELECT MIN(amount), MAX(amount) FROM orders;

-- Самая ранняя и самая поздняя дата
SELECT MIN(created_at), MAX(created_at) FROM users;

-- Минимальная цена в каждой категории
SELECT category, MIN(price) FROM products GROUP BY category;
```

### Другие агрегатные функции

```sql
-- Стандартное отклонение (PostgreSQL)
SELECT STDDEV(amount) FROM orders;

-- Дисперсия
SELECT VARIANCE(amount) FROM orders;

-- Медиана (процентиль)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) FROM orders;

-- Первое значение (в порядке)
SELECT FIRST(amount) FROM orders;  -- некоторые СУБД

-- Последнее значение
SELECT LAST(amount) FROM orders;   -- некоторые СУБД

-- Строковая агрегация (объединение строк)
SELECT STRING_AGG(name, ', ') FROM users;  -- PostgreSQL
SELECT GROUP_CONCAT(name) FROM users;       -- MySQL
```

## GROUP BY: Группировка строк

`GROUP BY` собирает строки с одинаковыми значениями в группы, а затем агрегатные функции применяются к каждой группе отдельно.

### Простейшая группировка

```sql
-- Количество пользователей в каждом городе
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;

-- Средняя зарплата по отделам
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
```

### Группировка по нескольким колонкам

```sql
-- Количество заказов по дням и статусам
SELECT 
    DATE(created_at) AS order_date,
    status,
    COUNT(*) AS orders_count,
    SUM(amount) AS total_amount
FROM orders
GROUP BY DATE(created_at), status
ORDER BY order_date, status;
```

### Группировка с выражениями

```sql
-- По году и месяцу
SELECT 
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    COUNT(*) AS orders_count
FROM orders
GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at);

-- По возрастной группе
SELECT 
    CASE 
        WHEN age < 18 THEN 'under 18'
        WHEN age BETWEEN 18 AND 30 THEN '18-30'
        WHEN age BETWEEN 31 AND 50 THEN '31-50'
        ELSE '50+'
    END AS age_group,
    COUNT(*) AS user_count
FROM users
GROUP BY 
    CASE 
        WHEN age < 18 THEN 'under 18'
        WHEN age BETWEEN 18 AND 30 THEN '18-30'
        WHEN age BETWEEN 31 AND 50 THEN '31-50'
        ELSE '50+'
    END;
```

### Группировка с ROLLUP и CUBE

`ROLLUP` добавляет промежуточные итоги и общий итог.

```sql
-- Итоги по иерархии: год → месяц → день
SELECT 
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    EXTRACT(DAY FROM created_at) AS day,
    SUM(amount) AS total
FROM orders
GROUP BY ROLLUP(year, month, day);

-- Результат:
-- 2024, 1, 1, 1000
-- 2024, 1, 2, 1500
-- 2024, 1, NULL, 2500   ← итог за январь
-- 2024, 2, 1, 2000
-- 2024, 2, NULL, 2000   ← итог за февраль
-- 2024, NULL, NULL, 4500 ← общий итог
-- NULL, NULL, NULL, 4500 ← еще один уровень (если есть)
```

`CUBE` добавляет все возможные комбинации группировок.

```sql
-- Все комбинации: (город), (статус), (город, статус), ()
SELECT city, status, COUNT(*)
FROM users
GROUP BY CUBE(city, status);
```

## HAVING: Фильтрация групп

`WHERE` фильтрует строки ДО группировки. `HAVING` фильтрует группы ПОСЛЕ группировки.

```sql
-- Города, где больше 100 пользователей
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) > 100;

-- Отделы со средней зарплатой выше 50000
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 50000;

-- Статусы заказов, принесшие более 10000 выручки
SELECT status, SUM(amount) AS total
FROM orders
GROUP BY status
HAVING SUM(amount) > 10000;
```

### WHERE vs HAVING

```sql
-- WHERE фильтрует строки до группировки
-- HAVING фильтрует группы после группировки

-- Плохо: фильтрация по агрегату в WHERE (не сработает)
SELECT city, COUNT(*) FROM users 
WHERE COUNT(*) > 100  -- ОШИБКА! Нельзя использовать агрегат в WHERE
GROUP BY city;

-- Хорошо: HAVING для фильтрации агрегатов
SELECT city, COUNT(*) FROM users 
GROUP BY city 
HAVING COUNT(*) > 100;
```

**Порядок выполнения:**

1. `FROM` — определяем источник данных
2. `WHERE` — фильтруем строки
3. `GROUP BY` — группируем
4. `HAVING` — фильтруем группы
5. `SELECT` — выбираем колонки и вычисляем агрегаты
6. `ORDER BY` — сортируем
7. `LIMIT` — ограничиваем

## Практические примеры

### Пример 1: Продажи по месяцам

```sql
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS orders_count,
    SUM(amount) AS revenue,
    AVG(amount) AS avg_order_value,
    MIN(amount) AS min_order,
    MAX(amount) AS max_order
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

### Пример 2: Топ-10 клиентов по сумме покупок

```sql
SELECT 
    customer_id,
    COUNT(*) AS orders_count,
    SUM(amount) AS total_spent,
    AVG(amount) AS avg_order
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;
```

### Пример 3: Распределение заказов по часам

```sql
SELECT 
    EXTRACT(HOUR FROM created_at) AS hour,
    COUNT(*) AS orders_count,
    SUM(amount) AS revenue
FROM orders
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;
```

### Пример 4: Когортный анализ (выживаемость)

```sql
-- Первый заказ пользователя по месяцам
WITH first_orders AS (
    SELECT 
        customer_id,
        DATE_TRUNC('month', MIN(order_date)) AS cohort_month
    FROM orders
    GROUP BY customer_id
),
-- Заказы по месяцам относительно когорты
orders_by_cohort AS (
    SELECT 
        f.cohort_month,
        DATE_TRUNC('month', o.order_date) AS order_month,
        COUNT(DISTINCT o.customer_id) AS active_customers
    FROM first_orders f
    JOIN orders o ON f.customer_id = o.customer_id
    GROUP BY f.cohort_month, DATE_TRUNC('month', o.order_date)
)
SELECT 
    cohort_month,
    order_month,
    EXTRACT(MONTH FROM AGE(order_month, cohort_month)) AS month_number,
    active_customers
FROM orders_by_cohort
ORDER BY cohort_month, month_number;
```

### Пример 5: Группировка с условиями (CASE внутри агрегата)

```sql
-- Кросс-таблица: продажи по категориям и статусам
SELECT 
    category,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending_revenue,
    SUM(CASE WHEN status = 'cancelled' THEN amount ELSE 0 END) AS cancelled_revenue,
    SUM(amount) AS total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id
GROUP BY category;
```

### Пример 6: Фильтрация до и после группировки

```sql
-- Сначала фильтруем заказы за 2024 год, потом группируем по клиентам, 
-- потом оставляем только клиентов с суммой > 10000
SELECT 
    customer_id,
    SUM(amount) AS total
FROM orders
WHERE order_date >= '2024-01-01'      -- фильтр ДО группировки
GROUP BY customer_id
HAVING SUM(amount) > 10000;            -- фильтр ПОСЛЕ группировки
```

## Агрегация и NULL

Агрегатные функции по-разному обрабатывают NULL.

```sql
-- Данные: values = [100, NULL, 200, NULL, 300]

SELECT COUNT(*) FROM t;        -- 5 (считает все строки)
SELECT COUNT(val) FROM t;      -- 3 (игнорирует NULL)
SELECT SUM(val) FROM t;        -- 600 (игнорирует NULL)
SELECT AVG(val) FROM t;        -- 200 (600 / 3, не 600 / 5)
SELECT MIN(val) FROM t;        -- 100 (игнорирует NULL)
SELECT MAX(val) FROM t;        -- 300 (игнорирует NULL)

-- Если все значения NULL
SELECT SUM(val) FROM t WHERE val IS NULL;  -- NULL, не 0
SELECT COALESCE(SUM(val), 0) FROM t WHERE val IS NULL;  -- 0
```

## Фильтрация до агрегации (WHERE) vs после (HAVING)

```sql
-- Разные результаты!

-- WHERE: сначала фильтруем строки (только заказы > 1000), потом группируем
SELECT customer_id, COUNT(*) AS big_orders_count
FROM orders
WHERE amount > 1000
GROUP BY customer_id;

-- HAVING: сначала группируем, потом оставляем клиентов, у которых средний чек > 1000
SELECT customer_id, AVG(amount) AS avg_order
FROM orders
GROUP BY customer_id
HAVING AVG(amount) > 1000;
```

## Группировка по выражению

```sql
-- По первой букве фамилии
SELECT 
    LEFT(last_name, 1) AS first_letter,
    COUNT(*) AS count
FROM users
GROUP BY LEFT(last_name, 1)
ORDER BY first_letter;

-- По интервалу цен
SELECT 
    FLOOR(price / 1000) * 1000 AS price_range_start,
    FLOOR(price / 1000) * 1000 + 999 AS price_range_end,
    COUNT(*) AS products_count,
    AVG(price) AS avg_price
FROM products
GROUP BY FLOOR(price / 1000)
ORDER BY price_range_start;
```

## Многоуровневая группировка

```sql
-- Итоги по: регион → город → статус
SELECT 
    region,
    city,
    status,
    COUNT(*) AS count,
    SUM(amount) AS total
FROM orders
JOIN customers ON orders.customer_id = customers.id
GROUP BY region, city, status
ORDER BY region, city, status;
```

## Агрегация с DISTINCT

```sql
-- Количество уникальных клиентов, сделавших заказы
SELECT COUNT(DISTINCT customer_id) FROM orders;

-- Количество уникальных пар (клиент, товар)
SELECT COUNT(DISTINCT (customer_id, product_id)) FROM orders;

-- Сумма уникальных сумм (редко нужно)
SELECT SUM(DISTINCT amount) FROM orders;
```

## Распространенные ошибки

### Ошибка 1: Колонка не в GROUP BY и не в агрегации

```sql
-- Ошибка: name не в GROUP BY и не в агрегации
SELECT department, name, COUNT(*) FROM employees GROUP BY department;
-- Что делать с name? Взять первый? Последний? Сложить?

-- Правильно: либо добавить в GROUP BY
SELECT department, name, COUNT(*) FROM employees GROUP BY department, name;

-- Либо агрегировать
SELECT department, MIN(name) AS first_name, COUNT(*) FROM employees GROUP BY department;
```

### Ошибка 2: Использование алиаса в GROUP BY (не везде работает)

```sql
-- В PostgreSQL работает, в MySQL — нет
SELECT 
    DATE(created_at) AS order_date,
    COUNT(*) 
FROM orders 
GROUP BY order_date;  -- может не работать

-- Переносимый вариант
SELECT 
    DATE(created_at) AS order_date,
    COUNT(*) 
FROM orders 
GROUP BY DATE(created_at);
```

### Ошибка 3: Фильтрация агрегата в WHERE

```sql
-- Ошибка
SELECT department, AVG(salary) FROM employees 
WHERE AVG(salary) > 50000  -- Нельзя!
GROUP BY department;

-- Правильно
SELECT department, AVG(salary) FROM employees 
GROUP BY department 
HAVING AVG(salary) > 50000;
```

### Ошибка 4: COUNT(*) vs COUNT(column)

```sql
-- Разные результаты
SELECT COUNT(*) FROM users;        -- все строки
SELECT COUNT(email) FROM users;    -- только где email не NULL
```

### Ошибка 5: Группировка по слишком высокой кардинальности

```sql
-- Плохо: группировка по уникальному ID
SELECT order_id, COUNT(*) FROM order_items GROUP BY order_id;  -- бесполезно

-- Имело смысл
SELECT product_id, COUNT(*) FROM order_items GROUP BY product_id;
```

## Производительность агрегации

### Индексы и GROUP BY

```sql
-- Индекс помогает GROUP BY, если колонка индексирована
CREATE INDEX idx_orders_customer ON orders(customer_id);
SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id;  -- использует индекс

-- Индекс не поможет, если GROUP BY по выражению
SELECT DATE(created_at), COUNT(*) FROM orders GROUP BY DATE(created_at);
-- Нужен индекс на created_at, но GROUP BY по выражению — все равно сканирование
```

### Материализованные представления для тяжелых агрегаций

```sql
-- Создание материализованного представления для частых отчетов
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) AS sale_date,
    COUNT(*) AS orders_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_order_value
FROM orders
GROUP BY DATE(created_at);

-- Обновление (раз в час, раз в день)
REFRESH MATERIALIZED VIEW daily_sales_summary;
```

## Резюме для системного аналитика

1. **Агрегация** — вычисление одного значения из набора строк. `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` — основные агрегатные функции.

2. **Группировка (`GROUP BY`)** — разбивает строки на группы по общему признаку, агрегаты вычисляются для каждой группы отдельно.

3. **`WHERE` фильтрует строки до группировки, `HAVING` фильтрует группы после группировки.** `WHERE` — для отдельных записей, `HAVING` — для агрегированных показателей.

4. **Все колонки в `SELECT` (кроме агрегатов) должны быть в `GROUP BY`.** Иначе СУБД не поймет, что делать с этими колонками.

5. **NULL в агрегатах:** `COUNT(*)` считает NULL, `COUNT(column)` — нет. `SUM` и `AVG` игнорируют NULL. Если все значения NULL, `SUM` вернет NULL (не 0).

6. **ROLLUP и CUBE** добавляют промежуточные и общие итоги. ROLLUP для иерархий, CUBE для всех комбинаций.