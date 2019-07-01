//获取应用实例
const app = getApp()

Page({
  data: {
    hasNumber: false,
    noteText: ''
  },
  onReady: function (){
    this.Modal = this.selectComponent(".modal"); 
  },
  onShow: function () {
    if(app.globalData.hasNumber){
      this.setData({
        hasNumber: true
      })
    }
  },
  _handleSignIn () {
    wx.getLocation({
      success: function (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log(latitude,longitude)
      },
      fail: function (e) {
        console.log(e)
      }
    })
  }
})
