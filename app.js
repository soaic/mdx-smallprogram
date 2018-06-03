//app.js
import blueTooth from '/bluetooth/blueToothUtil.js'
const AV = require('libs/av-weapp-min.js');
AV.init({
  appId: 'nSNhFcJCeysT9vRXgfNvtbQF-gzGzoHsz',
  appKey: 'aegQNi8pntiOE4R2z0e5B84D',
});
console.log(AV);

App({
  onLaunch: function () {
    // AV.User.loginWithWeapp().then(user => {
    //   this.globalData.user = user.toJSON();
    //   wx.setStorageSync('uid', this.globalData.user.objectId)
    // }).catch(console.error);
  },
  onShow: function () {
    if (!blueTooth.isConnected()) {
      blueTooth.startConnect()
    }
  },
  globalData: {
    
  },
  getModel: function () { //获取手机型号
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () { //获取微信版本号
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () { //获取操作系统版本
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () { //获取客户端平台
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () { //获取客户端基础库版本
    return this.globalData.sysinfo["SDKVersion"]
  },
  versionCompare: function (ver1, ver2) { //版本比较
    var version1pre = parseFloat(ver1)
    var version2pre = parseFloat(ver2)
    var version1next = parseInt(ver1.replace(version1pre + ".", ""))
    var version2next = parseInt(ver2.replace(version2pre + ".", ""))
    if (version1pre > version2pre)
      return true
    else if (version1pre < version2pre)
      return false
    else {
      if (version1next > version2next)
        return true
      else
        return false
    }
  },
  checkVersion: function(){
    if (this.getPlatform() == 'android' && this.versionCompare('6.5.7', this.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
    else if (this.getPlatform() == 'ios' && this.versionCompare('6.5.6', this.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
  }
})

