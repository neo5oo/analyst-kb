---
title: С чего начать
weight: 1                    
draft: false
description: "С чего начать изучение системного анализа? Эта страница — ваш персональный навигатор по базе знаний. Если вы только входите в профессию, не пытайтесь объять необъятное. Вместо этого пройдите по готовому пути: от понимания роли аналитика и работы с требованиями до моделирования, API и архитектуры. Просто идите по этапам сверху вниз, и вы соберете прочный фундамент без выгорания."
---

Эта страница помогает пройти базу знаний без хаоса. Если ты только начинаешь изучать системный анализ, не нужно открывать все разделы подряд. Сначала важно собрать фундамент: понять роль аналитика, жизненный цикл разработки, требования, документацию, моделирование, API, данные и базовую архитектуру.

Люди с опытом могут пользоваться сайтом как справочником через поиск. Новичку лучше идти по маршруту ниже.

## Как пользоваться роадмапом

Иди по этапам сверху вниз. Не пытайся изучить все материалы раздела сразу. На каждом этапе есть обязательный минимум и дополнительные темы.

Принцип простой:

```text
Понять роль → научиться работать с требованиями → описывать процессы → понимать данные → понимать API → понимать интеграции → видеть архитектуру системы
```

## Этап 1. Понять профессию системного аналитика

Цель этапа — понять, кто такой системный аналитик, чем он отличается от бизнес-аналитика, где он находится в команде и какие артефакты создает.

### Что изучить

| Материал                                                                                       | Зачем читать                                                               |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Кто такой системный аналитик](/introduction/who-is-system-analyst/)                           | Понять роль, зону ответственности и результат работы СА                    |
| [Кто такой бизнес-аналитик](/introduction/who-is-business-analyst/)                            | Понять соседнюю роль и не путать бизнес-анализ с системным анализом        |
| [Бизнес-аналитик vs системный аналитик](/introduction/ba_vs_sa/)                               | Разобраться в границе между бизнес-требованиями и технической детализацией |
| [Роли в команде и коммуникация](/introduction/team-roles-and-communication/)                   | Понять, с кем аналитик взаимодействует каждый день                         |
| [SDLC](/introduction/sdlc/)                                                                    | Понять жизненный цикл разработки ПО                                        |
| [Методологии разработки](/introduction/methodologies/)                                         | Понять Agile, Scrum, Kanban и место аналитика в процессе                   |
| [Требования и артефакты документации](/introduction/requirements-and-documentation-artifacts/) | Понять, какие документы и описания делает аналитик                         |
| [Обзор инструментов](/introduction/tools-overview/)                                            | Понять базовый набор инструментов аналитика                                |

### Что должно стать понятно

После этого этапа ты должен уметь объяснить:

- чем занимается системный аналитик;
- чем системный аналитик отличается от бизнес-аналитика;
- что такое SDLC;
- на каких этапах разработки участвует аналитик;
- какие документы и артефакты обычно готовит аналитик;
- с кем аналитик взаимодействует в команде.

## Этап 2. Научиться работать с требованиями

Цель этапа — понять, как из бизнес-идеи получить понятные требования для разработки.

### Что изучить

| Материал | Зачем читать |
|---|---|
| [BRD, FRD, SRS](/requirements/brd-frd-srs/) | Понять виды документов с требованиями |
| [Сбор требований](/requirements/collecting-requirements/) | Понять, откуда берутся требования и как их уточнять |
| [Приоритизация требований](/requirements/prioritization/) | Понять, почему не все требования делают сразу |
| [Бизнес-требования](/requirements/types-of-requirement/business-requirements/) | Понять уровень целей бизнеса |
| [Пользовательские требования](/requirements/types-of-requirement/user-requirements/) | Понять потребности пользователей |
| [Функциональные требования](/requirements/types-of-requirement/functional/) | Научиться описывать поведение системы |
| [Нефункциональные требования](/requirements/types-of-requirement/non-functional/) | Понять требования к качеству системы |
| [Бизнес-правила](/requirements/types-of-requirement/business-rules/) | Понять ограничения и правила предметной области |
| [User Story](/requirements/user-story/user-story/) | Понять формат пользовательской истории |
| [Acceptance Criteria](/requirements/user-story/acceptance-criteria/) | Научиться фиксировать критерии приемки |
| [INVEST](/requirements/user-story/invest/) | Проверять качество User Story |
| [Use Case](/requirements/use-case/) | Описывать пользовательские сценарии более детально |

