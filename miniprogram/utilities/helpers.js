const app = getApp();

function insertCommentIdToUser(commentId, userId, isReceiver){
    
    const userProfile = wx.cloud.database().collection('users').doc(userId);
    const {
        userPostedCommentIds
    } = app.globalData.userInfo
    
    if(isReceiver){
        wx.cloud.callFunction({
            name: 'addCommentIdToUser',
            data: {
                commentId, userId   
            },
            success: res => {
                console.log("Add userReceivedCommentId to: " + userId)
                console.log(res)
            }
        })
    } else {
        const newPostedCommentIds = [...userPostedCommentIds, commentId]
        userProfile.update({
            data: {
                userPostedCommentIds: newPostedCommentIds
            }
        }).then(res => {
            console.log("Add userPostedCommentId to: " + userId)
            console.log(res)
        })
    }
}

function insertCommentIdToPost(commentContent){
    console.log(commentContent)
    wx.cloud.callFunction({
        name: 'addCommentToPost',
        data: commentContent,
        complete: console.log
    })
}

function insertCommentIdToComment(){

}

async function addComment(comment, originType, callBack = null) {
    const db = wx.cloud.database();
    console.log(comment);
    const {receiverId, creatorId, originPostUserId, _eventId} = comment.data;
    if(comment.isNewComment){
        db.collection('discussions').add({
            data: comment.data
        }).then(async res => {
            const newCommentId = res._id;
            console.log('helpers addcomment callback',callBack)

            if(callBack){
                callBack(newCommentId)
            }

            if(originType === 'post'){
                insertCommentIdToPost({
                    commentId: newCommentId,
                    postId: _eventId
                })
            };

            if(originType === 'comment'){
                insertCommentIdToComment()
            };

            insertCommentIdToUser(newCommentId, creatorId, false);
            if(creatorId !== receiverId){
                insertCommentIdToUser(newCommentId, receiverId, true);
            }
            if(receiverId !== originPostUserId){
                insertCommentIdToUser(newCommentId, originPostUserId, true);
            }
            return newCommentId;
        }).catch(e => {
            return e.errMsg
        })
    }
}

function removeCommentFromUser(commentId, userId, isReceiver){
    let fromWhere = isReceiver ? 'receive' : 'post';
    wx.cloud.callFunction({
        name: 'removeCommentFromUser',
        data: {
            commentId, userId, fromWhere
        },
        complete: console.log
    })
}

function removeCommentFromPost(commentContent, callBack = null){
    console.log(commentContent)
    wx.cloud.callFunction({
        name: 'removeCommentFromPost',
        data: commentContent,
        complete: console.log
    })
    if(callBack){
        callBack()
    }
}

function removeComment(comment){

}

function handleUserTapLike(event){
  const {
    commentId,
    userId
  } = event;
  wx.cloud.callFunction({
      name: 'handleUserTapLike',
      data: {commentId, userId},
      complete: console.log
  })
//   const commentDoc = wx.cloud.database().collection('discussions').doc(commentId)
//   commentDoc.get()
//     .then(async result => {
//       let curLikeUserIds = result.data.likeUserIds;
//       if(curLikeUserIds.includes(userId)){
//         curLikeUserIds = curLikeUserIds.filter(v => v !== userId)
//       } else {
//         curLikeUserIds.push(userId)
//       }
//       console.log(curLikeUserIds)
//       commentDoc.update({
//         data: {
//           likeUserIds: curLikeUserIds
//         }
//       }).then(res => {
//         console.log(res)
//       }).catch(e=> {
//         console.log(e)
//       })
//     })
}
/**
 * Create a new record for report, and add that report to the 
 * user who submitted.
 * @param {*} d 
 * @param {*} callback 
 */
function addReport(d, callback){
    const db = wx.cloud.database();
    const {
        reportDiscussionId,
        reportEventId,
        reportOriginPostUserId,
        reason,
        reportedUserId,
        reporterUserId
    } = d;
    console.log(d);

    wx.cloud.callFunction({
        name: "setCommentIsDeleted",
        data: {
            commentId: reportDiscussionId,
            isDeleted: true,
            userId: reportedUserId
        },
        success: console.log
    })

    db.collection('reports').add({
        data: {
            reportDiscussionId,
            reportEventId,
            reportOriginPostUserId,
            reportReason: reason,
            reportedUserId,
            reporterUserId,
            reportStage: 0,
            assistantUserId: "",
            reportResult: ""
        }
    }).then(res => {
        // get the response id and add it to userInfo both locally and remotely
        let curUserReportStatus = app.globalData.userInfo.reportStatus;
        curUserReportStatus.push({
            reportId: res._id,
            reportStage: 0
        })

        let curUserSystemMessageIds = app.globalData.userInfo.userReceivedSystemMessageIds;
        curUserSystemMessageIds.push({
            messageId: res._id,
            messageType: "report_submit"
        })

        db.collection('users').doc(reporterUserId).update({
            data: {
                reportStatus: curUserReportStatus,
                userReceivedSystemMessageIds: curUserSystemMessageIds
            }
        }).then(res => {
            console.log(res)
            if(callback){
                callback()
            }
        }).catch(console.log)
    }).catch(console.log)
    /**
     * 
    discussionContent: "888"
    discussionCreatorName: "Amber张欠鱼"
    imgUrls: ["background-image:url('data:image/jpeg;base64,/9j/4…mH0oooAPMPpR5h9KKKADzD6UeYfSiigA8w+lFFFAH//2Q==')"]
    reasons: (4) [{…}, {…}, {…}, {…}]
    reportDiscussionId: "b040a67a5dfef4ef05cf6b652a70765e"
    reportEventId: "test-event"
    reportOriginPostUserId: "7799745c5deade6d00f70f6b67b90731"
    reportedUserId: "7799745c5deade6d00f70f6b67b90731"
    reporterUserId: "b040a67a5deafd1a00fd0e983824e6bd"
    selectedReasons: []
     */
}

function createNewSystemMessage(d, callback){
    const db = wx.cloud.database();
    const {
        receiverId,
        displayContent,
        msgType,
        data
    } = d;
    console.log(d);
    wx.cloud.callFunction({
            name: 'createNewSystemMessage',
            data: {
                receiverId,
                displayContent,
                msgType,
                data
            },
            success: (res) => {
                console.log(res)
                if(callback){
                    callback()
                }
            }
        }
    )

}

module.exports.addComment = addComment;
module.exports.insertCommentIdToPost = insertCommentIdToPost;
module.exports.handleUserTapLike = handleUserTapLike;
module.exports.removeCommentFromUser = removeCommentFromUser;
module.exports.removeCommentFromPost = removeCommentFromPost;
module.exports.addReport = addReport;
module.exports.createNewSystemMessage = createNewSystemMessage;