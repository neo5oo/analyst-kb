---
title: Пользовательские функции
weight: 20
draft: false
description: 'Пользовательские функции — "фабрики значений" в базе данных: принимают параметры, вычисляют и возвращают результат, не имеют побочных эффектов (не изменяют данные, не управляют транзакциями). Отличие от хранимых процедур: функции можно вызывать в SELECT, WHERE, ORDER BY, JOIN, вычисляемых столбцах, CHECK. Типы: скалярные (одно значение), табличные (набор строк), агрегатные. Детерминированные (IMMUTABLE) — всегда одинаковый результат для одинаковых параметров (кеширование, индексы). Недетерминированные (VOLATILE) — зависят от времени, случайных чисел (не для индексов). Примеры синтаксиса: PostgreSQL (PL/pgSQL), SQL Server (T-SQL), MySQL, Oracle. Производительность: проблема N+1 запросов при вызове функции для каждой строки (лучше JOIN). Индексы на функциях. Ошибки: использование функции вместо JOIN, побочные эффекты в функции, неправильная детерминированность, отсутствие обработки NULL.'
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что такое пользовательская функция в БД?
    options:
    - Механизм подписки на брокер
    - Режим репликации кластера
    - Повторно используемое вычисление, которое можно вызывать из SQL
    - Только alias для таблицы
    correctIndex: 2
    explanation: Функции инкапсулируют вычислительную логику.
  - question: Когда функция особенно полезна?
    options:
    - Когда нужно маршрутизировать события по exchange
    - Когда одно и то же преобразование или расчёт нужно использовать в разных запросах
    - Когда необходимо хранить файлы в blob store
    - Когда требуется только auto-ack
    correctIndex: 1
    explanation: Функции уменьшают дублирование выражений.
  - question: Чем функция обычно отличается от процедуры?
    options:
    - Функция всегда меняет схему БД
    - Процедура всегда быстрее функции
    - Между ними нет ни одного различия
    - Функция чаще возвращает значение и используется в выражениях SQL
    correctIndex: 3
    explanation: Хотя детали зависят от СУБД, это базовое различие полезно помнить.
  - question: Что важно учитывать в пользовательских функциях?
    options:
    - Их влияние на читаемость, производительность и побочные эффекты
    - Функции не требуют тестирования
    - Функции всегда выполняются мгновенно
    - Функции полностью заменяют views
    correctIndex: 0
    explanation: Неудачно реализованная функция может стать узким местом запросов.
---
## Введение: Фабрика по производству значений

Представьте себе фабрику, на которой есть станок. Вы загружаете в него исходные материалы (например, деревянные заготовки), нажимаете кнопку, и через несколько секунд получаете готовый продукт (например, отшлифованную деталь). Станок делает одно и то же: берет входные данные, выполняет строго определенную последовательность действий и возвращает результат. У станка нет побочных эффектов — он не меняет другие детали, не перестраивает цех, не отправляет отчеты руководству. Он просто преобразует вход в выход.

**Пользовательская функция в базе данных** — это такой же станок. Она принимает параметры, выполняет вычисления и возвращает результат. Функция не изменяет данные в базе (или делает это в очень ограниченной форме), не управляет транзакциями, не вызывает побочных эффектов. Ее задача — вычислить значение и вернуть его.

В этом ключевое отличие пользовательской функции от хранимой процедуры. Процедура — это "сделай что-то" (может изменить данные, управлять транзакциями). Функция — это "вычисли значение" (принимает параметры, возвращает результат, не имеет побочных эффектов).

Пользовательские функции — это механизм расширения SQL. Они позволяют создавать собственные операции, которые можно использовать там же, где используются встроенные функции (SUM, COUNT, UPPER, LOWER). Их можно вызывать в SELECT, WHERE, ORDER BY, JOIN, использовать для вычисляемых столбцов и ограничений.

## Зачем нужны пользовательские функции

### Инкапсуляция сложной логики

Вместо того чтобы писать один и тот же сложный расчет в десяти разных запросах, вы создаете функцию один раз и вызываете ее везде.

```sql
-- Без функции (дублирование)
SELECT order_id, (price * quantity * (1 - discount/100) + delivery_cost) AS final_price FROM orders;
SELECT order_id, (price * quantity * (1 - discount/100) + delivery_cost) FROM orders WHERE (price * quantity * (1 - discount/100) + delivery_cost) > 1000;

-- С функцией
CREATE FUNCTION calculate_final_price(price DECIMAL, quantity INT, discount DECIMAL, delivery_cost DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN price * quantity * (1 - discount/100) + delivery_cost;
END;
$$ LANGUAGE plpgsql;

SELECT order_id, calculate_final_price(price, quantity, discount, delivery_cost) FROM orders;
```

