import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

// Загрузка соответствующего .env файла в зависимости от NODE_ENV
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const token = process.env.TG_API_KEY || "";
const appAddress = process.env.URL_FRONTEND || "";

const bot = new Telegraf(token);

bot.command("start", (ctx) => {
  ctx.reply(
    "Добро пожаловать в бот! Ниже появится кнопка, запустить приложение",
    Markup.inlineKeyboard([Markup.button.webApp("Расписание", appAddress)])
  );
});

bot.launch();
