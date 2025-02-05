import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Загрузка соответствующего .env файла в зависимости от NODE_ENV
dotenv.config();

const token = process.env.TG_API_KEY || "";
const appAddress = process.env.URL_FRONTEND || "";

const bot = new Telegraf(token);

// Получаем __dirname в ES-модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Путь к JSON-файлу
const dbPath = path.join(__dirname, "db.json");

// Функция чтения данных из JSON
function readDB(): any {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

// Функция записи в JSON
function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Функция добавления пользователя
function addUser(chatId: number, userId: number) {
  const db = readDB();
  if (!db.users.find((user: any) => user.chatId === chatId)) {
    db.users.push({ chatId, userId, messageId: null }); // Добавляем поле messageId
    writeDB(db);
  }
}

// Функция удаления пользователя
function removeUser(chatId: number) {
  const db = readDB();
  db.users = db.users.filter((user: any) => user.chatId !== chatId);
  writeDB(db);
}

// Функция отправки уведомлений
async function sendNotifications() {
  const db = readDB();

  for (const user of db.users) {
    try {
      // Если у пользователя есть старое сообщение, удаляем его
      if (user.messageId) {
        await bot.telegram.deleteMessage(user.chatId, user.messageId);
      }

      // Отправляем новое сообщение
      const sentMessage = await bot.telegram.sendMessage(
        user.chatId,
        "Составьте пожалуйста расписание на следующую неделю.",
        Markup.inlineKeyboard([Markup.button.webApp("Расписание", appAddress)])
      );

      // Сохраняем messageId нового сообщения
      user.messageId = sentMessage.message_id;
      writeDB(db); // Обновляем базу данных
    } catch (error) {
      console.error(`Ошибка отправки в чат ${user.chatId}:`, error);
    }
  }

  console.log("✅ Уведомления отправлены.");
}

bot.command("start", (ctx) => {
  const allowedUsers = [5442654860, 845550767];
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  if (!allowedUsers.includes(userId)) {
    addUser(chatId, userId);
  }

  ctx.reply(
    "Добро пожаловать! Для использования приложения для составления расписания нажмите на кнопку.",
    Markup.inlineKeyboard([Markup.button.webApp("Расписание", appAddress)])
  );
});

cron.schedule("0 12 * * 0", async () => {
  await sendNotifications();
});

console.log("🚀 Бот запущен.");

bot.launch();
