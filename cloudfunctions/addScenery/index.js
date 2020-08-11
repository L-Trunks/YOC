// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
/**
 * 调用易源api获取景点列表，之后遍历插入到数据库中
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let op = {
    method: 'GET',
    uri: 'https://route.showapi.com/268-1',
    // uri: `https://route.showapi.com/268-1?areaId=${event.areaId||''}&cityId=${event.cityId || '317'}&page=${event.page || '1'}&proId=${event.proId || '24'}&showapi_appid=293377&keyword=${event.keyword || ''}&showapi_timestamp=&showapi_sign=d9d433d81cb847089a562ddb19585064`,
    headers: {
      "Content-Type": 'application/x-www-form-urlencoded',
      'User-Agent': 'Request-Promise'
    },
    qs: {
      areaId: event.areaId || '', //地区id
      cityId: event.cityId || '317', //城市id
      keyword: event.keyword || '', //景点关键词
      page: event.page || '', //当前页数
      proId: event.proId || '24', //省份id
      showapi_appid: '293377',
      showapi_sign: 'd9d433d81cb847089a562ddb19585064'
    },
    json: true // Automatically stringifies the body to JSON
  }
  const data = await rq({...op})
  // let scenery = data.showapi_res_body.pagebean.contentlist || []
  // // let tasks = []
  // // scenery.map(i=>{
  // //   i = {...i,sortId:''}
  // //   let task = db.collection('scenery').add({
  // //     data:{...i}
  // //   })
  // //   tasks.push(task)
  // // })
  // // return await Promise.all(tasks)
  // return scenery
  const total = data.showapi_res_body.pagebean.allNum || 0
  const times = Math.ceil(total / 20)
  const sceneryData = []
  for (let i = 1; i <= times; i++) {
    let data = await rq({
      ...op,
      qs: {
        ...op.qs,
        page: i
      }
    })
    data.showapi_res_body.pagebean.contentlist.map(i => {
      i = {
        ...i,
        sortId: ''
      }
      sceneryData.push(i)
    })
  }
  // return sceneryData
  let addTasks = []
  for (let i = 0; i < sceneryData.length; i++) {
    const task = db.collection('scenery').add({
      data: {
        ...sceneryData[i]
      }
    })
    addTasks.push(task)
  }
  return await Promise.all(addTasks)

}