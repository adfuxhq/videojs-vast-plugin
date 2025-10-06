/**
 * Утилитарный класс для логирования событий VAST плагина
 * Выводит события в консоль браузера в формате JSON
 */

const EVENT_KEY = 'videojs-vast-plugin-event-777';

export class Logger {
  /**
   * Логирует событие в консоль браузера
   * @param {string} event - Название события
   * @param {Object} additionalData - Дополнительные данные для события
   */
  static log(event, additionalData = {}) {
    const eventData = {
      [EVENT_KEY]: event,
      eventTime: Date.now(),
      ...additionalData
    };
    
    console.info(JSON.stringify(eventData));
  }

  /**
   * Логирует событие загрузки VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastLoaded(vastUrl) {
    this.log('vast-loaded', { vastUrl });
  }

  /**
   * Логирует событие парсинга VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastParsed(vastUrl) {
    this.log('vast-parsed', { vastUrl });
  }

  /**
   * Логирует событие готовности VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastReady(vastUrl) {
    this.log('vast-ready', { vastUrl });
  }
}
 