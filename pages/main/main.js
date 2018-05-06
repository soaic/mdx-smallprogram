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
    wx.getSystemInfo({
      success: function (res) {
        var windowWidth = res.windowWidth;
        var windowHeight = res.windowHeight;
        that.setData({
          winWidth: windowWidth,
          winHeight: windowHeight,
          item_width: windowWidth / 4 - 5,
          item_height: windowWidth / 4,
          image_width: windowWidth / 4 - 26,
          image_height: (windowWidth / 4 - 26) * 188 / 197
        })
      }
    })  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onItemClick: function(e){
    that.setData({
      selectPosition: e.currentTarget.id,
      selectName: patterns.getData(e.currentTarget.id).name_zh_cn,
      detailViewDisplay: 'show'
    });

    setTimeout(function(){
      that.setData({
        detailViewDisplay: 'none'
      })
    },3000);

  },
  onDetailClick: function(e){
    that.setData({
      detailViewDisplay: 'none'
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
  },
  bindChange: function (e) {
    that.setData({ currentTab: e.detail.current });
  }, 
  swichNav: function (e) {
    if (that.data.currentTab == e.currentTarget.id) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.id
      })
    }
  }  
})