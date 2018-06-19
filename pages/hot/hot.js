// pages/hot.js
import util from '../../utils/util.js'
import audioTable from '../../db/audioTable.js';
import btutil from '../../bluetooth/blueToothUtil.js';
import btrequest from '../../bluetooth/bluetoothRequest.js';

var that;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curSelect: 0,
    curSelctItemIndex: -1,
    curSelectItem: null,
    officialData: [],
    usersData:[],
    windowHeight: 0,
    windowWidth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.sort = 'createdAt'
    that.translateAnimation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    var systemInfo = wx.getSystemInfoSync();
    that.setData({
      windowHeight: systemInfo.windowHeight,
      windowWidth: systemInfo.windowWidth
    })

    wx.showLoading({
      title: '加载中...',
    })

    queryOffice()
    queryUser()

    audioTable.queryUserShare({
      sort: that.sort,
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

    // that.translateAnimation.translate(that.data.windowWidth, 0).step()
    // that.translateAnimation.translate(0, 0).step({ duration: 0})

    that.setData({
      curSelectItem: e.currentTarget.id,
      curSelctItemIndex: e.currentTarget.dataset.index
    });

    if (that.operationDisplayTimer) {
      clearTimeout(that.operationDisplayTimer)
    }
    that.operationDisplayTimer = setTimeout(function () {
      that.setData({
        curSelectItem: null
      })
    }, 3000);
    var pattent
    if (that.data.curSelect == 0) {
      pattent = that.data.officialData[that.data.curSelctItemIndex]
    } else if (that.data.curSelect == 1) {
      pattent = that.data.usersData[that.data.curSelctItemIndex]
    }
    if (btutil.isConnected()) {
      if (pattent) {
        var btData = btrequest.createPeakingEQ(pattent.attributes)
        btutil.send(btData)
      }
    }
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
        
        if (that.data.curSelect == 0){
          that.data.officialData[that.data.curSelctItemIndex] = res
          console.log(that.data.officialData)
          that.setData({
            officialData: that.data.officialData
          })
        } else if (that.data.curSelect == 1){
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

    if (that.data.curSelect == 0) {
      var curItem = that.data.officialData[that.data.curSelctItemIndex]
      downloadData.push(curItem)
      wx.setStorage({ key: 'downloadData', data: downloadData})
      wx.showToast({
        title: '下载成功',
      })
    } else if (that.data.curSelect == 1) {
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
  },
  sortClick: function(res){
    wx.showActionSheet({
      itemList: ['按时间','按点赞数'],
      success: function(r){
        if(r.tapIndex == 0){
          that.sort = 'createdAt'
          if (that.data.curSelect == 0) {
            queryOffice()
          } else if (that.data.curSelect == 1) {
            queryUser()
          }
        } else if(r.tapIndex == 1){
          that.sort = 'nicknum'
          if (that.data.curSelect == 0) {
            queryOffice()
          } else if (that.data.curSelect == 1) {
            queryUser()
          }
        }
      }
    })
  }
})

function queryOffice(){
  audioTable.queryOfficalShare({
    sort: that.sort,
    success: function (res) {
      wx.hideLoading()
      that.setData({
        officialData: res
      })
    }, fial: function (res) {
      console.log(res)
      wx.hideLoading()
    }
  })
}

function queryUser(){
  audioTable.queryUserShare({
    sort: that.sort,
    success: function (res) {
      that.setData({
        usersData: res
      })
    }, fial: function (res) {
      console.log(res)
    }
  })
}