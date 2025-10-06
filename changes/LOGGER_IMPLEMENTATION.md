# Реализация системы логирования событий VAST плагина

## Обзор

Добавлена система логирования событий для VAST плагина, которая выводит события в консоль браузера в формате JSON.

## Реализованные компоненты

### 1. Утилитарный класс Logger (`src/logger.mjs`)

Создан глобальный утилитарный класс для логирования событий:

- **Методы:**
  - `log(event, additionalData)` - основной метод логирования
  - `logVastLoaded(vastUrl)` - логирование загрузки VAST
  - `logVastParsed(vastUrl)` - логирование парсинга VAST
  - `logVastReady(vastUrl)` - логирование готовности VAST

- **Формат вывода:** JSON объект с полями:
  - `event` - название события
  - `eventTime` - время события (timestamp)
  - `vastUrl` - URL источника VAST кода

### 2. Интеграция в основной плагин (`src/vast-plugin.mjs`)

- Добавлен импорт Logger
- Логирование события `vast-loaded` при инициализации плагина
- URL определяется из опций плагина (`options.url`) или устанавливается как `'inline-xml'`

### 3. Интеграция в загрузчик рекламы (`src/ad-loader.mjs`)

- Добавлен импорт Logger
- Логирование события `vast-parsed` после успешного парсинга VAST документа
- Логирование события `vast-ready` после создания TrackedAd объектов
- Добавлено приватное поле `#lastVastUrl` для отслеживания источника VAST

## Логируемые события

### 1. `vast-loaded`
- **Когда:** При инициализации VAST плагина
- **Где:** `vast-plugin.mjs` конструктор
- **Данные:** `{"videojs-vast-plugin-event": "vast-loaded", eventTime: XXX, vastUrl: "URL или 'inline-xml'"}`

### 2. `vast-parsed`
- **Когда:** После успешного парсинга VAST документа
- **Где:** `ad-loader.mjs` методы `loadAdsWithXml` и `loadAdsWithUrl`
- **Данные:** `{"videojs-vast-plugin-event": "vast-parsed", eventTime: XXX, vastUrl: "URL или 'inline-xml'"}`

### 3. `vast-ready`
- **Когда:** После создания TrackedAd объектов (готовность к воспроизведению)
- **Где:** `ad-loader.mjs` метод `#createTrackedAds`
- **Данные:** `{"videojs-vast-plugin-event": "vast-ready", eventTime: XXX, vastUrl: "URL или 'inline-xml'"}`

## Примеры вывода в консоль

```json
{"videojs-vast-plugin-event": "vast-loaded", "eventTime": 1703123456789, "vastUrl": "https://example.com/vast.xml"}
{"videojs-vast-plugin-event": "vast-parsed", "eventTime": 1703123456790, "vastUrl": "https://example.com/vast.xml"}
{"videojs-vast-plugin-event": "vast-ready", "eventTime": 1703123456791, "vastUrl": "https://example.com/vast.xml"}
```

## Технические детали

- Логгер использует `console.info()` для вывода событий
- Все события выводятся в формате JSON с ключом `videojs-vast-plugin-event`
- Ключ `videojs-vast-plugin-event` содержит название события как значение
- Время события указывается в миллисекундах (timestamp)
- URL источника VAST передается во всех событиях для трассировки
- Система не имеет уровней логирования - все события выводятся одинаково

## Совместимость

- Реализация не влияет на существующую функциональность плагина
- Логирование работает во всех поддерживаемых браузерах
- Не требует дополнительных зависимостей
