const app = getApp();

Page({
  data: {
    time: 60,
    people: 0,
    signPeople: 0,
    signItems: [],
    isClose: false
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
    this._handleNavBack()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this._handleNavBack()
  },

  _handleNavBack () {
    const  { isClose } = this.data
    if(!isClose){
      try{
        wx.closeSocket()
        wx.onSocketClose(function(res) {
          console.log('WebSocket 已关闭！')
        })
      } catch (e) {
        console.log(e)
      }
    }
  },

  _getLocationInfo (latitude, longitude) {
    var that = this
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
          wx.onSocketMessage(that._handleMessage.bind(that))
        }
      })
    })
  },

  _closeWS () {
    console.log('join')
    try{
      wx.closeSocket()
      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
        this.setData({
          isClose: true
        })
      })
    }catch (e){
     console.log('WebSocket断开异常')
    }
  },

  _handleMessage (res) {
    console.log(res)
    let data = res.data
    if(data !== 'ok'){
      try {
        let  { signPeople, signItems } = this.data
        data = JSON.parse(data)
        signPeople++
        signItems.push(data)
        this.setData({
          signPeople,
          signItems
        })
      }catch(e){
        wx.showToast({
          title: '数据解析失败',
          icon: 'none'
        })
      }
    }
  }
})
