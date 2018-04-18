function biqfilter(type, center_freq, sample_rate, Q, gainDB){
  var LOWPASS = 0;
  var HIGHPASS = 1;
  var BANDPASS = 2;
  var PEAK = 3;
  var NOTCH = 4;
  var LOWSHELF = 5;
  var HIGHSHELF = 6;
  var a0, a1, a2, b0, b1, b2;
  var x1, x2, y, y1, y2;
  var gain_abs;
  var type = type;
  var center_freq = center_freq ;
  var sample_rate = sample_rate;
  var Q = Q;
  var gainDB = gainDB;

  function reset() {
    x1 = x2 = y1 = y2 = 0;
  }

  function frequency() {
    return center_freq;
  }

  function configure(type1, center_freq1, sample_rate1, Q1, gainDB1) {
    reset();
    Q = (Q1 == 0) ? 1e-9 : Q1;
    type = type1;
    sample_rate = sample_rate1;
    Q = Q1;
    gainDB = gainDB1;
    reconfigure(center_freq1);
  } 

  configure(type, center_freq, sample_rate, Q, gainDB);

  // function configure(type, center_freq, sample_rate, Q) {
  //   configure(type, center_freq, sample_rate, Q, 0);
  // }

  function reconfigure(cf) {
    center_freq = cf;
    // only used for peaking and shelving filters
    gain_abs = Math.pow(10, gainDB / 40);
    var omega = 2 * Math.PI * cf / sample_rate;
    var sn = Math.sin(omega);
    var cs = Math.cos(omega);
    var alpha = sn / (2 * Q);
    var beta = Math.sqrt(gain_abs + gain_abs);
    switch (type) {
      case BANDPASS:
        b0 = alpha;
        b1 = 0;
        b2 = -alpha;
        a0 = 1 + alpha;
        a1 = -2 * cs;
        a2 = 1 - alpha;
        break;
      case LOWPASS:
        b0 = (1 - cs) / 2;
        b1 = 1 - cs;
        b2 = (1 - cs) / 2;
        a0 = 1 + alpha;
        a1 = -2 * cs;
        a2 = 1 - alpha;
        break;
      case HIGHPASS:
        b0 = (1 + cs) / 2;
        b1 = -(1 + cs);
        b2 = (1 + cs) / 2;
        a0 = 1 + alpha;
        a1 = -2 * cs;
        a2 = 1 - alpha;
        break;
      case NOTCH:
        b0 = 1;
        b1 = -2 * cs;
        b2 = 1;
        a0 = 1 + alpha;
        a1 = -2 * cs;
        a2 = 1 - alpha;
        break;
      case PEAK:
        b0 = 1 + (alpha * gain_abs);
        b1 = -2 * cs;
        b2 = 1 - (alpha * gain_abs);
        a0 = 1 + (alpha / gain_abs);
        a1 = -2 * cs;
        a2 = 1 - (alpha / gain_abs);
        break;
      case LOWSHELF:
        b0 = gain_abs * ((gain_abs + 1) - (gain_abs - 1) * cs + beta * sn);
        b1 = 2 * gain_abs * ((gain_abs - 1) - (gain_abs + 1) * cs);
        b2 = gain_abs * ((gain_abs + 1) - (gain_abs - 1) * cs - beta * sn);
        a0 = (gain_abs + 1) + (gain_abs - 1) * cs + beta * sn;
        a1 = -2 * ((gain_abs - 1) + (gain_abs + 1) * cs);
        a2 = (gain_abs + 1) + (gain_abs - 1) * cs - beta * sn;
        break;
      case HIGHSHELF:
        b0 = gain_abs * ((gain_abs + 1) + (gain_abs - 1) * cs + beta * sn);
        b1 = -2 * gain_abs * ((gain_abs - 1) + (gain_abs + 1) * cs);
        b2 = gain_abs * ((gain_abs + 1) + (gain_abs - 1) * cs - beta * sn);
        a0 = (gain_abs + 1) - (gain_abs - 1) * cs + beta * sn;
        a1 = 2 * ((gain_abs - 1) - (gain_abs + 1) * cs);
        a2 = (gain_abs + 1) - (gain_abs - 1) * cs - beta * sn;
        break;
    }
    // prescale flter constants
    b0 /= a0;
    b1 /= a0;
    b2 /= a0;
    a1 /= a0;
    a2 /= a0;
  }

  // provide a static amplitude result for testing
    function result(f) {
      var phi = Math.pow((Math.sin(2.0 * Math.PI * f / (2.0 * sample_rate))), 2.0);
      var r = (Math.pow(b0 + b1 + b2, 2.0) - 4.0 * (b0 * b1 + 4.0 * b0 * b2 + b1 * b2) * phi + 16.0 * b0 * b2 * phi * phi) / (Math.pow(1.0 + a1 + a2, 2.0) - 4.0 * (a1 + 4.0 * a2 + a1 * a2) * phi + 16.0 * a2 * phi * phi);
      if (r < 0) {
        r = 0;
      }
      return Math.sqrt(r);
    }

    // provide a static decibel result for testing
    function log_result(f) {
      var r;
      try {
        r = 20 * Math.log10(result(f));
      } catch (e) {
        r = -100;
      }
      if (isInfinite(r) || isNaN(r)) {
        r = -100;
      }
      return r;
    }

    function isInfinite(var0) {
      return var0 == 1.0 / 0.0 || var0 == -1.0 / 0.0;
    }

    function isNaN(var0) {
      return var0 != var0;
    }

    // return the constant set for this filter
    function constants() {
      return new Array(a1, a2, b0, b1, b2);
    }

    // perform one filtering step
    function filter(x) {
      y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
      return (y);
    }

    return log_result;
}

module.exports = {
  biqfilter: biqfilter
}