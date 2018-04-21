import * as echarts from '../../ec-canvas/echarts';
import biqfilter from '../../utils/biqfilter.js';
import patterns from '../../config/patterns.js';

const MinFreq = 20;
const MaxFreq = 20000;
const MinQuality = 0.3;
const MaxQuality = 3.0;
const MinGain = -10;
const MaxGain = 10;
const SampleFreq = 44100;
const ViewHeight = 500;

const app = getApp();
var that;
let patternData;
let windowWidth;

Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    peakingEQList : [],
    ec: {
      onInit: function (canvas, width, height) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(chart);
        that.chart = chart;
        setOption(chart, []);
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
    var res = wx.getSystemInfoSync();
    //获取屏幕宽度
    windowWidth = res.windowWidth;
    patternData = patterns.getData(option.position);
    var data = getPatternXYData(patternData.peakingEQList);
    that.setData({
      peakingEQList: data
    });
  },
  viewMoveChange: function(e){
    var x = e.detail.x;
    var y = e.detail.y;
    drawLine(x + 8, y + 8, 1.0);
  },
  viewMovableClick: function(e){
    var x = e.detail.x;
    var y = e.detail.y;
    drawLine(x + 8, y + 8, 1.0);
  }
});

function getAllOption(){
  var data = that.data.peakingEQList;
  var dataAll = [];
  for (var i = 0; i < data.length; i++) {
    var item = [];
    item.push(data[i].x*(MaxFreq / windowWidth));
    item.push(data[i].gain);
    dataAll.push(item);
  }
  return dataAll;
}

function setOption(chart, data) {
  var option = {
    backgroundColor: "rgba(250, 250, 250, 0)",
    color: ["#fc9b28"],
    animation: false,
    tooltip: {
      show: false,
      trigger: 'axis'
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
        color: "#FFFFFF"
      }
    },
    series: [{
      name: 'A商品',
      type: 'line',
      smooth: false,
      data: data,
      symbol: 'none',
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
      trigger: 'axis'
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
        color: "#FFFFFF"
      }
    },
    series: [{
      name: 'A商品',
      type: 'line',
      smooth: true,
      data: data,
      symbol: 'none',
      areaStyle: {}
    }]
  };
  chart.setOption(option);
}

function drawLine(x, y, q) {
  var pointY;
  if (y < 0) {
    pointY = MaxGain;
  } else if (y >= 0 && y < ViewHeight / 2) {
    pointY = Math.abs(y / (ViewHeight / MaxGain / 2) - MaxGain);
  } else if (y >= ViewHeight / 2 && y < ViewHeight) {
    pointY = (ViewHeight / 2 - y) / (ViewHeight / MaxGain / 2)
  } else {
    pointY = MinGain;
  }
  
  var log_result = biqfilter.biqfilter(3, x * (MaxFreq / windowWidth), SampleFreq, q, pointY);
  var dataArray = new Array();
  for (var i = 0; i < MaxFreq; i = i + 100) {
    var result = log_result(i);
    let da = new Array();
    da.push(i);
    da.push(result);
    dataArray.push(da);
  }
  setOption(that.chart, dataArray);
}

function getPatternXYData(data) {
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var percentF = (Math.log10(item.frequency) - Math.log10(MinFreq)) / (Math.log10(MaxFreq) - Math.log10(MinFreq));
    var x = windowWidth * percentF;
    item.x = x;
    if (item.gain >= MaxGain) {
      item.y = 0;
    } else if (item.gain < MaxGain && item.gain >= 0) {
      item.y = (ViewHeight / 2) - (ViewHeight / MaxGain / 2) * item.gain;
    } else if (item.gain < 0 && item.gain >= MinGain) {
      item.y = Math.abs(ViewHeight / MaxGain / 2 * item.gain) + (ViewHeight / 2)
    } else {
      item.y = ViewHeight;
    }
    data[i] = item;
  }
  return data;
}
