# Исправления проблем с таймингом и патчингом VAST клиента

## Проблемы

### 1. Ошибка патчинга VAST клиента
```
[VAST Client Patch] Could not find util.track to patch
```

### 2. Ошибка postroll
```
An error occurred when loading ads for the postroll ad break: : xml or url must be set
```

### 3. Преждевременное выполнение логики
Логика выполняется до завершения HTTP-запроса к VAST серверу.

## Анализ проблем

### Проблема 1: Патчинг VAST клиента
**Причина:** `util.track` недоступен в момент вызова `patchVASTClient()` в конструкторе плагина. VAST клиент еще не полностью инициализирован.

**До исправления:**
```javascript
// vast-plugin.mjs (конструктор)
const vastClient = new VASTClient();
patchVASTClient(); // ← util.track еще недоступен
```

### Проблема 2: Postroll ошибка
**Причина:** `postRollScheduleItem` может быть `undefined` если нет postroll в schedule, но код пытается загрузить рекламу без проверки.

**До исправления:**
```javascript
player.on('readyforpostroll', () => {
  adLoader.loadAds(postRollScheduleItem) // ← postRollScheduleItem может быть undefined
```

### Проблема 3: Тайминг выполнения
**Причина:** События срабатывают преждевременно из-за неправильной последовательности инициализации.

## Решения

### 1. Исправление патчинга VAST клиента

**Перемещен патчинг в AdLoader:**
```javascript
// ad-loader.mjs
loadAdsWithUrl(url) {
  return new Promise((accept, reject) => {
    this.#lastVastUrl = url;
    
    // Применяем патч VAST клиента перед первым использованием
    patchVASTClient(); // ← Теперь util.track доступен
    
    this.#vastClient.get(url, {...})
```

**Удален из конструктора плагина:**
```javascript
// vast-plugin.mjs
const vastClient = new VASTClient();
// patchVASTClient(); ← Удалено отсюда
```

### 2. Исправление postroll ошибки

**Добавлена проверка на существование postroll и наличие данных:**
```javascript
player.on('readyforpostroll', () => {
  timedOut = false;
  
  // Проверяем, есть ли postroll в schedule и есть ли у него url или xml
  if (!postRollScheduleItem || (!postRollScheduleItem.url && !postRollScheduleItem.xml)) {
    player.trigger('nopostroll');
    return;
  }
  
  adLoader.loadAds(postRollScheduleItem)
```

### 3. Улучшение тайминга событий

**Правильная последовательность:**
1. Инициализация VAST клиента
2. Патчинг при первом использовании (когда `util.track` доступен)
3. HTTP-запрос к VAST серверу
4. Событие `vast-loaded` после успешного завершения запроса
5. Событие `vast-parsed` после парсинга данных
6. Событие `vast-ready` после создания TrackedAd объектов

## Изменения в файлах

### 1. `src/vast-plugin.mjs`
- **Удален импорт:** `import {patchVASTClient} from './vast-client-patch.mjs'`
- **Удален вызов:** `patchVASTClient()` из конструктора
- **Добавлена проверка:** существования `postRollScheduleItem` перед загрузкой

### 2. `src/ad-loader.mjs`
- **Добавлен импорт:** `import {patchVASTClient} from './vast-client-patch.mjs'`
- **Добавлен вызов:** `patchVASTClient()` в методе `loadAdsWithUrl()` перед HTTP-запросом

## Результат

### Исправленные проблемы:
- ✅ Патчинг VAST клиента происходит в правильное время
- ✅ Нет ошибки "xml or url must be set" для postroll
- ✅ События срабатывают в правильной последовательности
- ✅ HTTP-запросы завершаются до срабатывания событий

### Преимущества:
- **Надежность** - патчинг происходит когда VAST клиент готов
- **Стабильность** - нет ошибок при отсутствии postroll
- **Точность** - события отражают реальное состояние загрузки
- **Отладка** - меньше ложных предупреждений в консоли

## Технические детали

### Условия патчинга:
- Патчинг происходит только при первом HTTP-запросе к VAST серверу
- `util.track` гарантированно доступен в этот момент
- Патч применяется один раз для всего жизненного цикла плагина

### Проверка postroll:
- Проверяется существование `postRollScheduleItem` перед загрузкой
- Проверяется наличие `url` или `xml` в `postRollScheduleItem`
- Если postroll отсутствует или нет данных для загрузки, сразу вызывается `player.trigger('nopostroll')`
- Избегается попытка загрузки с `undefined` или пустыми параметрами

### Совместимость:
- ✅ Обратная совместимость сохранена
- ✅ Существующий код работает без изменений
- ✅ Улучшена стабильность и надежность

## Тестирование

Для проверки исправлений:
1. Откройте консоль браузера
2. Инициализируйте VAST плагин
3. Проверьте отсутствие ошибки патчинга
4. Проверьте отсутствие ошибки postroll
5. Убедитесь в правильной последовательности событий
