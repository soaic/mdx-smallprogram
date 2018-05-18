// pages/hot.js
import util from '../../utils/util.js'
import audioTable from '../../db/audioTable.js';

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curSelect: 0,
    curSelectItem: null,
    officialData: [],
    usersData:[],
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

    audioTable.queryOfficalShare({
      success: function(res){
        that.setData({
          officialData: res
        })
      }, fial: function(res){
        console.log(res)
      }
    })

    audioTable.queryUserShare({
      success: function (res) {
        that.setData({
          usersData: res
        })
      }, fial: function (res) {
        console.log(res)
      }
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
  },
  
  onLikeClick: function(e){
    if (!that.data.curSelectItem){
      return;
    }
    audioTable.nickEq({
      id: that.data.curSelectItem,
      success: function (res) {
        console.log(res)
        
      }, fial: function (res) {
        console.log(res)
      }
    })
  }
})