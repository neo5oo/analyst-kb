---
title: Подзапросы
weight: 50
draft: false
description: Подзапросы (subquery) — SQL-запросы, вложенные в другие запросы (SELECT, FROM, WHERE, HAVING, JOIN, UPDATE, DELETE).
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что такое подзапрос?
    options:
    - Только комментарий в SQL
    - Тип индекса B-tree
    - SQL-запрос, вложенный внутрь другого запроса
    - Механизм replication
    correctIndex: 2
    explanation: Подзапросы помогают строить более сложную логику отбора и вычислений.
  - question: Когда подзапрос особенно полезен?
    options:
    - Когда нужно только создать таблицу
    - Когда нужно использовать результат одного запроса как часть другого
    - Когда важен только UI-дизайн
    - Когда сообщения идут через DLQ
    correctIndex: 1
    explanation: Подзапросы часто участвуют в фильтрации и вычислении промежуточных результатов.
  - question: Что важно учитывать в подзапросах?
    options:
    - Подзапрос всегда лучший выбор
    - Подзапрос запрещает использование WHERE
    - Подзапрос нельзя использовать в SELECT
    - Читаемость и производительность по сравнению с альтернативами вроде JOIN или CTE
    correctIndex: 3
    explanation: Не каждый подзапрос одинаково удачен по плану выполнения.
  - question: Что такое коррелированный подзапрос?
    options:
    - Подзапрос, который зависит от текущей строки внешнего запроса
    - Подзапрос, который всегда выполняется один раз
    - Подзапрос только для DDL
    - Подзапрос без FROM
    correctIndex: 0
    explanation: Такие конструкции мощные, но иногда дорогие по производительности.
---
## Введение: Вопрос внутри вопроса

Представьте, что вы хотите найти самых высокооплачиваемых сотрудников в каждом отделе. Вы не можете просто сказать: "Дай мне тех, у кого зарплата максимальна в своем отделе". Потому что "максимальна" — это понятие относительное. Максимальная зарплата в отделе продаж отличается от максимальной зарплаты в IT.

Вам нужно сначала вычислить максимальную зарплату по каждому отделу, а потом найти сотрудников, у которых зарплата равна этой максимальной.

**Подзапрос (subquery)** — это SQL запрос, вложенный внутрь другого SQL запроса. Это как вопрос внутри вопроса. Внешний запрос использует результат внутреннего для фильтрации, вычислений или проверки существования.

Подзапросы позволяют выразить сложную логику, которую невозможно (или очень сложно) выразить одним простым запросом. Они могут использоваться в `SELECT`, `FROM`, `WHERE`, `HAVING`, `JOIN` и даже в `UPDATE`, `DELETE`.

## Виды подзапросов

| Вид | Возвращает | Где используется | Пример |
| :--- | :--- | :--- | :--- |
| **Скалярный** | Одно значение (одна строка, одна колонка) | SELECT, WHERE, HAVING | `WHERE salary > (SELECT AVG(salary) ...)` |
| **Строковый** | Одну строку (несколько колонок) | SELECT, WHERE (с конструкциями) | `WHERE (name, age) = (SELECT ...)` |
| **Табличный** | Таблицу (много строк, много колонок) | FROM, JOIN | `FROM (SELECT ...) AS sub` |
| **Существования** | TRUE/FALSE (есть ли строки) | WHERE EXISTS / NOT EXISTS | `WHERE EXISTS (SELECT 1 ...)` |

## Скалярные подзапросы (одно значение)

Возвращают ровно одно значение (одну строку с одной колонкой). Используются там, где ожидается одно значение.

### В SELECT

```sql
-- Добавить колонку с максимальной зарплатой к каждой строке
SELECT 
    name,
    salary,
    (SELECT MAX(salary) FROM employees) AS max_salary,
    ROUND(salary / (SELECT MAX(salary) FROM employees) * 100, 2) AS pct_of_max
FROM employees;

-- Вычислить долю от общего
SELECT 
    name,
    salary,
    salary / (SELECT SUM(salary) FROM employees) * 100 AS pct_of_total
FROM employees;
```

### В WHERE

```sql
-- Сотрудники с зарплатой выше средней
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Товары дороже средней цены в своей категории
SELECT name, price, category
FROM products p1
WHERE price > (SELECT AVG(price) FROM products p2 WHERE p2.category = p1.category);
```

### В HAVING

```sql
-- Отделы, где максимальная зарплата выше средней по всем отделам
SELECT 
    department,
    MAX(salary) AS max_salary
FROM employees
GROUP BY department
HAVING MAX(salary) > (SELECT AVG(salary) FROM employees);
```

## Строковые подзапросы (одна строка)

Возвращают одну строку с несколькими колонками.

