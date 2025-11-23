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
        app.request('/api/login', 'POST', { 
            code: 'test_code', 
            userInfo: res.userInfo 
        })
      }
    })
  },

  onContact() {
    wx.navigateTo({ url: '/pages/complaint/complaint' })
  },
  
  onViewRecords() {
    wx.navigateTo({ url: '/pages/records/records' })
  },
  
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'WeChat Map App v2.0\nPowered by Next.js Fullstack',
      showCancel: false
    })
  }
})
