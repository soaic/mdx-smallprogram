// pages/bluetoothdemo/bluetoothdemo.js
import btrequest from '../../bluetooth/bluetoothRequest.js'
import btutil from '../../bluetooth/blueToothUtil.js'
const AV = require('../../libs/av-weapp-min.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendText: '',
    sendTextHex: '',
    receiveText:'',
    isConnected: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function(e){
    var that = this
    that.setData({
      sendText: buf2hex(btrequest.handShakeReq())
    })
    if (btutil.isResetConnect()) {
      btutil.startConnect()
    }
    btutil.setOnConnectListener(function(str){
      console.log("str="+str)
      that.setData({
        isConnected: str
      })
    })

    btutil.setOnReciverListener(function(res){
      that.setData({
        receiveText: buf2hex(res.value)
      })
    })
    
  },
  onResetConnectClikc: function(e){
    // if (btutil.isResetConnect()) {
    //   btutil.startConnect()
    // }
    var user = app.globalData.user
    console.log(user.objectId)
  },
  onSendClick: function (e){
    var that = this
    var hex = that.data.sendText
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    that.setData({
        sendTextHex: arrayBufferToHexString(buffer),
        receiveText: ''
    })
    btutil.send(buffer)

  },
  onTextInputChange: function (e){
    var that = this
    that.setData({
      sendText: e.detail.value
    })
    console.log(that.data.sendText)
  },
  bindGetUserInfo: function (e) {
    const user = AV.User.current();
    user.set(e.detail.userInfo).save().then(user => {
      app.globalData.user = user.toJSON();
    }).catch(console.error);
  }
})

function arrayBufferToHexString(buffer) {
  let bufferType = Object.prototype.toString.call(buffer)
  if (buffer != '[object ArrayBuffer]') {
    return
  }
  let dataView = new DataView(buffer)
  var hexStr = '[';
  for (var i = 0; i < dataView.byteLength; i++) {
    var str = dataView.getUint8(i);
    var hex = (str & 0xff).toString(16);
    hex = (hex.length === 1) ? '0' + hex : hex;
    hexStr += " 0x" + hex;
    if (i < dataView.byteLength - 1) {
      hexStr += ","
    }
  }
  hexStr += " ]"
  return hexStr;//hexStr.toUpperCase();
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}