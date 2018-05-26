// pages/detail.js
import patterns from '../../config/patterns.js';
import util from '../../utils/util.js';
import audioTable from '../../db/audioTable.js';

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    patter:{}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    if (options.data){
      that.patter = JSON.parse(options.data);
      that.setData({
        patter: that.patter
      })
    }

  },
  onDeleteClick: function(e) {
    wx.showModal({
      content: '确定要删除 \'' + that.data.name + '\' 音效吗？',
      success: function (res) {
        if (res.confirm) {
          patterns.removeData(that.data.selectPosition)

          audioTable.del({
            id: that.patter.id,
            success: function(e){
              wx.showToast({
                title: '删除成功',
              })
              util.redirectPage('../main/main')
            },fail: function(e){
              wx.showToast({
                title: '删除失败',
              })
            }
          })
          

          
        }
      }
    })

  },
  onModifyClick: function(options) {
    util.redirectPage('../add/add?data=' + JSON.stringify(that.patter))
  },
  onShareClick: function(options) {
    var that = this;
    //分享
    if (that.patter.shareState != '0'){
      wx.showToast({
        title: '重复分享',
      })
      return;
    }
    console.log(that.patter.id)
    audioTable.share({
      id: that.patter.id,
      success: function(res){
        that.patter.shareState = res.attributes.shareState
        wx.showToast({
          title: '分享成功',
        })
      },
      fail: function(err){
        wx.showToast({
          title: '分享失败,青重试',
        })
      }
    })
  },
  swichNav: function (e) {
    if (e.currentTarget.id == 0) {
      util.redirectPage('../main/main')
    } else if (e.currentTarget.id == 1) {
      util.redirectPage('../add/add')
    } else if (e.currentTarget.id == 2) {
      util.redirectPage('../hot/hot')
    } 
  }

})