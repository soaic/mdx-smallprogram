//app.js
const NAME_FIRST = 'MDX'
const UUID = '00006666-0000-1000-8000-00805F9B34FB'
var that
App({
  onLaunch: function () {
    that = this;
  },
  onShow: function(){
    if (!this.connected && !this.isConnectting){
      this.startConnect()
    }
  },
  //开启适配，如果失败提示设备蓝牙不可用，同时开启蓝牙适配器状态监听
  startConnect: function () {
    that.resetNum = 0;
    wx.hideLoading()
    if (that.getDeviceFoundTimer){
      clearInterval(that.getDeviceFoundTimer);
      that.getDeviceFoundTimer = null;
    }
    if (that.getConnectedTimer){
      clearTimeout(that.getConnectedTimer);
      that.getConnectedTimer = null;
    }
    if (that.discoveryDevicesTimer){
      clearTimeout(that.discoveryDevicesTimer);
      that.discoveryDevicesTimer = null;
    }
    this.isConnectting = true;
    wx.showLoading({
      title: '开启蓝牙适配'
    });
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    }else{
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return;
    }
    that.openBluetoothAdapter()
  },
  //开启蓝牙适配器
  openBluetoothAdapter: function(){
    wx.showLoading({
      title: '初始化蓝牙适配器'
    });
    wx.openBluetoothAdapter({
      success: function (res) {
        wx.onBluetoothAdapterStateChange(function (res) {
          if (!that.available && res.available) {
            //重新连接
            that.startConnect();
          }
          that.available = res.available
          that.discovering = res.discovering
          console.log('available:' + res.available + ',discovering:'+res.discovering)
          
        })
        console.log("openBluetoothAdapter success")
        that.getBluetoothAdapterState();
      },
      fail: function (err) {
        wx.hideLoading()
        console.log(err);
        if(err.errCode == 10001){
          showUnAvailableDialog()
        }else{
          wx.showToast({
            title: '蓝牙初始化失败',
            duration: 2000
          })
        }
      }
    });
  },

  //开始扫描附近的蓝牙设备，开启获取本机已配对的蓝牙设备
  getBluetoothAdapterState: function () {
    wx.getBluetoothAdapterState({
      success: function (res) {
        that.available = res.available
        that.discovering = res.discovering
        if (!that.available) {
          wx.showLoading({
            title: '设备无法开启蓝牙连接'
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
        } else {
          if (!that.discovering) {
            console.log("getBluetoothAdapterState success")
            //开始蓝牙扫描
            that.startBluetoothDevicesDiscovery()
          }
        }
      }
    })
  },
  //开始搜索蓝牙设备, 提示蓝牙搜索
  startBluetoothDevicesDiscovery: function () {
    wx.showLoading({
      title: '蓝牙搜索中...' + (that.resetNum == 0 ? "" : that.resetNum)
    });
    wx.startBluetoothDevicesDiscovery({
      services: [UUID],
      allowDuplicatesKey: true,
      success: function (res) {
        console.log("startBluetoothDevicesDiscovery success")
        if (!res.isDiscovering) {
          wx.getBluetoothDevices({
            success: function (res) {
              that.getConnectedBluetoothDevices()
            }
          })
        } else {
          that.getDeviceFoundTimer = setInterval(function () {
            that.onBluetoothDeviceFound();
            that.resetNum = that.resetNum + 1
          }, 5000);
          
        }
      },
      fail: function (err) {
        console.log("startBluetoothDevicesDiscovery fail", err)
        that.resetNum = that.resetNum+1
        setTimeout(that.getBluetoothAdapterState, 2000)
      }
    });
  },
  //获取已配对的蓝牙设备
  getConnectedBluetoothDevices: function () {
    wx.getConnectedBluetoothDevices({
      services: [UUID],
      success: function (res) {
        console.log("getConnectedBluetoothDevices success")
        var devices = res['devices'], flag = false, index = 0, conDevList = [];
        devices.forEach(function (value, index, array) {
          if (value['localName'].indexOf(NAME_FIRST) != -1) {
            // 如果存在包含NAME_FIRST字段的设备
            flag = true
            that.deviceId = value['deviceId'];
            return;
          }
        });
        if (flag) {
          that.startConnectDevices();
        } else {
          if (!this.getConnectedTimer) {
            that.getConnectedTimer = setTimeout(function () {
              that.resetNum = that.resetNum + 1
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        console.log("getConnectedBluetoothDevices fail")
        if (!this.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.resetNum = that.resetNum + 1
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    });
  },
  //重新查询蓝牙设备列表
  onBluetoothDeviceFound: function () {
    wx.showLoading({
      title: '蓝牙搜索中...' + (that.resetNum == 0 ? "" : that.resetNum)
    });
    wx.onBluetoothDeviceFound(function (res) {
      if (res.devices[0]) {
        var name = res.devices[0]['name'];
        var localName = res.devices[0]['localName'];
        if ((name != '' && name.indexOf(NAME_FIRST) != -1) || 
            (localName != '' && localName.indexOf(NAME_FIRST) != -1)) {
          var deviceId = res.devices[0]['deviceId'];
          that.deviceId = deviceId;
          //取消搜索
          clearInterval(that.getDeviceFoundTimer);
          that.getDeviceFoundTimer = null;
          that.startConnectDevices();
        }
        
      }
    })
  },
  //开始配对设备
  startConnectDevices: function () {
    wx.showLoading({
      title: '开始配对...'
    });
    clearTimeout(that.getConnectedTimer);
    that.getConnectedTimer = null;
    clearTimeout(that.discoveryDevicesTimer);
    that.discoveryDevicesTimer = null;
    that.stopBluetoothDevicesDiscovery();
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        if (res.errCode == 0) {
          setTimeout(function () {
            that.getService();
          }, 2000)
        }
      },
      fail: function (err) {
        console.log('连接失败：', err);
        if (that.devices) {
          that.resetNum = that.resetNum+1;
          setTimeout(that.startConnectDevices(),2000)
        } else {
          that.startBluetoothDevicesDiscovery();
        }
      },
      complete: function () {
        
      }
    });
  },
  //连接成功后根据deiviceId获取设备的所有服务
  getService: function () {
    wx.showLoading({
      title: '获取信息中...'
    });
    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      that.connected = res.connected
      if (!that.connected) {
        that.startConnect();
      }
      console.log('device{'+ res.deviceId+'}state has changed, connected: '+res.connected)
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: that.deviceId,
      success: function (res) {
        that.getCharacter();
      }
    })
  },
  //读取服务的特征值
  getCharacter: function () {
    wx.getBLEDeviceCharacteristics({
      deviceId: that.deviceId,
      serviceId: UUID,
      success: function (res) {
        that.characteristicId = res.characteristics
        that.connected = true
        that.isConnectting = false;
        wx.showToast({
          title: '配对成功',
          icon: 'success',
          duration: 5000
        })
      },
      fail: function (err) {
        setTimeout(that.getCharacter,2000)
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  stopBluetoothDevicesDiscovery: function(){
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
      }
    })
  },
  writeBLECharacteristicValue: function (arrayBuffer){
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, 0)
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: UUID,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.characteristicId,
      // 这里的value是ArrayBuffer类型
      value: arrayBuffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  closeBLEConnection:function(){
    wx.closeBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        console.log(res)
      }
    })
  }
})

function showUnAvailableDialog(){
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