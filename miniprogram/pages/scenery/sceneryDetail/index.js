//index.js
const app = getApp()
const db = wx.cloud.database()
// 引入SDK核心类
const QQMapWX = require('../../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');

// 实例化API核心类
const qqmapsdk = new QQMapWX({
  key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7' // 必填
});
Page({
  data: {
    selectArr: [],
    travelHour: 0,
    id: '',
    sceneryInfo: {},
    listItem: [
      {
        src: '../../../images/scenery/open_time_icon_12.png',
        text: '开放时间',
        label: ''
      },
      {
        src: '../../../images/scenery/travel_icon_17.png',
        text: '推荐游玩时间',
        label: ''
      },
      {
        src: '../../../images/scenery/fee_icon_21.png',
        text: '票价信息',
        label: ''
      },
      {
        src: '../../../images/scenery/address_icon_25.png',
        text: '地址',
        label: ''
      }
    ]
  },

  onLoad: function (options) {
    console.log(options)
    if (wx.getStorageSync('selectArr')) {
      this.setData({
        selectArr: JSON.parse(wx.getStorageSync('selectArr'))
      })
    }
    this.setData({
      id: options.sceneryId
    })
    if (wx.getStorageSync('travelHour')) {
      this.setData({
        hasHour: true,
        travelHour: wx.getStorageSync('travelHour')
      })
    }
    this.getSceneryInfo()
    console.log('本地缓存中的游玩时间', wx.getStorageSync('travelHour'))
    console.log('本地缓存中的已选景点', wx.getStorageSync('selectArr'))
  },
  onShow: function () {

  },
  //查看详细信息
  showDetail: function (e) {
    let data = e.currentTarget.dataset.detail;
    console.log(e)
    wx.showModal({
      title: '详细信息',
      content: data,
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
      },
      fail: () => { },
      complete: () => { }
    });
  },
  //转到导航
  goLocation(e) {
    let _this = this;
    //调用地址解析接口
    // 获取用户位置
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用定位功能，后续调用 wx.startRecord 接口不会弹窗询问
              _this.addressCoder()
            }
          })
        } else {
          _this.addressCoder()
        }
      }
    })

  },
  //地址解析
  addressCoder: function () {
    let _this = this
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: _this.data.sceneryInfo.address || '西安市区', //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) {//成功后的回调
        console.log(res);
        let result = res.result;
        let latitude = result.location.lat;
        let longitude = result.location.lng;
        wx.openLocation({
          latitude: latitude, // 纬度，范围为-90~90，负数表示南纬
          longitude: longitude, // 经度，范围为-180~180，负数表示西经
          scale: 18, // 缩放比例
          // name: 'name', // 位置名
          address: _this.data.sceneryInfo.address, // 地址的详细说明
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
  //获取景点信息及格式化
  getSceneryInfo: function () {
    let _this = this
    console.log(this.data.id)
    wx.showLoading({
      title: '加载中'
    })
    db.collection('scenery').where({
      _id: _this.data.id
    }).get().then(res => {
      console.log(res)
      _this.setData({
        sceneryInfo: res.data && res.data[0] || {}
      })
      _this.setData({
        sceneryInfo: {
          ..._this.data.sceneryInfo, picList: [
            { picUrl: _this.data.sceneryInfo.imgUrl1 && _this.data.sceneryInfo.imgUrl1 || '../../../images/scenery/noImage.jpg' },
            { picUrl: _this.data.sceneryInfo.imgUrl2 && _this.data.sceneryInfo.imgUrl2 || '../../../images/scenery/noImage.jpg' },
            { picUrl: _this.data.sceneryInfo.imgUrl3 && _this.data.sceneryInfo.imgUrl3 || '../../../images/scenery/noImage.jpg' },
            { picUrl: _this.data.sceneryInfo.imgUrl4 && _this.data.sceneryInfo.imgUrl4 || '../../../images/scenery/noImage.jpg' },
          ]
        }
      })
      let tempInfo = _this.data.sceneryInfo
      let tempList = _this.data.listItem
      tempList[0].label = tempInfo.opentime || '暂无'
      tempList[1].label = tempInfo.recommendtime || '暂无'
      tempList[2].label = tempInfo.coupon || '暂无'
      tempList[3].label = tempInfo.address || '暂无'
      _this.setData({
        listItem: tempList
      })
      console.log('格式化之后的景点信息', _this.data.sceneryInfo)
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: err,
        icon: "none"
      })
    })
  },
  goPage: function (e) {

  }

})
