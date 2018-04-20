// pages/main.js
import patterns from '../../config/patterns.js' ;
import util from '../../utils/util.js';

let that = this;
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
    selectLongPosition: 0,
    animationBottom: {},
    bottomDisplay: 'none',

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

    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
    })

    that.animation = animation
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onItemClick: function(e){
    that.setData({
      selectPosition: e.currentTarget.id
    });
  },
  onItemLongClick: function(e){
    //长按
    //this.animation.translate(100, 100).step({ duration: 1000 })
    that.setData({
      // animationBottom: animation.export()
      bottomDisplay: 'show',
      selectLongPosition: e.currentTarget.id
    })
  },
  onMoveClick: function(e){
    that.setData({
      bottomDisplay: 'none'
    })
  },
  onModifyClick: function(e){
    that.setData({
      bottomDisplay: 'none'
    });
    util.intentPage('../add/add?position=' + e.currentTarget.id);
  },
  onDeleteClick: function (e) {
    that.setData({
      bottomDisplay: 'none'
    });
    var name = patterns.getData(e.currentTarget.id).name_zh_cn;
    wx.showModal({
      content: '确定要删除 \'' + name+'\' 音效吗？',
      success: function (res) {
        if (res.confirm) {
          patterns.removeData(e.currentTarget.id)
          that.setData({
            patternsData: patterns.getAllData()
          });
        }
      } 
    })
  }
})