const express = require('express')
const router = express.Router()
const prisma = require('../config/database')
const OpenAI = require('openai')

/**
 * 初始化 DeepSeek 客户端（OpenAI 兼容接口）
 */
function getDeepSeek() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
  })
}

/**
 * 构建系统提示词（结合宝宝信息 + 月龄知识上下文）
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

  // 加入宝宝信息
  try {
    const baby = await prisma.baby.findFirst({
      where: { id: babyId, userId }
    })
    if (baby) {
      const now = new Date()
      const birth = new Date(baby.birthday)
      const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

      const feedingMap = { breast: '母乳喂养', formula: '配方奶喂养', mixed: '混合喂养' }
      const genderText = baby.gender === 'male' ? '男宝宝' : '女宝宝'

      prompt += `\n当前宝宝信息：
- 昵称：${baby.nickname}
- 性别：${genderText}
- 月龄：${ageMonths}个月
- 喂养方式：${feedingMap[baby.feedingType] || '未知'}
`

      // 查询当前月龄的知识摘要作为上下文
      const knowledge = await prisma.knowledgeBase.findMany({
        where: { month: Math.min(ageMonths, 12) },
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
 * POST /send - 发送消息获取 AI 回复
 * Body: { conversationId?, message }
 * 支持两种模式：
 * - stream=true: SSE 流式响应
 * - stream=false: 等待完整响应后返回 JSON
 */
router.post('/send', async (req, res, next) => {
  try {
    const { conversationId, message, stream = false } = req.body
    const userId = req.user.userId

    if (!message || !message.trim()) {
      return res.json({ code: 400, message: '消息不能为空' })
    }

    // 检查 API Key
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'sk-xxxxxxxxxxxx') {
      return res.json({
        code: -1,
        message: 'AI 服务未配置，请在 .env 中设置 DEEPSEEK_API_KEY'
      })
    }

    // 获取或创建会话
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: parseInt(conversationId), userId }
      })
    }

    // 获取宝宝信息
    const baby = await prisma.baby.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    const babyId = baby ? baby.id : null

    if (!conversation) {
      // 自动创建新会话，标题取消息前 20 字
      conversation = await prisma.conversation.create({
        data: {
          userId,
          babyId: babyId || 0,
          title: message.slice(0, 20) + (message.length > 20 ? '...' : '')
        }
      })
    }

    // 保存用户消息
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim()
      }
    })

    // 构建历史消息（最近 10 条）
    const historyMessages = await prisma.conversationMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    // 构建系统提示词
    const systemPrompt = await buildSystemPrompt(userId, babyId)

    // 构建 OpenAI 格式消息
    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ]

    const deepseek = getDeepSeek()

    if (stream) {
      // ====== SSE 流式响应 ======
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('X-Accel-Buffering', 'no') // Nginx 不缓冲

      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        stream: true
      })

      let fullContent = ''

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || ''
        if (delta) {
          fullContent += delta
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`)
        }
      }

      // 保存 AI 回复
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: fullContent
        }
      })

      // 更新会话时间
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      })

      res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`)
      res.end()
    } else {
      // ====== 非流式响应 ======
      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      })

      const reply = completion.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'

      // 保存 AI 回复
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: reply,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      })

      // 更新会话时间
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      })

      res.json({
        code: 0,
        message: 'ok',
        data: {
          conversationId: conversation.id,
          reply,
          tokensUsed: completion.usage?.total_tokens || 0
        }
      })
    }
  } catch (err) {
    // 非流式模式直接抛错
    if (!res.headersSent) {
      next(err)
    } else {
      console.error('AI 对话错误:', err.message)
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
})

/**
 * POST /new - 创建新会话
 */
router.post('/new', async (req, res, next) => {
  try {
    const baby = await prisma.baby.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    })

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.userId,
        babyId: baby ? baby.id : 0,
        title: req.body.title || '新对话'
      }
    })

    res.json({ code: 0, message: 'ok', data: conversation })
  } catch (err) {
    next(err)
  }
})

// GET /conversations - 对话列表
router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      code: 0,
      message: 'ok',
      data: conversations.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }))
    })
  } catch (err) {
    next(err)
  }
})

// GET /conversations/:id - 对话详情（含消息列表）
router.get('/conversations/:id', async (req, res, next) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, role: true, content: true, createdAt: true }
        }
      }
    })

    if (!conversation) {
      return res.json({ code: 404, message: '对话不存在' })
    }

    res.json({
      code: 0,
      message: 'ok',
      data: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString()
        }))
      }
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /conversations/:id - 删除对话
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    await prisma.conversation.delete({
      where: { id: parseInt(req.params.id), userId: req.user.userId }
    })
    res.json({ code: 0, message: 'ok' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
