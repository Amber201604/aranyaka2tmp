const app = getApp();
const page_consts = require("../page_contants.js");
Page({

  /**
   * 页面的初始数据
   */

  data: {
    title: "",
    eventTime: "",
    eventDate: "",
    content:"",
    cate: ["全部",'入局'],
    cates: ['请选择', '旅行', '公告', '租房', '招聘', '学习','买卖','招领','拼单','其它'],
    tag: "",
    index: 0,
    maxUser: 4,
    tmp_images: [],
    images:[],
    switch1Checked: false,
    delImg: '../../images/del_img.jpg',
    indicatorDots: false,
    autoplay: false,
    loading: false,
    interval: 3000,
    duration: 500,
    imgUrls: [page_consts.BACKGROUND_URL],
    sliderIdx: 0
  },

  //tag多选
  // tags_picker: function() {
  //   wx.navigateTo({
  //     url: '../tags/tags',
  //   })
  // },

  switch1Change: function (e) {
    console.log(e.detail.value)
    //this.onLoad(e.detail.value)
    if (e.detail.value == true) {
      //console.log("yes")
      wx.navigateTo({
        url: '../forum/forum',
      })
    }
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindeTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindMaxUserChange: function (e) {
    this.setData({
      maxUser: e.detail.value
    })
  },
  bindTagChange: function (e){
    //console.log("tag change",e.detail.value)
    this.setData({
      tag: e.detail.value
    })
  },

  bindCateChange: function (e) {
    var currentCate = this.data.cate
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    var newtag = this.data.cates[e.detail.value]
    //console.log('new tag', newtag)
    this.setData({
      cate: currentCate.concat(newtag),
      index: e.detail.value
    })
  },
  bindTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  bindContentChange: function (e) {
    //console.log('content',e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },


  // 预览图片
  previewImg: function (e) {
    var that = this
    wx.previewImage({
      current: that.data.images[e.currentTarget.dataset.id],
      urls: that.data.images,
      // current: that.data.tmp_images[e.currentTarget.dataset.id],
      // urls: that.data.tmp_images,
    })
  },

  // 删除图片
  delImg: function (e) {
    //获取数据绑定的data-id的数据
    var currIndex = e.currentTarget.dataset.id
    //console.log('del id', currIndex)
    let images = this.data.images
    //let tmp_images = this.data.tmp_images
    images.splice(currIndex, 1)
    //tmp_images.splice(currIndex, 1)
    this.setData({
      images: images,
      //tmp_images: tmp_images
    })
    //console.log('del image', this.data.images)
  },

  // 上传图片
  doUpload: function (e) {
    var that = this
    //let context = wx.createCanvasContext('scaleImage')
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        //console.log('img size', res.tempFiles[0])
        // wx.getImageInfo({
        //   src: res.tempFilePaths[0],
        //   success(res) {          
        //     //console.log(res.width)
        //     //console.log(res.height)

        //     context.drawImage(res.tempFilePaths[0], 0, 0, res.width / 100, res.height / 100)
        //     context.draw()
        //   }
        // })

        const filePath = res.tempFilePaths[0]
        if (res.tempFiles[0] && res.tempFiles[0].size > 1024 * 1024) {
          console.log('图片大小不适合')
          wx.showToast({
            title: '图片不能大于1M',
            icon: 'none'
          })
          return;
        } else {
          //console.log('图片大小适合')
          //that.data.tmp_images.push(res.tempFilePaths[0])
          //that.setData({ tmp_images: that.data.tmp_images.concat(res.tempFilePaths[0]) })
          // console.log('tmp_images', that.data.tmp_images)
          //that.cutImg()
          console.log('图片大小适合')
          wx.showLoading({
            title: '上传中',
          })
          that.uploadImg(res.tempFilePaths[0])
        }
      },
      fail (err) {
        console.log(e)
      }
    })
  },

  // cutImg: function(destWidth=100, destHeight=100){
  //   var that = this
  //   wx.canvasToTempFilePath({
  //     destHeight: destHeight,
  //     destWidth: destWidth,
  //     canvasId: 'scaleImage',
  //     quality: '0.2',
  //     fileType: 'jpg',
  //     success: function(res) {
  //       console.log('cutimg', res)
  //       that.uploadImg(res.tempFilePaths[0])
  //     },
  //     fail: function(err){console.log('err', err)}
  //   })

  // },

  uploadImg: function (filePath) {
    // 上传图片  
    var that = this
    var nn = Math.floor((Math.random() * 1000000000000))
    //console.log('nn', nn)
    // var imglen = that.data.tmp_images.length
    // var filePath = that.data.tmp_images[imglen-1] 
    const cloudPath = nn.toString() + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：')

        // app.globalData.fileID = res.fileID
        // app.globalData.cloudPath = cloudPath
        // app.globalData.imagePath = filePath
        var fileID = res.fileID

        wx.getFileSystemManager().readFile({
          // filepath
          filePath: filePath,
          success: buffer => {
            console.log('buffer', buffer)
            that.checkimg(buffer.data, fileID)
          },
          fail: e => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
              duration: 3000
            })
          },
        })
      }
    })
  },

  checkimg: function (buffer, fileID) {
    var that = this
    wx.cloud.callFunction({
      name: 'imgCheck',
      data: { value: buffer },
      success: function (res) {
        console.log('media check')
        if (res.result.errCode == 87014) {
          wx.showToast({
            image: '../index/tear.png',
            title: '包含敏感内容',
            duration: 3000
          })

        } else if (res.result.errCode == 0) {
          //console.log('图片安全')
          wx.hideLoading()
          that.data.images.push(fileID)
          //console.log('ap', app.globalData.fileID)
          that.setData({ images: that.data.images })
          //that.setData({ tmp_images: that.data.tmp_images })
          //console.log("images", that.data.images)

        } else if (res.result.errCode == 87015){
          wx.hideLoading()
          wx.showModal({
            title: '链接超时，请稍后重试',
            showCancel: false
          })
        } else {
          console.log('图片审核未知错误', res)
          wx.hideLoading()
          wx.showModal({
            title: '图片审核云端链接失败，请稍后重试',
            showCancel: false
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          icon: 'none',
          title: '图片审核失败',
          duration: 3000
        })
      }
    })
  },


  bindTagChange: function (e) {
    this.setData({
      tag: e.detail.value
    })
  },



  // 发帖
  formSubmit: function (e) {
    var that = this
    var all_content = this.data.title + '; ' + this.data.content + '; ' + this.data.tag

    if (app.globalData.userInfo.organization == "请选择" || app.globalData.userInfo.organization == ""){
      wx.showModal({
        title: '无法发送',
        content: '请到个人主页，添加所在学校',
        showCancel: false,
      })
      return;
    }

    if (this.data.title == ""){
      wx.showToast({
        title: '标题为空',
        icon: "none"
      })
      return;
    }

    wx.showLoading({
      title: '上传中',
    })
    // check message
    wx.cloud.callFunction({
      name: 'msgCheck',
      data: { content: all_content },
      success: function (res) {
        //console.log('content check', res.result.errCode)
        if (res.result.errCode != 0) {
          wx.showToast({
            image: '../index/tear.png',
            title: '包含敏感内容',
            duration: 3000
          })
        } else {
          app.globalData.eventsDb = true
          const newEvent = {
            createBy: app.globalData.userInfo._openid,
            title: that.data.title,
            createTime: new Date(),
            eventTime: that.data.time,
            eventDate: that.data.date,
            userList: [app.globalData.userInfo._openid],
            commentIds: [],
            content: that.data.content,
            images: that.data.images,
            cate: that.data.cate,
            juqi: 0,
            maxUser: that.data.maxUser,
            organization: wx.getStorageSync('organization'),
            responseList: [],
            tag: that.data.tag,
            originPostUserDocId: app.globalData.userInfo._id
          }
          app.globalData.images = [];
          const db = wx.cloud.database();
          that.setData({
            loading: true
          });
          //let that = this
          db.collection('events').add({
            data: newEvent
          }).then(res => {
            //console.log(res);
            wx.hideLoading()
            const userInfo = app.globalData.userInfo;
            app.globalData.deleteEvent = true
            app.globalData.eventsDb = true
            wx.showToast({
              title: '攒局成功',
              duration: 2000,
            })
            wx.switchTab({
              url: '../index/index',
            })
            that.setData({
              title: "",
              eventTime: "",
              eventDate: "",
              cate: ['全部', '入局'],
              tmp_images: [],
              userList: [],
              content: "",
              tag: "",
              index: 0,
              maxUser: 4,
            })
          }).catch(err => {
            console.log(err)
          })
        }
      },
      fail: function (res) {
        //console.log('文字审核',res)
        wx.showToast({
          icon: 'none',
          title: '文字审核失败',
          duration: 3000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({ authorized: app.globalData.authorized })
    //console.log('createEvent onLoad')
    const userInfo = app.globalData.userInfo;
    that.setData({
      switch1Checked: false,
      //textValue: app.globalData.textArea,
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log('createEvent onShow')
    var that = this
    this.setData({
      //images: this.data.images,
      switch1Checked: false,
      })

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
    //      })
    //   }
    // })
    //this.onLoad()
    //console.log("isonshow", this.data.images)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})