'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSimStore } from '@/store/useSimStore'
import type { EndingType } from '@/types'

const ENDING_CONFIG: Record<EndingType, { emoji: string; title: string; desc: string; color: string; bg: string }> = {
  'deep-cold-war': {
    emoji: '❄️',
    title: '深度冷战',
    desc: '这次对话让关系雪上加霜，双方的距离变得更远了。',
    color: 'text-blue-500',
    bg: 'from-blue-50 to-indigo-50',
  },
  'suppressed': {
    emoji: '🌧',
    title: '暂时压下去了',
    desc: '矛盾没有真正解决，只是暂时搁置了。下次还可能爆发。',
    color: 'text-gray-500',
    bg: 'from-gray-50 to-slate-50',
  },
  'initial-reconciliation': {
    emoji: '🌤',
    title: '初步和解',
    desc: '有进展，关系在回暖。不过还需要更多的沟通和理解。',
    color: 'text-yellow-500',
    bg: 'from-yellow-50 to-amber-50',
  },
  'true-understanding': {
    emoji: '☀️',
    title: '真正理解彼此',
    desc: '这次对话很成功！你们的关系因为这次沟通变得更亲密了。',
    color: 'text-rose-500',
    bg: 'from-rose-50 to-pink-50',
  },
}

const SCORE_CONFIG = {
  positive: { label: '🟢 加分', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  neutral: { label: '🟡 中性', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  negative: { label: '🔴 踩雷', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
}

export default function ReviewPage() {
  const router = useRouter()
  const { reviewReport, partner, scene, resetSimulation, isEnded } = useSimStore()
  const [rewriteTarget, setRewriteTarget] = useState<string>('')
  const [rewriteResult, setRewriteResult] = useState<string>('')
  const [isRewriting, setIsRewriting] = useState(false)

  useEffect(() => {
    if (!isEnded || !reviewReport) router.push('/')
  }, [isEnded, reviewReport, router])

  if (!reviewReport || !scene) return null

  const ending = ENDING_CONFIG[reviewReport.ending]
  const userMessages = reviewReport.messages.filter(m => m.role === 'user')
  const badMessages = userMessages.filter(m => m.score === 'negative')

  const handleRewrite = async (originalMsg: string) => {
    if (!scene) return
    setRewriteTarget(originalMsg)
    setRewriteResult('')
    setIsRewriting(true)

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner, scene, originalMessage: originalMsg }),
      })
      const data = await res.json()
      setRewriteResult(data.rewritten || '改写失败，请重试')
    } catch {
      setRewriteResult('网络错误，请重试')
    } finally {
      setIsRewriting(false)
    }
  }

  const handleRestart = () => {
    resetSimulation()
    router.push('/')
  }

  const handleRetry = () => {
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5] pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* 结局 */}
        <div className={`bg-gradient-to-b ${ending.bg} rounded-3xl p-6 text-center mb-6 border border-white shadow-sm`}>
          <div className="text-6xl mb-3">{ending.emoji}</div>
          <h1 className={`text-2xl font-bold ${ending.color} mb-2`}>{ending.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{ending.desc}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="text-sm text-gray-400">最终关系温度</div>
            <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm">
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-400 transition-all"
                  style={{ width: `${reviewReport.finalTemperature}%` }}
                />
              </div>
              <span className="text-xs font-bold text-rose-500">{reviewReport.finalTemperature}</span>
            </div>
          </div>
        </div>

        {/* 沟通风格总结 */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-rose-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">🧠 你的沟通风格</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{reviewReport.communicationStyleSummary}</p>
        </div>

        {/* 建议 */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-rose-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">💡 改进建议</h2>
          <div className="space-y-3">
            {reviewReport.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 对话回顾 */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-rose-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📋 对话回顾</h2>
          <div className="space-y-2">
            {reviewReport.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  {msg.role === 'user' ? (
                    <div className={`px-3 py-2 rounded-xl text-xs border ${
                      msg.score ? `${SCORE_CONFIG[msg.score].bg} ${SCORE_CONFIG[msg.score].border} ${SCORE_CONFIG[msg.score].text}` : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <div className="flex items-start gap-1">
                        <span className="flex-1 leading-relaxed">{msg.content}</span>
                        {msg.score && <span className="text-xs opacity-70 flex-shrink-0 ml-1">{SCORE_CONFIG[msg.score].label.split(' ')[0]}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-100 text-gray-600">
                      <span className="text-gray-400 mr-1">{partner.name}：</span>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 踩雷改写 */}
        {badMessages.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4 border border-rose-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">✏️ 换一种方式说</h2>
            <p className="text-xs text-gray-400 mb-3">选一句踩雷的话，AI 帮你改写成更好的表达</p>
            <div className="space-y-2 mb-3">
              {badMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleRewrite(msg.content)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all ${
                    rewriteTarget === msg.content
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-red-100 bg-red-50 text-red-500 hover:border-red-300'
                  }`}
                >
                  🔴 &ldquo;{msg.content}&rdquo;
                  {rewriteTarget === msg.content && <span className="ml-2 text-rose-400">（已选择）</span>}
                </button>
              ))}
            </div>

            {isRewriting && (
              <div className="text-xs text-rose-400 text-center py-2 animate-pulse">AI 正在改写中…</div>
            )}

            {rewriteResult && !isRewriting && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-xs text-green-600 font-medium mb-1">💬 更好的表达方式：</div>
                <div className="text-sm text-green-700 leading-relaxed">&ldquo;{rewriteResult}&rdquo;</div>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-3 rounded-xl border border-rose-300 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors"
          >
            换种说法再试
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 py-3 rounded-xl bg-rose-400 text-white text-sm font-medium hover:bg-rose-500 transition-colors"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  )
}
