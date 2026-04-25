---
title: REST endpoint
weight: 60
description: REST endpoint для создания заявки на досрочное расторжение договора
---

## Назначение

Endpoint предназначен для создания заявки на досрочное расторжение договора из личного кабинета клиента.

## Метод

```http
POST /api/v1/contracts/{contractId}/termination-requests
```

## Авторизация

Требуется.

API Gateway должен получать `customerId` из авторизационного контекста пользователя. Передавать `customerId` в теле запроса запрещено.

## Path parameters

| Параметр | Тип | Обязательность | Описание | Пример |
|---|---|---:|---|---|
| `contractId` | string UUID | Да | Идентификатор договора | `9f4d7b1a-7e8a-4c5e-91b1-1d73f9e25c01` |

## Headers

| Header | Тип | Обязательность | Описание | Пример |
|---|---|---:|---|---|
| `Authorization` | string | Да | JWT-токен пользователя | `Bearer eyJ...` |
| `Idempotency-Key` | string UUID | Да | Ключ идемпотентности запроса | `6a7c8e9a-0a4d-4a72-8c3e-61dbf9023311` |
| `X-Correlation-Id` | string UUID | Нет | Идентификатор трассировки | `3e4b5a27-8888-4e9a-9111-926b97e2d123` |

## Request body

```json
{
  "reasonCode": "CLIENT_INITIATIVE",
  "desiredTerminationDate": "2026-05-15",
  "bankDetails": {
    "bik": "044525225",
    "accountNumber": "40817810099910004312",
    "recipientName": "Иванов Иван Иванович"
  },
  "comment": "Прошу расторгнуть договор по личной инициативе.",
  "documentIds": [
    "4dc4ef79-863e-4b36-8bc4-e5a27fd73291"
  ]
}
```

## Request body parameters

| Параметр | Тип | Обязательность | Описание | Ограничения |
|---|---|---:|---|---|
| `reasonCode` | string enum | Да | Код причины расторжения | Значение из справочника причин |
| `desiredTerminationDate` | string date | Да | Желаемая дата расторжения | Формат `YYYY-MM-DD`, не раньше текущей даты |
| `bankDetails` | object | Да | Банковские реквизиты для возврата | Объект обязателен |
| `bankDetails.bik` | string | Да | БИК банка | Ровно 9 цифр |
| `bankDetails.accountNumber` | string | Да | Номер счета | Ровно 20 цифр |
| `bankDetails.recipientName` | string | Да | Получатель | От 1 до 255 символов |
| `comment` | string | Нет | Комментарий клиента | До 1000 символов |
| `documentIds` | array[string UUID] | Нет | Идентификаторы загруженных документов | До 10 элементов |

## Response 201 Created

```json
{
  "requestId": "b65b7759-9f02-4d71-a75e-4bb8e98c7d03",
  "requestNumber": "TR-2026-000001",
  "status": "SUBMITTED",
  "createdAt": "2026-04-25T10:15:30Z",
  "message": "Заявка на расторжение договора принята в работу. Номер заявки: TR-2026-000001."
}
```

## Response parameters

| Параметр | Тип | Обязательность | Описание |
|---|---|---:|---|
| `requestId` | string UUID | Да | Идентификатор заявки |
| `requestNumber` | string | Да | Номер заявки для отображения клиенту |
| `status` | string enum | Да | Статус заявки |
| `createdAt` | string datetime | Да | Дата и время создания заявки |
| `message` | string | Да | Сообщение для пользователя |

## Error response

```json
{
  "errorCode": "ACTIVE_REQUEST_ALREADY_EXISTS",
  "message": "По договору уже создана активная заявка на расторжение.",
  "correlationId": "3e4b5a27-8888-4e9a-9111-926b97e2d123",
  "details": [
    {
      "field": "contractId",
      "reason": "Active termination request already exists for this contract"
    }
  ]
}
```

## HTTP statuses

| HTTP status | Когда возвращается |
|---:|---|
| `201 Created` | Заявка успешно создана |
| `200 OK` | Повторный идемпотентный запрос, возвращена ранее созданная заявка |
| `400 Bad Request` | Ошибка формата запроса или валидации |
| `401 Unauthorized` | Пользователь не авторизован |
| `403 Forbidden` | Договор не принадлежит пользователю |
| `404 Not Found` | Договор не найден |
| `409 Conflict` | По договору уже есть активная заявка |
| `422 Unprocessable Entity` | Бизнес-валидация не пройдена |
| `500 Internal Server Error` | Внутренняя ошибка |
| `503 Service Unavailable` | Backend-сервис недоступен |
