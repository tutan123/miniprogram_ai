// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    points: 0,
    checkinDays: 0,
    joinDays: 1
  },

  onShow() {
    this.refreshPoints()
  },

  refreshPoints() {
    app.request('/api/user/info', 'GET')
      .then(res => {
        if(res.data) {
            this.setData({ points: res.data.points })
        }
      })
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 更新后端用户信息
        app.request('/api/login', 'POST', { 
            code: 'test_code', // 如果处于真实模式，这里 app.js 会处理
            userInfo: res.userInfo 
        })
      }
    })
  },

  onContact() {
    // 跳转到新做的投诉页面
    wx.navigateTo({ url: '/pages/complaint/complaint' })
  },
  
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'WeChat Map App v2.0\nPowered by Next.js Fullstack',
      showCancel: false
    })
  }
})
