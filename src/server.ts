import express from 'express'
import { env } from './env'
import { Bot, Composer } from 'grammy'
import { TextMessageController } from './controllers/text-message-controller';

const bot = new Bot(env.BOT_TOKEN); // <-- place your bot token in this string

// bot.on("message:text", (ctx) => ctx.reply("Echo: " + ctx.message.text));

const composer = new Composer()

composer.on('message:text', TextMessageController.handle)

bot.use(composer)
// Start the bot (using long polling)
bot.start();

// const app = express()

// app.listen(env.PORT, () => {
//   console.log(`Server running on port ${env.PORT}`)
// })