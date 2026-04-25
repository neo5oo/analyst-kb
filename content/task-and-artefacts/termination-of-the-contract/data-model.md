---
title: Модель данных
weight: 120
description: Логическая модель данных заявки на досрочное расторжение договора
---

## Назначение

Документ описывает логическую модель данных для хранения заявки на досрочное расторжение договора.

## Сущность `termination_request`

| Поле | Тип | Обязательность | Описание |
|---|---|---:|---|
| `id` | UUID | Да | Технический идентификатор заявки |
| `request_number` | string | Да | Человекочитаемый номер заявки |
| `contract_id` | UUID | Да | Идентификатор договора |
| `customer_id` | UUID | Да | Идентификатор клиента |
| `reason_code` | string | Да | Код причины расторжения |
| `desired_termination_date` | date | Да | Желаемая дата расторжения |
| `status` | string enum | Да | Статус заявки |
| `comment` | string | Нет | Комментарий клиента |
| `idempotency_key` | UUID | Да | Ключ идемпотентности |
| `source` | string enum | Да | Канал создания заявки |
| `created_at` | timestamp | Да | Дата и время создания |
| `updated_at` | timestamp | Да | Дата и время обновления |
| `created_by` | UUID | Да | Идентификатор пользователя, создавшего заявку |
| `updated_by` | UUID | Нет | Идентификатор пользователя, обновившего заявку |

## Сущность `termination_request_bank_details`

| Поле | Тип | Обязательность | Описание |
|---|---|---:|---|
| `id` | UUID | Да | Технический идентификатор записи |
| `termination_request_id` | UUID | Да | Ссылка на заявку |
| `bik` | string | Да | БИК банка |
| `account_number_encrypted` | string | Да | Зашифрованный номер счета |
| `account_number_masked` | string | Да | Маскированный номер счета |
| `recipient_name` | string | Да | Получатель |

## Сущность `termination_request_document`

| Поле | Тип | Обязательность | Описание |
|---|---|---:|---|
| `id` | UUID | Да | Технический идентификатор записи |
| `termination_request_id` | UUID | Да | Ссылка на заявку |
| `document_id` | UUID | Да | Идентификатор документа в файловом хранилище |
| `created_at` | timestamp | Да | Дата и время привязки документа |

## Индексы и ограничения

| Объект | Поля | Назначение |
|---|---|---|
| `termination_request.idx_contract_id` | `contract_id` | Поиск заявок по договору |
| `termination_request.idx_customer_id` | `customer_id` | Поиск заявок клиента |
| `termination_request.uid_request_number` | `request_number` | Уникальность номера заявки |
| `termination_request.uid_idempotency_key` | `idempotency_key` | Уникальность идемпотентного запроса |
| `termination_request.idx_contract_active_status` | `contract_id`, `status` | Поиск активной заявки по договору |

## Маскирование банковских реквизитов

Для отображения и логирования используется маскированный номер счета:

```text
***************04312
```

Полный номер счета должен храниться только в защищенном виде, если это требуется политиками безопасности.
