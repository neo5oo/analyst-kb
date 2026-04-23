---
title: Оконные функции
weight: 50
draft: false
description: "Оконные функции (window functions) — вычисления над набором строк, связанных с текущей строкой, без сжатия результата (каждая строка остаётся). Отличие от GROUP BY: GROUP BY сворачивает группы в одну строку, оконные функции сохраняют все строки. Структура: функция() OVER (PARTITION BY ... ORDER BY ... ROWS/RANGE BETWEEN ...). Типы: агрегатные (SUM, AVG, COUNT как оконные), ранжирующие (ROW_NUMBER, RANK, DENSE_RANK, NTILE), смещения (LAG, LEAD, FIRST_VALUE, LAST_VALUE, NTH_VALUE). PARTITION BY — деление на группы (аналог GROUP BY для окна). ORDER BY — порядок строк (влияет на ранжирование и накопительные итоги). ROWS vs RANGE: ROWS — физические позиции строк, RANGE — логические значения (одинаковые значения ORDER BY в одной группе)."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что делают оконные функции?
    options:
    - Полностью заменяют GROUP BY
    - Маршрутизируют сообщения по очередям
    - Вычисляют значения по набору строк, не схлопывая результат в одну строку на группу
    - Создают внешние ключи
    correctIndex: 2
    explanation: Они позволяют считать ранги, суммы, лаги и другие аналитические показатели.
  - question: Когда оконные функции особенно полезны?
    options:
    - Когда требуется только вставить одну строку
    - Когда нужны ранжирование, бегущие итоги, lag/lead и аналитика по окну
    - Когда нужно зашифровать пароль
    - Когда настраивается CORS
    correctIndex: 1
    explanation: Это мощный инструмент аналитических запросов.
  - question: Чем оконная функция отличается от обычной агрегации?
    options:
    - Она всегда удаляет дубликаты
    - Она работает только в NoSQL
    - Она запрещает ORDER BY
    - Она оставляет строки результата, а не сворачивает их до одной строки на группу
    correctIndex: 3
    explanation: Это главное логическое отличие window functions.
  - question: Что важно учитывать в оконных функциях?
    options:
    - Partition by и order by внутри окна сильно влияют на смысл результата
    - Окно никогда не зависит от сортировки
    - Все оконные функции одинаковы
    - Они используются только в views
    correctIndex: 0
    explanation: Неправильно заданное окно меняет бизнес-смысл вычисления.
---
## Введение: Взгляд на строку в контексте

Представьте, что вы смотрите на таблицу с результатами экзаменов. Вы видите оценку каждого ученика. Но вам нужно ответить на вопросы: "Как эта оценка выглядит на фоне всего класса? Какой у ученика ранг? На сколько его оценка отличается от средней по школе?"

Обычный SQL позволяет вам ответить на эти вопросы, но ценой сложных запросов с подзапросами и самообъединениями. А что, если бы вы могли для каждой строки "видеть" другие строки вокруг нее, выполнять вычисления в контексте группы, не теряя при этом деталей каждой отдельной строки?

**Оконные функции (window functions)** — это именно такой инструмент. Они выполняют вычисления над набором строк, которые связаны с текущей строкой, но в отличие от GROUP BY, они не сворачивают строки в одну. Каждая строка остается в результате, и к ней добавляется результат оконного вычисления.

Оконные функции — это мост между детальными данными (каждая строка) и агрегированными (статистика по группам). Вы одновременно видите и кошку, и стаю целиком.

## Чем оконные функции отличаются от GROUP BY

Это ключевое различие, которое нужно понять.

**GROUP BY (агрегация с группировкой):**

```sql
-- Каждая группа превращается в одну строку
SELECT 
    department_id,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;

-- Результат: 3 строки (по одной на отдел)
-- Отдел 1 | 50000
-- Отдел 2 | 55000
-- Отдел 3 | 48000
-- Пропала информация о каждом сотруднике
```

**Оконная функция:**

```sql
-- Каждая строка остается, плюс добавляется вычисление по группе
SELECT 
    name,
    department_id,
    salary,
    AVG(salary) OVER (PARTITION BY department_id) AS avg_salary_by_dept
FROM employees;

-- Результат: все строки (каждый сотрудник)
-- Иванов  | Отдел 1 | 50000 | 50000
-- Петров  | Отдел 1 | 60000 | 50000
-- Сидоров | Отдел 2 | 55000 | 55000
-- У каждой строки появилась средняя зарплата по ее отделу
```

