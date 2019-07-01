//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasNumber: false,
    roleLabel: '',
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
    ]
  },
  onLoad: function () {
    console.log(app.globalData.userInfo)
    this.setData({
      userInfo: app.globalData.userInfo
    })
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
    this.Modal.showModal();
  },

  /**
   * 点击radio
   */
  _radioChange(e) {
    const { items } = this.data;
    const value = e.detail.value;
    // items.forEach(element => {
    //   if(element.name === value){
    //     console.log(value)
    //     !element.checked
    //   }
    // });
  },

  _handleSaveNumber(e) {
    const value = e.detail.value;
  }
})