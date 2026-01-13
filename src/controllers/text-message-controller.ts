import { Context } from "grammy";
import { Gemini } from "../services/gemini";

export class TextMessageClass {
  constructor(private geminiService: Gemini) {}
  handle = async (ctx: Context) => {
    if (!ctx.message?.text) throw new Error('No message found')

    const modelResponse = await this.geminiService.chat(ctx.message?.text)
    if (!modelResponse) {
       ctx.reply('Erro ao responder sua pergunta')
       return
    }
    ctx.reply(modelResponse)
  }
}

export const TextMessageController = new TextMessageClass(Gemini.getInstance())