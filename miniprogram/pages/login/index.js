//index.js
const app = getApp()
const db = wx.cloud.database({

})
import { formatDateTime, dateTimeStamp } from '../../util/util'
Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isLogin: false,
    avatarUrl: '',
    showImg: false,
    isShow: false,
  },

  onLoad: function () {
    wx.showLoading()
    console.log(1)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        wx.hideLoading()
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              app.globalData.userInfo = res.userInfo || {}
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                isLogin: true
              })
              this.onGetOpenid()
            }
          })
        }
      },
      complete:()=>{
        wx.hideLoading()
      }
    })
  },
  onShow() {

  },
  onLogin() {
    this.setData({
      isShow: true
    })
  },
  goIndex() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  cancelLogin() {
    this.setData({
      isShow: false
    })
  },
  //添加用户
  createUser: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let user = app.globalData.userInfo
    let now = new Date()
    console.log('用户信息:', user)
    let userInfo = {
      nickname: user.nickName || '',
      birthday: '',
      phone: '',
      introduce: '',
      province: user.province || '',
      city: user.city || '',
      country: user.country || '',
      createtime: dateTimeStamp(now) || ''
    }
    db.collection('user').add({
      data: { ...userInfo }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      wx.switchTab({
        url: '../index/index'
      })
    }).catch(err => {
      wx.hideLoading()
      console.log(err)
      wx.showToast({
        title: err
      })

    })
  },
  //获取用户信息
  onGetUserInfo: function (e) {
    console.log(e)
    if (!this.data.logged && e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        isLogin: true,
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      this.onGetOpenid()
    }
  },
  //获取openid
  onGetOpenid: function () {
    // 调用云函数
    let _this = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.showLoading({
          title: '加载中',
          mask: true
        });

        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        db.collection('user').where({ _openid: app.globalData.openid }).get().then(res => {
          // res.data 包含该记录的数据
          console.log(res.data)
          if (res.data && res.data.length > 0) {
            wx.hideLoading()
            console.log('用户已存在，不再存入数据库')
            if (res.data[0].travelInfo) {
              if (res.data[0].travelInfo.selectArr && res.data[0].travelInfo.selectArr.length > 0) {
                wx.setStorageSync('selectArr', JSON.stringify(res.data[0].travelInfo.selectArr))
                app.globalData.selectArr = res.data[0].travelInfo.selectArr
              }
              if (res.data[0].travelInfo.hours) {
                wx.setStorageSync('travelHour', res.data[0].travelInfo.hours)
              }
              wx.setStorageSync('travelInfo', JSON.stringify(res.data[0].travelInfo))
              // if (app.globalData.nowIndex === 0) {
                if (res.data[0].travelPlan) {
                  if (res.data[0].travelPlan.length) {
                    wx.switchTab({
                      url: '../plan/index'
                    })
                  } else {
                    wx.switchTab({
                      url: '../index/index'
                    })
                    // wx.showToast({
                    //   title: '还未制定行程计划哦',
                    //   icon: 'none'
                    // })
                    // setTimeout(() => {
                    //   wx.navigateTo({
                    //     url: '../drawTravel/index'
                    //   });
                    // }, 500)
                  }
                } else if (res.data[0].travelInfo) {
                  wx.switchTab({
                    url: '../scenery/index'
                  })
                }
              // }
            }
          } else {
            wx.hideLoading()
            this.createUser()
          }
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
})
