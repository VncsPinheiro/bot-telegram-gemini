import { type Context, InputFile } from "grammy";
import { Gemini } from "../services/gemini";
import { ElevenLabs } from "../services/eleven-labs";
import path from "node:path";

export class TextMessageClass {
  constructor(private geminiService: Gemini, private elabsService: ElevenLabs) {}

  handle = async (ctx: Context) => {
    if (!ctx.message?.text) throw new Error('No message found')

    const modelResponse = await this.geminiService.chat(ctx.message?.text)
    if (!modelResponse) {
       ctx.reply('Erro ao responder sua pergunta')
       return
    }

    await this.elabsService.createSpeech(modelResponse) 

    const audioPath = path.resolve(process.cwd(), "src", "audios", "audio.mp3")
    ctx.replyWithVoice(new InputFile(audioPath))
  }
}

export const TextMessageController = new TextMessageClass(Gemini.getInstance(), ElevenLabs.getInstance())