| Характеристика | GROUP BY | Оконные функции |
| :--- | :--- | :--- |
| **Количество строк в результате** | Одна на группу | Все строки исходной таблицы |
| **Потеря детальных данных** | Да (только агрегаты) | Нет (детали + агрегаты) |
| **Что можно вычислить** | Агрегаты | Агрегаты, ранги, смещения, накопительные итоги |
| **Синтаксис** | `GROUP BY` | `OVER()` |

## Базовая структура оконной функции

Оконная функция состоит из трех ключевых компонентов:

```sql
function_name(...) OVER (
    PARTITION BY column1, column2, ...   -- Деление на группы (как GROUP BY)
    ORDER BY column1, column2, ...       -- Порядок строк внутри группы
    ROWS | RANGE BETWEEN ... AND ...     -- Окно (какие строки включить)
)
```

### Компоненты оконной функции

| Компонент | Что делает | Обязательность |
| :--- | :--- | :--- |
| **Функция** | Что вычислять (SUM, AVG, ROW_NUMBER, RANK, LAG, LEAD и др.) | Обязательна |
| **PARTITION BY** | Делит данные на группы. Функция вычисляется отдельно в каждой группе | Опционально (без PARTITION BY — вся таблица одна группа) |
| **ORDER BY** | Определяет порядок строк внутри группы. Влияет на функции ранжирования и окна | Опционально (но для многих функций необходим) |
| **ROWS/RANGE** | Определяет, какие строки включить в вычисление относительно текущей строки | Опционально (по умолчанию — все строки от начала до текущей при ORDER BY) |

### Простейший пример

```sql
-- Вычислить среднюю зарплату по всем сотрудникам (одна группа)
SELECT 
    name,
    salary,
    AVG(salary) OVER () AS overall_avg_salary
FROM employees;

-- Результат: у каждой строки одна и та же общая средняя
-- Иванов  | 50000 | 52500
-- Петров  | 60000 | 52500
-- Сидоров | 45000 | 52500
-- Смирнов | 55000 | 52500
```

## Классификация оконных функций

### Агрегатные функции как оконные

Любая агрегатная функция (SUM, AVG, COUNT, MIN, MAX) может использоваться как оконная.

```sql
SELECT 
    order_id,
    customer_id,
    amount,
    SUM(amount) OVER (PARTITION BY customer_id) AS customer_total,
    AVG(amount) OVER (PARTITION BY customer_id) AS customer_avg,
    COUNT(*) OVER (PARTITION BY customer_id) AS customer_order_count,
    MIN(amount) OVER (PARTITION BY customer_id) AS customer_min,
    MAX(amount) OVER (PARTITION BY customer_id) AS customer_max
FROM orders;
```

### Функции ранжирования (Ranking Functions)

| Функция | Описание | Пример результата |
| :--- | :--- | :--- |
| `ROW_NUMBER()` | Уникальный номер строки в группе (без пропусков, уникален) | 1,2,3,4,5 |
| `RANK()` | Ранг с пропусками при совпадении | 1,2,2,4,5 |
| `DENSE_RANK()` | Ранг без пропусков при совпадении | 1,2,2,3,4 |
| `NTILE(n)` | Делит строки на n примерно равных групп | 1,1,2,2,3,3 |

```sql
SELECT 
    name,
    department,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank,
    NTILE(4) OVER (PARTITION BY department ORDER BY salary DESC) AS quartile
FROM employees;
```

### Функции смещения (Offset Functions)

| Функция | Описание |
| :--- | :--- |
| `LAG(column, offset, default)` | Значение из строки, отстоящей на offset строк НАЗАД |
| `LEAD(column, offset, default)` | Значение из строки, отстоящей на offset строк ВПЕРЕД |
| `FIRST_VALUE(column)` | Значение из первой строки окна |
| `LAST_VALUE(column)` | Значение из последней строки окна |
| `NTH_VALUE(column, n)` | Значение из n-й строки окна |

```sql
SELECT 
    date,
    amount,
    LAG(amount, 1, 0) OVER (ORDER BY date) AS previous_day_amount,
    LEAD(amount, 1, 0) OVER (ORDER BY date) AS next_day_amount,
    amount - LAG(amount, 1, 0) OVER (ORDER BY date) AS day_over_day_change,
    FIRST_VALUE(amount) OVER (ORDER BY date) AS first_amount,
    LAST_VALUE(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_amount
FROM daily_sales;
```