### Переиспользование кода

Функцию можно вызывать из:
- Запросов SELECT
- Других функций
- Хранимых процедур
- Триггеров
- Вычисляемых столбцов
- Ограничений CHECK
- Значений по умолчанию

### Расширение SQL новыми возможностями

SQL имеет богатый набор встроенных функций, но он не может покрыть все потребности всех бизнесов. Пользовательские функции позволяют добавить недостающее.

Примеры полезных функций:
- Расчет возраста по дате рождения с учетом бизнес-правил
- Форматирование телефонных номеров по национальному стандарту
- Проверка валидности ИНН или других идентификаторов
- Сложные геометрические расчеты
- Преобразование между форматами данных

### Улучшение читаемости и поддержки

Вместо огромного выражения в запросе появляется понятное имя функции. Это делает код самодокументируемым.

## Виды пользовательских функций

В зависимости от возвращаемого значения и способа использования, функции делятся на несколько типов.

### Скалярные функции (Scalar Functions)

Возвращают одно значение (число, строку, дату, булево значение и т.д.). Самый распространенный тип функций.

```sql
-- PostgreSQL
CREATE FUNCTION get_age(birth_date DATE)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$;

-- Использование
SELECT name, get_age(birth_date) FROM users;
```

### Табличные функции (Table-Valued Functions)

Возвращают таблицу (набор строк). Могут использоваться в FROM как обычная таблица или представление.

**Inline Table-Valued Function (простая, однострочный RETURN):**

```sql
-- PostgreSQL
CREATE FUNCTION get_active_users()
RETURNS TABLE(user_id INT, name VARCHAR, email VARCHAR)
LANGUAGE sql
AS $$
    SELECT id, name, email FROM users WHERE is_active = true;
$$;

-- Использование
SELECT * FROM get_active_users() WHERE email LIKE '%@company.com';
```

**Multi-Statement Table-Valued Function (сложная, с телом):**

```sql
-- SQL Server
CREATE FUNCTION get_monthly_sales(@year INT, @month INT)
RETURNS @result TABLE (
    product_id INT,
    total_quantity INT,
    total_amount DECIMAL(10,2)
)
AS
BEGIN
    INSERT INTO @result
    SELECT 
        product_id,
        SUM(quantity),
        SUM(quantity * price)
    FROM sales
    WHERE YEAR(sale_date) = @year AND MONTH(sale_date) = @month
    GROUP BY product_id;
    
    -- Дополнительная логика
    UPDATE @result SET total_amount = total_amount * 1.1 WHERE total_quantity > 100;
    
    RETURN;
END;
```

### Агрегатные функции (Aggregate Functions)

Специальный тип функций, которые работают с группой строк и возвращают одно значение. Встроенные примеры: SUM, AVG, COUNT, MIN, MAX. Пользовательские агрегатные функции создаются редко, но такая возможность есть в большинстве СУБД.

## Синтаксис и базовая структура

Синтаксис функций сильно различается в разных СУБД. Ниже приведены примеры для самых популярных.

### PostgreSQL (PL/pgSQL)

```sql
-- Скалярная функция
CREATE OR REPLACE FUNCTION calculate_discount(
    p_price DECIMAL,
    p_quantity INT,
    p_customer_type VARCHAR
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE  -- детерминированная функция (см. ниже)
AS $$
DECLARE
    v_discount DECIMAL;
BEGIN
    -- Базовый дисконт от количества
    IF p_quantity >= 10 THEN
        v_discount := 0.10;
    ELSIF p_quantity >= 5 THEN
        v_discount := 0.05;
    ELSE
        v_discount := 0;
    END IF;
    
    -- Дополнительный дисконт для постоянных клиентов
    IF p_customer_type = 'premium' THEN
        v_discount := v_discount + 0.10;
    ELSIF p_customer_type = 'gold' THEN
        v_discount := v_discount + 0.15;
    END IF;
    
    RETURN p_price * p_quantity * (1 - v_discount);
END;
$$;

-- Табличная функция (inline)
CREATE OR REPLACE FUNCTION get_orders_by_customer(p_customer_id INT)
RETURNS TABLE(order_id INT, order_date DATE, total DECIMAL)
LANGUAGE sql
AS $$
    SELECT id, created_at, total_amount 
    FROM orders 
    WHERE customer_id = p_customer_id
    ORDER BY created_at DESC;
$$;
```

