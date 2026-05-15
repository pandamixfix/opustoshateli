import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Настраиваем, что можно грузить
  mediaPost: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 }
  })
  .onUploadComplete(async ({ file }) => {
    // Мы убрали слово metadata отсюда, чтобы линтер не ругался
    console.log("Файл загружен по ссылке:", file.url);
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;