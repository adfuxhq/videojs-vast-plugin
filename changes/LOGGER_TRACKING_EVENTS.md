# Расширение логгера событиями трекинга и duration

## Описание изменений

Добавлены новые события в логгер для отслеживания всех событий трекинга VAST и определения длительности рекламы.

## Изменения в файлах

### 1. `src/logger.mjs`

**Изменения:**
- Переименовано свойство `url` в `message` в существующих методах (`logVastLoaded`, `logVastParsed`, `logVastReady`)
- Добавлены новые методы для всех событий трекинга:
  - `logCreativeView()` - событие creativeView
  - `logStart()` - событие start
  - `logFirstQuartile()` - событие firstQuartile (25%)
  - `logMidpoint()` - событие midpoint (50%)
  - `logThirdQuartile()` - событие thirdQuartile (75%)
  - `logComplete()` - событие complete (100%)
  - `logMute()` - событие mute
  - `logUnmute()` - событие unmute
  - `logPause()` - событие pause
  - `logResume()` - событие resume
  - `logFullscreen()` - событие fullscreen
- Добавлен метод `logDuration()` для логирования определения длительности рекламы
- Добавлен метод `logAdsCount()` для логирования количества рекламы в блоке
- Добавлен метод `logProgress()` для логирования прогресса просмотра рекламы

**Структура событий:**
```javascript
{
  "videojs-vast-plugin-event": "event-name",
  "event-time": 1234567890,
  "message": "важные данные или null"
}
```

**Примеры событий:**
```javascript
// Событие без важных данных
{
  "videojs-vast-plugin-event": "start",
  "event-time": 1234567890,
  "message": null
}

// Событие с важными данными
{
  "videojs-vast-plugin-event": "duration",
  "event-time": 1234567890,
  "message": "30"
}

// Событие прогресса
{
  "videojs-vast-plugin-event": "progress",
  "event-time": 1234567890,
  "message": "25"
}

// Событие с URL
{
  "videojs-vast-plugin-event": "vast-loaded",
  "event-time": 1234567890,
  "message": "https://example.com/vast.xml"
}
```

### 2. `src/logged-vast-tracker.mjs` (новый файл)

**Описание:**
Создан класс-обертка `LoggedVASTTracker`, который наследуется от `VASTTracker` и автоматически логирует все события трекинга.

**Функциональность:**
- **Слушает события** от VASTTracker вместо переопределения методов
- Автоматически вызывает соответствующие методы логгера при получении событий трекинга
- Логирует duration при первом определении длительности через `setProgress()`
- Использует единообразную структуру событий с тремя обязательными полями
- **Естественная защита**: VASTTracker сам управляет частотой событий
- Не нарушает внутреннюю логику VAST клиента

### 3. `src/ad-loader.mjs`

**Изменения:**
- Добавлен импорт `LoggedVASTTracker`
- Заменено создание `VASTTracker` на `LoggedVASTTracker` для linear и companion трекеров
- Теперь все события трекинга автоматически логируются без дополнительных вызовов

## Автоматическое логирование

Следующие события теперь логируются автоматически при их вызове:

1. **creative-view** - при вызове `trackImpression()`
2. **start** - при вызове `track('start')`
3. **first-quartile** - при вызове `track('firstQuartile')`
4. **midpoint** - при вызове `track('midpoint')`
5. **third-quartile** - при вызове `track('thirdQuartile')`
6. **complete** - при вызове `track('complete')` или `complete()`
7. **mute** - при вызове `track('mute')`
8. **unmute** - при вызове `track('unmute')`
9. **pause** - при вызове `track('pause')`
10. **resume** - при вызове `track('resume')`
11. **fullscreen** - при вызове `track('fullscreen')`
12. **duration** - при первом определении длительности через `setProgress()`
13. **progress** - при изменении прогресса просмотра через `setProgress()`
14. **ads-count** - при определении количества рекламы в блоке
15. **error** - при вызове `error()`

## Дополнительная информация в событиях

**Поля событий:**
- `videojs-vast-plugin-event` - название события (обязательно)
- `event-time` - время события в миллисекундах (обязательно)
- `message` - важные данные или null (обязательно)

**Содержимое message:**
- `duration` - длительность в секундах (строка)
- `progress` - процент прогресса просмотра 0-100 (строка)
- `ads-count` - количество рекламы (строка)
- `vast-loaded/vast-parsed/vast-ready` - URL VAST файла
- `error` - код ошибки (строка)
- Остальные события - `null`

## Обратная совместимость

Все изменения обратно совместимы. Существующий код продолжит работать без изменений, но теперь будет получать дополнительное логирование событий трекинга.

## Примеры использования

### Ручное логирование (если нужно)
```javascript
import {Logger} from './logger.mjs';

// Логирование события трекинга
Logger.logStart();

// Логирование duration
Logger.logDuration(30);

// Логирование количества рекламы
Logger.logAdsCount(3);

// Логирование прогресса
Logger.logProgress(75);
```

### Автоматическое логирование
Автоматическое логирование работает без дополнительного кода - все события трекинга логируются автоматически при их вызове в VASTTracker.
