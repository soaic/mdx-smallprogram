// pages/save/save.js
import util from '../../utils/util.js';
import patterns from '../../config/patterns.js';
import audioTable from '../../db/audioTable.js'

var that;
var app = getApp();
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
    name:'',
    descript: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    if(options.data){
      that.partten = JSON.parse(options.data)
      that.parttenEq = that.partten.peakingEQList
      for (var i = 0; i < that.parttenEq.length; i++) {
        delete that.parttenEq[i]['x']
        delete that.parttenEq[i]['y']
      }
      that.name = that.partten.name_zh_cn
      that.position = that.partten.position
      that.descript = that.partten.descript
      that.icon = that.partten.icon
    }else{
      that.name = ''
      that.descript = ''
      that.position = 0
      that.icon = 'pattern_1'
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
      name: that.name,
      descript: that.descript
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
    util.redirectPage('../add/add')
  },
  onConfirmClick: function(e){
    that.partten.name_zh_cn = that.name;
    that.partten.descript = that.descript;
    that.partten.icon = that.data.icon
    that.partten['uname'] = app.globalData.user.nickName
    that.partten['uphoto'] = app.globalData.user.avatarUrl

    if (!that.partten.name_zh_cn){
      wx.showToast({
        title: '请填写名称',
      })
      return
    }
    if (!that.partten.descript) {
      wx.showToast({
        title: '请填写介绍',
      })
      return
    }
    if (!that.partten.icon) {
      wx.showToast({
        title: '请选择图标',
      })
      return
    }

    if(that.partten.id){
      //更新
      audioTable.update({
        content: that.partten,
        success: function (res) {
          util.redirectPage('../main/main')
        }, fail: function (err) {
          console.error(err)
        }
      })
    }else{
      //保存
      that.partten['uid'] = app.globalData.user.objectId
      that.partten['uname'] = app.globalData.user.nickName
      that.partten['uphoto'] = app.globalData.user.avatarUrl
      audioTable.save({
        content: that.partten,
        success: function(res){
          util.redirectPage('../main/main')
        },fail: function (err){
          console.error(err)
        }
      })
    }

    
  }
})