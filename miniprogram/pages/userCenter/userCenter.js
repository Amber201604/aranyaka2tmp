const app = getApp();
const page_consts = require("./../../userEventPage.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // userInfo: undefined,
    // ready: true,   
    // indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    imgUrls: [page_consts.BACKGROUND_URL],
    sliderIdx: 0,
    haveNewMention: false,
    newMsgCount: 0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this
    that.setData({ 
      authorized: app.globalData.authorized,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      isAdmin: app.globalData.userInfo.isAdmin,
      isSchoolAdmin: app.globalData.userInfo.isSchoolAdmin,
      })
    if (app.globalData.authorized){
      //console.log('userCenter globalData', app.globalData.userInfo._id)
      const db = wx.cloud.database();
      if (app.globalData.userInfo._id) {
        that.setData({
          userInfo: app.globalData.userInfo,
          ready: true
        })
        //console.log(userInfo);
        var userInfo_id = wx.getStorageSync('user_id')
        
        db.collection("users").doc(userInfo_id).watch({
          onChange: function(snapshot) {
            //console.log(snapshot);
            let curDoc = snapshot.docs[0];
            if (curDoc.haveUnreadComments) {
              that.setData({
                haveNewMention: true
              })
            }
            if (curDoc.haveUnreadSysMsg){
              app.globalData.haveUnreadSysMsg = true
            }

            that.setData({
              userInfo: curDoc,
              ready: true,
            })
            app.globalData.userInfo = curDoc;
            app.globalData.userInfo.isAdmin = app.globalData.userInfo.userAccessLevel.level > 2
            app.globalData.userInfo.isSchoolAdmin = (app.globalData.userInfo.userAccessLevel.level > 2) || (app.globalData.userInfo.userAccessLevel.school == app.globalData.userInfo.organization)
            wx.setStorage({
              key: 'userInfo',
              data: curDoc,
            })
            
            //console.log('change this data of userInfo in userCenter')

          },
          onError: function(err) {
            console.error(err)
          }
        })
      }
    }  
  },
  onJumpToHelp: function (event) {
    wx.navigateTo({
      url: '../help/help',
    })
  },
  onJumpToContact: function (event) {
    wx.navigateTo({
      url: '../contact/contact',
    })
  },
  onJumpToAbout: function (event) {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  myEvent: function () {
    wx.navigateTo({
      url: '../myEvent/myEvent',
      success: ((res) => {
        res.eventChannel.emit('NAV_TO_MY_EVENTS_EVENT', {
          data: app.globalData.userInfo.userPostedCommentIds
        })
      }).bind(this)
    })
  },

  toAdminPanel: function () {
    wx.navigateTo({
      url: '../adminPanel/adminPanel',
      success: ((res) => {
        res.eventChannel.emit('NAV_TO_ADMIN_PANEL_EVENT', {
          userAccessLevel: this.data.userInfo.userAccessLevel
        })
      }).bind(this)
    })
  },

  myReplies: function () {
    var userInfo_id = wx.getStorageSync('user_id');
    let db = wx.cloud.database();
    this.setData({
      haveNewMention: false
    })
    wx.navigateTo({
      url: '../myPosts/myPosts',
      success: ((res) => {
        res.eventChannel.emit('NAV_TO_MY_POST_EVENT', {
          data: app.globalData.userInfo.eventList
        })
      }).bind(this)
    })
    db.collection('users').doc(userInfo_id).update({
      data: {
        haveUnreadComments: false
      }
    })
  },

  topEvent: function(){
    app.globalData.topEvent = 'topEvents'
    wx.navigateTo({
      url: '../forum/forum',
      success: function(res) {
        //console.log(res)
        
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  topSchoolEvent: function () {
    app.globalData.topEvent = 'topSchoolEvents'
    wx.navigateTo({
      url: '../forum/forum',
      success: function (res) {
        //console.log(res)

      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成  
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.onLoad()
    // if (this.data.userInfo != app.globalData.userInfo) {
    //   console.log('reload userCenter')
    //   wx.reLaunch({
    //     url: '../userCenter/userCenter',
    //   })
    // }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  onEditProfile: function() {
    wx.navigateTo({
      url: '../profile/profile',
    })
  },
})