// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
//景点列表去重 一次去重20条
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate
  const _ = db.command
  let {list} = await db.collection('scenery').aggregate()
  .group({
    _id: '$name',
    num:$.sum(1),
    ids:$.addToSet('$_id')
  }).match({
    num:_.gt(1)
  })
  .end() 
  let idsArr =  []
  // return list
  list.map(i=>{
    idsArr.push(i.ids[0])
  })
  let res = await db.collection('scenery').where({
    _id:_.in(idsArr)
  }).remove()
  return res
}