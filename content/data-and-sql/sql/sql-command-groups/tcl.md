---
title: TCL (Transaction Control Language)
weight: 40
draft: false
description: "TCL — язык управления транзакциями в реляционных БД. Команды: BEGIN / START TRANSACTION (начало транзакции), COMMIT (фиксация изменений, делает их постоянными), ROLLBACK (откат всех изменений с момента BEGIN), SAVEPOINT (установка промежуточной точки), ROLLBACK TO SAVEPOINT (откат до точки сохранения), RELEASE SAVEPOINT (удаление точки), SET TRANSACTION (установка уровня изоляции: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE)."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что относится к TCL?
    options:
    - SELECT, UPDATE, DELETE
    - CREATE, ALTER, DROP
    - BEGIN, COMMIT, ROLLBACK, SAVEPOINT
    - GRANT, REVOKE
    correctIndex: 2
    explanation: TCL управляет жизненным циклом транзакций.
  - question: Для чего нужен TCL?
    options:
    - Для настройки TLS
    - Для управления фиксацией и откатом изменений в транзакциях
    - Для описания UML-диаграмм
    - Для поиска по полнотекстовому индексу
    correctIndex: 1
    explanation: TCL задаёт границы транзакционного поведения.
  - question: Что делает SAVEPOINT?
    options:
    - Удаляет таблицу безвозвратно
    - Выдаёт права на схему
    - Группирует строки в агрегат
    - Создаёт промежуточную точку отката внутри транзакции
    correctIndex: 3
    explanation: Savepoint полезен в сложных многошаговых сценариях.
  - question: Когда понимание TCL особенно важно?
    options:
    - Когда бизнес-операция должна выполняться атомарно и управляемо
    - Когда нужно только поменять цвет кнопки
    - Когда данные никогда не изменяются
    - Когда система не использует БД
    correctIndex: 0
    explanation: Транзакционные границы часто отражают реальную бизнес-логику.
---
## Введение: Чек на миллион

Представьте, что вы переводите деньги с одного счета на другой. Вы списываете 1 000 000 рублей со счета А. И тут — бац! — отключили электричество. Деньги списались, но на счет Б они не поступили. Миллион исчез. Клиент в панике. Банк в убытке. Вы в поисках новой работы.

Если бы перевод был оформлен как транзакция, этого бы не произошло. Транзакция гарантирует: либо все операции выполнятся успешно, либо ни одна. Как чек, который либо полностью оплачен, либо не оплачен вообще. Нет промежуточных состояний.

**TCL (Transaction Control Language)** — это язык управления транзакциями. Он позволяет группировать несколько SQL команд в одну логическую единицу работы — транзакцию. Транзакция может быть либо полностью применена (COMMIT), либо полностью отменена (ROLLBACK).

Это фундаментальный механизм, обеспечивающий свойства ACID: атомарность (Atomicity), согласованность (Consistency), изоляцию (Isolation) и долговечность (Durability). Без TCL базы данных не могли бы гарантировать, что деньги не потеряются при переводе.

## Основные команды TCL

| Команда | Назначение | Аналогия |
| :--- | :--- | :--- |
| `BEGIN` (или `START TRANSACTION`) | Начать транзакцию | Поставить подпись на чеке |
| `COMMIT` | Зафиксировать изменения | Оплатить чек |
| `ROLLBACK` | Отменить изменения | Порвать чек |
| `SAVEPOINT` | Установить промежуточную точку | Отметить "дошли до этого места" |
| `ROLLBACK TO SAVEPOINT` | Откатиться до точки | Вернуться к отметке |
| `RELEASE SAVEPOINT` | Удалить точку сохранения | Стереть отметку |
| `SET TRANSACTION` | Настроить уровень изоляции | Выбрать режим работы |

## BEGIN: Начало транзакции

### Синтаксис

```sql
-- PostgreSQL, MySQL
BEGIN;
-- или
START TRANSACTION;

-- SQL Server
BEGIN TRANSACTION;
-- или
BEGIN TRAN;

-- Oracle
BEGIN
    -- PL/SQL блок
END;
```

### Начало транзакции

```sql
-- Начало транзакции
BEGIN;

-- Теперь все операции до COMMIT или ROLLBACK — одна транзакция
UPDATE accounts SET balance = balance - 1000000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000000 WHERE id = 2;

-- Если все хорошо
COMMIT;

-- Если ошибка
ROLLBACK;
```

### Автокоммит (Autocommit)

По умолчанию в большинстве СУБД включен режим автокоммита. Каждая отдельная SQL команда — это отдельная транзакция.

```sql
-- В режиме автокоммита
UPDATE accounts SET balance = balance - 1000000 WHERE id = 1;  -- невидимый COMMIT
UPDATE accounts SET balance = balance + 1000000 WHERE id = 2;  -- невидимый COMMIT

-- Если между ними сбой — деньги потеряны
```

