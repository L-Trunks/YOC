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
    activeIdx: 0,
    isLogin: false,
    cityArray: ['西安', '杭州'],
    transArray: ['飞机', '火车', '自驾', '客车', '步行', '其他'],
    cityIndex: 0,
    transIndex: 0,
    nowDate: '', //当前时间
    goDate: '',//出行时间
    endDate: '',//选择器截止时间
    arriveDate: '',//到达时间
  },

  onLoad: function () {
    let now = new Date()
    let end = +now + 1000 * 60 * 60 * 24 * 365 * 10
    this.setData({
      nowDate: formatDateTime(now, 'yy-mm-dd'),
      goDate: formatDateTime(now, 'yy-mm-dd'),
      endDate: formatDateTime(end, 'yy-mm-dd'),
      arriveDate: formatDateTime(now, 'yy-mm-dd'),
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
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
      }
    })
  },
  //城市选择改变事件
  bindCityChange: function (e) {
    console.log('城市改变索引', e.detail)
    this.setData({
      cityIndex: e.detail.value
    })
    this.updateStorageTravelInfo()
  },
  //交通工具选择改变事件
  bindTransportChange: function (e) {
    console.log('交通工具改变索引', e.detail)
    this.setData({
      transIndex: e.detail.value
    })
    this.updateStorageTravelInfo()
  },
  //时间选择改变事件
  bindGoDateChange: function (e) {
    this.setData({
      goDate: e.detail.value,
      arriveDate: e.detail.value
    })
    this.updateStorageTravelInfo()
  },
  bindArriveDateChange: function (e) {
    this.setData({
      arriveDate: e.detail.value
    })
    this.updateStorageTravelInfo()
  },
  //添加用户
  createUser: function () {
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
    })
  },
  updateStorageTravelInfo: function () {
    try {
      let _this = this.data
      if (dateTimeStamp(_this.arriveDate) < dateTimeStamp(_this.goDate)) {
        wx.showToast({
          title: '出发时间大于到达时间，请重新选择',
          icon: 'none',
        });
        return
      }
      let travelInfo = {
        place: _this.cityArray[_this.cityIndex],
        transport: _this.transArray[_this.transIndex],
        goDate: _this.goDate,
        arriveDate: _this.arriveDate
      }
      app.globalData.travelInfo = travelInfo
      wx.setStorageSync('travelInfo', JSON.stringify(travelInfo))
    } catch (e) {
      wx.showToast(e)
    }
  },
  //gogogo
  start() {
    this.updateUserTravelInfo(JSON.parse(wx.getStorageSync('travelInfo')))
    // app.globalData.travelInfo = travelInfo
    wx.switchTab({
      url: '../../pages/scenery/index',
      success: function (res) {
        // success
        console.log('gogogo:', res)
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
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
  //更新用户行程
  updateUserTravelInfo: function (data) {
    wx.cloud.callFunction({
      name: 'updateUserTravel',
      data: { ...data },
      success: res => {
        console.log('更新用户行程返回值', res)
      },
      fail: err => {
        console.error('[云函数] [updateUserTravel] 调用失败', err)
      }
    })
  },
  //获取openid
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        db.collection('user').where({ _openid: app.globalData.openid }).get().then(res => {
          // res.data 包含该记录的数据
          console.log(res.data)
          if (res.data && res.data.length > 0) {
            console.log('用户已存在，不再存入数据库')
            if (res.data[0].travelInfo) {
              wx.setStorageSync('travelInfo', JSON.stringify(res.data[0].travelInfo))
              wx.switchTab({
                url: '../../pages/scenery/index',
                success: function (res) {
                  // success
                  console.log('gogogo:', res)
                },
                fail: function () {
                  // fail
                },
                complete: function () {
                  // complete
                }
              })
            }
          } else {
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
