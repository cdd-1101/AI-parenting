// pages/baby/profile.js
const http = require('../../utils/request')
const { calculateAge } = require('../../utils/ageCalculator')

const app = getApp()

const feedingTypeMap = {
  breast: '母乳喂养',
  formula: '配方奶喂养',
  mixed: '混合喂养'
}

Page({
  data: {
    baby: {},
    ageText: '',
    feedingTypeText: '',
    latestGrowth: null,
    isEdit: false
  },

  onLoad(options) {
    if (options.edit === '1') {
      this.setData({ isEdit: true })
    }
    this.loadBabyInfo()
  },

  async loadBabyInfo() {
    let baby = app.globalData.babyInfo || wx.getStorageSync('babyInfo')
    if (!baby) {
      wx.showToast({ title: '宝宝信息不存在', icon: 'none' })
      return
    }

    // 计算年龄
    if (baby.birthday) {
      const age = calculateAge(baby.birthday)
      this.setData({ ageText: age.ageText })
    }

    this.setData({
      baby,
      feedingTypeText: feedingTypeMap[baby.feedingType] || ''
    })

    // 获取最新成长记录
    try {
      const res = await http.get(`/babies/${baby.id}/records`, {
        type: 'growth', page: 1, pageSize: 1
      })
      if (res.code === 0 && res.data.records && res.data.records.length > 0) {
        this.setData({ latestGrowth: res.data.records[0].data })
      }
    } catch (err) {
      console.log('获取成长记录失败:', err)
    }
  },

  // 更换头像
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: async (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '上传中...' })
        try {
          // 上传到 COS
          const uploadRes = await this.uploadImage(tempPath)
          if (uploadRes && uploadRes.url) {
            // 更新宝宝头像
            await http.put(`/babies/${this.data.baby.id}`, {
              avatarUrl: uploadRes.url
            })
            // 更新本地数据
            const baby = { ...this.data.baby, avatarUrl: uploadRes.url }
            this.setData({ baby })
            app.globalData.babyInfo = baby
            wx.setStorageSync('babyInfo', baby)
            wx.showToast({ title: '头像已更新', icon: 'success' })
          }
        } catch (err) {
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }
    })
  },

  // 上传图片辅助方法
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = app.globalData.token || wx.getStorageSync('token')
      wx.uploadFile({
        url: `${getApp().globalData.baseUrl || 'http://localhost:3000/api'}/upload/image`,
        filePath,
        name: 'file',
        header: { 'Authorization': `Bearer ${token}` },
        success(res) {
          wx.hideLoading()
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            resolve(data.data)
          } else {
            reject(new Error('上传失败'))
          }
        },
        fail(err) {
          wx.hideLoading()
          reject(err)
        }
      })
    })
  },

  // 编辑资料（弹出修改表单）
  editProfile() {
    const { baby } = this.data
    wx.showActionSheet({
      itemList: ['修改昵称', '修改喂养方式', '修改血型'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: this.editNickname(); break
          case 1: this.editFeedingType(); break
          case 2: this.editBloodType(); break
        }
      }
    })
  },

  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '输入新昵称',
      success: async (res) => {
        if (res.confirm && res.content) {
          await this.updateBaby({ nickname: res.content })
        }
      }
    })
  },

  editFeedingType() {
    wx.showActionSheet({
      itemList: ['母乳喂养', '配方奶喂养', '混合喂养'],
      success: async (res) => {
        const types = ['breast', 'formula', 'mixed']
        await this.updateBaby({ feedingType: types[res.tapIndex] })
      }
    })
  },

  editBloodType() {
    wx.showActionSheet({
      itemList: ['A型', 'B型', 'AB型', 'O型'],
      success: async (res) => {
        const types = ['A', 'B', 'AB', 'O']
        await this.updateBaby({ bloodType: types[res.tapIndex] })
      }
    })
  },

  async updateBaby(data) {
    try {
      const res = await http.put(`/babies/${this.data.baby.id}`, data)
      if (res.code === 0) {
        const baby = { ...this.data.baby, ...res.data }
        this.setData({
          baby,
          feedingTypeText: feedingTypeMap[baby.feedingType] || ''
        })
        app.globalData.babyInfo = baby
        wx.setStorageSync('babyInfo', baby)
        wx.showToast({ title: '更新成功', icon: 'success' })
      }
    } catch (err) {
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },

  goGrowthRecord() {
    wx.navigateTo({ url: '/pages/baby/growth-record' })
  }
})
