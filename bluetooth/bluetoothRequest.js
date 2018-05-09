
var SN = 0


function createPeakingEQ(pattern) {
  var peakingEQList = new Array() ;
  console.log("isByPass = " + pattern.byPass)
  if (pattern.byPass) {
    //peakingEQList = EQValues.getDefaultPeakingEQList(false);
  } else {
    peakingEQList = pattern.peakingEQList;
  }

  var payloadLen = peakingEQList.length * 5 + 3;

  LogUtil.d(TAG, "peakingEQList.length = " + peakingEQList.length);

  var bytes = new byte[payloadLen + 6];
  bytes[0] = 0x55;
  bytes[1] = (byte) (payloadLen); // data len

  bytes[2] = 0x04;
  bytes[3] = 0x01;

  bytes[4] = createSN();

  // data
  bytes[5] = (byte)(pattern.position & 0xff);  //poistion
  bytes[6] = 0x02; // peakingEQ

  //
  bytes[7] = (byte) (peakingEQList.length);

  var pos = 8;
  for (var i = 0; i < peakingEQList.length; i++) {
    var peakingEQ = peakingEQList[i];
    var freq = (int)(peakingEQ.frequency);
    var gain = (int)(peakingEQ.gain * 10);
    var quality = (int)(peakingEQ.quality * 10);
    bytes[pos++] = (byte)((freq & 0xFF00) >> 8);
    bytes[pos++] = (byte)(freq & 0xFF);
    bytes[pos++] = (byte)((quality & 0xFF00) >> 8);
    bytes[pos++] = (byte)(quality & 0xFF);
    bytes[pos++] = (byte)(gain & 0xFF);
  }
  fillChecksum(bytes);
  return bytes;
}

function fillChecksum(data) {
  var sum = 0;
  for (var i = 1; i < data.length - 1; i++) {
    sum += data[i];
  }
  var checkSum = (byte)(0 - sum);

  console.log("sum = 0x%02x" + sum)
  console.log("checkSum = 0x%02x"+checkSum)
  
  data[data.length - 1] = checkSum;
}

function createSN() {
  SN++;
  if (SN > 255 || SN < 10) {
    SN = 10;
  }
  return (byte)(SN & 0xff);
}