**Отключение автокоммита:**

```sql
-- PostgreSQL
SET autocommit = off;

-- MySQL
SET autocommit = 0;

-- SQL Server
SET IMPLICIT_TRANSACTIONS ON;
```

## COMMIT: Фиксация транзакции

`COMMIT` делает все изменения транзакции постоянными. После `COMMIT` откат невозможен (только новая транзакция с обратными изменениями).

```sql
BEGIN;

INSERT INTO orders (customer_id, amount) VALUES (123, 5000);
INSERT INTO order_items (order_id, product_id, quantity) 
VALUES (currval('orders_id_seq'), 456, 1);
UPDATE products SET stock = stock - 1 WHERE id = 456;

-- Все изменения становятся постоянными
COMMIT;
```

### COMMIT в разных СУБД

```sql
-- PostgreSQL
COMMIT;
-- или
COMMIT WORK;
-- или
END;  -- END тоже COMMIT

-- SQL Server
COMMIT TRANSACTION;
-- или
COMMIT TRAN;

-- MySQL
COMMIT;
```

### Что происходит при COMMIT

1. База данных записывает в журнал (WAL) информацию о фиксации
2. Освобождаются все блокировки, установленные транзакцией
3. Изменения становятся видимыми другим транзакциям (в зависимости от уровня изоляции)
4. Данные гарантированно не потеряются при сбое (Durability)

## ROLLBACK: Откат транзакции

`ROLLBACK` отменяет все изменения, сделанные в текущей транзакции. База данных возвращается к состоянию на момент `BEGIN`.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 1000000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000000 WHERE id = 2;

-- Ой! На счете 1 недостаточно средств
ROLLBACK;  -- Отменяет оба обновления
```

### ROLLBACK с проверкой

```sql
BEGIN;

UPDATE accounts SET balance = balance - 1000 WHERE id = 1;

-- Проверка, что баланс не стал отрицательным
SELECT balance FROM accounts WHERE id = 1;

-- Если баланс < 0, откат
ROLLBACK;

-- Если все хорошо
COMMIT;
```

### ROLLBACK в разных СУБД

```sql
-- PostgreSQL
ROLLBACK;
-- или
ROLLBACK WORK;

-- SQL Server
ROLLBACK TRANSACTION;
-- или
ROLLBACK TRAN;

-- MySQL
ROLLBACK;
```

## SAVEPOINT: Точки сохранения

Точки сохранения позволяют откатиться не до начала транзакции, а только до определенной точки.

### Создание и использование SAVEPOINT

```sql
BEGIN;

INSERT INTO logs (message) VALUES ('Шаг 1: начали');

SAVEPOINT step1;

INSERT INTO logs (message) VALUES ('Шаг 2: что-то сделали');

-- Ошибка! Откатываемся только до step1
ROLLBACK TO SAVEPOINT step1;

INSERT INTO logs (message) VALUES ('Шаг 2 (повторный): исправили');

COMMIT;  -- В результате: шаг 1 и шаг 2 (повторный)
```

### Пример с несколькими SAVEPOINT

```sql
BEGIN;

INSERT INTO users (name) VALUES ('Иван');
SAVEPOINT after_ivan;

INSERT INTO users (name) VALUES ('Петр');
SAVEPOINT after_petr;

-- Проблема с третьей вставкой
INSERT INTO users (name) VALUES (NULL);  -- Ошибка! name не может быть NULL

-- Откат только до after_petr
ROLLBACK TO SAVEPOINT after_petr;

-- Третья вставка с корректным значением
INSERT INTO users (name) VALUES ('Анна');

COMMIT;  -- Вставились Иван, Петр, Анна
```

### RELEASE SAVEPOINT

Удаляет точку сохранения (но не откатывает изменения).

```sql
BEGIN;
INSERT INTO logs VALUES ('step 1');
SAVEPOINT sp1;
INSERT INTO logs VALUES ('step 2');

-- Точка sp1 больше не нужна
RELEASE SAVEPOINT sp1;

-- ROLLBACK TO sp1 уже не сработает
COMMIT;
```

## Уровни изоляции транзакций

`SET TRANSACTION` позволяет настроить уровень изоляции для транзакции. Это тема отдельного документа, но кратко:

| Уровень | Грязное чтение | Неповторяющееся чтение | Фантомы |
| :--- | :--- | :--- | :--- |
| `READ UNCOMMITTED` | Да | Да | Да |
| `READ COMMITTED` | Нет | Да | Да |
| `REPEATABLE READ` | Нет | Нет | Да (кроме некоторых СУБД) |
| `SERIALIZABLE` | Нет | Нет | Нет |

### Синтаксис

```sql
-- PostgreSQL
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM users WHERE id = 1;
COMMIT;

-- MySQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT * FROM users WHERE id = 1;
COMMIT;

-- SQL Server
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRANSACTION;
SELECT * FROM users WHERE id = 1;
COMMIT TRANSACTION;
```

## Транзакции и сохранность данных

### Пример: банковский перевод

```sql
-- Функция перевода денег
CREATE OR REPLACE FUNCTION transfer_money(
    p_from INT, p_to INT, p_amount DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Начало транзакции (в функции обычно автоматически)
    
    -- Проверка достаточности средств
    IF (SELECT balance FROM accounts WHERE id = p_from) < p_amount THEN
        RAISE EXCEPTION 'Недостаточно средств';
    END IF;
    
    -- Списание и зачисление
    UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
    UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
    
    -- Запись в журнал
    INSERT INTO transaction_log (from_id, to_id, amount, created_at)
    VALUES (p_from, p_to, p_amount, NOW());
    
    -- Фиксация
    COMMIT;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### Пример: оформление заказа

```sql
BEGIN;

-- 1. Проверка остатка товара
SELECT stock INTO v_stock FROM products WHERE id = v_product_id FOR UPDATE;

IF v_stock < v_quantity THEN
    ROLLBACK;
    RAISE EXCEPTION 'Товара нет в наличии';
END IF;

-- 2. Резервирование товара
UPDATE products SET stock = stock - v_quantity WHERE id = v_product_id;

-- 3. Создание заказа
INSERT INTO orders (customer_id, total_amount, status) 
VALUES (v_customer_id, v_total, 'pending')
RETURNING id INTO v_order_id;

-- 4. Создание позиций заказа
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (v_order_id, v_product_id, v_quantity, v_price);

-- 5. Списание денег (если оплата сразу)
UPDATE accounts SET balance = balance - v_total WHERE user_id = v_customer_id;

-- Все успешно
COMMIT;
```

## Транзакции в разных СУБД

### PostgreSQL

```sql
-- Явное начало
BEGIN;
-- или
START TRANSACTION;

-- COMMIT и ROLLBACK
COMMIT;
ROLLBACK;

-- SAVEPOINT
SAVEPOINT sp;
ROLLBACK TO SAVEPOINT sp;
RELEASE SAVEPOINT sp;

-- Уровни изоляции
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Транзакции в функциях
CREATE FUNCTION my_func() RETURNS VOID AS $$
BEGIN
    -- автоматически в транзакции
    INSERT INTO logs VALUES ('done');
    COMMIT;  -- Можно, но осторожно
END;
$$ LANGUAGE plpgsql;
```

### MySQL

```sql
-- Начало
START TRANSACTION;
-- или
BEGIN;

-- Отключение автокоммита
SET autocommit = 0;

-- SAVEPOINT
SAVEPOINT sp;
ROLLBACK TO SAVEPOINT sp;
RELEASE SAVEPOINT sp;

-- Уровни изоляции
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### SQL Server

```sql
-- Начало
BEGIN TRANSACTION;
-- или
BEGIN TRAN;

-- Именованные транзакции
BEGIN TRANSACTION TransferMoney;

-- COMMIT/ROLLBACK
COMMIT TRANSACTION;
ROLLBACK TRANSACTION;
COMMIT TRAN TransferMoney;

-- Вложенные транзакции (на самом деле savepoints)
BEGIN TRAN;
    INSERT INTO logs VALUES ('outer');
    BEGIN TRAN;
        INSERT INTO logs VALUES ('inner');
    COMMIT;  -- не фиксирует, только уменьшает счетчик
COMMIT;  -- реальная фиксация
```

## Распространенные ошибки

### Ошибка 1: Слишком длинные транзакции

```sql
-- Плохо: транзакция на минуты
BEGIN;
SELECT * FROM users WHERE id = 123;
-- Ждем ответа от пользователя (30 секунд)
UPDATE users SET name = 'Новое имя' WHERE id = 123;
COMMIT;
```

**Проблемы:** Блокировки, рост WAL, проблемы с VACUUM.

**Как исправить:** Транзакции должны быть короткими (миллисекунды). Внешние ожидания — за пределами транзакции.

### Ошибка 2: COMMIT без проверки

```sql
-- Плохо
BEGIN;
UPDATE products SET stock = stock - 1 WHERE id = 123;
COMMIT;  -- не проверили, что строка была обновлена
```

**Как исправить:** Проверять количество затронутых строк.

```sql
BEGIN;
UPDATE products SET stock = stock - 1 WHERE id = 123 AND stock > 0;
IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    RAISE EXCEPTION 'Товара нет';
END IF;
COMMIT;
```

### Ошибка 3: ROLLBACK внутри цикла

```sql
-- Плохо
BEGIN;
FOR rec IN SELECT * FROM orders WHERE status = 'pending' LOOP
    BEGIN
        UPDATE orders SET status = 'processed' WHERE id = rec.id;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;  -- Откатывает ВСЮ транзакцию!
    END;
END LOOP;
COMMIT;
```

**Как исправить:** Использовать SAVEPOINT.

```sql
BEGIN;
FOR rec IN SELECT * FROM orders WHERE status = 'pending' LOOP
    SAVEPOINT sp;
    BEGIN
        UPDATE orders SET status = 'processed' WHERE id = rec.id;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK TO SAVEPOINT sp;
    END;
END LOOP;
COMMIT;
```

### Ошибка 4: Путать COMMIT и ROLLBACK в обработчиках ошибок

```sql
-- Плохо: COMMIT при ошибке
BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
-- Ошибка
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
COMMIT;  -- Первое обновление зафиксируется!
```

**Как исправить:** ROLLBACK при ошибке.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
ROLLBACK;  -- Откатывает оба обновления
```

### Ошибка 5: Игнорирование уровней изоляции

Использование уровня изоляции по умолчанию без понимания, какие аномалии он допускает.

**Как исправить:** Выбирать уровень изоляции осознанно.

```sql
-- Для отчетов, где важна согласованность
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT SUM(amount) FROM orders WHERE created_at > '2024-01-01';
SELECT SUM(amount) FROM orders WHERE created_at > '2024-02-01';
COMMIT;
```

## Практические примеры

### Пример 1: UPSERT с транзакцией

```sql
-- Обновить или вставить
BEGIN;

UPDATE user_stats SET page_views = page_views + 1 
WHERE user_id = 123 AND date = CURRENT_DATE;

IF ROW_COUNT() = 0 THEN
    INSERT INTO user_stats (user_id, date, page_views) 
    VALUES (123, CURRENT_DATE, 1);
END IF;

COMMIT;
```

### Пример 2: Пакетная обработка с частичным откатом

```sql
-- Обработка 1000 заказов, если один упал — откатываем только его
BEGIN;

FOR i IN 1..1000 LOOP
    SAVEPOINT sp;
    BEGIN
        UPDATE orders SET status = 'processed' WHERE id = i;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK TO SAVEPOINT sp;
            INSERT INTO error_log (order_id, error) VALUES (i, SQLERRM);
    END;
END LOOP;

COMMIT;
```

### Пример 3: Чтение с блокировкой (SELECT FOR UPDATE)

```sql
-- Зарезервировать товар
BEGIN;

-- Блокируем строку, чтобы другой пользователь не купил тот же товар
SELECT stock FROM products WHERE id = 456 FOR UPDATE;

IF stock >= 1 THEN
    UPDATE products SET stock = stock - 1 WHERE id = 456;
    INSERT INTO cart_items (user_id, product_id) VALUES (123, 456);
    COMMIT;
ELSE
    ROLLBACK;
    RAISE EXCEPTION 'Товар закончился';
END IF;
```

### Пример 4: Транзакция с условным COMMIT

```sql
-- Отчет, который должен быть согласованным
BEGIN;

-- Устанавливаем уровень изоляции для согласованного чтения
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Получаем данные
SELECT * FROM orders WHERE status = 'completed';
SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'completed');

-- Если данные выглядят корректно
COMMIT;

-- Если что-то не так
ROLLBACK;
```

## Резюме для системного аналитика

1. **TCL (Transaction Control Language)** — язык управления транзакциями. Команды: `BEGIN` (начать), `COMMIT` (зафиксировать), `ROLLBACK` (откатить), `SAVEPOINT` (точка сохранения), `SET TRANSACTION` (уровень изоляции).

2. **Транзакция — это "все или ничего".** Либо все операции внутри транзакции применяются, либо ни одна. Это обеспечивает атомарность (Atomicity).

3. **COMMIT** делает изменения постоянными. После `COMMIT` откат невозможен. **ROLLBACK** отменяет все изменения с момента `BEGIN` (или с последнего `SAVEPOINT`).

4. **Автокоммит (Autocommit)** — режим, при котором каждая команда — отдельная транзакция. Для многошаговых операций автокоммит нужно отключать, иначе при сбое между шагами данные станут несогласованными.

5. **SAVEPOINT** позволяет откатиться не до начала транзакции, а только до определенной точки. Полезно для частичной обработки ошибок (один ошибочный заказ не отменяет 999 успешных).

6. **Уровни изоляции** определяют, какие аномалии допускаются: `READ UNCOMMITTED` (самый быстрый, но опасный), `READ COMMITTED` (стандарт), `REPEATABLE READ`, `SERIALIZABLE` (самый надежный, но медленный).

7. **Транзакции должны быть короткими.** Длинные транзакции ведут к блокировкам, росту WAL, проблемам с производительностью. Внешние вызовы (API, ожидание пользователя) — за пределами транзакции.