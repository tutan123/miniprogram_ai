// pages/community/community.js
const app = getApp()

Page({
  data: {
    posts: [],
    isRefreshing: false,
    showCreateModal: false,
    newTitle: '',
    newContent: ''
  },

  onShow() {
    this.loadPosts()
  },

  onRefresh() {
    this.setData({ isRefreshing: true })
    this.loadPosts().then(() => {
      this.setData({ isRefreshing: false })
    })
  },

  loadPosts() {
    // 使用真实的后端 API (Next.js)
    return app.request('/api/posts', 'GET')
      .then(res => {
        this.setData({ posts: res.data })
      })
      .catch(err => {
        console.error(err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  onSubmitPost() {
    if (!this.data.newTitle || !this.data.newContent) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发布中' })

    app.request('/api/post', 'POST', {
      title: this.data.newTitle,
      content: this.data.newContent,
      images: [] // 暂不支持图片上传，传空数组
    }).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      this.setData({ 
        showCreateModal: false, 
        newTitle: '', 
        newContent: '' 
      })
      this.loadPosts()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  onLikePost(e) {
    // 仅做前端效果演示，后端暂未实现 Like 接口
    const postId = e.currentTarget.dataset.id
    const posts = this.data.posts.map(p => {
      if (p.id === postId) p.likes++
      return p
    })
    this.setData({ posts })
  },

  // --- 弹窗控制 ---
  onShowCreateModal() { this.setData({ showCreateModal: true }) },
  onCloseCreateModal() { this.setData({ showCreateModal: false }) },
  stopProp() {} 
})
