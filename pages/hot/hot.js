// pages/hot.js
import util from '../../utils/util.js'
import audioTable from '../../db/audioTable.js';

var that;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curSelect: 0,
    curSelctItemIndex: -1,
    curSelctTop: 0,
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
    that.setData({
      curSelectItem: e.currentTarget.id,
      curSelctItemIndex: e.currentTarget.dataset.index,
      curSelctTop: that.data.curSelect
    });

    if (that.operationDisplayTimer) {
      clearTimeout(that.detailDisplayTimer)
    }
    that.operationDisplayTimer = setTimeout(function () {
      that.setData({
        curSelectItem: null
      })
    }, 3000);
  },
  
  onLikeClick: function(e){
    if (!that.data.curSelectItem){
      return;
    }
    audioTable.nickEq({
      id: that.data.curSelectItem,
      success: function (res) {
        wx.showToast({
          title: '点赞成功',
        })
        
        if (that.data.curSelctTop == 0){
          that.data.officialData[that.data.curSelctItemIndex] = res
          console.log(that.data.officialData)
          that.setData({
            officialData: that.data.officialData
          })
        } else if (that.data.curSelctTop == 1){
          that.data.usersData[that.data.curSelctItemIndex] = res
          that.setData({
            usersData: that.data.usersData
          })
        }
      }, fial: function (res) {
        wx.showToast({
          title: '点赞失败',
        })
      }
    })
  },
  searchInput: function(e){
    var searchText = e.detail.value
    audioTable.searchEq({
      searchText: searchText,
      shareState: that.data.curSelect == 0?1:2,
      success: function(res){
        if(that.data.curSelect == 0){
          that.setData({
            officialData: res
          })
        }else if(that.data.curSelect == 1){
          that.setData({
            usersData: res
          })
        }
      }, fail: function(err){

      }
    })
  },
  onDownloadClick: function(e){
    if (!that.data.curSelectItem) {
      return;
    }
    var downloadData = wx.getStorageSync("downloadData");
    if (downloadData){
      for(var i = 0; i < downloadData.length; i++){
        if (that.data.curSelectItem == downloadData[i].objectId){
          wx.showToast({
            title: '重复下载',
          })
          return;
        }
      }
    }else{
      downloadData = []
    }

    if (that.data.curSelctTop == 0) {
      var curItem = that.data.officialData[that.data.curSelctItemIndex]
      downloadData.push(curItem)
      wx.setStorage({ key: 'downloadData', data: downloadData})
      wx.showToast({
        title: '下载成功',
      })
    } else if (that.data.curSelctTop == 1) {
      var curItem = that.data.usersData[that.data.curSelctItemIndex]
      downloadData.push(curItem)
      wx.setStorage({ key: 'downloadData', data: downloadData })
      wx.showToast({
        title: '下载成功',
      })
    }
    that.setData({
      curSelectItem: null
    })
  }
})