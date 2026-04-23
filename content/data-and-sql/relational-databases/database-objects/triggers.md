---
title: Триггеры
weight: 30
draft: false
description: "Триггеры — автоматическое выполнение кода при событиях INSERT, UPDATE, DELETE на таблице. Типы: BEFORE (до операции, валидация, модификация), AFTER (после операции, аудит, каскады), INSTEAD OF (вместо операции, для представлений). Уровни срабатывания: FOR EACH ROW (для каждой строки) и FOR EACH STATEMENT (один раз на оператор). Специальные переменные: NEW (новое значение), OLD (старое значение), TG_OP (тип операции). Применение: аудит и логирование, проверка бизнес-правил, поддержание производных данных (агрегаты, updated_at), каскадные операции, синхронизация. Производительность: FOR EACH STATEMENT быстрее для массовых операций, каскадные триггеры и рекурсия — риск блокировок. Ограничения: нельзя выполнять длительные операции (API, email) внутри триггера, нельзя COMMIT/ROLLBACK. Сравнение синтаксиса в PostgreSQL (PL/pgSQL), SQL Server (T-SQL), MySQL, Oracle. Антипаттерны (слишком умный триггер, неожиданные побочные эффекты, модификация триггерной таблицы). Отладка (RAISE NOTICE, таблица отладки). Миграции данных: временное отключение триггеров."
quiz:
  title: Проверка знаний
  passingScore: 3
  questions:
  - question: Что такое триггер в БД?
    options:
    - Тип внешнего ключа
    - SQL-оператор для агрегации
    - Автоматически выполняемое действие при событии вроде INSERT, UPDATE или DELETE
    - Механизм CORS
    correctIndex: 2
    explanation: Trigger срабатывает реактивно на изменения данных.
  - question: Когда триггеры особенно полезны?
    options:
    - Когда нужно хранить файлы в объектном хранилище
    - Когда нужно автоматически поддерживать аудит, вычисляемые поля или целостность
    - Когда требуется pub/sub через брокер
    - Когда нужен полнотекстовый поиск
    correctIndex: 1
    explanation: Триггер позволяет запускать логику прямо при изменении записи.
  - question: Какой риск есть у триггеров?
    options:
    - Триггеры нельзя комбинировать с транзакциями
    - Триггеры отключают индексы
    - Триггеры работают только в NoSQL
    - Скрытая логика в БД может усложнить отладку и понимание поведения системы
    correctIndex: 3
    explanation: Важно документировать их влияние на данные.
  - question: Что должен понимать аналитик о триггерах?
    options:
    - Какие события их вызывают и какие побочные эффекты они производят
    - Только синтаксис CREATE TRIGGER
    - Только внутренний формат WAL
    - Только настройки Docker
    correctIndex: 0
    explanation: Иначе бизнес-логика в данных остаётся 'невидимой'.
---
## Введение: Страж, который не спит

Представьте, что у вас есть склад, на котором работает автоматическая система учета. Каждый раз, когда товар заезжает на склад или выезжает со склада, система должна:
- Обновить общий баланс товаров
- Записать операцию в журнал
- Проверить, не упал ли остаток ниже минимального порога
- При необходимости отправить уведомление менеджеру

Вы можете попросить кладовщика каждый раз вручную выполнять все эти действия. Но что, если он забудет? Что, если он сделает ошибку?

**Триггер** — это механизм базы данных, который автоматически выполняет заданный код при наступлении определенного события. Триггер "привязан" к таблице и срабатывает автоматически при вставке, обновлении или удалении строк. Вы не можете "забыть" вызвать триггер — база данных вызывает его сама.

Триггеры — это как автоматические стражи, которые следят за порядком и выполняют дополнительные действия без участия человека или приложения. Они гарантируют, что определенная логика будет выполнена всегда, независимо от того, как именно были изменены данные (через приложение, через консоль, через другую процедуру).

## Зачем нужны триггеры

### Аудит и логирование

Запись всех изменений в отдельную таблицу-журнал. Кто, когда и что изменил.

```sql
-- При обновлении цены товара записываем старую и новую цену в audit_log
CREATE TRIGGER audit_price_changes
AFTER UPDATE OF price ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, row_id, old_value, new_value, changed_at, changed_by)
    VALUES ('products', OLD.id, OLD.price, NEW.price, NOW(), CURRENT_USER);
END;
```

