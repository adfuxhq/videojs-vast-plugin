import window from "global";
import {companionFn, linearFn} from "./utils.mjs";
import {VASTClient, VASTParser, VASTTracker} from '@dailymotion/vast-client';
import {TrackedAd} from "./tracked-ad.mjs";
import {Logger} from './logger.mjs';
import {LoggedVASTTracker} from './logged-vast-tracker.mjs';
import {patchVASTClient} from './vast-client-patch.mjs';

export class AdLoader {
  #vastClient
  #vastParser
  #options
  #adSelector
  #lastVastUrl;

  /**
   *
   * @param {VASTClient} vastClient
   * @param {VASTParser} vastParser
   * @param {AdSelector} adSelector
   * @param {object} options
   */
  constructor(vastClient, vastParser, adSelector, options) {
    this.#vastClient = vastClient;
    this.#vastParser = vastParser;
    this.#adSelector = adSelector;
    this.#options = options;
  }

  loadAds(params = {}) {
    return new Promise((accept, reject) => {
      const {url : urlConfig, xml} = params;

      const urls = (Array.isArray(urlConfig) ? urlConfig : [urlConfig])
        .filter(url => url != null);

      let promise;
      if (urls.length) {
        promise = Promise.resolve([]);
        urls.forEach(url => {
          promise = promise.then(ads => {
            if (ads == null || ads.length === 0) {
              return this.loadAdsWithUrl(url);
            } else {
              return ads;
            }
          }).catch(ignore => {
            return [];
          });
        });
      } else if (xml != null) {
        promise = this.loadAdsWithXml(xml);
      } else {
        throw new Error('xml or url must be set');
      }

      promise.then(accept).catch(reject);
    });
  }

  /**
   *
   * @param {XMLDocument|string} xml
   * @return Promise<Array[TrackedAd]>
   */
  loadAdsWithXml(xml) {
    return new Promise((accept, reject) => {
      let xmlDocument;

      if (xml.constructor === window.XMLDocument) {
        xmlDocument = xml;
      } else if (xml.constructor === String) {
        xmlDocument = (new window.DOMParser()).parseFromString(xml, 'application/xml');
      } else {
        throw new Error('xml config option must be a String or XMLDocument');
      }

      this.#lastVastUrl = 'inline-xml';
      this.#vastParser
        .parseVAST(xmlDocument)
        .then(ads => {
          // Логируем событие успешной загрузки VAST (для inline XML)
          Logger.logVastLoaded('inline-xml');
          // Логируем событие парсинга VAST
          Logger.logVastParsed('inline-xml');
          return this.#adSelector.selectAds(ads);
        })
        .then(this.#createTrackedAds)
        .then(accept)
        .catch(reject);
    })
  }

  loadAdsWithUrl(url) {
    return new Promise((accept, reject) => {
      this.#lastVastUrl = url;
      
      // Применяем патч VAST клиента перед первым использованием
      patchVASTClient();
      
      this.#vastClient
        .get(url, {
          withCredentials: this.#options.withCredentials,
          wrapperLimit: this.#options.wrapperLimit,
          urlHandler: this.#options.urlHandler,
        })
        .then(ads => {
          // Логируем событие успешной загрузки VAST
          Logger.logVastLoaded(url);
          // Логируем событие парсинга VAST
          Logger.logVastParsed(url);
          return this.#adSelector.selectAds(ads);
        })
        .then(this.#createTrackedAds)
        .then(accept)
        .catch(reject);
    })
  }

  /*** private methods ***/

  #createTrackedAds = ads => {
    const createTrackedAd = ad => {
      const linearAdTracker =
        new LoggedVASTTracker(this.#vastClient, ad, ad.creatives.find(linearFn), ad.creatives.find(companionFn));

      linearAdTracker.on('clickthrough', onClickThrough);

      let companionAdTracker = null;

      const companionCreative = ad.creatives.find(companionFn);

      if (companionCreative) {
        // Just pick the first suitable companion ad for now
        const options = this.#options;
        const variation = companionCreative.variations
          .filter(v => v.staticResource)
          .filter(v => v.type.indexOf('image') === 0)
          .find(v => parseInt(v.width, 10) <= options.companion.maxWidth && parseInt(v.height, 10) <= options.companion.maxHeight);

        if (variation) {
          companionAdTracker = new LoggedVASTTracker(this.#vastClient, ad, companionCreative, variation);
          companionAdTracker.on('clickthrough', onClickThrough);
        }
      }

      return new TrackedAd(linearAdTracker, companionAdTracker);
    }

    const trackedAds = ads.map(createTrackedAd);
    
    // Логируем событие готовности VAST (после создания TrackedAd объектов)
    // Используем URL из последнего загруженного VAST или 'inline-xml' если не определен
    const vastUrl = this.#lastVastUrl || 'inline-xml';
    Logger.logVastReady(vastUrl);
    
    return trackedAds;
  }
}

function onClickThrough(url) {
  window.open(url, '_blank');
}