```sql
-- Найти сотрудника, который зарабатывает столько же, сколько Иванов
SELECT name, salary, department
FROM employees
WHERE (salary, department) = (
    SELECT salary, department 
    FROM employees 
    WHERE name = 'Иванов'
);
```

## Табличные подзапросы (много строк)

Возвращают таблицу (много строк, много колонок). Используются в `FROM` и `JOIN`.

### В FROM (производная таблица)

```sql
-- Средняя зарплата по отделам с фильтром по количеству
SELECT 
    department,
    avg_salary
FROM (
    SELECT 
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees
    GROUP BY department
) dept_stats
WHERE emp_count > 5
ORDER BY avg_salary DESC;

-- Ранжирование с использованием производной таблицы
SELECT 
    name,
    salary,
    rank
FROM (
    SELECT 
        name,
        salary,
        RANK() OVER (ORDER BY salary DESC) AS rank
    FROM employees
) ranked
WHERE rank <= 10;
```

### В JOIN

```sql
-- JOIN с агрегированным подзапросом
SELECT 
    e.name,
    e.salary,
    e.department,
    dept_stats.avg_salary,
    e.salary - dept_stats.avg_salary AS diff_from_avg
FROM employees e
JOIN (
    SELECT 
        department,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) dept_stats ON e.department = dept_stats.department;

-- JOIN с подзапросом, который использует внешний запрос (коррелированный)
-- Пример будет в разделе коррелированных подзапросов
```

## Подзапросы с IN / NOT IN

Проверяют, входит ли значение в набор, возвращаемый подзапросом.

```sql
-- Клиенты, у которых есть заказы
SELECT name, email
FROM customers
WHERE id IN (SELECT DISTINCT customer_id FROM orders);

-- Клиенты, у которых НЕТ заказов
SELECT name, email
FROM customers
WHERE id NOT IN (SELECT DISTINCT customer_id FROM orders);

-- Сотрудники, работающие в отделах с бюджетом > 1000000
SELECT name, salary
FROM employees
WHERE department_id IN (
    SELECT id 
    FROM departments 
    WHERE budget > 1000000
);
```

### Осторожно: NULL в IN / NOT IN

```sql
-- Если подзапрос возвращает NULL, NOT IN работает неожиданно
SELECT name FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
-- Если в orders есть хоть один NULL в customer_id, результат будет пустым!
-- Потому что NOT IN (1, 2, NULL) всегда FALSE (NULL нельзя сравнить)

-- Безопасная альтернатива
SELECT name FROM customers
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id);
```

## Подзапросы с EXISTS / NOT EXISTS

Проверяют, возвращает ли подзапрос хотя бы одну строку.

```sql
-- Клиенты, у которых есть заказы
SELECT name, email
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- Клиенты, у которых НЕТ заказов
SELECT name, email
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- Отделы, в которых есть сотрудники старше 50 лет
SELECT name
FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.department_id = d.id AND e.age > 50
);
```

### EXISTS vs IN

| Характеристика | EXISTS | IN |
| :--- | :--- | :--- |
| **Возвращает** | TRUE/FALSE | Набор значений |
| **Остановка при первом совпадении** | Да (может быть быстрее) | Нет (собирает все значения) |
| **Работа с NULL** | Безопасно | NOT IN может дать неверный результат |
| **Когда быстрее** | При больших подзапросах | При маленьком подзапросе |
| **Коррелированность** | Часто коррелированный | Обычно некоррелированный |

```sql
-- EXISTS часто эффективнее для проверки существования
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.amount > 1000);

-- IN может быть эффективнее для маленького подзапроса
SELECT * FROM employees
WHERE department_id IN (10, 20, 30);
```

## Коррелированные подзапросы

Коррелированный подзапрос ссылается на колонки из внешнего запроса. Он выполняется для каждой строки внешнего запроса.

```sql
-- Сотрудники, зарабатывающие выше среднего в своем отделе
SELECT name, salary, department
FROM employees e1
WHERE salary > (
    SELECT AVG(salary) 
    FROM employees e2 
    WHERE e2.department = e1.department  -- связь с внешним запросом
);

-- Товары, цена которых выше средней в своей категории
SELECT name, price, category
FROM products p1
WHERE price > (
    SELECT AVG(price) 
    FROM products p2 
    WHERE p2.category = p1.category
);

-- Заказы, у которых сумма больше средней суммы заказов этого клиента
SELECT order_id, customer_id, amount
FROM orders o1
WHERE amount > (
    SELECT AVG(amount) 
    FROM orders o2 
    WHERE o2.customer_id = o1.customer_id
);
```

### Коррелированный подзапрос в SELECT

