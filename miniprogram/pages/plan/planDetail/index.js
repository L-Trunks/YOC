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
        userLocation: {},
        hour: 0,
        guidePage1: 'https://yoc-test-fxk60-1302830806.tcloudbaseapp.com/travel/guidePage/plandetail_page1@3x.png',
        // guidePage2: 'https://yoc-test-fxk60-1302830806.tcloudbaseapp.com/travel/guidePage/plandetail_page2@3x.png',
        showPage1: false,
        // showPage2: false
    },

    onLoad: function (option) {
        let _this = this
        if (option && option.index >= 0) {
            this.setData({
                index: option.index,
                day: option.index + 1
            })
        }
        if (wx.getStorageSync('pdPage') && wx.getStorageSync('pdPage')) {
            this.setData({
                showPage1: false,
                // showPage2: false
            })
        } else {
            this.setData({
                showPage1: true,
                // showPage2: false
            })
        }
    },
    onShow() {
        let _this = this
        if (wx.getStorageSync('travelHour')) {
            this.setData({
                hour: wx.getStorageSync('travelHour')
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
                        fail() {
                            _this.getUserLocation()
                            _this.getPlan()
                        },
                    })
                }
            }
        })
    },
    getUserLocation() {
        let _this = this
        wx.showModal({
            title: '授权',
            content: '需要使用获取您的当前位置，以便更好地为您服务，请在打开的设置中开启位置权限',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: (result) => {
                if (result.confirm) {
                    wx.openSetting({
                        success(res) {
                            console.log(res.authSetting)
                            if (res.authSetting['scope.userLocation']) {
                                _this.getLocation()
                            } else {
                                wx.authorize({
                                    scope: 'scope.userLocation',
                                    success() {
                                        _this.getLocation()
                                    },
                                    fail() {
                                        _this.getPlan()
                                    },
                                })
                            }
                        }
                    })
                }
            },
            fail: () => { },
            complete: () => { }
        });


    },
    //引导页
    onClickPage1() {
        wx.setStorageSync('pdPage', 1)
        this.setData({
            showPage1: false,
            // showPage2: true
        })
    },
    // onClickPage2() {
    //     wx.setStorageSync('pdPage', 1)
    //     this.setData({
    //         showPage1: false,
    //         showPage2: false
    //     })
    // },
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
                
            },
            complete(){
                _this.getPlan()
            }
        })
    },
    //点击地图中图片
    onClickMarker(e) {
        console.log(e)
        let id = e.markerId
        let scenery = this.data.markers[id]
        console.log(scenery)
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
                ...i,
                id: j,
                latitude: i.location.lat,
                longitude: i.location.lon,
                iconPath: i.imageUrl && i.imageUrl || '../../../images/scenery/noImage.jpg',
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
            }
            polyLine[0].points[j] = {
                latitude: i.location.lat,
                longitude: i.location.lon,
            }
        })
        _this.setData({
            markers: markers,
            polyLine: polyLine
        })
        console.log(markers)
        _this.formatPlanData()
    },
    //格式化行程计划
    formatPlanData() {
        let _this = this
        let planItems = []
        let { ...tempPlan } = _this.data.planData

        Array.from(tempPlan.sceneryInfo, (i, j) => {
            // if (j === 0) {
            //     planItems[j] = {
            //         ...i,
            //         img: i.imageUrl && i.imageUrl || '../../../images/scenery/noImage.jpg',
            //         distance: distance(_this.data.userLocation.latitude, _this.data.userLocation.longitude, i.location.lat, i.location.lon)
            //     }
            // } else {
            //     planItems[j] = {
            //         ...i,
            //         img: i.imageUrl && i.imageUrl || '../../../images/scenery/noImage.jpg',
            //         distance: distance(tempPlan.sceneryInfo[j - 1].location.lat, tempPlan.sceneryInfo[j - 1].location.lon, i.location.lat, i.location.lon)
            //     }
            // }
            planItems[j] = {
                ...i,
                img: i.imageUrl && i.imageUrl || '../../../images/scenery/noImage.jpg',
                distance: distance(_this.data.userLocation.latitude, _this.data.userLocation.longitude, i.location.lat, i.location.lon) || ''
            }
        })
        console.log(_this.data.userLocation, planItems)
        _this.setData({
            planItems: planItems
        })
    },

    goSceneryDetail(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `../../scenery/sceneryDetail/index?sceneryId=${id}`
        })
    }
})