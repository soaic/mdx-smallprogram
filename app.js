//app.js
const NAME_FIRST = 'EDRS'
App({
  onLaunch: function () {
    //this.startConnect()
  },
  //开启适配，如果失败提示设备蓝牙不可用，同时开启蓝牙适配器状态监听
  startConnect: function () {
    var that = this;
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
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("初始化蓝牙适配器");
        console.log(res);
        wx.onBluetoothAdapterStateChange(function (res1) {
          console.log("res1=" + res1)
          var available = res1.available;
          console.log("available=" + available)
          if (available) {
            that.getBluetoothAdapterState();
          }
        })
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: '蓝牙初始化失败',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      }
    });
    
  },
  //开始扫描附近的蓝牙设备，开启获取本机已配对的蓝牙设备
  getBluetoothAdapterState: function () {
    console.log("----getBluetoothAdapterState---init")
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log("----getBluetoothAdapterState---success")
        console.log(res)
        var available = res.available,
        discovering = res.discovering;
        if (!available) {
          wx.showToast({
            title: '设备无法开启蓝牙连接',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        } else {
          console.log("discovering=" + discovering)
          if (!discovering) {
            wx.getBluetoothDevices({
              success: function (res) {
                console.log("-----getBluetoothDevices---success")
                console.log(res)
                that.startBluetoothDevicesDiscovery();
                that.getConnectedBluetoothDevices();
              },
              fail: function(res){
                console.log("-----getBluetoothDevices---fail")
                console.log(res)
              }
            })
          }
        }
      }
    })
  },
  //开始搜索蓝牙设备, 提示蓝牙搜索
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.showLoading({
      title: '蓝牙搜索'
    });
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,
      success: function (res) {
        if (!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          that.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        console.log(err);
      }
    });
  },
  //获取已配对的蓝牙设备
  getConnectedBluetoothDevices: function () {
    var that = this;
    wx.getConnectedBluetoothDevices({
      services: [that.serviceId],
      success: function (res) {
        console.log(res)
        console.log("获取处于连接状态的设备", res);
        var devices = res['devices'], flag = false, index = 0, conDevList = [];
        console.log(devices);
        devices.forEach(function (value, index, array) {
          console.log(value['name'])
          if (value['name'].indexOf(NAME_FIRST) != -1) {
            // 如果存在包含NAME_FIRST字段的设备
            flag = true;
            index += 1;
            conDevList.push(value['deviceId']);
            that.deviceId = value['deviceId'];
            return;
          }
        });
        console.log(index + "======" + flag)
        if (flag) {
          this.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        } else {
          if (!this.getConnectedTimer) {
            that.getConnectedTimer = setTimeout(function () {
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        if (!this.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    });
  },
  //开启蓝牙搜索功能失败
  onBluetoothDeviceFound: function () {
    var that = this;
    console.log('onBluetoothDeviceFound');
    wx.onBluetoothDeviceFound(function (res) {
      console.log('new device list has founded')
      console.log(res);
      if (res.devices[0]) {
        var name = res.devices[0]['name'];
        if (name != '') {
          if (name.indexOf(NAME_FIRST) != -1) {
            var deviceId = res.devices[0]['deviceId'];
            that.deviceId = deviceId;
            console.log(that.deviceId);
            that.startConnectDevices();
          }
        }
      }
    })
  },
  //开始配对设备
  startConnectDevices: function (ltype, array) {
    var that = this;
    clearTimeout(that.getConnectedTimer);
    that.getConnectedTimer = null;
    clearTimeout(that.discoveryDevicesTimer);
    that.stopBluetoothDevicesDiscovery();
    this.isConnectting = true;
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: function (res) {
        if (res.errCode == 0) {
          setTimeout(function () {
            that.getService(that.deviceId);
          }, 5000)
        }
      },
      fail: function (err) {
        console.log('连接失败：', err);
        if (ltype == 'loop') {
          that.connectDeviceIndex += 1;
          that.loopConnect(array);
        } else {
          that.startBluetoothDevicesDiscovery();
          that.getConnectedBluetoothDevices();
        }
      },
      complete: function () {
        console.log('complete connect devices');
        this.isConnectting = false;
      }
    });
  },
  //连接成功后根据deiviceId获取设备的所有服务
  getService: function (deviceId) {
    var that = this;
    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res);
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        that.getCharacter(deviceId, res.services);
      }
    })
  },
  //读取服务的特征值
  getCharacter: function (deviceId, services) {
    var that = this;
    services.forEach(function (value, index, array) {
      if (value == that.serviceId) {
        that.serviceId = array[index];
      }
    });
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: that.serviceId,
      success: function (res) {
        that.writeBLECharacteristicValue(deviceId, that.serviceId, that.characterId_write);
        that.openNotifyService(deviceId, that.serviceId, that.characterId_read);
      },
      fail: function (err) {
        console.log(err);
      },
      complete: function () {
        console.log('complete');
      }
    })
  },
  loopConnect: function (devicesId) {
    var that = this;
    var listLen = devicesId.length;
    if (devicesId[this.connectDeviceIndex]) {
      this.deviceId = devicesId[this.connectDeviceIndex];
      this.startConnectDevices('loop', devicesId);
    } else {
      console.log('已配对的设备小程序蓝牙连接失败');
      that.startBluetoothDevicesDiscovery();
      that.getConnectedBluetoothDevices();
    }
  }
})