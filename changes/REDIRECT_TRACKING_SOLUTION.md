# Решение проблемы с редиректами в VAST трекинге

## Проблема

Некоторые трекинговые ссылки в VAST возвращают HTTP редиректы (302/307), но стандартная функция `track` в `@dailymotion/vast-client` использует `new Image().src = URL`, которая **не следует редиректам**. Это приводит к тому, что трекинг не доходит до финального URL.

## Решение

Мы создали патч, который переопределяет функцию `track` в `@dailymotion/vast-client` для использования `XMLHttpRequest` вместо `Image` объекта.

### Архитектура решения

1. **`tracking-url-handler.mjs`** - Улучшенная функция трекинга с поддержкой редиректов
2. **`vast-client-patch.mjs`** - Патч для переопределения `util.track` в vast-client
3. **`vast-plugin.mjs`** - Интеграция патча в основной плагин

### Как это работает

```javascript
// Оригинальная функция track в @dailymotion/vast-client
function track(URLTemplates, macros, options) {
  const URLs = resolveURLTemplates(URLTemplates, macros, options);
  URLs.forEach((URL) => {
    const i = new Image(); // ❌ Не следует редиректам
    i.src = URL;
  });
}

// Наша улучшенная функция
function trackWithRedirects(URLTemplates, macros, options) {
  const URLs = resolveURLTemplates(URLTemplates, macros, options);
  URLs.forEach((URL) => {
    const xhr = new XMLHttpRequest(); // ✅ Следует редиректам
    xhr.open('GET', URL, true);
    xhr.withCredentials = false;
    xhr.timeout = 10000;
    
    xhr.onload = () => console.log('Tracked with redirects:', URL);
    xhr.onerror = () => {
      // Fallback на Image при ошибке
      const img = new Image();
      img.src = URL;
    };
    
    xhr.send();
  });
}
```

### Преимущества

1. **Поддержка редиректов** - XMLHttpRequest автоматически следует 302/307 редиректам
2. **Fallback механизм** - При ошибке XHR автоматически переключается на Image
3. **Минимальные изменения** - Патч применяется только к функции трекинга
4. **Совместимость** - Работает со всеми существующими VAST событиями

### Использование

Патч применяется автоматически при инициализации плагина:

```javascript
// В vast-plugin.mjs
const vastClient = new VASTClient();
patchVASTClient(); // ✅ Применяем патч
```

### Тестирование

Создан тестовый файл `test-redirect-tracking-simple.html` с VAST, содержащим трекинговые URL с редиректами:

```xml
<Tracking event="impression">
  https://httpbin.org/redirect-to?url=https://httpbin.org/status/200&status_code=302
</Tracking>
```

### Логирование

Патч добавляет подробное логирование:

```
[VAST Client Patch] Using enhanced tracking with redirects
[VAST Tracking] Successfully tracked with redirects: https://...
```

### Обратная совместимость

- ✅ Все существующие функции работают как прежде
- ✅ VPAID трекинг продолжает работать
- ✅ Fallback на Image при проблемах с XHR
- ✅ Таймаут 10 секунд для предотвращения зависания

## Файлы

- `src/tracking-url-handler.mjs` - Основная логика трекинга с редиректами
- `src/vast-client-patch.mjs` - Патч для переопределения util.track
- `src/vast-plugin.mjs` - Интеграция патча
- `test-redirect-tracking-simple.html` - Тестовый файл
