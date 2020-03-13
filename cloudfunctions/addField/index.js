// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  try{
     return await db.collection('users').update({
       data:{
         haveUnreadSysMsg: false,
       }      
    })

    // return await db.collection('users').update({
    //   data: {
    //     userAccessLevel:{
    //       level: 1,
    //       school: []
    //     },
    //     haveUnreadComments: false,
    //     lastReceivedCommentsCount: 0,
    //     reportStatus: [],
    //     userAccessLevel: Object,
    //     userPostedCommentIds: [],
    //     userReceivedAtIds: [],
    //     userReceivedCommentIds: [],
    //     userReceivedSystemMessageIds: [],
    //   }
    // })

    // originPostUserDocId update
    // return await db.collection('users').get().then(async res_openid =>{
    //   let openid = res_openid.data._openid
    //   let id = res_openid.data._id
    //   db.collection('events').where({
    //     _openid: openid
    //   }).update({
    //     data:{
    //       originPostUserDocId: id
    //     }
    //   })
    // })
    
    // return await db.collection('events').update({
    //   data:{
    //     commentIds: []
    //   }
    // })
  } catch(e) {
    console.error(e)
  }

 

}