const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const page_consts = require("../page_contants.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    events: [],
    //avatarUrl: "",
    index0: 0,
    sortingMethod: ["按发起时间", "按活动时间", "按局气"],
    navList: [
      { id: "0", title: "全部" },
      { id: "1", title: "入局" },
      { id: "2", title: "阅帖" },
      { id: "3", title: "旅行" },
      { id: "4", title: "公告" },
      { id: "5", title: "租房" },
      { id: "6", title: "招聘" },
      { id: "7", title: "学习" },
      { id: "8", title: "买卖" },
      { id: "9", title: "招领" },
      { id: "10", title: "拼单" },
      { id: "11", title: "其它" },
    ],
    indicatorDots: false,
    interval: 3000,
    duration: 500,
    imgUrls: [page_consts.BACKGROUND_URL],
    sliderIdx: 0,
    topEvents: [],
    topSchoolEvents: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //change db
    // wx.cloud.callFunction({
    //   name:'addField',
    //   success: function(res){
    //     console.log(res)
    //   },
    //   fail: err =>{
    //     console.log(err)
    //   }
    // })

    //console.log('index onload')
    app.globalData.eventsDb = false
    app.globalData.deleteEvent = false
    app.globalData.authorized = true
    var that = this
    
    //避免客户端删除本地缓存，数据库还存有数据的情况
    wx.cloud.callFunction({
      name:'userExist',
      success: function(res){
     
        //console.log('首页是否有此人',res.result.data[0])
        app.globalData.userInfo = res.result.data[0]
        app.globalData.userInfo.isAdmin = app.globalData.userInfo.userAccessLevel.level > 2
        app.globalData.userInfo.isSchoolAdmin = (app.globalData.userInfo.userAccessLevel.level > 2) || (app.globalData.userInfo.userAccessLevel.school == app.globalData.userInfo.organization)
        // console.log('isschooladmin0', app.globalData.userInfo.userAccessLevel.school == app.globalData.userInfo.organization)
        // console.log('isschooladmin', app.globalData.userInfo.userAccessLevel.school)
        // console.log('isschooladmin2', app.globalData.userInfo.isSchoolAdmin)
    
   
      //一定是非首次，首次注册在welcome.js
        if (app.globalData.userInfo._openid.length != 0){
          //console.log('old userInfo', app.globalData.userInfo)
          app.globalData.topEvent = "events"

          that.setData({ authorized: true, organization: app.globalData.userInfo.organization })
          app.globalData.authorized = true
          wx.setStorageSync('organization', app.globalData.userInfo.organization)
          wx.setStorageSync('user_id', app.globalData.userInfo._id)
          //刷新置顶帖
          wx.cloud.callFunction({
            name: 'getAlltoAll',
            data: {
              dbName: 'topEvents',
            },
            complete: res => {
              //console.log('getAll res', res)
              that.setData({
                topEvents: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
              })
            }
          })
          //刷新学校置顶帖
          wx.cloud.callFunction({
            name: 'getAll',
            data: {
              dbName: 'topSchoolEvents',
              organization: app.globalData.userInfo.organization
            },
            success: res => {
              //console.log('getAll res', res)
              that.setData({
                topSchoolEvents: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
              })
            },
            fail: console.error
          })
          //刷新普通帖
          wx.cloud.callFunction({
            name: 'getAll',
            data: {
              dbName: 'events',
              organization: app.globalData.userInfo.organization
            },
            success: res => {
              //console.log('getAll res', res)
              that.setData({
                events: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
              })
            },
            fail: err => {
              console.log(err)
            }
          })


          //无本地学校储存
          if (wx.getStorageSync('organization').length == 0) {         
            wx.showModal({
              title: '请修改【学校】',
              content: '欢迎来到森林书！需要修改学校才能到达自己学校的论坛哦！',
              showCancel: false,
              success (res) {
                wx.navigateTo({
                  url: '../profile/profile',
                })
              }
            })
            
          }
          app.globalData.openid = app.globalData.userInfo._openid
          
        
        }//welcome登录失败
        else{
          wx.showModal({
            title: '登录失败',
            content: '请删除小程序后，再次登录',
          })
        }
      }  
    })
  },


  //详情
  bindClickEvent: function (e) {
    //console.log("e.target", e.target)
    var that = this
    let index = this.data.events.findIndex(item => item._id === e.target.dataset.id);
    that.setData({
      indexonindex: index
    })
    //console.log('index', index)
    if (index >= 0) {
      wx.navigateTo({
        url: '../eventDetails/eventDetails',
        success: (res) => {
          //console.log('rs', res)
          //console.log('emit', index)
          res.eventChannel.emit('event', {
            data: that.data.events[index],
            indexonindex: index,
            eventsDb: 'events'
          })
        }
      })
    }
  },

  bindClickTopEvent: function (e) {
    //console.log("e.target", e.target)
    var that = this
    let index = this.data.topEvents.findIndex(item => item._id === e.target.dataset.id);
    that.setData({
      indexonindex: index
    })
    //console.log('index', index)
    if (index >= 0) {
      wx.navigateTo({
        url: '../eventDetails/eventDetails',
        success: (res) => {
          //console.log('rs', res)
          //console.log('emit', index)
          res.eventChannel.emit('event', {
            data: that.data.topEvents[index],
            indexonindex: index,
            eventsDb: 'topEvents'
          })
        }
      })
    }
  },

  bindClickTopSchoolEvent: function (e) {
    //console.log("e.target", e.target)
    var that = this
    let index = this.data.topSchoolEvents.findIndex(item => item._id === e.target.dataset.id);
    that.setData({
      indexonindex: index
    })
    //console.log('index', index)
    if (index >= 0) {
      wx.navigateTo({
        url: '../eventDetails/eventDetails',
        success: (res) => {
          //console.log('rs', res)
          //console.log('emit', index)
          res.eventChannel.emit('event', {
            data: that.data.topSchoolEvents[index],
            indexonindex: index,
            eventsDb: 'topSchoolEvents'
          })
        }
      })
    }
  },


  onPullDownRefresh: function () {
    var that = this
    console.log('refresh')
    wx.cloud.callFunction({
      name: 'getAll',
      data: {
        dbName: 'events',
        organization: app.globalData.userInfo.organization
      },
      complete: res => {
        //console.log('getAll res', res)
        that.setData({
          events: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
        })
      }
    })
  },

  //登录等候-bindtap
  setLoading: function () {
    this.setData({
      loading: true
    });
  },
  

  //搜索框文本内容显示
  inputBind: function (event) {
    this.setData({
      inputValue: event.detail.value
    })
    //console.log('bindInput' + this.data.inputValue)
  },

  //搜索后端
  query: function (e) {
    var i = this.data.inputValue   //获取输入框输入内容
    //console.log(i)
    wx.cloud.callFunction({
      name: 'searchAll',
      data: {
        keyword: i,
        organization: wx.getStorageSync('organization')
      },
      success: res => {
        //console.log('[云函数] [search]: ', res)
        if (!this.data.inputValue) {
          //没有搜索词 友情提示
          wx.showToast({
            title: '请重新输入',
            image: 'tear.png',
            duration: 2000,
          })
        } else if (res.result.data.length == 0) {
          //搜索词不存在 友情提示
          wx.showToast({
            title: '关键词不存在',
            image: 'tear.png',
            duration: 2000,
          })
        }
        this.setData({
          events: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
          //inputValue: ""
        })
        
      }
    })
  },

  //排序选择
  bindPickerChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index0: e.detail.value
    })
    wx.setStorageSync('ordering', e.detail.value)
    this.sortingHuancun(e.detail.value)
  },

  sortingHuancun: function(v) {
    var that = this
    var sortedEvents
    if (v == 0){      
      sortedEvents = that.data.events.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
      console.log('v', sortedEvents)
      that.setData({events: sortedEvents})
    } else if(v == 1){
      sortedEvents = that.data.events.sort((a, b) => (a.eventDate > b.eventDate) ? 1 : -1)
      console.log('v', sortedEvents)
      that.setData({ events: sortedEvents })
    } else if (v ==2){
      sortedEvents = that.data.events.sort((a, b) => (a.juqi < b.juqi) ? 1 : -1)
      console.log('v', sortedEvents)
      that.setData({ events: sortedEvents })
    }
  },


  //排序后端
  sorting: function (value) {
    wx.cloud.callFunction({
      name: 'ordering',
      data: {
        option: value,
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

  // 筛选标签后端
  filter: function (e) {
    var that = this;
    var index = e.currentTarget.id;
    //console.log('index', e)
    var title = that.data.navList[index].title;
    //console.log('title',title)
    wx.setStorageSync("tagBigTitle", title)

    // if (title == '...') {
    //   wx.navigateTo({
    //     url: 'search',
    //     success: function (res) { console.log("search", res) },
    //   })
    // }

    wx.cloud.callFunction({
      name: 'filterAll',
      data: {
        title: title,
        organization: wx.getStorageSync('organization')
      },
      complete: res => {
        //console.log('one filter', res)
        this.setData({
          events: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
        })
        
        if (res.result.data.length == 0) {
          //搜索词不存在 友情提示
          wx.showToast({
            title: '关键词不存在',
            image: 'tear.png',
            duration: 2000,
          })
        }
      }
    })
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    //console.log('index onready')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {   
    let eventChannel = this.getOpenerEventChannel()
    var that = this
    //app.globalData.topEvent == 'events'
    //console.log('index onshow')
    //删帖和添加时，不需要更新帖eventchannel
    //刷新置顶帖
    wx.cloud.callFunction({
      name: 'getAlltoAll',
      data: {
        dbName: 'topEvents',
      },
      complete: res => {
        //console.log('getAll res', res)
        that.setData({
          topEvents: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
        })
      }
    })
    //刷新学校置顶帖
    wx.cloud.callFunction({
      name: 'getAll',
      data: {
        dbName: 'topSchoolEvents',
        organization: app.globalData.userInfo.organization
      },
      success: res => {
        //console.log('getAll res', res)
        that.setData({
          topSchoolEvents: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
        })
      },
      fail: console.error
    })
    //刷新普通帖
    wx.cloud.callFunction({
      name: 'getAll',
      data: {
        dbName: 'events',
        organization: app.globalData.userInfo.organization
      },
      success: res => {
        //console.log('getAll res', res)
        that.setData({
          events: res.result.data.sort((a, b) => (a.createTime < b.createTime) ? 1 : -1)
        })
      },
      fail: err => {
        console.log(err)
      }
    })
    app.globalData.deleteEvent = false
    app.globalData.eventsDb = false
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

  }
})