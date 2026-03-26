'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSimStore } from '@/store/useSimStore'
import type { AttachmentStyle, EmotionSensitivity, CommunicationStyle } from '@/types'

const PRESET_SCENES = [
  { id: 'slow-reply', emoji: '💬', title: '回消息太慢', description: '你今天回消息比较慢，对方认为你不在乎他/她，情绪有些低落，等了很久才等到你的回复。' },
  { id: 'forgot-anniversary', emoji: '🎂', title: '忘了纪念日', description: '你忘记了你们的纪念日，对方精心准备了惊喜却扑了个空，现在正在生闷气。' },
  { id: 'cold-war', emoji: '😶', title: '冷战中', description: '你们已经冷战了两天，起因是一件小事。对方没有主动开口，你决定打破僵局。' },
  { id: 'too-busy', emoji: '😤', title: '工作太忙', description: '最近你工作非常繁忙，已经连续一周没有好好陪对方，对方开始抱怨你"心里只有工作"。' },
  { id: 'midnight-breakdown', emoji: '🌙', title: '深夜情绪崩溃', description: '凌晨一点，对方突然说"感觉好累，什么都不想做"，情绪明显低落，你不确定发生了什么。' },
]

const ATTACHMENT_OPTIONS: { value: AttachmentStyle; label: string; desc: string; emoji: string }[] = [
  { value: 'secure', label: '安全型', desc: '情感稳定，信任对方，能良性沟通', emoji: '🌿' },
  { value: 'anxious', label: '焦虑型', desc: '在意回应，容易过度解读，需要确认感', emoji: '🌊' },
  { value: 'avoidant', label: '回避型', desc: '不擅长表达，遇冲突倾向退缩沉默', emoji: '🌑' },
  { value: 'disorganized', label: '混乱型', desc: '既渴望亲密又害怕亲密，情绪不稳定', emoji: '⚡' },
]

const SENSITIVITY_OPTIONS: { value: EmotionSensitivity; label: string; desc: string }[] = [
  { value: 'low', label: '低', desc: '比较理性，不易被情绪触动' },
  { value: 'medium', label: '中', desc: '能感受情绪，但不会过度反应' },
  { value: 'high', label: '高', desc: '对语气用词极敏感，易受伤也易感动' },
]

const COMMUNICATION_OPTIONS: { value: CommunicationStyle; label: string; desc: string; emoji: string }[] = [
  { value: 'direct', label: '直给型', desc: '有什么说什么，不绕弯子', emoji: '⚡' },
  { value: 'indirect', label: '迂回型', desc: '表达委婉，说的不一定是真正想说的', emoji: '🌀' },
  { value: 'silent', label: '沉默型', desc: '喜欢先沉默，不擅长主动开口', emoji: '🤫' },
]

export default function SetupPage() {
  const router = useRouter()
  const { partner, setPartner, setScene, startSimulation } = useSimStore()
  const [selectedScene, setSelectedScene] = useState<string>('')
  const [customScene, setCustomScene] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const canProceedStep1 = partner.name.trim().length > 0

  const canProceedStep2 = selectedScene !== '' || (isCustom && customScene.trim().length > 0)

  const handleStart = () => {
    const sceneDesc = isCustom
      ? customScene
      : PRESET_SCENES.find((s) => s.id === selectedScene)?.description || ''

    setScene({
      type: isCustom ? 'custom' : 'preset',
      presetId: isCustom ? undefined : selectedScene,
      customDescription: isCustom ? customScene : undefined,
      description: sceneDesc,
    })
    startSimulation()
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💑</div>
          <h1 className="text-2xl font-bold text-rose-900">情侣沟通模拟器</h1>
          <p className="text-rose-400 mt-1 text-sm">模拟真实对话场景，看看不同的说法会带来什么结果</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-300'}`}>1</div>
          <div className={`h-0.5 w-12 transition-colors ${step >= 2 ? 'bg-rose-400' : 'bg-rose-100'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-300'}`}>2</div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-rose-800">设置另一半的性格</h2>

              {/* 名字 */}
              <div>
                <label className="text-sm text-rose-600 font-medium mb-1.5 block">Ta 叫什么名字？</label>
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => setPartner({ name: e.target.value })}
                  placeholder="小林、阿明、宝宝……"
                  className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>

              {/* 依恋类型 */}
              <div>
                <label className="text-sm text-rose-600 font-medium mb-1.5 block">依恋类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {ATTACHMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPartner({ attachmentStyle: opt.value })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        partner.attachmentStyle === opt.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{opt.emoji}</div>
                      <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 情绪敏感度 */}
              <div>
                <label className="text-sm text-rose-600 font-medium mb-1.5 block">情绪敏感度</label>
                <div className="grid grid-cols-3 gap-2">
                  {SENSITIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPartner({ emotionSensitivity: opt.value })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        partner.emotionSensitivity === opt.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="text-sm font-bold text-gray-800">{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 沟通风格 */}
              <div>
                <label className="text-sm text-rose-600 font-medium mb-1.5 block">沟通风格</label>
                <div className="grid grid-cols-3 gap-2">
                  {COMMUNICATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPartner({ communicationStyle: opt.value })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        partner.communicationStyle === opt.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-gray-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{opt.emoji}</div>
                      <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自由描述 */}
              <div>
                <label className="text-sm text-rose-600 font-medium mb-1.5 block">还有什么补充？<span className="text-gray-300 font-normal ml-1">可选</span></label>
                <textarea
                  value={partner.extraDescription}
                  onChange={(e) => setPartner({ extraDescription: e.target.value })}
                  placeholder="比如：容易玻璃心、说话毒舌但其实很在乎、有点自我……"
                  rows={2}
                  className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-3 rounded-xl bg-rose-400 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors"
              >
                下一步：选择场景 →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="text-rose-300 hover:text-rose-500 transition-colors">
                  ←
                </button>
                <h2 className="text-lg font-semibold text-rose-800">选择场景</h2>
              </div>

              <div className="space-y-2">
                {PRESET_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => { setSelectedScene(scene.id); setIsCustom(false) }}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedScene === scene.id && !isCustom
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-100 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{scene.emoji}</span>
                      <span className="text-sm font-medium text-gray-800">{scene.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{scene.description}</p>
                  </button>
                ))}

                {/* 自定义 */}
                <div
                  onClick={() => { setIsCustom(true); setSelectedScene('') }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isCustom ? 'border-rose-400 bg-rose-50' : 'border-gray-100 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">✏️</span>
                    <span className="text-sm font-medium text-gray-800">自定义场景</span>
                  </div>
                  {isCustom && (
                    <textarea
                      value={customScene}
                      onChange={(e) => setCustomScene(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="描述当前的背景情况，比如：我们刚吵了一架，因为……"
                      rows={3}
                      className="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-400 resize-none bg-white"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!canProceedStep2}
                className="w-full py-3 rounded-xl bg-rose-400 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors"
              >
                开始模拟 💬
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-rose-300 mt-4">所有对话仅用于模拟练习，不会被保存或分享</p>
      </div>
    </div>
  )
}
