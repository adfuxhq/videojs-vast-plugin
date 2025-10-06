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

Реализован `createDefaultVastUrlHandler()` который:
- **Автоматически добавляет Referer**: URL текущей страницы
- **Позволяет браузеру использовать стандартные заголовки**: User-Agent, Accept, Accept-Language и другие заголовки устанавливаются браузером автоматически
- **Использует минимальный набор заголовков**: только необходимые для корректной работы VAST запросов

### 2. Установлен по умолчанию в плагине

```javascript
const DEFAULT_OPTIONS = Object.freeze({
  // ... существующие опции
  urlHandler: createDefaultVastUrlHandler(),  // Автоматический URL Handler
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

### Кастомизация URL Handler

Если нужно изменить поведение URL Handler:

```javascript
import { createVastUrlHandler } from './src/vast-url-handler.mjs';

// Создаем кастомный URL Handler с дополнительными заголовками
const customUrlHandler = createVastUrlHandler({
  referer: 'https://custom-referer.com',
  customHeaders: {
    'X-Custom-Header': 'value',
    'Authorization': 'Bearer token'
  },
  timeout: 15000
});

player.vast({
  url: 'http://example.com/vast.xml',
  urlHandler: customUrlHandler
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

## Файлы изменений

- `src/vast-url-handler.mjs` - новый файл с кастомным URL Handler
- `src/vast-plugin.mjs` - импорт и использование `createDefaultVastUrlHandler()`
- `src/ad-loader.mjs` - передача `urlHandler` в VASTClient.get()
