// app.js
const API_BASE_URL = 'http://192.168.3.215:8080'; 

App({
  globalData: {
    openid: null,
    userInfo: null,
    baseUrl: API_BASE_URL
  },

  onLaunch: function () {
    // 尝试静默登录
    this.login();
  },

  login() {
    return new Promise((resolve, reject) => {
      // [关键修改] 关闭强制测试模式
      const isTestMode = false; 

      if (isTestMode) {
        console.log('[Dev] 使用测试账号登录...');
        this._doServerLogin('test_code', resolve, reject);
        return;
      }

      wx.login({
        success: res => {
          if (res.code) {
            this._doServerLogin(res.code, resolve, reject);
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

  _doServerLogin(code, resolve, reject) {
    wx.request({
      url: `${API_BASE_URL}/api/login`,
      method: 'POST',
      data: { code: code }, // 真实登录时不传 userInfo，等用户授权
      success: (resp) => {
        if (resp.data.code === 0) {
          this.globalData.openid = resp.data.data.openid;
          console.log('登录成功，OpenID:', this.globalData.openid);
          if (resolve) resolve(this.globalData.openid);
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
        // 如果没有 openid，尝试登录一次
        return this.login().then(doRequest).catch(() => {
            // 登录失败也拒绝请求，避免未登录数据污染
            return Promise.reject({ msg: '请先登录' });
        });
    } else {
        return doRequest();
    }
  }
});
