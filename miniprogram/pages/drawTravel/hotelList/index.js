//index.js
//获取应用实例
const app = getApp()
// 引入SDK核心类
let QQMapWX = require('../../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
  key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
import { dateDiff, distance } from '../../../util/util'
Page({
  data: {
    hotelList: [
    ]
  },
  onLoad: function (options) {
    let _this = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              _this.getHotelList(options)
            }
          })
        } else {
          _this.getHotelList(options)
        }
      }
    })
  },
  onShow: function () {

  },
  selectHotel: function (e) {
    let index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定选择该酒店吗？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          let pages = getCurrentPages();//当前页面
          let prevPage = pages[pages.length - 2];//上一页面
          prevPage.setData({//直接给上移页面赋值
            hotelIndex: index,
          });
          wx.navigateBack({//返回
            delta: 1
          })
        }
      }
    });

  },
  getHotelList: function (poi) {
    let _this = this
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
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  goLocation: function (e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    this.openLocation(this.data.hotelList[index].address)
  },
  //打开导航
  openLocation: function (address) {
    //调用地址解析接口
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: address || '北京市海淀区彩和坊路海淀西大街74号', //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
      success: function (res) {//成功后的回调
        console.log(res);
        let result = res.result;
        let latitude = result.location.lat;
        let longitude = result.location.lng;
        wx.openLocation({
          latitude: latitude,
          longitude: longitude
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  }
})
