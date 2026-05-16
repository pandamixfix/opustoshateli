import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../app/api/uploadthing/core";

const { uploadFiles: originalUploadFiles } = generateReactHelpers<OurFileRouter>();

// Твой Cloudflare Worker
const PROXY_WORKER_URL = "https://opustoshateli-proxy.pages.dev/";

export const uploadFiles: typeof originalUploadFiles = async (endpoint, config) => {
  // 1. Сохраняем оригинальные функции браузера
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;

  // 2. Ловушка для fetch
  window.fetch = async (input, init) => {
    let targetUrl = '';
    if (typeof input === 'string') targetUrl = input;
    else if (input instanceof URL) targetUrl = input.href;
    else if (input instanceof Request) targetUrl = input.url;

    if (init?.method === 'PUT' && (targetUrl.includes('uploadthing.com') || targetUrl.includes('amazonaws.com') || targetUrl.includes('ufs.sh'))) {
      const proxyUrl = `${PROXY_WORKER_URL}/${targetUrl}`;
      return originalFetch(proxyUrl, init);
    }
    return originalFetch(input, init);
  };

  // 3. Ловушка для XMLHttpRequest (Используем unknown вместо any)
  XMLHttpRequest.prototype.open = function(this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
    let targetUrl = typeof url === 'string' ? url : url.href;

    // Если это загрузка файла (PUT) на сервера UploadThing...
    if (method.toUpperCase() === 'PUT' && (targetUrl.includes('uploadthing.com') || targetUrl.includes('amazonaws.com') || targetUrl.includes('ufs.sh'))) {
      // ...подменяем URL на наш прокси!
      targetUrl = `${PROXY_WORKER_URL}/${targetUrl}`;
    }

    // Игнорируем ошибку TS, так как мы точно знаем, что передаем правильные параметры
    // @ts-expect-error - TS doesn't like spread arguments with overloaded functions
    return originalXHROpen.call(this, method, targetUrl, ...rest);
  };

  try {
    // 4. Запускаем загрузку
    return await originalUploadFiles(endpoint, config);
  } finally {
    // 5. Возвращаем оригинальные функции на место
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
  }
};