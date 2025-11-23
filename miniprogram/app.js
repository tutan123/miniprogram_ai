// app.js
const API_BASE_URL = 'http://192.168.3.215:8080'; 

App({
  globalData: {
    openid: null,
    userInfo: null,  // 用户信息（头像、昵称）
    isLoggedIn: false,  // 是否已完成完整登录（有openid + 用户信息）
    baseUrl: API_BASE_URL
  },

  onLaunch: function () {
    // 尝试静默登录（只获取 openid）
    this.silentLogin();
  },

  // 静默登录：只获取 openid，不获取用户信息
  silentLogin() {
    return new Promise((resolve, reject) => {
      const isTestMode = false; 

      if (isTestMode) {
        console.log('[Dev] 使用测试账号静默登录...');
        this._doServerLogin('test_code', null, resolve, reject);
        return;
      }

      wx.login({
        success: res => {
          if (res.code) {
            this._doServerLogin(res.code, null, resolve, reject);
          } else {
            reject('wx.login failed');
          }
        },
        fail: (err) => {
          console.error('wx.login fail', err);
          reject(err);
        }
      })
    })
  },

  // 完整登录：获取 openid + 用户信息（头像、昵称）
  login(userInfo) {
    return new Promise((resolve, reject) => {
      const isTestMode = false; 

      if (isTestMode) {
        console.log('[Dev] 使用测试账号完整登录...');
        this._doServerLogin('test_code', userInfo, resolve, reject);
        return;
      }

      wx.login({
        success: res => {
          if (res.code) {
            this._doServerLogin(res.code, userInfo, resolve, reject);
          } else {
            reject('wx.login failed');
          }
        },
        fail: (err) => {
          console.error('wx.login fail', err);
          reject(err);
        }
      })
    })
  },

  _doServerLogin(code, userInfo, resolve, reject) {
    wx.request({
      url: `${API_BASE_URL}/api/login`,
      method: 'POST',
      data: { 
        code: code,
        userInfo: userInfo || null  // 如果有用户信息则传，否则只获取openid
      },
      success: (resp) => {
        if (resp.data.code === 0) {
          this.globalData.openid = resp.data.data.openid;
          
          // 如果传了用户信息，保存到全局状态
          if (userInfo) {
            this.globalData.userInfo = {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            }
            this.globalData.isLoggedIn = true;
            console.log('完整登录成功，OpenID:', this.globalData.openid, '用户信息:', this.globalData.userInfo);
          } else {
            console.log('静默登录成功，OpenID:', this.globalData.openid);
          }
          
          if (resolve) resolve({
            openid: this.globalData.openid,
            userInfo: this.globalData.userInfo,
            isLoggedIn: this.globalData.isLoggedIn
          });
        } else {
          console.error('后端登录失败', resp.data);
          if (reject) reject(resp.data);
        }
      },
      fail: (err) => {
        console.error('连接服务器失败', err);
        if (reject) reject(err);
      }
    })
  },
  
  // 检查是否已完整登录（有 openid + 用户信息）
  checkLoginStatus() {
    return this.globalData.openid && this.globalData.isLoggedIn
  },

  // 请求方法（需要 openid）
  request(url, method, data = {}) {
    const doRequest = () => {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${API_BASE_URL}${url}`,
                method: method,
                data: { 
                    ...data, 
                    openid: this.globalData.openid 
                },
                header: { 'content-type': 'application/json' },
                success: (res) => {
                    if (res.statusCode === 200 && res.data.code === 0) {
                        resolve(res.data);
                    } else {
                        // 如果是未登录错误 (401/404)，可以在这里统一处理
                        reject(res.data);
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            })
        });
    };

    if (!this.globalData.openid) {
        // 如果没有 openid，尝试静默登录一次
        return this.silentLogin().then(doRequest).catch(() => {
            // 登录失败也拒绝请求，避免未登录数据污染
            return Promise.reject({ msg: '请先登录', code: 401 });
        });
    } else {
        return doRequest();
    }
  }
});
