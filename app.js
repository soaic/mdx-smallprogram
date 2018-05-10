//app.js

import blueTooth from '/bluetooth/blueToothUtil.js'

App({
  onLaunch: function () {
    
  },
  onShow: function () {
    if (blueTooth.isResetConntct()) {
      blueTooth.startConnect()
    }
  }
})

