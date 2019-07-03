const app = getApp();

Page({
  data: {
    time: 60,
    people: 0,
    signPeople: 0
  },

  onLoad: function () {

  },

  onReady: function () {
 
  },

  onShow: function () {
    const { number } = app.globalData.classInfo
    this.setData({
      people: number
    })
    wx.getLocation({
      success:  (res) => {
        const  latitude = res.latitude
        const  longitude = res.longitude
        this._getLocationInfo(latitude, longitude)
      },
      fail: function (e) {
        wx.showToast({
          title: '无法获取位置信息',
          icon: 'none'
        })
      }
    })
    this.timer = null;
    this.timer = setInterval(() => {
      let  time = this.data.time
     if(time >  0){
       time--
      this.setData({
        time
      })
     }else{
       clearInterval(this.timer)
       this._closeWS()
     }
    }, 1000)
  },

    /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    try{
      wx.closeSocket()
      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
      })
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    try{
      wx.closeSocket()
      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
      })
    } catch (e) {
      console.log(e)
    }
  },

  _getLocationInfo (latitude, longitude) {
    wx.connectSocket({
      url: 'wss://zwtbis.applinzi.com',
      header:{
        'content-type': 'application/json'
      },
      protocols: ['protocol1'],
      method:"GET"
      })

    const   { role }  =  app.globalData.userInfo
    const  { classId } = app.globalData.classInfo
    wx.onSocketOpen(function (res) {
      wx.sendSocketMessage({
        data:  JSON.stringify( {
          role: role,
          course_id: classId,
          latitude,
          longitude
        }),
        success: function (res) {
          console.log("数据已发给服务器")
        }
      })
    })
  },

  _closeWS () {
    console.log('join')
    wx.closeSocket()
    wx.onSocketClose(function(res) {
      console.log('WebSocket 已关闭！')
    })
  }
})
