// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //const wxContext = cloud.getWXContext()
  const { content } = event;
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      content: content
    })
    return res
  } catch (err) {
    return err;
  }

  
}