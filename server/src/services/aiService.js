/**
 * AI 对话服务
 * - DeepSeek 客户端管理（懒加载单例）
 * - 系统提示词动态构建
 * - 对话调用（流式 / 非流式）
 */
const OpenAI = require('openai')
const prisma = require('../config/database')
const { calculateAge, FEEDING_TYPE_MAP, GENDER_MAP } = require('./babyService')

let deepseekClient = null

/**
 * 获取 DeepSeek 客户端实例（懒加载单例）
 * 未配置 API Key 时返回 null
 */
function getDeepSeekClient() {
  if (!deepseekClient) {
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'sk-xxxxxxxxxxxx') {
      return null
    }
    deepseekClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  }
  return deepseekClient
}

/**
 * 检查 AI 服务是否已配置
 */
function isAIConfigured() {
  return !!(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'sk-xxxxxxxxxxxx')
}

/**
 * 构建系统提示词（结合宝宝信息 + 月龄知识上下文）
 * @param {number} userId
 * @param {number|null} babyId
 * @returns {string}
 */
async function buildSystemPrompt(userId, babyId) {
  let prompt = `你是一位专业、温暖的育儿助手"安心育儿"。你的职责是帮助新手爸妈了解0-12月龄婴儿的发育知识，缓解育儿焦虑。

回答规则：
1. 用简洁易懂的语言回答，避免过于专业的医学术语
2. 如果涉及严重健康问题，务必建议就医
3. 回答要有温度，理解父母的焦虑
4. 结合宝宝的实际月龄给出针对性建议
5. 每次回答控制在 200 字以内
`

  try {
    const baby = babyId
      ? await prisma.baby.findFirst({ where: { id: babyId, userId } })
      : await prisma.baby.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })

    if (baby) {
      const age = calculateAge(baby.birthday)
      const genderText = GENDER_MAP[baby.gender] || '宝宝'
      const feedingText = FEEDING_TYPE_MAP[baby.feedingType] || '未知'

      prompt += `\n当前宝宝信息：
- 昵称：${baby.nickname}
- 性别：${genderText}
- 月龄：${age.months}个月
- 喂养方式：${feedingText}
`

      // 查询当前月龄的知识摘要作为上下文
      const knowledge = await prisma.knowledgeBase.findMany({
        where: { month: Math.min(age.months, 12) },
        select: { section: true, summary: true }
      })

      if (knowledge.length > 0) {
        prompt += '\n当前月龄发育参考：\n'
        knowledge.forEach(k => {
          prompt += `- ${k.summary}\n`
        })
      }
    }
  } catch (err) {
    console.log('获取宝宝信息失败:', err.message)
  }

  return prompt
}

/**
 * 非流式对话调用
 * @param {Array} messages - OpenAI 格式消息列表
 * @param {object} options - { maxTokens, temperature }
 * @returns {{ content: string, tokensUsed: number }}
 */
async function chatCompletion(messages, options = {}) {
  const client = getDeepSeekClient()
  if (!client) {
    throw new Error('AI 服务未配置，请在 .env 中设置 DEEPSEEK_API_KEY')
  }

  const { maxTokens = 800, temperature = 0.7 } = options

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: false
  })

  return {
    content: completion.choices[0]?.message?.content || '抱歉，我无法回答这个问题。',
    tokensUsed: completion.usage?.total_tokens || 0
  }
}

/**
 * 流式对话调用（返回 AsyncIterable）
 * @param {Array} messages
 * @param {object} options
 * @returns {AsyncIterable}
 */
async function chatCompletionStream(messages, options = {}) {
  const client = getDeepSeekClient()
  if (!client) {
    throw new Error('AI 服务未配置，请在 .env 中设置 DEEPSEEK_API_KEY')
  }

  const { maxTokens = 800, temperature = 0.7 } = options

  return client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true
  })
}

module.exports = {
  getDeepSeekClient,
  isAIConfigured,
  buildSystemPrompt,
  chatCompletion,
  chatCompletionStream
}
