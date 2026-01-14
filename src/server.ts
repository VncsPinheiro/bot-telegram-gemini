import express, { Express } from 'express'
import { env } from './env'
import { Bot, Composer, webhookCallback } from 'grammy'
import { TextMessageController } from './controllers/text-message-controller'
import { DomainController } from './controllers/domain-controller'

const app: Express = express()
app.use(express.json())

const bot = new Bot(env.BOT_TOKEN)
const composer = new Composer()
composer.on('message:text', TextMessageController.handle)
bot.use(composer)

app.post(`/${env.BOT_TOKEN}`, webhookCallback(bot, 'express'))
app.get('/', (__req, res) => res.send('Bot está online!'))
app.get(`/set-webhook/${env.BOT_TOKEN}`, DomainController.handle)
app.get('/get-webhook-info', (req, res) => {
  res.status(200).send(env.DOMAIN)
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT || 3000, () => {
    console.log(`Local server running on port ${env.PORT}`)
  })
}

// O segredo para a Vercel funcionar:
export default app