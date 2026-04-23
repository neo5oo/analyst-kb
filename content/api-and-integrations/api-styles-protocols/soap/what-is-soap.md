---
title: Что такое SOAP
weight: 10
draft: false
description: "SOAP — XML-протокол обмена сообщениями в распределённых системах (банки, страховые, госсектор). Сообщение строгой структуры: Envelope (обязательный), Header (метаданные: аутентификация, транзакции), Body (основное сообщение), Fault (ошибки). Контракт — WSDL (обязательный), описывает операции, параметры, типы, транспорт, позволяет генерировать клиентский код автоматически. Транспорты: HTTP, SMTP, JMS, TCP. Стандарты: WS-Security (подпись, шифрование, аутентификация), WS-AtomicTransaction (распределённые транзакции ACID), WS-ReliableMessaging (гарантированная доставка, упорядочивание). Преимущества: формальный контракт, строгая типизация, безопасность и транзакции «из коробки», независимость от транспорта. Недостатки: сложность, многословность (XML в 10-20 раз больше JSON), медленнее, плохое кеширование (почти всегда POST). Выбор: SOAP для корпоративных систем (безопасность, транзакции, надёжность), REST для публичных API, микросервисов, мобильных приложений."
quiz:
  title: "Проверка знаний"
  passingScore: 3
  questions:
    - question: "Что такое SOAP?"
      options:
        - "Архитектурный стиль API на основе ресурсов"
        - "Протокол обмена структурированными XML-сообщениями в распределённых системах"
        - "Формат NoSQL-документов"
        - "Механизм WebSocket-стриминга"
      correctIndex: 1
      explanation: "SOAP — это именно протокол, а не просто стиль проектирования API."
    - question: "Какой формат данных является базовым для SOAP?"
      options:
        - "JSON"
        - "CSV"
        - "XML"
        - "BSON"
      correctIndex: 2
      explanation: "SOAP-сообщения построены на XML Envelope/Header/Body."
    - question: "Что обычно описывает контракт SOAP-сервиса?"
      options:
        - "OpenAPI"
        - "WSDL"
        - "GraphQL schema"
        - "Docker Compose"
      correctIndex: 1
      explanation: "WSDL формально описывает операции, типы, сообщения и адрес сервиса."
    - question: "Почему слово «Simple» в названии SOAP обманчиво?"
      options:
        - "Потому что на практике SOAP довольно тяжёлый и многослойный протокол"
        - "Потому что SOAP нельзя использовать в компаниях"
        - "Потому что он проще REST во всех случаях"
        - "Потому что он не поддерживает безопасность"
      correctIndex: 0
      explanation: "Тема прямо подчёркивает, что SOAP — один из самых сложных подходов к интеграции API."
---
## Введение: Тяжеловес корпоративных интеграций

В мире API есть два совершенно разных мира. Один — REST. Лёгкий, гибкий, интуитивный. Его любят разработчики мобильных приложений и веб-сервисов. Другой — SOAP. Формальный, строгий, многословный. Его выбирают банки, страховые компании, государственные системы.

**SOAP (Simple Object Access Protocol)** — это протокол обмена структурированными сообщениями в распределённых системах. Несмотря на слово "Simple" в названии, SOAP — один из самых сложных и многословных протоколов в мире API.

SOAP был создан в конце 1990-х годов как стандарт для взаимодействия между приложениями, написанными на разных языках и работающими на разных платформах. Он неразрывно связан с XML и использует его как формат сообщений.

Если REST — это "почтовое отделение" (вы отправляете запрос и получаете ответ), то SOAP — это "нотариальная контора" (каждое сообщение должно быть оформлено по строгим правилам, заверено, проверено и доставлено с гарантиями). SOAP обеспечивает надёжность, безопасность и формальные контракты, но ценой сложности и производительности.

## История и контекст

SOAP был создан в 1998 году компаниями Microsoft, IBM, Lotus и UserLand. В 2000 году он был передан в W3C и стал стандартом. В 2000-х годах SOAP был доминирующим протоколом для веб-сервисов в корпоративной среде.

Сегодня SOAP всё ещё широко используется, особенно в:
- Банковских системах
- Платёжных шлюзах
- Страховых компаниях
- Государственных информационных системах
- Системах, где важны строгие контракты и безопасность

Однако для новых проектов, особенно публичных API, чаще выбирают REST, GraphQL или gRPC.

## Основные понятия SOAP

### SOAP сообщение

