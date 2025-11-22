// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios') // 需要在 package.json 中安装 axios

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 配置你的 Python Flask 服务器地址
// [MIGRATION_NOTE]: 如果完全迁移到云开发，此云函数将被废弃，改为直接在小程序端调用云数据库或云函数
const FLASK_SERVER_URL = 'http://你的服务器IP:5000' 

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { url, method, data } = event
  
  // 自动注入 openid，确保 Python 端知道是谁在操作
  const payload = {
    ...data,
    openid: wxContext.OPENID,
    unionid: wxContext.UNIONID
  }

  try {
    const response = await axios({
      url: `${FLASK_SERVER_URL}${url}`,
      method: method || 'POST',
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}

