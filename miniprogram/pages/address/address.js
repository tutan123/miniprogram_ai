// pages/address/address.js
const app = getApp()

Page({
  data: {
    realName: '',
    phone: '',
    address: ''
  },

  onLoad() {
    // 加载已有地址
    app.request('/api/user/address', 'GET').then(res => {
      if(res.data) {
        this.setData({
          realName: res.data.realName || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        })
      }
    })
  },

  onSave() {
    if(!this.data.realName || !this.data.phone || !this.data.address) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    
    app.request('/api/user/address', 'POST', this.data).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    })
  }
})

