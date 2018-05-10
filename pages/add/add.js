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

const app = getApp();
var that;
var patternData;
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
    curQuality:'1.0',
    curGain:'+0.0',
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
    curPosition = option.position
    if (!curPosition){
      curPosition = 0
    }
    patternData = patterns.getData(curPosition);
    let data = getPatternXYData(patternData.peakingEQList);
    that.setData({
      peakingEQList: data,
      winWidth: res.windowWidth,
      winHeight: res.windowHeight
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
    drawLine(x, y, 1.0);
    
    let data = that.data.peakingEQList;
    for (let i = 0; i < data.length; i++){
      if(data[i].index == index){
        let item = data[i];
        item.x = x;
        item.y = y;
        item.frequency = getFreqByPointX(item.x);
        item.gain = getGainByPointY(item.y);

        that.setData({
          curFreq: util.getFreqFormat(item.frequency),
          curGain: util.getGainFormat(item.gain),
          curQuality:'1.0'
        })

        data[i] = item;
        break;
      }
    }
  },
  onCtrlViewClick: function(e){
    let indexId = e.currentTarget.id;
    let x = e.detail.x + 4;
    let y = e.detail.y + 4;
    that.setData({
      ctrlViewIndex: indexId
    })
  },
  onMoveAreaClick: function (e) {
    //setOption(that.chart, []);
    that.setData({
      ctrlViewIndex: -1
    })
  }, 
  onResetClick: function(e){
    isRunReset = true
    var patternData1 = patterns.getData(curPosition);
    let data = getPatternXYData(patternData1.peakingEQList);
    that.setData({
      peakingEQList: data
    });
    setTimeout(function(){
      isRunReset = false
    },1000);
  },
  onTouchMove: function(e){
    
  },
  //导航栏滑动
  swichNav: function (e) {
    if (that.data.currentTab == e.currentTarget.id) {
      return false;
    } else {
      if (e.currentTarget.id == 0) {
        util.redirectPage('../main/main')
      } else if (e.currentTarget.id == 2) {

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
  for (var i = 0; i < MaxFreq; i = i + 300) {
    var PointY = BiQuadFilter.biqfilter.log_result(i);
    let da = new Array();
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
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    item.x = getPointXByFreq(item.frequency);
    item.y = getPointYByGain(item.gain);
    data[i] = item;
  }
  return data;
}
