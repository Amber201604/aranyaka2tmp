//app.js
//import { promisifyAll, promisify } from 'miniprogram-api-promise';
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'aranyakatest-jbo1y',
        traceUser: true,
      })
    }

    this.globalData = { 
      //organization: [], 多校合并
      images: [],
      //urlHead: 'https://7365-senlinshu-amber1-cx51o-1300185579.tcb.qcloud.la'
      }

    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('hasupdate', res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      wx.showModal({
        title: '版本更新失败',
        content: '请在个人主页->联系森林书，向森林书客服反映情况',
        showCancel: false,
      })
    })

    

    // const wxp = {}
    // // promisify all wx's api
    // promisifyAll(wx, wxp)
    // console.log(wxp.getSystemInfoSync())
    // wxp.getSystemInfo().then(console.log)
    // wxp.showModal().then(wxp.openSetting())

    // // compatible usage
    // wxp.getSystemInfo({ success(res) { console.log(res) } })

    // // promisify single api
    // promisify(wx.getSystemInfo)().then(console.log)
  },
  
})
