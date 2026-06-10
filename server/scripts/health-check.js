/**
 * API 健康检查脚本
 * 用法: node scripts/health-check.js [url]
 * 默认检查 http://localhost:3000/api/health
 */
const http = require('http')

const targetUrl = process.argv[2] || 'http://localhost:3000/api/health'

function check(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const latency = Date.now() - start
        try {
          const json = JSON.parse(data)
          resolve({
            status: res.statusCode,
            latency: `${latency}ms`,
            response: json
          })
        } catch {
          resolve({
            status: res.statusCode,
            latency: `${latency}ms`,
            response: data
          })
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

async function main() {
  console.log(`🔍 检查 API 健康状态: ${targetUrl}\n`)

  try {
    const result = await check(targetUrl)
    console.log(`✅ 状态码: ${result.status}`)
    console.log(`⏱  响应时间: ${result.latency}`)
    console.log(`📦 返回数据:`, JSON.stringify(result.response, null, 2))

    // 检查各接口
    const baseUrl = targetUrl.replace('/api/health', '/api')
    const endpoints = [
      { name: '知识库时间线', url: `${baseUrl}/knowledge/timeline` },
    ]

    console.log('\n📋 接口可达性检查:')
    for (const ep of endpoints) {
      try {
        const r = await check(ep.url)
        console.log(`  ${r.status === 200 ? '✅' : '⚠️ '} ${ep.name}: ${r.status} (${r.latency})`)
      } catch (err) {
        console.log(`  ❌ ${ep.name}: 不可达 (${err.message})`)
      }
    }
  } catch (err) {
    console.error(`❌ 连接失败: ${err.message}`)
    console.log('提示: 请确认服务已启动 (npm run dev)')
    process.exit(1)
  }
}

main()
