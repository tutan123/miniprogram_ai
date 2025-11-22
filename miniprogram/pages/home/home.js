// pages/home/home.js
const app = getApp()
const FLASK_SERVER_URL = 'http://127.0.0.1:5000'; 

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

  callApi(url, method, data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${FLASK_SERVER_URL}${url}`,
        method: method,
        data: { ...data, openid: 'test_openid_123' },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) resolve(res.data);
          else reject(res.data);
        },
        fail: (err) => {
          console.error(err);
          // 失败时不拒绝，给个 Mock 数据防止地图白屏，提升体验
          if(url.includes('routes')) {
             resolve({
               data: {
                 "food": {"name": "示例路线(离线)", "points": [{"lat": 30.57, "lng": 104.06, "name": "示例点"}]}
               }
             })
          } else {
            reject(err);
          }
        }
      });
    });
  },

  fetchRoutes() {
    this.callApi('/api/routes', 'GET')
      .then(res => {
        const routes = res.data; 
        this.setData({ routes })
        // 处理 markers ... (省略重复逻辑，保持简洁)
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
                    height: 30
                })
            }
            })
        }
        this.setData({ markers })
      })
  },

  onLocateMe() {
     wx.getLocation({
       type: 'gcj02',
       success: (res) => {
         this.setData({ latitude: res.latitude, longitude: res.longitude })
       }
     })
  },

  onSelectRoute() {
    wx.showActionSheet({
      itemList: ['美食路线', '购物路线', '踏青路线'],
      success: (res) => {
        const keys = ['food', 'shopping', 'nature'];
        this.confirmRoute(keys[res.tapIndex]);
      }
    })
  },
  
  confirmRoute(key) {
      // 简单演示导航
      const route = this.data.routes[key];
      if(route && route.points[0]) {
          const pt = route.points[0];
          wx.openLocation({ latitude: pt.lat, longitude: pt.lng, name: pt.name });
      }
  }
})
