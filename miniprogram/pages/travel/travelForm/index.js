//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    isCheck: false,
    id:''
  },

  onLoad: function (option) {
    this.setData({
      id: option.id && option.id || ''
    })
  },
  onShow: function () {

  },
  formSubmit(e) {
    console.log(e)
    let _this = this
    let data = e.detail.value || {}
    data = {
      ...data,
      isStudent: this.data.isCheck ? '是' : '否',
      type: 1
    }
    db.collection('hz_user')
      .add({
        data: { ...data }
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
              url: `../travelCode/index?id=${_this.data.id}`
            })
          })
        }
      })
  },
  changeStatus() {
    this.setData({
      isCheck: !this.data.isCheck
    })
  }

})