### Накопительные и скользящие агрегаты

Используя ROWS/RANGE, можно создавать накопительные и скользящие окна.

```sql
SELECT 
    date,
    amount,
    -- Накопительный итог (от начала до текущей строки)
    SUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS running_total,
    -- Скользящее среднее за 7 дней (текущий + 3 дня назад + 3 дня вперед)
    AVG(amount) OVER (ORDER BY date ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING) AS moving_avg_7d,
    -- Только предыдущие 3 дня
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING) AS prev_3_days_sum
FROM daily_sales;
```

## PARTITION BY: Деление на группы

`PARTITION BY` работает как "GROUP BY для оконных функций". Оно делит данные на логические группы, и функция вычисляется отдельно в каждой группе.

```sql
-- Без PARTITION BY (одна группа — вся таблица)
SELECT 
    name,
    department,
    salary,
    AVG(salary) OVER () AS company_avg  -- 52500 для всех
FROM employees;

-- С PARTITION BY (группировка по отделам)
SELECT 
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg  -- своя средняя для каждого отдела
FROM employees;
```

**Результат:**

| name | department | salary | dept_avg |
| :--- | :--- | :--- | :--- |
| Иванов | IT | 90000 | 85000 |
| Петров | IT | 80000 | 85000 |
| Сидоров | Sales | 60000 | 65000 |
| Смирнов | Sales | 70000 | 65000 |

Можно использовать несколько столбцов в PARTITION BY:

```sql
SELECT 
    order_id,
    year,
    month,
    amount,
    AVG(amount) OVER (PARTITION BY year, month) AS monthly_avg
FROM orders;
```

## ORDER BY в оконных функциях

`ORDER BY` внутри `OVER()` определяет порядок строк в окне. Для разных типов функций он имеет разное значение.

### Для функций ранжирования (ROW_NUMBER, RANK, DENSE_RANK)

ORDER BY определяет порядок, в котором назначаются ранги.

```sql
SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS salary_rank
FROM employees;

-- Самый высокооплачиваемый получает ранг 1
```

### Для агрегатных функций с ROWS/RANGE

ORDER BY определяет, как накапливается агрегат.

```sql
-- Без ORDER BY: агрегат по всей группе (одинаков для всех строк)
SELECT 
    date,
    amount,
    SUM(amount) OVER () AS total  -- 1000 для всех строк
FROM sales;

-- С ORDER BY: накопительный итог
SELECT 
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total  -- растет с каждой датой
FROM sales;
```

### Важное различие: ORDER BY без ROWS

В большинстве СУБД, если вы используете `ORDER BY` без явного указания `ROWS` или `RANGE`, используется окно по умолчанию: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Это означает "все строки от начала до текущей".

```sql
-- Эти два выражения эквивалентны
SUM(amount) OVER (ORDER BY date)
SUM(amount) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

## ROWS и RANGE: Определение границ окна

Это самая сложная, но и самая мощная часть оконных функций. Она позволяет точно определить, какие строки включать в вычисление.

### Синтаксис

```sql
ROWS | RANGE BETWEEN start AND end
```

### Границы окна

| Граница | Значение |
| :--- | :--- |
| `UNBOUNDED PRECEDING` | Все строки от начала группы |
| `n PRECEDING` | n строк перед текущей |
| `CURRENT ROW` | Текущая строка |
| `n FOLLOWING` | n строк после текущей |
| `UNBOUNDED FOLLOWING` | Все строки до конца группы |

### ROWS vs RANGE

| Ключевое слово | Что считается "строкой" |
| :--- | :--- |
| **ROWS** | Физические строки. Ориентируется на позицию строки в сортировке |
| **RANGE** | Логические значения. Включает все строки с одинаковым значением ORDER BY |

**Пример различия:**

```sql
-- Данные
-- date       | amount
-- 2024-01-01 | 100
-- 2024-01-01 | 200
-- 2024-01-02 | 300

-- ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
-- Для второй строки (2024-01-01, 200): включает предыдущую строку (100)
-- Для третьей строки (2024-01-02, 300): включает предыдущую строку (200)

