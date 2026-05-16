import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../app/api/uploadthing/core";

const { uploadFiles: originalUploadFiles } = generateReactHelpers<OurFileRouter>();

// Твоя ссылка на Cloudflare Worker
const PROXY_WORKER_URL = "https://upload-proxy.tsapenko02ss.workers.dev";

export const uploadFiles: typeof originalUploadFiles = async (endpoint, config) => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input, init) => {
    // Надежно получаем URL, в каком бы формате его не передал браузер или Next.js
    let targetUrl = '';
    if (typeof input === 'string') targetUrl = input;
    else if (input instanceof URL) targetUrl = input.href;
    else if (input instanceof Request) targetUrl = input.url;

    // Перехватываем ТОЛЬКО загрузку файлов на сервера UploadThing/AWS
    if (init?.method === 'PUT' && (targetUrl.includes('uploadthing.com') || targetUrl.includes('amazonaws.com') || targetUrl.includes('ufs.sh'))) {
      const proxyUrl = `${PROXY_WORKER_URL}/${targetUrl}`;
      return originalFetch(proxyUrl, init);
    }
    
    // Все локальные запросы (типа ?_rsc) идут своим чередом!
    return originalFetch(input, init);
  };

  try {
    return await originalUploadFiles(endpoint, config);
  } finally {
    window.fetch = originalFetch;
  }
};