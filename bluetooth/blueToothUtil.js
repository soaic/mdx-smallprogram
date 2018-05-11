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
const UUID = '00006666-0000-1000-8000-00805F9B34FB'
var resetNum = 0
var getDeviceFoundTimer, getConnectedTimer, discoveryDevicesTimer
var isConnectting = false, connected = false, isConnectting = false
var available, discovering
var deviceId, characteristicId


//开启适配，如果失败提示设备蓝牙不可用，同时开启蓝牙适配器状态监听
function startConnect() {
  wx.hideLoading()
  if (getDeviceFoundTimer) {
    clearInterval(getDeviceFoundTimer);
    getDeviceFoundTimer = null;
  }
  if (getConnectedTimer) {
    clearTimeout(getConnectedTimer);
    getConnectedTimer = null;
  }
  if (discoveryDevicesTimer) {
    clearTimeout(discoveryDevicesTimer);
    discoveryDevicesTimer = null;
  }
  isConnectting = true;
  wx.showLoading({
    title: '开启蓝牙适配'
  });
  if (wx.openBluetoothAdapter) {
    wx.openBluetoothAdapter()
    openBluetoothAdapter()
  } else {
    versionLowDialog()
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
          startConnect();
        }
        available = res.available
        discovering = res.discovering
        console.log('available:' + res.available + ',discovering:' + res.discovering)

      })
      console.log("openBluetoothAdapter success")
      getBluetoothAdapterState();
    },
    fail: function (err) {
      wx.hideLoading()
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
        wx.showLoading({
          title: '设备无法开启蓝牙连接'
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        if (!discovering) {
          console.log("getBluetoothAdapterState success")
          //开始蓝牙扫描
          setTimeout(startBluetoothDevicesDiscovery, 2000)
        }
      }
    }
  })
}

//开始搜索蓝牙设备, 提示蓝牙搜索
function startBluetoothDevicesDiscovery() {
  wx.showLoading({
    title: '蓝牙搜索中...' + (resetNum == 0 ? "" : resetNum)
  });
  wx.startBluetoothDevicesDiscovery({
    services: [UUID],
    allowDuplicatesKey: true,
    success: function (res) {
      console.log("startBluetoothDevicesDiscovery success")
      if (!res.isDiscovering) {
        wx.getBluetoothDevices({
          success: function (res) {
            getConnectedBluetoothDevices()
          }
        })
      } else {
        getDeviceFoundTimer = setInterval(function () {
          onBluetoothDeviceFound();
          resetNum = resetNum + 1
        }, 5000);

      }
    },
    fail: function (err) {
      console.log("startBluetoothDevicesDiscovery fail", err)
      resetNum = resetNum + 1
      setTimeout(getBluetoothAdapterState, 2000)
    }
  });
}

//获取已配对的蓝牙设备
function getConnectedBluetoothDevices() {
  wx.getConnectedBluetoothDevices({
    services: [UUID],
    success: function (res) {
      console.log("getConnectedBluetoothDevices success")
      var devices = res['devices'], flag = false, index = 0, conDevList = [];
      devices.forEach(function (value, index, array) {
        if (value['localName'].indexOf(NAME_FIRST) != -1) {
          // 如果存在包含NAME_FIRST字段的设备
          flag = true
          deviceId = value['deviceId'];
          return;
        }
      });
      if (flag) {
        startConnectDevices();
      } else {
        if (!getConnectedTimer) {
          getConnectedTimer = setTimeout(function () {
            resetNum = resetNum + 1
            getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    },
    fail: function (err) {
      console.log("getConnectedBluetoothDevices fail")
      if (!getConnectedTimer) {
        getConnectedTimer = setTimeout(function () {
          resetNum = resetNum + 1
          getConnectedBluetoothDevices();
        }, 5000);
      }
    }
  });
}

//重新查询蓝牙设备列表
function onBluetoothDeviceFound() {
  wx.showLoading({
    title: '蓝牙搜索中...' + (resetNum == 0 ? "" : resetNum)
  });
  wx.onBluetoothDeviceFound(function (res) {
    if (res.devices[0]) {
      var name = res.devices[0]['name'];
      var localName = res.devices[0]['localName'];
      if ((name != '' && name.indexOf(NAME_FIRST) != -1) ||
        (localName != '' && localName.indexOf(NAME_FIRST) != -1)) {
        deviceId = res.devices[0]['deviceId'];
        //取消搜索
        clearInterval(getDeviceFoundTimer);
        getDeviceFoundTimer = null;
        startConnectDevices();
      }

    }
  })
}

//开始配对设备
function startConnectDevices() {
  wx.showLoading({
    title: '开始配对...'
  });
  console.log("devceId=", deviceId)
  clearTimeout(getConnectedTimer);
  getConnectedTimer = null;
  clearTimeout(discoveryDevicesTimer);
  discoveryDevicesTimer = null;
  stopBluetoothDevicesDiscovery();
  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      if (res.errCode == 0) {
        setTimeout(function () {
          getService();
        }, 2000)
      }
    },
    fail: function (err) {
      console.log('连接失败：', err);
      if (deviceId) {
        resetNum = resetNum + 1;
        setTimeout(startConnectDevices(), 2000)
      } else {
        startBluetoothDevicesDiscovery();
      }
    },
    complete: function () {

    }
  });
}

//连接成功后根据deiviceId获取设备的所有服务
function getService() {
  wx.showLoading({
    title: '获取信息中...'
  });
  // 监听蓝牙连接
  wx.onBLEConnectionStateChange(function (res) {
    connected = res.connected
    if (!connected) {
      startConnect();
    }
    console.log('device{' + res.deviceId + '}state has changed, connected: ' + res.connected)
  });
  // 获取蓝牙设备service值  如果知道serviceId,Android设备下可以省略，IOS设备下需要调用该方法
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      getCharacter();
    }
  })
}

//读取服务的特征值
function getCharacter() {
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: UUID,
    success: function (res) {
      characteristicId = res.characteristics[0].uuid
      connected = true
      isConnectting = false;
      notifyBLECharacteristicValueChange();
      wx.showToast({
        title: '配对成功',
        icon: 'success',
        duration: 5000
      })
    },
    fail: function (err) {
      setTimeout(getCharacter, 2000)
    },
    complete: function () {
      wx.hideLoading()
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
    serviceId: UUID,
    characteristicId: characteristicId,
    complete(res) {
      wx.onBLECharacteristicValueChange(function (res) {
        console.log('notifyBLECharacteristicValueChange',res)
      })
    },
    fail(res) {
      console.log('notify fail',res);
    }
  })
}

function send(arrayBuffer) {
  console.log(arrayBufferToHexString(arrayBuffer))
  wx.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: UUID,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: characteristicId,
    // 这里的value是ArrayBuffer类型
    value: arrayBuffer,
    success: function (res) {
      console.log('writeBLECharacteristicValue success', res)
    }
  })
}

function closeBLEConnection() {
  wx.closeBLEConnection({
    deviceId: deviceId,
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

function versionLowDialog(){
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
  })
}

function isResetConntct(){
  return !isConnectting && !connected
}

module.exports = {
  startConnect: startConnect,
  isResetConntct: isResetConntct,
  send: send
}