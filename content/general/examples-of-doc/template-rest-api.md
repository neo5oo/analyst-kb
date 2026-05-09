---
title: "Шаблон REST API"
weight: 40
draft: false
description: "Шаблон описания REST API метода."
---

# Шаблон REST API

> REST API-документация описывает назначение метода, контракт запроса и ответа, параметры, бизнес-логику, ошибки, безопасность и обратную совместимость.

## Паспорт метода

| Поле | Значение |
|---|---|
| Сервис | `<service-name>` |
| Метод | `<GET / POST / PUT / PATCH / DELETE>` |
| Endpoint | `/<resource>/<id>/<action>` |
| Версия API | `v1` |
| Статус | `Draft / Review / Approved / Deprecated` |

## Назначение

Кратко опишите бизнес-смысл метода.

## Endpoint

```http
POST /api/v1/contracts/{contractId}/termination-requests
```

## Авторизация

| Параметр | Значение |
|---|---|
| Тип | `Bearer JWT / Basic / mTLS / API Key` |
| Требуемая роль | `<role>` |
| Требуемое право | `<permission>` |
| Объект проверки | `<object>` |

## Headers

| Header | Тип | Обяз. | Описание |
|---|---|---|---|
| Authorization | string | Да | `Bearer <token>` |
| X-Correlation-Id | string | Да | Сквозная трассировка |
| Idempotency-Key | string | Да / Нет | Ключ идемпотентности |
| Content-Type | string | Да | `application/json` |

## Path parameters

| Параметр | Тип | Обяз. | Описание | Пример |
|---|---|---|---|---|
| contractId | string | Да | Идентификатор договора | `123456` |

## Query parameters

| Параметр | Тип | Обяз. | Описание | Пример |
|---|---|---|---|---|
| includeDetails | boolean | Нет | Вернуть детальную информацию | `true` |

## Request body

```json
{
  "reasonCode": "CLIENT_REQUEST",
  "comment": "Заявление клиента",
  "requestedDate": "2026-05-09"
}
```

## Описание request body

| Поле | Тип | Обяз. | Правило | Описание |
|---|---|---|---|---|
| reasonCode | string | Да | Значение из справочника | Причина операции |
| comment | string | Нет | До 1000 символов | Комментарий |
| requestedDate | string | Да | `YYYY-MM-DD` | Дата операции |

## Response body

```json
{
  "requestId": "tr-12345",
  "status": "CREATED",
  "createdAt": "2026-05-09T12:00:00Z"
}
```

## Описание response body

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| requestId | string | Да | Идентификатор заявки |
| status | string | Да | Статус заявки |
| createdAt | string | Да | Дата создания |

## Бизнес-логика

1. Проверить авторизацию.
2. Проверить право `<permission>`.
3. Проверить существование объекта.
4. Проверить бизнес-правила.
5. Выполнить операцию.
6. Записать audit/log.
7. Вернуть результат.

## Ошибки

| HTTP status | Код ошибки | Условие |
|---|---|---|
| 400 | BAD_REQUEST | Некорректный JSON / параметры |
| 401 | UNAUTHORIZED | Не передан или невалиден token |
| 403 | FORBIDDEN | Нет прав |
| 404 | NOT_FOUND | Объект не найден |
| 409 | CONFLICT | Конфликт состояния |
| 422 | VALIDATION_ERROR | Ошибка бизнес-валидации |
| 500 | INTERNAL_ERROR | Внутренняя ошибка |

## Формат ошибки

```json
{
  "errorCode": "CONTRACT_NOT_FOUND",
  "message": "Договор не найден",
  "correlationId": "c7b8e7d2-9c1f-4c5a-bc6d-6b4e2d7a0001",
  "details": [
    { "field": "contractId", "reason": "Object not found" }
  ]
}
```

## Идемпотентность

| Параметр | Значение |
|---|---|
| Поддерживается | Да / Нет |
| Ключ | `Idempotency-Key` |
| Повтор с тем же payload | Вернуть ранее созданный результат |
| Повтор с другим payload | Вернуть `409 IDEMPOTENCY_KEY_CONFLICT` |

## Логирование и метрики

| Событие / метрика | Что фиксировать |
|---|---|
| Входящий запрос | method, path, userId, correlationId |
| Успешный ответ | status, durationMs, correlationId |
| Ошибка | errorCode, correlationId |
| Метрики | request count, latency, error rate |

## OpenAPI-фрагмент

```yaml
paths:
  /api/v1/contracts/{contractId}/termination-requests:
    post:
      summary: Создание заявки
      parameters:
        - name: contractId
          in: path
          required: true
          schema:
            type: string
      responses:
        "201":
          description: Заявка создана
```

## Обратная совместимость

| Изменение | Breaking change? |
|---|---|
| Добавить необязательное поле response | Нет |
| Удалить поле response | Да |
| Изменить тип поля | Да |
| Добавить новое значение enum | Возможно, проверить клиентов |

## Открытые вопросы

| ID | Вопрос | Кому адресован | Статус |
|---|---|---|---|
| Q-001 | `<вопрос>` | `<роль / ФИО>` | Открыт |

## Критерии приемки документа

| ID | Критерий |
|---|---|
| AC-DOC-001 | Документ согласован с владельцем продукта / архитектором / разработкой, если применимо. |
| AC-DOC-002 | Все спорные места вынесены в открытые вопросы или зафиксированы как ограничения. |
| AC-DOC-003 | В документе нет неоднозначных формулировок вроде "быстро", "удобно", "корректно" без измеримого критерия. |
