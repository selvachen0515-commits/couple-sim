'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  PartnerPersonality,
  SceneConfig,
  ChatMessage,
  ConversationTrend,
  ReviewReport,
  AIResponse,
  MessageScore,
} from '@/types'

interface SimStore {
  // 设置状态
  partner: PartnerPersonality
  scene: SceneConfig | null
  isSetupComplete: boolean

  // 对话状态
  messages: ChatMessage[]
  temperature: number
  conversationTrend: ConversationTrend
  currentRedFlags: string[]
  currentQuickOptions: string[]
  isLoading: boolean

  // 复盘状态
  reviewReport: ReviewReport | null
  isEnded: boolean

  // 设置操作
  setPartner: (partner: Partial<PartnerPersonality>) => void
  setScene: (scene: SceneConfig) => void
  startSimulation: () => void
  resetSimulation: () => void

  // 对话操作
  addUserMessage: (content: string) => ChatMessage
  addPartnerMessage: (userMsgId: string, response: AIResponse) => void
  setLoading: (loading: boolean) => void
  endConversation: () => void

  // 工具方法
  getTemperatureLevel: () => 'frozen' | 'tense' | 'warming' | 'intimate'
  getEndingType: () => 'deep-cold-war' | 'suppressed' | 'initial-reconciliation' | 'true-understanding'
}

const defaultPartner: PartnerPersonality = {
  name: '小林',
  attachmentStyle: 'anxious',
  emotionSensitivity: 'medium',
  communicationStyle: 'indirect',
  extraDescription: '',
}

function scoreMessage(delta: number): MessageScore {
  if (delta > 0) return 'positive'
  if (delta < 0) return 'negative'
  return 'neutral'
}

function calcTrend(messages: ChatMessage[]): ConversationTrend {
  const recent = messages.slice(-6)
  const score = recent.reduce((acc, m) => acc + (m.temperatureDelta ?? 0), 0)
  if (score >= 15) return 'reconciling'
  if (score <= -15) return 'deepening-conflict'
  if (score >= 5) return 'breakthrough'
  return 'neutral'
}

export const useSimStore = create<SimStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      partner: defaultPartner,
      scene: null,
      isSetupComplete: false,
      messages: [],
      temperature: 50,
      conversationTrend: 'neutral',
      currentRedFlags: [],
      currentQuickOptions: ['安慰一下对方', '坦诚说明情况', '先道歉再解释'],
      isLoading: false,
      reviewReport: null,
      isEnded: false,

      // 设置操作
      setPartner: (partnerUpdate) =>
        set((state) => ({
          partner: { ...state.partner, ...partnerUpdate },
        })),

      setScene: (scene) => set({ scene }),

      startSimulation: () =>
        set({
          isSetupComplete: true,
          messages: [],
          temperature: 50,
          conversationTrend: 'neutral',
          currentRedFlags: [],
          currentQuickOptions: ['安慰一下对方', '坦诚说明情况', '先道歉再解释'],
          isLoading: false,
          reviewReport: null,
          isEnded: false,
        }),

      resetSimulation: () =>
        set({
          isSetupComplete: false,
          messages: [],
          temperature: 50,
          conversationTrend: 'neutral',
          currentRedFlags: [],
          currentQuickOptions: ['安慰一下对方', '坦诚说明情况', '先道歉再解释'],
          isLoading: false,
          reviewReport: null,
          isEnded: false,
          scene: null,
        }),

      // 添加用户消息
      addUserMessage: (content) => {
        const msg: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        }
        set((state) => ({ messages: [...state.messages, msg] }))
        return msg
      },

      // 添加另一半回复
      addPartnerMessage: (userMsgId, response) => {
        const partnerMsg: ChatMessage = {
          id: `partner-${Date.now()}`,
          role: 'partner',
          content: response.message,
          timestamp: Date.now(),
          emotionState: response.emotionState,
          temperatureDelta: response.temperatureDelta,
          redFlags: response.redFlags,
          quickOptions: response.quickOptions,
        }

        set((state) => {
          // 更新用户消息的 score
          const updatedMessages = state.messages.map((m) =>
            m.id === userMsgId
              ? { ...m, score: scoreMessage(response.temperatureDelta), temperatureDelta: response.temperatureDelta }
              : m
          )

          const newMessages = [...updatedMessages, partnerMsg]
          const newTemp = Math.max(0, Math.min(100, state.temperature + response.temperatureDelta))
          const trend = calcTrend(newMessages)

          return {
            messages: newMessages,
            temperature: newTemp,
            conversationTrend: trend,
            currentRedFlags: response.redFlags,
            currentQuickOptions: response.quickOptions,
          }
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      endConversation: () => {
        const state = get()
        const ending = get().getEndingType()

        // 生成沟通风格总结
        const negCount = state.messages.filter((m) => m.role === 'user' && m.score === 'negative').length
        const posCount = state.messages.filter((m) => m.role === 'user' && m.score === 'positive').length
        const totalUser = state.messages.filter((m) => m.role === 'user').length

        let styleSummary = ''
        if (negCount > posCount) {
          styleSummary = `你在这次对话中倾向于讲道理而非共情，有 ${negCount} 次表达方式让对方感到受伤。对于${
            state.partner.attachmentStyle === 'anxious' ? '焦虑型' : 
            state.partner.attachmentStyle === 'avoidant' ? '回避型' : 
            state.partner.attachmentStyle === 'disorganized' ? '混乱型' : '安全型'
          }伴侣，先被理解比被说服更重要。`
        } else if (posCount > negCount) {
          styleSummary = `你在这次对话中展现了不错的共情能力，有 ${posCount} 次表达方式让对方感到被理解。继续保持这种温柔而真诚的沟通方式。`
        } else {
          styleSummary = `你的沟通方式比较平衡，既有共情的一面，也有些时候表达方式不够温和。整体来看有进步空间。`
        }

        const suggestions = [
          '当对方情绪激动时，先说"我理解你的感受"再解释原因，会比直接讲道理更有效',
          `对于${state.partner.emotionSensitivity === 'high' ? '高敏感' : state.partner.emotionSensitivity === 'medium' ? '中等敏感' : '低敏感'}的伴侣，避免用"随便""没事""你想多了"等词语，这会让对方感到被忽视`,
          '在对话结尾加一句"我很在乎你"或者"我们一起解决这个问题"，能有效降低对方的防御心理',
        ]

        const report: ReviewReport = {
          ending,
          communicationStyleSummary: styleSummary,
          suggestions,
          messages: state.messages,
          finalTemperature: state.temperature,
        }

        set({ reviewReport: report, isEnded: true })
      },

      getTemperatureLevel: () => {
        const temp = get().temperature
        if (temp < 25) return 'frozen'
        if (temp < 50) return 'tense'
        if (temp < 75) return 'warming'
        return 'intimate'
      },

      getEndingType: () => {
        const temp = get().temperature
        if (temp < 25) return 'deep-cold-war'
        if (temp < 50) return 'suppressed'
        if (temp < 75) return 'initial-reconciliation'
        return 'true-understanding'
      },
    }),
    {
      name: 'couple-sim-store',
      partialize: (state) => ({
        partner: state.partner,
        scene: state.scene,
        isSetupComplete: state.isSetupComplete,
        messages: state.messages,
        temperature: state.temperature,
        conversationTrend: state.conversationTrend,
        reviewReport: state.reviewReport,
        isEnded: state.isEnded,
      }),
    }
  )
)