### Обеспечение бизнес-правил

Проверка сложных ограничений, которые невозможно выразить через стандартные CHECK.

```sql
-- При вставке заказа проверяем, что сумма заказа не превышает лимит клиента
CREATE TRIGGER check_order_limit
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_limit DECIMAL;
    SELECT credit_limit INTO v_limit FROM customers WHERE id = NEW.customer_id;
    IF NEW.total_amount > v_limit THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Сумма заказа превышает кредитный лимит';
    END IF;
END;
```

### Поддержание производных данных

Автоматическое обновление агрегированных или вычисляемых значений.

```sql
-- При изменении количества товара в заказе пересчитываем общую сумму заказа
CREATE TRIGGER recalc_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders SET total_amount = (
        SELECT SUM(quantity * price) FROM order_items WHERE order_id = NEW.order_id
    ) WHERE id = COALESCE(NEW.order_id, OLD.order_id);
END;
```

### Каскадные операции

Выполнение дополнительных действий при изменении данных.

```sql
-- При удалении пользователя автоматически удаляем его сессии
CREATE TRIGGER delete_user_sessions
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    DELETE FROM sessions WHERE user_id = OLD.id;
END;
```

### Синхронизация данных

Поддержание согласованности между разными таблицами или даже разными базами данных.

```sql
-- При изменении статуса заказа обновляем статус в смежной системе через внешний вызов
CREATE TRIGGER sync_order_status
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (OLD.status != NEW.status)
BEGIN
    -- Вызов внешнего API (в поддерживающих СУБД)
    PERFORM call_webhook('order_status_changed', NEW.id, NEW.status);
END;
```

## Типы триггеров

### По времени срабатывания

| Тип | Описание | Типичное использование |
| :--- | :--- | :--- |
| **BEFORE** | Срабатывает ДО выполнения операции | Валидация данных, модификация значений перед вставкой |
| **AFTER** | Срабатывает ПОСЛЕ выполнения операции | Логирование, каскадные обновления, аудит |
| **INSTEAD OF** | Выполняется ВМЕСТО операции | Для представлений (views), сложная логика вставки |

### По событию

| Событие | Описание |
| :--- | :--- |
| **INSERT** | Срабатывает при вставке новой строки |
| **UPDATE** | Срабатывает при обновлении строки (можно указать конкретные столбцы) |
| **DELETE** | Срабатывает при удалении строки |

### По уровню срабатывания

| Уровень | Описание |
| :--- | :--- |
| **FOR EACH ROW** | Срабатывает для каждой измененной строки |
| **FOR EACH STATEMENT** | Срабатывает один раз для всего оператора (даже если изменено 1000 строк) |

**Пример различия:**

```sql
-- UPDATE, который изменяет 1000 строк
UPDATE products SET price = price * 1.1 WHERE category = 'electronics';

-- FOR EACH ROW: триггер выполнится 1000 раз
-- FOR EACH STATEMENT: триггер выполнится 1 раз
```

## Синтаксис и базовая структура

Синтаксис триггеров сильно различается в разных СУБД. Ниже приведены примеры для самых популярных.

### PostgreSQL

```sql
-- Сначала создаем функцию, которую будет вызывать триггер
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Затем создаем триггер, привязанный к таблице
CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для аудита
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_audit(order_id, action, old_data, new_data, changed_at)
        VALUES (NEW.id, 'INSERT', NULL, row_to_json(NEW), NOW());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO order_audit(order_id, action, old_data, new_data, changed_at)
        VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO order_audit(order_id, action, old_data, new_data, changed_at)
        VALUES (OLD.id, 'DELETE', row_to_json(OLD), NULL, NOW());
    END IF;
    RETURN NULL;  -- Для AFTER-триггеров возвращаемое значение игнорируется
END;
$$;

CREATE TRIGGER trigger_log_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_changes();
```

### SQL Server

