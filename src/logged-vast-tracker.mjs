import {VASTTracker} from '@dailymotion/vast-client';
import {Logger} from './logger.mjs';

/**
 * Обертка для VASTTracker с автоматическим логированием событий
 */
export class LoggedVASTTracker extends VASTTracker {
  constructor(vastClient, ad, linearCreative, companionCreative) {
    super(vastClient, ad, linearCreative, companionCreative);
  }

  /**
   * Переопределяем trackImpression для логирования
   */
  trackImpression() {
    super.trackImpression();
    Logger.logCreativeView({
      adId: this.ad?.id,
      creativeId: this.creative?.id
    });
  }

  /**
   * Переопределяем track для логирования всех событий трекинга
   */
  track(eventName) {
    super.track(eventName);
    
    const additionalData = {
      adId: this.ad?.id,
      creativeId: this.creative?.id,
      eventName: eventName
    };

    switch (eventName) {
      case 'start':
        Logger.logStart(additionalData);
        break;
      case 'firstQuartile':
        Logger.logFirstQuartile(additionalData);
        break;
      case 'midpoint':
        Logger.logMidpoint(additionalData);
        break;
      case 'thirdQuartile':
        Logger.logThirdQuartile(additionalData);
        break;
      case 'complete':
        Logger.logComplete(additionalData);
        break;
      case 'mute':
        Logger.logMute(additionalData);
        break;
      case 'unmute':
        Logger.logUnmute(additionalData);
        break;
      case 'pause':
        Logger.logPause(additionalData);
        break;
      case 'resume':
        Logger.logResume(additionalData);
        break;
      case 'fullscreen':
        Logger.logFullscreen(additionalData);
        break;
    }
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
   * Переопределяем complete для логирования
   */
  complete() {
    super.complete();
    Logger.logComplete({
      adId: this.ad?.id,
      creativeId: this.creative?.id
    });
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
