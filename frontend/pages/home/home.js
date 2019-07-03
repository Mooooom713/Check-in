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

  _getClassInfo(data) {
    const { user_id, role } = data
    wx.request({
      url: `https://zwtbis.applinzi.com/myCourse?user_id=${user_id}&role=${role}`,
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
    const { role } = app.globalData.userInfo;
    app.globalData.classInfo = e.detail;
    if (role === 'teacher') {
      this.setData({
        noteText: '确认上传位置信息？'
      })
      this.Modal.showModal();
    } else if (role === 'student') {
      this.handleStudentSignIn(role);
    }
  },

  handleStudentSignIn(role) {
    const { user_id, user_name } = app.globalData.userInfo;
    const course_id = app.globalData.classInfo.classId;
    wx.getLocation({
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        const studentSignInInfo = { role, user_id, user_name, course_id, latitude, longitude };
        this.snedWs(JSON.stringify(studentSignInInfo));
      },
      fail: function (e) {
        wx.showToast({
          title: '无法获取位置信息',
          icon: 'none'
        })
      }
    })
  },

  snedWs(studentSignInInfo) {
    let socketTask = wx.connectSocket({
      url: 'wss://zwtbis.applinzi.com',
      header: {
        'content-type': 'application/json'
      },
      protocols: ['protocol1'],
      method: "GET"
    })

    socketTask.onOpen(function () {
      socketTask.send({
        data: studentSignInInfo,
        fail: function () {
          wx.showToast({
            title: '无法获取位置信息',
            icon: 'none'
          })
        }
      })
    })

    socketTask.onMessage(function (res) {
      if (res.data === "invalid data") {
        console.log("无效数据");
      } else if (res.data === "no") {
        wx.showToast({
          title: '这节课还未发起签到',
          icon: 'none'
        })
      } else if (res.data === "duplicate") {
        wx.showToast({
          title: '你已经签到过了',
          icon: 'none'
        })
      } else if (res.data === "ok") {
        wx.showToast({
          title: '签到成功',
          icon: 'success'
        })
      }
      socketTask.close();
    })
  },

  _cancelEvent() {
    this.Modal.hideModal()
  },

  _confirmEvent() {
    wx.navigateTo({
      url: '/pages/home/checkin/checkin'
    })
  }
})