```sql
-- Для каждого сотрудника — его место в рейтинге отдела
SELECT 
    name,
    salary,
    department,
    (
        SELECT COUNT(*) + 1
        FROM employees e2
        WHERE e2.department = e1.department 
          AND e2.salary > e1.salary
    ) AS rank_in_department
FROM employees e1
ORDER BY department, rank_in_department;
```

## Подзапросы с ANY / SOME / ALL

Сравнение значения с набором значений, возвращаемых подзапросом.

| Оператор | Значение |
| :--- | :--- |
| `= ANY` | Равен хотя бы одному (то же, что IN) |
| `> ANY` | Больше хотя бы одного (больше минимального) |
| `< ANY` | Меньше хотя бы одного (меньше максимального) |
| `> ALL` | Больше всех (больше максимального) |
| `< ALL` | Меньше всех (меньше минимального) |

```sql
-- Сотрудники, зарабатывающие больше, чем кто-то из отдела 10 (больше минимальной зарплаты)
SELECT name, salary
FROM employees
WHERE salary > ANY (SELECT salary FROM employees WHERE department = 10);

-- Сотрудники, зарабатывающие больше всех в отделе 10 (больше максимальной)
SELECT name, salary
FROM employees
WHERE salary > ALL (SELECT salary FROM employees WHERE department = 10);

-- Эквивалентно
SELECT name, salary
FROM employees
WHERE salary > (SELECT MAX(salary) FROM employees WHERE department = 10);
```

## Подзапросы в UPDATE и DELETE

```sql
-- Обновить зарплату сотрудников, у которых нет заказов
UPDATE employees
SET salary = salary * 1.1
WHERE id IN (
    SELECT employee_id 
    FROM employee_orders 
    GROUP BY employee_id
    HAVING COUNT(*) = 0
);

-- Удалить клиентов без заказов (коррелированный)
DELETE FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- PostgreSQL: обновление с подзапросом
UPDATE employees e
SET department_name = (
    SELECT name FROM departments d WHERE d.id = e.department_id
);
```

## Сравнение подзапросов и JOIN

Многие подзапросы можно переписать через JOIN. У каждого подхода есть преимущества.

### IN / EXISTS vs JOIN

```sql
-- Через IN
SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders);

-- Через JOIN (может дать дубликаты, нужен DISTINCT)
SELECT DISTINCT c.name FROM customers c JOIN orders o ON c.id = o.customer_id;

-- Через EXISTS (часто самый эффективный)
SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

### Подзапрос в SELECT vs LEFT JOIN

```sql
-- Через подзапрос
SELECT 
    name,
    (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count
FROM customers;

-- Через LEFT JOIN + GROUP BY
SELECT 
    c.name,
    COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
```

### Когда подзапрос лучше JOIN

| Сценарий | Почему подзапрос лучше |
| :--- | :--- |
| **Нужно агрегированное значение** | Подзапрос в SELECT чище и понятнее |
| **Проверка существования (EXISTS)** | Может остановиться на первом совпадении |
| **Сравнение с агрегатом** | `WHERE salary > (SELECT AVG(...))` — JOIN сложно выразить |
| **Иерархические данные** | Рекурсивные подзапросы (WITH RECURSIVE) |

### Когда JOIN лучше подзапроса

| Сценарий | Почему JOIN лучше |
| :--- | :--- |
| **Нужны колонки из обеих таблиц** | JOIN естественнее |
| **Подзапрос выполняется много раз** | JOIN может быть оптимизирован лучше |
| **Подзапрос в FROM** | Часто можно заменить на JOIN |
| **Большие данные** | Оптимизатор JOIN обычно умнее |

## CTE (Common Table Expressions) — именованные подзапросы

CTE — это способ дать подзапросу имя и использовать его как "временную таблицу" в рамках одного запроса.

```sql
-- Без CTE (запутанно)
SELECT 
    department,
    avg_salary
FROM (
    SELECT 
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees
    GROUP BY department
) dept_stats
WHERE emp_count > 5;

-- С CTE (читаемо)
WITH dept_stats AS (
    SELECT 
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees
    GROUP BY department
)
SELECT department, avg_salary
FROM dept_stats
WHERE emp_count > 5;
```

### Несколько CTE

```sql
WITH dept_stats AS (
    SELECT 
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees
    GROUP BY department
),
company_stats AS (
    SELECT 
        AVG(salary) AS company_avg,
        COUNT(*) AS total_employees
    FROM employees
)
SELECT 
    d.department,
    d.avg_salary,
    d.emp_count,
    c.company_avg,
    ROUND(d.avg_salary / c.company_avg * 100, 2) AS pct_of_company_avg
FROM dept_stats d
CROSS JOIN company_stats c;
```

### Рекурсивные CTE (WITH RECURSIVE)

Для работы с иерархическими данными.

```sql
-- Иерархия категорий
WITH RECURSIVE category_tree AS (
    -- Базовый запрос: корневые категории
    SELECT 
        id,
        name,
        parent_id,
        1 AS level,
        name AS path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Рекурсивный запрос: подкатегории
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1,
        ct.path || ' → ' || c.name
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;

-- Все подчиненные менеджера
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id = 1  -- ID менеджера
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, s.level + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
```

## Производительность подзапросов

### Проблема: подзапрос выполняется для каждой строки

```sql
-- Коррелированный подзапрос — выполняется N раз (где N = количество сотрудников)
SELECT 
    name,
    (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e1.department) AS dept_avg
FROM employees e1;
```

**Оптимизация:** использовать оконные функции или JOIN с агрегацией.

```sql
-- Оконная функция — один проход данных
SELECT 
    name,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees;

-- JOIN с агрегацией — один проход на агрегацию + один JOIN
WITH dept_avg AS (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
)
SELECT e.name, d.avg_salary
FROM employees e
JOIN dept_avg d ON e.department = d.department;
```

### Проблема: подзапрос в WHERE с NOT IN

```sql
-- Может быть медленным и опасным с NULL
SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);

-- Лучше использовать NOT EXISTS
SELECT * FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

### Проблема: подзапрос в SELECT с большим результатом

```sql
-- Для каждой строки вычисляется COUNT
SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) FROM customers c;

-- Лучше: GROUP BY + LEFT JOIN
SELECT c.name, COUNT(o.id)
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
```

## Распространенные ошибки

### Ошибка 1: Подзапрос возвращает больше одной строки, а ожидается скаляр

```sql
-- Ошибка: подзапрос может вернуть несколько строк
SELECT name FROM employees WHERE salary = (SELECT salary FROM employees WHERE department = 'Sales');

-- Исправление: использовать IN или агрегат
SELECT name FROM employees WHERE salary IN (SELECT salary FROM employees WHERE department = 'Sales');
-- или
SELECT name FROM employees WHERE salary = (SELECT MAX(salary) FROM employees WHERE department = 'Sales');
```

### Ошибка 2: NOT IN с NULL

```sql
-- Ошибка: если подзапрос возвращает NULL, результат будет пустым
SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);
-- В orders может быть NULL в customer_id

-- Исправление: исключить NULL
SELECT name FROM customers 
WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);

-- Или использовать NOT EXISTS (безопаснее)
SELECT name FROM customers c 
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

### Ошибка 3: Коррелированный подзапрос без алиасов

```sql
-- Ошибка: неоднозначная колонка
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = department);
-- Какая department? Внешняя или внутренняя?

