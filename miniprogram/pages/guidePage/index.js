//index.js
const app = getApp()
const db = wx.cloud.database({})
const _ = db.command

Page({
  data: {
    duration: 1500,//滑动动画时长
    // easingFunction: 'easeInOutCubic',//滑动动画方式
    current: 0,
    imageItems: [
      {
        url: '../../images/first/index_2.jpg',
      },
      {
        url: '../../images/first/index_3.jpg',
      },
      {
        url: '../../images/first/index_4.jpg',
      }
    ]
  },

  onLoad: function () {
    let count = wx.getStorageSync('count') && +wx.getStorageSync('count') || 0
    wx.setStorageSync('count', count + 1)
    if (count > 0) {
      wx.switchTab({
        url: '../index/index'
      })
    }

  },
  onShow() {

  },
  onClickImg(e) {
    let index = e.currentTarget.dataset.index
    if (index >= this.data.imageItems.length - 1) {
      wx.switchTab({
        url: '../index/index'
      })
    } else {
      this.setData({
        current: index+1
      })
    }

  },
  onImgChange(e) {
    console.log(e)
  }

})
