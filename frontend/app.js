const Promise = require('utils/promise.js');

App({
  getCode: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          wx.request({
            url: 'https://zwtbis.applinzi.com/login',
            data: JSON.stringify({
              jscode: res.code
            }),
            method: 'POST',
            success: res => {
              if (res.statusCode === 500) {
                resolve('error');
              } else if (res.statusCode === 404) {
                resolve('no');
              } else {
                resolve(res);
              }
            },
            fail: error => {
              if (error.errMsg === 'request:fail ') {
                resolve('error');
              }
            }
          })
        },
        fail: () => {
          reject();
        }
      })
    })
  },

  globalData: {
    userInfo: null
  }
})