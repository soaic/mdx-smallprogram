import * as echarts from '../../ec-canvas/echarts';
import BiQuadFilter from '../../utils/biqfilter.js';
import patterns from '../../config/patterns.js';
import util from '../../utils/util.js'
import btrequest from '../../bluetooth/bluetoothRequest.js';
import btutil from '../../bluetooth/blueToothUtil.js';

const AV = require('../../libs/av-weapp-min.js');
const MinFreq = 20;
const MaxFreq = 20000;
const MinQuality = 0.3;
const MaxQuality = 3.0;
const MinGain = -10;
const MaxGain = 10;
const SampleFreq = 44100;
const ViewHeight = 200;
const BIQType = 3;
const WarningMaxDB = 12;
const ErrorMaxDB = 40;

const app = getApp();
var that;
var viewWidth;
var curPosition;
var isRunReset = false;

var isSend = true;  //是否需要发送
var isCompareing = false; //是否对比
var isEdited = false; //是否编辑了
var isOriginSound = true;//是否是原声
Page({
  data: {
    ctrlViewIndex : -1,
    peakingEQList : [],
    topX: 0,
    winWidth:0,
    winHeight:0,
    curFreq:'0.0',
    curQuality: '0.0',
    curGain:'+0.0',
    tipFreq100Margin:0,
    tipFreq1KMargin: 0,
    tipFreq10KMargin: 0,
    tipFreq20KMargin: 0,
    circleWidth:70,
    compareText: '原声',
    ec: {
      onInit: function (canvas, width, height) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(chart);
        that.chart = chart;
        return chart;
      }
    },
    ecAll: {
      onInit: function (canvas, width, height) {
        const chartAll = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(chartAll);
        that.chartAll = chartAll;
        setOptionAll(chartAll, getAllOption());
        return chartAll;
      }
    }
  },
  onLoad: function (option){
    that = this;
    let res = wx.getSystemInfoSync();
    //获取屏幕宽度
    viewWidth = res.windowWidth - 30;
    var peq;
    if (option.data){
      that.patternData = JSON.parse(option.data);
      that.originStrData = option.data;
      peq = JSON.parse(that.patternData.peakingEQList)  //数据库存放的是json字符串，需要转换json对象
    }else{
      that.originStrData = JSON.stringify(patterns.defaultPattern)
      that.patternData = JSON.parse(that.originStrData)
      peq = that.patternData.peakingEQList
    }
    
    let data = getPatternXYData(peq);
    that.setData({
      peakingEQList: data,
      winWidth: res.windowWidth,
      winHeight: res.windowHeight,
      tipFreq100Margin: getPointXByFreq(100),
      tipFreq1KMargin: getPointXByFreq(1000),
      tipFreq10KMargin: getPointXByFreq(10000),
      tipFreq20KMargin: getPointXByFreq(20000),
    });
    if (that.sendDataTimer) {
      clearInterval(that.sendDataTimer)
    }
    that.sendDataTimer = setInterval(sendData, 200);
  },
  //圆点移动
  viewMoveChange: function(e){
    if (isRunReset) return
    isEdited = true
    isSend = true;  //控制可以发送蓝牙数据
    let x = e.detail.x + 4;
    let y = e.detail.y + 4;
    let index = e.target.dataset.id;
    // if(!that.curX || !that.curY){
    //   that.curX = x;
    //   that.curY = y;
    // }
    if (index != that.data.ctrlViewIndex){
      that.setData({
        ctrlViewIndex: index
      })
    }
    // else{
    //   if (Math.abs(that.curX - x) >= 10 || Math.abs(that.curY - y) >= 10){
    //     that.curX = x;
    //     that.curY = y;
    //   }else{
    //     return;
    //   }
    //   //console.log(that.curX + '--------------' + that.curY)
    // }
    let data = that.data.peakingEQList;
    for (let i = 0; i < data.length; i++){
      if(data[i].index == index){
        let item = data[i];
        item.x = x;
        item.y = y;
        item.frequency = getFreqByPointX(item.x, true);
        item.gain = getGainByPointY(item.y);

        that.setData({
          curFreq: util.getFreqFormat(item.frequency),
          curGain: util.getGainFormat(item.gain),
          curQuality: item.quality.toFixed(1)
        })

        data[i] = item;
        break;
      }
    }
    setOptionAll(that.chartAll, getAllOption());
    //drawLine(x, y, that.data.curQuality);
  },
  //圆点点击
  onCtrlViewClick: function(e){
    let indexId = e.currentTarget.id;
    let x = e.detail.x + 4;
    let y = e.detail.y + 4;
    that.setData({
      ctrlViewIndex: indexId
    })

    let data = that.data.peakingEQList;
    for (let i = 0; i < data.length; i++) {
      if (data[i].index == indexId) {
        let item = data[i];
        that.setData({
          circleWidth: item.quality * 20 + 30,
          curQuality: item.quality.toFixed(1)
        })
        break;
      }
    }
  },
  //移动区域点击 取消选中
  onMoveAreaClick: function (e) {
    //setOption(that.chart, []);
    that.setData({
      ctrlViewIndex: -1
    })
  }, 
  //复位
  onResetClick: function(e){
    isEdited = false
    isRunReset = true
    isSend = true
    that.patternData = JSON.parse(that.originStrData);
    var peq = typeof that.patternData.peakingEQList == 'string' ? JSON.parse(that.patternData.peakingEQList) : that.patternData.peakingEQList
    let data = getPatternXYData(peq);
    that.setData({
      peakingEQList: data,
      ctrlViewIndex: -1
    });
    setTimeout(function(){
      isRunReset = false
    },2000);
    setOptionAll(that.chartAll, getAllOption());
  },
  //保存
  bindGetUserInfo: function(e){
    if (e.detail.userInfo){
      const user = AV.User.current();
      user.set(e.detail.userInfo).save().then(user => {
        app.globalData.user = user.toJSON();
      }).catch(console.error);

      saveData();
    }
  },
  //控制左右滑动圆移动
  onTouchMove: function(e){
    isEdited = true
    var mType = e.currentTarget.dataset.type
    var changeX = 0
    if(mType == 'left'){
      changeX = that.clientX - e.touches[0].clientX
    }else if(mType == 'right'){
      changeX = e.touches[0].clientX - that.clientX
    }
    var cw = that.data.circleWidth + changeX
    var cq = (cw - 30)/20
    if (cq < MinQuality || cq > MaxQuality){
      return;
    }
    that.setData({
      circleWidth: cw,
      curQuality: cq.toFixed(1)
    }) 
    that.clientX = e.touches[0].clientX

    let data = that.data.peakingEQList;
    for (let i = 0; i < data.length; i++) {
      if (data[i].index == that.data.ctrlViewIndex) {
        let item = data[i];
        item.quality = cq
        break;
      }
    }
    isSend = true;//控制可以发送蓝牙数据
    setOptionAll(that.chartAll, getAllOption());
  },
  //控制左右滑动圆开始滑动
  onTouchStart: function(e){
    that.clientX = e.touches[0].clientX
  },
  //控制左右滑动圆结束滑动
  onTouchEnd: function(e){
    that.clientX = 0
  },
  //导航栏滑动
  swichNav: function (e) {
    if (that.data.currentTab == e.currentTarget.id) {
      return false;
    } else {
      if (isEdited){
        //提示是否保存
        wx.showModal({
          content: '是否保存?',
          confirmText: '保存',
          success: function (res) {
            if (res.confirm) {
              if(app.globalData.user){
                saveData()
              }
            } else if (res.cancel) {
              if (e.currentTarget.id == 0) {
                util.redirectPage('../main/main')
              } else if (e.currentTarget.id == 2) {
                util.redirectPage('../hot/hot')
              }
            }
          }
        })
      }else{
        if (e.currentTarget.id == 0) {
          util.redirectPage('../main/main')
        } else if (e.currentTarget.id == 2) {
          util.redirectPage('../hot/hot')
        }
      }

      
    }
  },
  //对比
  onCompareClick: function(e){
    if (isOriginSound) {
      isOriginSound = false;
    } else {
      isOriginSound = true;
    }
    that.setData({
      compareText: isOriginSound ? '原声' : '音效'
    })
    if (!btutil.isConnected()) {
      btutil.startConnect()
      return
    }

    if (isCompareing){
      isCompareing = false
    }else{
      isSend = true;
      isCompareing = true
    }

    
    if (that.sendDataTimer) {
      clearInterval(that.sendDataTimer)
    }
    if (isCompareing){
      that.sendDataTimer = setInterval(sendData, 200);
    }else{
      let btData = btrequest.createPeakingEQ(JSON.parse(that.originStrData))
      btutil.send(btData)
    }
    
  }
});

