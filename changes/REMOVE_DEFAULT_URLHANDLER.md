# Удаление urlHandler из DEFAULT_OPTIONS

## Дата: 2024-12-19

## Описание изменений

Убран кастомный `urlHandler` из `DEFAULT_OPTIONS` в `vast-plugin.mjs`. Теперь плагин использует стандартное поведение библиотеки `@dailymotion/vast-client` по умолчанию.

## Изменения

### 1. Удален urlHandler из DEFAULT_OPTIONS

**Было:**
```javascript
const DEFAULT_OPTIONS = Object.freeze({
  seekEnabled: false,
  controlsEnabled: false,
  wrapperLimit: 10,
  withCredentials: true,
  urlHandler: createXHRVastUrlHandler(),  // Удалено
  skip: 0,
  // ... остальные опции
});
```

**Стало:**
```javascript
const DEFAULT_OPTIONS = Object.freeze({
  seekEnabled: false,
  controlsEnabled: false,
  wrapperLimit: 10,
  withCredentials: true,
  skip: 0,
  // ... остальные опции
});
```

## Поведение

### По умолчанию (новое поведение)
Теперь плагин использует стандартный URL Handler библиотеки `@dailymotion/vast-client`:

```javascript
// Использует стандартное поведение библиотеки
player.vast({
  url: 'http://example.com/vast.xml'
});
```

### Использование кастомного URL Handler (если нужно)
Кастомный URL Handler остается доступным для явного использования:

```javascript
import { createXHRVastUrlHandler } from './src/vast-url-handler.mjs';

// Явно указываем кастомный URL Handler
player.vast({
  url: 'http://example.com/vast.xml',
  urlHandler: createXHRVastUrlHandler()
});
```

## Преимущества

1. **Стандартное поведение**: Используется нативное поведение библиотеки `@dailymotion/vast-client`
2. **Меньше кастомизации**: Упрощенная конфигурация по умолчанию
3. **Сохранена гибкость**: Кастомный URL Handler остается доступным при необходимости
4. **Обратная совместимость**: Существующий код с явно указанным `urlHandler` продолжит работать

## Обратная совместимость

- **Существующий код без изменений**: Продолжит работать с стандартным поведением
- **Код с явным urlHandler**: Продолжит работать как раньше
- **API остается неизменным**: Все методы и опции остаются доступными

## Файлы изменений

- `src/vast-plugin.mjs` - удален `urlHandler: createXHRVastUrlHandler()` из `DEFAULT_OPTIONS`
- `src/vast-url-handler.mjs` - файл остается без изменений (реализация сохранена)
- `src/ad-loader.mjs` - остается без изменений (поддержка urlHandler сохранена)
