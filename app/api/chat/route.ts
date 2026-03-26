import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt } from '@/lib/prompts'
import type { PartnerPersonality, SceneConfig, ChatMessage, AIResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // 构建 OpenAI messages 格式
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    // 添加历史对话
    for (const msg of messages) {
      if (msg.role === 'user') {
        openaiMessages.push({ role: 'user', content: msg.content })
      } else {
        openaiMessages.push({ role: 'assistant', content: msg.content })
      }
    }

    // 添加当前用户消息
    openaiMessages.push({ role: 'user', content: userMessage })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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

    // 验证并补全必要字段
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
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API 错误: ${error.message}` },
        { status: error.status || 500 }
      )
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
