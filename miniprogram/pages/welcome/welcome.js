// pages/welcome/welcome.js
const app = getApp();
const page_consts = require("../page_contants.js");
Page({

  /**
   * Page initial data
   */
  data: {
    indicatorDots: false,
    interval: 3000,
    duration: 500,
    imgUrls: [
      page_consts.BACKGROUND_URL
    ],
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    app.globalData.eventsDb = false
    var that = this

    that.sorting()

    //是否本地有此人
    var user_id = wx.getStorageSync('user_id')
    //console.log('user_id', user_id)
    //有，跳主页
    if (user_id.length != 0) {
      //console.log('to index')
      wx.switchTab({
        url: '../index/index',
        success: function (res) {
          //console.log('s') 
        },
        fail: function(res) {console.log('f')},
        // complete: function(res) {},
      })
      that.setData({ authorized: true })
    } else {
      wx.cloud.callFunction({
        name: 'userExist',
        fail: function(err){
          console.log(err)
        },
        complete: function (res) {
          console.log('首页是否有此人',res)
          app.globalData.userInfo = res.result.data[0]
          if (res.result.data[0]._openid.length != 0) {
            //console.log('to index')
            wx.switchTab({
              url: '../index/index',
              success: function (res) { },
              fail: function (res) { console.log('f') },
            })
            that.setData({ authorized: true })
            app.globalData.authorized = true
            wx.setStorageSync('user_id', app.globalData.userInfo._id)            
          }
          else {
            //没有，出现登录按钮
            //console.log('stay')
            that.setData({ authorized: false })
            app.globalData.authorized = false
          }
        }
      })
    }      
  },

  //进入主页
  // toIndex: function(){
  //   wx.switchTab({
  //     url: '../index/index',
  //     success: function (res) { console.log('s') },
  //     fail: function (res) { console.log('f') },
  // },

  //登录open-type
  onGotUserInfo: function (res) {
    let that = this
    const db = wx.cloud.database()
    var userInfo = res.detail.userInfo
    //console.log('onGotUserInfo res', userInfo)
    if (userInfo == undefined){
      that.bindClickEvent()
    }
    else{
      
      wx.showLoading({
        title: '登录中',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)

      //登录
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          //console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openid = res.result.openid
          userInfo = {
            ...userInfo,
            //openid: app.globalData.openid,
            //avatarUrl: app.globalData.avatarID,
            eventList: [],
            fav: [],
            grade: "",
            schoolTimes: 0,
            wechatName: "",
            faculty: "",
            organization: "",
            multiIndex: [0, 0, 0],
            haveUnreadComments: false,
            lastReceivedCommentsCount: 0,
            reportStatus: [],
            userAccessLevel: {
              level: 1,
              school:[]
            },
            userPostedCommentIds: [],
            userReceivedAtIds: [],
            userReceivedCommentIds: [],
            userReceivedSystemMessageIds: [],
          };
          //新人加数据库
          db.collection('users').add({
            data: {
              ...userInfo
            }
          }).then(res => {
            //console.log('new user add res',res)
            userInfo = {
              ...userInfo,
              _id: res._id
            }
            app.globalData.userInfo = userInfo
            //console.log('new user added', app.globalData.userInfo)
            // wx.showToast({
            //   title: 'Login Success',
            //   duration: 2000
            // })
            that.setData({
              authorized: true,
            });
            app.globalData.authorized = true
            wx.setStorageSync('user_id', app.globalData.userInfo._id)
            wx.switchTab({
              url: '../index/index',
              success: function (res) { },
              // fail: function(res) {},
              // complete: function(res) {},
            })

          }).catch(console.error)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })

    }
  },

  //排序20条Queen's
  sorting: function (value) {
    wx.cloud.callFunction({
      name: 'ordering',
      data: {
        option: 0,
        organization: 'Queen’s University '
      },
      complete: res => {
        //var reslen = res.result.data.length - 1
        //console.log("comment.postBy",res.result.data[reslen].comments[0].postBy)
        this.setData({
          events: res.result.data
        })
        //console.log('[sort成功]', res)
      }
    })
  },

  bindClickEvent: function(){
    var that = this
    var userInfo = {}
    const db = wx.cloud.database()

    wx.showModal({
      title: '请点击上方 Log in 授权头像昵称',
      content: '阅帖、发帖、评论等高级权限，需要授权头像与昵称~',
      showCancel: false,
      fail(){
        console.log('shouquan fail')
      },
      success(res) {
        //console.log('confirm nickname', res)
        if (res.confirm) {
          // get UserInfo
          //console.log('queding')
        }
      }
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})