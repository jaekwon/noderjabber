__indexOf = [].indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }
  return -1;
};

var _temp_$LqYA$_, clazz, _temp_$dj5Z$_, _ref_$r55J$_, red, blue, assert, _temp_$UNpq$_, isWS, escapeXML, assertLegalChars, assertLegalName, Context, parseStart, parseText, parseCloseTagName, parseOpenTagName, parseAttrName, parseAttrQuotedValue, parseAttrValue;

_temp_$LqYA$_ = require("cardamom");

clazz = _temp_$LqYA$_.clazz;

_temp_$dj5Z$_ = require("cardamom");

_ref_$r55J$_ = _temp_$dj5Z$_.colors;

red = _ref_$r55J$_.red;

blue = _ref_$r55J$_.blue;

assert = require("assert");

_temp_$UNpq$_ = require("./xmlhelpers");

isWS = _temp_$UNpq$_.isWS;

escapeXML = _temp_$UNpq$_.escapeXML;

assertLegalChars = _temp_$UNpq$_.assertLegalChars;

assertLegalName = _temp_$UNpq$_.assertLegalName;

Context = clazz(function() {
  return {
    init: function(handler, buffer, offset) {
      var _ref_$NnSb$_;
      this.handler = handler;
      buffer = typeof buffer !== "undefined" && buffer !== null ? buffer : "";
      this.buffer = buffer;
      offset = typeof offset !== "undefined" && offset !== null ? offset : 0;
      this.offset = offset;
      assert.ok((_ref_$NnSb$_ = this.handler) !== null && _ref_$NnSb$_ !== undefined ? _ref_$NnSb$_.on : undefined, "Context must be given a handler, which needs an 'on' method.");
      this.text = undefined;
      this.openTagName = undefined;
      this.closeTagName = undefined;
      this.attrName = undefined;
      this.attrQuote = undefined;
      this.attrValue = undefined;
      this.ended = false;
      this.tagName = undefined;
      this.tagStack = [];
      this.tagAttrs = {};
      this.next = parseStart;
    },
    consume: function(numChars) {
      assert.ok(this.offset + numChars <= this.buffer.length || this.ended);
      return this.offset = this.offset + numChars;
    },
    emit: function(event, arg1, arg2) {
      var _temp_$f0yW$_, name, value, currentTag, text;
      _temp_$f0yW$_ = undefined;
      switch (event) {
       case "OPEN_TAG":
        assertLegalName(arg1);
        this.tagName = arg1;
        this.tagStack.push(arg1);
        this.tagAttrs = {};
        break;
       case "ATTR":
        arg1 = arg1.trim();
        assertLegalName(arg1);
        assertLegalChars(arg2);
        name = arg1;
        value = escapeXML(arg2);
        this.tagAttrs[name] = value;
        break;
       case "OPEN_TAG_DONE":
        _temp_$f0yW$_ = this.handler.on("open", this.tagName, this.tagAttrs);
        break;
       case "CLOSE_TAG":
        currentTag = this.tagStack.pop();
        if (typeof arg1 !== "undefined" && arg1 !== null && currentTag !== arg1) {
          _temp_$f0yW$_ = this.handler.on("error", "Current tag is " + currentTag + " but closed " + arg1);
        } else {
          _temp_$f0yW$_ = this.handler.on("close", currentTag);
        }
        break;
       case "TEXT":
        assertLegalChars(arg1);
        text = escapeXML(arg1);
        _temp_$f0yW$_ = this.handler.on("text", arg1);
        break;
       default:
        undefined;
      }
      return _temp_$f0yW$_;
    },
    charsAvailable: function() {
      return this.buffer.length - this.offset;
    },
    appendChars: function(chars) {
      this.buffer = this.buffer.slice(this.offset, undefined, 1) + chars;
      this.offset = 0;
    },
    endInput: function() {
      this.ended = true;
    },
    toString: function() {
      return "Context\n" + this.buffer + "\n" + this.offset;
    }
  };
});

parseStart = function(ch0, ch1) {
  if (ch0 === "<") {
    if (ch1 === "/") {
      this.consume(1);
      this.closeTagName = "";
      return parseCloseTagName;
    } else {
      this.openTagName = "";
      return parseOpenTagName;
    }
  } else {
    if (ch1 === "<") {
      this.emit("TEXT", ch0);
      return parseStart;
    } else {
      this.text = ch0;
      return parseText;
    }
  }
};

parseStart._name = "parseStart";

parseText = function(ch0, ch1) {
  this.text = this.text + ch0;
  if (ch1 === "<") {
    this.emit("TEXT", this.text);
    return parseStart;
  } else {
    return parseText;
  }
};

