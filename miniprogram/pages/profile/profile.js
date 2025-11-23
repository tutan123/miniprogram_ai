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
    // 从全局状态读取用户信息
    this.loadUserInfo()
    this.refreshPoints()
  },

  loadUserInfo() {
    // 从 app.globalData 读取用户信息
    if (app.globalData.userInfo && app.globalData.isLoggedIn) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 如果没有用户信息，检查是否有 openid（说明已静默登录）
      if (app.globalData.openid) {
        // 有 openid 但没有用户信息，提示去登录页面
        this.setData({
          userInfo: null,
          hasUserInfo: false
        })
      } else {
        // 完全没有登录，需要去登录页面
        this.setData({
          userInfo: null,
          hasUserInfo: false
        })
      }
    }
  },

  refreshPoints() {
    app.request('/api/user/info', 'GET')
      .then(res => {
        if(res.data) {
            this.setData({ points: res.data.points })
        }
      })
      .catch(() => {
        // 如果请求失败，可能是未登录，不显示积分
        console.log('获取积分失败，可能未登录')
      })
  },

  // 点击登录按钮，跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
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
