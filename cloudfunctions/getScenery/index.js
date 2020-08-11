// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate
  const _ = db.command
  let skip = (+event.page-1)*20
  return await db.collection('scenery').where({
    sortId:event.sortId
  }).skip(skip).limit(20).get()
}