### SQL Server (T-SQL)

```sql
-- Скалярная функция
CREATE FUNCTION calculate_discount(
    @price DECIMAL(10,2),
    @quantity INT,
    @customer_type VARCHAR(20)
)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @discount DECIMAL(5,2);
    
    IF @quantity >= 10
        SET @discount = 0.10;
    ELSE IF @quantity >= 5
        SET @discount = 0.05;
    ELSE
        SET @discount = 0;
    
    IF @customer_type = 'premium'
        SET @discount = @discount + 0.10;
    ELSE IF @customer_type = 'gold'
        SET @discount = @discount + 0.15;
    
    RETURN @price * @quantity * (1 - @discount);
END;

-- Inline табличная функция
CREATE FUNCTION get_orders_by_customer(@customer_id INT)
RETURNS TABLE
AS
RETURN (
    SELECT id AS order_id, created_at AS order_date, total_amount AS total
    FROM orders
    WHERE customer_id = @customer_id
);
```

### MySQL

```sql
-- Скалярная функция
DELIMITER //

CREATE FUNCTION calculate_discount(
    p_price DECIMAL(10,2),
    p_quantity INT,
    p_customer_type VARCHAR(20)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_discount DECIMAL(5,2);
    
    IF p_quantity >= 10 THEN
        SET v_discount = 0.10;
    ELSEIF p_quantity >= 5 THEN
        SET v_discount = 0.05;
    ELSE
        SET v_discount = 0;
    END IF;
    
    IF p_customer_type = 'premium' THEN
        SET v_discount = v_discount + 0.10;
    ELSEIF p_customer_type = 'gold' THEN
        SET v_discount = v_discount + 0.15;
    END IF;
    
    RETURN p_price * p_quantity * (1 - v_discount);
END//

DELIMITER ;

-- Табличная функция (только в MySQL 8.0+ через JSON или через представления)
```

### Oracle (PL/SQL)

```sql
-- Скалярная функция
CREATE OR REPLACE FUNCTION calculate_discount(
    p_price IN NUMBER,
    p_quantity IN NUMBER,
    p_customer_type IN VARCHAR2
)
RETURN NUMBER
IS
    v_discount NUMBER;
BEGIN
    IF p_quantity >= 10 THEN
        v_discount := 0.10;
    ELSIF p_quantity >= 5 THEN
        v_discount := 0.05;
    ELSE
        v_discount := 0;
    END IF;
    
    IF p_customer_type = 'premium' THEN
        v_discount := v_discount + 0.10;
    ELSIF p_customer_type = 'gold' THEN
        v_discount := v_discount + 0.15;
    END IF;
    
    RETURN p_price * p_quantity * (1 - v_discount);
END calculate_discount;
/

-- Табличная функция (Pipelined)
CREATE OR REPLACE TYPE order_row AS OBJECT (
    order_id NUMBER,
    order_date DATE,
    total NUMBER
);

CREATE OR REPLACE TYPE order_table AS TABLE OF order_row;

CREATE OR REPLACE FUNCTION get_orders_by_customer(p_customer_id NUMBER)
RETURN order_table PIPELINED
IS
BEGIN
    FOR rec IN (SELECT id, created_at, total_amount FROM orders WHERE customer_id = p_customer_id)
    LOOP
        PIPE ROW(order_row(rec.id, rec.created_at, rec.total_amount));
    END LOOP;
    RETURN;
END;
```

## Детерминированные и недетерминированные функции

Это одно из самых важных различий для понимания поведения функций.

### Детерминированная функция

Детерминированная функция всегда возвращает один и тот же результат для одних и тех же входных параметров.

```sql
-- Детерминированная функция
CREATE FUNCTION add_numbers(a INT, b INT) RETURNS INT AS $$
BEGIN
    RETURN a + b;
END;
$$ LANGUAGE plpgsql IMMUTABLE;  -- IMMUTABLE = детерминированная
```

**Примеры детерминированных операций:**
- Арифметические вычисления
- Работа со строками (CONCAT, SUBSTRING, UPPER, LOWER)
- Преобразование типов
- Функции, не зависящие от внешнего состояния