### Что должно стать понятно

После этого этапа ты должен уметь:

- отличать бизнес-требования, пользовательские требования, функциональные и нефункциональные требования;
- формулировать простую User Story;
- писать Acceptance Criteria;
- понимать, когда использовать User Story, а когда Use Case;
- отличать требование от решения;
- задавать уточняющие вопросы бизнесу и команде.

## Этап 3. Научиться моделировать процессы и систему

Цель этапа — научиться показывать систему не только текстом, но и схемами. Это важно, потому что схемы помогают быстрее договориться с бизнесом, разработкой, тестированием и архитектурой.

### Что изучить

| Материал | Зачем читать |
|---|---|
| [BPMN](/modeling/bpmn/) | Описывать бизнес-процессы и пользовательские процессы |
| [UML](/modeling/uml/) | Описывать структуру и поведение системы |
| [C4](/modeling/c4/) | Показывать архитектуру системы на разных уровнях детализации |
| [EPC](/modeling/epc/) | Понимать событийные цепочки процессов |
| [IDEF](/modeling/idef/) | Познакомиться с классическим подходом к функциональному моделированию |
| [Event Storming](/modeling/event-storming/) | Понимать доменные события и совместное моделирование предметной области |

### Что должно стать понятно

После этапа ты должен уметь:

- читать простую BPMN-схему;
- отличать процесс от сценария;
- понимать, зачем нужны UML-диаграммы;
- понимать, чем C4 отличается от UML;
- выбирать тип схемы под задачу;
- не рисовать схемы ради схем.

## Этап 4. Разобраться с данными и SQL

Цель этапа — понять, как системы хранят данные, как устроены базы данных и как аналитик может читать данные через SQL.

### Что изучить в первую очередь

| Материал | Зачем читать |
|---|---|
| [Основы баз данных](/data-and-sql/database-basics/) | Понять, что такое база данных и зачем она нужна |
| [Основы проектирования баз данных](/data-and-sql/basics-database-design/) | Понять базовый подход к структуре данных |
| [Реляционные БД](/data-and-sql/relational-databases/what-is-rdbms/) | Понять таблицы, строки, столбцы и связи |
| [Ключи](/data-and-sql/relational-databases/database-schema-design/key/) | Понять primary key, foreign key и связи между таблицами |
| [Нормализация](/data-and-sql/relational-databases/database-schema-design/normalization/) | Понять, как уменьшать дублирование данных |
| [ER-диаграмма](/data-and-sql/relational-databases/database-schema-design/entity-relationship-diagram/) | Научиться читать и проектировать структуру данных |
| [Что такое SQL](/data-and-sql/sql/what-is-sql/) | Понять язык работы с реляционными БД |
| [JOIN](/data-and-sql/sql/joins/) | Научиться связывать данные из разных таблиц |
| [Агрегация и группировка](/data-and-sql/sql/aggregation-grouping/) | Понять GROUP BY, COUNT, SUM, AVG |
| [Подзапросы](/data-and-sql/sql/subqueries/) | Понять вложенные запросы |
| [Оконные функции](/data-and-sql/sql/window-functions/) | Разобраться с аналитическими запросами |

### Что изучить после базы

| Материал | Зачем читать |
|---|---|
| [Транзакции](/data-and-sql/relational-databases/transactions/what-is-transaction/) | Понять атомарность изменений в БД |
| [ACID](/data-and-sql/relational-databases/transactions/acid/) | Понять надежность транзакций |
| [Уровни изоляции](/data-and-sql/relational-databases/transactions/isolation-levels/) | Понять конкурентный доступ к данным |
| [Аномалии транзакций](/data-and-sql/relational-databases/transactions/transaction-anomalies/) | Понять, какие проблемы бывают при параллельной работе |
| [Индексы](/data-and-sql/relational-databases/indexes/how-indexes-work/) | Понять ускорение поиска данных |
| [Реляционные vs нереляционные БД](/data-and-sql/relational-vs-norelational/) | Понять, когда нужны разные подходы к хранению |
| [NoSQL](/data-and-sql/norelational-databases/what-is-nosql/) | Познакомиться с нереляционными БД |

