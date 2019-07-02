//获取应用实例
const app = getApp()

Page({
  data: {
    hasNumber: false,
    roleLabel: '',
    user_id: '',
    user_name: '尊敬的用户',
    role: '',
    items: [
      {
        name: 'teacher',
        value: '教师',
        checked: false
      },
      {
        name: 'student',
        value: '学生',
        checked: false
      }
    ],
    postRole: '',
    postId: ''
  },
  onLoad: function () {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.Modal = this.selectComponent(".modal");
  },

  onShow: function () {
    // if(app.globalData.userInfo){
    //   const { role, user_id, user_name } = app.globalData.userInfo
    //   this.setData({
    //     role,
    //     user_id,
    //     user_name
    //   })
    // }

    if (app.globalData.userInfo) {
      const { role } = app.globalData.userInfo
      if (role === 'student') {
        this.setData({
          hasNumber: true,
          roleLabel: '学号',
          ...app.globalData.userInfo
        })
      } else {
        this.setData({
          hasNumber: true,
          roleLabel: '工号',
          ...app.globalData.userInfo
        })
      }
    }
  },

  /**
   * 点击完善信息button
   */
  _handleInfo() {
    if (app.globalData.code) {
      this.Modal.showModal();
    } else {
      wx.showToast({
        text: '微信登录失败',
        icon: 'none'
      })
    }
  },

  /**
   * 点击radio
   */
  _radioChange(e) {
    const role = e.detail.value;
    this.setData({
      postRole: role
    })
    console.log(role)
  },

  _handleSaveNumber(e) {
    const id = e.detail.value;
    this.setData({
      postId: id
    })
  },

  _cancelEvent() {
    this.Modal.hideModal()
    this.setData({
      postRole: '',
      postId: ''
    })
  },

  _confirmEvent() {
    const { postRole, postId } = this.data;
    wx.request({
      url: 'https://zwtbis.applinzi.com/bind',
      data: JSON.stringify({
        jscode: app.globalData.code,
        user_id: postId,
        role: postRole
      }),
      method: 'POST',
      success: (res) => {
        if (res.statusCode >= 500) {
          wx.showToast({
            title: '服务器开小差了~',
            icon: 'none'
          })
        } else if (res.statusCode === 404) {
          wx.showToast({
            title: '该账号不存在',
            icon: 'none'
          })
        } else {
          app.globalData.userInfo = res.data
          const { role, user_id, user_name } = res.data
          this.setData({
            user_id,
            user_name,
            role,
            postRole: '',
            postId: '',
            hasNumber: true,
            roleLabel: role === 'teacher' ? '工号' : '学号'
          })
          this.Modal.hideModal()
        }
      },
      fail: (e) => {
        console.log(e.statusCode)
      }
    })
  }
})