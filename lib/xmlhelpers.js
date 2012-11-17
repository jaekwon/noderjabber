var WHITESPACE_CHARS, isWS, ILLEGAL_CHARS, ILLEGAL_NAME_CHARS;

this.escapeXML = function(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
};

WHITESPACE_CHARS = /[\u0020\u0009\u000D\u000A]/;

this.isWS = isWS = function(ch) {
  var _ref_$lb2x$_;
  return (_ref_$lb2x$_ = ch.match(WHITESPACE_CHARS)) !== null && _ref_$lb2x$_ !== undefined;
};

ILLEGAL_CHARS = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/;

this.assertLegalChars = function(str) {
  var chr;
  if (chr = str.match(ILLEGAL_CHARS)) {
    throw new Error("Invalid character (" + chr + ") in string: " + str);
  }
};

ILLEGAL_NAME_CHARS = /[\u0000-\u0020\uD800-\uDFFF\uFFFE-\uFFFF]/;

this.assertLegalName = function(str) {
  var chr;
  if (str.length === 0) {
    throw new Error("Empty string is not a valid XML tag/attribute name");
  }
  if (chr = str.match(ILLEGAL_NAME_CHARS)) {
    throw new Error("Invalid XML tag/attribute name: " + str);
  }
};