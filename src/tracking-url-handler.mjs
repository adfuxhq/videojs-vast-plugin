/**
 * Кастомный URL Handler для трекинга с поддержкой редиректов
 * Переопределяет стандартную функцию track в @dailymotion/vast-client
 */

/**
 * Улучшенная функция трекинга с поддержкой редиректов
 * @param {Array} URLTemplates - Массив URL шаблонов для трекинга
 * @param {Object} macros - Макросы для замены в URL
 * @param {Object} options - Опции для трекинга
 */
export function trackWithRedirects(URLTemplates, macros = {}, options = {}) {
  const URLs = resolveURLTemplates(URLTemplates, macros, options);
  
  URLs.forEach((URL) => {
    if (typeof window !== 'undefined' && window !== null) {
      // Используем XMLHttpRequest для следования редиректам
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', URL, true);
        xhr.withCredentials = false; // Не отправляем cookies
        xhr.timeout = 10000; // 10 секунд таймаут
        
        xhr.onload = function() {
          console.log('[VAST Tracking] Successfully tracked with redirects:', URL);
        };
        
        xhr.onerror = function() {
          // Fallback на Image при ошибке
          console.warn('[VAST Tracking] XHR failed, falling back to Image');
          const img = new Image();
          img.src = URL;
        };
        
        xhr.ontimeout = function() {
          // Fallback на Image при таймауте
          console.warn('[VAST Tracking] XHR timeout, falling back to Image');
          const img = new Image();
          img.src = URL;
        };
        
        xhr.send();
      } catch (error) {
        // Fallback на Image при исключении
        console.warn('[VAST Tracking] XHR error, falling back to Image:', error);
        const img = new Image();
        img.src = URL;
      }
    }
  });
}

/**
 * Копия функции resolveURLTemplates из @dailymotion/vast-client
 * (упрощенная версия)
 */
function resolveURLTemplates(URLTemplates, macros = {}, options = {}) {
  const resolvedURLs = [];
  const URLArray = extractURLsFromTemplates(URLTemplates);

  // Set default value for invalid ERRORCODE
  if (
    macros['ERRORCODE'] &&
    !options.isCustomCode &&
    !/^[0-9]{3}$/.test(macros['ERRORCODE'])
  ) {
    macros['ERRORCODE'] = 900;
  }

  // Calc random/time based macros
  macros['CACHEBUSTING'] = addLeadingZeros(Math.round(Math.random() * 1.0e8));
  macros['TIMESTAMP'] = new Date().toISOString();
  macros['RANDOM'] = macros['random'] = macros['CACHEBUSTING'];

  for (const macro in macros) {
    macros[macro] = encodeURIComponentRFC3986(macros[macro]);
  }

  for (const URLTemplateKey in URLArray) {
    const resolveURL = URLArray[URLTemplateKey];

    if (typeof resolveURL !== 'string') {
      continue;
    }
    resolvedURLs.push(replaceUrlMacros(resolveURL, macros));
  }
  return resolvedURLs;
}

function extractURLsFromTemplates(URLTemplates) {
  if (Array.isArray(URLTemplates)) {
    return URLTemplates.map((URLTemplate) => {
      return URLTemplate && URLTemplate.hasOwnProperty('url')
        ? URLTemplate.url
        : URLTemplate;
    });
  }
  return URLTemplates;
}

function replaceUrlMacros(url, macros) {
  let replacedMacrosUrl = url;
  for (const key in macros) {
    const value = macros[key];
    replacedMacrosUrl = replacedMacrosUrl.replace(
      new RegExp(`(?:\\[|%%)(${key})(?:\\]|%%)`, 'g'),
      value
    );
  }
  return replacedMacrosUrl;
}

function encodeURIComponentRFC3986(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`
  );
}

function addLeadingZeros(input, length = 8) {
  return input.toString().padStart(length, '0');
}
