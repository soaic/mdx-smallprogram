// pages/save/save.js
import util from '../../utils/util.js';
import patterns from '../../config/patterns.js';

var that;
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
    winHeight: 0,
    icon:'',
    name:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    if(options.data){
      that.parttenEq = JSON.parse(options.data)
      that.name = options.name
      that.position = options.position
      that.icon = options.icon
    }

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
      image_height: (windowWidth / 4 - 26) * 188 / 197,
      icon: that.icon,
      name: that.name
    });

  },
  onItemClick: function (e) {
    var icon = e.currentTarget.id;
    that.setData({
      icon: icon
    })
  },
  bindNameInput: function(e){
    that.name = e.detail.value
  },
  bindDesciptInput: function(e){
    that.descript = e.detail.value
    
  },
  swichNav: function (e) {
    if (e.currentTarget.id == 0) {
      util.redirectPage('../main/main')
    } else if (e.currentTarget.id == 1) {
      util.redirectPage('../add/add')
    } else if (e.currentTarget.id == 2) {

    }
  },
  onCancelClick: function(e){

  },
  onConfirmClick: function(e){
    var partten = {}
    partten['name_zh_tw'] = that.name;
    partten['peakingEQList'] = that.parttenEq;
    partten['descript'] = that.descript;
    
    partten['icon'] = that.data.icon
    let position = that.position
    if (!position) {
      position = patterns.getLastPosition() + 1
    }
    partten['position'] = position;
    console.log(partten);
  }
})