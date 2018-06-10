import btrequest from 'bluetoothRequest.js';
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

const NAME_FIRST = 'MDX'
const UUID_SERV_1 = '00006666-0000-1000-8000-00805F9B34FB'
const UUID_SERV_2 = '00007777-0000-1000-8000-00805F9B34FB'
const UUID_SERV_3 = '00001800-0000-1000-8000-00805F9B34FB'
var connected = false, connecting = false
var available, discovering
var deviceId
var onReciverListener,onConnectListener
var characteristicId_r, characteristicId_w

function reStartConnect(){
  stopConnection()
  setTimeout(startConnect, 2000)
}

function stopConnection(){
  connecting = false
  connected = false
  if (deviceId && typeof deviceId == 'string' ){
    console.log('close deviceId:',deviceId)
    //closeBLEConnection(deviceId)
  }
}

function loopFunction(fun){
  if(fun instanceof Function)
    setTimeout(fun, 2000)
}

//开启适配，如果失败提示设备蓝牙不可用，同时开启蓝牙适配器状态监听
function startConnect() {
  if (connecting) { return }
  connecting = true
  if (wx.openBluetoothAdapter) {
    wx.openBluetoothAdapter()
    openBluetoothAdapter()
  } else {
    stopConnection()
    showVersionLowDialog()
  }
}

//开启蓝牙适配器
function openBluetoothAdapter() {
  wx.showLoading({
    title: '初始化蓝牙适配器'
  });
  wx.openBluetoothAdapter({
    success: function (res) {
      
      wx.onBluetoothAdapterStateChange(function (res) {
        if (!available && res.available) {
          //重新连接
          connected = false
          console.log("重新连接")
          startConnect();
        }
        available = res.available
        discovering = res.discovering
        console.log('available:' + res.available + ',discovering:' + res.discovering)
        
        if (!res.available) {
          if (onConnectListener instanceof Function) {
            onConnectListener(res.available)
          }
          connected = false
        }
      })

      getBluetoothAdapterState();
    },
    fail: function (err) {
      stopConnection()
      console.log(err);
      
      if (err.errCode == 10001) {
        showUnAvailableDialog()
      } else {
        wx.showToast({
          title: '蓝牙初始化失败',
          duration: 2000
        })
      }
    }
  });
}

//开始扫描附近的蓝牙设备，开启获取本机已配对的蓝牙设备
function getBluetoothAdapterState() {
  wx.getBluetoothAdapterState({
    success: function (res) {
      available = res.available
      discovering = res.discovering
      if (!available) {
        stopConnection()
        wx.showToast({
          title: '设备无法开启蓝牙连接',
          duration: 2000
        })
      } else {
        console.log("getBluetoothAdapterState success")
        //开始蓝牙扫描
        startBluetoothDevicesDiscovery()
      }
    },fail: function(e){
      loopFunction(getBluetoothAdapterState)
    }
  })
}

//开始搜索蓝牙设备, 提示蓝牙搜索
function startBluetoothDevicesDiscovery() {
  wx.showLoading({
    title: '蓝牙搜索中...'
  });
  wx.startBluetoothDevicesDiscovery({
    services: [UUID_SERV_1, UUID_SERV_2],
    allowDuplicatesKey: true,
    success: function (res) {
      console.log("startBluetoothDevicesDiscovery",res)
      if (!res.isDiscovering) {
        console.log("res.isDiscovering", res.isDiscovering)
        wx.getBluetoothDevices({
          success: function (res) {
            console.log("getBluetoothDevices",res)
            var devices = res['devices'], flag = false
            if (devices && devices.length > 0) {
              for (var index = 0; index < devices.length; index++){
                var value = devices[index]
                console.log("localName=", value['localName'])
                console.log("name=", value['name'])
                var isLocalName = value['localName'] && value['localName'].indexOf(NAME_FIRST) != -1
                var name = value['name'] && value['name'].indexOf(NAME_FIRST) != -1
                if (isLocalName || name) {
                  // 如果存在包含NAME_FIRST字段的设备
                  flag = true
                  deviceId = value['deviceId'];
                  break
                }
              }
            }
            if (flag) {
              stopBluetoothDevicesDiscovery();
              startConnectDevices();
            }else{
              getConnectedBluetoothDevices()
            }
          },fail: function(e){
            loopFunction(startBluetoothDevicesDiscovery)
          }
        })
      } else {
        getConnectedBluetoothDevices()
      }
    },
    fail: function (err) {
      console.log("startBluetoothDevicesDiscovery fail", err)
      loopFunction(startBluetoothDevicesDiscovery)
    }
  });
}

