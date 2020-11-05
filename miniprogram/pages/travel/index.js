//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        travelItems: [],
        nowList: [],
        nowId: '',
        travelIndex: 0,
        selectIndex: 0
    },

    onLoad: function() {
        this.getTravelInfo()
    },
    onShow: function() {
        let value = wx.getLaunchOptionsSync()
        console.log(value)
        if (value.scene && value.scene !== 1082) {
            wx.switchTab({
                url: '../index/index'
            })
        }
    },
    getTravelInfo() {
        wx.showLoading({
            title: '加载中'
        });
        let _this = this
            //获取周边游列表
        db.collection('hz_travel').where({}).get().then(res => {
            // res.data 包含该记录的数据
            console.log('周边游列表', res.data)
            if (res.data && res.data.length) {
                if (res.data[0]) {
                    _this.setData({
                        travelItems: res.data || [],
                        nowId: res.data && res.data[0] && res.data[0]._id && res.data[0]._id || ''
                    })
                }
                wx.hideLoading();
                _this.getTravelList()
            } else {
                wx.showToast({
                    title: "暂无周边游计划推荐，请稍候再来~",
                    icon: 'none'
                })
                wx.hideLoading();
            }
        })
    },
    getTravelList() {
        wx.showLoading({
            title: '加载中'
        })
        let _this = this
        db.collection('hz_travel_detail').where({ travelId: _this.data.nowId }).orderBy('position', 'asc').get().then(result => {
            console.log('套餐列表', result.data)
            if (result.data) {
                _this.setData({
                    nowList: result.data || []
                })
            }
            wx.hideLoading()
        })
    },
    onTravelchange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            travelIndex: index,
            nowId: this.data.travelItems[index]._id
        })
        this.getTravelList()
    },
    onPlanchange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            selectIndex: index
        })
    },
    showDetail(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            isShow: true,
            showImage: this.data.nowList[index] && this.data.nowList[index].detailImg && this.data.nowList[index].detailImg || ''
        })
    },
    hideDetail() {
        this.setData({
            isShow: false
        })
    },
    goDetail() {
        let id = this.data.nowList[this.data.selectIndex]._id
        wx.navigateTo({
            url: `./travelForm/index?id=${id}`,
        })
    }
})