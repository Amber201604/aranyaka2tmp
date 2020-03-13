// miniprogram/pages/eventDetails/eventDetails.js
const app = getApp();
const db = wx.cloud.database()
const page_consts = require("../page_contants.js");
const helpers = require("../../utilities/helpers.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //imgListUrls: app.globalData.tmpImgList,
    indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    imgUrls: [page_consts.BACKGROUND_URL],
    sliderIdx: 0,
    wxidSuccessDialogButton: [{ text: "好的" }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let eventChannel = this.getOpenerEventChannel()
    const that = this
    that.setData({
      isSchoolAdmin: app.globalData.userInfo.isSchoolAdmin,
    })
    //console.log('isSchooladmin', that.data.isSchoolAdmin)
    eventChannel.on('event', function(data) {
      const data1 = data.data;
      app.globalData.eventid = data1._id
      app.globalData.eventData = data1
      //console.log('data.data',data1)
      if(data1.cate[1]=='入局'){
        
        that.setData({
          jutie: true
        })
        //console.log('jutie',that.data.jutie)
      }else{
        that.setData({
          jutie: false
        })
        //console.log('jutie', that.data.jutie)
      }
      that.setData({
        ...data.data,
        indexonindex: data.indexonindex,
        disabled: data1.userList.length >= data1.maxUser,
        eventsDb: data.eventsDb,
        canRequireHolderWxid: app.globalData.userInfo._openid !== data.data._openid
      })
      //console.log('eventDetails onload',that.data)

      
      
      // 监听 暂不新回复，只听入局成员
      //console.log('ed id',data._id);
      // const doc = wx.cloud.database().collection(that.data.eventsDb).doc(that.data._id);
      // doc.watch({
      //   onChange: (res) => {
      //     const updatedEvent = res.docs[0];
      //     app.globalData.eventData = updatedEvent
      //     that.setData({
      //       //event: updatedEvent,
      //       //json: JSON.stringify(updatedEvent),
      //       //comments: updatedEvent.comments,
      //       //juqi: updatedEvent.comments.length,
      //       userList: updatedEvent.userList,
      //       //commLen: updatedEvent.comments.length,
      //       disabled: updatedEvent.userList.length >= updatedEvent.maxUser
      //     })
      //     data1.userList = updatedEvent.userList
      //   },
      //   onError: (reason) => {
      //     console.error(reason)
      //   }
      // })
      
    //发起人昵称头像
      //console.log(app.globalData.eventCreatorOPENID)
    db.collection('users').where({
      _openid: data1._openid
    }).get({
      success: function(res){
        //console.log("creator_nickName", res.data)
      that.setData({
        creator_nickName: res.data[0].nickName,
        creator_avatar: res.data[0].avatarUrl
      })
      }
    })


    const _ = db.command
    //调入局成员头像 
    var tmp_avatars = []
    db.collection('users').where({
      _openid: _.in(data1.userList)
    }).get({success: function(res) {
      //console.log('onshow',res.data)
      for (let j = 0; j < res.data.length; j++) {
        tmp_avatars.push(res.data[j].avatarUrl)
      }
      that.setData({
        tmp_avatars: tmp_avatars,
      })
      //console.log('tmp_userlist order', that.data.tmp_avatars)
    }
    })
    //that.sleep(300)

      
    //调改回复人头像昵称
    // console.log('that data comments',that.data.comments)
    // wx.cloud.callFunction({
    //   name: 'reviseResponsor',
    //   data: {
    //     comments: app.globalData.eventData.comments,
    //   },
    //   complete: res =>{
    //     console.log('reviseResponsor', res)
    //     that.setData({
    //       comments: res.result.newComments
    //     })
    //   }
    // })

      //删除，修改键是否可见
    if (app.globalData.userInfo._openid == data1._openid) {
      that.setData({ 
        isCreator: true 
      })
    } else {
      that.setData({ 
        isCreator: false 
      })
    }
    //wx.stopPullDownRefresh()

    })
  },

  //点击头像，查看详情
  userDetail: function(e){

  },

  onPullDownRefresh: function () {
    var that = this
    //console.log('refresh')
    // that.setData({
    //   currentTab: 0 //当前页的一些初始数据，视业务需求而定
    // })
    this.onLoad() //重新加载onLoad()
  },

  // 点击显示图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.images // 需要预览的图片http链接列表
    })
  },  

  //删除回复
  // delresp: function(e){
  //   var currIndex = e.currentTarget.dataset.id
  //   let comments = that.data.images
  //   comments.splice(currIndex, 1);
  //   this.setData({
  //     comments: comments
  //   })
  // },


  //提交回复
  formSubmit: function(event) {
    let that = this
    //console.log('回复event',event)
    const comment = event.detail.value.comment;
    const commentData = {
      isNewComment: true,
      data: {
        creatorId: app.globalData.userInfo._id,
        receiverId: that.data.originPostUserDocId,
        discussionContent: comment,
        _eventId: that.data._id,
        discussionIds: [],
        isDeleted: false,
        originPostUserId: that.data.originPostUserDocId,
        _timestamp: new Date(),
        likeUserIds: [],

        avatar: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        comment: comment,
        content: comment,
        eventId: that.data._id,
        juqi: that.data.juqi + 1
      }
    };

    
    wx.showLoading({
      title: "发表中..."
    })

    // check message
    wx.cloud.callFunction({
      name: 'msgCheck',
      data: { content: comment },
      success: function (res) {
        //console.log('content check', res.result.errCode)
        if (res.result.errCode != 0) {
          wx.showToast({
            image: '../index/tear.png',
            title: '包含敏感内容'
          })
        } else { 
          //不能空白回复
          if (!comment) {
            wx.showToast({
              icon: "none",
              title: '请输入内容',
            })
          } else {
            //console.log('new response', that.data.newResponseList)
            //wx.hideLoading()
            helpers.addComment(commentData, 'post', (newId) => {
              let curCommentIds = that.data.commentIds;
              curCommentIds.push(newId)
              that.setData({
                commentIds: curCommentIds,
                juqi: that.data.juqi + 1,
                comment: ""
              })
            });
            wx.hideLoading()
            
          }    
        }
      },
      fail: function(res) {
        wx.showToast({
          icon: 'none',
          title: '文字审核失败'
        })
      }
    })    
  },

  //修改
  revise: function(e){
    var id = this.data._id

  },

  //删除
  delete: function(e){
    let that = this
    app.globalData.deleteEvent = true
    //console.log(e)
    var currIndex = e.currentTarget.dataset.id
    var isadminf = e.currentTarget.dataset.isadmin
    //console.log('id', e)
    //console.log('isadminf', isadminf)

  //备份
    db.collection('event-backup').add({
      data: {
        // in order to get rid of _openid
        isSchoolAdmin: that.data.isSchoolAdmin,
        jutie: that.data.jutie,
        cate: that.data.cate,
        commentIds: that.data.commentIds,
        content: that.data.content,
        createBy: that.data.createBy,
        createTime: that.data.createTime,
        eventDate: that.data.eventDate,
        eventTime: that.data.eventTime,
        images: that.data.iages,
        juqi: that.data.juqi,
        maxUser: that.data.maxUser,
        organization: that.data.organization,
        originPostUserDocId: that.data.originPostUserDocId,
        responseList: that.data.responseList,
        tag: that.data.tag,
        title: that.data.title,
        userList: that.data.userList,
        tmp_avatars: that.data.tmp_avatars,
        creator_avatar: that.data.creator_avatar,
        creator_nickName: that.data.creator_nickName,
      }
    }).then(res2 => {
        console.log('成功备份删除文件',res2)
        //自己删
      if (isadminf == "no") {
        db.collection(that.data.eventsDb).doc(currIndex).remove({
            success: res => {
              wx.navigateBack()
            },
            fail: console.error
          })
        }//管理员删
        else{
          // wx.showModal({
          //   title: '无法发送',
          //   content: '请到个人主页，添加所在学校',
          //   showCancel: false,
          // })
          wx.cloud.callFunction({
            name: 'deleteEvents',
            data: {
              id: currIndex,
            },
            success: function (res) {
              //发送管理员删除消息
              let data1 = {
                receiverId: that.data.originPostUserDocId,
                displayContent: "你的帖子 '"+ that.data.title + "' 因违反小程序内容规范被管理员删除",
                msgType: 'DELETE_EVENT',
                data: {
                  requestorId: app.globalData.userInfo._id
                }
              }
              helpers.createNewSystemMessage(data1, () => {
                console.log("success");
              })
              wx.navigateBack()
            },
            fail: console.error
        })
      }        
    })
    .catch(console.error)
  },

  //入局
  join: function(e){
    // console.log('join id',this.data.event._id)
    // console.log('useropenid',app.globalData.openid)
    const _ = db.command
    let that = this
    var index = that.data.userList.indexOf(app.globalData.openid)
    //console.log('isuser', index)
    
    if (index < 0){
      that.setData({
        disabled: that.data.userList.length + 1 >= that.data.maxUser,
        userList: that.data.userList.concat(app.globalData.openid),
        tmp_avatars: that.data.tmp_avatars.concat(app.globalData.userInfo.avatarUrl),        
      })
        wx.cloud.callFunction({
          name: 'joinEvent',
          data: { 
            id: that.data._id,
            userList: that.data.userList
          },
          success: function (res) {
            //console.log(res.result) 
            //app.globalData.eventsDb == true  
          }
        })
      }else{
        wx.showToast({
          icon: 'none',
          title: '您已加入局',
        })
      }  
  },

  //退局
  quit: function() {
    var that = this
    var userList = that.data.userList
    let quitUserList = userList.filter((ele) => {
      return ele != app.globalData.userInfo._openid
    })
    let tmp_avatars = that.data.tmp_avatars.filter(function(va){
      return va != app.globalData.userInfo.avatarUrl
    })
    // console.log(userList)
    // console.log('quitUserList', quitUserList)
    // console.log('tmp_avatars', tmp_avatars)

    // 无法退局情况
    if (quitUserList.length == userList.length){
      wx.showToast({
        icon: 'none',
        title: '发起人或未入局者无法退局',
      })
    }else{     
      that.setData({
        userList: quitUserList,
        tmp_avatars: tmp_avatars,
        disabled: quitUserList.length >= that.data.maxUser
      })
      // console.log('2',that.data.userList)
      // console.log('2tmp_avatars', that.data.tmp_avatars)
      wx.cloud.callFunction({
        name: 'joinEvent',
        data: {
          id: that.data._id,
          userList: quitUserList
        },
        success: function (res) {
          //console.log("quit", res.result)
        }
      })
    }

  },

  requireHolderWxid: function () {
    //console.log('requireHolderWxidOnTap')
    //console.log(this.data)
    wx.showLoading({
      title: '发送中',
    })
    let data = {
      receiverId: this.data.originPostUserDocId,
      displayContent: app.globalData.userInfo.nickName + '想要获取您的微信号',
      msgType: 'WXID_REQUEST',
      data: {
        requestorId: app.globalData.userInfo._id
      }
    }
    helpers.createNewSystemMessage(data, () => {
      console.log("success");
      let that = this;
      wx.hideLoading()
      wx.showModal({
        title: '已成功发送微信号请求',
        content: '您可以在“我的消息” => “系统消息” 查看对方回复',
        showCancel: false,
      })
    })

  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  sleep: function (numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
        return;
    }
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //console.log('eventDetails onshow')
    //this.setData({ avatarList: this.data.avatarList })
    //var that = this   
    // http get Access token
    // wx.request({
    //   url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx86b49dbb004709ca&secret=71c5b7a5acea2bd99d6aeaa5087b4843',
    //   method: 'GET',
    //   success: function (res) {
    //     console.log('access token', res)
    //     var url0 = 'https://api.weixin.qq.com/wxa/media_check_async?access_token=' + res.data.access_token
    //     var url1 = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + res.data.access_token
    //     that.setData({
    //       access_token: res.data.access_token,
    //       url0: url0,
    //       url1: url1
    //     })
    //   }
    // })
  },

  onHide: function() {
    app.globalData.deleteEvent = true
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //按返回键
    var that = this
    //app.globalData.eventsDb = true
    app.globalData.deleteEvent = true
    //console.log('onunload eventDetails')
    //wx.setStorageSync('tmpEventDetail', that.data)
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