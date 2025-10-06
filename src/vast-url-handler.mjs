/**
 * Кастомный URL Handler для VAST запросов
 * Автоматически добавляет важные заголовки включая Referer
 */

/**
 * Создает кастомный URL Handler с поддержкой Referer
 * Использует минимальный набор заголовков, позволяя браузеру добавлять стандартные заголовки автоматически
 * @param {Object} options - опции для настройки заголовков
 * @param {string} options.referer - кастомный referer (по умолчанию текущая страница)
 * @param {Object} options.customHeaders - дополнительные заголовки
 * @param {number} options.timeout - таймаут запроса в миллисекундах
 * @returns {Object} URLHandler объект
 */
export function createVastUrlHandler(options = {}) {
  const {
    referer = window.location.href,
    customHeaders = {},
    timeout = 10000
  } = options;

  return {
    /**
     * Выполняет HTTP GET запрос с дополнительными заголовками
     * @param {string} url - URL для запроса
     * @param {Object} opts - опции запроса
     * @returns {Promise<Object>} Promise с результатом запроса
     */
    get: async (url, opts = {}) => {
      try {
        // Подготавливаем только необходимые заголовки
        // Браузер автоматически добавит стандартные заголовки (User-Agent, Accept-Language и др.)
        const headers = {
          'Referer': referer,
          ...customHeaders
        };

        // Подготавливаем опции для fetch
        const fetchOptions = {
          method: 'GET',
          headers: headers,
          credentials: opts.withCredentials ? 'include' : 'omit',
          mode: 'cors'
        };

        // Добавляем таймаут если указан
        let controller;
        if (timeout > 0) {
          controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          fetchOptions.signal = controller.signal;
          
          // Очищаем таймаут после завершения запроса
          const originalFetch = fetch;
          fetch = async (...args) => {
            try {
              const result = await originalFetch(...args);
              clearTimeout(timeoutId);
              return result;
            } catch (error) {
              clearTimeout(timeoutId);
              throw error;
            }
          };
        }

        console.log(`[VAST URL Handler] Requesting: ${url}`);
        console.log(`[VAST URL Handler] Headers:`, headers);

        // Выполняем запрос
        const response = await fetch(url, fetchOptions);
        
        // Проверяем статус ответа
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Получаем текст ответа
        const text = await response.text();
        
        // Парсим XML
        const xml = new DOMParser().parseFromString(text, 'application/xml');
        
        // Проверяем на ошибки парсинга XML
        const parserError = xml.querySelector('parsererror');
        if (parserError) {
          throw new Error(`XML parsing error: ${parserError.textContent}`);
        }

        console.log(`[VAST URL Handler] Successfully loaded VAST from: ${url}`);
        console.log(`[VAST URL Handler] Response size: ${text.length} bytes`);

        // Возвращаем результат в формате, ожидаемом VASTClient
        return {
          xml: xml,
          statusCode: response.status,
          details: {
            byteLength: text.length,
            statusCode: response.status,
            rawXml: text
          }
        };

      } catch (error) {
        console.error(`[VAST URL Handler] Error loading VAST from ${url}:`, error);
        
        // Возвращаем ошибку в формате, ожидаемом VASTClient
        return {
          error: error,
          statusCode: error.status || 0,
          details: {
            byteLength: 0,
            statusCode: error.status || 0,
            rawXml: ''
          }
        };
      }
    }
  };
}

/**
 * Создает URL Handler с настройками по умолчанию
 * Добавляет только Referer, позволяя браузеру использовать стандартные заголовки
 * @returns {Object} URLHandler с Referer заголовком
 */
export function createDefaultVastUrlHandler() {
  return createVastUrlHandler({
    referer: window.location.href,
    customHeaders: {},
    timeout: 10000
  });
}
