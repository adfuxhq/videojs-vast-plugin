/**
 * Патч для @dailymotion/vast-client
 * Переопределяет функцию track в util для поддержки редиректов
 */

import {trackWithRedirects} from './tracking-url-handler.mjs';
import {util} from '@dailymotion/vast-client';

/**
 * Применяет патч к @dailymotion/vast-client
 * Переопределяет util.track для использования нашего улучшенного трекинга
 */
export function patchVASTClient() {
  if (util && util.track) {
    // Сохраняем оригинальную функцию
    const originalTrack = util.track;
    
    // Переопределяем функцию track
    util.track = function(URLTemplates, macros, options) {
      console.log('[VAST Client Patch] Using enhanced tracking with redirects');
      
      // Используем нашу улучшенную функцию трекинга
      trackWithRedirects(URLTemplates, macros, options);
    };
    
    console.log('[VAST Client Patch] Successfully patched util.track');
    return true;
  } else {
    console.warn('[VAST Client Patch] Could not find util.track to patch');
    return false;
  }
}

/**
 * Восстанавливает оригинальную функцию track
 */
export function unpatchVASTClient() {
  if (util && util._originalTrack) {
    util.track = util._originalTrack;
    delete util._originalTrack;
    console.log('[VAST Client Patch] Restored original util.track');
    return true;
  }
  return false;
}
