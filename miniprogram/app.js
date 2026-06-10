// app.js
App({
  globalData: {
    userInfo: null,
    babyInfo: null,
    token: '',
    baseUrl: 'http://localhost:3000/api', // 开发环境，上线后替换为正式域名
    loginReady: null // Promise，登录完成后 resolve
  },

  onLaunch() {
    // 检查登录态
    this.checkLoginStatus()
  },

  /**
   * 检查登录态是否有效
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const tokenExpireTime = wx.getStorageSync('tokenExpireTime')

    if (token && tokenExpireTime && Date.now() < tokenExpireTime) {
      this.globalData.token = token
      this.globalData.userInfo = wx.getStorageSync('userInfo')
      this.globalData.babyInfo = wx.getStorageSync('babyInfo')
      // 已有有效 token，直接 resolve
      this.globalData.loginReady = Promise.resolve()
    } else {
      // Token 过期或不存在，需要登录
      this.login()
    }
  },

  /**
   * 微信登录
   */
  login() {
    const that = this
    const DEV_MODE = true // 开发模式：设置为 true 使用模拟登录，上线前改为 false

    // 创建登录 Promise，页面可以 await 等待登录完成
    this.globalData.loginReady = new Promise((resolve) => {
      if (DEV_MODE) {
        // 开发模式：直接调用 dev-login，无需微信 code
        const request = require('./utils/request')
        request.post('/auth/dev-login', { openid: 'dev_test_user_001' }, { showLoading: false }).then(result => {
          if (result.code === 0) {
            const { token, expiresIn, user, baby } = result.data
            that.globalData.token = token
            that.globalData.userInfo = user
            that.globalData.babyInfo = baby

            wx.setStorageSync('token', token)
            wx.setStorageSync('tokenExpireTime', Date.now() + expiresIn * 1000)
            wx.setStorageSync('userInfo', user)
            if (baby) {
              wx.setStorageSync('babyInfo', baby)
            }
            console.log('[DEV] 模拟登录成功')
          }
          resolve()
        }).catch(err => {
          console.error('[DEV] 模拟登录失败:', err)
          resolve() // 即使失败也 resolve，避免页面永久等待
        })
        return
      }

      // 正式模式：微信登录
      wx.login({
        success(res) {
          if (res.code) {
            const request = require('./utils/request')
            request.post('/auth/login', { code: res.code }, { showLoading: false }).then(result => {
              if (result.code === 0) {
                const { token, expiresIn, user, baby } = result.data
                that.globalData.token = token
                that.globalData.userInfo = user
                that.globalData.babyInfo = baby

                wx.setStorageSync('token', token)
                wx.setStorageSync('tokenExpireTime', Date.now() + expiresIn * 1000)
                wx.setStorageSync('userInfo', user)
                if (baby) {
                  wx.setStorageSync('babyInfo', baby)
                }

                if (!baby) {
                  wx.navigateTo({ url: '/pages/onboarding/index' })
                }
              }
              resolve()
            }).catch(err => {
              console.error('登录失败:', err)
              resolve()
            })
          } else {
            resolve()
          }
        },
        fail() {
          resolve()
        }
      })
    })
  }
})
