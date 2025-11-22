// app.js
const FLASK_SERVER_URL = 'http://127.0.0.1:8080';

App({
  globalData: {
    openid: null,
    userInfo: null
  },

  onLaunch: function () {
    this.login();
  },

  login() {
    return new Promise((resolve, reject) => {
      // [DEBUG模式] 
      // 为了防止 "invalid appid" 报错，我们这里强制使用测试流程
      // 如果你有真实 AppID，请把下面的 isTestMode 改为 false
      const isTestMode = true; 

      if (isTestMode) {
        console.warn('[Dev] 使用测试账号登录...');
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
        }
      })
    })
  },

  _doServerLogin(code, resolve, reject) {
    wx.request({
      url: `${FLASK_SERVER_URL}/api/login`,
      method: 'POST',
      data: { 
        code: code,
        userInfo: { nickName: '测试用户' } // 自动带个默认昵称
      }, 
      success: (resp) => {
        if (resp.data.code === 0) {
          this.globalData.openid = resp.data.data.openid;
          console.log('登录成功，OpenID:', this.globalData.openid);
          resolve(this.globalData.openid);
        } else {
          console.error('登录失败', resp.data);
          reject(resp.data);
        }
      },
      fail: (err) => {
        console.error('连接服务器失败', err);
        reject(err);
      }
    })
  },
  
  request(url, method, data = {}) {
    const doRequest = () => {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${FLASK_SERVER_URL}${url}`,
                method: method,
                data: { 
                    ...data, 
                    openid: this.globalData.openid 
                },
                header: { 'content-type': 'application/json' },
                success: (res) => {
                    if (res.statusCode === 200 && res.data.code === 0) resolve(res.data);
                    else reject(res.data);
                },
                fail: reject
            })
        });
    };

    if (!this.globalData.openid) {
        return this.login().then(doRequest);
    } else {
        return doRequest();
    }
  }
});