//获取已配对的蓝牙设备
function getConnectedBluetoothDevices() {
  wx.getConnectedBluetoothDevices({
    services: [UUID_SERV_1, UUID_SERV_2],
    success: function (res) {
      console.log("getConnectedBluetoothDevices success",res)
      var devices = res['devices'], flag = false
      if (devices && devices.length > 0) {
        for (var index = 0; index < devices.length; index++) {
          var value = devices[index]
          console.log("localName=", value['localName'])
          console.log("name=", value['name'])
          var isLocalName = value['localName'] && value['localName'].indexOf(NAME_FIRST) != -1
          var name = value['localName'] && value['localName'].indexOf(NAME_FIRST) != -1
          if (isLocalName || name) {
            // 如果存在包含NAME_FIRST字段的设备
            flag = true
            deviceId = value['deviceId'];
            break
          }
        }
      }
      if (flag) {
        stopBluetoothDevicesDiscovery();
        startConnectDevices();
      } else {
        onBluetoothDeviceFound()
      }
    },
    fail: function (err) {
      console.log("getConnectedBluetoothDevices fail")
      loopFunction(startBluetoothDevicesDiscovery)
    }
  });
}

//重新查询蓝牙设备列表
function onBluetoothDeviceFound() {
  if(connected) { return }
  wx.showLoading({
    title: '蓝牙搜索中...'
  });
  wx.onBluetoothDeviceFound(function (res) {
    console.log("onBluetoothDeviceFound",res)
    var devs;
    if (res.deviceId) {
      devs = res
    }else if (res.devices) {
      if(res.devices[0]){
        devs = res.devices[0]
      }else{
        devs = res.devices
      }
    }else if (res[0]) {
      devs = res[0]
    }
    if (devs) {
      var name = devs['name'];
      var localName = devs['localName'];
      if ((name && name.indexOf(NAME_FIRST) != -1) ||
        (localName && localName.indexOf(NAME_FIRST) != -1)) {
        deviceId = devs['deviceId'];
        //开始连接
        if (deviceId){
          startConnectDevices();
          return
        }
      }
    }
    loopFunction(startBluetoothDevicesDiscovery)
  })
}

//开始配对设备
function startConnectDevices() {
  wx.showLoading({
    title: '开始配对...'
  });
  console.log("devceId=", deviceId)
  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      console.log("startConnectDevices",res)
      getService();
    },
    fail: function (err) {
      console.log('连接失败：', err);
      if(err.errMsg && err.errMsg.indexOf('already') >= 0){
        getService();
      }else{
        loopFunction(startBluetoothDevicesDiscovery)
      }
    }
  });
}

//连接成功后根据deiviceId获取设备的所有服务
function getService() {
  wx.showLoading({
    title: '获取信息中...'
  });
  // 获取蓝牙设备service值  如果知道serviceId,Android设备下可以省略，IOS设备下需要调用该方法
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      console.log('services:', res)
      if (res.services) {
        var count = 0
        for (var i = 0; i < res.services.length; i++) {
          if (res.services[i].uuid == UUID_SERV_1 || res.services[i].uuid == UUID_SERV_2 ){
            if (count < 2){
              count++
              getCharacter(res.services[i].uuid, count);
            }
          }
        }
        if (count != 2){
          loopFunction(getService)
        }
      }
    },fail: function(e){
      loopFunction(getService)
    }
  })
}

