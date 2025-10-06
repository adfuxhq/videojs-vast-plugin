/**
 * Утилитарный класс для логирования событий VAST плагина
 * Выводит события в консоль браузера в формате JSON
 */

const EVENT_KEY = 'videojs-vast-plugin-event';

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
    this.log('vast-loaded', { message: vastUrl });
  }

  /**
   * Логирует событие парсинга VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastParsed(vastUrl) {
    this.log('vast-parsed', { message: vastUrl });
  }

  /**
   * Логирует событие готовности VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastReady(vastUrl) {
    this.log('vast-ready', { message: vastUrl });
  }

  // === События трекинга ===

  /**
   * Логирует событие creativeView
   * @param {Object} additionalData - Дополнительные данные
   */
  static logCreativeView(additionalData = {}) {
    this.log('creative-view', { 
      message: 'Creative view event triggered',
      ...additionalData 
    });
  }

  /**
   * Логирует событие start
   * @param {Object} additionalData - Дополнительные данные
   */
  static logStart(additionalData = {}) {
    this.log('start', { 
      message: 'Ad playback started',
      ...additionalData 
    });
  }

  /**
   * Логирует событие firstQuartile (25%)
   * @param {Object} additionalData - Дополнительные данные
   */
  static logFirstQuartile(additionalData = {}) {
    this.log('first-quartile', { 
      message: 'Ad reached first quartile (25%)',
      ...additionalData 
    });
  }

  /**
   * Логирует событие midpoint (50%)
   * @param {Object} additionalData - Дополнительные данные
   */
  static logMidpoint(additionalData = {}) {
    this.log('midpoint', { 
      message: 'Ad reached midpoint (50%)',
      ...additionalData 
    });
  }

  /**
   * Логирует событие thirdQuartile (75%)
   * @param {Object} additionalData - Дополнительные данные
   */
  static logThirdQuartile(additionalData = {}) {
    this.log('third-quartile', { 
      message: 'Ad reached third quartile (75%)',
      ...additionalData 
    });
  }

  /**
   * Логирует событие complete (100%)
   * @param {Object} additionalData - Дополнительные данные
   */
  static logComplete(additionalData = {}) {
    this.log('complete', { 
      message: 'Ad playback completed',
      ...additionalData 
    });
  }

  /**
   * Логирует событие mute
   * @param {Object} additionalData - Дополнительные данные
   */
  static logMute(additionalData = {}) {
    this.log('mute', { 
      message: 'Ad was muted',
      ...additionalData 
    });
  }

  /**
   * Логирует событие unmute
   * @param {Object} additionalData - Дополнительные данные
   */
  static logUnmute(additionalData = {}) {
    this.log('unmute', { 
      message: 'Ad was unmuted',
      ...additionalData 
    });
  }

  /**
   * Логирует событие pause
   * @param {Object} additionalData - Дополнительные данные
   */
  static logPause(additionalData = {}) {
    this.log('pause', { 
      message: 'Ad playback paused',
      ...additionalData 
    });
  }

  /**
   * Логирует событие resume
   * @param {Object} additionalData - Дополнительные данные
   */
  static logResume(additionalData = {}) {
    this.log('resume', { 
      message: 'Ad playback resumed',
      ...additionalData 
    });
  }

  /**
   * Логирует событие fullscreen
   * @param {Object} additionalData - Дополнительные данные
   */
  static logFullscreen(additionalData = {}) {
    this.log('fullscreen', { 
      message: 'Ad entered fullscreen mode',
      ...additionalData 
    });
  }

  /**
   * Логирует определение duration рекламы
   * @param {number} duration - Длительность в секундах
   * @param {Object} additionalData - Дополнительные данные
   */
  static logDuration(duration, additionalData = {}) {
    this.log('duration', { 
      message: `Ad duration determined: ${duration} seconds`,
      duration: duration,
      ...additionalData 
    });
  }

  /**
   * Логирует количество рекламы в блоке
   * @param {number} adsCount - Количество рекламы
   * @param {Object} additionalData - Дополнительные данные
   */
  static logAdsCount(adsCount, additionalData = {}) {
    this.log('ads-count', { 
      message: `Ads count determined: ${adsCount} ads`,
      adsCount: adsCount,
      ...additionalData 
    });
  }
}
 