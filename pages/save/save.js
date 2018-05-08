// pages/save/save.js
import util from '../../utils/util.js';

var that
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagesData:[],
    item_width: 0,
    item_height: 0,
    image_width: 0,
    image_height: 0, 
    winWidth: 0,
    winHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    var images = []
    for(var i = 1; i <= 16 ;i++){
      images.push("pattern_"+i)
    }

    let res = wx.getSystemInfoSync();
    var windowWidth = 320;
    var windowHeight = res.windowHeight;

    that.setData({
      imagesData: images,
      winWidth: windowWidth,
      winHeight: windowHeight,
      item_width: windowWidth / 4 - 5,
      item_height: windowWidth / 4,
      image_width: windowWidth / 4 - 26,
      image_height: (windowWidth / 4 - 26) * 188 / 197
    });

  },
  onItemClick: function (e) {

  },
  bindNameInput: function(e){
    var name = e.detail.value

  },
  bindDesciptInput: function(e){
    var descript = e.detail.value
  },
  swichNav: function (e) {
    if (e.currentTarget.id == 0) {
      util.redirectPage('../main/main')
    } else if (e.currentTarget.id == 1) {
      util.redirectPage('../add/add')
    } else if (e.currentTarget.id == 2) {

    }
  }
})