declare const uni: any;  // uniapp
declare const wx: any;   // 微信小程序、微信小游戏
declare const my: any;   // 支付宝小程序
declare const tt: any;   // 字节跳动小程序
declare const dd: any;   // 钉钉小程序
declare const qq: any;   // QQ 小程序、QQ 小游戏
declare const swan: any; // 百度小程序

import { debugLog, debugError } from './debug';

/**
 * 小程序平台 SDK 接口
 */
interface SDK {
  request: Function;
  httpRequest?: Function; // 针对钉钉小程序
  getSystemInfo: Function;
  getSystemInfoSync: Function;
  onError?: Function;
  onUnhandledRejection?: Function;
  onPageNotFound?: Function;
  onMemoryWarning?: Function;
  getLaunchOptionsSync?: Function;
}

/**
 * 小程序平台 接口
 */
type AppName =
  | "uniapp"
  | "wechat"
  | "alipay"
  | "bytedance"
  | "dingtalk"
  | "qq"
  | "swan"
  | "quickapp"
  | "unknown";

let currentSdk: SDK = {
  // tslint:disable-next-line: no-empty
  request: () => {
  },
  // tslint:disable-next-line: no-empty
  httpRequest: () => {
  },
  // tslint:disable-next-line: no-empty
  getSystemInfoSync: () => {
  },
  // tslint:disable-next-line: no-empty
  getSystemInfo: () => {
  },
};

/**
 * 获取跨平台的 SDK
 */
const getSDK = () => {
  debugLog('[Sentry CrossPlatform] Detecting platform...');
  debugLog('[Sentry CrossPlatform] typeof uni:', typeof uni);
  debugLog('[Sentry CrossPlatform] typeof wx:', typeof wx);

  if (typeof uni === "object") {
    debugLog('[Sentry CrossPlatform] Using uni SDK');
    debugLog('[Sentry CrossPlatform] uni.request available:', typeof uni.request);
    currentSdk = uni;
  } else if (typeof wx === "object") {
    debugLog('[Sentry CrossPlatform] Using wx SDK');
    debugLog('[Sentry CrossPlatform] wx.request available:', typeof wx.request);
    currentSdk = wx;
  } else if (typeof my === "object") {
    debugLog('[Sentry CrossPlatform] Using my SDK');
    currentSdk = my;
  } else if (typeof tt === "object") {
    debugLog('[Sentry CrossPlatform] Using tt SDK');
    currentSdk = tt;
  } else if (typeof dd === "object") {
    debugLog('[Sentry CrossPlatform] Using dd SDK');
    currentSdk = dd;
  } else if (typeof qq === "object") {
    debugLog('[Sentry CrossPlatform] Using qq SDK');
    currentSdk = qq;
  } else if (typeof swan === "object") {
    debugLog('[Sentry CrossPlatform] Using swan SDK');
    currentSdk = swan;
  } else {
    debugError('[Sentry CrossPlatform] No supported platform detected!');
    // tslint:disable-next-line:no-console
    console.log("sentry-uniapp 暂不支持此平台, 快应用请使用 sentry-quickapp");
  }

  debugLog('[Sentry CrossPlatform] Final SDK.request type:', typeof currentSdk.request);
  return currentSdk;
};

/**
 * 获取平台名称
 */
const getAppName = () => {
  let currentAppName: AppName = "unknown";

  if (typeof uni === "object") {
    currentAppName = "uniapp";
  } else if (typeof wx === "object") {
    currentAppName = "wechat";
  } else if (typeof my === "object") {
    currentAppName = "alipay";
  } else if (typeof tt === "object") {
    currentAppName = "bytedance";
  } else if (typeof dd === "object") {
    currentAppName = "dingtalk";
  } else if (typeof qq === "object") {
    currentAppName = "qq";
  } else if (typeof swan === "object") {
    currentAppName = "swan";
  }

  return currentAppName;
};

const sdk = getSDK();
const appName = getAppName();

export { sdk, appName };
