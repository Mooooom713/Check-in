const app = getApp();

Page({
  data: {
    noteText: '',
    isShow: false,
    classItems: [],
    cardIsShow: false,
    cardButtonText: ''
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
        app.globalData.userInfo = res.data
        this._getClassInfo(res.data)
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
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo) {
     this._getClassInfo(app.globalData.userInfo)
    }
  },

  _getClassInfo (data) {
    const { user_id, role } = data
    wx.request({
      url:`https://zwtbis.applinzi.com/myCourse?user_id=${user_id}&role=${role}`,
      method: 'GET',
      success: (res) => {
        console.log(res);
        this.setData({
          isShow: true,
          classItems: res.data,
          cardIsShow: role === 'teacher' ? true : false,
          cardButtonText: role === 'teacher' ? '发起签到' : '确认签到'
        })
      },
      fail: (e) => {
        console.log(e)
      }
    })
  },

  _handleSignIn() {
    const { user_id, role } = this.data
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