### Недетерминированная функция

Недетерминированная функция может возвращать разные результаты при одинаковых входных параметрах.

```sql
-- Недетерминированная функция
CREATE FUNCTION get_current_time() RETURNS TIMESTAMP AS $$
BEGIN
    RETURN CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql VOLATILE;  -- VOLATILE = недетерминированная
```

**Примеры недетерминированных операций:**
- Текущее время (NOW, CURRENT_TIMESTAMP, GETDATE)
- Генерация случайных чисел (RANDOM)
- Чтение данных из таблиц, которые могут измениться
- Значения последовательностей (NEXTVAL)

### Зачем нужно различать

База данных использует детерминированность для оптимизации. Детерминированную функцию можно:
- Кешировать результат для одинаковых параметров
- Вычислять заранее при создании индекса (индексы по выражению)
- Использовать в вычисляемых столбцах, которые сохраняются на диске

Недетерминированная функция не может быть использована в индексах и некоторых других контекстах.

**В PostgreSQL используются метки:**
- `IMMUTABLE` — абсолютно детерминированная (зависит только от параметров)
- `STABLE` — детерминированная в рамках одного запроса (например, CURRENT_TIMESTAMP)
- `VOLATILE` — недетерминированная (по умолчанию)

## Где можно использовать пользовательские функции

### В SELECT

Самое распространенное место использования.

```sql
SELECT 
    name,
    calculate_discount(price, quantity, customer_type) AS discount_price,
    get_age(birth_date) AS age
FROM orders;
```

### В WHERE

Функции могут использоваться в условиях фильтрации.

```sql
SELECT * FROM users 
WHERE get_age(birth_date) >= 18;

SELECT * FROM orders 
WHERE calculate_discount(price, quantity, 'regular') > 1000;
```

**Важно:** Использование функций в WHERE может привести к проблемам с производительностью, особенно если функция не детерминированная или выполняет сложные вычисления для каждой строки.

### В ORDER BY

```sql
SELECT name, birth_date 
FROM users 
ORDER BY get_age(birth_date) DESC;
```

### В GROUP BY и HAVING

```sql
SELECT 
    get_age(birth_date) AS age_group,
    COUNT(*)
FROM users
GROUP BY get_age(birth_date)
HAVING COUNT(*) > 10;
```

### В JOIN

```sql
SELECT * 
FROM orders o
JOIN customers c ON normalize_phone(o.phone) = normalize_phone(c.phone);
```

### В вычисляемых столбцах (Generated Columns)

```sql
-- PostgreSQL
ALTER TABLE orders ADD COLUMN final_price DECIMAL 
GENERATED ALWAYS AS (calculate_final_price(price, quantity, discount)) STORED;
```

### В ограничениях CHECK

```sql
ALTER TABLE users ADD CONSTRAINT valid_age 
CHECK (get_age(birth_date) >= 0 AND get_age(birth_date) <= 120);
```

### В значениях по умолчанию

```sql
ALTER TABLE orders ALTER COLUMN order_number 
SET DEFAULT generate_order_number();
```

## Функции и производительность

### Проблема "функция для каждой строки"

Когда вы используете скалярную функцию в SELECT или WHERE, она вызывается для каждой строки результирующего набора. Если функция делает что-то сложное (например, читает другую таблицу), производительность может резко упасть.

```sql
-- Плохо: функция выполняет запрос для каждой строки
CREATE FUNCTION get_customer_name(p_customer_id INT) 
RETURNS VARCHAR AS $$
BEGIN
    RETURN (SELECT name FROM customers WHERE id = p_customer_id);
END;
$$ LANGUAGE plpgsql;

-- Для 10000 заказов — 10000 запросов к таблице customers
SELECT order_id, get_customer_name(customer_id) FROM orders;
```

**Как исправить:** Использовать JOIN вместо функции.

```sql
-- Хорошо: один запрос
SELECT o.order_id, c.name 
FROM orders o 
JOIN customers c ON o.customer_id = c.id;
```

### Когда функции оправданы

| Сценарий | Оправдано? | Почему |
| :--- | :--- | :--- |
| Простые вычисления (арифметика, строки) | Да | Низкая стоимость |
| Форматирование данных (даты, телефоны) | Да | Упрощает код |
| Доступ к другой таблице | Нет | Лучше использовать JOIN |
| Сложные бизнес-правила с несколькими условиями | Зависит | Возможно, лучше вынести в приложение |
| Валидация данных в CHECK | Да | Выполняется только при изменении строки |
| Вычисляемые столбцы | Да | Вычисляется один раз при вставке/обновлении |

