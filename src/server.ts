import express from 'express'
import { env } from './env'
import { Bot, Composer, webhookCallback } from 'grammy'
import { TextMessageController } from './controllers/text-message-controller';

const app = express()
app.use(express.json())

const bot = new Bot(env.BOT_TOKEN)
const composer = new Composer()
composer.on('message:text', TextMessageController.handle)
bot.use(composer)

app.post(`/${env.BOT_TOKEN}`, webhookCallback(bot, "express"))
app.get('/', (__req, res) => res.send('Bot está online!'))

app.listen(env.PORT, async () => {
  await bot.api.setWebhook(`https://${env.DOMAIN}/${env.BOT_TOKEN}`)
  console.log(`Server running on port ${env.PORT}`)
})