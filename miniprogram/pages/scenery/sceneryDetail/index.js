//index.js
const app = getApp()
const db = wx.cloud.database()
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
  //获取景点信息及格式化
  getSceneryInfo: function () {
    let _this = this
    console.log(this.data.id)
    db.collection('scenery').where({
      _id: _this.data.id
    }).get().then(res => {
      console.log(res)
      _this.setData({
        sceneryInfo: res.data && res.data[0] || {}
      })
      if (_this.data.sceneryInfo.picList && _this.data.sceneryInfo.picList.length === 0) {
        _this.setData({
          sceneryInfo: { ..._this.data.sceneryInfo, picList: [{ picUrl: '../../../images/scenery/noImage.jpg' }] }
        })
      }
      let tempInfo = _this.data.sceneryInfo
      let tempList = _this.data.listItem
      tempList[0].label = tempInfo.opentime || '暂无'
      tempList[1].label = tempInfo.opentime || '暂无'
      tempList[2].label = tempInfo.coupon || '暂无'
      tempList[3].label = tempInfo.address || '暂无'
      _this.setData({
        listItem: tempList
      })
      console.log('格式化之后的景点信息', _this.data.sceneryInfo)
    }).catch(err => {
      wx.showToast({
        title: err,
        icon: "none"
      })
    })
  },
  goPage: function (e) {

  }

})
