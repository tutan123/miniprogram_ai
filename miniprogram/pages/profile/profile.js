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

  // 路由跳转方法 (增加 log 方便调试)
  onViewOrders() { 
    console.log('Nav to Orders');
    wx.navigateTo({ url: '/pages/orders/orders' }) 
  },
  
  onEditAddress() { 
    console.log('Nav to Address');
    wx.navigateTo({ url: '/pages/address/address' }) 
  },

  onViewRecords() { 
    console.log('Nav to Records');
    wx.navigateTo({ url: '/pages/records/records' }) 
  },

  onContact() { 
    wx.navigateTo({ url: '/pages/complaint/complaint' }) 
  },
  
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'WeChat Map App v2.0',
      showCancel: false
    })
  }
})
