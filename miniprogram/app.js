//app.js
App({
  onLaunch: function () {
    wx.hideTabBar()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'yoc-test-fxk60',
        traceUser: true,
      })
    }


    // this.globalData = {}

  }, onShow() {
    let isClear = wx.getStorageSync('isClears') && +wx.getStorageSync('isClears') || 0
    console.log('缓存状态',isClear)
    if (!isClear) {
      wx.clearStorageSync()
      console.log('缓存清除')
      wx.setStorageSync('isClears', 1)
    }
  },
  globalData: {
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    nowIndex: 0,
    nextIndex: 0,
    selectArr: [],
    userInfo:{}
  }
})
