// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log("wxc", wxContext.OPENID)
  return await cloud.database().collection('users').where({
    _openid: wxContext.OPENID
  }).get()
  // .then(res =>{
  //   //有数据库记录
  //   if (res.data){
  //     userInfo = res.data
  //     app.globalData.userInfo = userInfo;
  //   }              
  //})

}