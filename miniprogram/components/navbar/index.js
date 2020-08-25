// zh_tcwq/pubcoms/navbar/navbar.js
import tabbarList from "../../config/router.js"
const app = getApp();
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    activeIdx: {
      type: Number,
      value: 0
    },
    auth: {
      type: Number,
      value: 0,
      observer: 'onAuthChanged'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabbarList: tabbarList,
    _auth: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
    handleItemTap(e) {
      const {
        idx,
        path
      } = e.currentTarget.dataset
      app.globalData.nowIndex = this.data.activeIdx
      app.globalData.nextIndex = idx
      console.log('tab索引', idx, this.data.activeIdx)
      let _this = this
      if (idx === this.data.activeIdx) {
        this.trigger('refresh')
        return
      } else if (this.data.activeIdx === 0) {
        if (idx === 1) {
          wx.showModal({
            title: '提示',
            content: '确定使用该行程吗？',
            success(res) {
              if (res.confirm) {
                _this.updateUserTravelInfo(JSON.parse(wx.getStorageSync('travelInfo')))
                wx.switchTab({
                  url: `/${path}`,
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else if (idx === 2) {
          wx.switchTab({
            url: `/${path}`,
          })
        }
      } else if (this.data.activeIdx === 1) {
        if (idx === 0) {
          wx.showModal({
            title: '提示',
            content: '确定重新选择行程吗？',
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: `/${path}`,
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else if (idx === 2) {
          wx.switchTab({
            url: `/${path}`,
          })
        }
      } else if (this.data.activeIdx === 2) {
        if (idx === 0) {
          wx.showModal({
            title: '提示',
            content: '确定重新选择行程吗？',
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: `/${path}`,
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else if (idx === 1) {
          wx.switchTab({
            url: `/${path}`,
          })
        }
      }

    },
    onAuthChanged(newVal) {
      wx.setStorageSync('__com-tabbar-auth', newVal)
      this.setData({
        _auth: newVal
      })
    },
    trigger(eventName, value = {}, info) {
      if (!eventName) {
        throw new TypeError('没有自定义事件名')
      }
      this.triggerEvent(eventName, value)
      console.log(`发送 ${eventName} 事件,携带的值为 ${typeof value === 'object' ? JSON.stringify(value) : value} ${info ? '   ---   ' + info : ''}`)
    }
  },
  ready() { },
  /** 权限显示 */
  pageLifetimes: {
    show: function () {
      console.log('show')
      this.setData({
        _auth: wx.getStorageSync('__com-tabbar-auth')
      })
    }
  }
})