```sql
-- Триггер на обновление (BEFORE в SQL Server реализуется через INSTEAD OF)
CREATE TRIGGER trg_update_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users SET updated_at = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;

-- Триггер для аудита
CREATE TRIGGER trg_audit_orders
ON orders
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Вставка (таблица inserted содержит новые строки)
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO order_audit (order_id, action, new_data, changed_at)
        SELECT id, 'INSERT', CAST(CONCAT('{"id":', id, ',"total":', total_amount, '}') AS VARCHAR(MAX)), GETDATE()
        FROM inserted;
    END
    
    -- Обновление (есть и inserted, и deleted)
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO order_audit (order_id, action, old_data, new_data, changed_at)
        SELECT 
            i.id, 'UPDATE',
            CAST(CONCAT('{"total":', d.total_amount, '}') AS VARCHAR(MAX)),
            CAST(CONCAT('{"total":', i.total_amount, '}') AS VARCHAR(MAX)),
            GETDATE()
        FROM inserted i
        JOIN deleted d ON i.id = d.id
        WHERE i.total_amount != d.total_amount;
    END
    
    -- Удаление (таблица deleted содержит старые строки)
    IF EXISTS (SELECT * FROM deleted) AND NOT EXISTS (SELECT * FROM inserted)
    BEGIN
        INSERT INTO order_audit (order_id, action, old_data, changed_at)
        SELECT id, 'DELETE', CAST(CONCAT('{"id":', id, ',"total":', total_amount, '}') AS VARCHAR(MAX)), GETDATE()
        FROM deleted;
    END
END;
```

### MySQL

```sql
-- Триггер на обновление
DELIMITER //

CREATE TRIGGER update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END//

-- Триггер для проверки бизнес-правила
CREATE TRIGGER check_order_limit
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_limit DECIMAL(10,2);
    SELECT credit_limit INTO v_limit FROM customers WHERE id = NEW.customer_id;
    IF NEW.total_amount > v_limit THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order amount exceeds credit limit';
    END IF;
END//

DELIMITER ;
```

### Oracle

```sql
-- Триггер уровня строки
CREATE OR REPLACE TRIGGER update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSDATE;
END;
/

-- Триггер уровня оператора (FOR EACH STATEMENT)
CREATE OR REPLACE TRIGGER log_bulk_update
AFTER UPDATE ON products
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM products WHERE price > 1000;
    INSERT INTO admin_log(message, log_time)
    VALUES ('Bulk update completed. Products with price > 1000: ' || v_count, SYSDATE);
END;
/
```

## Специальные переменные в триггерах

В теле триггера доступны специальные переменные, которые содержат значения изменяемых строк.

| Переменная | Содержит | Доступна в |
| :--- | :--- | :--- |
| **NEW** | Новое значение строки (после операции) | INSERT, UPDATE |
| **OLD** | Старое значение строки (до операции) | UPDATE, DELETE |
| **TG_OP** | Тип операции ('INSERT', 'UPDATE', 'DELETE') | Все |
| **TG_TABLE_NAME** | Имя таблицы | Все |
| **TG_WHEN** | 'BEFORE' или 'AFTER' | Все |

**Пример использования в PostgreSQL:**

```sql
CREATE OR REPLACE FUNCTION universal_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO audit_log(
        table_name,
        operation,
        row_id,
        old_value,
        new_value,
        changed_at,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW(),
        CURRENT_USER
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;
```

## Порядок выполнения триггеров

Когда на одной таблице определено несколько триггеров, важно понимать порядок их выполнения.

### PostgreSQL

В PostgreSQL можно задать порядок с помощью ключевого слова `CONSTRAINT`:

```sql
-- Триггер с явным порядком
CREATE CONSTRAINT TRIGGER trigger_first
AFTER INSERT ON orders
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION first_function();

CREATE TRIGGER trigger_second
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION second_function();
-- Порядок: сначала триггеры с CONSTRAINT (в алфавитном порядке), потом обычные
```

### SQL Server

В SQL Server порядок выполнения не гарантирован (если не использовать `sp_settriggerorder`):

```sql
-- Установка порядка триггеров
EXEC sp_settriggerorder @triggername = 'trg_first', @order = 'First', @stmttype = 'INSERT';
EXEC sp_settriggerorder @triggername = 'trg_last', @order = 'Last', @stmttype = 'INSERT';
-- Остальные триггеры выполняются в произвольном порядке между First и Last
```

### Общие принципы

