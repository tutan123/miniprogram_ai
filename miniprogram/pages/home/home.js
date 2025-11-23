// pages/home/home.js
const app = getApp()

Page({
  data: {
    latitude: 30.572269,
    longitude: 104.066541,
    markers: [],
    routes: null
  },

  onLoad: function (options) {
    this.fetchRoutes()
  },

  fetchRoutes() {
    // [FIX] 改用 app.request，不再硬编码 URL
    app.request('/api/routes', 'GET')
      .then(res => {
        const routes = res.data; 
        this.setData({ routes })
        
        const markers = []
        if(routes) {
            Object.keys(routes).forEach((key, index) => {
            const route = routes[key]
            if(route.points && route.points.length > 0) {
                const startPoint = route.points[0]
                markers.push({
                    id: index,
                    latitude: startPoint.lat,
                    longitude: startPoint.lng,
                    title: route.name,
                    width: 30,
                    height: 30,
                    callout: {
                      content: route.name,
                      padding: 10,
                      borderRadius: 5,
                      display: 'ALWAYS'
                    }
                })
            }
            })
        }
        this.setData({ markers })
      })
      .catch(err => {
        console.error('地图数据加载失败', err)
        // 失败时给个默认坐标防止白屏
        this.onLocateMe()
      })
  },

  onLocateMe() {
     wx.getLocation({
       type: 'gcj02',
       success: (res) => {
         this.setData({
           latitude: res.latitude,
           longitude: res.longitude
         })
       }
     })
  },

  onSelectRoute() {
    if (!this.data.routes) return;
    
    const keys = Object.keys(this.data.routes);
    const names = keys.map(k => this.data.routes[k].name);

    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const key = keys[res.tapIndex];
        this.confirmRoute(key);
      }
    })
  },
  
  confirmRoute(key) {
      const route = this.data.routes[key];
      if(route && route.points.length > 0) {
          const pt = route.points[0];
          wx.openLocation({
             latitude: pt.lat,
             longitude: pt.lng,
             name: pt.name,
             scale: 18
          });
      }
  }
})
