// pages/checkin/checkin.js
const app = getApp()
const BASE_URL = app.globalData.baseUrl || '';

Page({
  data: {
    currentTab: 'tasks',
    points: 0,
    tasks: [],
    products: [],
    baseUrl: BASE_URL
  },

  onShow() {
    this.refreshData()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  refreshData() {
    wx.showLoading({ title: '加载中...' })
    
    const p1 = app.request('/api/user/info', 'GET').catch(e => ({data: {points: 0}}));
    const p2 = app.request('/api/tasks', 'GET').catch(e => ({data: []}));
    const p3 = app.request('/api/products', 'GET').catch(e => ({data: []}));

    Promise.all([p1, p2, p3])
      .then(([resUser, resTasks, resProducts]) => {
        this.setData({
          points: resUser.data ? resUser.data.points : 0,
          tasks: resTasks.data || [],
          products: resProducts.data || []
        })
        wx.hideLoading()
      })
      .catch(() => wx.hideLoading())
  },

  onCompleteTask(e) {
    const taskId = e.currentTarget.dataset.id
    
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res) => {
        const { latitude, longitude } = res;
        this.doCheckin(taskId, latitude, longitude);
      },
      fail: (err) => {
        console.error(err);
        wx.showModal({
            title: '定位失败',
            content: '打卡需要获取您的地理位置，请前往设置开启权限',
            confirmText: '去设置',
            success: (res) => {
                if (res.confirm) wx.openSetting()
            }
        })
      }
    })
  },

  doCheckin(taskId, lat, lng) {
    wx.showLoading({ title: '打卡验证中...' })
    app.request('/api/task/complete', 'POST', { 
        taskId: taskId,
        lat: lat,
        lng: lng
    }).then(res => {
        wx.hideLoading()
        if(res.code === 0) {
            wx.showToast({ title: res.msg || '打卡成功', icon: 'success' })
            this.setData({ points: res.data.current_points })
            this.refreshData() 
        } else {
            wx.showModal({ title: '提示', content: res.msg || '打卡失败', showCancel: false })
        }
    }).catch(res => {
        wx.hideLoading()
        wx.showToast({ title: res.msg || '打卡失败', icon: 'none' })
    })
  },

  onExchangeProduct(e) {
    const productId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认兑换',
      content: '确定消耗积分兑换吗？',
      success: (res) => {
        if (res.confirm) {
            app.request('/api/shop/exchange', 'POST', { productId: productId })
              .then(resp => {
                if (resp.code === 0) {
                    wx.showToast({ title: '兑换成功', icon: 'success' })
                    this.setData({ points: resp.data.current_points })
                    this.refreshData()
                } else {
                    if(resp.msg && resp.msg.includes('地址')) {
                        wx.showModal({
                            title: '提示',
                            content: '请先完善收货地址',
                            confirmText: '去设置',
                            success: (r) => { if(r.confirm) wx.navigateTo({ url: '/pages/address/address' }) }
                        })
                    } else {
                        wx.showToast({ title: resp.msg || '兑换失败', icon: 'none' })
                    }
                }
              })
              .catch(res => {
                 if(res && res.msg) wx.showToast({ title: res.msg, icon: 'none' })
              })
        }
      }
    })
  }
})
