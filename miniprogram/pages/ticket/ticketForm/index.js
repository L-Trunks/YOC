//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        isCheck: false,
        id: ''
    },

    onLoad: function(option) {
        this.setData({
            id: option.id && option.id || ''
        })
    },
    onShow: function() {

    },
    formSubmit(e) {
        console.log(e)
        let _this = this
        let data = e.detail.value || {}
        if (!data.name || !data.phone || !data.hotelAddress) {
            wx.showToast({
                title: '请将信息填写完整',
                icon: 'none'
            })
            return
        }
        data = {
            ...data,
            isStudent: this.data.isCheck ? '是' : '否',
            type: 2
        }
        db.collection('hz_user')
            .add({
                data: {...data }
            }).then(res => {
                console.log(res)
                if (res._id) {
                    wx.showToast({
                        title: '提交成功，请您扫码入群~',
                        icon: 'none',
                        image: '',
                        duration: 1500,
                        mask: false,
                    });
                    setTimeout(() => {
                        wx.navigateTo({
                            url: `../ticketCode/index?id=${_this.data.id}`
                        })
                    }, 1000)
                }
            })
    },
    changeStatus() {
        this.setData({
            isCheck: !this.data.isCheck
        })
    }

})