//读取服务的特征值
function getCharacter(uuid, count) {
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: uuid,
    success: function (res) {
      console.log(res)
      if (uuid == UUID_SERV_1){
        characteristicId_r = res.characteristics[0].uuid
      }
      if (uuid == UUID_SERV_2){
        characteristicId_w = res.characteristics[0].uuid
      }

      console.log("characteristicId_r=" + characteristicId_r)
      console.log("characteristicId_w=" + characteristicId_w)
      if (characteristicId_r && characteristicId_w){
        notifyBLECharacteristicValueChange();
        //发送蓝牙耳机信息配对校验
        send(btrequest.handShakeReq())
        if (onConnectListener instanceof Function){
          onConnectListener(true)
        }
      }
    },
    fail: function (err) {
      loopFunction(getService)
    }
  })
}

function stopBluetoothDevicesDiscovery() {
  wx.stopBluetoothDevicesDiscovery({
    success: function (res) {
    }
  })
}

function notifyBLECharacteristicValueChange() {
  wx.notifyBLECharacteristicValueChange({
    state: true,
    deviceId: deviceId,
    serviceId: UUID_SERV_1,
    characteristicId: characteristicId_r,
    complete(res) {
      wx.showToast({
        title: '配对成功',
        icon: 'success',
        duration: 2000
      })
      connected = true
      connecting = false
      wx.hideLoading()
      console.log("notifyBLECharacteristicValueChange",res)
      // 监听蓝牙连接
      wx.onBLEConnectionStateChange(function (res) {
        connected = res.connected
        if (!connected) {
          reStartConnect();
        }
        console.log('device{' + res.deviceId + '}state has changed, connected: ' + res.connected)
      });
      wx.onBLECharacteristicValueChange(function (res) {
        console.log('onBLECharacteristicValueChange', res)
        console.log("read",arrayBufferToHexString(res.value))
        if (onReciverListener instanceof Function)
          onReciverListener(res)
      })
    },fail(res) {
      loopFunction(notifyBLECharacteristicValueChange)
    }
  })
}

function read(){
  console.log("start read")
  wx.readBLECharacteristicValue({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: UUID_SERV_1,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: characteristicId_r,
    success: function (res) {
      console.log('readBLECharacteristicValue:', res)
    }
  })
}

function send(arrayBuffer) {
  console.log("send", arrayBufferToHexString(arrayBuffer))
  wx.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: UUID_SERV_2,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: characteristicId_w,
    // 这里的value是ArrayBuffer类型
    value: arrayBuffer,
    success: function (res) {
      console.log('writeBLECharacteristicValue success', res)
      setTimeout(function(){
        read()
      },1000)
    }
  })
}

function closeBLEConnection(dveId) {
  wx.closeBLEConnection({
    deviceId: dveId,
    success: function (res) {
      console.log(res)
    }
  })
}

function closeBluetoothAdapter() {
  wx.closeBluetoothAdapter({
    success: function (res) {
      console.log(res)
    }
  })
}

function showUnAvailableDialog() {
  wx.showModal({
    content: "蓝牙未开启,请在手机设置开启蓝牙",
    confirmText: "确定",
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {

      }
    }
  })
}

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
    hexStr += " 0x"+ hex;
    if (i < dataView.byteLength - 1) {
      hexStr += ","
    }
  }
  hexStr += " ]"
  return hexStr;//hexStr.toUpperCase();
}

function hexStringToArrayBuffer(str) {
  if (!str) {
    return new ArrayBuffer(0);
  }
  var buffer = new ArrayBuffer(str.length);
  let dataView = new DataView(buffer)

  let ind = 0;
  for (var i = 0, len = str.length; i < len; i += 2) {
    let code = parseInt(str.substr(i, 2), 16)
    dataView.setUint8(ind, code)
    ind++
  }
  return buffer;
}

function showVersionLowDialog(){
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
  })
}

function isConnected(){
  console.log("connected=" + connected)
  return connected
}

function setOnConnectListener(listner){
  onConnectListener = listner;
}

function setOnReciverListener(listener){
  onReciverListener = listener
}

module.exports = {
  startConnect: startConnect,
  isConnected: isConnected,
  send: send,
  setOnConnectListener: setOnConnectListener,
  setOnReciverListener: setOnReciverListener
}