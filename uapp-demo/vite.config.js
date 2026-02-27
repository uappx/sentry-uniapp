import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import UnoCSS from 'unocss/vite';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import { SENTRY_RELEASE } from './sentry.release.js';

const UNI_PLATFORM = process.env.UNI_PLATFORM;
const isMpWeixin = UNI_PLATFORM === 'mp-weixin';
const assetsPath = isMpWeixin ? './unpackage/dist/dev/mp-weixin/**' : './unpackage/dist/build/h5/**';
const urlPrefix = process.env.SENTRY_URL_PREFIX || (isMpWeixin ? '~/appservice' : '~/assets');

export default defineConfig({
  plugins: [
    uni(),
    UnoCSS(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      url: process.env.SENTRY_URL,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // 禁用自动上传（可通过环境变量控制）
      disable: process.env.SENTRY_UPLOAD === 'false',
      release: { name: SENTRY_RELEASE, dist: UNI_PLATFORM, setCommits: { auto: true } },

      // Sourcemap 上传配置
      sourcemaps: {
        assets: assetsPath,
        urlPrefix
        // filesToDeleteAfterUpload: ['**/*.map']
      }
    })
  ],
  build: {
    // 上传到 Sentry 用于错误堆栈还原
    sourcemap: true // 生成独立的 .map 文件，但不在 JS 中引用
  }
});
