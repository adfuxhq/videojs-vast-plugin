# Добавление кастомного urlHandler с автоматической поддержкой Referer

## Дата: 2024-12-19

## Описание изменений

Создан кастомный `urlHandler` который автоматически добавляет заголовок `Referer` и другие важные заголовки во все VAST запросы. Это решает проблему отсутствующего Referer без необходимости вмешательства пользователей.

## Проблема

В VAST запросах отсутствовал важный заголовок `Referer`, который критически важен для:
- Аналитики и трекинга
- Определения источника трафика
- Корректной работы с серверами рекламы
- Соответствия требованиям рекламных сетей

## Решение

### 1. Создан кастомный URL Handler (`src/vast-url-handler.mjs`)

Реализованы два URL Handler'а:

**`createXHRVastUrlHandler()` (используется по умолчанию):**
- **Использует XMLHttpRequest**: более надежный для принудительной отправки заголовков
- **Принудительно отправляет Referer**: игнорирует политику `Referrer Policy: no-referrer`
- **Полный контроль над заголовками**: устанавливает заголовки напрямую через `setRequestHeader`

**`createDefaultVastUrlHandler()` (альтернативный):**
- **Использует fetch API**: с принудительным `referrer` и `referrerPolicy: 'unsafe-url'`
- **Автоматически добавляет Referer**: URL текущей страницы
- **Позволяет браузеру использовать стандартные заголовки**: User-Agent, Accept, Accept-Language и другие заголовки устанавливаются браузером автоматически

### 2. Установлен по умолчанию в плагине

```javascript
const DEFAULT_OPTIONS = Object.freeze({
  // ... существующие опции
  urlHandler: createXHRVastUrlHandler(),  // XMLHttpRequest URL Handler с принудительным Referer
  // ... остальные опции
});
```

### 3. Передача urlHandler в VASTClient.get()

```javascript
this.#vastClient.get(url, {
  withCredentials: this.#options.withCredentials,
  wrapperLimit: this.#options.wrapperLimit,
  urlHandler: this.#options.urlHandler,  // Кастомный URL Handler
})
```

## Использование

### Автоматическое использование (по умолчанию)

Теперь заголовок `Referer` добавляется автоматически во все VAST запросы:

```javascript
// Просто используйте плагин как обычно - Referer будет добавлен автоматически
player.vast({
  url: 'http://example.com/vast.xml'
});
```

### Выбор URL Handler

**Использование XMLHttpRequest (по умолчанию, рекомендуется):**
```javascript
import { createXHRVastUrlHandler } from './src/vast-url-handler.mjs';

// Принудительно отправляет Referer даже при Referrer Policy: no-referrer
const xhrHandler = createXHRVastUrlHandler({
  referer: 'https://custom-referer.com',
  customHeaders: {
    'X-Custom-Header': 'value'
  },
  timeout: 15000
});

player.vast({
  url: 'http://example.com/vast.xml',
  urlHandler: xhrHandler
});
```

**Использование fetch API (альтернативный):**
```javascript
import { createDefaultVastUrlHandler } from './src/vast-url-handler.mjs';

// Использует fetch с referrerPolicy: 'unsafe-url'
const fetchHandler = createDefaultVastUrlHandler({
  referer: 'https://custom-referer.com',
  customHeaders: {
    'Authorization': 'Bearer token'
  }
});

player.vast({
  url: 'http://example.com/vast.xml',
  urlHandler: fetchHandler
});
```

### Полное отключение URL Handler

Если нужно использовать стандартное поведение:

```javascript
player.vast({
  url: 'http://example.com/vast.xml',
  urlHandler: null  // Отключаем кастомный URL Handler
});
```

## Технические детали

### Интерфейс URLHandler

Согласно типам `@dailymotion/vast-client`, `urlHandler` должен реализовывать интерфейс:

```typescript
interface URLHandler {
  get: (url: string, opts: URLHandlerOptions) => Promise<URLHandlerResponse>;
}

interface URLHandlerOptions {
  timeout?: number;
  withCredentials?: boolean;
}

interface URLHandlerResponse {
  error?: Error;
  statusCode?: number;
  xml?: Document;
  details?: URLHandlerResponseDetails;
}

interface URLHandlerResponseDetails {
  byteLength: number;
  statusCode: number;
  rawXml: string;
}
```

## Преимущества

1. **Автоматическое решение**: Заголовок Referer добавляется автоматически без настройки
2. **Естественность**: Браузер использует свои стандартные заголовки
3. **Полная совместимость**: Существующий код продолжает работать без изменений
4. **Гибкость**: Возможность кастомизации через опции
5. **Стандартность**: Использует официальный API библиотеки `@dailymotion/vast-client`
6. **Производительность**: Минимальное влияние на производительность
7. **Логирование**: Подробное логирование запросов для отладки

## Заголовки в запросах

### Заголовки, добавляемые URL Handler:
| Заголовок | Значение | Назначение |
|-----------|----------|------------|
| `Referer` | `window.location.href` | Источник запроса (критически важен для VAST) |

### Заголовки, добавляемые браузером автоматически:
| Заголовок | Назначение |
|-----------|------------|
| `User-Agent` | Информация о браузере и ОС |
| `Accept` | Предпочтения контента |
| `Accept-Language` | Язык браузера |
| `Accept-Encoding` | Поддерживаемые алгоритмы сжатия |
| `Connection` | Тип соединения |
| `Host` | Хост сервера |

Такой подход обеспечивает:
- **Естественность**: Браузер использует свои стандартные заголовки
- **Совместимость**: Лучшая совместимость с различными серверами
- **Минимализм**: Добавляется только критически важный заголовок Referer

## Обратная совместимость

Изменения полностью обратно совместимы:
- По умолчанию используется кастомный URL Handler с Referer
- Существующий код продолжает работать без изменений
- Можно отключить кастомный Handler установив `urlHandler: null`

## Решение проблемы Referrer Policy

Проблема была в том, что браузер устанавливает политику `Referrer Policy: no-referrer`, которая блокирует отправку заголовка `Referer`. Решение:

1. **XMLHttpRequest подход**: Использует `setRequestHeader()` для принудительной установки заголовка `Referer`
2. **Fetch API подход**: Использует `referrerPolicy: 'unsafe-url'` для игнорирования политики referrer

XMLHttpRequest более надежен для обхода ограничений политики referrer.

## Файлы изменений

- `src/vast-url-handler.mjs` - новый файл с двумя URL Handler'ами
- `src/vast-plugin.mjs` - импорт и использование `createXHRVastUrlHandler()` по умолчанию
- `src/ad-loader.mjs` - передача `urlHandler` в VASTClient.get()
