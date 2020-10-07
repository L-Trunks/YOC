//index.js
const app = getApp()
const db = wx.cloud.database({})
const _ = db.command
let QQMapWX = require('../../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
  key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
import { dateDiff, weekDay, dateTimeStamp, formatDateTime, distance } from '../../../util/util'
Page({
  data: {
    index: 0,
    planData: {},
    userData: {},
    day: 0,
    poi: {},
    key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7',
    travelInfo: {},
    circles: [],
    markers: [],
    userLocation: {}
  },

  onLoad: function (option) {
    let _this = this
    if (option && option.index >= 0) {
      this.setData({
        index: option.index,
        day: option.index + 1
      })

    }
    // 获取用户位置信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation']) {
          _this.getLocation()
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              _this.getLocation()
            },
            fail(){
              _this.getPlan()
            }
          })
        }
      }
    })

  },
  //获取定位
  getLocation() {
    let _this = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        _this.setData({
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed,
            accuracy: res.accuracy
          }
        })
        _this.getPlan()
      }
    })
  },
  //打开微信内置地图
  goLocation(e) {
    let index = e.currentTarget.dataset.index
    let scenery = this.data.planItems[index]
    wx.openLocation({
      latitude: +scenery.location.lat, // 纬度，范围为-90~90，负数表示南纬
      longitude: +scenery.location.lon, // 经度，范围为-180~180，负数表示西经
      scale: 18, // 缩放比例
      // name: 'name', // 位置名
      address: scenery.address, // 地址的详细说明
    })
  },
  //获取行程计划
  getPlan() {
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
            planData: res.data[0].travelPlan && res.data[0].travelPlan[_this.data.index] && res.data[0].travelPlan[_this.data.index] || {}
          })
        }
        if (_this.data.planData && _this.data.planData.sceneryInfo && _this.data.planData.sceneryInfo.length) {
          _this.setMap()
        }
        console.log(_this.data.planData)
        wx.hideLoading();
      }
    })
  },

  //设置地图marker和polyline
  setMap() {
    let _this = this
    let { ...tempPlan } = _this.data.planData
    let markers = []
    let polyLine = [{
      points: [],
      color: '#f04f48',
      width: 5
    }]
    Array.from(tempPlan.sceneryInfo, (i, j) => {
      markers[j] = {
        id: i._id,
        latitude: i.location.lat,
        longitude: i.location.lon,
        iconPath: i.picList[0] && i.picList[0].picUrl || '../../../images/scenery/noImage.jpg',
        width: 24,
        height: 24,
        callout: {
          content: i.name || '',
          borderRadius: 0,
          color: "#ffffff",
          borderWidth: 0,
          bgColor: '#e4bb3d',
          display: "ALWAYS",
          textAlign: 'center',
          anchorX: 12,
          padding: 5
        }
      },
        polyLine[0].points[j] = {
          latitude: i.location.lat,
          longitude: i.location.lon,
        }
    })
    _this.setData({
      markers: markers,
      polyLine: polyLine
    })
    _this.formatPlanData()
  },
  //格式化行程计划
  formatPlanData() {
    let _this = this
    let planItems = []
    let { ...tempPlan } = _this.data.planData
    console.log(_this.data.userLocation)
    Array.from(tempPlan.sceneryInfo, (i, j) => {
      if (j === 0) {
        planItems[j] = {
          ...i,
          img: i.picList[0] && i.picList[0].picUrl || '../../../images/scenery/noImage.jpg',
          distance: distance(_this.data.userLocation.latitude, _this.data.userLocation.longitude, i.location.lat, i.location.lon)
        }
      } else {
        planItems[j] = {
          ...i,
          img: i.picList[0] && i.picList[0].picUrl || '../../../images/scenery/noImage.jpg',
          distance: distance(tempPlan.sceneryInfo[j - 1].location.lat, tempPlan.sceneryInfo[j - 1].location.lon, i.location.lat, i.location.lon)
        }
      }
    })
    _this.setData({
      planItems: planItems
    })
  },
  //点击地图中图片
  onClickMarker(e) {
    console.log(e)
    let id = e.markerId
    wx.navigateTo({
      url: `../../scenery/sceneryDetail/index?sceneryId=${id}`,
    })
  }
})
