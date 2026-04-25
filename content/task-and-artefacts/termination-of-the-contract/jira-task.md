---
title: Описание задачи в Jira
weight: 140                    
description: Пример описания задачи в Jira на разработку
---

## Название задачи: "Реализовать создание заявки на досрочное расторжение договора"

## Описание задачи

Необходимо реализовать возможность создания заявки на досрочное расторжение договора из клиентского интерфейса.

Пользователь выбирает договор, заполняет данные для расторжения и отправляет заявку. Фронт вызывает REST endpoint API Gateway. API Gateway выполняет первичную валидацию, маппинг REST-запроса в gRPC-запрос и вызывает backend-сервис `ContractTerminationService`.

Детальное описание бизнес-контекста, требований, контрактов и сценариев приведено в связанных артефактах (прикрепить артефакты к задаче).

## Целевая схема реализации

В рамках задачи необходимо реализовать цепочку:


```
Frontend → REST API Gateway → gRPC ContractTerminationService → Database
```

Подробная последовательность вызовов описана в артефакте: [Sequence diagram](/task-and-artefacts/termination-of-the-contract/sequence-diagram/)
## Объем реализации

### API Gateway

Необходимо реализовать прием REST-запроса на создание заявки, первичную валидацию, получение пользовательского контекста, маппинг REST-запроса в gRPC-запрос, вызов backend-сервиса и преобразование ответа обратно в REST-формат.

Детали реализации см.:
- REST-контракт: [REST endpoint](/task-and-artefacts/termination-of-the-contract/rest/)
- маппинг REST → gRPC: [Mapping REST to gRPC](/task-and-artefacts/termination-of-the-contract/rest-to-grpc/)
- обработка ошибок: [Ошибки](/task-and-artefacts/termination-of-the-contract/errors/)
- NFR: [NFR](/task-and-artefacts/termination-of-the-contract/nfr/)
### Backend-сервис

Необходимо реализовать gRPC-метод создания заявки на досрочное расторжение договора.

Backend-сервис должен выполнить бизнес-проверки, создать заявку, сохранить необходимые данные и вернуть результат создания в API Gateway.

Детали реализации см.:
- gRPC-контракт: [gRPC method](/task-and-artefacts/termination-of-the-contract/grpc/)
- функциональные требования: [FR](/task-and-artefacts/termination-of-the-contract/fr/)
- статусы заявки: [Статусы](/task-and-artefacts/termination-of-the-contract/statuses/)
- модель данных: [Модель данных](/task-and-artefacts/termination-of-the-contract/data-model/)
- справочники: [Справочники](/task-and-artefacts/termination-of-the-contract/dictionary/)
### База данных

Необходимо предусмотреть хранение заявки на досрочное расторжение договора и связанных с ней документов.

Детальная структура сущностей, атрибутов и связей описана в артефакте: [Модель данных](/task-and-artefacts/termination-of-the-contract/data-model/).

## Основные функциональные ожидания

После реализации пользователь должен иметь возможность создать заявку на досрочное расторжение договора через клиентский интерфейс.

Система должна:

1. принять REST-запрос от фронта;
2. проверить корректность входных данных;
3. преобразовать REST-запрос в gRPC-запрос;
4. вызвать backend-сервис;
5. выполнить бизнес-проверки на стороне backend-сервиса;
6. создать заявку;
7. вернуть фронту результат создания заявки;
8. корректно обработать бизнесовые и технические ошибки.

Подробная функциональная логика описана в: [FR](/task-and-artefacts/termination-of-the-contract/fr/).

## Критерии приемки

### Успешное создание заявки

Пользователь может создать заявку на досрочное расторжение договора, если:

- пользователь авторизован;
- договор существует;
- договор принадлежит пользователю;
- договор допускает досрочное расторжение;
- по договору нет активной заявки на расторжение;
- переданы обязательные параметры.

Ожидаемый результат: заявка создана, фронт получает успешный ответ.

Детали см.:
- [FR](/task-and-artefacts/termination-of-the-contract/fr/)
- [UC](/task-and-artefacts/termination-of-the-contract/uc/)
- [REST endpoint](/task-and-artefacts/termination-of-the-contract/rest/)
- [gRPC method](/task-and-artefacts/termination-of-the-contract/grpc/)

## Требования к ошибкам

Все ошибки должны возвращаться в едином формате, описанном в артефакте: [Ошибки](/task-and-artefacts/termination-of-the-contract/errors/).

API Gateway должен выполнять маппинг gRPC-ошибок backend-сервиса в HTTP-ответы согласно правилам из указанного артефакта.