/**
 * Утилитарный класс для логирования событий VAST плагина
 * Выводит события в консоль браузера в формате JSON
 */

const EVENT_KEY = 'player-event';

export class Logger {
  /**
   * Логирует событие в консоль браузера
   * @param {string} event - Название события
   * @param {string|null} message - Сообщение с важными данными или null
   */
  static log(event, message = null) {
    const eventData = {
      [EVENT_KEY]: event,
      'event-time': Date.now(),
      message: message
    };
    
    console.info(JSON.stringify(eventData));
  }

  /**
   * Логирует событие загрузки VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastLoaded(vastUrl) {
    this.log('vast-loaded', vastUrl);
  }

  /**
   * Логирует событие парсинга VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastParsed(vastUrl) {
    this.log('vast-parsed', vastUrl);
  }

  /**
   * Логирует событие готовности VAST
   * @param {string} vastUrl - URL, из которого был загружен VAST код
   */
  static logVastReady(vastUrl) {
    this.log('vast-ready', vastUrl);
  }

  // === События трекинга ===

  /**
   * Логирует событие creativeView
   */
  static logCreativeView() {
    this.log('creative-view', null);
  }

  /**
   * Логирует событие start
   */
  static logStart() {
    this.log('start', null);
  }

  /**
   * Логирует событие firstQuartile (25%)
   */
  static logFirstQuartile() {
    this.log('first-quartile', null);
  }

  /**
   * Логирует событие midpoint (50%)
   */
  static logMidpoint() {
    this.log('midpoint', null);
  }

  /**
   * Логирует событие thirdQuartile (75%)
   */
  static logThirdQuartile() {
    this.log('third-quartile', null);
  }

  /**
   * Логирует событие complete (100%)
   */
  static logComplete() {
    this.log('complete', null);
  }

  /**
   * Логирует событие mute
   */
  static logMute() {
    this.log('mute', null);
  }

  /**
   * Логирует событие unmute
   */
  static logUnmute() {
    this.log('unmute', null);
  }

  /**
   * Логирует событие pause
   */
  static logPause() {
    this.log('pause', null);
  }

  /**
   * Логирует событие resume
   */
  static logResume() {
    this.log('resume', null);
  }

  /**
   * Логирует событие fullscreen
   */
  static logFullscreen() {
    this.log('fullscreen', null);
  }

  /**
   * Логирует определение duration рекламы
   * @param {number} duration - Длительность в секундах
   */
  static logDuration(duration) {
    this.log('duration', duration.toString());
  }

  /**
   * Логирует количество рекламы в блоке
   * @param {number} adsCount - Количество рекламы
   */
  static logAdsCount(adsCount) {
    this.log('ads-count', adsCount.toString());
  }

  /**
   * Логирует прогресс просмотра рекламы
   * @param {number} progress - Процент прогресса (0-100)
   */
  static logProgress(progress) {
    this.log('progress', progress.toString());
  }
}