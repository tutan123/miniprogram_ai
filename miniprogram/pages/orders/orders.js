// pages/orders/orders.js
const app = getApp()
const BASE_URL = app.globalData.baseUrl;

Page({
  data: {
    orders: [],
    baseUrl: BASE_URL
  },

  onShow() {
    this.loadOrders()
  },

  loadOrders() {
    wx.showLoading({ title: '加载中' })
    app.request('/api/user/orders', 'GET').then(res => {
      this.setData({ orders: res.data })
      wx.hideLoading()
    })
  }
})