-- RANGE BETWEEN 1 PRECEDING AND CURRENT ROW (при ORDER BY date)
-- Для строк 2024-01-01: включает все строки с date >= 2023-12-31 (только эти же строки)
-- Для строки 2024-01-02: включает все строки с date >= 2024-01-01 (все три строки)
```

### Практические примеры окон

```sql
SELECT 
    date,
    amount,
    
    -- Накопительный итог от начала до текущей строки
    SUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS running_total,
    
    -- Скользящее среднее за 3 дня (текущий + предыдущий + следующий)
    AVG(amount) OVER (ORDER BY date ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg_3d,
    
    -- Сумма за 7 дней до текущей (исключая текущий)
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS prev_7_days,
    
    -- Сумма от начала группы до конца (окно "все строки")
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS total,
    
    -- Сумма только текущей строки и двух следующих
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING) AS current_and_next_2
    
FROM daily_sales
ORDER BY date;
```

## Функции смещения: LAG и LEAD

`LAG` и `LEAD` позволяют "заглянуть" на соседние строки без самообъединения таблицы.

### Базовое использование

```sql
SELECT 
    date,
    amount,
    LAG(amount) OVER (ORDER BY date) AS prev_amount,        -- предыдущее значение
    LEAD(amount) OVER (ORDER BY date) AS next_amount,      -- следующее значение
    amount - LAG(amount) OVER (ORDER BY date) AS change,   -- изменение
    CASE 
        WHEN amount > LAG(amount) OVER (ORDER BY date) THEN 'up'
        WHEN amount < LAG(amount) OVER (ORDER BY date) THEN 'down'
        ELSE 'same'
    END AS trend
FROM daily_sales;
```

### С параметром offset

```sql
SELECT 
    date,
    amount,
    LAG(amount, 3) OVER (ORDER BY date) AS amount_3_days_ago,    -- 3 дня назад
    LEAD(amount, 7) OVER (ORDER BY date) AS amount_7_days_ahead  -- через 7 дней
FROM daily_sales;
```

### С значением по умолчанию

```sql
SELECT 
    date,
    amount,
    LAG(amount, 1, 0) OVER (ORDER BY date) AS prev_amount,  -- 0 для первой строки
    LEAD(amount, 1, 0) OVER (ORDER BY date) AS next_amount  -- 0 для последней строки
FROM daily_sales;
```

### С PARTITION BY

```sql
-- Сравнение с предыдущим заказом того же клиента
SELECT 
    order_id,
    customer_id,
    order_date,
    amount,
    LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_customer_amount,
    amount - LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS change_from_prev
FROM orders;
```

## Функции FIRST_VALUE, LAST_VALUE, NTH_VALUE

Эти функции позволяют получить значение из определенной позиции в окне.

### FIRST_VALUE и LAST_VALUE

```sql
SELECT 
    department,
    name,
    salary,
    FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC) AS highest_paid,
    LAST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_paid
FROM employees;
```

**Важное примечание о LAST_VALUE:**

По умолчанию окно заканчивается на `CURRENT ROW`, поэтому `LAST_VALUE` без явного указания `UNBOUNDED FOLLOWING` вернет текущую строку, а не последнюю в группе.

```sql
-- Неправильно (вернет текущую строку)
LAST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC) AS wrong

-- Правильно
LAST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC 
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS correct
```

### NTH_VALUE

```sql
-- Вторая по величине зарплата в каждом отделе
SELECT 
    department,
    name,
    salary,
    NTH_VALUE(salary, 2) OVER (PARTITION BY department ORDER BY salary DESC 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS second_highest_salary
FROM employees;
```

## Практические примеры использования

### Пример 1: Поиск дубликатов

```sql
-- Найти дублирующиеся email
SELECT 
    id,
    name,
    email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
FROM users
WHERE rn > 1;  -- Для фильтрации нужен подзапрос, так как оконные функции нельзя в WHERE
```

```sql
-- С подзапросом
SELECT * FROM (
    SELECT 
        id,
        name,
        email,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM users
) t
WHERE rn > 1;
```

### Пример 2: Удаление дубликатов (сохранение одной строки)

```sql
-- В PostgreSQL (через CTE)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM users
)
DELETE FROM users
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
```

### Пример 3: Процент от общего

```sql
SELECT 
    product_id,
    sales_amount,
    sales_amount / SUM(sales_amount) OVER () * 100 AS percentage_of_total
FROM monthly_sales
WHERE year = 2024;
```

### Пример 4: Процент от категории

```sql
SELECT 
    product_id,
    category,
    sales_amount,
    sales_amount / SUM(sales_amount) OVER (PARTITION BY category) * 100 AS percentage_in_category