SOAP сообщение — это XML документ строгой структуры.

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
        <!-- Необязательная часть. Аутентификация, транзакции, маршрутизация -->
    </soap:Header>
    <soap:Body>
        <!-- Обязательная часть. Основное сообщение -->
        <GetUser>
            <UserId>123</UserId>
        </GetUser>
    </soap:Body>
    <soap:Fault>
        <!-- Ошибки -->
    </soap:Fault>
</soap:Envelope>
```

### Структура SOAP сообщения

| Компонент | Обязательность | Назначение |
| :--- | :--- | :--- |
| **Envelope** | Обязательный | Корневой элемент, определяет XML как SOAP сообщение |
| **Header** | Необязательный | Метаданные: аутентификация, транзакции, маршрутизация |
| **Body** | Обязательный | Основное содержимое запроса или ответа |
| **Fault** | Необязательный | Информация об ошибках |

## Пример SOAP запроса и ответа

### Запрос: получить пользователя

```xml
POST /UserService HTTP/1.1
Host: api.example.com
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://example.com/UserService/GetUser"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope 
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:user="http://example.com/user">
    
    <soap:Header>
        <user:Auth>
            <user:ApiKey>abc123xyz</user:ApiKey>
        </user:Auth>
    </soap:Header>
    
    <soap:Body>
        <user:GetUserRequest>
            <user:UserId>123</user:UserId>
        </user:GetUserRequest>
    </soap:Body>
    
</soap:Envelope>
```

### Ответ

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope 
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:user="http://example.com/user">
    
    <soap:Body>
        <user:GetUserResponse>
            <user:UserId>123</user:UserId>
            <user:Name>Иван Петров</user:Name>
            <user:Email>ivan@example.com</user:Email>
            <user:CreatedAt>2024-01-15T10:30:00Z</user:CreatedAt>
        </user:GetUserResponse>
    </soap:Body>
    
</soap:Envelope>
```

## WSDL: Контракт SOAP сервиса

WSDL (Web Services Description Language) — это XML документ, который описывает, как вызывать SOAP сервис. Это "контракт" между клиентом и сервером.

WSDL описывает:
- Какие операции доступны
- Какие параметры принимает каждая операция
- Какой формат ответа
- Какой транспорт используется (обычно HTTP)
- Где находится сервис (URL)

### Пример фрагмента WSDL

```xml
<definitions targetNamespace="http://example.com/user">
    
    <!-- Типы данных -->
    <types>
        <xsd:schema>
            <xsd:element name="GetUserRequest">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="UserId" type="xsd:int"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            
            <xsd:element name="GetUserResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="UserId" type="xsd:int"/>
                        <xsd:element name="Name" type="xsd:string"/>
                        <xsd:element name="Email" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </types>
    
    <!-- Сообщения -->
    <message name="GetUserRequest">
        <part name="parameters" element="tns:GetUserRequest"/>
    </message>
    <message name="GetUserResponse">
        <part name="parameters" element="tns:GetUserResponse"/>
    </message>
    
    <!-- Операции -->
    <portType name="UserPort">
        <operation name="GetUser">
            <input message="tns:GetUserRequest"/>
            <output message="tns:GetUserResponse"/>
        </operation>
    </portType>
    
    <!-- Привязка к протоколу -->
    <binding name="UserBinding" type="tns:UserPort">
        <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="GetUser">
            <soap:operation soapAction="http://example.com/UserService/GetUser"/>
            <input><soap:body use="literal"/></input>
            <output><soap:body use="literal"/></output>
        </operation>
    </binding>
    
    <!-- Адрес сервиса -->
    <service name="UserService">
        <port name="UserPort" binding="tns:UserBinding">
            <soap:address location="https://api.example.com/UserService"/>
        </port>
    </service>
    
</definitions>
```

### Что даёт WSDL

| Преимущество | Объяснение |
| :--- | :--- |
| **Автоматическая генерация кода** | Инструменты могут создать клиентский код по WSDL |
| **Самодокументируемость** | WSDL описывает всё, что нужно знать для вызова |
| **Проверка контракта** | Можно валидировать сообщения против схемы |
| **Стандартизация** | Единый формат описания сервисов |

## Транспортные протоколы SOAP

SOAP не привязан к HTTP. Он может работать через разные протоколы.

| Протокол | Описание | Когда используется |
| :--- | :--- | :--- |
| **HTTP/HTTPS** | Самый распространённый | Веб-сервисы |
| **SMTP** | Электронная почта | Асинхронные системы |
| **JMS** | Java Message Service | Корпоративные очереди |
| **TCP** | Прямое сокетное соединение | Высокая производительность |

## SOAP и стили сообщений

### RPC/Encoded (устаревший)

Сообщение кодирует вызов процедуры с типами данных.

