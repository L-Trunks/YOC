//index.js
const app = getApp()
let QQMapWX = require('../../util/qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
    key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
const db = wx.cloud.database({})
const _ = db.command
import { dateDiff, distance, dateTimeStamp, getColor } from '../../util/util'
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
        allImageItems: [{
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
        imageItems: [],
        nowHotel: [],
        isShow: true,
        hotelIndex: 0,
        nowLine: [], //当前线坐标数组
        nowIndex: 0, //当前线索引
        allLineColorMap: ['#F45755', '#FFDE17', '#FE7A0B', '#9CDB3D', '#F5A8E4'], //线的背景色数组
        lineColorMap: [],
        isEdit: false,
        travelPlan: [],
        sceneryList: [],
        hotelList: [],
        isPlan: false,
        datumScenery: {}, //基准景点,用于系统推荐周围最近的景点
        showTips:false,
        showDay:false
    },
    onLoad: function(options) {
        // this.setLocation()
        // wx.cloud.callFunction({
        //     name: 'getSceneryLocation',
        //     data: {},
        //     success: res => {
        //         console.log('获取景点列表', res)
        //         let count = 0
        //         let inter = setInterval(() => {
        //             let i = res.result.data[count]
        //             qqmapsdk.geocoder({
        //                 address: i.address || '',
        //                 complete: res => {
        //                     console.log(res)
        //                     db.collection('scenery').where({ _id: i._id }).update({
        //                         data: {
        //                             location: {
        //                                 ...res.result.location,
        //                                 lon: res.result.location.lng
        //                             },
        //                         }
        //                     }).then(res => {
        //                         // console.log(res)
        //                     })
        //                 }
        //             });
        //             if (count === res.result.data.length - 1) {
        //                 clearInterval(inter)
        //             }
        //             count++
        //         }, 1000)
        //     },
        //     fail: err => {
        //         console.error('[云函数] [getScenery] 调用失败', err)
        //     }
        // })
        this.onGetUserInfo()
    },
    onShow() {
        // let pages = getCurrentPages();
        // let currPage = pages[pages.length - 1];
        // if (currPage.data.hotelIndex >= 0) {
        //   this.setData({//将携带的参数赋值
        //     hotelIndex: currPage.data.hotelIndex,
        //     [`travelPlan[${this.data.nowIndex}].hotelInfo`]: this.data.hotelList.length > 0 && this.data.hotelList[currPage.data.hotelIndex] || {}
        //   });
        //   console.log(`第${this.data.nowDay}天选择酒店`, this.data.hotelList.length > 0 && this.data.hotelList[this.data.hotelIndex] || '暂无')
        //   console.log('行程计划', this.data.travelPlan)
        // }

    },
    changeTipsStatus(){
        this.setData({
            showTips:!this.data.showTips
        })
    },
    onClickShowDay(){
        this.setData({
            showDay:!this.data.showDay
        })
    },
    //点击顶部按钮
    onClickTopBtn: function(e) {
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
    //点击形成方案
    onClickPlan: function(e) {
        let _this = this
        _this.setData({
            isPlan: !_this.data.isPlan
        })
        if (_this.data.isPlan) {
            _this.useSystemTravel()

        }

    },
    //系统制定行程计划
    systemPlan(day, scenery, number, type) {
        console.log(day, scenery, number, type)
        let _this = this
        wx.showLoading()
        Array.from(day, (i, j) => {
            if (j !== day.length - 1) {
                let points = []
                Array.from(scenery.slice(j * number, (j + 1) * number), (i, j) => {
                    console.log(i)
                    points.push({
                        latitude: i.location && i.location.lat && i.location.lat || i.latitude || '',
                        longitude: i.location && i.location.lon && i.location.lon || i.longitude || '',
                    })
                })
                console.log(`第${i}天点列表`, points)
                _this.setData({
                    [`showPolyLine[${+i - 1}]`]: {
                        points: points,
                        color: _this.data.lineColorMap[+i - 1],
                        width: 8
                    },
                    [`polyline[${+i - 1}]`]: {
                        points: points,
                        color: _this.data.lineColorMap[+i - 1],
                        width: 8
                    },
                    [`travelPlan[${+i - 1}].sceneryInfo`]: scenery.slice(j * number, (j + 1) * number) || [],
                })
            } else {
                let points = []
                Array.from(scenery.slice(j * number), (i, j) => {
                    points.push({
                        latitude: i.location && i.location.lat && i.location.lat || i.latitude || '',
                        longitude: i.location && i.location.lon && i.location.lon || i.longitude || '',
                    })
                })
                console.log(`第${i}天点列表`, points)
                _this.setData({
                    [`showPolyLine[${+i - 1}]`]: {
                        points: points,
                        color: _this.data.lineColorMap[+i - 1],
                        width: 8
                    },
                    [`polyline[${+i - 1}]`]: {
                        points: points,
                        color: _this.data.lineColorMap[+i - 1],
                        width: 8
                    },
                    [`travelPlan[${+i - 1}].sceneryInfo`]: scenery.slice(j * number) || [],
                })
            }
        })
        let [...tempMarkers] = _this.data.markers
        Array.from(tempMarkers, i => {
            i.isCheck = true
        })
        _this.setData({
            markers: tempMarkers
        })
        wx.hideLoading()
        if (type === 'submit') {
            _this.saveTravel()
        }
    },
    //点击隐藏线路
    onClickHidden() {
        let _this = this
        _this.setData({
            isShow: !_this.data.isShow
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
        } else {
            let [...temp] = _this.data.polyline
            _this.setData({
                showPolyLine: temp.slice(0, 1),
                nowIndex: 0,
                nowDay: 1,
                nowLine: temp[0] && temp[0].points && temp[0].points || [],
                [`imageItems[0].isCheck`]: true
            })
        }
    },
    //设置中间坐标
    setLocation: function(address) {
        let _this = this
            //调用地址解析接口
        qqmapsdk.geocoder({
            //获取表单传入地址
            address: address || '西安市', //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
            success: function(res) { //成功后的回调
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
            fail: function(error) {
                console.error(error);
            },
            complete: function(res) {
                console.log(res);
            }
        })
    },
    //初始化用户信息
    initUserData: function() {
        let _this = this
        db.collection('user').where({ _openid: app.globalData.openid }).get().then(res => {
            // res.data 包含该记录的数据
            console.log('用户信息', res.data)
            if (res.data && res.data.length > 0) {
                if (res.data[0].travelInfo) {
                    if (!res.data[0].travelInfo.selectArr || !res.data[0].travelInfo.selectArr.length) {
                        wx.switchTab({
                            url: '../scenery/index?type=noselect',
                        });

                    }
                    _this.setData({
                        travelInfo: res.data[0].travelInfo,
                        travelPlan: res.data[0].travelPlan && res.data[0].travelPlan || {}
                    })
                    _this.calDays(res.data[0].travelInfo)
                    _this.initSceneryList()
                }
            }
        })
    },
    //进入酒店列表
    // enterHotel: function (poi) {
    //   wx.showLoading()
    //   let _this = this
    //   qqmapsdk.search({
    //     keyword: '酒店',  //搜索关键词
    //     location: { ...poi },  //设置周边搜索中心点
    //     success: function (res) { //搜索成功后的回调
    //       console.log('酒店列表', res)
    //       let [...temp] = res.data
    //       temp.map(i => {
    //         i.distance = distance(poi.latitude, poi.longitude, i.location.lat, i.location.lng)
    //       })
    //       console.log('格式化之后的酒店列表', temp)
    //       _this.setData({
    //         hotelList: temp,
    //         nowHotel: temp[_this.data.nowIndex]
    //       })
    //       wx.hideLoading()
    //       wx.navigateTo({
    //         url: `./hotelList/index?latitude=${poi.latitude}&longitude=${poi.longitude}`,
    //       })
    //     },
    //     fail: function (res) {
    //       console.log(res);
    //       wx.hideLoading()
    //     },
    //     complete: function (res) {
    //       console.log(res);
    //       wx.hideLoading()
    //     }
    //   });
    // },
    //点击景点
    onClickMarker: function(e) {
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
        _this.setData({
            isEdit: true,
            datumScenery: _this.data.markers[id]
        })
        if (!_this.data.isShow || !_this.data.isTravel) {
            if (!_this.data.isTravel) {
                if (!_this.data.travelPlan[_this.data.nowIndex] || _this.data.travelPlan[_this.data.nowIndex].length === 0) {
                    wx.showToast({
                        title: `第${_this.data.nowDay}天行程路线未制定`,
                        icon: 'none'
                    });
                    return
                }
                if (_this.data.travelPlan.length > 0 && _this.data.travelPlan[_this.data.nowIndex].hotelInfo && _this.data.travelPlan[_this.data.nowIndex].hotelInfo && _this.data.travelPlan[_this.data.nowIndex].hotelInfo.title) {
                    wx.showModal({
                        title: '提示',
                        content: `确定重新选择第${_this.data.nowDay}天的酒店吗？`,
                        showCancel: true,
                        cancelText: '取消',
                        cancelColor: '#000000',
                        confirmText: '确定',
                        confirmColor: '#6fb5f3',
                        success: (result) => {
                            if (result.confirm) {
                                _this.enterHotel(poi)
                            } else {
                                return
                            }
                        }
                    });
                } else {
                    _this.enterHotel(poi)
                }
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
        console.log('是否已选择?', isClick)
        if (isClick) {
            return
        }
        let [...temp] = this.data.nowLine
        temp.push({
            latitude: this.data.markers[id].latitude,
            longitude: this.data.markers[id].longitude,
        })
        let nowIndex = this.data.nowIndex
        let [...nowScenery] = this.data.travelPlan[nowIndex] && this.data.travelPlan[nowIndex].sceneryInfo && this.data.travelPlan[nowIndex].sceneryInfo || []
        nowScenery.push(_this.data.sceneryList[id])
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
            },
            [`travelPlan[${nowIndex}].sceneryInfo`]: nowScenery || [],
            [`travelPlan[${nowIndex}].hotelInfo`]: {},
        })
    },
    //点击旁边图片items
    onClickImageItem: function(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            [`imageItems[${index}].isCheck`]: true
        })
        if (this.data.imageItems[index].isCheck) {
            this.setData({
                nowIndex: index,
                nowDay: index + 1
            })
        }
        let _this = this
        wx.showToast({
            title: `当前第${_this.data.nowDay}天`,
            icon: 'none'
        })
        let [...tempArr] = _this.data.imageItems
        let [...tempPolyLine] = _this.data.polyline
        Array.from(tempArr, (i, index) => {
            if (i.isCheck) {
                _this.setData({
                    [`showPolyLine[${index}]`]: tempPolyLine[index] || {},
                    nowLine: tempPolyLine[index] && tempPolyLine[index].points || []
                })
            } else {
                _this.setData({
                    [`showPolyLine[${index}]`]: {}
                })
            }
        })
        this.setData({
            showDay:false
        })
        console.log(this.data.showPolyLine, tempPolyLine, this.data.polyline)
    },
    //计算天数
    calDays: function(travelInfo) {
        let days = dateDiff(travelInfo.goDate, travelInfo.arriveDate) + 1
        let colorArr = []
        for (let i = 0; i < days; i++) {
            colorArr.push(getColor())
        }
        let imageItems = []
        Array.from(colorArr, (i, j) => {
            imageItems.push({
                url: '../../images/scenery/btn1_03.png',
                isCheck: false,
                color: i,
                index: `第${j+1}天`
            })
        })
        let [...lineItems] = colorArr

        this.setData({
            days: days,
            allLineColorMap: colorArr,
            allImageItems: imageItems,
            lineColorMap: lineItems,
            imageItems: imageItems
        })
    },
    //获取已选择景点详情并初始化
    initSceneryList: function() {
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
                            ...i,
                            id: j,
                            sceneryId: i._id,
                            latitude: i.location.lat,
                            longitude: i.location.lon,
                            iconPath: i.imageUrl && i.imageUrl || '../../images/scenery/noImage.jpg',
                            width: 48.4,
                            height: 55.4,
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
                        circles: circles,
                        sceneryList: res.data || []
                    })
                    _this.data.datumScenery = _this.data.markers[0],
                        console.log('marker', _this.data.markers)

                    wx.hideLoading()
                    _this.initTravelPlan()

                },
                fail: (err) => {
                    console.error(err)
                    wx.hideLoading()
                }
            })
    },
    //删除路线
    removeTravelInfo: function() {
        let _this = this
        if (!_this.data.travelPlan[_this.data.nowIndex] || _this.data.travelPlan[_this.data.nowIndex].length === 0) {
            wx.showToast({
                title: `第${_this.data.nowDay}天行程路线未制定`,
                icon: 'none'
            });
            return
        }
        wx.showModal({
            title: '提示',
            content: `确定删除第${_this.data.nowDay}天的路线吗？`,
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#f04f48',
            success: (result) => {
                if (result.confirm) {
                    wx.showLoading()
                    _this.setData({
                        [`showPolyLine[${_this.data.nowIndex}]`]: [],
                        [`polyline[${_this.data.nowIndex}]`]: [],
                        [`travelPlan[${_this.data.nowIndex}].sceneryInfo`]: [],
                        nowLine: []
                    })
                    wx.hideLoading()
                } else {
                    return
                }
            }
        });
    },
    //点击下一步
    enterTravelPlan: function() {
        let _this = this
        let allowNext = true //所有景点是否已选择
        let [...tempMarkers] = _this.data.markers
        Array.from(tempMarkers, i => {
            if (!i.isCheck) {
                allowNext = false
            }
        })
        _this.data.allowNext = allowNext
        let [...travelPlan] = _this.data.travelPlan
        let [...imageItems] = _this.data.imageItems
        console.log(travelPlan)
        let noTravelArr = []
            // let noHotelArr = []
        Array.from(imageItems, (i, j) => {
                if (!travelPlan[j] || !travelPlan[j].sceneryInfo || travelPlan[j].sceneryInfo.length <= 0) {
                    noTravelArr.push(j + 1)
                }
                // if (travelPlan[j] && travelPlan[j].sceneryInfo && travelPlan[j].sceneryInfo.length > 0 && JSON.stringify(travelPlan[j].hotelInfo) === '{}') {
                //   noHotelArr.push(j + 1)
                // }
            })
            // if (noHotelArr.length > 0) {
            //   wx.showToast({
            //     title: `第${noHotelArr.join(',')}天酒店未选择`,
            //     icon: 'none'
            //   })
            //   return
            // }
        wx.showModal({
            title: '提示',
            content: '确定使用该行程计划吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#6fb5f3',
            success: (result) => {
                if (result.confirm) {
                    if (noTravelArr.length > 0) {
                        wx.showModal({
                            title: '提示',
                            content: `第${noTravelArr.join(',')}天未制定行程，让系统帮您规划行程？`,
                            showCancel: true,
                            cancelText: '取消',
                            cancelColor: '#000000',
                            confirmText: '确定',
                            confirmColor: '#6fb5f3',
                            success: (result) => {
                                if (result.confirm) {
                                    console.log('使用系统推荐行程')
                                    _this.useSystemTravel('submit')
                                } else {
                                    console.log('不使用系统推荐行程')
                                    _this.saveTravel()
                                }
                            }
                        });
                    } else if (!allowNext) {
                        wx.showModal({
                            title: '提示',
                            content: `还有景点未选择，让系统帮您规划行程？`,
                            showCancel: true,
                            cancelText: '取消',
                            cancelColor: '#000000',
                            confirmText: '确定',
                            confirmColor: '#6fb5f3',
                            success: (result) => {
                                if (result.confirm) {
                                    console.log('使用系统推荐行程')
                                    _this.useSystemTravel('submit')
                                } else {
                                    console.log('不使用系统推荐行程')
                                    _this.saveTravel()
                                }
                            }
                        });
                    } else {
                        _this.saveTravel()
                    }

                } else {
                    return
                }
            }
        });
    },
    //使用系统推荐行程
    useSystemTravel: function(type) {
        wx.showLoading()
        let _this = this
        let allSceneryIsSelect = true //所有景点是否已选择
        let unSelectScenery = [] //未选择景点列表
        let suggestNumber = 3 //建议每天游玩景点数
        let noTravelDays = 0 //未制定行程的天数
        let totalNumber = 0 //未规划的景点数
        let systemScenery = [] //未规划的景点列表
        let systemSuggestNumber = 0 //需要系统推荐的景点数
        let [...tempMarkers] = _this.data.markers
        Array.from(tempMarkers, i => {
            if (!i.isCheck) {
                allSceneryIsSelect = false
                unSelectScenery.push(i)
            }
        })
        _this.data.allSceneryIsSelect = allSceneryIsSelect
        let [...travelPlan] = _this.data.travelPlan
        let [...imageItems] = _this.data.imageItems
        console.log(travelPlan)
        let noTravelArr = []
        Array.from(imageItems, (i, j) => {
            if (!travelPlan[j] || !travelPlan[j].sceneryInfo || travelPlan[j].sceneryInfo.length <= 0) {
                noTravelArr.push(j + 1)
            }
        })
        totalNumber = noTravelArr.length * suggestNumber
        systemSuggestNumber = totalNumber - unSelectScenery.length
        console.log(totalNumber, noTravelArr, systemSuggestNumber, unSelectScenery)
        wx.hideLoading()
        if (systemSuggestNumber > 0) {
            wx.showLoading()
            db.collection('scenery').where({
                _id: _.nin([..._this.data.travelInfo.selectArr])
            }).get().then(res => {
                // res.data 包含该记录的数据
                console.log('景点列表信息', res.data, _this.data.datumScenery)
                if (res.data && res.data.length > 0) {
                    if (res.data[0]) {
                        Array.from(res.data, (i, j) => {
                            i.distance = distance(_this.data.datumScenery.latitude, _this.data.datumScenery.longitude, i.location.lat, i.location.lon)
                        })
                        res.data.sort((i, j) => {
                            return i.distance - j.distance
                        })
                        console.log(res.data)
                        systemScenery = res.data.slice(0, systemSuggestNumber)
                        let [...selectArr] = _this.data.travelInfo.selectArr
                        systemScenery.map((i, j) => {
                            selectArr.push(i._id)
                        })
                        _this.data.travelInfo.selectArr = selectArr
                        console.log('选择景点id列表', _this.data.travelInfo.selectArr)
                        wx.setStorageSync('selectArr', JSON.stringify(selectArr))
                            //设置markers
                        let markers = []

                        markers = systemScenery.map((i, j) => {
                            return {
                                id: j + _this.data.markers.length,
                                sceneryId: i._id,
                                latitude: i.location.lat,
                                longitude: i.location.lon,
                                iconPath: i.imageUrl && i.imageUrl || '../../images/scenery/noImage.jpg',
                                width: 48,
                                height: 48,
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
                        circles = systemScenery.map((i, j) => {
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
                            markers: [..._this.data.markers, ...markers],
                            circles: [..._this.data.circles, ...circles],
                            sceneryList: [..._this.data.sceneryList, ...systemScenery]
                        })
                        console.log(_this.data.markers, _this.data.circles, _this.data.sceneryList)
                        Array.from(unSelectScenery, (i, j) => {
                            i.distance = distance(_this.data.datumScenery.latitude, _this.data.datumScenery.longitude, i.latitude, i.longitude)
                        })

                        systemScenery = [...systemScenery, ...unSelectScenery]
                        console.log('未制定行程的景点', systemScenery)
                        wx.hideLoading()
                            //根据天数制定行程
                        _this.systemPlan(noTravelArr, systemScenery, suggestNumber, type)
                    }
                    wx.hideLoading();
                }
            })
        } else {
            systemScenery = [...systemScenery, ...unSelectScenery]
                //根据天数制定行程
            _this.systemPlan(noTravelArr, systemScenery, suggestNumber, type)
        }

    },
    //保存用户行程
    saveTravel: function() {
        let _this = this
        console.log('用户行程信息', _this.data.travelPlan)
        db.collection('user').where({ _openid: app.globalData.openid }).update({
            data: {
                tPUpdateTime: dateTimeStamp(new Date()) || '',
                travelPlan: _this.data.travelPlan,
                travelInfo: _this.data.travelInfo
            }
        }).then(res => {
            console.log('更新用户旅行计划返回值:', res)
            wx.reLaunch({
                url: '../plan/index'
            })
        }).catch(err => {
            console.log(err)
            wx.showToast({
                title: '提交失败，请稍后再试',
                icon: 'none'
            })
        })
    },
    //格式化用户行程计划
    initTravelPlan() {
        wx.showLoading({
            title: '加载中'
        })
        let _this = this
        console.log('接口获取的用户行程计划', _this.data.travelPlan)
        if (JSON.stringify(_this.data.travelPlan) === '{}') {
            wx.hideLoading()
            return
        }
        let [...tempPlan] = _this.data.travelPlan
        let [...imageItems] = _this.data.imageItems
        let polyLine = []
        let tempMarkers = []

        Array.from(tempPlan, (i, j) => {
                i && i.sceneryInfo && i.sceneryInfo.length > 0 ? Array.from(i.sceneryInfo, k => {
                    let points = polyLine[j] && polyLine[j].points && polyLine[j].points || []
                    points.push({
                        latitude: k.location.lat || '',
                        longitude: k.location.lon || '',
                    })
                    polyLine[j] = {
                        points: points,
                        color: _this.data.lineColorMap[j],
                        width: 8,
                    }
                    tempMarkers.push(k)
                }) : polyLine[j] = {
                    points: [],
                }
            })
            //初始化
        _this.setData({
            nowDay: 1,
            nowIndex: 0,
        })
        Array.from(imageItems, (k, g) => {
            Array.from(_this.data.travelPlan, (i, j) => {
                if (i && i.sceneryInfo && i.sceneryInfo.length > 0) {
                    _this.setData({
                        [`imageItems[${j}].isCheck`]: true,
                    })
                } else {
                    _this.setData({
                        [`imageItems[${j}].isCheck`]: false,
                    })
                }
            })
        })
        Array.from(_this.data.markers, (i, j) => {
            Array.from(tempMarkers, k => {
                if (i.latitude === k.location.lat && i.longitude === k.location.lon) {
                    _this.setData({
                        [`markers[${j}].isCheck`]: true
                    })
                }
            })
        })
        console.log('格式化之后的marker', _this.data.markers)
        _this.setData({
            polyline: [...polyLine],
            showPolyLine: [...polyLine],
            nowLine: polyLine[0] && polyLine[0].points && polyLine[0].points || []
        })
        console.log('格式化之后的线列表', polyLine)
        wx.hideLoading()
    },
    //获取openid
    onGetUserInfo: function() {
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