function saveData(){
  if (that.patternData.objectId) {
    wx.showActionSheet({
      itemList: ['保存', '另存为'],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.patternData.peakingEQList = that.data.peakingEQList;
          var patternData = JSON.stringify(that.patternData)
          util.redirectPage('../save/save?data=' + patternData)
        } else if (res.tapIndex == 1) {
          var pdata = {}
          pdata.position = '0'
          pdata.peakingEQList = that.data.peakingEQList
          var patternData = JSON.stringify(pdata)
          util.redirectPage('../save/save?data=' + patternData)
        }
      }
    })
  } else {
    that.patternData.peakingEQList = that.data.peakingEQList;
    var patternData = JSON.stringify(that.patternData)
    util.redirectPage('../save/save?data=' + patternData)
  }
}

function sendData(){
  if (isSend && isCompareing) {
    that.patternData.position = 0
    let btData = btrequest.createPeakingEQ(that.patternData)
    btutil.send(btData)
    isSend = false
  }
}

function getAllOption(){
  var data = that.data.peakingEQList;
  var dataTemp = [];
  for (var i = 0; i < data.length; i++) {
    var biqArray = getBIQArrayDataByPointXY(data[i].x, data[i].y, data[i].quality);
    for(var j = 0; j< biqArray.length; j++){
      if (dataTemp[j] && dataTemp[j].length == 2){
        dataTemp[j][1] = dataTemp[j][1] + biqArray[j][1]
        // if (dataTemp[j][1]>MaxGain-1){
        //   dataTemp[j][1] = MaxGain-1
        // } else if (dataTemp[j][1] < MinGain + 1){
        //   dataTemp[j][1] = MinGain + 1
        // }
      }else{
        var tempItem = [];
        tempItem.push(biqArray[j][0]);
        tempItem.push(biqArray[j][1]);
        dataTemp.push(tempItem);
      }
    }
  }
  return dataTemp;
}

