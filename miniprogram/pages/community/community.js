// pages/community/community.js
const app = getApp()
const FLASK_SERVER_URL = 'http://127.0.0.1:8080';

Page({
  data: {
    posts: [],
    isRefreshing: false,
    showCreateModal: false,
    newTitle: '',
    newContent: '',
    tempImage: ''
  },

  // ... (其他方法保持不变，只修改图片选择和发布逻辑) ...

  onShow() {
    this.loadPosts()
  },

  onTapPost(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/post/detail?id=${id}` })
  },

  onTapComment(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/post/detail?id=${id}&focus=true` })
  },

  onRefresh() {
    this.setData({ isRefreshing: true })
    this.loadPosts().then(() => {
      this.setData({ isRefreshing: false })
    })
  },

  loadPosts() {
    return app.request('/api/posts', 'GET')
      .then(res => {
        if (res.code === 0) {
          this.setData({ posts: res.data })
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      })
      .catch(err => {
        console.error(err)
      })
  },

  // 修改：限制只能选 1 张图
  onChooseImage() {
    wx.chooseImage({
      count: 1, // 限制 1 张
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
    
    // 前端校验字数
    if (this.data.newContent.length > 500) {
      wx.showToast({ title: '内容不能超过500字', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发布中' })

    if (this.data.tempImage) {
      wx.uploadFile({
        url: `${FLASK_SERVER_URL}/api/upload`,
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
      if (res.code === 0) {
        wx.showToast({ title: '发布成功', icon: 'success' })
        this.setData({ 
          showCreateModal: false, 
          newTitle: '', 
          newContent: '',
          tempImage: '' 
        })
        this.loadPosts()
      } else {
        wx.showToast({ title: res.msg || '发布失败', icon: 'none' })
      }
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  onLikePost(e) {
    const postId = e.currentTarget.dataset.id
    const index = this.data.posts.findIndex(p => p.id === postId)
    if (index === -1) return
    
    const post = this.data.posts[index]
    const isLiked = !post.is_liked
    const newLikes = isLiked ? post.likes + 1 : post.likes - 1
    
    this.setData({
      [`posts[${index}].is_liked`]: isLiked,
      [`posts[${index}].likes`]: newLikes
    })

    app.request('/api/post/like', 'POST', { postId })
  },

  onShowCreateModal() { this.setData({ showCreateModal: true }) },
  onCloseCreateModal() { this.setData({ showCreateModal: false }) },
  stopProp() {} 
})
