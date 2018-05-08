// pages/detail.js
import patterns from '../../config/patterns.js';
import util from '../../utils/util.js';

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    description: '',
    tuner: '',
    supportnum: '',
    selectPosition: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this

    if (options.position){
      var patter = patterns.getData(options.position);
      that.setData({
        selectPosition: options.position,
        name: patter.name_zh_cn,
        tuner: '官方',
        supportnum: '0',
        description: '原始耳机音效'
      })
    }

  },
  onDeleteClick: function(e) {
    
    wx.showModal({
      content: '确定要删除 \'' + that.data.name + '\' 音效吗？',
      success: function (res) {
        if (res.confirm) {
          patterns.removeData(that.data.selectPosition)
          util.redirectPage('../main/main')
        }
      }
    })

  },
  onModifyClick: function(options) {
    util.redirectPage('../add/add?position=' + that.data.selectPosition)
  },
  onShareClick: function(options) {

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