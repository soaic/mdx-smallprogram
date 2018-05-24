import * as echarts from '../../ec-canvas/echarts';
import BiQuadFilter from '../../utils/biqfilter.js';
import patterns from '../../config/patterns.js';
import util from '../../utils/util.js'

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
      that.patternData = patterns.defaultPattern;
      that.originStrData = JSON.stringify(that.patternData)
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
  },
  viewMoveChange: function(e){
    if (isRunReset) return
    let x = e.detail.x + 4;
    let y = e.detail.y + 4;
    let index = e.target.dataset.id;
    if (index != that.data.ctrlViewIndex){
      that.setData({
        ctrlViewIndex: index
      })
    }
    
    let data = that.data.peakingEQList;
    for (let i = 0; i < data.length; i++){
      if(data[i].index == index){
        let item = data[i];
        item.x = x;
        item.y = y;
        item.frequency = getFreqByPointX(item.x, true);
        item.gain = getGainByPointY(item.y);

        // that.setData({
        //   curFreq: util.getFreqFormat(item.frequency),
        //   curGain: util.getGainFormat(item.gain),
        //   curQuality: item.quality.toFixed(1)
        // })

        data[i] = item;
        break;
      }
    }
    setOptionAll(that.chartAll, getAllOption());
    //drawLine(x, y, that.data.curQuality);
  },
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
          circleWidth: item.quality * 20 + 50,
          curQuality: item.quality.toFixed(1)
        })
        break;
      }
    }
  },
  onMoveAreaClick: function (e) {
    //setOption(that.chart, []);
    that.setData({
      ctrlViewIndex: -1
    })
  }, 
  onResetClick: function(e){
    isRunReset = true
    //patterns.initData();
    that.patternData = JSON.parse(that.originStrData);
    let data = getPatternXYData(JSON.parse(that.patternData.peakingEQList));
    that.setData({
      peakingEQList: data,
      ctrlViewIndex: -1
    });
    setTimeout(function(){
      isRunReset = false
    },2000);
  },
  onSaveClick: function(e){
    that.patternData.peakingEQList = that.data.peakingEQList;
    var patternData = JSON.stringify(that.patternData)
    util.redirectPage('../save/save?data=' + patternData)
  },
  onTouchMove: function(e){
    //控制左右滑动圆
    var mType = e.currentTarget.dataset.type
    var changeX = 0
    if(mType == 'left'){
      changeX = that.clientX - e.touches[0].clientX
    }else if(mType == 'right'){
      changeX = e.touches[0].clientX - that.clientX
    }
    var cw = that.data.circleWidth + changeX
    var cq = (cw - 50)/20
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
    setOptionAll(that.chartAll, getAllOption());
  },
  onTouchStart: function(e){
    that.clientX = e.touches[0].clientX
  },
  onTouchEnd: function(e){
    that.clientX = 0
  },
  //导航栏滑动
  swichNav: function (e) {
    if (that.data.currentTab == e.currentTarget.id) {
      return false;
    } else {
      if (e.currentTarget.id == 0) {
        util.redirectPage('../main/main')
      } else if (e.currentTarget.id == 2) {
        util.redirectPage('../hot/hot')
      }
    }
  }
});

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
  BiQuadFilter.biqfilter.create(BIQType, mFreq, SampleFreq, q, mGain);
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
