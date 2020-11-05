//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        ticketItems: [],
        nowList: [],
        nowId: '',
        ticketIndex: 0,
        selectIndex: 0,
        autoPlay: true,
        hotBannerIndex: 0,
        hotBannerList: [],
    },

    onLoad: function() {
        this.getBannerList()
        this.getTicketInfo()
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
    hotSwiperChange: function(e) {
        this.setData({
            hotBannerIndex: e.detail.current
        })
    },
    getBannerList() {
        let _this = this
        wx.showLoading({
            title: '加载中'
        })
        db.collection('ticket_img').where({ type: 1 }).get().then(res => {
            // res.data 包含该记录的数据
            console.log('banner列表', res.data)
            if (res.data && res.data.length) {
                _this.setData({
                    hotBannerList: res.data || [],

                })

            }
            wx.hideLoading();
        })
    },
    getTicketInfo() {
        wx.showLoading({
            title: '加载中'
        });
        let _this = this
            //获取周边游列表
        db.collection('hz_ticket').where({}).get().then(res => {
            // res.data 包含该记录的数据
            console.log('票务类型列表', res.data)
            if (res.data && res.data.length) {
                if (res.data[0]) {
                    _this.setData({
                        ticketItems: res.data || [],
                        nowId: res.data && res.data[0] && res.data[0]._id && res.data[0]._id || ''
                    })
                }
                wx.hideLoading();
                _this.getTicketList()
            } else {
                wx.showToast({
                    title: "暂无票务计划推荐，请稍候再来~",
                    icon: 'none'
                })
                wx.hideLoading();
            }
        })
    },
    getTicketList() {
        wx.showLoading({
            title: '加载中'
        })
        let _this = this
        db.collection('hz_ticket_detail').where({ ticketId: _this.data.nowId }).orderBy('position', 'asc').get().then(result => {
            console.log('套餐列表', result.data)
            if (result.data) {
                _this.setData({
                    nowList: result.data || []
                })
            }
            wx.hideLoading()
        })
    },
    onTicketchange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            ticketIndex: index,
            nowId: this.data.ticketItems[index]._id
        })
        this.getTicketList()
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
            url: `./ticketForm/index?id=${id}`,
        })
    }
})