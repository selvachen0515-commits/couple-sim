'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSimStore } from '@/store/useSimStore'

const TEMPERATURE_CONFIG = {
  frozen: { emoji: '❄️', label: '冷战', color: 'text-blue-400', bg: 'bg-blue-50', bar: 'bg-blue-300' },
  tense: { emoji: '🌡', label: '紧张', color: 'text-orange-400', bg: 'bg-orange-50', bar: 'bg-orange-300' },
  warming: { emoji: '🌤', label: '回暖', color: 'text-yellow-500', bg: 'bg-yellow-50', bar: 'bg-yellow-400' },
  intimate: { emoji: '☀️', label: '亲密', color: 'text-rose-400', bg: 'bg-rose-50', bar: 'bg-rose-400' },
}

const TREND_CONFIG = {
  'reconciling': { label: '正在走向和解', color: 'text-green-500', emoji: '📈' },
  'deepening-conflict': { label: '矛盾在加深', color: 'text-red-400', emoji: '📉' },
  'neutral': { label: '暂时平稳', color: 'text-gray-400', emoji: '➡️' },
  'breakthrough': { label: '出现突破', color: 'text-rose-500', emoji: '✨' },
}

export default function ChatPage() {
  const router = useRouter()
  const {
    partner, scene, messages, temperature, conversationTrend,
    currentRedFlags, currentQuickOptions, isLoading,
    addUserMessage, addPartnerMessage, setLoading,
    endConversation, getTemperatureLevel, isSetupComplete,
  } = useSimStore()

  const [input, setInput] = useState('')
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [expandedEmotions, setExpandedEmotions] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isSetupComplete) router.push('/')
  }, [isSetupComplete, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const tempLevel = getTemperatureLevel()
  const tempConfig = TEMPERATURE_CONFIG[tempLevel]
  const trendConfig = TREND_CONFIG[conversationTrend]

  const handleSend = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || isLoading || !scene) return

    setInput('')
    const userMsg = addUserMessage(content)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner,
          scene,
          messages: messages,
          userMessage: content,
        }),
      })

      if (!res.ok) throw new Error('API 请求失败')
      const data = await res.json()
      addPartnerMessage(userMsg.id, data)
    } catch {
      addPartnerMessage(userMsg.id, {
        message: '（网络好像有点问题，请稍后重试）',
        emotionState: '状态未知',
        temperatureDelta: 0,
        redFlags: [],
        quickOptions: currentQuickOptions,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = () => {
    endConversation()
    router.push('/review')
  }

  const toggleEmotion = (id: string) => {
    setExpandedEmotions(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  if (!isSetupComplete || !scene) return null

  return (
    <div className="min-h-screen bg-[#fdf8f5] flex flex-col" style={{ maxHeight: '100dvh' }}>
      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/')} className="text-rose-300 hover:text-rose-500 transition-colors text-lg">←</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm">
              {partner.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{partner.name}</div>
              <div className="text-xs text-gray-400 truncate">{scene.description.slice(0, 30)}…</div>
            </div>
          </div>
        </div>

        {/* 温度计 */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tempConfig.bg} flex-shrink-0`}>
          <span className="text-base">{tempConfig.emoji}</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${tempConfig.bar}`}
              style={{ width: `${temperature}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${tempConfig.color}`}>{tempConfig.label}</span>
        </div>

        <button
          onClick={() => setShowSidePanel(!showSidePanel)}
          className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
          title="分析面板"
        >
          {showSidePanel ? '⊙' : '○'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 对话区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
            {/* 场景卡片 */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs text-rose-500 leading-relaxed">
              📍 <strong>当前场景：</strong>{scene.description}
            </div>

            {messages.length === 0 && (
              <div className="text-center text-gray-300 text-sm py-8">
                对话还没开始，先说点什么吧
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.role === 'partner' && (
                    <span className="text-xs text-gray-400 ml-1">{partner.name}</span>
                  )}

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed bubble-in ${
                      msg.role === 'user'
                        ? msg.score === 'positive'
                          ? 'bg-blue-400 text-white'
                          : msg.score === 'negative'
                          ? 'bg-blue-400 text-white ring-2 ring-red-300'
                          : 'bg-blue-400 text-white'
                        : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                    }`}
                  >
                    {msg.content}
                    {msg.role === 'user' && msg.score === 'negative' && (
                      <span className="ml-1 text-red-200 text-xs">⚠️</span>
                    )}
                    {msg.role === 'user' && msg.score === 'positive' && (
                      <span className="ml-1 text-green-200 text-xs">✓</span>
                    )}
                  </div>

                  {/* 情绪解读（另一半消息） */}
                  {msg.role === 'partner' && msg.emotionState && (
                    <button
                      onClick={() => toggleEmotion(msg.id)}
                      className="text-xs text-rose-300 hover:text-rose-500 ml-1 transition-colors"
                    >
                      🧠 {expandedEmotions.has(msg.id) ? '收起情绪解读' : '查看情绪解读'}
                    </button>
                  )}
                  {msg.role === 'partner' && msg.emotionState && expandedEmotions.has(msg.id) && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-xs text-rose-500 leading-relaxed max-w-xs bubble-in">
                      💭 {msg.emotionState}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 加载中 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-rose-100 bg-white px-4 py-3 flex-shrink-0">
            {/* 快捷选项 */}
            {currentQuickOptions.length > 0 && !isLoading && (
              <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
                {currentQuickOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(opt)}
                    className="flex-shrink-0 text-xs bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-3 py-1 hover:bg-rose-100 transition-colors whitespace-nowrap"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="说点什么…"
                rows={1}
                className="flex-1 border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                style={{ maxHeight: '100px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-rose-400 text-white flex items-center justify-center disabled:opacity-40 hover:bg-rose-500 transition-colors flex-shrink-0"
              >
                ↑
              </button>
            </div>

            <button
              onClick={handleEnd}
              disabled={messages.length < 2}
              className="w-full mt-2 text-xs text-gray-300 hover:text-rose-400 transition-colors disabled:cursor-not-allowed"
            >
              结束对话并查看复盘 →
            </button>
          </div>
        </div>

        {/* 侧边分析面板 */}
        {showSidePanel && (
          <div className="w-56 border-l border-rose-100 bg-white overflow-y-auto flex-shrink-0 scrollbar-hide">
            <div className="p-4 space-y-4">
              {/* 对话走向 */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">当前走向</div>
                <div className={`text-sm font-medium ${trendConfig.color} flex items-center gap-1`}>
                  <span>{trendConfig.emoji}</span>
                  <span>{trendConfig.label}</span>
                </div>
              </div>

              {/* 关系温度 */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">关系温度</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tempConfig.emoji}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{temperature}/100</div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${tempConfig.bar}`}
                        style={{ width: `${temperature}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 雷区提示 */}
              {currentRedFlags.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-2">⚠️ 雷区提示</div>
                  <div className="space-y-1.5">
                    {currentRedFlags.map((flag, i) => (
                      <div key={i} className="text-xs bg-red-50 text-red-400 rounded-lg p-2 leading-relaxed border border-red-100">
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 另一半性格 */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">TA 的性格</div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>依恋：{
                    { secure: '安全型', anxious: '焦虑型', avoidant: '回避型', disorganized: '混乱型' }[partner.attachmentStyle]
                  }</div>
                  <div>敏感度：{
                    { low: '低', medium: '中', high: '高' }[partner.emotionSensitivity]
                  }</div>
                  <div>风格：{
                    { direct: '直给型', indirect: '迂回型', silent: '沉默型' }[partner.communicationStyle]
                  }</div>
                </div>
              </div>

              {/* 消息统计 */}
              {messages.filter(m => m.role === 'user').length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-2">你的表现</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>🟢 加分</span>
                      <span className="font-medium text-green-500">{messages.filter(m => m.role === 'user' && m.score === 'positive').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🟡 中性</span>
                      <span className="font-medium text-yellow-500">{messages.filter(m => m.role === 'user' && m.score === 'neutral').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔴 踩雷</span>
                      <span className="font-medium text-red-400">{messages.filter(m => m.role === 'user' && m.score === 'negative').length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
