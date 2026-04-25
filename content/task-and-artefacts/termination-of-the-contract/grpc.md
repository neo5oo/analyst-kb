---
title: gRPC method
weight: 70
description: gRPC метод для создания заявки на досрочное расторжение договора
---

## Назначение

Метод предназначен для создания заявки на досрочное расторжение договора в backend-сервисе `ContractTerminationService`.

## Service

```proto
service ContractTerminationService {
  rpc CreateTerminationRequest(CreateTerminationRequestRequest)
      returns (CreateTerminationRequestResponse);
}
```

## Proto contract

```proto
syntax = "proto3";

package contract.termination.v1;

import "google/protobuf/timestamp.proto";

service ContractTerminationService {
  rpc CreateTerminationRequest(CreateTerminationRequestRequest)
      returns (CreateTerminationRequestResponse);
}

message CreateTerminationRequestRequest {
  string contract_id = 1;
  string customer_id = 2;
  string reason_code = 3;
  string desired_termination_date = 4;
  BankDetails bank_details = 5;
  string comment = 6;
  repeated string document_ids = 7;
  string idempotency_key = 8;
  string correlation_id = 9;
  RequestSource source = 10;
}

message BankDetails {
  string bik = 1;
  string account_number = 2;
  string recipient_name = 3;
}

enum RequestSource {
  REQUEST_SOURCE_UNSPECIFIED = 0;
  REQUEST_SOURCE_WEB = 1;
  REQUEST_SOURCE_MOBILE = 2;
}

message CreateTerminationRequestResponse {
  string request_id = 1;
  string request_number = 2;
  TerminationRequestStatus status = 3;
  google.protobuf.Timestamp created_at = 4;
  bool idempotent_replay = 5;
}

enum TerminationRequestStatus {
  TERMINATION_REQUEST_STATUS_UNSPECIFIED = 0;
  TERMINATION_REQUEST_STATUS_DRAFT = 1;
  TERMINATION_REQUEST_STATUS_SUBMITTED = 2;
  TERMINATION_REQUEST_STATUS_IN_REVIEW = 3;
  TERMINATION_REQUEST_STATUS_WAITING_FOR_DOCUMENTS = 4;
  TERMINATION_REQUEST_STATUS_APPROVED = 5;
  TERMINATION_REQUEST_STATUS_REJECTED = 6;
  TERMINATION_REQUEST_STATUS_CANCELLED = 7;
  TERMINATION_REQUEST_STATUS_COMPLETED = 8;
}
```

## Request parameters

| Поле | Тип | Обязательность | Описание |
|---|---|---:|---|
| `contract_id` | string UUID | Да | Идентификатор договора |
| `customer_id` | string UUID | Да | Идентификатор клиента из доверенного контура авторизации |
| `reason_code` | string | Да | Код причины расторжения |
| `desired_termination_date` | string date | Да | Желаемая дата расторжения в формате `YYYY-MM-DD` |
| `bank_details` | BankDetails | Да | Банковские реквизиты |
| `bank_details.bik` | string | Да | БИК банка |
| `bank_details.account_number` | string | Да | Номер счета |
| `bank_details.recipient_name` | string | Да | Получатель |
| `comment` | string | Нет | Комментарий клиента |
| `document_ids` | repeated string UUID | Нет | Идентификаторы документов |
| `idempotency_key` | string UUID | Да | Ключ идемпотентности |
| `correlation_id` | string UUID | Да | Идентификатор трассировки |
| `source` | RequestSource | Да | Канал, из которого пришла заявка |

## Response parameters

| Поле | Тип | Обязательность | Описание |
|---|---|---:|---|
| `request_id` | string UUID | Да | Идентификатор созданной заявки |
| `request_number` | string | Да | Номер заявки |
| `status` | TerminationRequestStatus | Да | Статус заявки |
| `created_at` | google.protobuf.Timestamp | Да | Дата и время создания заявки |
| `idempotent_replay` | bool | Да | Признак, что результат возвращен по повторному идемпотентному запросу |

## gRPC error codes

| gRPC code | Бизнес-код | Описание |
|---|---|---|
| `INVALID_ARGUMENT` | `VALIDATION_ERROR` | Некорректные входные параметры |
| `NOT_FOUND` | `CONTRACT_NOT_FOUND` | Договор не найден |
| `PERMISSION_DENIED` | `ACCESS_DENIED` | Договор не принадлежит клиенту |
| `FAILED_PRECONDITION` | `CONTRACT_NOT_ACTIVE` | Договор не активен |
| `ALREADY_EXISTS` | `ACTIVE_REQUEST_ALREADY_EXISTS` | По договору уже есть активная заявка |
| `INVALID_ARGUMENT` | `INVALID_TERMINATION_DATE` | Некорректная желаемая дата расторжения |
| `INVALID_ARGUMENT` | `INVALID_BANK_DETAILS` | Некорректные банковские реквизиты |
| `NOT_FOUND` | `DOCUMENT_NOT_FOUND` | Один или несколько документов не найдены |
| `INTERNAL` | `INTERNAL_ERROR` | Внутренняя ошибка сервиса |
| `UNAVAILABLE` | `SERVICE_UNAVAILABLE` | Зависимый сервис недоступен |

## Пример gRPC request

```json
{
  "contract_id": "9f4d7b1a-7e8a-4c5e-91b1-1d73f9e25c01",
  "customer_id": "2a6f3f3e-12a4-42aa-81ab-6b7f98ce1e22",
  "reason_code": "CLIENT_INITIATIVE",
  "desired_termination_date": "2026-05-15",
  "bank_details": {
    "bik": "044525225",
    "account_number": "40817810099910004312",
    "recipient_name": "Иванов Иван Иванович"
  },
  "comment": "Прошу расторгнуть договор по личной инициативе.",
  "document_ids": ["4dc4ef79-863e-4b36-8bc4-e5a27fd73291"],
  "idempotency_key": "6a7c8e9a-0a4d-4a72-8c3e-61dbf9023311",
  "correlation_id": "3e4b5a27-8888-4e9a-9111-926b97e2d123",
  "source": "REQUEST_SOURCE_WEB"
}
```