### Что должно стать понятно

После этапа ты должен уметь:

- читать простую структуру БД;
- понимать связи между таблицами;
- писать базовые SELECT-запросы;
- использовать JOIN;
- понимать primary key и foreign key;
- читать ER-диаграммы;
- понимать, зачем нужны индексы и транзакции.

## Этап 5. Разобраться с API и интеграциями

Цель этапа — понять, как системы общаются друг с другом, как проектировать API и как описывать интеграционные взаимодействия.

### Что изучить в первую очередь

| Материал | Зачем читать |
|---|---|
| [Что такое API](/api-and-integrations/what-is-api/) | Понять базовую идею взаимодействия систем |
| [REST: принципы](/api-and-integrations/api-styles-protocols/rest/rest-principles/) | Понять самый распространенный стиль API |
| [Ресурсы](/api-and-integrations/api-styles-protocols/rest/resources/) | Научиться мыслить сущностями в REST |
| [HTTP-методы](/api-and-integrations/api-styles-protocols/rest/http-methods/) | Понять GET, POST, PUT, PATCH, DELETE |
| [HTTP-статусы](/api-and-integrations/api-styles-protocols/rest/http-status-codes/) | Понять ответы API и ошибки |
| [Идемпотентность](/api-and-integrations/api-styles-protocols/rest/idempotency/) | Понять безопасные повторы запросов |
| [Пагинация](/api-and-integrations/api-styles-protocols/rest/pagination/) | Понять выдачу больших списков |
| [Фильтрация и сортировка](/api-and-integrations/api-styles-protocols/rest/filtering-sorting/) | Понять параметры поиска и отбора данных |
| [Версионирование API](/api-and-integrations/api-styles-protocols/rest/api-versioning/) | Понять развитие API без поломки клиентов |
| [JSON](/api-and-integrations/data-formats/json/) | Понять основной формат обмена данными |
| [OpenAPI](/api-and-integrations/api-documentation/openapi/) | Научиться читать и описывать REST API |
| [Postman](/api-and-integrations/api-documentation/postman/) | Научиться проверять API руками |

### Что изучить после REST

| Материал | Зачем читать |
|---|---|
| [gRPC: основные понятия](/api-and-integrations/api-styles-protocols/grpc/grpc-concepts/) | Понять контрактное взаимодействие через protobuf |
| [gRPC vs REST](/api-and-integrations/api-styles-protocols/grpc/grpc-vs-rest/) | Понять различия подходов |
| [Типы вызовов gRPC](/api-and-integrations/api-styles-protocols/grpc/grpc-call-types/) | Понять unary и streaming-вызовы |
| [GraphQL: основные понятия](/api-and-integrations/api-styles-protocols/graphql/graphql-concepts/) | Познакомиться с альтернативным подходом к API |
| [SOAP](/api-and-integrations/api-styles-protocols/soap/what-is-soap/) | Понять legacy/enterprise-интеграции |
| [Webhook](/api-and-integrations/api-styles-protocols/webhooks/what-are-webhooks/) | Понять обратные вызовы между системами |
| [WebSocket](/api-and-integrations/api-styles-protocols/websokets/what-are-websockets/) | Понять двустороннее realtime-взаимодействие |

### Безопасность API

| Материал | Зачем читать |
|---|---|
| [Аутентификация](/api-and-integrations/api-security/authentication/) | Понять, кто пользователь или система |
| [Авторизация](/api-and-integrations/api-security/authorization/) | Понять, что пользователю разрешено |
| [HTTPS/TLS](/api-and-integrations/api-security/https-tls/) | Понять защищенную передачу данных |
| [Валидация входных данных](/api-and-integrations/api-security/input-validation/) | Понять защиту от некорректных данных |
| [Rate Limiting](/api-and-integrations/api-security/rate-limiting/) | Понять ограничение частоты запросов |
| [CORS](/api-and-integrations/api-security/cross-origin-resource-sharing/) | Понять ограничения браузера при запросах |

