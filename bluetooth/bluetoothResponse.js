var bluetoothResponse = {}

bluetoothResponse.HandShakeRsp = 0x8101;
bluetoothResponse.GetIDRsp = 0x8102;
bluetoothResponse.GetEqModeRsp = 0x8402;
bluetoothResponse.SetEqModeRsp = 0x8401;

bluetoothResponse.parseResponse = function(arrayBuffer){
  console.log("parseResponse----1------start")
  var rsp = new DataView(arrayBuffer)
  console.log("parseResponse-----2-----start")
  if (rsp == null || rsp.byteLength < 6) {
    return null;
  } console.log("parseResponse---3-------start")
  var isrsp = !isChecksumCorrect(rsp)
  console.log("isrsp" + isrsp)
  console.log("rsp.byteLength != 0x55=" + (rsp.getUint8(0) != 0x55))
  if (rsp.getUint8(0) != 0x55 || isrsp) {
    return null;
  } 
  console.log("parseResponse------4----start")
  var response = {};
  var len = rsp.getUint8(1);
  var cmdH = rsp.getUint8(2);
  var cmdL = rsp.getUint8(3);

  response.cmd = (cmdH << 8 | cmdL) & 0xffff;
  response.cmdSerial = rsp.getUint8(4);

  console.log("len = ", len);
  console.log("cmdH = ", cmdH);
  console.log("cmdL = ", cmdL);
  console.log("rsp.cmd = ", response.cmd);
  console.log("rsp.serial = ", response.cmdSerial);

  switch (response.cmd) {
    case bluetoothResponse.HandShakeRsp:
      response.playLoad = getPlayload(rsp, 5);
      break;
    case bluetoothResponse.GetIDRsp:
      response.playLoad = getPlayload(rsp, 5);
      break;
    case bluetoothResponse.GetEqModeRsp:
      if (rsp.byteLength > 8) {
        response.position = rsp[5];
        response.ptype = rsp[6];
        response.playLoad = getPlayload(rsp, 7);
      }
      break;
    case bluetoothResponse.SetEqModeRsp:
      response.playLoad = getPlayload(rsp, 5);
      break;
    default:
      return null;
  }
  return response;

}

function getPlayload(rsp, start) {
  var len = rsp.byteLength - start - 1;
  var buffer;
  var dataView;
  if (len < 1) {
    buffer = new ArrayBuffer(1);
    dataView = new DataView(buffer);
    dataView.setUint8(0, 0x01);
    return buffer;
  }
  buffer = new ArrayBuffer(rsp.byteLength - start - 1);
  dataView = new DataView(buffer);
  for (var i = start; i < rsp.byteLength - 1; i++) {
    dataView.setUint8(i - start, rsp.getUint8(i));
  }
  return buffer;
}

function isChecksumCorrect(data) {
  var sum = 0;
  for (var i = 1; i < data.byteLength - 1; i++) {
    sum += data.getUint8(i);
  }
  var checkSum = (0 - sum) & 0xff;
  console.log("c.checkSum = , data.checkSum = ", checkSum, data.getUint8(data.byteLength - 1));
  return checkSum == data.getUint8(data.byteLength - 1);
}

bluetoothResponse.convert2Pattern = function(response) {
  if (!response){return}
  var pattern = {};
  pattern.position = response.position;
  console.log("convert2Pattern.type = " + type);
  console.log("convert2Pattern.data = ", response.playLoad);
  switch (response.ptype) {
    case 1:  //Pattern.SYSTEM
      if (response.playLoad.byteLength == 1) {
        pattern.ptype = 1;
        pattern.fixedMode = byte2Int(response.playLoad.getUint8(0));
      }
      break;
    case 2: //Pattern.PEAKING_EQ
      console.log("playLoad.length = " + response.playLoad.length);
      pattern.ptype = 2;
      if (response.playLoad.length == 46) {
        var size = (response.playLoad.getUint8(0) & 0xFF) << 24;
        if (size != 9) {
          break;
        }
        console("size = " + size);
        var peakingEQList = [];
        for (var i = 1; i < 46; i++) {
          var freq = (byte2Int(response.playLoad.getUint8(i++)) << 8) | byte2Int(response.playLoad.getUint8(i++));
          var quality = ((byte2Int(response.playLoad.getUint8(i++)) << 8) | byte2Int(response.playLoad.getUint8(i++))) / 10.0;
          var gain = response.playLoad.getUint8(i++) / 10.0;

          var peakingEQ = { freq: freq, quality: quality, gain: gain};
          peakingEQList.push(peakingEQ);
        }
        console.log("peakingEQList.size = " + peakingEQList.length);
        pattern.peakingEQList = peakingEQList;
      }
      break;
    case 3://Pattern.SENIOR:
      if (response.playLoad.length == 10) {
        pattern.ptype(3);
        pattern.equalizer50(byte2Int(response.playLoad.getUint8(0)) / 10.0);
        pattern.equalizer80(byte2Int(response.playLoad.getUint8(1)) / 10.0);
        pattern.equalizer100(byte2Int(response.playLoad.getUint8(2)) / 10.0);
        pattern.equalizer200(byte2Int(response.playLoad.getUint8(3)) / 10.0);
        pattern.equalizer500(byte2Int(response.playLoad.getUint8(4)) / 10.0);
        pattern.equalizer1k(byte2Int(response.playLoad.getUint8(5)) / 10.0);
        pattern.equalizer2k(byte2Int(response.playLoad.getUint8(6)) / 10.0);
        pattern.equalizer5k(byte2Int(response.playLoad.getUint8(7)) / 10.0);
        pattern.xBase(byte2Int(response.playLoad.getUint8(8)) / 10.0);
        pattern.highPitched(byte2Int(response.playLoad.getUint8(9)) / 10.0);
      }
      break;
  }
  return pattern;
}

function byte2Int(byte){
  return (byte & 0xFF).toString(10)
}

function isEmpty(str) {
  if (typeof (str) == 'undefined' || str == null || str == '' || str == 'null' || str == '[]' || str == '{}') {
    return true
  } else {
    return false;
  }
}

module.exports = {
  data: bluetoothResponse
}