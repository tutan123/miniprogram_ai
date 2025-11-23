// pages/login/login.js
const app = getApp()

Page({
  data: {
    agreed: false,
    showPrivacy: false
  },

  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  onShowPrivacy() {
    this.setData({ showPrivacy: true })
  },

  onClosePrivacy() {
    this.setData({ showPrivacy: false })
  },

  onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意协议', icon: 'none' })
      // 震动提醒
      wx.vibrateShort()
      return
    }

    // 调用 getUserProfile 进行授权登录
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        wx.showLoading({ title: '登录中' })
        
        // 使用 app.js 里的登录逻辑
        app.request('/api/login', 'POST', { 
            code: 'test_code', // 真实环境 app.js 会自动处理 code
            userInfo: res.userInfo 
        }).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '登录成功', icon: 'success' })
            
            // 登录成功后跳转到首页（地图页）
            setTimeout(() => {
                wx.switchTab({ url: '/pages/home/home' })
            }, 1000)
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({ title: '登录失败', icon: 'none' })
        })
      },
      fail: () => {
        wx.showToast({ title: '您取消了授权', icon: 'none' })
      }
    })
  }
})