1. **BEFORE триггеры выполняются BEFORE (до) AFTER триггеров**
2. **Триггеры уровня STATEMENT выполняются до или после триггеров уровня ROW** (в зависимости от СУБД)
3. **Не полагайтесь на порядок без явного указания** — это источник трудноуловимых ошибок

## Каскадные триггеры и рекурсия

### Рекурсивные триггеры

Триггер может вызвать операцию, которая запускает другой триггер, который может запустить первый снова.

```sql
-- Пример рекурсии (опасно!)
CREATE TRIGGER update_parent
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
    UPDATE categories SET updated_at = NOW() WHERE id = NEW.parent_id;  -- Может вызвать этот же триггер!
END;
```

**Как управлять рекурсией:**

```sql
-- PostgreSQL: отключение рекурсии на уровне базы данных
ALTER DATABASE mydb SET session_replication_role = 'replica';  -- временно отключает триггеры

-- SQL Server: управление рекурсией
ALTER DATABASE mydb SET RECURSIVE_TRIGGERS ON;  -- или OFF

-- MySQL: управление через переменную
SET GLOBAL innodb_trx_rseg_n_slots_debug = 0;  -- косвенно
```

### Каскадные триггеры

Один триггер может запускать операции, которые запускают другие триггеры. Это может привести к неожиданным цепочкам.

```sql
-- Триггер на orders обновляет order_totals
-- Триггер на order_totals обновляет customer_balance
-- Триггер на customer_balance обновляет customer_rating
-- ... и так далее
```

**Рекомендации:**
- Избегайте длинных цепочек триггеров — они трудно отлаживаются
- Документируйте все каскадные зависимости
- Используйте отладочный вывод, чтобы понять, что происходит

## INSTEAD OF триггеры

Триггеры `INSTEAD OF` используются для представлений (views), особенно для обновляемых представлений, которые объединяют несколько таблиц.

```sql
-- PostgreSQL
CREATE VIEW active_orders AS
SELECT o.id, o.order_date, o.total_amount, c.name AS customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status != 'cancelled';

-- Триггер INSTEAD OF для вставки через представление
CREATE OR REPLACE FUNCTION insert_active_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer_id INT;
BEGIN
    -- Найти или создать клиента
    SELECT id INTO v_customer_id FROM customers WHERE name = NEW.customer_name;
    IF NOT FOUND THEN
        INSERT INTO customers (name) VALUES (NEW.customer_name) RETURNING id INTO v_customer_id;
    END IF;
    
    -- Вставить заказ
    INSERT INTO orders (id, customer_id, order_date, total_amount, status)
    VALUES (NEW.id, v_customer_id, NEW.order_date, NEW.total_amount, 'new');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_insert_active_order
INSTEAD OF INSERT ON active_orders
FOR EACH ROW
EXECUTE FUNCTION insert_active_order();

-- Теперь можно вставлять в представление!
INSERT INTO active_orders (id, order_date, total_amount, customer_name)
VALUES (100, NOW(), 500.00, 'Новый клиент');
```

## Производительность триггеров

### Цена триггеров

Триггеры добавляют накладные расходы на каждую операцию DML (INSERT, UPDATE, DELETE). Чем сложнее триггер, тем больше затраты.

| Тип триггера | Накладные расходы | Риски |
| :--- | :--- | :--- |
| Простой BEFORE (установка updated_at) | Минимальные | Почти нет |
| BEFORE с проверками | Низкие | Может замедлить пакетные операции |
| AFTER с дополнительными записями | Средние | Увеличивает время транзакции |
| AFTER с запросами к другим таблицам | Высокие | Блокировки, рост времени |
| Триггер на уровне STATEMENT | Ниже, чем ROW для массовых операций | Сложнее в реализации |
| Каскадные триггеры | Экспоненциально растут | Трудно прогнозировать |

### FOR EACH ROW vs FOR EACH STATEMENT

```sql
-- Операция обновления 10 000 строк
UPDATE products SET price = price * 1.1 WHERE category = 'electronics';

-- FOR EACH ROW: триггер выполнится 10 000 раз
-- FOR EACH STATEMENT: триггер выполнится 1 раз
```

**Когда использовать FOR EACH ROW:**
- Нужен доступ к OLD и NEW значениям каждой строки
- Логика зависит от конкретных измененных значений

