// pages/hot.js
import util from '../../utils/util.js'
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curSelect: 0,
    curSelectItem: 1,
    officialData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    usersData:[15,16,17,18,19,20,21,22,23,24,25],
    windowHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;

    var systemInfo = wx.getSystemInfoSync();
    that.setData({
      windowHeight: systemInfo.windowHeight
    })
    
  },
  swiperChange: function (e){
    var current = e.detail.current
    that.setData({
      curSelect: current
    })
  },
  onOfficialClick: function (e){
    that.setData({
      curSelect: 0
    })
  },
  onUserClick: function(e){
    that.setData({
      curSelect: 1
    })
  }, 
  swichNav: function (e) {
    if (e.currentTarget.id == 0) {
      util.redirectPage('../main/main')
    } else if (e.currentTarget.id == 1) {
      util.redirectPage('../add/add')
    } 
  },
  onItemClick: function(e){
    var selectId = e.currentTarget.id
    that.setData({
      curSelectItem: selectId
    });
  }
})