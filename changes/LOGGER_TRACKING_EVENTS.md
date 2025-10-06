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

**Структура событий:**
```javascript
{
  "videojs-vast-plugin-event": "event-name",
  "eventTime": 1234567890,
  "message": "Описание события",
  "adId": "123",
  "creativeId": "456",
  "duration": 30, // только для duration события
  "adsCount": 3 // только для ads-count события
}
```

### 2. `src/logged-vast-tracker.mjs` (новый файл)

**Описание:**
Создан класс-обертка `LoggedVASTTracker`, который наследуется от `VASTTracker` и автоматически логирует все события трекинга.

**Функциональность:**
- Переопределяет методы `trackImpression()`, `track()`, `setProgress()`, `complete()`, `error()`
- Автоматически вызывает соответствующие методы логгера при вызове событий трекинга
- Логирует duration при первом определении длительности
- Добавляет контекстную информацию (adId, creativeId) к каждому событию

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
13. **ads-count** - при определении количества рекламы в блоке
14. **error** - при вызове `error()`

## Дополнительная информация в событиях

К каждому событию автоматически добавляется:
- `adId` - ID рекламы
- `creativeId` - ID креатива
- `eventName` - название события (для событий трекинга)
- `errorCode` - код ошибки (для error событий)
- `duration` - длительность в секундах (для duration событий)
- `adsCount` - количество рекламы в блоке (для ads-count событий)

## Обратная совместимость

Все изменения обратно совместимы. Существующий код продолжит работать без изменений, но теперь будет получать дополнительное логирование событий трекинга.

## Примеры использования

### Ручное логирование (если нужно)
```javascript
import {Logger} from './logger.mjs';

// Логирование события трекинга
Logger.logStart({customData: 'value'});

// Логирование duration
Logger.logDuration(30, {adId: '123'});

// Логирование количества рекламы
Logger.logAdsCount(3, {scheduleType: 'preroll'});
```

### Автоматическое логирование
Автоматическое логирование работает без дополнительного кода - все события трекинга логируются автоматически при их вызове в VASTTracker.
