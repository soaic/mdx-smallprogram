// pages/main.js
import patterns from '../../config/patterns.js' ;

let that = this;
let startTime, endTime;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item_width: 0,
    item_height: 0,
    image_width: 0,
    image_height : 0,
    patternsData: [],
    selectPosition: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        //获取宽度
        var windowWidth = res.windowWidth;
        that.setData({
          item_width: windowWidth / 4 - 26,
          item_height: windowWidth / 4,
          image_width: windowWidth / 4 - 26,
          image_height: (windowWidth / 4 - 26) * 240 / 230
        })
      }
    })  

    //初始化数据
    that.setData({
      patternsData: patterns.getDefaultPatterns()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onItemClick: function(e){
    //处理与长按冲突问题
    if (that.endTime - that.startTime < 350) {
      that.setData({
        selectPosition: e.currentTarget.id
      });
    }
  },
  bindTouchStart: function (e) {
    that.startTime = e.timeStamp;
  },
  bindTouchEnd: function (e) {
    that.endTime = e.timeStamp;
  },
  onItemLongClick: function(e){
    //长按
    
  }
})