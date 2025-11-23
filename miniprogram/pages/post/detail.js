// pages/post/detail.js
const app = getApp()

Page({
  data: {
    id: null,
    post: null,
    commentContent: '',
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadPost(options.id)
    }
  },

  loadPost(id) {
    app.request(`/api/post/${id}`, 'GET')
      .then(res => {
        this.setData({ post: res.data, loading: false })
      })
      .catch(() => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  // 预览大图
  onPreviewImage(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.post.images.map(img => 'http://127.0.0.1:8080' + img)
    })
  },

  // 发送评论
  onSubmitComment() {
    if (!this.data.commentContent.trim()) return

    wx.showLoading({ title: '发送中' })
    app.request('/api/post/comment', 'POST', {
      postId: this.data.id,
      content: this.data.commentContent
    }).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '评论成功', icon: 'success' })
      this.setData({ commentContent: '' })
      this.loadPost(this.data.id) // 刷新评论列表
    })
  }
})


