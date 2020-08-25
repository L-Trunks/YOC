//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    statusBarHeight: 20,
    activeIdx: 1,
    isCategory: '',
    isTop: false,
    sceneryConfig: {
      page: 1,
      sortId: ''
    },
    categoryArr: [

    ],
    sceneryArr: [
    ],
    sceneryConfig: {
      page: 1,
      sortId: ''
    },
    isBottom: false,
    times: 0,
    travelHour: 0,
    hours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    hasHour: false,
    selectArr: []
  },

  onLoad: function () {
    wx.hideTabBar()
    this.getCategory()
  },
  onShow: function () {
    if (wx.getStorageSync('selectArr')) {
      this.setData({
        selectArr: JSON.parse(wx.getStorageSync('selectArr'))
      })
    }
    if (wx.getStorageSync('travelHour')) {
      this.setData({
        hasHour: true
      })
    }
    console.log('本地缓存中的游玩时间', wx.getStorageSync('travelHour'))
    console.log('本地缓存中的已选景点', wx.getStorageSync('selectArr'))
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })
  },
  //hour改变事件
  hourChange(e) {
    const val = e.detail.value
    this.setData({
      travelHour: this.data.hours[val[0]],
    })
    console.log(val, this.data.travelHour)
  },
  //关闭弹窗
  closeHours: function () {
    if (this.data.travelHour === 0) {
      wx.showToast({
        title: '请选择游玩时间',
        icon: 'none'
      })
      return
    } else {
      wx.setStorageSync('travelHour', this.data.travelHour)
      this.setData({
        hasHour: true
      })
    }
  },
  //选择时间下一步事件
  hourNext: function () {
    if (this.data.travelHour === 0) {
      wx.showToast({
        title: '请选择游玩时间',
        icon: 'none'
      })
      return
    } else {
      wx.setStorageSync('travelHour', this.data.travelHour)
      this.setData({
        hasHour: true
      })
    }
  },
  //选择景点事件
  selectScenery: function (e) {
    let sId = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    let testArr = []
    let tempLen = this.data.selectArr.length
    let selectTemp = `sceneryArr[${index}].isSelect`
    console.log(this.data.sceneryArr[index].isSelect)
    this.setData({
      [selectTemp]: !(this.data.sceneryArr[index].isSelect)
    })
    console.log(this.data.sceneryArr[index].isSelect)
    testArr = this.data.selectArr.filter(i => {
      return i !== sId
    })
    if (testArr.length === tempLen) {
      this.setData({
        selectArr: [...testArr, sId]
      })
    } else {
      this.setData({
        selectArr: [...testArr]
      })
    }
    console.log('已选景点id', this.data.selectArr)
    wx.setStorageSync('selectArr', JSON.stringify(this.data.selectArr))
  },
  /**
   * 格式化景点列表
   * 主要用于改变已选择和未选的样式
   */
  formatScenery: function () {
    let _this = this
    let tempArr = _this.data.sceneryArr
    for (let i = 0; i < tempArr.length; i++) {
      for (let j = 0; j < _this.data.selectArr.length; j++) {
        if (tempArr[i]._id === _this.data.selectArr[j]) {
          tempArr[i].isSelect = true
        }
      }
    }
    console.log('格式化之后的景点列表', tempArr)
    _this.setData({
      sceneryArr: tempArr
    })
  },
  //获取分类
  getCategory: function () {
    let _this = this
    wx.cloud.callFunction({
      name: 'getSceneryCategory',
      data: {
      },
      success: res => {
        console.log('获取景点分类', res)
        _this.setData({
          categoryArr: res.result.data || [],
          isCategory: res.result.data[0]._id || '',
          sceneryConfig: { page: 1, sortId: res.result.data[0]._id }
        })
        console.log(res.result.data[0]._id)
        _this.getScenery({ ..._this.data.sceneryConfig, sortId: res.result.data[0]._id })
      },
      fail: err => {
        console.error('[云函数] [getSceneryCategory] 调用失败', err)
      }
    })
  },
  //获取景点列表及格式化
  getScenery: async function (config) {
    console.log('请求景点列表参数', config)
    wx.showLoading({
      title: '加载中',
    })
    let _this = this
    let count = await db.collection('scenery').where({ sortId: config.sortId }).count()
    console.log('景点列表数', count)
    _this.setData({
      times: Math.ceil(count.total / 20)
    })
    wx.cloud.callFunction({
      name: 'getScenery',
      data: {
        ...config
      },
      success: res => {
        console.log('获取景点列表', res)
        if (res.result.data.length === 0) {
          _this.setData({
            isBottom: true
          })
        }
        res.result.data.map(i => {
          i.isSelect = false
        })
        _this.setData({
          sceneryArr: _this.data.sceneryArr.concat(res.result.data)
        })
        _this.formatScenery()
        wx.hideLoading()
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast(
          {
            title: JSON.stringify(err),
            icon: 'none',
          }
        );
        console.error('[云函数] [getScenery] 调用失败', err)
      }
    })
  },
  //分类改变事件
  changeCategory: function (e) {
    console.log(e)
    let _this = this
    _this.setData({
      isCategory: e.currentTarget.dataset.cate,
      isBottom: false,
      sceneryArr: [],
      sceneryConfig: { page: 1, sortId: e.currentTarget.dataset.cate }
    })
    _this.getScenery(this.data.sceneryConfig)
  },

  //搜索框聚焦
  onSearchFocus: function (e) {
    this.setData({
      isTop: true
    })
  },
  //搜索框丢失焦点
  onSearchBlur: function (e) {
    // this.setData({
    //   isTop:false
    // })
  },
  backMain: function (e) {
    this.setData({
      isTop: false
    })
  },
  //进入景点详情
  goDetail: function (e) {
    let sId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `./sceneryDetail/index?sceneryId=${sId}`,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  //滚动到底部
  onReachBottom: function (e) {
    let _this = this
    console.log(_this.data.sceneryConfig.page, _this.data.times)
    if (_this.data.sceneryConfig.page === _this.data.times) {
      _this.setData({
        isBottom: true
      })
    } else {
      _this.setData({
        sceneryConfig: { ..._this.data.sceneryConfig, page: _this.data.sceneryConfig.page + 1 }
      })
      _this.getScenery(_this.data.sceneryConfig)
    }

  },
  onReachTop: function () {
    console.log(1)
  },
  //点击确认
  confirmScenery: function () {
    wx.navigateTo({
      url: './confirmScenery/index'
    })
  },
  //监听屏幕滚动 判断上下滚动  
  onPageScroll: function (ev) {
    let query = wx.createSelectorQuery()
    query.select('#search').boundingClientRect((rect) => {
      let top = rect.top
      if (top <= 5) {  //临界值，根据自己的需求来调整
        this.setData({
          isTop: true    //是否固定导航栏
        })
      } else {
        this.setData({
          isTop: false
        })
      }
    }).exec()
  },

})
