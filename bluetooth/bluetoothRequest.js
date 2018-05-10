
var SN = 0

function createPeakingEQ(pattern) {
  var peakingEQList;
  console.log("isByPass = " + pattern.byPass)
  if (pattern.byPass) {
    //peakingEQList = EQValues.getDefaultPeakingEQList(false);
  } else {
    peakingEQList = pattern.peakingEQList;
  }
  console.log(peakingEQList)
  var payloadLen = peakingEQList.length * 5 + 3;

  var buffer = new ArrayBuffer(payloadLen + 6);
  var dataView = new DataView(buffer)
  
  dataView.setUint8(0, 0x55);
  dataView.setUint8(1, payloadLen & 0xFF); // data len
  
  dataView.setUint8(2, 0x04);
  dataView.setUint8(3, 0x01);

  dataView.setUint8(4, createSN());

  // data
  dataView.setUint8(5, pattern.position & 0xFF);  //poistion
  dataView.setUint8(6, 0x02); // peakingEQ

  //
  dataView.setUint8(7, peakingEQList.length & 0xFF);

  var pos = 8;
  for (var i = 0; i < peakingEQList.length; i++) {
    var peakingEQ = peakingEQList[i];
    var freq = peakingEQ.frequency;
    var gain = peakingEQ.gain * 10;
    var quality = peakingEQ.quality * 10;
    console.log(1 + "peakingEqfreq=" + freq)
    dataView.setUint8(pos++, ((freq & 0xFF00) >> 8));
    dataView.setUint8(pos++, (freq & 0xFF));
    dataView.setUint8(pos++, ((quality & 0xFF00) >> 8));
    dataView.setUint8(pos++, (quality & 0xFF));
    dataView.setUint8(pos++, (gain & 0xFF));
  }
  fillChecksum(dataView);
  return buffer;
}

function fillChecksum(data) {
  var sum = 0;
  for (var i = 1; i < data.byteLength - 1; i++) {
    sum += data.getUint8(i);
  }
  var checkSum = (0 - sum) & 0xFF;

  console.log("sum = " + sum)
  console.log("checkSum = "+checkSum)
  
  data.setUint8(data.length - 1, checkSum)
}

function createSN() {
  SN++;
  if (SN > 255 || SN < 10) {
    SN = 10;
  }
  return SN & 0xff;
}

module.exports = {
  createPeakingEQ: createPeakingEQ
}