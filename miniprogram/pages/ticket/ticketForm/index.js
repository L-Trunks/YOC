//index.js
const app = getApp()
const db = wx.cloud.database()
import { formatDateTime, dateTimeStamp } from '../../../util/util'
Page({
    data: {
        isCheck: false,
        id: ''
    },

    onLoad: function(option) {
        this.setData({
            id: option.id && option.id || ''
        })
        let now = new Date()
        let end = +now + 1000 * 60 * 60 * 24 * 365 * 99
        this.setData({
            nowDate: formatDateTime(now, 'yy-mm-dd'),
            goDate: '选择时间',
            endDate: formatDateTime(end, 'yy-mm-dd'),
        })
    },
    onShow: function() {

    },
    //时间选择改变事件
    bindGoDateChange: function(e) {
        this.setData({
            goDate: e.detail.value
        })
    },
    formSubmit(e) {
        console.log(e)
        let _this = this
        let data = e.detail.value || {}
        if (!data.name || !data.phone || !data.hotelAddress || _this.data.goDate === '选择时间' || !_this.data.goDate) {
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
                data: {...data, goDate: _this.data.goDate  }
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