//index.js
const app = getApp()
let QQMapWX = require('../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
  key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
const db = wx.cloud.database({})
const _ = db.command
import { dateDiff } from '../../util/util'
Page({
  data: {
    key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7',
    poi: {},
    travelInfo: {},
    circles: [],
    markers: [],
    days: 0,
    nowDay: 1,
    isTravel: true,
    showPolyLine: [],
    polyline: [],
    imageItems: [
      {
        url: '../../images/scenery/btn1_03.png',
        isCheck: true
      },
      {
        url: '../../images/scenery/btn2_03.png',
        isCheck: false
      },
      {
        url: '../../images/scenery/btn3_03.png',
        isCheck: false
      },
      {
        url: '../../images/scenery/btn4_03.png',
        isCheck: false
      },
      {
        url: '../../images/scenery/btn5_03.png',
        isCheck: false
      }
    ],
    nowLine: [],//当前线坐标数组
    nowIndex: 0,//当前线索引
    lineColorMap: ['#F45755', '#FFDE17', '#FE7A0B', '#9CDB3D', '#F5A8E4'],//线的背景色数组
  },
  onLoad: function () {
    // this.setLocation()
    this.onGetUserInfo()
  },
  onClickTopBtn: function (e) {
    let id = e.currentTarget.dataset.id
    let idMap = {
      '0': true,
      '1': false,
    }
    this.setData({
      isTravel: idMap[id]
    })
  },
  //设置中间坐标
  setLocation: function (address) {
    let _this = this
    //调用地址解析接口
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: address || '西安市', //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) {//成功后的回调
        console.log(res);
        let result = res.result;
        let latitude = result.location.lat;
        let longitude = result.location.lng;
        _this.setData({
          poi: {
            latitude: latitude,
            longitude: longitude
          }
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },
  //初始化用户信息
  initUserData: function () {
    let _this = this
    db.collection('user').where({ _openid: app.globalData.openid }).get().then(res => {
      // res.data 包含该记录的数据
      console.log('用户信息', res.data)
      if (res.data && res.data.length > 0) {
        if (res.data[0].travelInfo) {
          _this.setData({
            travelInfo: res.data[0].travelInfo
          })
          _this.calDays(res.data[0].travelInfo)
          _this.initSceneryList()
        }
      }
    })
  },
  //点击景点
  onClickMarker: function (e) {
    console.log(e)
    let id = e.markerId
    let _this = this
    let polyline = []
    let isClick = false //是否点击过
    polyline = _this.data.polyline
    let poi = {
      latitude: _this.data.markers[id].latitude,
      longitude: _this.data.markers[id].longitude,
    }
    polyline.map(i => {
      i.polyline ? i.polyline.map(j => {
        console.log(j, poi)
        if (JSON.stringify(j) == JSON.stringify(poi)) {
          isClick = true
        }
      }) : ''
    })
    console.log(isClick)
    if (isClick) {
      return
    }
    let temp = []
    temp = this.data.nowLine
    temp.push({
      latitude: this.data.markers[id].latitude,
      longitude: this.data.markers[id].longitude,
    })
    let nowIndex = this.data.nowIndex
    this.setData({
      nowLine: temp,
      [`markers[${id}].isCheck`]: true,
      [`showPolyLine[${nowIndex}]`]: {
        points: temp,
        color: this.data.lineColorMap[this.data.nowIndex],
        width: 8
      },
      [`polyline[${nowIndex}]`]: {
        points: temp,
        color: this.data.lineColorMap[this.data.nowIndex],
        width: 8
      }
    })
  },
  //点击旁边图片items
  onClickImageItem: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      nowIndex: index,
      nowDay: index + 1,
      [`imageItems[${index}].isCheck`]: !this.data.imageItems[index].isCheck
    })
    let _this = this
    let tempArr = []
    tempArr = _this.data.imageItems
    tempArr.map((i, index) => {
      if (i.isCheck) {
        _this.setData({
          [`showPolyLine[${index}]`]: this.data.polyline[index] || [],
          nowLine: this.data.polyline[index] || []
        })
      } else {
        _this.setData({
          [`showPolyLine[${index}]`]: []
        })
      }
    })
    console.log(this.data.showPolyLine)
  },
  //计算天数
  calDays: function (travelInfo) {
    this.setData({
      days: dateDiff(travelInfo.goDate, travelInfo.arriveDate) + 1
    })
  },
  //获取已选择景点详情并初始化
  initSceneryList: function () {
    let idArr = this.data.travelInfo.selectArr
    let _this = this
    wx.showLoading({
      title: '加载中'
    })
    db.collection('scenery').where({
      _id: _.in(idArr)
    })
      .get({
        success: (res) => {
          console.log('景点数据', res.data)
          let markers = []
          markers = res.data.map((i, j) => {
            return {
              id: j,
              latitude: i.location.lat,
              longitude: i.location.lon,
              iconPath: i.picList[0] && i.picList[0].picUrl || '../../images/scenery/noImage.jpg',
              width: 36,
              height: 36,
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
            }
          })
          let circles = []
          circles = res.data.map((i, j) => {
            return {
              latitude: i.location.lat,
              longitude: i.location.lon,
              color: '#6fb5f3',
              fillColor: '#ffffff',
              radius: 1,
              strokeWidth: 1,
            }
          })
          _this.setData({
            markers: markers,
            circles: circles
          })
          wx.hideLoading()
        },
        fail: (err) => {
          console.error(err)
          wx.hideLoading()
        }
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
