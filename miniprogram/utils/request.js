/**
 * 网络请求封装
 * - 统一 baseUrl 管理
 * - 自动注入 Authorization token
 * - 统一错误处理
 * - Token 过期自动刷新
 */

const BASE_URL = 'http://localhost:3000/api' // 开发环境

/**
 * 通用请求方法
 * - 自动等待登录完成后再发送请求
 * - 自动注入 Authorization token
 * - 统一错误处理 + Token 过期自动刷新
 *
 * @param {string} url - 接口路径（不含 baseUrl）
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {object} options - 额外配置 { showLoading, header }
 * @returns {Promise}
 */
function request(url, method = 'GET', data = {}, options = {}) {
  return new Promise(async (resolve, reject) => {
    const app = getApp()

    // 等待 App 登录完成（避免竞态条件）
    if (app && app.globalData && app.globalData.loginReady) {
      try { await app.globalData.loginReady } catch (e) {}
    }

    const token = (app && app.globalData && app.globalData.token) || wx.getStorageSync('token')

    if (options.showLoading !== false) {
      wx.showLoading({ title: '加载中...', mask: true })
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        if (options.showLoading !== false) {
          wx.hideLoading()
        }

        const { statusCode, data: resData } = res

        if (statusCode === 200) {
          if (resData.code === 0) {
            resolve(resData)
          } else if (resData.code === 401) {
            handleTokenExpired()
            reject(new Error('登录已过期，请重新登录'))
          } else {
            const errMsg = resData.message || '请求失败'
            wx.showToast({ title: errMsg, icon: 'none', duration: 2000 })
            reject(new Error(errMsg))
          }
        } else {
          const errMsg = `服务器错误 (${statusCode})`
          wx.showToast({ title: errMsg, icon: 'none', duration: 2000 })
          reject(new Error(errMsg))
        }
      },
      fail(err) {
        if (options.showLoading !== false) {
          wx.hideLoading()
        }
        wx.showToast({ title: '网络连接失败', icon: 'none', duration: 2000 })
        reject(err)
      }
    })
  })
}

/**
 * Token 过期处理
 */
function handleTokenExpired() {
  wx.removeStorageSync('token')
  wx.removeStorageSync('tokenExpireTime')
  wx.removeStorageSync('userInfo')
  const app = getApp()
  if (app && app.globalData) {
    app.globalData.token = ''
    app.globalData.userInfo = null
    app.globalData.babyInfo = null
    app.login()
  }
}

// 快捷方法
const http = {
  get: (url, data, options) => request(url, 'GET', data, options),
  post: (url, data, options) => request(url, 'POST', data, options),
  put: (url, data, options) => request(url, 'PUT', data, options),
  delete: (url, data, options) => request(url, 'DELETE', data, options)
}

module.exports = http
