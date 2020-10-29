//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        id: '',
        url: ''
    },

    onLoad: function(option) {
        this.setData({
            id: option.id && option.id || ''
        })
        this.getCodeUrl()
    },
    onShow: function() {

    },
    getCodeUrl() {
        wx.showLoading()
        let _this = this
        db.collection('hz_ticket_detail').where({ _id: _this.data.id }).orderBy('position', 'asc').get().then(result => {
            console.log('套餐列表', result.data)
            if (result.data) {
                _this.setData({
                    url: result.data[0] && result.data[0].codeUrl || ''
                })
            }
            wx.hideLoading()
        })
    }
})