### Что должно стать понятно

После этапа ты должен уметь:

- читать REST API;
- понимать HTTP-методы и статусы;
- описывать request и response;
- понимать query/path/body/header параметры;
- понимать базовую безопасность API;
- читать OpenAPI-спецификацию;
- проверять API через Postman;
- понимать, чем REST отличается от gRPC, SOAP, GraphQL, Webhook и WebSocket.

## Этап 6. Разобраться с брокерами сообщений и очередями

Цель этапа — понять асинхронные интеграции. Это уровень, на котором новичок начинает отличаться от человека, который знает только REST.

### Что изучить

| Материал | Зачем читать |
|---|---|
| [Что такое брокер сообщений](/message-brokers-queues/what-is-message-broker/) | Понять базовую идею асинхронного обмена |
| [Модели доставки](/message-brokers-queues/delivery-models/) | Понять point-to-point и publish/subscribe |
| [Гарантии доставки](/message-brokers-queues/delivery-guarantees/) | Понять at-most-once, at-least-once, exactly-once |
| [Паттерны обмена](/message-brokers-queues/exchange-patterns/) | Понять варианты взаимодействия через сообщения |
| [Kafka vs RabbitMQ](/message-brokers-queues/kafka-vs-rabbitmq/) | Понять различия популярных брокеров |
| [Архитектура Kafka](/message-brokers-queues/apache-kafka/kafka-architecture/) | Понять топики, партиции, consumer group |
| [Когда использовать Kafka](/message-brokers-queues/apache-kafka/when-use-kafka/) | Понять подходящие сценарии Kafka |
| [Архитектура RabbitMQ](/message-brokers-queues/rabbitmq/rabbitmq-architecture/) | Понять exchange, queue, binding |
| [Когда использовать RabbitMQ](/message-brokers-queues/rabbitmq/when-use-rabbitmq/) | Понять подходящие сценарии RabbitMQ |
| [Dead Letter Queue](/message-brokers-queues/rabbitmq/dead-letter-queue/) | Понять обработку проблемных сообщений |
| [Idempotent Consumer](/message-brokers-queues/integration-patterns/idempotent-consumer/) | Понять защиту от дублей сообщений |
| [Competing Consumers](/message-brokers-queues/integration-patterns/competing-consumers/) | Понять параллельную обработку сообщений |

### Что должно стать понятно

После этапа ты должен уметь:

- объяснить, зачем нужен брокер сообщений;
- отличать синхронное API от асинхронной интеграции;
- понимать topic, queue, exchange, partition, consumer group;
- понимать гарантии доставки;
- понимать, почему нужны идемпотентные обработчики;
- понимать базовые отличия Kafka и RabbitMQ.

## Этап 7. Понять архитектуру и проектирование систем

Цель этапа — научиться видеть систему целиком: компоненты, связи, компромиссы, масштабирование, надежность и ограничения.

### Что изучить в первую очередь

| Материал | Зачем читать |
|---|---|
| [Что такое архитектура ПО](/architecture-and-design/what-is-software-architecture/) | Понять, что такое архитектурное мышление |
| [Clean Architecture](/architecture-and-design/clean-architecture/) | Понять разделение ответственности в системе |
| [Что такое монолит](/architecture-and-design/architectural-styles/monolith/what-is-monolith/) | Понять простой стиль построения системы |
| [Монолит vs микросервисы](/architecture-and-design/architectural-styles/microservices/monolith-vs-microservices/) | Понять ключевой архитектурный выбор |
| [Что такое микросервисы](/architecture-and-design/architectural-styles/microservices/what-are-microservices/) | Понять микросервисный подход |
| [Проблемы микросервисов](/architecture-and-design/architectural-styles/microservices/microservices-problems/) | Понять цену распределенной архитектуры |
| [Event-Driven Architecture](/architecture-and-design/architectural-styles/event-driven-architecture/what-is-eda/) | Понять событийную архитектуру |
| [Основы масштабирования](/architecture-and-design/scaling/scaling-basics/) | Понять, как системы растут под нагрузкой |
| [Вертикальное масштабирование](/architecture-and-design/scaling/vertical-scaling/) | Понять увеличение мощности узла |
| [Горизонтальное масштабирование](/architecture-and-design/scaling/horizontal-scaling/) | Понять увеличение количества узлов |
| [Load Balancing](/architecture-and-design/scaling/load-balancing/) | Понять распределение нагрузки |
| [CAP-теорема](/architecture-and-design/scaling/cap-theorem/) | Понять компромиссы распределенных систем |

