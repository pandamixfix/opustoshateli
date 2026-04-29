import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Получаем данные, которые юзер ввел на сайте
    const body = await req.json();
    const { name, contact, superpower, motivation } = body;

    // Формируем красивое сообщение для Телеграма
    const message = `
⚡️ <b>Новая заявка в резидентуру!</b>

👤 <b>Имя:</b> ${name}
🔗 <b>Связь:</b> ${contact}

💎 <b>Потенциал (Суперсила):</b>
${superpower}

🎯 <b>Мотивация:</b>
${motivation}
    `;

    // Берем секретные ключи из переменных окружения
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Не настроены переменные окружения" },
        { status: 500 }
      );
    }

    // Отправляем запрос на официальный сервер Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML", // Чтобы работали жирные шрифты <b>
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка отправки в Telegram");
    }

    // Говорим фронтенду, что всё ок
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram API Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}