parseText._name = "parseText";

parseCloseTagName = function(ch0, ch1) {
  this.closeTagName = this.closeTagName + ch0;
  if (ch1 === ">") {
    this.emit("CLOSE_TAG", this.closeTagName);
    this.consume(1);
    return parseStart;
  } else {
    return parseCloseTagName;
  }
};

parseCloseTagName._name = "parseCloseTagName";

parseOpenTagName = function(ch0, ch1) {
  if (isWS(ch0)) {
    if (this.openTagName) {
      this.emit("OPEN_TAG", this.openTagName);
      if (ch1 === ">") {
        this.emit("OPEN_TAG_DONE");
        this.consume(1);
        return parseStart;
      } else {
        this.attrName = "";
        return parseAttrName;
      }
    } else {
      return parseOpenTagName;
    }
  } else {
    if (ch0 === ">") {
      this.emit("OPEN_TAG", this.openTagName);
      this.emit("OPEN_TAG_DONE");
      return parseStart;
    } else {
      this.openTagName = this.openTagName + ch0;
      return parseOpenTagName;
    }
  }
};

parseOpenTagName._name = "parseOpenTagName";

parseAttrName = function(ch0, ch1) {
  if (ch0 === "/") {
    if (!(ch1 === ">")) {
      throw new Error("Expected > after /");
    }
    this.emit("OPEN_TAG_DONE");
    this.emit("CLOSE_TAG");
    this.consume(1);
    return parseStart;
  }
  this.attrName = this.attrName + ch0;
  if (ch1 === "=") {
    this.consume(1);
    this.attrValue = "";
    return parseAttrQuotedValue;
  } else {
    return parseAttrName;
  }
};

parseAttrName._name = "parseAttrName";

parseAttrQuotedValue = function(ch0, ch1) {
  if (isWS(ch0)) {
    return parseAttrQuotedValue;
  } else {
    if (ch0 === "'" || ch0 === '"') {
      this.attrQuote = ch0;
      this.attrValue = "";
      return parseAttrValue;
    } else {
      throw new Error("BLAH");
    }
  }
};

parseAttrQuotedValue._name = "parseAttrQuotedValue";

parseAttrValue = function(ch0, ch1) {
  if (ch0 === this.attrQuote) {
    this.emit("ATTR", this.attrName, this.attrValue);
    if (ch1 === ">") {
      this.emit("OPEN_TAG_DONE");
      this.consume(1);
      return parseStart;
    } else {
      this.attrName = "";
      return parseAttrName;
    }
  } else {
    this.attrValue = this.attrValue + ch0;
    return parseAttrValue;
  }
};

parseAttrValue._name = "parseAttrValue";

this.parseStream = function(stream, handler) {
  var context, _ref_$yUJ9$_;
  if (!(typeof stream !== "undefined" && stream !== null) || !stream.readable) {
    throw new Error("Stream should exist and be readable");
  }
  context = new Context(handler);
  if ((_ref_$yUJ9$_ = stream.setEncoding) !== null && _ref_$yUJ9$_ !== undefined) {
    _ref_$yUJ9$_("utf8");
  } else {
    undefined;
  }
  stream.on("data", function(data) {
    var _accum_$jSmd$_, _temp_$gF6o$_, ch1, ch2;
    if (!(typeof data === "string")) {
      throw new Error("Stream data should have been a unicode string");
    }
    context.appendChars(data);
    _accum_$jSmd$_ = [];
    while (context.charsAvailable() >= 2) {
      _temp_$gF6o$_ = context.buffer.slice(context.offset, context.offset + 2, 1);
      ch1 = _temp_$gF6o$_[0];
      ch2 = _temp_$gF6o$_[1];
      context.next = context.next(ch1, ch2);
      _accum_$jSmd$_.push(context.consume(1));
    }
    return _accum_$jSmd$_;
  });
  stream.on("end", function() {
    var _temp_$E73p$_, ch1, ch2;
    context.endInput();
    while (context.charsAvailable() >= 1) {
      _temp_$E73p$_ = context.buffer.slice(context.offset, context.offset + 2, 1);
      ch1 = _temp_$E73p$_[0];
      ch2 = _temp_$E73p$_[1];
      context.next = context.next(ch1, ch2);
      context.consume(1);
    }
    return assert.ok(__indexOf.call([ parseStart, parseText ], context.next) >= 0, "Unexpected end state " + context.next._name);
  });
  return stream.on("error", function(error) {
    return handler.on("error", error);
  });
};