```xml
<soap:Body>
    <GetUser>
        <UserId xsi:type="xsd:int">123</UserId>
    </GetUser>
</soap:Body>
```

### RPC/Literal

Вызов процедуры без указания типов (типы в WSDL).

```xml
<soap:Body>
    <GetUser>
        <UserId>123</UserId>
    </GetUser>
</soap:Body>
```

### Document/Literal (самый распространённый)

Документо-ориентированный стиль.

```xml
<soap:Body>
    <GetUserRequest>
        <UserId>123</UserId>
    </GetUserRequest>
</soap:Body>
```

### Document/Literal Wrapped

Вариант Document/Literal с обёрткой.

```xml
<soap:Body>
    <GetUser>
        <UserId>123</UserId>
    </GetUser>
</soap:Body>
```

**Сегодня стандарт — Document/Literal Wrapped.**

## SOAP и безопасность (WS-Security)

SOAP имеет встроенные механизмы безопасности, которых нет в REST.

### Пример SOAP сообщения с подписью

```xml
<soap:Header>
    <wsse:Security>
        <!-- Подпись сообщения -->
        <ds:Signature>
            <ds:SignedInfo>...</ds:SignedInfo>
            <ds:SignatureValue>...</ds:SignatureValue>
        </ds:Signature>
        
        <!-- Шифрование -->
        <xenc:EncryptedKey>...</xenc:EncryptedKey>
        
        <!-- Токен пользователя -->
        <wsse:UsernameToken>
            <wsse:Username>ivan</wsse:Username>
            <wsse:Password>***</wsse:Password>
        </wsse:UsernameToken>
    </wsse:Security>
</soap:Header>
```

### Возможности WS-Security

| Возможность | Описание |
| :--- | :--- |
| **Аутентификация** | Username Token, X.509, Kerberos, SAML |
| **Подпись сообщений** | Целостность и неотказуемость |
| **Шифрование** | Конфиденциальность |
| **Таймстемпы** | Защита от replay-атак |

## SOAP и транзакции (WS-AtomicTransaction)

SOAP поддерживает распределённые транзакции через WS-AtomicTransaction.

```xml
<soap:Header>
    <wsat:AtomicTransaction>
        <wsat:TransactionID>uuid-123-456</wsat:TransactionID>
    </wsat:AtomicTransaction>
</soap:Header>
```

**Когда нужно:** Банковские переводы, бронирование авиабилетов, системы, требующие ACID.

## SOAP и надёжность (WS-ReliableMessaging)

Гарантирует доставку сообщений даже при сбоях сети.

```xml
<soap:Header>
    <wsrm:Sequence>
        <wsrm:Identifier>uuid-123</wsrm:Identifier>
        <wsrm:MessageNumber>1</wsrm:MessageNumber>
    </wsrm:Sequence>
</soap:Header>
```

**Возможности:**
- Подтверждение получения
- Повторная отправка
- Упорядочивание сообщений
- Устранение дубликатов

## SOAP в языках программирования

### C# (.NET)

```csharp
// Создание клиента из WSDL (Add Service Reference)
var client = new UserServiceClient();

// Вызов метода
var response = client.GetUser(new GetUserRequest { UserId = 123 });

Console.WriteLine($"User: {response.Name}, Email: {response.Email}");
```

### Java (JAX-WS)

```java
// Генерация клиента из WSDL
URL url = new URL("https://api.example.com/UserService?wsdl");
QName qname = new QName("http://example.com/user", "UserService");
Service service = Service.create(url, qname);
UserPort port = service.getPort(UserPort.class);

// Вызов метода
GetUserResponse response = port.getUser(123);
System.out.println("User: " + response.getName());
```

### Python (Zeep)

```python
from zeep import Client

client = Client('https://api.example.com/UserService?wsdl')
response = client.service.GetUser(UserId=123)

print(f"User: {response.Name}, Email: {response.Email}")
```

## Преимущества SOAP

| Преимущество | Объяснение |
| :--- | :--- |
| **Формальный контракт (WSDL)** | Клиенты могут генерировать код автоматически |
| **Строгая типизация** | Меньше ошибок, лучше валидация |
| **Безопасность (WS-Security)** | Подпись, шифрование, токены "из коробки" |
| **Транзакции (WS-AtomicTransaction)** | Поддержка ACID распределённых транзакций |
| **Надёжность (WS-ReliableMessaging)** | Гарантированная доставка |
| **Независимость от транспорта** | Работает через HTTP, SMTP, JMS, TCP |
| **Поддержка асинхронных операций** | Callback, long-running operations |

## Недостатки SOAP

