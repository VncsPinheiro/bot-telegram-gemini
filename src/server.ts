import express from 'express'
import { env } from './env'
import { Bot, Composer, webhookCallback } from 'grammy'
import { TextMessageController } from './controllers/text-message-controller'
import { DomainController } from './controllers/domain-controller'

const app = express()
app.use(express.json())

const path = `https://${env.DOMAIN}/${env.SECRET}`

const bot = new Bot(env.BOT_TOKEN)
const composer = new Composer()
composer.on('message:text', TextMessageController.handle)
bot.use(composer)

app.post(`/${env.SECRET}`, webhookCallback(bot, 'express'))
app.get('/', (__req, res) => res.send('Bot está online!'))
app.get(`/set-webhook/${env.SECRET}`, DomainController.handelSetWebhook)
app.get(`/webhook-info/${env.SECRET}`, DomainController.handleGetWebhookData)
app.get('/maintenance', async (__req, res) => {
	await bot.api.setWebhook(path)
	return res.status(200).send(`URL re-setted to ${path}`)
})

app.listen(env.PORT, async () => {
	await bot.api.setWebhook(path)
	console.log(`Server running on port ${env.PORT}`)
	console.log(`Access on ${path}`)
})