### Индексы на функции

В большинстве СУБД можно создавать индексы на результат функции. Это полезно, если вы часто ищете по вычисляемому значению.

```sql
-- PostgreSQL: индекс на функцию
CREATE INDEX idx_users_age ON users ((EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))));

-- Теперь поиск по возрасту будет использовать индекс
SELECT * FROM users WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) = 30;
```

## Функции vs Хранимые процедуры vs Триггеры vs Представления

Краткое сравнение с другими объектами базы данных. Подробно каждый из них будет рассмотрен в отдельных документах.

| Характеристика | Функция | Процедура | Триггер | Представление |
| :--- | :--- | :--- | :--- | :--- |
| **Возвращает значение** | Да (обязательно) | Может (OUT) | Нет | Таблица |
| **Может быть в SELECT** | Да | Нет | Нет | Да |
| **Может изменять данные** | Ограниченно | Да | Да | Нет |
| **Управление транзакциями** | Нет | Да | Ограниченно | Нет |
| **Вызывается автоматически** | Нет | Нет | Да | Нет |
| **Принимает параметры** | Да | Да | Нет | Да (не во всех СУБД) |
| **Может содержать DDL** | Нет | Да | Ограниченно | Нет |

**Правило большого пальца:**
- Нужно вычислить значение → Функция
- Нужно сделать действие (изменить данные, запустить процесс) → Процедура
- Нужно автоматически реагировать на изменения → Триггер
- Нужно упростить сложный запрос (не меняет данные) → Представление

## Особенности в разных СУБД

### PostgreSQL

- Поддерживает функции на многих языках: SQL, PL/pgSQL, Python, Perl, JavaScript (V8), C и других.
- Функции могут возвращать `SETOF` (множество строк), таблицы, составные типы, JSON.
- Возможна перегрузка функций (несколько функций с одним именем, но разными параметрами).
- Функции могут быть агрегатными (создание собственных агрегатов).
- Поддержка оконных функций (но это встроенные функции).

```sql
-- Функция на SQL (простая, без переменных)
CREATE FUNCTION get_user_email(p_user_id INT) RETURNS VARCHAR
LANGUAGE sql
AS $$
    SELECT email FROM users WHERE id = p_user_id;
$$;

-- Функция на PL/pgSQL (с переменными и логикой)
CREATE FUNCTION get_user_email_safe(p_user_id INT) RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_email VARCHAR;
BEGIN
    SELECT email INTO v_email FROM users WHERE id = p_user_id;
    IF v_email IS NULL THEN
        RETURN 'no-email@example.com';
    END IF;
    RETURN LOWER(v_email);
END;
$$;
```

### SQL Server

- Различает скалярные функции (один результат) и табличные функции (множество строк).
- Функции не могут иметь побочных эффектов (не могут изменять данные).
- В функциях нельзя использовать `GETDATE()`, `NEWID()` (недетерминированные).
- Функции могут быть `SCHEMABINDING` — привязаны к схеме (защита от изменений в таблицах).

```sql
-- Schema-bound функция
CREATE FUNCTION dbo.get_user_name(@user_id INT)
RETURNS VARCHAR(100)
WITH SCHEMABINDING
AS
BEGIN
    RETURN (SELECT name FROM dbo.users WHERE id = @user_id);
END;
```

### MySQL

- Функции поддерживаются, но возможности языка ограничены.
- Функции могут быть `DETERMINISTIC` или `NOT DETERMINISTIC`.
- MySQL 8.0 добавил поддержку табличных функций (через JSON или `LATERAL`).
- Функции могут читать данные (`READS SQL DATA`) и изменять (`MODIFIES SQL DATA`).

```sql
-- Функция с детерминированной пометкой
CREATE FUNCTION calculate_tax(amount DECIMAL)
RETURNS DECIMAL
DETERMINISTIC
BEGIN
    RETURN amount * 0.20;
END;
```

### Oracle

- Функции могут быть `DETERMINISTIC`, `PARALLEL_ENABLE` (для параллельного выполнения).
- Поддержка `PIPELINED` функций (возвращают результат по частям, не накапливая в памяти).
- Функции могут быть вызваны из SQL и из PL/SQL.
- Функции могут быть на PL/SQL, Java, C.