**Когда использовать FOR EACH STATEMENT:**
- Нужно выполнить одно действие для всей операции (например, отправить одно уведомление)
- Нет доступа к индивидуальным OLD/NEW (или не нужен)

### Влияние на блокировки

Триггеры выполняются в контексте той же транзакции, что и вызвавшая их операция. Это означает, что:
- Блокировки, установленные основной операцией, сохраняются на время выполнения триггера
- Дополнительные операции в триггере могут устанавливать новые блокировки
- Длительные триггеры увеличивают время удержания блокировок

## Триггеры и миграции данных

При массовых операциях (начальная загрузка данных, миграции) триггеры могут стать серьезной проблемой.

### Проблема

```sql
-- Миграция: вставка 1 000 000 строк
INSERT INTO orders (customer_id, total_amount, created_at)
SELECT customer_id, total_amount, NOW() FROM old_orders;

-- Если есть триггер на аудит, он вставит 1 000 000 записей в audit_log
-- Время выполнения может вырасти с 1 минуты до 1 часа
```

### Решения

**Временное отключение триггеров:**

```sql
-- PostgreSQL
ALTER TABLE orders DISABLE TRIGGER ALL;
-- выполнить массовую операцию
ALTER TABLE orders ENABLE TRIGGER ALL;

-- SQL Server
DISABLE TRIGGER trg_audit_orders ON orders;
-- выполнить массовую операцию
ENABLE TRIGGER trg_audit_orders ON orders;

-- MySQL
SET @OLD_TRIGGER_CHECKS = @@SESSION.TRIGGER_CHECKS;
SET SESSION TRIGGER_CHECKS = 0;
-- выполнить массовую операцию
SET SESSION TRIGGER_CHECKS = @OLD_TRIGGER_CHECKS;
```

**Специальный режим миграции:**

```sql
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
WHEN (current_setting('myapp.migration_mode') != 'true')  -- PostgreSQL
BEGIN
    -- логика аудита, которая не выполняется в режиме миграции
END;
```

## Отладка триггеров

Отладка триггеров сложнее, чем отладка обычного кода, потому что триггеры вызываются автоматически и не всегда очевидно, какой триггер сработал.

### Вывод отладочной информации

```sql
-- PostgreSQL
RAISE NOTICE 'Trigger fired: %, operation: %, row_id: %', TG_NAME, TG_OP, NEW.id;

-- SQL Server
PRINT 'Trigger fired: ' + CAST(ROWCOUNT_BIG() AS VARCHAR);

-- MySQL
DECLARE v_message VARCHAR(255) DEFAULT CONCAT('Trigger fired, affected rows: ', ROW_COUNT());
SIGNAL SQLSTATE '01000' SET MESSAGE_TEXT = v_message;  -- предупреждение вместо ошибки
```

### Таблица для отладки

```sql
CREATE TABLE trigger_debug (
    id SERIAL PRIMARY KEY,
    trigger_name VARCHAR(100),
    event_time TIMESTAMP DEFAULT NOW(),
    message TEXT,
    data JSONB
);

-- В триггере
INSERT INTO trigger_debug (trigger_name, message, data)
VALUES (TG_NAME, 'Order updated', row_to_json(NEW));
```

### Поиск активных триггеров

```sql
-- PostgreSQL
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    tgtype,
    tgfoid::regproc AS function_name
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass AND NOT tgisinternal;

-- SQL Server
SELECT 
    name AS trigger_name,
    OBJECT_NAME(parent_id) AS table_name,
    is_disabled
FROM sys.triggers
WHERE parent_class = 1;  -- 1 = таблица
```

## Ограничения и антипаттерны триггеров

### Чего нельзя делать в триггерах

| Ограничение | Почему |
| :--- | :--- |
| Длинные операции (API-вызовы, отправка email) | Триггер выполняется в транзакции. Длительные операции увеличивают время блокировок |
| Запросы к тем же таблицам без осторожности | Можно получить бесконечную рекурсию или взаимные блокировки |
| COMMIT/ROLLBACK внутри триггера | Триггер наследует транзакцию вызвавшей операции. COMMIT внутри триггера нарушит атомарность |
| Изменение таблицы, на которой висит триггер (DDL) | Может привести к ошибкам или рекурсии |
| Предположение о порядке строк | В операциях, изменяющих множество строк, порядок не гарантирован |