FROM monthly_sales
WHERE year = 2024;
```

### Пример 5: Кумулятивная сумма по месяцам

```sql
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    SUM(amount) AS monthly_amount,
    SUM(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', order_date)) AS cumulative_amount
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

### Пример 6: Сравнение с предыдущим периодом

```sql
SELECT 
    month,
    amount,
    LAG(amount) OVER (ORDER BY month) AS prev_month_amount,
    ((amount - LAG(amount) OVER (ORDER BY month)) / LAG(amount) OVER (ORDER BY month)) * 100 AS growth_percent
FROM monthly_sales;
```

### Пример 7: Топ-3 по каждому отделу

```sql
SELECT * FROM (
    SELECT 
        department,
        name,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) t
WHERE rn <= 3;
```

### Пример 8: Скользящая медиана

```sql
-- В PostgreSQL (с percentile_cont)
SELECT 
    date,
    amount,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) 
        OVER (ORDER BY date ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING) AS median_7d
FROM daily_sales;
```

### Пример 9: Заполнение пропусков (интерполяция)

```sql
-- Если в daily_sales есть пропущенные даты, заполняем последним известным значением
SELECT 
    date,
    COALESCE(amount, LAST_VALUE(amount IGNORE NULLS) OVER (ORDER BY date)) AS filled_amount
FROM daily_sales;
```

## Порядок выполнения запроса с оконными функциями

Понимание порядка выполнения SQL-запроса критически важно для правильного использования оконных функций.

```sql
SELECT 
    column1,
    column2,
    ROW_NUMBER() OVER (ORDER BY column3) AS rn
FROM table1
WHERE column1 > 100
GROUP BY column1, column2
HAVING COUNT(*) > 1
ORDER BY column3;
```

**Порядок выполнения:**

1. **FROM** — определяет исходные данные
2. **WHERE** — фильтрация строк
3. **GROUP BY** — группировка
4. **HAVING** — фильтрация групп
5. **Оконные функции** — вычисляются ПОСЛЕ GROUP BY и HAVING
6. **SELECT** — вычисление выражений
7. **DISTINCT** — удаление дубликатов
8. **ORDER BY** — сортировка результата
9. **LIMIT/OFFSET** — ограничение количества строк

**Важные следствия:**

- Оконные функции не могут быть в WHERE (потому что WHERE выполняется раньше)
- Оконные функции могут использовать результат GROUP BY
- Для фильтрации по результату оконной функции нужен подзапрос или CTE

```sql
-- Это НЕ работает
SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
FROM employees
WHERE rn <= 10;  -- Ошибка! Оконная функция недоступна в WHERE

-- Это работает
SELECT * FROM (
    SELECT 
        name,
        salary,
        ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
    FROM employees
) t
WHERE rn <= 10;
```

## Оконные функции в разных СУБД

### PostgreSQL

- Поддерживает все стандартные оконные функции
- Дополнительные: `PERCENT_RANK`, `CUME_DIST`
- Поддерживает `FILTER` внутри оконных функций

```sql
-- FILTER позволяет включать только определенные строки
SELECT 
    department,
    SUM(salary) FILTER (WHERE position = 'manager') OVER (PARTITION BY department) AS managers_total
FROM employees;
```

### SQL Server

- Поддерживает все стандартные оконные функции
- Дополнительные: `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`
- Ограничение: `ORDER BY` в оконной функции обязателен для `ROWS/RANGE`

### MySQL (начиная с 8.0)

- Полная поддержка оконных функций (до 8.0 их не было)
- Поддерживает стандартные функции: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`

### Oracle

- Очень богатая поддержка оконных функций
- Дополнительные возможности: `MODEL` clause для более сложных вычислений
- Поддержка `WINDOW` clause для повторного использования определений окон

```sql
-- WINDOW clause для повторного использования
SELECT 
    date,
    amount,
    SUM(amount) OVER w AS running_total,
    AVG(amount) OVER w AS running_avg
FROM daily_sales
WINDOW w AS (ORDER BY date ROWS UNBOUNDED PRECEDING);
```

## Производительность оконных функций

### Когда оконные функции эффективны

| Сценарий | Почему эффективны |
| :--- | :--- |
| Замена самообъединений (self-join) для доступа к соседним строкам | Один проход вместо двух |
| Замена подзапросов с агрегацией | Не нужно повторное чтение таблицы |
| Накопительные итоги | Один проход данных |
| Ранжирование внутри групп | Эффективнее, чем переменные и курсоры |

### Когда оконные функции могут быть медленными

- Огромные окна (`UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`) требуют хранения всех строк в памяти
- Сложные `ORDER BY` в окнах требуют сортировки
- Несколько оконных функций с разными `PARTITION BY` могут требовать нескольких сортировок

```sql
-- Плохо: разные PARTITION BY требуют разных сортировок
SELECT 
    *,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary) AS rn1,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY salary) AS rn2
