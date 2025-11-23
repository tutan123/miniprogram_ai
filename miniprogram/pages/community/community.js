// pages/community/community.js
const app = getApp()
const BASE_URL = app.globalData.baseUrl;

Page({
  data: {
    posts: [],
    isRefreshing: false,
    showCreateModal: false,
    newTitle: '',
    newContent: '',
    tempImage: '',
    baseUrl: BASE_URL
  },

  onLoad() {
    // 首次加载
    this.loadPosts()
  },

  onShow() {
    // 每次显示页面时，静默刷新（不显示loading，体验更好）
    // 避免 setData 过于频繁导致死循环
    // this.loadPosts() 
  },

  onPullDownRefresh() {
    this.setData({ isRefreshing: true })
    this.loadPosts().then(() => {
      this.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
    })
  },

  onRefresh() {
    this.onPullDownRefresh()
  },

  loadPosts() {
    console.log('[Community] Start loading posts...')
    return app.request('/api/posts', 'GET')
      .then(res => {
        console.log('[Community] Data received:', res)
        if (res.code === 0) {
          this.setData({ posts: res.data })
        } else {
          console.error('[Community] API Error:', res)
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      })
      .catch(err => {
        console.error('[Community] Network Error:', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      })
  },

  // ... (其他方法保持不变，上传逻辑已修复过) ...
  onTapPost(e) {
    const id = e.currentTarget.dataset.id
    console.log('[Community] Tap post:', id)
    wx.navigateTo({ url: `/pages/post/detail?id=${id}` })
  },

  // ... (其他方法省略)
  
  onChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ tempImage: res.tempFilePaths[0] })
      }
    })
  },

  onSubmitPost() {
    if (!this.data.newTitle || !this.data.newContent) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发布中' })

    if (this.data.tempImage) {
      wx.uploadFile({
        url: `${BASE_URL}/api/upload`,
        filePath: this.data.tempImage,
        name: 'file',
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            this.doCreatePost([data.data.url])
          } else {
            wx.hideLoading()
            wx.showToast({ title: '图片上传失败', icon: 'none' })
          }
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '网络错误', icon: 'none' })
        }
      })
    } else {
      this.doCreatePost([])
    }
  },

  doCreatePost(images) {
    app.request('/api/post', 'POST', {
      title: this.data.newTitle,
      content: this.data.newContent,
      images: images
    }).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      this.setData({ showCreateModal: false, newTitle: '', newContent: '', tempImage: '' })
      this.loadPosts()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  onLikePost(e) {
    const postId = e.currentTarget.dataset.id
    app.request('/api/post/like', 'POST', { postId }).then(() => {
        // 简单处理：操作后刷新列表
        this.loadPosts()
    })
  },

  onShowCreateModal() { this.setData({ showCreateModal: true }) },
  onCloseCreateModal() { this.setData({ showCreateModal: false }) },
  stopProp() {} 
})
