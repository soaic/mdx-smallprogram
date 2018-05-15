// pages/bluetoothdemo/bluetoothdemo.js
import btrequest from '../../bluetooth/bluetoothRequest.js'
import btutil from '../../bluetooth/blueToothUtil.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendText: '',
    sendTextHex: ''
  },
  onLoad: function(e){
    var that = this
    that.setData({
      sendText: buf2hex(btrequest.handShakeReq())
    })
    // if (blueTooth.isResetConntct()) {
    //   blueTooth.startConnect()
    // }
  },
  onResetConnectClikc: function(e){

  },
  onSendClick: function (e){
    var that = this
    var hex = that.data.sendText
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    that.setData({
        sendTextHex: arrayBufferToHexString(buffer)
    })
    

  },
  onTextInputChange: function (e){
    var that = this
    that.setData({
      sendText: e.detail.value
    })
    console.log(that.data.sendText)
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