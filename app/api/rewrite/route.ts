import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { PartnerPersonality, SceneConfig } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { partner, scene, originalMessage } = await req.json() as {
      partner: PartnerPersonality
      scene: SceneConfig
      originalMessage: string
    }

    const attachmentLabels = { secure: '安全型', anxious: '焦虑型', avoidant: '回避型', disorganized: '混乱型' }
    const sensitivityLabels = { low: '低敏感', medium: '中敏感', high: '高敏感' }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `你是一位情感沟通专家。请将用户踩雷的话改写成更有效的沟通方式。
另一半性格：${attachmentLabels[partner.attachmentStyle]}，${sensitivityLabels[partner.emotionSensitivity]}，场景：${scene.description}
只返回改写后的话，不要解释，不要引号，不要多余文字。改写后的话要自然、真诚、符合场景。`
        },
        { role: 'user', content: `原话："${originalMessage}"，请改写成更好的表达方式。` }
      ],
      temperature: 0.7,
    })

    const rewritten = response.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ rewritten })
  } catch {
    return NextResponse.json({ error: '改写失败' }, { status: 500 })
  }
}
