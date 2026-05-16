import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../app/api/uploadthing/core";

// Получаем оригинальную функцию UploadThing
const { uploadFiles: originalUploadFiles } = generateReactHelpers<OurFileRouter>();

// Сюда вставь ссылку на свой Cloudflare Worker из Шага 1
const PROXY_WORKER_URL = "https://upload-proxy.tsapenko02ss.workers.dev";

// Создаем "обертку" для функции загрузки
export const uploadFiles: typeof originalUploadFiles = async (endpoint, config) => {
  // Сохраняем оригинальный fetch браузера
  const originalFetch = window.fetch;
  
  // Подменяем fetch ("Monkey-patching")
  window.fetch = async (input, init) => {
    const targetUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');

    // Если это запрос на загрузку файла (PUT) на сервера UploadThing/AWS
    if (init?.method === 'PUT' && (targetUrl.includes('uploadthing.com') || targetUrl.includes('amazonaws.com') || targetUrl.includes('ufs.sh'))) {
      
      // Заворачиваем ссылку в наш прокси!
      const proxyUrl = `${PROXY_WORKER_URL}/${targetUrl}`;
      
      // Отправляем файл через прокси
      return originalFetch(proxyUrl, init);
    }
    
    // Все остальные запросы (получение токенов и т.д.) пропускаем как обычно
    return originalFetch(input, init);
  };

  try {
    // Вызываем оригинальный загрузчик UploadThing
    // Он будет использовать наш подмененный fetch
    const result = await originalUploadFiles(endpoint, config);
    return result;
  } finally {
    // ВАЖНО: Возвращаем стандартный fetch на место, чтобы не сломать сайт
    window.fetch = originalFetch;
  }
};