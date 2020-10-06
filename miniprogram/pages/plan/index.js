//index.js
const app = getApp()
const db = wx.cloud.database({})
const _ = db.command
import { dateDiff, weekDay, dateTimeStamp, formatDateTime } from '../../util/util'
Page({
  data: {
    activeIdx: 2,
    leftItems: [],//左边渲染
    rightItems: [],//右边渲染
    nowDate: '',
    year: '',
    date: '',
    days: 0,
    leftBgColor: ['#A9EDEE', '#F6EAAE'],
    rightBgColor: ['#EEC0AB', '#BBF5CF'],
  },

  onLoad: function () {
    wx.hideTabBar()
    //计算总天数
    this.calDays()
    let now = new Date()
    let date = formatDateTime(now, 'mm.dd')
    let year = now.getFullYear()
    this.setData({
      date,
      year,
      weekDay: weekDay(formatDateTime(now, 'yy-mm-dd'))
    })

  },
  onShow() {
    this.onGetUserInfo()
  },
  initUserData() {
    let _this = this
    wx.showLoading({
      title: '加载中',
    });

    db.collection('user').where({ _openid: app.globalData.openid }).get().then(res => {
      // res.data 包含该记录的数据
      console.log('用户信息', res.data)
      if (res.data && res.data.length > 0) {
        if (res.data[0]) {
          _this.setData({
            userData: res.data[0] || {},
          })
        }
        _this.formatItem()
        wx.hideLoading();

      }
    })
  },
  //制定行程
  goDrawTravel() {
    wx.showModal({
      title: '提示',
      content: '当前旅行计划将被删除，确定继续吗？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          db.collection('user').where({ _openid: app.globalData.openid }).update({
            data: {
              travelPlan: []
            }
          }).then(res => {
            console.log('更新用户行程返回值:', res)
            wx.navigateTo({
              url: '../drawTravel/index'
            });
          }).catch(err => {
            console.log(err)
            wx.showToast({
              title: '出现错误，请稍后再试',
              icon: 'none'
            })
          })
        }
      }
    });
  },
  //编辑行程
  editorTravel() {
    wx.navigateTo({
      url: '../drawTravel/index'
    });
  },
  //保存行程
  saveTravel(){

  },
  //进入计划详情
  goPlanDetail(e){
    console.log(e)
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `./planDetail/index?index=${index}`
    });
  },
  //选择景点
  selectScenery() {
    wx.switchTab({
      url: '../scenery/index?type=noselect',
    });
  },
  //计算天数
  calDays: function () {
    let travelInfo = JSON.parse(wx.getStorageSync('travelInfo'))
    this.setData({
      days: dateDiff(travelInfo.goDate, travelInfo.arriveDate) + 1
    })
  },
  formatItem() {
    let _this = this
    let { ...userData } = _this.data.userData
    let left = []
    let right = []
    let startDate = userData.travelInfo.goDate
    let oneDay = 1000 * 60 * 60 * 24
    for (let i = 0; i < _this.data.days; i++) {
      if (!userData.travelPlan[i]) {
        userData.travelPlan[i] = {}
      }
    }

    Array.from(userData.travelPlan, (i, j) => {
      if (j % 2 === 0) {
        left.push({
          ...i,
          day: j + 1,
          week: weekDay(formatDateTime(dateTimeStamp(startDate) + j * oneDay, 'yy-mm-dd')),
          date: formatDateTime(dateTimeStamp(startDate) + j * oneDay, 'yy-mm-dd'),
        })
      } else if (j % 2 !== 0) {
        right.push({
          ...i,
          day: j + 1,
          week: weekDay(formatDateTime(dateTimeStamp(startDate) + j * oneDay, 'yy-mm-dd')),
          date: formatDateTime(dateTimeStamp(startDate) + j * oneDay, 'yy-mm-dd')
        })
      }
    })
    Array.from(left, (i, j) => {
      if (j % 2 === 0) {
        i.bgColor = _this.data.leftBgColor[0]
      } else {
        i.bgColor = _this.data.leftBgColor[1]
      }
    })
    Array.from(right, (i, j) => {
      if (j % 2 === 0) {
        i.bgColor = _this.data.rightBgColor[0]
      } else {
        i.bgColor = _this.data.rightBgColor[1]
      }
    })
    console.log('左边渲染列表', left)
    console.log('右边渲染列表', right)
    _this.setData({
      leftItems: left,
      rightItems: right
    })
  },
  //获取openid
  onGetUserInfo: function () {
    let _this = this
    if (app.globalData.openid) {
      _this.initUserData()
    } else {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openid = res.result.openid
          _this.initUserData()
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }

  },

})