### Что изучить после базы

| Материал | Зачем читать |
|---|---|
| [CQRS](/architecture-and-design/architectural-patterns/command-query-responsibility-segregation/) | Понять разделение чтения и записи |
| [Saga](/architecture-and-design/architectural-patterns/saga-pattern/) | Понять распределенные бизнес-транзакции |
| [Circuit Breaker](/architecture-and-design/architectural-patterns/circuit-breaker/) | Понять защиту от каскадных отказов |
| [Retry Pattern](/architecture-and-design/architectural-patterns/retry-pattern/) | Понять повторные попытки вызова |
| [Bulkhead](/architecture-and-design/architectural-patterns/bulkhead-pattern/) | Понять изоляцию отказов |
| [Database per Service](/architecture-and-design/architectural-patterns/database-per-service/) | Понять данные в микросервисах |
| [Event Sourcing](/architecture-and-design/architectural-patterns/event-sourcing/) | Понять хранение состояния через события |
| [API Composition](/architecture-and-design/architectural-patterns/api-composition/) | Понять сбор данных из нескольких сервисов |
| [Strangler Fig](/architecture-and-design/architectural-patterns/strangler-fig-pattern/) | Понять миграцию legacy-систем |

### Архитектурные компромиссы

Обязательно изучи раздел с компромиссами. Архитектура почти никогда не сводится к выбору "лучшего" решения. Чаще приходится выбирать меньшее зло.

| Материал | Зачем читать |
|---|---|
| [Скорость vs безопасность](/architecture-and-design/architectural-tradeoffs/speed-vs-safety/) | Понять компромисс между быстрыми изменениями и стабильностью |
| [Производительность vs стоимость](/architecture-and-design/architectural-tradeoffs/performance-vs-cost/) | Понять цену производительности |
| [Гибкость vs простота](/architecture-and-design/architectural-tradeoffs/flexibility-vs-simplicity/) | Понять, почему не всегда нужен универсальный механизм |
| [Latency vs Throughput](/architecture-and-design/architectural-tradeoffs/latency-vs-throughput/) | Понять разные виды производительности |
| [Consistent vs Available](/architecture-and-design/architectural-tradeoffs/consistent-vs-available/) | Понять выбор между согласованностью и доступностью |
| [Технический долг](/architecture-and-design/architectural-tradeoffs/technical-debt/) | Понять последствия быстрых решений |

### Что должно стать понятно

После этапа ты должен уметь:

- объяснить разницу между монолитом и микросервисами;
- понимать, что микросервисы не всегда лучше монолита;
- видеть архитектурные компромиссы;
- понимать базовые паттерны надежности;
- понимать масштабирование;
- читать C4-схемы и архитектурные описания;
- задавать вопросы архитектору и разработчикам на одном языке.

## Этап 8. Подготовиться к реальной работе и собеседованиям

Цель этапа — закрепить знания через вопросы, логические задачи, примеры документации и прикладные материалы.

### Что изучить

| Материал                                                                        | Зачем читать                                         |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Вопросы и ответы для собеседования](/general/interview-questions-and-answers/) | Проверить теорию и подготовиться к интервью          |
| [Скрининг](/general/passing-the-screening/)                                     | Понять первый этап отбора                            |
| [Логические задачи](/general/logical-tasks/)                                    | Подготовиться к задачам на мышление                  |
| [Как работать с любой задачей](/general/how-to-handle-any-task/)                | Получить общий алгоритм разбора рабочих задач        |

