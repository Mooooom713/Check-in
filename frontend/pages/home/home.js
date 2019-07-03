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

  _handleSignIn(e) {
    const {  role } =app.globalData.userInfo
    app.globalData.classInfo = e.detail
    console.log(app.globalData)
    if(role === 'teacher'){
      this.setData({
        noteText: '确认上传位置信息？'
      })
      this.Modal.showModal()
    }
  },

  _cancelEvent () {
    this.Modal.hideModal()
  },

  _confirmEvent () {
    wx.navigateTo({
      url: '/pages/home/checkin/checkin'
    })
  }
})
