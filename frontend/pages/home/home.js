const app = getApp();

Page({
  data: {
    noteText: '',
    isShow: false
  },

  onLoad: function () {
    var that = this;
    wx.showLoading({
      mask: true
    });
    app.getCode().then((res) => {
      if (res === 'error') {
        wx.showToast({
          title: '登陆失败',
          icon: 'none'
        })
      } else if (res === 'no') {
        // 该openid未绑定过
        wx.hideLoading();
      } else {
        // 已绑定，直接登录
        that.setData({
          isShow: true
        })
        app.globalData.userInfo = res
        wx.hideLoading();
      }
    }).catch(() => {
      wx.showToast({
        title: '登陆失败',
        icon: 'none'
      })
    })
  },

  onReady: function () {
    this.Modal = this.selectComponent(".modal");
  },

  onShow: function () {
    if (this.data.isShow) {
      console.log('请求一次');
    }
  },

  _handleSignIn() {
    wx.getLocation({
      success: function (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log(latitude, longitude)
      },
      fail: function (e) {
        wx.showToast({
          title: '无法获取位置信息',
          icon: 'none'
        })
      }
    })
  }
})
