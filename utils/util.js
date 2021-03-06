const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 是否为空
 */
function isEmpty(str) {
  if (typeof (str) == 'undefined' || str == null || str == '' || str == 'null' || str == '[]' || str == '{}') {
    return true
  } else {
    return false;
  }
}

/**
 * 跳转到某个页面
 * 如果页面层数大于5个则使用 redirectTo跳转
 */
function intentPage(pageUrl) {
  var pageNum = getCurrentPages().length;
  if (!isEmpty(pageUrl)) {
    if (pageNum >= 5) {
      wx.redirectTo({
        url: pageUrl,
      })
    } else {
      wx.navigateTo({
        url: pageUrl,
      })
    }
  }
}

function redirectPage(pageUrl){
  if (isEmpty(pageUrl)) return 
  wx.redirectTo({
    url: pageUrl,
  })
}

function getGainFormat(gain){
  if(gain > 0){
    return "+"+gain.toFixed(1)
  }else{
    return gain.toFixed(1)
  }
}

function getFreqFormat(freq){
  if (freq >= 1000){
    return (freq / 1000).toFixed(1)+"K";
  }else{
    return freq.toFixed(0);
  }
}

module.exports = {
  formatTime: formatTime,
  intentPage: intentPage,
  getGainFormat: getGainFormat,
  getFreqFormat: getFreqFormat,
  redirectPage: redirectPage
}