FROM employees;
-- Возможно, две сортировки

-- Лучше: одинаковый PARTITION BY, одна сортировка
SELECT 
    *,
    ROW_NUMBER() OVER w AS rn1,
    RANK() OVER w AS rn2
FROM employees
WINDOW w AS (PARTITION BY department ORDER BY salary);
```

### Советы по оптимизации

1. **Используйте индексы** для столбцов в `PARTITION BY` и `ORDER BY`
2. **Ограничивайте размер окна** там, где это возможно (например, `ROWS BETWEEN 7 PRECEDING AND CURRENT ROW` вместо `UNBOUNDED PRECEDING`)
3. **Используйте подзапросы для фильтрации** после оконных функций, а не пытайтесь фильтровать в WHERE
4. **В PostgreSQL** материализованные представления могут помочь с повторяющимися сложными оконными вычислениями

## Распространенные ошибки

### Ошибка 1: Использование оконных функций в WHERE

```sql
-- Ошибка
SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
FROM employees
WHERE rn <= 10;

-- Исправление
SELECT * FROM (
    SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
    FROM employees
) t
WHERE rn <= 10;
```

### Ошибка 2: Забывать про UNBOUNDED FOLLOWING для LAST_VALUE

```sql
-- Ошибка: LAST_VALUE вернет текущую строку
SELECT 
    name,
    salary,
    LAST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary) AS lowest_salary
FROM employees;

-- Исправление
SELECT 
    name,
    salary,
    LAST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_salary
FROM employees;
```

### Ошибка 3: Неправильное понимание RANGE

```sql
-- Может дать неожиданные результаты при одинаковых значениях ORDER BY
SELECT 
    date,
    amount,
    SUM(amount) OVER (ORDER BY date RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) AS range_sum
FROM sales;
-- При одинаковых датах включит все строки с этой датой
```

### Ошибка 4: Использование DISTINCT с оконными функциями

```sql
-- DISTINCT применяется ПОСЛЕ оконных функций
SELECT DISTINCT
    department,
    ROW_NUMBER() OVER (ORDER BY department) AS rn
FROM employees;
-- rn будет случайным, а не 1,2,3
```

### Ошибка 5: Путать ROW_NUMBER и RANK

```sql
-- ROW_NUMBER дает уникальные номера (1,2,3,4,5)
-- RANK дает ранги с пропусками (1,2,2,4,5)
-- Выбирайте нужный в зависимости от бизнес-требований
```

## Резюме для системного аналитика

1. **Оконные функции выполняют вычисления над набором строк, связанных с текущей строкой, без сжатия результата.** Каждая строка остается, и к ней добавляется вычисленное значение.

2. **Ключевое отличие от GROUP BY:** GROUP BY сворачивает группы в одну строку, оконные функции сохраняют все строки.

3. **Основные типы оконных функций:**
   - **Агрегатные:** SUM, AVG, COUNT, MIN, MAX
   - **Ранжирующие:** ROW_NUMBER, RANK, DENSE_RANK, NTILE
   - **Смещения:** LAG, LEAD, FIRST_VALUE, LAST_VALUE, NTH_VALUE

4. **Структура оконной функции:** `функция() OVER (PARTITION BY ... ORDER BY ... ROWS/RANGE BETWEEN ...)`. PARTITION BY делит на группы, ORDER BY определяет порядок, ROWS/RANGE определяет границы окна.

5. **Порядок выполнения SQL:** оконные функции вычисляются после WHERE, GROUP BY, HAVING, но до ORDER BY и LIMIT. Поэтому для фильтрации по результату оконной функции нужен подзапрос.

6. **ROWS vs RANGE:** ROWS оперирует физическими позициями строк, RANGE — логическими значениями (все строки с одинаковым значением ORDER BY считаются одной группой).

7. **Производительность:** оконные функции обычно эффективнее самообъединений и подзапросов, но могут потреблять много памяти при больших окнах. Одинаковые PARTITION BY лучше выносить в WINDOW clause.