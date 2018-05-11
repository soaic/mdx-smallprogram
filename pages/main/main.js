// pages/main.js
import patterns from '../../config/patterns.js' ;
import util from '../../utils/util.js';
import btutil from '../../bluetooth/blueToothUtil.js'
import btrequest from '../../bluetooth/bluetoothRequest.js'

const app = getApp();
var that;
var viewWidth;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item_width: 0,
    item_height: 0,
    image_width: 0,
    image_height : 0,
    patternsData: patterns.getAllData(),
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
    
    that.setData({
      winWidth: windowWidth,
      winHeight: windowHeight,
      item_width: windowWidth / 4 - 5,
      item_height: windowWidth / 4,
      image_width: windowWidth / 4 - 26,
      image_height: (windowWidth / 4 - 26) * 188 / 197
    });
  },
  //音效点击
  onItemClick: function(e){
    let pattern = patterns.getData(e.currentTarget.id)
    that.setData({
      selectPosition: e.currentTarget.id,
      selectName: pattern.name_zh_cn,
      detailViewDisplay: 'show'
    });
    //把pattern数据转成ArrayBuffer,然后通过蓝牙发送数据
    var btData = btrequest.createPeakingEQ(pattern)
    btutil.send(btData)

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
  onDetailClick: function(e){
    that.setData({
      detailViewDisplay: 'none'
    });
    util.redirectPage('../detail/detail?position=' + that.data.selectPosition)
  },
  //删除
  onHomeClick: function (e) {
    btutil.read()
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

      }
    }
  }
})

