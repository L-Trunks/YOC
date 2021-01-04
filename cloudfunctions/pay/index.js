// 云函数入口文件

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.body,
    "outTradeNo" : event.tradeNo,
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1604776726",
    "totalFee" : event.totalFee,
    "envId": "yoc-test-fxk60",
    "functionName": "pay_cb"
  })
  return res
}