function setOption(chart, data) {
  var option = {
    backgroundColor: "rgba(250, 250, 250, 0)",
    color: ["#fc9b28"],
    animation: false,
    tooltip: {
      show: false,
      trigger: 'axis',
    },

    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      show: false,
      axisLine: {
        lineStyle: {
          color: "#000000"
        }
      },
    },
    yAxis: {
      x: 'center',
      type: 'value',
      show: false,
      max: MaxGain,
      min: MinGain
    },
    splitLine: {
      lineStyle: {
        color: "#FFFFFF"
      }
    },
    series: [{
      type: 'line',
      smooth: false,
      data: data,
      symbol: 'none'
    }]
  };
  chart.setOption(option);
}

function setOptionAll(chart, data) {
  var option = {
    backgroundColor: "rgba(250, 250, 250, 0)",
    color: ["#666666"],
    animation: false,
    tooltip: {
      show: false,
      trigger: 'axis',
    },
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      show: false,
      axisLine: {
        lineStyle: {
          color: "#000000"
        }
      },
    },
    yAxis: {
      x: 'center',
      type: 'value',
      show: false,
      max: MaxGain,
      min: MinGain
    },
    splitLine: {
      lineStyle: {
        color: '#FFFFFF'
      }
    },
    series: [{
      type: 'line',
      smooth: false,
      data: data,
      symbol: 'none',
      // areaStyle: {},
      lineStyle: {
        color: '#FFFFFF',
        width: 2,
        type: 'solid'
      }
    }]
  };
  chart.setOption(option);
}

function drawLine(x, y, q) {
    //var dataArray = getBIQArrayDataByPointXY(x, y, q);
    //setOption(that.chart, dataArray);
    setOptionAll(that.chartAll, getAllOption());
}


function getBIQArrayDataByPointXY(x, y, q){
  var mGain = getGainByPointY(y);
  var mFreq = getFreqByPointX(x, false);

  var tempQ = (3.0 - (q - 0.3))

  BiQuadFilter.biqfilter.create(BIQType, mFreq, SampleFreq, tempQ, mGain);
  var dataArray = new Array();
  let da
  for (var i = 0; i < MaxFreq; i = i + 100) {
    var PointY = BiQuadFilter.biqfilter.log_result(i);
    
    da = new Array();
    da.push(i);
    da.push(PointY);
    dataArray.push(da);
  }
  return dataArray;
}

function getFreqByPointX(x, isReal){
  if (isReal){
    var percent = x / viewWidth;
    var logv = percent * (Math.log10(MaxFreq) - Math.log10(MinFreq)) + Math.log10(MinFreq);
    return Math.pow(10, logv);
  }else{
    return x * MaxFreq / viewWidth;
  }
}

function getPointXByFreq(freq){
  var percentF = (Math.log10(freq) - Math.log10(MinFreq)) / (Math.log10(MaxFreq) - Math.log10(MinFreq));
  return viewWidth * percentF;
}

function getGainByPointY(y){
  var mGain;
  if (y < 0) {
    mGain = MaxGain;
  } else if (y >= 0 && y < ViewHeight / 2) {
    mGain = Math.abs(y / (ViewHeight / MaxGain / 2) - MaxGain);
  } else if (y >= ViewHeight / 2 && y < ViewHeight) {
    mGain = (ViewHeight / 2 - y) / (ViewHeight / MaxGain / 2)
  } else {
    mGain = MinGain;
  }
  return mGain;
}

function getPointYByGain(gain){
  var y;
  if (gain >= MaxGain) {
    y = 0;
  } else if (gain < MaxGain && gain >= 0) {
    y = (ViewHeight / 2) - (ViewHeight / MaxGain / 2) * gain;
  } else if (gain < 0 && gain >= MinGain) {
    y = Math.abs(ViewHeight / MaxGain / 2 * gain) + (ViewHeight / 2)
  } else {
    y = ViewHeight;
  }
  return y;
}

function getPatternXYData(data) {
  var tempData= []
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    item.x = getPointXByFreq(item.frequency);
    item.y = getPointYByGain(item.gain);
    tempData[i] = item;
  }
  return data;
}
