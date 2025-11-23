// pages/home/home.js
const app = getApp()

Page({
  data: {
    latitude: 22.5200,  // 南山区中心坐标
    longitude: 113.9300,
    markers: [],  // 兴趣点标记
    routes: null,  // 路线数据
    polylines: [],  // 路线折线
    selectedRoute: null,  // 当前选中的路线
    selectedPOI: null,  // 当前选中的兴趣点
    showPOIDetail: false  // 是否显示兴趣点详情
  },

  onLoad: function (options) {
    this.fetchRoutes()
    this.fetchPOIs()
    // 尝试获取当前位置
    this.onLocateMe()
  },

  // 获取路线数据
  fetchRoutes() {
    app.request('/api/routes', 'GET')
      .then(res => {
        const routes = res.data; 
        this.setData({ routes })
      })
      .catch(err => {
        console.error('路线数据加载失败', err)
      })
  },

  // 获取兴趣点数据
  fetchPOIs() {
    app.request('/api/pois', 'GET')
      .then(res => {
        const pois = res.data || []
        
        // 创建兴趣点标记
        // 注意：微信地图的 marker id 必须是数字，不能是字符串
        const poiMarkers = pois.map((poi, index) => ({
          id: poi.id,  // 使用 POI 的 id 作为 marker id（必须是数字）
          latitude: poi.lat,
          longitude: poi.lng,
          title: poi.name,
          // 移除 iconPath，使用默认标记图标
          width: 30,
          height: 30,
          callout: {
            content: poi.name,
            padding: 10,
            borderRadius: 5,
            display: 'BYCLICK',
            fontSize: 14
          },
          poiData: poi  // 保存完整的 POI 数据（使用 poiData 而不是 customData）
        }))

        // 合并到现有标记中
        this.setData({ 
          markers: poiMarkers
        })
      })
      .catch(err => {
        console.error('兴趣点数据加载失败', err)
        // 如果加载失败，至少显示空数组避免错误
        this.setData({ markers: [] })
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

  // 选择路线
  onSelectRoute() {
    if (!this.data.routes) return;
    
    const keys = Object.keys(this.data.routes);
    const names = keys.map(k => this.data.routes[k].name);

    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const key = keys[res.tapIndex];
        this.showRoute(key);
      }
    })
  },

  // 显示路线在地图上（使用折线）
  showRoute(key) {
    const route = this.data.routes[key];
    if (!route || !route.points || route.points.length === 0) {
      wx.showToast({ title: '路线数据有误', icon: 'none' })
      return
    }

    // 创建折线数据
    const polyline = [{
      points: route.points.map(pt => ({
        latitude: pt.lat,
        longitude: pt.lng
      })),
      color: '#007AFF',  // 路线颜色（蓝色）
      width: 4,  // 路线宽度
      arrowLine: true,  // 显示箭头方向
      borderColor: '#FFFFFF',
      borderWidth: 2
    }]

    // 更新地图中心到路线起点
    const firstPoint = route.points[0]
    
    this.setData({
      polylines: polyline,
      selectedRoute: { key, ...route },
      latitude: firstPoint.lat,
      longitude: firstPoint.lng
    })

    // 显示确认对话框
    wx.showModal({
      title: route.name,
      content: `确定选择${route.name}吗？`,
      confirmText: '确认并导航',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          this.confirmRoute(key)
        } else {
          // 取消选择，清除路线
          this.setData({
            polylines: [],
            selectedRoute: null
          })
        }
      }
    })
  },
  
  // 确认路线并导航到起点
  confirmRoute(key) {
    const route = this.data.routes[key];
    if (route && route.points.length > 0) {
      const pt = route.points[0];
      wx.openLocation({
        latitude: pt.lat,
        longitude: pt.lng,
        name: pt.name,
        scale: 18
      });
    }
  },

  // 地图标记点击事件
  onMarkerTap(e) {
    const markerId = e.detail.markerId
    // markerId 是数字，需要找到对应的 marker
    const markers = this.data.markers
    const marker = markers.find(m => m.id === markerId)
    
    // 如果找到了 marker 并且有 poiData（说明是兴趣点）
    if (marker && marker.poiData) {
      this.showPOIDetail(marker.poiData)
    }
  },

  // 显示兴趣点详情
  showPOIDetail(poi) {
    this.setData({
      selectedPOI: poi,
      showPOIDetail: true
    })
  },

  // 关闭兴趣点详情
  closePOIDetail() {
    this.setData({
      showPOIDetail: false,
      selectedPOI: null
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 导航到兴趣点
  navigateToPOI() {
    const poi = this.data.selectedPOI
    if (poi) {
      wx.openLocation({
        latitude: poi.lat,
        longitude: poi.lng,
        name: poi.name,
        address: poi.address || '',
        scale: 18
      })
    }
  }
})