-- Исправление: использовать алиасы
SELECT e1.name FROM employees e1
WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e1.department);
```

### Ошибка 4: Подзапрос в FROM без алиаса

```sql
-- Ошибка: производная таблица должна иметь алиас
SELECT * FROM (SELECT department, AVG(salary) FROM employees GROUP BY department);

-- Исправление
SELECT * FROM (SELECT department, AVG(salary) FROM employees GROUP BY department) AS dept_stats;
```

### Ошибка 5: Рекурсивный CTE без UNION ALL

```sql
-- Ошибка: UNION вместо UNION ALL может привести к бесконечной рекурсии
WITH RECURSIVE tree AS (
    ...
    UNION  -- UNION убирает дубликаты, но может замедлить и вызвать проблемы
    ...
)

-- Исправление: использовать UNION ALL
WITH RECURSIVE tree AS (
    ...
    UNION ALL
    ...
)
```

## Резюме для системного аналитика

1. **Подзапрос** — это запрос внутри запроса. Позволяет использовать результат одного запроса в другом. Вопрос внутри вопроса.

2. **Скалярные подзапросы** возвращают одно значение. Используются в `SELECT`, `WHERE`, `HAVING`. Пример: `WHERE salary > (SELECT AVG(salary) FROM employees)`.

3. **Табличные подзапросы** возвращают таблицу. Используются в `FROM` и `JOIN`. Пример: `FROM (SELECT ...) AS sub`.

4. **Коррелированные подзапросы** ссылаются на колонки внешнего запроса. Выполняются для каждой строки внешнего запроса. Могут быть медленными.

5. **EXISTS / NOT EXISTS** проверяют существование строк. Безопаснее `IN` при работе с NULL. Часто эффективнее для проверки существования.

6. **CTE (WITH)** — именованные подзапросы. Делают сложные запросы читаемыми. `WITH RECURSIVE` позволяет работать с иерархическими данными (деревья, графы).

7. **Подзапрос vs JOIN** — нет универсального ответа. Подзапросы лучше для агрегатных сравнений и проверки существования. JOIN лучше для объединения данных из нескольких таблиц.