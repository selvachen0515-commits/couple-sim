'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSimStore } from '@/store/useSimStore'
import type { PresetScene } from '@/types'

const presetScenes: PresetScene[] = [
  {
    id: 'slow-reply',
    emoji: '💬',
    title: '回消息太慢',
    description:
      '你最近回消息总是很慢，有时候几个小时才回。对方今天又等了你很久，终于忍不住发消息质问你是不是不在乎 ta 了。现在轮到你回应。',
  },
  {
    id: 'forgot-anniversary',
    emoji: '🎂',
    title: '忘了纪念日',
    description:
      '今天是你们在一起的一周年纪念日，但你完全忘了。对方已经精心准备了礼物和晚餐，等了你很久，你才想起来。对方沉默地看着你，等你解释。',
  },
  {
    id: 'cold-war',
    emoji: '😶',
    title: '冷战中对方不开口',
    description:
      '你们前天因为一件小事吵架了，从那之后对方就一直不说话。你知道错了想和解，但对方一直沉默，偶尔只回"哦""嗯"。你决定主动开口。',
  },
  {
    id: 'too-busy',
    emoji: '😤',
    title: '因为工作太忙被抱怨',
    description:
      '最近你工作压力很大，经常加班到很晚，周末也在处理工作。对方说感觉自己越来越不重要了，说你把工作看得比 ta 重要。你们的矛盾在积累中。',
  },
  {
    id: 'midnight-breakdown',
    emoji: '🌙',
    title: '深夜情绪崩溃',
    description:
      '凌晨 1 点，对方突然发来一大堆消息说很累，说不知道还有没有意义，说觉得很孤独。你刚睡醒看到，不知道发生了什么，对方情绪很不稳定。',
  },
]

export default function SceneSelector() {
  const { scene, setScene } = useSimStore()
  const [isCustom, setIsCustom] = useState(scene?.type === 'custom')
  const [customText, setCustomText] = useState(scene?.customDescription || '')

  const handlePresetSelect = (preset: PresetScene) => {
    setIsCustom(false)
    setScene({
      type: 'preset',
      presetId: preset.id,
      description: preset.description,
    })
  }

  const handleCustomChange = (text: string) => {
    setCustomText(text)
    if (text.trim()) {
      setScene({
        type: 'custom',
        customDescription: text,
        description: text,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-3"
    >
      {/* 预设场景 */}
      <div className="grid gap-2">
        {presetScenes.map((preset, index) => (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePresetSelect(preset)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              scene?.presetId === preset.id && !isCustom
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm">{preset.title}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {preset.description}
                </div>
              </div>
              {scene?.presetId === preset.id && !isCustom && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 自定义场景 */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`rounded-xl border-2 transition-all overflow-hidden ${
          isCustom ? 'border-rose-400' : 'border-dashed border-gray-200'
        }`}
      >
        <button
          onClick={() => {
            setIsCustom(true)
            if (customText.trim()) {
              setScene({
                type: 'custom',
                customDescription: customText,
                description: customText,
              })
            }
          }}
          className="w-full p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <div className="font-medium text-gray-700 text-sm">自定义场景</div>
              <div className="text-xs text-gray-400">描述你想模拟的具体情境</div>
            </div>
          </div>
        </button>

        {isCustom && (
          <div className="px-4 pb-4">
            <textarea
              value={customText}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="描述当前的场景背景，比如发生了什么事、对方的心情状态、你们目前的关系状况..."
              rows={4}
              maxLength={500}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm text-gray-800 placeholder-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">{customText.length}/500</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
