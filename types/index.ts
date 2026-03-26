// 依恋类型
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized'

// 情绪敏感度
export type EmotionSensitivity = 'low' | 'medium' | 'high'

// 沟通风格
export type CommunicationStyle = 'direct' | 'indirect' | 'silent'

// 关系温度等级
export type TemperatureLevel = 'frozen' | 'tense' | 'warming' | 'intimate'

// 消息评分
export type MessageScore = 'positive' | 'neutral' | 'negative'

// 另一半性格配置
export interface PartnerPersonality {
  name: string
  attachmentStyle: AttachmentStyle
  emotionSensitivity: EmotionSensitivity
  communicationStyle: CommunicationStyle
  extraDescription: string
}

// 预设场景
export interface PresetScene {
  id: string
  emoji: string
  title: string
  description: string
}

// 场景配置
export interface SceneConfig {
  type: 'preset' | 'custom'
  presetId?: string
  customDescription?: string
  description: string
}

// AI 回复结构
export interface AIResponse {
  message: string
  emotionState: string
  temperatureDelta: number
  redFlags: string[]
  quickOptions: string[]
}

// 聊天消息
export interface ChatMessage {
  id: string
  role: 'user' | 'partner'
  content: string
  timestamp: number
  emotionState?: string
  temperatureDelta?: number
  redFlags?: string[]
  quickOptions?: string[]
  score?: MessageScore
}

// 对话走向
export type ConversationTrend = 'reconciling' | 'deepening-conflict' | 'neutral' | 'breakthrough'

// 结局类型
export type EndingType = 'deep-cold-war' | 'suppressed' | 'initial-reconciliation' | 'true-understanding'

// 复盘报告
export interface ReviewReport {
  ending: EndingType
  communicationStyleSummary: string
  suggestions: string[]
  messages: ChatMessage[]
  finalTemperature: number
}

// 全局应用状态
export interface SimState {
  // 设置
  partner: PartnerPersonality
  scene: SceneConfig | null
  isSetupComplete: boolean

  // 对话
  messages: ChatMessage[]
  temperature: number
  conversationTrend: ConversationTrend
  currentRedFlags: string[]
  currentQuickOptions: string[]
  isLoading: boolean

  // 复盘
  reviewReport: ReviewReport | null
  isEnded: boolean
}
