// pages/records/records.js
const app = getApp()

Page({
  data: {
    records: []
  },

  onLoad() {
    this.loadRecords()
  },

  loadRecords() {
    wx.showLoading({ title: '加载中' })
    // 这里复用一下 tasks 接口里的逻辑，或者最好后端单独开一个 /api/user/records 接口
    // 为了省事，我们先用一个临时的逻辑，或者在后端加一个接口
    // 既然是 Final Sprint，我们就在 Next.js 加一个标准接口吧
    app.request('/api/user/records', 'GET').then(res => {
      this.setData({ records: res.data })
      wx.hideLoading()
    })
  }
})

