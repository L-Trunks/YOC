// 云函数入口文件
const cloud = require('wx-server-sdk')
let QQMapWX = require('./qqmap-wx-jssdk1.2/qqmap-wx-jssdk');
let qqmapsdk = new QQMapWX({
    key: '375BZ-RAXWU-NJOVW-BX74F-W4HHK-LXBC7'
});
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
    // 云函数入口函数
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext()
    const $ = db.command.aggregate
    const _ = db.command
    let count = await db.collection('scenery').where({}).count()
    let times = Math.ceil(count.total / 100)
    let totalList = {}
    let taskList = []
    for (let i = 0; i < times; i++) {
        let skip = i * 100
        let task = db.collection('scenery').where({}).skip(skip).limit(100).get()
        taskList.push(task)
    }
    return (await Promise.all(taskList)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
        }
    })

}