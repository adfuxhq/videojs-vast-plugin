import {VASTTracker} from '@dailymotion/vast-client';
import {Logger} from './logger.mjs';

/**
 * Обертка для VASTTracker с автоматическим логированием событий
 */
export class LoggedVASTTracker extends VASTTracker {
  constructor(vastClient, ad, linearCreative, companionCreative) {
    super(vastClient, ad, linearCreative, companionCreative);
    
    // Слушаем события от VASTTracker вместо переопределения методов
    this.setupEventListeners();
  }

  /**
   * Настраивает слушатели событий для автоматического логирования
   */
  setupEventListeners() {
    // Слушаем события трекинга от VASTTracker
    this.on('creativeView', () => {
      Logger.logCreativeView({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('start', () => {
      Logger.logStart({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('firstQuartile', () => {
      Logger.logFirstQuartile({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('midpoint', () => {
      Logger.logMidpoint({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('thirdQuartile', () => {
      Logger.logThirdQuartile({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('complete', () => {
      Logger.logComplete({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('mute', () => {
      Logger.logMute({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('unmute', () => {
      Logger.logUnmute({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('pause', () => {
      Logger.logPause({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('resume', () => {
      Logger.logResume({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });

    this.on('fullscreen', () => {
      Logger.logFullscreen({
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    });
  }


  /**
   * Переопределяем setProgress для логирования duration при первом определении
   */
  setProgress(progress) {
    const wasDurationUndefined = isNaN(this.assetDuration);
    super.setProgress(progress);
    
    // Логируем duration только при первом определении
    if (wasDurationUndefined && !isNaN(this.assetDuration)) {
      Logger.logDuration(this.assetDuration, {
        adId: this.ad?.id,
        creativeId: this.creative?.id
      });
    }
  }


  /**
   * Переопределяем error для логирования
   */
  error(errorData) {
    super.error(errorData);
    Logger.log('error', {
      message: `Ad error occurred: ${errorData?.ERRORCODE || 'Unknown error'}`,
      errorCode: errorData?.ERRORCODE,
      adId: this.ad?.id,
      creativeId: this.creative?.id
    });
  }
}
