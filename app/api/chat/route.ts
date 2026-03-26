import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt } from '@/lib/prompts'
import type { PartnerPersonality, SceneConfig, ChatMessage, AIResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { partner, scene, messages, userMessage } = await req.json() as {
      partner: PartnerPersonality
      scene: SceneConfig
      messages: ChatMessage[]
      userMessage: string
    }

    if (!partner || !scene || !userMessage) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(partner, scene, messages)

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    for (const msg of messages) {
      if (msg.role === 'user') {
        openaiMessages.push({ role: 'user', content: msg.content })
      } else {
        openaiMessages.push({ role: 'assistant', content: msg.content })
      }
    }

    openaiMessages.push({ role: 'user', content: userMessage })

    const response = await openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: openaiMessages,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'AI 没有返回内容' }, { status: 500 })
    }

    let aiResponse: AIResponse
    try {
      aiResponse = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: '解析 AI 回复失败' }, { status: 500 })
    }

    const validatedResponse: AIResponse = {
      message: aiResponse.message || '...',
      emotionState: aiResponse.emotionState || '情绪状态未知',
      temperatureDelta: typeof aiResponse.temperatureDelta === 'number'
        ? Math.max(-20, Math.min(20, aiResponse.temperatureDelta))
        : 0,
      redFlags: Array.isArray(aiResponse.redFlags) ? aiResponse.redFlags : [],
      quickOptions: Array.isArray(aiResponse.quickOptions) && aiResponse.quickOptions.length >= 3
        ? aiResponse.quickOptions.slice(0, 3)
        : ['安慰对方', '解释原因', '先道歉'],
    }

    return NextResponse.json(validatedResponse)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
