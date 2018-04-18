import * as echarts from '../../ec-canvas/echarts';
import biqfilter from '../../utils/biqfilter.js';
const app = getApp();
var that;
function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  that.chart = chart;
  setOption(chart, that.data.data);
  return chart;
}

function setOption(chart,data){
  var option = {
    backgroundColor: "#FFFFFF",
    color: ["#37A2DA"],
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
      max: 10,
      min: -10
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

function drawLine(x,y){
  var pointY;
  if (y > 0 && y < 250) {
    pointY = Math.abs(y / 25 - 10);
  } else if (y > 250 && y < 500) {
    pointY = (250 - y) / 25
  }


  var log_result = biqfilter.biqfilter(3, x * 50, 40000, 1.0, pointY);
  var dataArray = new Array();
  for (var i = 0; i < 20000; i = i + 100) {
    var result = log_result(i);
    let da = new Array();
    da.push(i);
    da.push(result);
    dataArray.push(da);
  }
  setOption(
    that.chart,
    dataArray
  );
}

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
    data:[
      0, 0, 0, 0, 0, 0, 0
    ],
    x:100,
    y:247,
    x1:200,
    y1:247,
    ec: {
      onInit: initChart
    }
  },
  onLoad: function (option){
    that = this;
    
  },
  onReady() {
  },
  viewMoveChange: function(e){
    var x = e.detail.x;
    var y = e.detail.y;
    drawLine(x,y);
  },
  viewMovableClick: function(e){
    var x = e.detail.x;
    var y = e.detail.y;
    console.log(x+"========="+y);
    drawLine(x, y);
  }
});
