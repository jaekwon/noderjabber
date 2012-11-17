var EventEmitter, STATE_LIVE, STATE_PAUSED, STATE_DEAD, makeRStream, async;

EventEmitter = require("events").EventEmitter;

STATE_LIVE = 0;

STATE_PAUSED = 1;

STATE_DEAD = 2;

this.makeRStream = makeRStream = function(text, chunk, wait) {
  var rs, _ee, _text, _encoding, _state, _timer, _emitMore;
  chunk = typeof chunk !== "undefined" && chunk !== null ? chunk : 1024;
  wait = typeof wait !== "undefined" && wait !== null ? wait : 0;
  rs = {};
  _ee = new EventEmitter;
  rs.emit = _ee.emit;
  rs.on = _ee.on;
  _text = text;
  _encoding = undefined;
  _state = STATE_LIVE;
  _timer = undefined;
  _emitMore = function() {
    var more;
    if (_text.length > 0) {
      more = _text.slice(undefined, chunk, 1);
      if (typeof _encoding !== "undefined" && _encoding !== null) {
        rs.emit("data", (new Buffer(more)).toString(_encoding));
      } else {
        rs.emit("data", new Buffer(more));
      }
      _text = _text.slice(chunk, undefined, 1);
      _timer = setTimeout(_emitMore, wait);
    } else {
      rs.emit("end");
      _state = STATE_DEAD;
    }
  };
  Object.defineProperty(rs, "readable", {
    get: function() {
      return _state !== STATE_DEAD;
    }
  });
  rs.setEncoding = function(encoding) {
    _encoding = encoding;
  };
  rs.pause = function() {
    if (_state === STATE_LIVE) {
      clearTimeout(_timer);
      _state = STATE_PAUSED;
    }
  };
  rs.resume = function() {
    if (_state === STATE_PAUSED) {
      _timer = setTimeout(_emitMore, wait);
      return _state === STATE_LIVE;
    }
  };
  rs.destroy = function() {
    throw new Error("ReadableStream.destroy not implemented yet");
  };
  rs.pipe = function() {
    throw new Error("ReadableStream.pipe not implemented yet");
  };
  setTimeout(_emitMore, wait);
  return rs;
};

if (!module.parent) {
  async = require("async");
  async.series([ function(next) {
    var rs;
    console.log("__ regular test __");
    rs = makeRStream("this is a looong string", 2, 30);
    rs.setEncoding("utf8");
    rs.on("data", function(data) {
      return console.log({
        data: data
      });
    });
    return rs.on("end", function() {
      console.log({
        end: true
      });
      return next();
    });
  }, function(next) {
    var rs;
    console.log("__ pause test __");
    rs = makeRStream("this is a looong string", 2, 30);
    rs.setEncoding("utf8");
    rs.on("data", function(data) {
      return console.log({
        data: data
      });
    });
    rs.on("end", function() {
      console.log({
        end: true
      });
      return next();
    });
    setTimeout(function() {
      rs.pause();
      return console.log("paused...");
    }, 200);
    return setTimeout(function() {
      rs.resume();
      return console.log("resumed...");
    }, 1e3);
  } ]);
}