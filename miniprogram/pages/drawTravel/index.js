//index.js
const app = getApp()
let QQMapWX = require('../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
  key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
const db = wx.cloud.database({})
const _ = db.command
import { dateDiff, distance } from '../../util/util'
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
    nowHotel: [],
    isShow: true,
    hotelIndex: 0,
    nowLine: [],//当前线坐标数组
    nowIndex: 0,//当前线索引
    lineColorMap: ['#F45755', '#FFDE17', '#FE7A0B', '#9CDB3D', '#F5A8E4'],//线的背景色数组
  },
  onLoad: function (options) {
    // this.setLocation()
    this.onGetUserInfo()
  },
  onShow() {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.hotelIndex>=0) {
      this.setData({//将携带的参数赋值
        hotelIndex: currPage.data.hotelIndex
      });
    }
    console.log(`第${this.data.nowDay}天选择酒店`, this.data.nowHotel[this.data.hotelIndex])
  },
  //点击顶部按钮
  onClickTopBtn: function (e) {
    let id = e.currentTarget.dataset.id
    let idMap = {
      '0': true,
      '1': false,
    }
    this.setData({
      isTravel: idMap[id]
    })
    let _this = this
    if (this.data.isTravel && this.data.isShow) {
      let [...temp] = _this.data.polyline
      _this.data.imageItems.map((i, j) => {
        _this.setData({
          [`imageItems[${j}].isCheck`]: false
        })
      })
      _this.setData({
        showPolyLine: temp,
        nowIndex: 0,
        nowDay: 1,
        [`imageItems[0].isCheck`]: true
      })
    } else {
      _this.setData({
        showPolyLine: [],
        [`imageItems[0].isCheck`]: true
      })
    }
  },
  //点击左边按钮
  onClickLeftBtn: function (e) {
    let id = e.currentTarget.dataset.id
    let idMap = {
      '0': true,
      '1': false,
    }
    let _this = this
    _this.setData({
      isShow: idMap[id]
    })
    if (!_this.data.isShow) {
      _this.setData({
        showPolyLine: []
      })
      _this.data.imageItems.map((i, j) => {
        _this.setData({
          [`imageItems[${j}].isCheck`]: false
        })
      })
    } else if (_this.data.isTravel) {
      let [...temp] = _this.data.polyline
      _this.setData({
        showPolyLine: temp,
        nowIndex: 0,
        nowDay: 1,
        [`imageItems[0].isCheck`]: true
      })
    }
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
    if (!this.data.isShow || !this.data.isTravel) {
      if (!this.data.isTravel) {
        wx.showLoading()
        qqmapsdk.search({
          keyword: '酒店',  //搜索关键词
          location: { ...poi },  //设置周边搜索中心点
          success: function (res) { //搜索成功后的回调
            console.log('酒店列表', res)
            let [...temp] = res.data
            temp.map(i => {
              i.distance = distance(poi.latitude, poi.longitude, i.location.lat, i.location.lng)
            })
            console.log('格式化之后的酒店列表', temp)
            _this.setData({
              hotelList: temp
            })
            wx.hideLoading()
            wx.navigateTo({
              url: `./hotelList/index?latitude=${poi.latitude}&longitude=${poi.longitude}`,
            })
          },
          fail: function (res) {
            console.log(res);
            wx.hideLoading()
          },
          complete: function (res) {
            console.log(res);
            wx.hideLoading()
          }
        });

      }
      return
    }

    polyline.map(i => {
      i.points ? i.points.map(j => {
        if (JSON.stringify(j) == JSON.stringify(poi)) {
          isClick = true
        }
      }) : ''
    })
    console.log(isClick)
    if (isClick) {
      return
    }
    let [...temp] = this.data.nowLine
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
        color: this.data.lineColorMap[nowIndex],
        width: 8
      },
      [`polyline[${nowIndex}]`]: {
        points: temp,
        color: this.data.lineColorMap[nowIndex],
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
    console.log(tempArr, this.data.polyline)
    tempArr.map((i, index) => {
      if (i.isCheck) {
        console.log(index)
        _this.setData({
          [`showPolyLine[${index}]`]: _this.data.polyline[index] || {},
          nowLine: _this.data.polyline[index] && _this.data.polyline[index].points || []
        })
      } else {
        _this.setData({
          [`showPolyLine[${index}]`]: {}
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
