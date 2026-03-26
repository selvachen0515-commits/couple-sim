'use client'

import { motion } from 'framer-motion'
import { useSimStore } from '@/store/useSimStore'
import type { AttachmentStyle, EmotionSensitivity, CommunicationStyle } from '@/types'

const attachmentOptions: { value: AttachmentStyle; label: string; emoji: string; desc: string }[] = [
  {
    value: 'secure',
    label: '安全型',
    emoji: '😊',
    desc: '情感稳定，信任对方，能良性沟通',
  },
  {
    value: 'anxious',
    label: '焦虑型',
    emoji: '😰',
    desc: '非常在意回应，害怕被忽视，需要确认感',
  },
  {
    value: 'avoidant',
    label: '回避型',
    emoji: '😶',
    desc: '不擅长表达，遇到冲突倾向于退缩',
  },
  {
    value: 'disorganized',
    label: '混乱型',
    emoji: '😵',
    desc: '既渴望亲密又害怕亲密，情绪不稳定',
  },
]

const communicationOptions: { value: CommunicationStyle; label: string; emoji: string; desc: string }[] = [
  {
    value: 'direct',
    label: '直给型',
    emoji: '💬',
    desc: '说话直接，有什么说什么',
  },
  {
    value: 'indirect',
    label: '迂回型',
    emoji: '🌀',
    desc: '表达委婉，需要对方主动理解',
  },
  {
    value: 'silent',
    label: '沉默型',
    emoji: '🤐',
    desc: '遇事喜欢沉默，不擅长主动开口',
  },
]

export default function PersonalitySetup() {
  const { partner, setPartner } = useSimStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 名字 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          另一半的名字
        </label>
        <input
          type="text"
          value={partner.name}
          onChange={(e) => setPartner({ name: e.target.value })}
          placeholder="起个名字吧..."
          maxLength={10}
          className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
        />
      </div>

      {/* 依恋类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-3">
          依恋类型 <span className="text-xs text-gray-400 font-normal">· 影响对方对安全感的需求</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {attachmentOptions.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPartner({ attachmentStyle: opt.value })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                partner.attachmentStyle === opt.value
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-gray-100 bg-white hover:border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{opt.emoji}</span>
                <span className="font-medium text-gray-800 text-sm">{opt.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 情绪敏感度 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-3">
          情绪敏感度 <span className="text-xs text-gray-400 font-normal">· 对言语刺激的反应强度</span>
        </label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as EmotionSensitivity[]).map((level) => {
            const labels = { low: '低', medium: '中', high: '高' }
            const colors = {
              low: 'bg-blue-100 border-blue-300 text-blue-700',
              medium: 'bg-amber-100 border-amber-300 text-amber-700',
              high: 'bg-rose-100 border-rose-300 text-rose-700',
            }
            const selectedColors = {
              low: 'bg-blue-500 border-blue-500 text-white',
              medium: 'bg-amber-500 border-amber-500 text-white',
              high: 'bg-rose-500 border-rose-500 text-white',
            }
            return (
              <motion.button
                key={level}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPartner({ emotionSensitivity: level })}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  partner.emotionSensitivity === level
                    ? selectedColors[level]
                    : `${colors[level]} hover:opacity-80`
                }`}
              >
                {labels[level]}
              </motion.button>
            )
          })}
        </div>
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-gray-400">理性冷静</span>
          <span className="text-xs text-gray-400">极度敏感</span>
        </div>
      </div>

      {/* 沟通风格 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-3">
          沟通风格 <span className="text-xs text-gray-400 font-normal">· 对方表达想法的方式</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {communicationOptions.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPartner({ communicationStyle: opt.value })}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                partner.communicationStyle === opt.value
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-gray-100 bg-white hover:border-rose-200'
              }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              <div className="font-medium text-gray-800 text-xs">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 自由描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          其他性格特点 <span className="text-xs text-gray-400 font-normal">· 选填</span>
        </label>
        <textarea
          value={partner.extraDescription}
          onChange={(e) => setPartner({ extraDescription: e.target.value })}
          placeholder="还有什么想补充的？比如：容易记仇、但很快会忘、脾气上来了会说狠话..."
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm resize-none transition-all"
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {partner.extraDescription.length}/200
        </div>
      </div>
    </motion.div>
  )
}
