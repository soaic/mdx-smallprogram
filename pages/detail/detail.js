// pages/detail.js
import patterns from '../../config/patterns.js';
import util from '../../utils/util.js';
import audioTable from '../../db/audioTable.js';

var that;
var app = getApp();
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
    if (!app.globalData.user || that.patter.uid != app.globalData.user.objectId) {
      wx.showActionSheet({
        itemList: ['你无权删除非原著作品'],
        success: function (res) {

        }
      })
      return
    }
    wx.showModal({
      content: '确定要删除 \'' + that.patter.name_zh_cn + '\' 音效吗？',
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
    if (!app.globalData.user || that.patter.uid != app.globalData.user.objectId){
      wx.showActionSheet({
        itemList: ['你无权修改非原著作品'],
        success: function (res) {
          
        }
      })
      return
    }
    util.redirectPage('../add/add?data=' + JSON.stringify(that.patter))
  },
  onShareClick: function(options) {
    if (!app.globalData.user || that.patter.uid != app.globalData.user.objectId) {
      wx.showActionSheet({
        itemList: ['你无权分享非原著作品'],
        success: function (res) {

        }
      })
      return
    }

    wx.showActionSheet({
      itemList: ['分享到热门音效','分享给好友'],
      success: function(res){
        if(res.tapIndex == 0){
          //分享
          if (that.patter.shareState != '0') {
            wx.showToast({
              title: '重复分享',
            })
            return;
          }
          console.log(that.patter.id)
          audioTable.share({
            id: that.patter.id,
            success: function (res) {
              that.patter.shareState = res.attributes.shareState
              wx.showToast({
                title: '分享成功',
              })
            },
            fail: function (err) {
              wx.showToast({
                title: '分享失败,青重试',
              })
            }
          })
        }else if(res.tapIndex == 1){
          wx.showModal({
            title: '提示',
            content: '请点击右上角菜单按钮分享给好友',
          })
        }
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
  },
  onShareAppMessage: function (options){
    return {
      title: that.patter.name_zh_cn,
      path: '/pages/detail/detail?data=' + JSON.stringify(that.patter)
    }
  }
})