| Недостаток | Объяснение |
| :--- | :--- |
| **Сложность** | WSDL, XML, пространства имён, заголовки — крутая кривая обучения |
| **Многословность (Verbosity)** | Сообщения в 10-20 раз больше, чем JSON в REST |
| **Медленнее** | Парсинг XML, валидация, обработка заголовков |
| **Плохая кешируемость** | POST почти всегда, GET редко |
| **Сложное тестирование** | Нужны специальные инструменты (SoapUI) |
| **Неудобно в браузере** | Нельзя просто открыть в браузере |
| **Избыточен для простых задач** | Для простых CRUD операций — слишком тяжело |

## SOAP vs REST: Краткое сравнение

| Характеристика | SOAP | REST |
| :--- | :--- | :--- |
| **Формат** | XML (только) | JSON, XML, HTML, текст |
| **Протокол** | HTTP, SMTP, JMS, TCP | HTTP/HTTPS |
| **Контракт** | WSDL (обязательный) | OpenAPI (опциональный) |
| **Состояние** | Может быть stateful | Stateless |
| **Безопасность** | WS-Security | HTTPS + OAuth/JWT |
| **Транзакции** | WS-AtomicTransaction | Нет (нужен компенсирующий механизм) |
| **Надёжность** | WS-ReliableMessaging | Нет (нужно реализовывать поверх) |
| **Кеширование** | Плохое | Хорошее (HTTP кеш) |
| **Сложность** | Высокая | Низкая |
| **Производительность** | Низкая (XML) | Высокая (JSON) |

## Когда выбирать SOAP

### SOAP подходит, если:

| Сценарий | Почему |
| :--- | :--- |
| **Корпоративные системы (банки, страховые)** | Требуют строгих контрактов, безопасности, транзакций |
| **Государственные системы** | Часто требуют SOAP по стандарту |
| **Системы с длительными операциями** | Асинхронные вызовы, callbacks |
| **Требуется WS-Security** | Подпись, шифрование, сложная аутентификация |
| **Разные транспорты** | Нужно работать через SMTP или JMS |
| **Существующая инфраструктура** | Всё уже построено на SOAP |
| **Автоматическая генерация клиентов** | Много разных клиентов на разных языках |

### SOAP не подходит, если:

| Сценарий | Почему |
| :--- | :--- |
| **Публичный API для веб-приложений** | REST проще, быстрее, удобнее |
| **Мобильные приложения** | Тяжёлый XML и многословность на медленных сетях |
| **Микросервисы** | SOAP слишком тяжёлый и медленный |
| **Быстрое прототипирование** | Слишком много формальностей |
| **Кеширование важно** | SOAP почти всегда POST |
| **Команда не знает XML** | Крутая кривая обучения |

## Частые ошибки

### Ошибка 1: SOAP для простого CRUD API

Создание SOAP сервиса для простого списка задач.

**Как исправить:** REST с JSON.

### Ошибка 2: Игнорирование WSDL

Вызов SOAP сервиса без использования WSDL, ручное формирование XML.

**Как исправить:** Использовать инструменты для генерации клиента из WSDL.

### Ошибка 3: Неправильный стиль сообщений

Использование RPC/Encoded, который плохо поддерживается современными инструментами.

**Как исправить:** Document/Literal Wrapped.

### Ошибка 4: SOAP без безопасности

Использование SOAP без WS-Security, только HTTPS. Потеря подписи и шифрования на уровне сообщений.

**Как исправить:** Если безопасность критична, используйте WS-Security.

### Ошибка 5: Синхронные вызовы для длительных операций

Запрос, который обрабатывается минутами, через синхронный SOAP вызов.

**Как исправитить:** Использовать асинхронный паттерн (два запроса: старт и получение результата).

## Резюме для системного аналитика

1. **SOAP (Simple Object Access Protocol)** — протокол обмена структурированными сообщениями на основе XML. Несмотря на название, он далеко не простой.

2. **SOAP сообщение** состоит из Envelope (конверт), Header (необязательные метаданные), Body (основное сообщение), Fault (ошибки).

3. **WSDL (Web Services Description Language)** — контракт SOAP сервиса. Описывает операции, параметры, типы данных, транспорт. Позволяет генерировать клиентский код автоматически.

4. **Стандарты SOAP:** WS-Security (безопасность), WS-AtomicTransaction (транзакции), WS-ReliableMessaging (надёжность). Этого нет в REST.

5. **SOAP сложен, но мощен.** Строгая типизация, формальные контракты, встроенная безопасность и транзакции — за это его любят в корпоративной среде.

6. **SOAP не для всех.** Для публичных API, мобильных приложений, микросервисов REST подходит больше. SOAP — для банков, страховых, государства.