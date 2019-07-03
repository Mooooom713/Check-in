// common/component/modal.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    className: {
      type: String,
      value: '毛概'
    },

    classId: {
      type: String,
      value:  '0001'
    },

    time: {
      type: String,
      value: '周三 7-8'
    },

    isShow: {
      type: Boolean,
      value: false
    },

    number: {
      type: Number,
      value: 60
    },

    buttonText: {
      type: String,
      value: '确认签到'
    }


  },

  /**
   * 组件的初始数据
   */
  data: {

  },


  ready: function () {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _handleSignIn () {
      this.triggerEvent('handleSignIn', {
        classId: this.data.classId,
        number: this.data.number
      })
    }

  }
})