```sql
-- Pipelined функция для эффективной обработки больших данных
CREATE FUNCTION get_large_dataset RETURN dataset_table PIPELINED
IS
BEGIN
    FOR rec IN (SELECT * FROM large_table)
    LOOP
        PIPE ROW(process_row(rec));
    END LOOP;
    RETURN;
END;
```

## Распространенные ошибки при работе с функциями

### Ошибка 1: Использование функции вместо JOIN

```sql
-- Плохо
CREATE FUNCTION get_city_name(p_city_id INT) RETURNS VARCHAR AS $$
BEGIN
    RETURN (SELECT name FROM cities WHERE id = p_city_id);
END;
$$ LANGUAGE plpgsql;

SELECT u.name, get_city_name(u.city_id) FROM users u;  -- N+1 запросов

-- Хорошо
SELECT u.name, c.name FROM users u JOIN cities c ON u.city_id = c.id;  -- 1 запрос
```

### Ошибка 2: Изменение данных в функции

В некоторых СУБД это вообще запрещено. В других — разрешено, но приводит к неожиданным побочным эффектам.

```sql
-- Плохо (в PostgreSQL так можно, но не нужно)
CREATE FUNCTION update_and_return(p_id INT) RETURNS INT AS $$
BEGIN
    UPDATE users SET last_access = NOW() WHERE id = p_id;
    RETURN p_id;
END;
$$ LANGUAGE plpgsql;

-- Побочный эффект внутри SELECT
SELECT update_and_return(id) FROM users;  -- Изменяет данные в SELECT!
```

**Как исправить:** Использовать процедуру для действий с побочными эффектами, а функцию оставить для вычислений.

### Ошибка 3: Неправильное указание детерминированности

```sql
-- Ошибка: функция помечена как IMMUTABLE, но использует NOW()
CREATE FUNCTION get_tomorrow() RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$ SELECT CURRENT_DATE + 1; $$;  -- Вернет один и тот же день для всего запроса!
```

**Как исправить:** Указывать правильный уровень детерминированности. `VOLATILE` для функций, зависящих от времени.

### Ошибка 4: Отсутствие обработки NULL

```sql
-- Плохо: не обрабатывает NULL
CREATE FUNCTION full_name(first_name VARCHAR, last_name VARCHAR) RETURNS VARCHAR AS $$
BEGIN
    RETURN first_name || ' ' || last_name;  -- Если first_name NULL, результат NULL
END;
$$ LANGUAGE plpgsql;

-- Хорошо: обрабатывает NULL
CREATE FUNCTION full_name(first_name VARCHAR, last_name VARCHAR) RETURNS VARCHAR AS $$
BEGIN
    RETURN COALESCE(first_name, '') || ' ' || COALESCE(last_name, '');
END;
$$ LANGUAGE plpgsql;
```

### Ошибка 5: Слишком сложная логика в функции

Функция на сотни строк кода с вложенными циклами и сложными запросами. Это сложно отлаживать, тестировать и поддерживать.

**Как исправить:** Разбивать на несколько маленьких функций. Сложную логику, особенно с изменением данных, выносить в процедуры.

## Резюме для системного аналитика

1. **Пользовательская функция — это "фабрика значений".** Она принимает параметры, выполняет вычисления и возвращает результат. Не имеет побочных эффектов (не изменяет данные, не управляет транзакциями).

2. **Основное отличие от хранимой процедуры:** функцию можно вызывать в SELECT, WHERE, ORDER BY, JOIN, использовать в вычисляемых столбцах и ограничениях. Процедуру — нет.

3. **Детерминированные функции** возвращают одинаковый результат для одинаковых параметров. Их можно кешировать, использовать в индексах и вычисляемых столбцах.

4. **Недетерминированные функции** (текущее время, случайные числа) не могут быть использованы во многих контекстах и могут приводить к неожиданному поведению.

5. **Функции могут быть скалярными** (возвращают одно значение) или **табличными** (возвращают таблицу/набор строк). Табличные функции можно использовать в FROM.

6. **Производительность — слабое место функций.** Скалярная функция, вызываемая в SELECT, выполняется для каждой строки. Если функция читает другие таблицы, возникает проблема N+1 запросов. Лучше использовать JOIN.

7. **Индексы на функциях** позволяют ускорить поиск по вычисляемым значениям. Полезно, если функция детерминированная и часто используется в WHERE.