### Антипаттерны

**Антипаттерн 1: Слишком умный триггер**

```sql
-- Плохо: триггер делает слишком много всего
CREATE TRIGGER order_processing
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    -- Проверка кредитного лимита
    -- Обновление остатков на складе
    -- Отправка email клиенту (через внешний вызов)
    -- Запись в аудит
    -- Обновление агрегатов
    -- Вызов вебхука
END;
```

**Как исправить:** Триггер должен делать одно действие. Сложную логику выносить в процедуры, которые триггер вызывает.

**Антипаттерн 2: Неожиданные побочные эффекты**

```sql
-- Триггер, который "тихо" изменяет данные
CREATE TRIGGER auto_correct_status
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND NEW.paid = false THEN
        SET NEW.status = 'pending';  -- Тихо меняем статус обратно
    END IF;
END;
```

**Как исправить:** Побочные эффекты триггера должны быть очевидны и задокументированы. Лучше явно выбрасывать ошибку, чем "тихо" менять данные.

**Антипаттерн 3: Триггеры, изменяющие триггерную таблицу**

```sql
-- Плохо: обновление той же таблицы в триггере (кроме BEFORE UPDATE)
CREATE TRIGGER update_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = NOW() WHERE id = NEW.id;  -- Рекурсия!
END;
```

**Как исправить:** Использовать BEFORE UPDATE для модификации текущей строки, а не отдельный UPDATE.

```sql
-- Хорошо
CREATE TRIGGER update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END;
```

## Триггеры в разных СУБД: Сравнение

| Характеристика | PostgreSQL | SQL Server | MySQL | Oracle |
| :--- | :--- | :--- | :--- | :--- |
| **Язык триггеров** | PL/pgSQL + другие | T-SQL | SQL/PSM | PL/SQL |
| **BEFORE триггеры** | Да | Нет (только INSTEAD OF) | Да | Да |
| **AFTER триггеры** | Да | Да | Да | Да |
| **INSTEAD OF** | Да | Да | Нет (только для views) | Да |
| **Триггеры уровня STATEMENT** | Да | Да | Нет | Да |
| **Обновление NEW в BEFORE** | Да | Н/Д | Да | Да (через :NEW) |
| **Доступ к OLD/NEW** | OLD, NEW | inserted, deleted | OLD, NEW | :OLD, :NEW |
| **Отключение триггеров** | ALTER TABLE DISABLE | DISABLE TRIGGER | DISABLE TRIGGER | ALTER TRIGGER DISABLE |
| **Следование триггеров** | Можно задать | sp_settriggerorder | Порядок создания | FOLLOWS/PRECEDES |

## Резюме для системного аналитика

1. **Триггер — это автоматическое действие при событии в таблице.** Он срабатывает при INSERT, UPDATE или DELETE, до или после операции, для каждой строки или для всего оператора.

2. **Основные применения:** аудит и логирование, проверка бизнес-правил, поддержание производных данных, каскадные операции, синхронизация данных.

3. **BEFORE триггеры** используются для валидации и модификации данных до их сохранения. **AFTER триггеры** — для действий, которые должны произойти после сохранения (аудит, каскады).

4. **INSTEAD OF триггеры** позволяют выполнять вставку/обновление/удаление в представлениях (views), особенно в тех, которые объединяют несколько таблиц.

5. **FOR EACH ROW vs FOR EACH STATEMENT:** строчные триггеры выполняются для каждой измененной строки, операторные — один раз на оператор. Для массовых операций операторные триггеры значительно производительнее.

6. **Триггеры выполняются в транзакции вызвавшей операции.** Это значит, что:
   - Откат операции откатывает и изменения, сделанные триггером
   - Длительные триггеры увеличивают время удержания блокировок
   - COMMIT/ROLLBACK внутри триггера обычно запрещены или опасны

7. **Каскадные триггеры и рекурсия** — источник сложных ошибок. Избегайте длинных цепочек и документируйте зависимости.

8. **Триггеры не должны содержать длительных операций** (внешние API, сложные вычисления, ожидания). Это увеличивает время транзакции и блокировки.

9. **При массовых миграциях данных триггеры лучше отключать.** Иначе время выполнения может вырасти на порядки.