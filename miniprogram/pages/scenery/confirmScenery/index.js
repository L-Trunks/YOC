//index.js
const app = getApp()
const db = wx.cloud.database({
})
const _ = db.command
import { dateDiff, dateTimeStamp } from '../../../util/util'
Page({
  data: {
    showText: '愿你风月温柔，爱恨浪漫',
    sceneryList: [],
    hours: 0,
    scrollDir: true,
    adviseHours: 0,
    days: 0
  },

  onLoad: function () {
    console.log('全局', app.globalData)
    console.log('本地缓存中的游玩时间', wx.getStorageSync('travelHour'))
    console.log('本地缓存中的已选景点', wx.getStorageSync('selectArr'))
    console.log('本地缓存中的行程信息', wx.getStorageSync('travelInfo'))
    this.calDays()
    if (wx.getStorageSync('travelHour')) {
      this.setData({
        hours: wx.getStorageSync('travelHour')
      })
    }
    this.getSceneryList()

  },
  onShow: function (options) {
    if (options && options.type && options.type === 'noselect') {
      wx.showToast({
        title: "请选择游玩景点",
        icon: 'none'
      })
    }
  },
  //添加景点
  addScenery:function(){
    wx.navigateBack({
      delta: 0,
    })
  },
  //计算天数
  calDays: function () {
    let travelInfo = JSON.parse(wx.getStorageSync('travelInfo'))
    this.setData({
      days: dateDiff(travelInfo.goDate, travelInfo.arriveDate) + 1
    })
  },
  //进入景点详情
  goDetail: function (e) {
    let sId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../sceneryDetail/index?sceneryId=${sId}`
    })
  },
  //删除已选择景点
  deleteSelect: function (e) {
    let sId = e.currentTarget.dataset.id
    let _this = this
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          let idArr = JSON.parse(wx.getStorageSync('selectArr'))
          let tempArr = idArr.filter(i => {
            return i != sId
          })
          console.log(tempArr, sId)
          wx.setStorageSync('selectArr', JSON.stringify(tempArr))
          _this.getSceneryList()
        }
      }
    });
  },
  //获取已选择景点详情
  getSceneryList: function () {
    let idArr = []
    if (wx.getStorageSync('selectArr') && JSON.parse(wx.getStorageSync('selectArr'))) {
      idArr = JSON.parse(wx.getStorageSync('selectArr'))
    }
    let _this = this
    wx.showLoading({
      title: '加载中'
    })
    db.collection('scenery').where({
      _id: _.in(idArr)
    })
      .get({
        success: (res) => {
          console.log(res)
          _this.setData({
            sceneryList: res.data || []
          })
          wx.hideLoading()
        },
        fail: (err) => {
          console.error(err)
          wx.hideLoading()
        }
      })
  },
  //点击下一步
  onClickNext: function () {
    if (this.data.sceneryList.length > 0) {
      // wx.showModal({
      //   title: '提示',
      //   content: '旅行计划将会被清空，确定吗？',
      //   success(res) {
      //     if (res.confirm) {
      db.collection('user').where({ _openid: app.globalData.openid }).update({
        data: {
          travelInfo: {
            hours: wx.getStorageSync('travelHour'),
            selectArr: JSON.parse(wx.getStorageSync('selectArr')),
            sHUpdateTime: dateTimeStamp(new Date()) || ''
          },
          travelPlan: []
        }
      }).then(res => {
        console.log('更新用户行程返回值:', res)
        wx.navigateTo({
          url: '../../drawTravel/index'
        })
      })
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })
    } else {
      wx.showToast({
        title: '您还没有选择游玩景点哦',
        icon: 'none'
      });
      return
    }
  }
})
