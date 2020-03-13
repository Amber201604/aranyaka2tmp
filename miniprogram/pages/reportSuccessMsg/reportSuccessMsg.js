// pages/reportSuccessMsg/reportSuccessMsg.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad: function(options){
    let that = this;
    let eventChannel = this.getOpenerEventChannel();
    app.globalData.authorized = true;
    eventChannel.on('NAV_TO_SUCCESS_REPORT', (d) => that.setData({...d}))
  },

  onNavBackToPostTap: function() {
    wx.navigateBack({
      delta: 2
    })
  }

})