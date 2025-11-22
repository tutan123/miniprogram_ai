// pages/checkin/checkin.js
const app = getApp()

Page({
  data: {
    currentTab: 'tasks',
    points: 0,
    tasks: [],
    products: []
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
    
    // [FIX] 替换旧接口 /api/user/sync -> /api/user/info
    // 并改为 GET 方法
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
        wx.showToast({ title: res.msg || '打卡成功', icon: 'success' })
        this.setData({ points: res.data.current_points })
        this.refreshData() 
    }).catch(res => {
        wx.hideLoading()
        wx.showToast({ title: res.msg || '失败', icon: 'none' })
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
              .then(res => {
                wx.showToast({ title: '兑换成功', icon: 'success' })
                this.setData({ points: res.data.current_points })
              })
              .catch(res => {
                 if(res && res.msg) wx.showToast({ title: res.msg, icon: 'none' })
              })
        }
      }
    })
  }
})
