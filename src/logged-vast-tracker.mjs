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
      Logger.logCreativeView();
    });

    this.on('start', () => {
      Logger.logStart();
    });

    this.on('firstQuartile', () => {
      Logger.logFirstQuartile();
    });

    this.on('midpoint', () => {
      Logger.logMidpoint();
    });

    this.on('thirdQuartile', () => {
      Logger.logThirdQuartile();
    });

    this.on('complete', () => {
      Logger.logComplete();
    });

    this.on('mute', () => {
      Logger.logMute();
    });

    this.on('unmute', () => {
      Logger.logUnmute();
    });

    this.on('pause', () => {
      Logger.logPause();
    });

    this.on('resume', () => {
      Logger.logResume();
    });

    this.on('fullscreen', () => {
      Logger.logFullscreen();
    });
  }


  /**
   * Переопределяем setProgress для логирования duration и прогресса
   */
  setProgress(progress) {
    const wasDurationUndefined = isNaN(this.assetDuration);
    super.setProgress(progress);
    
    // Логируем duration только при первом определении
    if (wasDurationUndefined && !isNaN(this.assetDuration)) {
      Logger.logDuration(this.assetDuration);
    }
    
    // Логируем прогресс в процентах
    if (!isNaN(this.assetDuration) && this.assetDuration > 0) {
      const progressPercent = Math.round((progress / this.assetDuration) * 100);
      Logger.logProgress(progressPercent);
    }
  }


  /**
   * Переопределяем error для логирования
   */
  error(errorData) {
    super.error(errorData);
    Logger.log('error', errorData?.ERRORCODE?.toString() || 'Unknown error');
  }
}
