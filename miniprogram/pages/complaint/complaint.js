// pages/complaint/complaint.js
const app = getApp()

Page({
  data: {
    type: 'complaint', // complaint | suggestion
    content: '',
    contact: ''
  },

  switchType(e) {
    this.setData({ type: e.currentTarget.dataset.type })
  },

  onSubmit() {
    if (!this.data.content) {
      wx.showToast({ title: '请填写内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中' })
    app.request('/api/complaint', 'POST', {
      type: this.data.type,
      content: this.data.content,
      contact: this.data.contact
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  }
})

