// pages/main.js
import patterns from '../../config/patterns.js' ;
import util from '../../utils/util.js';
import btutil from '../../bluetooth/blueToothUtil.js';
import btrequest from '../../bluetooth/bluetoothRequest.js';
import btresponse from '../../bluetooth/bluetoothResponse.js';
import audioTable from '../../db/audioTable.js';
const AV = require('../../libs/av-weapp-min.js');
const app = getApp();
var that;
var viewWidth;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isConnected:false,
    item_width: 0,
    item_height: 0,
    image_width: 0,
    image_height : 0,
    patternsData: [],
    selectPosition: 0,
    selectName: '',
    selectLongPosition: 0,
    animationBottom: {},
    bottomDisplay: 'none',
    detailViewDisplay : 'none',
    winWidth: 0,
    winHeight: 0,
    currentTab: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    //获取系统信息
    let res = wx.getSystemInfoSync();
    var windowWidth = res.windowWidth;
    var windowHeight = res.windowHeight;
    viewWidth = windowWidth - 30;
    
    this.scaleAnimation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0,
      transformOrigin: "50% 50%"
    })

    that.setData({
      winWidth: windowWidth,
      winHeight: windowHeight,
      item_width: windowWidth / 4 - 5,
      item_height: windowWidth / 4,
      image_width: windowWidth / 4 - 36,
      image_height: (windowWidth / 4 - 36) * 197 / 188,
      isConnected: btutil.isConnected()
    });
    // wx.showLoading({
    //   title: '加载中...',
    // })
    const uid = wx.getStorageSync('uid')
    audioTable.requestMainEq({
      uid: uid,
      success: function (res) {
        //wx.hideLoading()
        var downloadData = wx.getStorageSync("downloadData");
        console.log(downloadData)
        var array = []
        for(var i = 0;i<res.length;i++){
          array.push(res[i].toJSON())
        }
        array = array.concat(downloadData)
        that.setData({
          patternsData: array
        })
      }, fail: function (err) {
        console.error(err)
        //wx.hideLoading()
      }
    })
    
    //设置连接监听
    btutil.setOnConnectListener(function (isConnect) {
      that.setData({
        isConnected: isConnect
      })
    })
    //设置数据接收监听
    btutil.setOnReciverListener(function (res) {
      var rsp = btresponse.data.parseResponse(res.value);

      if (rsp) {
        console.log("rsp = ", rsp);
        switch (rsp.cmd) {
          case btresponse.data.HandShakeRsp: {
            // KvStorage.getInstance().putString(BluetoothContants.LastConnectBluetooth, Bluetooth.getConnectedDeviceAddress()).commit();
            
            //ConfigManager.setHeadsetId("");
            // if (mOnBluetoothistener1 != null) {
            //   mOnBluetoothistener1.onBluetoothStateChanged(BluetoothState.STATE_HAND_SHAKED);
            // }
            // if (mOnBluetoothistener2 != null) {
            //   mOnBluetoothistener2.onBluetoothStateChanged(BluetoothState.STATE_HAND_SHAKED);
            // }
            btutil.send(btrequest.getID());
            btutil.send(btrequest.getEqReq());
            break;
          }

          case btresponse.data.GetIDRsp: {
            var playload = rsp.playLoad;
            var fullId = playload.toString();
            console.log("getIdRsp = " , fullId);
            if (fullId) {
              var pos = fullId.indexOf('0');
              var id = fullId.substring(0, pos);
              console.log("headset.id = " , id);
              if (id) {
                //ConfigManager.setHeadsetId(id);
                //ConfigManager.fetchHeadsetConfigs();
              }
              // if (mOnBluetoothistener1 != null) {
              //   mOnBluetoothistener1.onBluetoothStateChanged(BluetoothState.STATE_GOT_ID);
              // }

              // if (mOnBluetoothistener2 != null) {
              //   mOnBluetoothistener2.onBluetoothStateChanged(BluetoothState.STATE_GOT_ID);
              // }
            }
            break;
          }
        }
        // if (mOnBluetoothistener1 != null) {
        //   mOnBluetoothistener1.onDataReceived(rsp);
        // }

        // if (mOnBluetoothistener2 != null) {
        //   mOnBluetoothistener2.onDataReceived(rsp);
        // }
      }
    })
  },
  //音效点击
  onItemClick: function(e){

    that.scaleAnimation.scale(1.1, 1.1).step().scale(1, 1).step()
    

    let index = e.currentTarget.id
    let pattern = that.data.patternsData[index]
    pattern['id'] = pattern.objectId
    that.setData({
      selectPosition: index,
      selectName: pattern.name_zh_cn,
      detailViewDisplay: 'show',
      scaleAnimation: that.scaleAnimation.export()
    });
    //把pattern数据转成ArrayBuffer,然后通过蓝牙发送数据
    if (that.data.isConnected){
      var btData = btrequest.createPeakingEQ(pattern)
      btutil.send(btData)
    }
    if (that.detailDisplayTimer){
      clearTimeout(that.detailDisplayTimer)
    }
    that.detailDisplayTimer = setTimeout(function(){
      that.setData({
        detailViewDisplay: 'none'
      })
    },3000);

  },
  //详情
  bindGetUserInfo: function(e){
    // if (e.detail.userInfo) {
    //   const user = AV.User.current();
    //   user.set(e.detail.userInfo).save().then(user => {
    //     app.globalData.user = user.toJSON();
    //   }).catch(console.error);
    // }
    that.setData({
      detailViewDisplay: 'none'
    });
    util.intentPage('../detail/detail?data=' + JSON.stringify(that.data.patternsData[that.data.selectPosition]))
  },
  onHomeClick: function (e) {
    
  },
  //页面改变
  bindChange: function (e) {
    that.setData({ currentTab: e.detail.current });
  }, 
  //导航栏滑动
  swichNav: function (e) {
    if (that.data.currentTab == e.currentTarget.id) {
      return false;
    } else {
      if(e.currentTarget.id == 1){
        util.redirectPage('../add/add')
      } else if (e.currentTarget.id == 2){
        util.redirectPage('../hot/hot')
      }
    }
  }
})

