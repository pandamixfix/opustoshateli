import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, superpower, motivation } = body;

    const message = `
⚡️ <b>Новая заявка в резидентуру!</b>

👤 <b>Имя:</b> ${name}
🔗 <b>Связь:</b> ${contact}

💎 <b>Потенциал (Суперсила):</b>
${superpower}

🎯 <b>Мотивация:</b>
${motivation}
    `;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Не настроены переменные окружения" },
        { status: 500 }
      );
    }

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
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка отправки в Telegram");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram API Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}