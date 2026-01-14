import express from 'express'
import { env } from './env'
import { Bot, Composer, webhookCallback } from 'grammy'
import { TextMessageController } from './controllers/text-message-controller'
import { DomainController } from './controllers/domain-controller'

const app = express()
app.use(express.json())

const bot = new Bot(env.BOT_TOKEN)
const composer = new Composer()
composer.on('message:text', TextMessageController.handle)
bot.use(composer)

app.post(`/${env.BOT_TOKEN}`, webhookCallback(bot, 'express'))
app.get('/', (__req, res) => res.send('Bot está online!'))
app.get(`/set-webhook/${env.BOT_TOKEN}`, DomainController.handle)a
app.get('/get-webhook-info', (req, res) => {
  res.status(200).send(env.DOMAIN)
})

app.listen(env.PORT, async () => {
	const path = `https://${env.DOMAIN}/${env.BOT_TOKEN}`
	await bot.api.setWebhook(path)
	console.log(`Server running on port ${env.PORT}`)
	console.log(`Access on ${path}`)
})
