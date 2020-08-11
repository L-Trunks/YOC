// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate
  const _ = db.command
  return await db.collection('scenery_category').where({
    status: '1'
  }).orderBy('level', 'desc').limit(4).get()
}