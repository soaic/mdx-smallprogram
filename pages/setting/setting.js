// pages/setting/setting.js
import util from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  onHomeClick: function(e){
    wx.switchTab({
      url: '/pages/main/main'
    })
  },

  onAddClick: function(e){
    util.intentPage('/pages/add/add');
  },

  onSettingClick: function(e){

  }

})