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
    if(app.globalData.userInfo){
      const { role } = app.globalData.userInfo
      if(role === 'student'){
        this.setData({
          hasNumber: true,
          roleLabel: '学号',
          ...app.globalData.userInfo
        })
      }else{
        this.setData({
          hasNumber: true,
          roleLabel: '工号',
          ...app.globalData.userInfo
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.Modal = this.selectComponent(".modal");
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

  _cancelEvent () {
    this.Modal.hideModal()
    this.setData({
      postRole: '',
      postId: ''
    })
  },

  _confirmEvent () {
    const { postRole, postId } = this.data
    console.log(postRole, postId)
    wx.request({
      url: 'https://zwtbis.applinzi.com/bind',
      data: JSON.stringify({
        jscode: app.globalData.code,
        user_id: postId,
        role: postRole
      }),
      method: 'POST',
      success: (res) => {
        if(res.statusCode >= 500){
          wx.showToast({
            title: '服务器开小差了~',
            icon: 'none'
          })
        }
      },
      fail: (e) => {
        console.log(e.statusCode)
      }
    })
  }
})