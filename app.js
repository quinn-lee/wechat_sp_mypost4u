//app.js
const env_settings = require('env_settings.js');

const util_interface = require('utils/interface.js');
const util_handle = require('utils/handle.js');
const env = env_settings.getEnv();
const id_type = env_settings.getIdType();

App({
  globalData: {
    env: env,
    id_type: id_type,
    uid: null,
    page_on_hide: false,  // 控制小程序是否退出,而非页面调用
    initParcels: {}
  },

  onLaunch: function (options) {
    console.log("onLaunch ====")
    console.log(options)
    // 登录
    console.log("["+options.path.substr(0, 14)+"]")
    // 暂时只有包裹列表 进行用户信息获取与登入
    if (options.path.substr(0,14) == "pages/parcels/") {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            util_interface.userLogin(this.globalData, res.code, this);
          }
          else {
            console.log("login failure no code: " + res);
            util_handle.showLoginFailToast()
          }
        }
      })
    }
  }
})