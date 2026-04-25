---
title: Mapping REST to gRPC
weight: 80
description: Маппинг REST-запроса API Gateway в gRPC-запрос backend-сервиса
---

## Назначение

Документ описывает правила преобразования REST-запроса, полученного API Gateway от Frontend, в gRPC-запрос к `ContractTerminationService.CreateTerminationRequest`.

## REST → gRPC request mapping

| REST source | REST field | gRPC field | Правило маппинга |
|---|---|---|---|
| Path | `contractId` | `contract_id` | Передать без изменений после проверки UUID |
| Auth context | `customerId` | `customer_id` | Получить из авторизационного контекста, не из request body |
| Body | `reasonCode` | `reason_code` | Передать без изменений |
| Body | `desiredTerminationDate` | `desired_termination_date` | Передать в формате `YYYY-MM-DD` |
| Body | `bankDetails.bik` | `bank_details.bik` | Передать без изменений |
| Body | `bankDetails.accountNumber` | `bank_details.account_number` | Передать без изменений |
| Body | `bankDetails.recipientName` | `bank_details.recipient_name` | Передать без изменений |
| Body | `comment` | `comment` | Если поле не передано, передать пустую строку |
| Body | `documentIds[]` | `document_ids[]` | Если не передано, передать пустой массив |
| Header | `Idempotency-Key` | `idempotency_key` | Передать без изменений |
| Header | `X-Correlation-Id` | `correlation_id` | Если не передан, сгенерировать UUID на API Gateway |
| Header / metadata | `X-Client-Type` | `source` | `web` → `REQUEST_SOURCE_WEB`, `mobile` → `REQUEST_SOURCE_MOBILE`, иначе `REQUEST_SOURCE_UNSPECIFIED` |

## gRPC → REST response mapping

| gRPC field | REST field | Правило маппинга |
|---|---|---|
| `request_id` | `requestId` | Передать как UUID string |
| `request_number` | `requestNumber` | Передать без изменений |
| `status` | `status` | Преобразовать enum gRPC в REST enum |
| `created_at` | `createdAt` | Преобразовать в ISO 8601 datetime |
| `idempotent_replay` | - | Использовать для выбора HTTP-статуса |

## Правила выбора HTTP-статуса

| Условие | HTTP status |
|---|---:|
| `idempotent_replay = false` | `201 Created` |
| `idempotent_replay = true` | `200 OK` |

## Маппинг статусов заявки

| gRPC enum | REST enum |
|---|---|
| `TERMINATION_REQUEST_STATUS_DRAFT` | `DRAFT` |
| `TERMINATION_REQUEST_STATUS_SUBMITTED` | `SUBMITTED` |
| `TERMINATION_REQUEST_STATUS_IN_REVIEW` | `IN_REVIEW` |
| `TERMINATION_REQUEST_STATUS_WAITING_FOR_DOCUMENTS` | `WAITING_FOR_DOCUMENTS` |
| `TERMINATION_REQUEST_STATUS_APPROVED` | `APPROVED` |
| `TERMINATION_REQUEST_STATUS_REJECTED` | `REJECTED` |
| `TERMINATION_REQUEST_STATUS_CANCELLED` | `CANCELLED` |
| `TERMINATION_REQUEST_STATUS_COMPLETED` | `COMPLETED` |
| `TERMINATION_REQUEST_STATUS_UNSPECIFIED` | `UNKNOWN` |

## Маппинг ошибок gRPC → REST

| gRPC code | Business error code | HTTP status | REST `errorCode` |
|---|---|---:|---|
| `INVALID_ARGUMENT` | `VALIDATION_ERROR` | `400` | `VALIDATION_ERROR` |
| `NOT_FOUND` | `CONTRACT_NOT_FOUND` | `404` | `CONTRACT_NOT_FOUND` |
| `PERMISSION_DENIED` | `ACCESS_DENIED` | `403` | `ACCESS_DENIED` |
| `FAILED_PRECONDITION` | `CONTRACT_NOT_ACTIVE` | `422` | `CONTRACT_NOT_ACTIVE` |
| `ALREADY_EXISTS` | `ACTIVE_REQUEST_ALREADY_EXISTS` | `409` | `ACTIVE_REQUEST_ALREADY_EXISTS` |
| `INVALID_ARGUMENT` | `INVALID_TERMINATION_DATE` | `422` | `INVALID_TERMINATION_DATE` |
| `INVALID_ARGUMENT` | `INVALID_BANK_DETAILS` | `422` | `INVALID_BANK_DETAILS` |
| `NOT_FOUND` | `DOCUMENT_NOT_FOUND` | `422` | `DOCUMENT_NOT_FOUND` |
| `UNAVAILABLE` | `SERVICE_UNAVAILABLE` | `503` | `SERVICE_UNAVAILABLE` |
| `INTERNAL` | `INTERNAL_ERROR` | `500` | `INTERNAL_ERROR` |

## Важные правила

### Не передавать `customerId` из тела запроса

`customerId` должен определяться только из авторизационного контекста. Это защищает систему от попытки создать заявку по чужому договору.

### Не логировать банковские реквизиты

При логировании REST и gRPC payload необходимо маскировать:

| Поле | Правило |
|---|---|
| `accountNumber` | Показывать только последние 5 символов |
| `recipientName` | Логировать по требованиям ИБ |
| `bik` | Можно логировать полностью, если ИБ не запрещает |

### Прокидывать `correlationId`

Если `X-Correlation-Id` передан Frontend, API Gateway должен использовать его. Если не передан, API Gateway должен сгенерировать новый идентификатор и передать его в gRPC.
