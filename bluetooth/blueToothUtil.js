const ok = 0
const notInit = 10000
const notAvailable = 10001
const noDevice = 10002
const connectionFail = 10003
const noService = 10004
const noCharacteristic = 10005
const noConnection = 10006
const propertyNotSupport = 10007
const systemError = 10008
const systemNotSupport = 10009
const deviceId = '1770EE81-BC36-378C-C47A-B049AED6F1D1'
const advertisServiceUUIDs= '00006666-0000-1000-8000-00805F9B34FB'
const rrsi = -52

function init(){
  if (wx.openBluetoothAdapter) {
    wx.openBluetoothAdapter({
      success: function (res) {
        openBlueT()
      }, fail: function (res) {
        showErrorDialog(res.errCode)
      }
    })
  } else {
    versionLowDialog()
  }    
}

function openBlueT(){
  wx.openBluetoothAdapter({
    success: function (res) {
      console.log("初始化蓝牙适配器成功！" + JSON.stringify(res))
      //监听蓝牙适配器状态  
      wx.onBluetoothAdapterStateChange(function (res) {
        console.log(res.discovering ? "在搜索。" : "未搜索。")
        console.log(res.available ? "可用。" : "不可用。")
      })
    }
  })  
}

function getBlueT() {
  wx.getBluetoothAdapterState({
    success: function (res) {
      
      
    }
  })
}

function showErrorDialog(errCode){
  var strTip = ""
  var confirmText = "确定"
  switch(errCode){
    case notAvailable:
      wx.showModal({
        content: "蓝牙未开启,请手机设置开启蓝牙",
        confirmText: "确定",
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {

          }
        }
      })
      break;
  }
}



function versionLowDialog(){
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
  })
}

module.exports = {
  init: init
}