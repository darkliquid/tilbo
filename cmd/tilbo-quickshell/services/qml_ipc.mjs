var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// node_modules/@protobufjs/aspromise/index.js
var require_aspromise = __commonJS({
  "node_modules/@protobufjs/aspromise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = asPromise;
    function asPromise(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
  }
});

// node_modules/@protobufjs/base64/index.js
var require_base64 = __commonJS({
  "node_modules/@protobufjs/base64/index.js"(exports2) {
    "use strict";
    var base64 = exports2;
    base64.length = function length(string) {
      var p = string.length;
      if (!p)
        return 0;
      var n = 0;
      while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
      return Math.ceil(string.length * 3) / 4 - n;
    };
    var b64 = new Array(64);
    var s64 = new Array(123);
    for (i = 0; i < 64; )
      s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
    var i;
    base64.encode = function encode(buffer, start, end) {
      var parts = null, chunk = [];
      var i2 = 0, j = 0, t;
      while (start < end) {
        var b = buffer[start++];
        switch (j) {
          case 0:
            chunk[i2++] = b64[b >> 2];
            t = (b & 3) << 4;
            j = 1;
            break;
          case 1:
            chunk[i2++] = b64[t | b >> 4];
            t = (b & 15) << 2;
            j = 2;
            break;
          case 2:
            chunk[i2++] = b64[t | b >> 6];
            chunk[i2++] = b64[b & 63];
            j = 0;
            break;
        }
        if (i2 > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i2 = 0;
        }
      }
      if (j) {
        chunk[i2++] = b64[t];
        chunk[i2++] = 61;
        if (j === 1)
          chunk[i2++] = 61;
      }
      if (parts) {
        if (i2)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i2));
    };
    var invalidEncoding = "invalid encoding";
    base64.decode = function decode(string, buffer, offset) {
      var start = offset;
      var j = 0, t;
      for (var i2 = 0; i2 < string.length; ) {
        var c = string.charCodeAt(i2++);
        if (c === 61 && j > 1)
          break;
        if ((c = s64[c]) === void 0)
          throw Error(invalidEncoding);
        switch (j) {
          case 0:
            t = c;
            j = 1;
            break;
          case 1:
            buffer[offset++] = t << 2 | (c & 48) >> 4;
            t = c;
            j = 2;
            break;
          case 2:
            buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
            t = c;
            j = 3;
            break;
          case 3:
            buffer[offset++] = (t & 3) << 6 | c;
            j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(invalidEncoding);
      return offset - start;
    };
    base64.test = function test(string) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
  }
});

// node_modules/@protobufjs/eventemitter/index.js
var require_eventemitter = __commonJS({
  "node_modules/@protobufjs/eventemitter/index.js"(exports2, module2) {
    "use strict";
    module2.exports = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
  }
});

// node_modules/@protobufjs/float/index.js
var require_float = __commonJS({
  "node_modules/@protobufjs/float/index.js"(exports2, module2) {
    "use strict";
    module2.exports = factory(factory);
    function factory(exports3) {
      if (typeof Float32Array !== "undefined") (function() {
        var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
        function writeFloat_f32_cpy(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
        }
        function writeFloat_f32_rev(val, buf, pos) {
          f32[0] = val;
          buf[pos] = f8b[3];
          buf[pos + 1] = f8b[2];
          buf[pos + 2] = f8b[1];
          buf[pos + 3] = f8b[0];
        }
        exports3.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        exports3.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
        function readFloat_f32_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          return f32[0];
        }
        function readFloat_f32_rev(buf, pos) {
          f8b[3] = buf[pos];
          f8b[2] = buf[pos + 1];
          f8b[1] = buf[pos + 2];
          f8b[0] = buf[pos + 3];
          return f32[0];
        }
        exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
      })();
      else (function() {
        function writeFloat_ieee754(writeUint, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0)
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos);
          else if (isNaN(val))
            writeUint(2143289344, buf, pos);
          else if (val > 34028234663852886e22)
            writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
          else if (val < 11754943508222875e-54)
            writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
          else {
            var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
            writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
          }
        }
        exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
        function readFloat_ieee754(readUint, buf, pos) {
          var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
          return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }
        exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
      })();
      if (typeof Float64Array !== "undefined") (function() {
        var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
        function writeDouble_f64_cpy(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[0];
          buf[pos + 1] = f8b[1];
          buf[pos + 2] = f8b[2];
          buf[pos + 3] = f8b[3];
          buf[pos + 4] = f8b[4];
          buf[pos + 5] = f8b[5];
          buf[pos + 6] = f8b[6];
          buf[pos + 7] = f8b[7];
        }
        function writeDouble_f64_rev(val, buf, pos) {
          f64[0] = val;
          buf[pos] = f8b[7];
          buf[pos + 1] = f8b[6];
          buf[pos + 2] = f8b[5];
          buf[pos + 3] = f8b[4];
          buf[pos + 4] = f8b[3];
          buf[pos + 5] = f8b[2];
          buf[pos + 6] = f8b[1];
          buf[pos + 7] = f8b[0];
        }
        exports3.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        exports3.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
        function readDouble_f64_cpy(buf, pos) {
          f8b[0] = buf[pos];
          f8b[1] = buf[pos + 1];
          f8b[2] = buf[pos + 2];
          f8b[3] = buf[pos + 3];
          f8b[4] = buf[pos + 4];
          f8b[5] = buf[pos + 5];
          f8b[6] = buf[pos + 6];
          f8b[7] = buf[pos + 7];
          return f64[0];
        }
        function readDouble_f64_rev(buf, pos) {
          f8b[7] = buf[pos];
          f8b[6] = buf[pos + 1];
          f8b[5] = buf[pos + 2];
          f8b[4] = buf[pos + 3];
          f8b[3] = buf[pos + 4];
          f8b[2] = buf[pos + 5];
          f8b[1] = buf[pos + 6];
          f8b[0] = buf[pos + 7];
          return f64[0];
        }
        exports3.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        exports3.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
      })();
      else (function() {
        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
          var sign = val < 0 ? 1 : 0;
          if (sign)
            val = -val;
          if (val === 0) {
            writeUint(0, buf, pos + off0);
            writeUint(1 / val > 0 ? (
              /* positive */
              0
            ) : (
              /* negative 0 */
              2147483648
            ), buf, pos + off1);
          } else if (isNaN(val)) {
            writeUint(0, buf, pos + off0);
            writeUint(2146959360, buf, pos + off1);
          } else if (val > 17976931348623157e292) {
            writeUint(0, buf, pos + off0);
            writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
          } else {
            var mantissa;
            if (val < 22250738585072014e-324) {
              mantissa = val / 5e-324;
              writeUint(mantissa >>> 0, buf, pos + off0);
              writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
            } else {
              var exponent = Math.floor(Math.log(val) / Math.LN2);
              if (exponent === 1024)
                exponent = 1023;
              mantissa = val * Math.pow(2, -exponent);
              writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
              writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
            }
          }
        }
        exports3.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports3.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
          var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
          var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
          return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }
        exports3.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports3.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
      })();
      return exports3;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
  }
});

// node_modules/@protobufjs/inquire/index.js
var require_inquire = __commonJS({
  "node_modules/@protobufjs/inquire/index.js"(exports, module) {
    "use strict";
    module.exports = inquire;
    function inquire(moduleName) {
      try {
        var mod = eval("quire".replace(/^/, "re"))(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
          return mod;
      } catch (e) {
      }
      return null;
    }
  }
});

// node_modules/@protobufjs/utf8/index.js
var require_utf8 = __commonJS({
  "node_modules/@protobufjs/utf8/index.js"(exports2) {
    "use strict";
    var utf8 = exports2;
    utf8.length = function utf8_length(string) {
      var len = 0, c = 0;
      for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
          len += 1;
        else if (c < 2048)
          len += 2;
        else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
          ++i;
          len += 4;
        } else
          len += 3;
      }
      return len;
    };
    utf8.read = function utf8_read(buffer, start, end) {
      var len = end - start;
      if (len < 1)
        return "";
      var parts = null, chunk = [], i = 0, t;
      while (start < end) {
        t = buffer[start++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i = 0;
        }
      }
      if (parts) {
        if (i)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i));
    };
    utf8.write = function utf8_write(string, buffer, offset) {
      var start = offset, c1, c2;
      for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
          buffer[offset++] = c1;
        } else if (c1 < 2048) {
          buffer[offset++] = c1 >> 6 | 192;
          buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
          c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
          ++i;
          buffer[offset++] = c1 >> 18 | 240;
          buffer[offset++] = c1 >> 12 & 63 | 128;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        } else {
          buffer[offset++] = c1 >> 12 | 224;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        }
      }
      return offset - start;
    };
  }
});

// node_modules/@protobufjs/pool/index.js
var require_pool = __commonJS({
  "node_modules/@protobufjs/pool/index.js"(exports2, module2) {
    "use strict";
    module2.exports = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
  }
});

// node_modules/protobufjs/src/util/longbits.js
var require_longbits = __commonJS({
  "node_modules/protobufjs/src/util/longbits.js"(exports2, module2) {
    "use strict";
    module2.exports = LongBits;
    var util2 = require_minimal();
    function LongBits(lo, hi) {
      this.lo = lo >>> 0;
      this.hi = hi >>> 0;
    }
    var zero = LongBits.zero = new LongBits(0, 0);
    zero.toNumber = function() {
      return 0;
    };
    zero.zzEncode = zero.zzDecode = function() {
      return this;
    };
    zero.length = function() {
      return 1;
    };
    var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
    LongBits.fromNumber = function fromNumber(value) {
      if (value === 0)
        return zero;
      var sign = value < 0;
      if (sign)
        value = -value;
      var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295)
            hi = 0;
        }
      }
      return new LongBits(lo, hi);
    };
    LongBits.from = function from(value) {
      if (typeof value === "number")
        return LongBits.fromNumber(value);
      if (util2.isString(value)) {
        if (util2.Long)
          value = util2.Long.fromString(value);
        else
          return LongBits.fromNumber(parseInt(value, 10));
      }
      return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    };
    LongBits.prototype.toNumber = function toNumber(unsigned) {
      if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
        if (!lo)
          hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    LongBits.prototype.toLong = function toLong(unsigned) {
      return util2.Long ? new util2.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    };
    var charCodeAt = String.prototype.charCodeAt;
    LongBits.fromHash = function fromHash(hash) {
      if (hash === zeroHash)
        return zero;
      return new LongBits(
        (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
        (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
      );
    };
    LongBits.prototype.toHash = function toHash() {
      return String.fromCharCode(
        this.lo & 255,
        this.lo >>> 8 & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24,
        this.hi & 255,
        this.hi >>> 8 & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
      );
    };
    LongBits.prototype.zzEncode = function zzEncode() {
      var mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.zzDecode = function zzDecode() {
      var mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.length = function length() {
      var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    };
  }
});

// node_modules/protobufjs/src/util/minimal.js
var require_minimal = __commonJS({
  "node_modules/protobufjs/src/util/minimal.js"(exports2) {
    "use strict";
    var util2 = exports2;
    util2.asPromise = require_aspromise();
    util2.base64 = require_base64();
    util2.EventEmitter = require_eventemitter();
    util2.float = require_float();
    util2.inquire = require_inquire();
    util2.utf8 = require_utf8();
    util2.pool = require_pool();
    util2.LongBits = require_longbits();
    util2.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
    util2.global = util2.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports2;
    util2.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util2.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util2.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util2.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util2.isObject = function isObject(value) {
      return value && typeof value === "object";
    };
    util2.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util2.isSet = function isSet(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util2.Buffer = (function() {
      try {
        var Buffer2 = util2.inquire("buffer").Buffer;
        return Buffer2.prototype.utf8Write ? Buffer2 : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    })();
    util2._Buffer_from = null;
    util2._Buffer_allocUnsafe = null;
    util2.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util2.Buffer ? util2._Buffer_allocUnsafe(sizeOrArray) : new util2.Array(sizeOrArray) : util2.Buffer ? util2._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util2.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util2.Long = /* istanbul ignore next */
    util2.global.dcodeIO && /* istanbul ignore next */
    util2.global.dcodeIO.Long || /* istanbul ignore next */
    util2.global.Long || util2.inquire("long");
    util2.key2Re = /^true|false|0|1$/;
    util2.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util2.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util2.longToHash = function longToHash(value) {
      return value ? util2.LongBits.from(value).toHash() : util2.LongBits.zeroHash;
    };
    util2.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util2.LongBits.fromHash(hash);
      if (util2.Long)
        return util2.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src, ifNotSet) {
      for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src[keys[i]];
      return dst;
    }
    util2.merge = merge;
    util2.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
          value: CustomError,
          writable: true,
          enumerable: false,
          configurable: true
        },
        name: {
          get: function get() {
            return name;
          },
          set: void 0,
          enumerable: false,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: true
        },
        toString: {
          value: function value() {
            return this.name + ": " + this.message;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      return CustomError;
    }
    util2.newError = newError;
    util2.ProtocolError = newError("ProtocolError");
    util2.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util2.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util2.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util2._configure = function() {
      var Buffer2 = util2.Buffer;
      if (!Buffer2) {
        util2._Buffer_from = util2._Buffer_allocUnsafe = null;
        return;
      }
      util2._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer2(value, encoding);
      };
      util2._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer2(size);
      };
    };
  }
});

// node_modules/protobufjs/src/writer.js
var require_writer = __commonJS({
  "node_modules/protobufjs/src/writer.js"(exports2, module2) {
    "use strict";
    module2.exports = Writer2;
    var util2 = require_minimal();
    var BufferWriter;
    var LongBits = util2.LongBits;
    var base64 = util2.base64;
    var utf8 = util2.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
    function Writer2() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create = function create2() {
      return util2.Buffer ? function create_buffer_setup() {
        return (Writer2.create = function create_buffer() {
          return new BufferWriter();
        })();
      } : function create_array() {
        return new Writer2();
      };
    };
    Writer2.create = create();
    Writer2.alloc = function alloc(size) {
      return new util2.Array(size);
    };
    if (util2.Array !== Array)
      Writer2.alloc = util2.pool(Writer2.alloc, util2.Array.prototype.subarray);
    Writer2.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer2.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer2.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    };
    Writer2.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer2.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer2.prototype.int64 = Writer2.prototype.uint64;
    Writer2.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer2.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer2.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer2.prototype.sfixed32 = Writer2.prototype.fixed32;
    Writer2.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer2.prototype.sfixed64 = Writer2.prototype.fixed64;
    Writer2.prototype.float = function write_float(value) {
      return this._push(util2.float.writeFloatLE, 4, value);
    };
    Writer2.prototype.double = function write_double(value) {
      return this._push(util2.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util2.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer2.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util2.isString(value)) {
        var buf = Writer2.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer2.prototype.string = function write_string(value) {
      var len = utf8.length(value);
      return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer2.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer2.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer2.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer2.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer2._configure = function(BufferWriter_) {
      BufferWriter = BufferWriter_;
      Writer2.create = create();
      BufferWriter._configure();
    };
  }
});

// node_modules/protobufjs/src/writer_buffer.js
var require_writer_buffer = __commonJS({
  "node_modules/protobufjs/src/writer_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferWriter;
    var Writer2 = require_writer();
    (BufferWriter.prototype = Object.create(Writer2.prototype)).constructor = BufferWriter;
    var util2 = require_minimal();
    function BufferWriter() {
      Writer2.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util2._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util2.Buffer && util2.Buffer.prototype instanceof Uint8Array && util2.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length; )
          buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util2.isString(value))
        value = util2._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util2.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util2.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
  }
});

// node_modules/protobufjs/src/reader.js
var require_reader = __commonJS({
  "node_modules/protobufjs/src/reader.js"(exports2, module2) {
    "use strict";
    module2.exports = Reader2;
    var util2 = require_minimal();
    var BufferReader;
    var LongBits = util2.LongBits;
    var utf8 = util2.utf8;
    function indexOutOfRange(reader, writeLength) {
      return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    function Reader2(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader2(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader2(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util2.Buffer ? function create_buffer_setup(buffer) {
        return (Reader2.create = function create_buffer(buffer2) {
          return util2.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader2.create = create();
    Reader2.prototype._slice = util2.Array.prototype.subarray || /* istanbul ignore next */
    util2.Array.prototype.slice;
    Reader2.prototype.uint32 = /* @__PURE__ */ (function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128) return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    })();
    Reader2.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader2.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader2.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader2.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader2.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader2.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util2.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader2.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util2.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader2.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      if (start === end) {
        var nativeBuffer = util2.Buffer;
        return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
      }
      return this._slice.call(this.buf, start, end);
    };
    Reader2.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader2.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader2.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        /* istanbul ignore next */
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader2._configure = function(BufferReader_) {
      BufferReader = BufferReader_;
      Reader2.create = create();
      BufferReader._configure();
      var fn = util2.Long ? "toLong" : (
        /* istanbul ignore next */
        "toNumber"
      );
      util2.merge(Reader2.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
  }
});

// node_modules/protobufjs/src/reader_buffer.js
var require_reader_buffer = __commonJS({
  "node_modules/protobufjs/src/reader_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferReader;
    var Reader2 = require_reader();
    (BufferReader.prototype = Object.create(Reader2.prototype)).constructor = BufferReader;
    var util2 = require_minimal();
    function BufferReader(buffer) {
      Reader2.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util2.Buffer)
        BufferReader.prototype._slice = util2.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
  }
});

// node_modules/protobufjs/src/rpc/service.js
var require_service = __commonJS({
  "node_modules/protobufjs/src/rpc/service.js"(exports2, module2) {
    "use strict";
    module2.exports = Service;
    var util2 = require_minimal();
    (Service.prototype = Object.create(util2.EventEmitter.prototype)).constructor = Service;
    function Service(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util2.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util2.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method);
              return callback(err);
            }
            if (response === null) {
              self2.end(
                /* endedByRPC */
                true
              );
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method);
                return callback(err2);
              }
            }
            self2.emit("data", response, method);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
  }
});

// node_modules/protobufjs/src/rpc.js
var require_rpc = __commonJS({
  "node_modules/protobufjs/src/rpc.js"(exports2) {
    "use strict";
    var rpc = exports2;
    rpc.Service = require_service();
  }
});

// node_modules/protobufjs/src/roots.js
var require_roots = __commonJS({
  "node_modules/protobufjs/src/roots.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// node_modules/protobufjs/src/index-minimal.js
var require_index_minimal = __commonJS({
  "node_modules/protobufjs/src/index-minimal.js"(exports2) {
    "use strict";
    var protobuf = exports2;
    protobuf.build = "minimal";
    protobuf.Writer = require_writer();
    protobuf.BufferWriter = require_writer_buffer();
    protobuf.Reader = require_reader();
    protobuf.BufferReader = require_reader_buffer();
    protobuf.util = require_minimal();
    protobuf.rpc = require_rpc();
    protobuf.roots = require_roots();
    protobuf.configure = configure;
    function configure() {
      protobuf.util._configure();
      protobuf.Writer._configure(protobuf.BufferWriter);
      protobuf.Reader._configure(protobuf.BufferReader);
    }
    configure();
  }
});

// node_modules/protobufjs/minimal.js
var require_minimal2 = __commonJS({
  "node_modules/protobufjs/minimal.js"(exports2, module2) {
    "use strict";
    module2.exports = require_index_minimal();
  }
});

// internal/ipc/gen/ipc_generated.js
var $protobuf = __toESM(require_minimal2());
var $Reader = $protobuf.Reader;
var $Writer = $protobuf.Writer;
var $util = $protobuf.util;
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
var tilbo = $root.tilbo = (() => {
  const tilbo2 = {};
  tilbo2.ipc = (function() {
    const ipc = {};
    ipc.v1 = (function() {
      const v1 = {};
      v1.Envelope = (function() {
        function Envelope(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        Envelope.prototype.requestId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        Envelope.prototype.request = null;
        Envelope.prototype.response = null;
        Envelope.prototype.event = null;
        let $oneOfFields;
        Object.defineProperty(Envelope.prototype, "payload", {
          get: $util.oneOfGetter($oneOfFields = ["request", "response", "event"]),
          set: $util.oneOfSetter($oneOfFields)
        });
        Envelope.create = function create(properties) {
          return new Envelope(properties);
        };
        Envelope.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).uint64(message.requestId);
          if (message.request != null && Object.hasOwnProperty.call(message, "request"))
            $root.tilbo.ipc.v1.Request.encode(message.request, writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
          if (message.response != null && Object.hasOwnProperty.call(message, "response"))
            $root.tilbo.ipc.v1.Response.encode(message.response, writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).fork()).ldelim();
          if (message.event != null && Object.hasOwnProperty.call(message, "event"))
            $root.tilbo.ipc.v1.Event.encode(message.event, writer.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
          return writer;
        };
        Envelope.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        Envelope.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Envelope();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.requestId = reader.uint64();
                break;
              }
              case 2: {
                message.request = $root.tilbo.ipc.v1.Request.decode(reader, reader.uint32());
                break;
              }
              case 3: {
                message.response = $root.tilbo.ipc.v1.Response.decode(reader, reader.uint32());
                break;
              }
              case 4: {
                message.event = $root.tilbo.ipc.v1.Event.decode(reader, reader.uint32());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        Envelope.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        Envelope.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          let properties = {};
          if (message.requestId != null && message.hasOwnProperty("requestId")) {
            if (!$util.isInteger(message.requestId) && !(message.requestId && $util.isInteger(message.requestId.low) && $util.isInteger(message.requestId.high)))
              return "requestId: integer|Long expected";
          }
          if (message.request != null && message.hasOwnProperty("request")) {
            properties.payload = 1;
            {
              let error = $root.tilbo.ipc.v1.Request.verify(message.request);
              if (error)
                return "request." + error;
            }
          }
          if (message.response != null && message.hasOwnProperty("response")) {
            if (properties.payload === 1)
              return "payload: multiple values";
            properties.payload = 1;
            {
              let error = $root.tilbo.ipc.v1.Response.verify(message.response);
              if (error)
                return "response." + error;
            }
          }
          if (message.event != null && message.hasOwnProperty("event")) {
            if (properties.payload === 1)
              return "payload: multiple values";
            properties.payload = 1;
            {
              let error = $root.tilbo.ipc.v1.Event.verify(message.event);
              if (error)
                return "event." + error;
            }
          }
          return null;
        };
        Envelope.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.Envelope)
            return object;
          let message = new $root.tilbo.ipc.v1.Envelope();
          if (object.requestId != null) {
            if ($util.Long)
              (message.requestId = $util.Long.fromValue(object.requestId)).unsigned = true;
            else if (typeof object.requestId === "string")
              message.requestId = parseInt(object.requestId, 10);
            else if (typeof object.requestId === "number")
              message.requestId = object.requestId;
            else if (typeof object.requestId === "object")
              message.requestId = new $util.LongBits(object.requestId.low >>> 0, object.requestId.high >>> 0).toNumber(true);
          }
          if (object.request != null) {
            if (typeof object.request !== "object")
              throw TypeError(".tilbo.ipc.v1.Envelope.request: object expected");
            message.request = $root.tilbo.ipc.v1.Request.fromObject(object.request);
          }
          if (object.response != null) {
            if (typeof object.response !== "object")
              throw TypeError(".tilbo.ipc.v1.Envelope.response: object expected");
            message.response = $root.tilbo.ipc.v1.Response.fromObject(object.response);
          }
          if (object.event != null) {
            if (typeof object.event !== "object")
              throw TypeError(".tilbo.ipc.v1.Envelope.event: object expected");
            message.event = $root.tilbo.ipc.v1.Event.fromObject(object.event);
          }
          return message;
        };
        Envelope.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            if ($util.Long) {
              let long = new $util.Long(0, 0, true);
              object.requestId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.requestId = options.longs === String ? "0" : 0;
          if (message.requestId != null && message.hasOwnProperty("requestId"))
            if (typeof message.requestId === "number")
              object.requestId = options.longs === String ? String(message.requestId) : message.requestId;
            else
              object.requestId = options.longs === String ? $util.Long.prototype.toString.call(message.requestId) : options.longs === Number ? new $util.LongBits(message.requestId.low >>> 0, message.requestId.high >>> 0).toNumber(true) : message.requestId;
          if (message.request != null && message.hasOwnProperty("request")) {
            object.request = $root.tilbo.ipc.v1.Request.toObject(message.request, options);
            if (options.oneofs)
              object.payload = "request";
          }
          if (message.response != null && message.hasOwnProperty("response")) {
            object.response = $root.tilbo.ipc.v1.Response.toObject(message.response, options);
            if (options.oneofs)
              object.payload = "response";
          }
          if (message.event != null && message.hasOwnProperty("event")) {
            object.event = $root.tilbo.ipc.v1.Event.toObject(message.event, options);
            if (options.oneofs)
              object.payload = "event";
          }
          return object;
        };
        Envelope.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        Envelope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.Envelope";
        };
        return Envelope;
      })();
      v1.Request = (function() {
        function Request(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        Request.prototype.search = null;
        Request.prototype.tag = null;
        Request.prototype.metadata = null;
        Request.prototype.metadataSet = null;
        Request.prototype.related = null;
        Request.prototype.status = null;
        Request.prototype.reloadRules = null;
        Request.prototype.listTags = null;
        Request.prototype.hydrateTags = null;
        Request.prototype.listDirectory = null;
        Request.prototype.statFile = null;
        Request.prototype.globSearch = null;
        Request.prototype.renameFile = null;
        Request.prototype.deleteFile = null;
        Request.prototype.chmodFile = null;
        Request.prototype.listPlaces = null;
        Request.prototype.pinPlace = null;
        Request.prototype.unpinPlace = null;
        Request.prototype.trashFile = null;
        Request.prototype.listTrash = null;
        Request.prototype.restoreTrash = null;
        Request.prototype.emptyTrash = null;
        Request.prototype.listAppsForFile = null;
        Request.prototype.openWithApp = null;
        Request.prototype.getBrowserConfig = null;
        Request.prototype.getFileBadges = null;
        Request.prototype.getFileActions = null;
        Request.prototype.runFileAction = null;
        Request.prototype.launchGui = null;
        let $oneOfFields;
        Object.defineProperty(Request.prototype, "kind", {
          get: $util.oneOfGetter($oneOfFields = ["search", "tag", "metadata", "metadataSet", "related", "status", "reloadRules", "listTags", "hydrateTags", "listDirectory", "statFile", "globSearch", "renameFile", "deleteFile", "chmodFile", "listPlaces", "pinPlace", "unpinPlace", "trashFile", "listTrash", "restoreTrash", "emptyTrash", "listAppsForFile", "openWithApp", "getBrowserConfig", "getFileBadges", "getFileActions", "runFileAction", "launchGui"]),
          set: $util.oneOfSetter($oneOfFields)
        });
        Request.create = function create(properties) {
          return new Request(properties);
        };
        Request.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.search != null && Object.hasOwnProperty.call(message, "search"))
            $root.tilbo.ipc.v1.SearchRequest.encode(message.search, writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
          if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
            $root.tilbo.ipc.v1.TagRequest.encode(message.tag, writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
          if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
            $root.tilbo.ipc.v1.MetadataRequest.encode(message.metadata, writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).fork()).ldelim();
          if (message.metadataSet != null && Object.hasOwnProperty.call(message, "metadataSet"))
            $root.tilbo.ipc.v1.MetadataSetRequest.encode(message.metadataSet, writer.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
          if (message.related != null && Object.hasOwnProperty.call(message, "related"))
            $root.tilbo.ipc.v1.RelatedRequest.encode(message.related, writer.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
          if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            $root.tilbo.ipc.v1.StatusRequest.encode(message.status, writer.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
          if (message.reloadRules != null && Object.hasOwnProperty.call(message, "reloadRules"))
            $root.tilbo.ipc.v1.ReloadRulesRequest.encode(message.reloadRules, writer.uint32(
              /* id 7, wireType 2 =*/
              58
            ).fork()).ldelim();
          if (message.listTags != null && Object.hasOwnProperty.call(message, "listTags"))
            $root.tilbo.ipc.v1.ListTagsRequest.encode(message.listTags, writer.uint32(
              /* id 8, wireType 2 =*/
              66
            ).fork()).ldelim();
          if (message.hydrateTags != null && Object.hasOwnProperty.call(message, "hydrateTags"))
            $root.tilbo.ipc.v1.HydrateTagsRequest.encode(message.hydrateTags, writer.uint32(
              /* id 9, wireType 2 =*/
              74
            ).fork()).ldelim();
          if (message.listDirectory != null && Object.hasOwnProperty.call(message, "listDirectory"))
            $root.tilbo.ipc.v1.ListDirectoryRequest.encode(message.listDirectory, writer.uint32(
              /* id 10, wireType 2 =*/
              82
            ).fork()).ldelim();
          if (message.statFile != null && Object.hasOwnProperty.call(message, "statFile"))
            $root.tilbo.ipc.v1.StatFileRequest.encode(message.statFile, writer.uint32(
              /* id 11, wireType 2 =*/
              90
            ).fork()).ldelim();
          if (message.globSearch != null && Object.hasOwnProperty.call(message, "globSearch"))
            $root.tilbo.ipc.v1.GlobSearchRequest.encode(message.globSearch, writer.uint32(
              /* id 12, wireType 2 =*/
              98
            ).fork()).ldelim();
          if (message.renameFile != null && Object.hasOwnProperty.call(message, "renameFile"))
            $root.tilbo.ipc.v1.RenameFileRequest.encode(message.renameFile, writer.uint32(
              /* id 13, wireType 2 =*/
              106
            ).fork()).ldelim();
          if (message.deleteFile != null && Object.hasOwnProperty.call(message, "deleteFile"))
            $root.tilbo.ipc.v1.DeleteFileRequest.encode(message.deleteFile, writer.uint32(
              /* id 14, wireType 2 =*/
              114
            ).fork()).ldelim();
          if (message.chmodFile != null && Object.hasOwnProperty.call(message, "chmodFile"))
            $root.tilbo.ipc.v1.ChmodFileRequest.encode(message.chmodFile, writer.uint32(
              /* id 15, wireType 2 =*/
              122
            ).fork()).ldelim();
          if (message.listPlaces != null && Object.hasOwnProperty.call(message, "listPlaces"))
            $root.tilbo.ipc.v1.ListPlacesRequest.encode(message.listPlaces, writer.uint32(
              /* id 16, wireType 2 =*/
              130
            ).fork()).ldelim();
          if (message.pinPlace != null && Object.hasOwnProperty.call(message, "pinPlace"))
            $root.tilbo.ipc.v1.PinPlaceRequest.encode(message.pinPlace, writer.uint32(
              /* id 17, wireType 2 =*/
              138
            ).fork()).ldelim();
          if (message.unpinPlace != null && Object.hasOwnProperty.call(message, "unpinPlace"))
            $root.tilbo.ipc.v1.UnpinPlaceRequest.encode(message.unpinPlace, writer.uint32(
              /* id 18, wireType 2 =*/
              146
            ).fork()).ldelim();
          if (message.trashFile != null && Object.hasOwnProperty.call(message, "trashFile"))
            $root.tilbo.ipc.v1.TrashFileRequest.encode(message.trashFile, writer.uint32(
              /* id 19, wireType 2 =*/
              154
            ).fork()).ldelim();
          if (message.listTrash != null && Object.hasOwnProperty.call(message, "listTrash"))
            $root.tilbo.ipc.v1.ListTrashRequest.encode(message.listTrash, writer.uint32(
              /* id 20, wireType 2 =*/
              162
            ).fork()).ldelim();
          if (message.restoreTrash != null && Object.hasOwnProperty.call(message, "restoreTrash"))
            $root.tilbo.ipc.v1.RestoreTrashRequest.encode(message.restoreTrash, writer.uint32(
              /* id 21, wireType 2 =*/
              170
            ).fork()).ldelim();
          if (message.emptyTrash != null && Object.hasOwnProperty.call(message, "emptyTrash"))
            $root.tilbo.ipc.v1.EmptyTrashRequest.encode(message.emptyTrash, writer.uint32(
              /* id 22, wireType 2 =*/
              178
            ).fork()).ldelim();
          if (message.listAppsForFile != null && Object.hasOwnProperty.call(message, "listAppsForFile"))
            $root.tilbo.ipc.v1.ListAppsForFileRequest.encode(message.listAppsForFile, writer.uint32(
              /* id 23, wireType 2 =*/
              186
            ).fork()).ldelim();
          if (message.openWithApp != null && Object.hasOwnProperty.call(message, "openWithApp"))
            $root.tilbo.ipc.v1.OpenWithAppRequest.encode(message.openWithApp, writer.uint32(
              /* id 24, wireType 2 =*/
              194
            ).fork()).ldelim();
          if (message.getBrowserConfig != null && Object.hasOwnProperty.call(message, "getBrowserConfig"))
            $root.tilbo.ipc.v1.GetBrowserConfigRequest.encode(message.getBrowserConfig, writer.uint32(
              /* id 25, wireType 2 =*/
              202
            ).fork()).ldelim();
          if (message.getFileBadges != null && Object.hasOwnProperty.call(message, "getFileBadges"))
            $root.tilbo.ipc.v1.GetFileBadgesRequest.encode(message.getFileBadges, writer.uint32(
              /* id 26, wireType 2 =*/
              210
            ).fork()).ldelim();
          if (message.getFileActions != null && Object.hasOwnProperty.call(message, "getFileActions"))
            $root.tilbo.ipc.v1.GetFileActionsRequest.encode(message.getFileActions, writer.uint32(
              /* id 27, wireType 2 =*/
              218
            ).fork()).ldelim();
          if (message.runFileAction != null && Object.hasOwnProperty.call(message, "runFileAction"))
            $root.tilbo.ipc.v1.RunFileActionRequest.encode(message.runFileAction, writer.uint32(
              /* id 28, wireType 2 =*/
              226
            ).fork()).ldelim();
          if (message.launchGui != null && Object.hasOwnProperty.call(message, "launchGui"))
            $root.tilbo.ipc.v1.LaunchGUIRequest.encode(message.launchGui, writer.uint32(
              /* id 29, wireType 2 =*/
              234
            ).fork()).ldelim();
          return writer;
        };
        Request.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        Request.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Request();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.search = $root.tilbo.ipc.v1.SearchRequest.decode(reader, reader.uint32());
                break;
              }
              case 2: {
                message.tag = $root.tilbo.ipc.v1.TagRequest.decode(reader, reader.uint32());
                break;
              }
              case 3: {
                message.metadata = $root.tilbo.ipc.v1.MetadataRequest.decode(reader, reader.uint32());
                break;
              }
              case 4: {
                message.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.decode(reader, reader.uint32());
                break;
              }
              case 5: {
                message.related = $root.tilbo.ipc.v1.RelatedRequest.decode(reader, reader.uint32());
                break;
              }
              case 6: {
                message.status = $root.tilbo.ipc.v1.StatusRequest.decode(reader, reader.uint32());
                break;
              }
              case 7: {
                message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.decode(reader, reader.uint32());
                break;
              }
              case 8: {
                message.listTags = $root.tilbo.ipc.v1.ListTagsRequest.decode(reader, reader.uint32());
                break;
              }
              case 9: {
                message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.decode(reader, reader.uint32());
                break;
              }
              case 10: {
                message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.decode(reader, reader.uint32());
                break;
              }
              case 11: {
                message.statFile = $root.tilbo.ipc.v1.StatFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 12: {
                message.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.decode(reader, reader.uint32());
                break;
              }
              case 13: {
                message.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 14: {
                message.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 15: {
                message.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 16: {
                message.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.decode(reader, reader.uint32());
                break;
              }
              case 17: {
                message.pinPlace = $root.tilbo.ipc.v1.PinPlaceRequest.decode(reader, reader.uint32());
                break;
              }
              case 18: {
                message.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceRequest.decode(reader, reader.uint32());
                break;
              }
              case 19: {
                message.trashFile = $root.tilbo.ipc.v1.TrashFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 20: {
                message.listTrash = $root.tilbo.ipc.v1.ListTrashRequest.decode(reader, reader.uint32());
                break;
              }
              case 21: {
                message.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashRequest.decode(reader, reader.uint32());
                break;
              }
              case 22: {
                message.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashRequest.decode(reader, reader.uint32());
                break;
              }
              case 23: {
                message.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileRequest.decode(reader, reader.uint32());
                break;
              }
              case 24: {
                message.openWithApp = $root.tilbo.ipc.v1.OpenWithAppRequest.decode(reader, reader.uint32());
                break;
              }
              case 25: {
                message.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigRequest.decode(reader, reader.uint32());
                break;
              }
              case 26: {
                message.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesRequest.decode(reader, reader.uint32());
                break;
              }
              case 27: {
                message.getFileActions = $root.tilbo.ipc.v1.GetFileActionsRequest.decode(reader, reader.uint32());
                break;
              }
              case 28: {
                message.runFileAction = $root.tilbo.ipc.v1.RunFileActionRequest.decode(reader, reader.uint32());
                break;
              }
              case 29: {
                message.launchGui = $root.tilbo.ipc.v1.LaunchGUIRequest.decode(reader, reader.uint32());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        Request.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        Request.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          let properties = {};
          if (message.search != null && message.hasOwnProperty("search")) {
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.SearchRequest.verify(message.search);
              if (error)
                return "search." + error;
            }
          }
          if (message.tag != null && message.hasOwnProperty("tag")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.TagRequest.verify(message.tag);
              if (error)
                return "tag." + error;
            }
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.MetadataRequest.verify(message.metadata);
              if (error)
                return "metadata." + error;
            }
          }
          if (message.metadataSet != null && message.hasOwnProperty("metadataSet")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.MetadataSetRequest.verify(message.metadataSet);
              if (error)
                return "metadataSet." + error;
            }
          }
          if (message.related != null && message.hasOwnProperty("related")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RelatedRequest.verify(message.related);
              if (error)
                return "related." + error;
            }
          }
          if (message.status != null && message.hasOwnProperty("status")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.StatusRequest.verify(message.status);
              if (error)
                return "status." + error;
            }
          }
          if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ReloadRulesRequest.verify(message.reloadRules);
              if (error)
                return "reloadRules." + error;
            }
          }
          if (message.listTags != null && message.hasOwnProperty("listTags")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListTagsRequest.verify(message.listTags);
              if (error)
                return "listTags." + error;
            }
          }
          if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.HydrateTagsRequest.verify(message.hydrateTags);
              if (error)
                return "hydrateTags." + error;
            }
          }
          if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListDirectoryRequest.verify(message.listDirectory);
              if (error)
                return "listDirectory." + error;
            }
          }
          if (message.statFile != null && message.hasOwnProperty("statFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.StatFileRequest.verify(message.statFile);
              if (error)
                return "statFile." + error;
            }
          }
          if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GlobSearchRequest.verify(message.globSearch);
              if (error)
                return "globSearch." + error;
            }
          }
          if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RenameFileRequest.verify(message.renameFile);
              if (error)
                return "renameFile." + error;
            }
          }
          if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.DeleteFileRequest.verify(message.deleteFile);
              if (error)
                return "deleteFile." + error;
            }
          }
          if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ChmodFileRequest.verify(message.chmodFile);
              if (error)
                return "chmodFile." + error;
            }
          }
          if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListPlacesRequest.verify(message.listPlaces);
              if (error)
                return "listPlaces." + error;
            }
          }
          if (message.pinPlace != null && message.hasOwnProperty("pinPlace")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.PinPlaceRequest.verify(message.pinPlace);
              if (error)
                return "pinPlace." + error;
            }
          }
          if (message.unpinPlace != null && message.hasOwnProperty("unpinPlace")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.UnpinPlaceRequest.verify(message.unpinPlace);
              if (error)
                return "unpinPlace." + error;
            }
          }
          if (message.trashFile != null && message.hasOwnProperty("trashFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.TrashFileRequest.verify(message.trashFile);
              if (error)
                return "trashFile." + error;
            }
          }
          if (message.listTrash != null && message.hasOwnProperty("listTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListTrashRequest.verify(message.listTrash);
              if (error)
                return "listTrash." + error;
            }
          }
          if (message.restoreTrash != null && message.hasOwnProperty("restoreTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RestoreTrashRequest.verify(message.restoreTrash);
              if (error)
                return "restoreTrash." + error;
            }
          }
          if (message.emptyTrash != null && message.hasOwnProperty("emptyTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.EmptyTrashRequest.verify(message.emptyTrash);
              if (error)
                return "emptyTrash." + error;
            }
          }
          if (message.listAppsForFile != null && message.hasOwnProperty("listAppsForFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListAppsForFileRequest.verify(message.listAppsForFile);
              if (error)
                return "listAppsForFile." + error;
            }
          }
          if (message.openWithApp != null && message.hasOwnProperty("openWithApp")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.OpenWithAppRequest.verify(message.openWithApp);
              if (error)
                return "openWithApp." + error;
            }
          }
          if (message.getBrowserConfig != null && message.hasOwnProperty("getBrowserConfig")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetBrowserConfigRequest.verify(message.getBrowserConfig);
              if (error)
                return "getBrowserConfig." + error;
            }
          }
          if (message.getFileBadges != null && message.hasOwnProperty("getFileBadges")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetFileBadgesRequest.verify(message.getFileBadges);
              if (error)
                return "getFileBadges." + error;
            }
          }
          if (message.getFileActions != null && message.hasOwnProperty("getFileActions")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetFileActionsRequest.verify(message.getFileActions);
              if (error)
                return "getFileActions." + error;
            }
          }
          if (message.runFileAction != null && message.hasOwnProperty("runFileAction")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RunFileActionRequest.verify(message.runFileAction);
              if (error)
                return "runFileAction." + error;
            }
          }
          if (message.launchGui != null && message.hasOwnProperty("launchGui")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.LaunchGUIRequest.verify(message.launchGui);
              if (error)
                return "launchGui." + error;
            }
          }
          return null;
        };
        Request.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.Request)
            return object;
          let message = new $root.tilbo.ipc.v1.Request();
          if (object.search != null) {
            if (typeof object.search !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.search: object expected");
            message.search = $root.tilbo.ipc.v1.SearchRequest.fromObject(object.search);
          }
          if (object.tag != null) {
            if (typeof object.tag !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.tag: object expected");
            message.tag = $root.tilbo.ipc.v1.TagRequest.fromObject(object.tag);
          }
          if (object.metadata != null) {
            if (typeof object.metadata !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.metadata: object expected");
            message.metadata = $root.tilbo.ipc.v1.MetadataRequest.fromObject(object.metadata);
          }
          if (object.metadataSet != null) {
            if (typeof object.metadataSet !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.metadataSet: object expected");
            message.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.fromObject(object.metadataSet);
          }
          if (object.related != null) {
            if (typeof object.related !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.related: object expected");
            message.related = $root.tilbo.ipc.v1.RelatedRequest.fromObject(object.related);
          }
          if (object.status != null) {
            if (typeof object.status !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.status: object expected");
            message.status = $root.tilbo.ipc.v1.StatusRequest.fromObject(object.status);
          }
          if (object.reloadRules != null) {
            if (typeof object.reloadRules !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.reloadRules: object expected");
            message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.fromObject(object.reloadRules);
          }
          if (object.listTags != null) {
            if (typeof object.listTags !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.listTags: object expected");
            message.listTags = $root.tilbo.ipc.v1.ListTagsRequest.fromObject(object.listTags);
          }
          if (object.hydrateTags != null) {
            if (typeof object.hydrateTags !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.hydrateTags: object expected");
            message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.fromObject(object.hydrateTags);
          }
          if (object.listDirectory != null) {
            if (typeof object.listDirectory !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.listDirectory: object expected");
            message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.fromObject(object.listDirectory);
          }
          if (object.statFile != null) {
            if (typeof object.statFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.statFile: object expected");
            message.statFile = $root.tilbo.ipc.v1.StatFileRequest.fromObject(object.statFile);
          }
          if (object.globSearch != null) {
            if (typeof object.globSearch !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.globSearch: object expected");
            message.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.fromObject(object.globSearch);
          }
          if (object.renameFile != null) {
            if (typeof object.renameFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.renameFile: object expected");
            message.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.fromObject(object.renameFile);
          }
          if (object.deleteFile != null) {
            if (typeof object.deleteFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.deleteFile: object expected");
            message.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.fromObject(object.deleteFile);
          }
          if (object.chmodFile != null) {
            if (typeof object.chmodFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.chmodFile: object expected");
            message.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.fromObject(object.chmodFile);
          }
          if (object.listPlaces != null) {
            if (typeof object.listPlaces !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.listPlaces: object expected");
            message.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.fromObject(object.listPlaces);
          }
          if (object.pinPlace != null) {
            if (typeof object.pinPlace !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.pinPlace: object expected");
            message.pinPlace = $root.tilbo.ipc.v1.PinPlaceRequest.fromObject(object.pinPlace);
          }
          if (object.unpinPlace != null) {
            if (typeof object.unpinPlace !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.unpinPlace: object expected");
            message.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceRequest.fromObject(object.unpinPlace);
          }
          if (object.trashFile != null) {
            if (typeof object.trashFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.trashFile: object expected");
            message.trashFile = $root.tilbo.ipc.v1.TrashFileRequest.fromObject(object.trashFile);
          }
          if (object.listTrash != null) {
            if (typeof object.listTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.listTrash: object expected");
            message.listTrash = $root.tilbo.ipc.v1.ListTrashRequest.fromObject(object.listTrash);
          }
          if (object.restoreTrash != null) {
            if (typeof object.restoreTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.restoreTrash: object expected");
            message.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashRequest.fromObject(object.restoreTrash);
          }
          if (object.emptyTrash != null) {
            if (typeof object.emptyTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.emptyTrash: object expected");
            message.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashRequest.fromObject(object.emptyTrash);
          }
          if (object.listAppsForFile != null) {
            if (typeof object.listAppsForFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.listAppsForFile: object expected");
            message.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileRequest.fromObject(object.listAppsForFile);
          }
          if (object.openWithApp != null) {
            if (typeof object.openWithApp !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.openWithApp: object expected");
            message.openWithApp = $root.tilbo.ipc.v1.OpenWithAppRequest.fromObject(object.openWithApp);
          }
          if (object.getBrowserConfig != null) {
            if (typeof object.getBrowserConfig !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.getBrowserConfig: object expected");
            message.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigRequest.fromObject(object.getBrowserConfig);
          }
          if (object.getFileBadges != null) {
            if (typeof object.getFileBadges !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.getFileBadges: object expected");
            message.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesRequest.fromObject(object.getFileBadges);
          }
          if (object.getFileActions != null) {
            if (typeof object.getFileActions !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.getFileActions: object expected");
            message.getFileActions = $root.tilbo.ipc.v1.GetFileActionsRequest.fromObject(object.getFileActions);
          }
          if (object.runFileAction != null) {
            if (typeof object.runFileAction !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.runFileAction: object expected");
            message.runFileAction = $root.tilbo.ipc.v1.RunFileActionRequest.fromObject(object.runFileAction);
          }
          if (object.launchGui != null) {
            if (typeof object.launchGui !== "object")
              throw TypeError(".tilbo.ipc.v1.Request.launchGui: object expected");
            message.launchGui = $root.tilbo.ipc.v1.LaunchGUIRequest.fromObject(object.launchGui);
          }
          return message;
        };
        Request.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (message.search != null && message.hasOwnProperty("search")) {
            object.search = $root.tilbo.ipc.v1.SearchRequest.toObject(message.search, options);
            if (options.oneofs)
              object.kind = "search";
          }
          if (message.tag != null && message.hasOwnProperty("tag")) {
            object.tag = $root.tilbo.ipc.v1.TagRequest.toObject(message.tag, options);
            if (options.oneofs)
              object.kind = "tag";
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            object.metadata = $root.tilbo.ipc.v1.MetadataRequest.toObject(message.metadata, options);
            if (options.oneofs)
              object.kind = "metadata";
          }
          if (message.metadataSet != null && message.hasOwnProperty("metadataSet")) {
            object.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.toObject(message.metadataSet, options);
            if (options.oneofs)
              object.kind = "metadataSet";
          }
          if (message.related != null && message.hasOwnProperty("related")) {
            object.related = $root.tilbo.ipc.v1.RelatedRequest.toObject(message.related, options);
            if (options.oneofs)
              object.kind = "related";
          }
          if (message.status != null && message.hasOwnProperty("status")) {
            object.status = $root.tilbo.ipc.v1.StatusRequest.toObject(message.status, options);
            if (options.oneofs)
              object.kind = "status";
          }
          if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
            object.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.toObject(message.reloadRules, options);
            if (options.oneofs)
              object.kind = "reloadRules";
          }
          if (message.listTags != null && message.hasOwnProperty("listTags")) {
            object.listTags = $root.tilbo.ipc.v1.ListTagsRequest.toObject(message.listTags, options);
            if (options.oneofs)
              object.kind = "listTags";
          }
          if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
            object.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.toObject(message.hydrateTags, options);
            if (options.oneofs)
              object.kind = "hydrateTags";
          }
          if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
            object.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.toObject(message.listDirectory, options);
            if (options.oneofs)
              object.kind = "listDirectory";
          }
          if (message.statFile != null && message.hasOwnProperty("statFile")) {
            object.statFile = $root.tilbo.ipc.v1.StatFileRequest.toObject(message.statFile, options);
            if (options.oneofs)
              object.kind = "statFile";
          }
          if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
            object.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.toObject(message.globSearch, options);
            if (options.oneofs)
              object.kind = "globSearch";
          }
          if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
            object.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.toObject(message.renameFile, options);
            if (options.oneofs)
              object.kind = "renameFile";
          }
          if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
            object.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.toObject(message.deleteFile, options);
            if (options.oneofs)
              object.kind = "deleteFile";
          }
          if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
            object.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.toObject(message.chmodFile, options);
            if (options.oneofs)
              object.kind = "chmodFile";
          }
          if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
            object.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.toObject(message.listPlaces, options);
            if (options.oneofs)
              object.kind = "listPlaces";
          }
          if (message.pinPlace != null && message.hasOwnProperty("pinPlace")) {
            object.pinPlace = $root.tilbo.ipc.v1.PinPlaceRequest.toObject(message.pinPlace, options);
            if (options.oneofs)
              object.kind = "pinPlace";
          }
          if (message.unpinPlace != null && message.hasOwnProperty("unpinPlace")) {
            object.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceRequest.toObject(message.unpinPlace, options);
            if (options.oneofs)
              object.kind = "unpinPlace";
          }
          if (message.trashFile != null && message.hasOwnProperty("trashFile")) {
            object.trashFile = $root.tilbo.ipc.v1.TrashFileRequest.toObject(message.trashFile, options);
            if (options.oneofs)
              object.kind = "trashFile";
          }
          if (message.listTrash != null && message.hasOwnProperty("listTrash")) {
            object.listTrash = $root.tilbo.ipc.v1.ListTrashRequest.toObject(message.listTrash, options);
            if (options.oneofs)
              object.kind = "listTrash";
          }
          if (message.restoreTrash != null && message.hasOwnProperty("restoreTrash")) {
            object.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashRequest.toObject(message.restoreTrash, options);
            if (options.oneofs)
              object.kind = "restoreTrash";
          }
          if (message.emptyTrash != null && message.hasOwnProperty("emptyTrash")) {
            object.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashRequest.toObject(message.emptyTrash, options);
            if (options.oneofs)
              object.kind = "emptyTrash";
          }
          if (message.listAppsForFile != null && message.hasOwnProperty("listAppsForFile")) {
            object.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileRequest.toObject(message.listAppsForFile, options);
            if (options.oneofs)
              object.kind = "listAppsForFile";
          }
          if (message.openWithApp != null && message.hasOwnProperty("openWithApp")) {
            object.openWithApp = $root.tilbo.ipc.v1.OpenWithAppRequest.toObject(message.openWithApp, options);
            if (options.oneofs)
              object.kind = "openWithApp";
          }
          if (message.getBrowserConfig != null && message.hasOwnProperty("getBrowserConfig")) {
            object.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigRequest.toObject(message.getBrowserConfig, options);
            if (options.oneofs)
              object.kind = "getBrowserConfig";
          }
          if (message.getFileBadges != null && message.hasOwnProperty("getFileBadges")) {
            object.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesRequest.toObject(message.getFileBadges, options);
            if (options.oneofs)
              object.kind = "getFileBadges";
          }
          if (message.getFileActions != null && message.hasOwnProperty("getFileActions")) {
            object.getFileActions = $root.tilbo.ipc.v1.GetFileActionsRequest.toObject(message.getFileActions, options);
            if (options.oneofs)
              object.kind = "getFileActions";
          }
          if (message.runFileAction != null && message.hasOwnProperty("runFileAction")) {
            object.runFileAction = $root.tilbo.ipc.v1.RunFileActionRequest.toObject(message.runFileAction, options);
            if (options.oneofs)
              object.kind = "runFileAction";
          }
          if (message.launchGui != null && message.hasOwnProperty("launchGui")) {
            object.launchGui = $root.tilbo.ipc.v1.LaunchGUIRequest.toObject(message.launchGui, options);
            if (options.oneofs)
              object.kind = "launchGui";
          }
          return object;
        };
        Request.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        Request.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.Request";
        };
        return Request;
      })();
      v1.Response = (function() {
        function Response(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        Response.prototype.error = null;
        Response.prototype.search = null;
        Response.prototype.tag = null;
        Response.prototype.metadata = null;
        Response.prototype.related = null;
        Response.prototype.status = null;
        Response.prototype.reloadRules = null;
        Response.prototype.listTags = null;
        Response.prototype.hydrateTags = null;
        Response.prototype.listDirectory = null;
        Response.prototype.statFile = null;
        Response.prototype.globSearch = null;
        Response.prototype.renameFile = null;
        Response.prototype.deleteFile = null;
        Response.prototype.chmodFile = null;
        Response.prototype.listPlaces = null;
        Response.prototype.pinPlace = null;
        Response.prototype.unpinPlace = null;
        Response.prototype.trashFile = null;
        Response.prototype.listTrash = null;
        Response.prototype.restoreTrash = null;
        Response.prototype.emptyTrash = null;
        Response.prototype.listAppsForFile = null;
        Response.prototype.openWithApp = null;
        Response.prototype.getBrowserConfig = null;
        Response.prototype.getFileBadges = null;
        Response.prototype.getFileActions = null;
        Response.prototype.runFileAction = null;
        Response.prototype.launchGui = null;
        let $oneOfFields;
        Object.defineProperty(Response.prototype, "kind", {
          get: $util.oneOfGetter($oneOfFields = ["error", "search", "tag", "metadata", "related", "status", "reloadRules", "listTags", "hydrateTags", "listDirectory", "statFile", "globSearch", "renameFile", "deleteFile", "chmodFile", "listPlaces", "pinPlace", "unpinPlace", "trashFile", "listTrash", "restoreTrash", "emptyTrash", "listAppsForFile", "openWithApp", "getBrowserConfig", "getFileBadges", "getFileActions", "runFileAction", "launchGui"]),
          set: $util.oneOfSetter($oneOfFields)
        });
        Response.create = function create(properties) {
          return new Response(properties);
        };
        Response.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.error != null && Object.hasOwnProperty.call(message, "error"))
            $root.tilbo.ipc.v1.ErrorResponse.encode(message.error, writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
          if (message.search != null && Object.hasOwnProperty.call(message, "search"))
            $root.tilbo.ipc.v1.SearchResponse.encode(message.search, writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
          if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
            $root.tilbo.ipc.v1.TagResponse.encode(message.tag, writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).fork()).ldelim();
          if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
            $root.tilbo.ipc.v1.MetadataResponse.encode(message.metadata, writer.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
          if (message.related != null && Object.hasOwnProperty.call(message, "related"))
            $root.tilbo.ipc.v1.RelatedResponse.encode(message.related, writer.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
          if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            $root.tilbo.ipc.v1.StatusResponse.encode(message.status, writer.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
          if (message.reloadRules != null && Object.hasOwnProperty.call(message, "reloadRules"))
            $root.tilbo.ipc.v1.ReloadRulesResponse.encode(message.reloadRules, writer.uint32(
              /* id 7, wireType 2 =*/
              58
            ).fork()).ldelim();
          if (message.listTags != null && Object.hasOwnProperty.call(message, "listTags"))
            $root.tilbo.ipc.v1.ListTagsResponse.encode(message.listTags, writer.uint32(
              /* id 8, wireType 2 =*/
              66
            ).fork()).ldelim();
          if (message.hydrateTags != null && Object.hasOwnProperty.call(message, "hydrateTags"))
            $root.tilbo.ipc.v1.HydrateTagsResponse.encode(message.hydrateTags, writer.uint32(
              /* id 9, wireType 2 =*/
              74
            ).fork()).ldelim();
          if (message.listDirectory != null && Object.hasOwnProperty.call(message, "listDirectory"))
            $root.tilbo.ipc.v1.ListDirectoryResponse.encode(message.listDirectory, writer.uint32(
              /* id 10, wireType 2 =*/
              82
            ).fork()).ldelim();
          if (message.statFile != null && Object.hasOwnProperty.call(message, "statFile"))
            $root.tilbo.ipc.v1.StatFileResponse.encode(message.statFile, writer.uint32(
              /* id 11, wireType 2 =*/
              90
            ).fork()).ldelim();
          if (message.globSearch != null && Object.hasOwnProperty.call(message, "globSearch"))
            $root.tilbo.ipc.v1.GlobSearchResponse.encode(message.globSearch, writer.uint32(
              /* id 12, wireType 2 =*/
              98
            ).fork()).ldelim();
          if (message.renameFile != null && Object.hasOwnProperty.call(message, "renameFile"))
            $root.tilbo.ipc.v1.RenameFileResponse.encode(message.renameFile, writer.uint32(
              /* id 13, wireType 2 =*/
              106
            ).fork()).ldelim();
          if (message.deleteFile != null && Object.hasOwnProperty.call(message, "deleteFile"))
            $root.tilbo.ipc.v1.DeleteFileResponse.encode(message.deleteFile, writer.uint32(
              /* id 14, wireType 2 =*/
              114
            ).fork()).ldelim();
          if (message.chmodFile != null && Object.hasOwnProperty.call(message, "chmodFile"))
            $root.tilbo.ipc.v1.ChmodFileResponse.encode(message.chmodFile, writer.uint32(
              /* id 15, wireType 2 =*/
              122
            ).fork()).ldelim();
          if (message.listPlaces != null && Object.hasOwnProperty.call(message, "listPlaces"))
            $root.tilbo.ipc.v1.ListPlacesResponse.encode(message.listPlaces, writer.uint32(
              /* id 16, wireType 2 =*/
              130
            ).fork()).ldelim();
          if (message.pinPlace != null && Object.hasOwnProperty.call(message, "pinPlace"))
            $root.tilbo.ipc.v1.PinPlaceResponse.encode(message.pinPlace, writer.uint32(
              /* id 17, wireType 2 =*/
              138
            ).fork()).ldelim();
          if (message.unpinPlace != null && Object.hasOwnProperty.call(message, "unpinPlace"))
            $root.tilbo.ipc.v1.UnpinPlaceResponse.encode(message.unpinPlace, writer.uint32(
              /* id 18, wireType 2 =*/
              146
            ).fork()).ldelim();
          if (message.trashFile != null && Object.hasOwnProperty.call(message, "trashFile"))
            $root.tilbo.ipc.v1.TrashFileResponse.encode(message.trashFile, writer.uint32(
              /* id 19, wireType 2 =*/
              154
            ).fork()).ldelim();
          if (message.listTrash != null && Object.hasOwnProperty.call(message, "listTrash"))
            $root.tilbo.ipc.v1.ListTrashResponse.encode(message.listTrash, writer.uint32(
              /* id 20, wireType 2 =*/
              162
            ).fork()).ldelim();
          if (message.restoreTrash != null && Object.hasOwnProperty.call(message, "restoreTrash"))
            $root.tilbo.ipc.v1.RestoreTrashResponse.encode(message.restoreTrash, writer.uint32(
              /* id 21, wireType 2 =*/
              170
            ).fork()).ldelim();
          if (message.emptyTrash != null && Object.hasOwnProperty.call(message, "emptyTrash"))
            $root.tilbo.ipc.v1.EmptyTrashResponse.encode(message.emptyTrash, writer.uint32(
              /* id 22, wireType 2 =*/
              178
            ).fork()).ldelim();
          if (message.listAppsForFile != null && Object.hasOwnProperty.call(message, "listAppsForFile"))
            $root.tilbo.ipc.v1.ListAppsForFileResponse.encode(message.listAppsForFile, writer.uint32(
              /* id 23, wireType 2 =*/
              186
            ).fork()).ldelim();
          if (message.openWithApp != null && Object.hasOwnProperty.call(message, "openWithApp"))
            $root.tilbo.ipc.v1.OpenWithAppResponse.encode(message.openWithApp, writer.uint32(
              /* id 24, wireType 2 =*/
              194
            ).fork()).ldelim();
          if (message.getBrowserConfig != null && Object.hasOwnProperty.call(message, "getBrowserConfig"))
            $root.tilbo.ipc.v1.GetBrowserConfigResponse.encode(message.getBrowserConfig, writer.uint32(
              /* id 25, wireType 2 =*/
              202
            ).fork()).ldelim();
          if (message.getFileBadges != null && Object.hasOwnProperty.call(message, "getFileBadges"))
            $root.tilbo.ipc.v1.GetFileBadgesResponse.encode(message.getFileBadges, writer.uint32(
              /* id 26, wireType 2 =*/
              210
            ).fork()).ldelim();
          if (message.getFileActions != null && Object.hasOwnProperty.call(message, "getFileActions"))
            $root.tilbo.ipc.v1.GetFileActionsResponse.encode(message.getFileActions, writer.uint32(
              /* id 27, wireType 2 =*/
              218
            ).fork()).ldelim();
          if (message.runFileAction != null && Object.hasOwnProperty.call(message, "runFileAction"))
            $root.tilbo.ipc.v1.RunFileActionResponse.encode(message.runFileAction, writer.uint32(
              /* id 28, wireType 2 =*/
              226
            ).fork()).ldelim();
          if (message.launchGui != null && Object.hasOwnProperty.call(message, "launchGui"))
            $root.tilbo.ipc.v1.LaunchGUIResponse.encode(message.launchGui, writer.uint32(
              /* id 29, wireType 2 =*/
              234
            ).fork()).ldelim();
          return writer;
        };
        Response.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        Response.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Response();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.error = $root.tilbo.ipc.v1.ErrorResponse.decode(reader, reader.uint32());
                break;
              }
              case 2: {
                message.search = $root.tilbo.ipc.v1.SearchResponse.decode(reader, reader.uint32());
                break;
              }
              case 3: {
                message.tag = $root.tilbo.ipc.v1.TagResponse.decode(reader, reader.uint32());
                break;
              }
              case 4: {
                message.metadata = $root.tilbo.ipc.v1.MetadataResponse.decode(reader, reader.uint32());
                break;
              }
              case 5: {
                message.related = $root.tilbo.ipc.v1.RelatedResponse.decode(reader, reader.uint32());
                break;
              }
              case 6: {
                message.status = $root.tilbo.ipc.v1.StatusResponse.decode(reader, reader.uint32());
                break;
              }
              case 7: {
                message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.decode(reader, reader.uint32());
                break;
              }
              case 8: {
                message.listTags = $root.tilbo.ipc.v1.ListTagsResponse.decode(reader, reader.uint32());
                break;
              }
              case 9: {
                message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.decode(reader, reader.uint32());
                break;
              }
              case 10: {
                message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.decode(reader, reader.uint32());
                break;
              }
              case 11: {
                message.statFile = $root.tilbo.ipc.v1.StatFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 12: {
                message.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.decode(reader, reader.uint32());
                break;
              }
              case 13: {
                message.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 14: {
                message.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 15: {
                message.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 16: {
                message.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.decode(reader, reader.uint32());
                break;
              }
              case 17: {
                message.pinPlace = $root.tilbo.ipc.v1.PinPlaceResponse.decode(reader, reader.uint32());
                break;
              }
              case 18: {
                message.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceResponse.decode(reader, reader.uint32());
                break;
              }
              case 19: {
                message.trashFile = $root.tilbo.ipc.v1.TrashFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 20: {
                message.listTrash = $root.tilbo.ipc.v1.ListTrashResponse.decode(reader, reader.uint32());
                break;
              }
              case 21: {
                message.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashResponse.decode(reader, reader.uint32());
                break;
              }
              case 22: {
                message.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashResponse.decode(reader, reader.uint32());
                break;
              }
              case 23: {
                message.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileResponse.decode(reader, reader.uint32());
                break;
              }
              case 24: {
                message.openWithApp = $root.tilbo.ipc.v1.OpenWithAppResponse.decode(reader, reader.uint32());
                break;
              }
              case 25: {
                message.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigResponse.decode(reader, reader.uint32());
                break;
              }
              case 26: {
                message.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesResponse.decode(reader, reader.uint32());
                break;
              }
              case 27: {
                message.getFileActions = $root.tilbo.ipc.v1.GetFileActionsResponse.decode(reader, reader.uint32());
                break;
              }
              case 28: {
                message.runFileAction = $root.tilbo.ipc.v1.RunFileActionResponse.decode(reader, reader.uint32());
                break;
              }
              case 29: {
                message.launchGui = $root.tilbo.ipc.v1.LaunchGUIResponse.decode(reader, reader.uint32());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        Response.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        Response.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          let properties = {};
          if (message.error != null && message.hasOwnProperty("error")) {
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ErrorResponse.verify(message.error);
              if (error)
                return "error." + error;
            }
          }
          if (message.search != null && message.hasOwnProperty("search")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.SearchResponse.verify(message.search);
              if (error)
                return "search." + error;
            }
          }
          if (message.tag != null && message.hasOwnProperty("tag")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.TagResponse.verify(message.tag);
              if (error)
                return "tag." + error;
            }
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.MetadataResponse.verify(message.metadata);
              if (error)
                return "metadata." + error;
            }
          }
          if (message.related != null && message.hasOwnProperty("related")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RelatedResponse.verify(message.related);
              if (error)
                return "related." + error;
            }
          }
          if (message.status != null && message.hasOwnProperty("status")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.StatusResponse.verify(message.status);
              if (error)
                return "status." + error;
            }
          }
          if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ReloadRulesResponse.verify(message.reloadRules);
              if (error)
                return "reloadRules." + error;
            }
          }
          if (message.listTags != null && message.hasOwnProperty("listTags")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListTagsResponse.verify(message.listTags);
              if (error)
                return "listTags." + error;
            }
          }
          if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.HydrateTagsResponse.verify(message.hydrateTags);
              if (error)
                return "hydrateTags." + error;
            }
          }
          if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListDirectoryResponse.verify(message.listDirectory);
              if (error)
                return "listDirectory." + error;
            }
          }
          if (message.statFile != null && message.hasOwnProperty("statFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.StatFileResponse.verify(message.statFile);
              if (error)
                return "statFile." + error;
            }
          }
          if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GlobSearchResponse.verify(message.globSearch);
              if (error)
                return "globSearch." + error;
            }
          }
          if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RenameFileResponse.verify(message.renameFile);
              if (error)
                return "renameFile." + error;
            }
          }
          if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.DeleteFileResponse.verify(message.deleteFile);
              if (error)
                return "deleteFile." + error;
            }
          }
          if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ChmodFileResponse.verify(message.chmodFile);
              if (error)
                return "chmodFile." + error;
            }
          }
          if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListPlacesResponse.verify(message.listPlaces);
              if (error)
                return "listPlaces." + error;
            }
          }
          if (message.pinPlace != null && message.hasOwnProperty("pinPlace")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.PinPlaceResponse.verify(message.pinPlace);
              if (error)
                return "pinPlace." + error;
            }
          }
          if (message.unpinPlace != null && message.hasOwnProperty("unpinPlace")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.UnpinPlaceResponse.verify(message.unpinPlace);
              if (error)
                return "unpinPlace." + error;
            }
          }
          if (message.trashFile != null && message.hasOwnProperty("trashFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.TrashFileResponse.verify(message.trashFile);
              if (error)
                return "trashFile." + error;
            }
          }
          if (message.listTrash != null && message.hasOwnProperty("listTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListTrashResponse.verify(message.listTrash);
              if (error)
                return "listTrash." + error;
            }
          }
          if (message.restoreTrash != null && message.hasOwnProperty("restoreTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RestoreTrashResponse.verify(message.restoreTrash);
              if (error)
                return "restoreTrash." + error;
            }
          }
          if (message.emptyTrash != null && message.hasOwnProperty("emptyTrash")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.EmptyTrashResponse.verify(message.emptyTrash);
              if (error)
                return "emptyTrash." + error;
            }
          }
          if (message.listAppsForFile != null && message.hasOwnProperty("listAppsForFile")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ListAppsForFileResponse.verify(message.listAppsForFile);
              if (error)
                return "listAppsForFile." + error;
            }
          }
          if (message.openWithApp != null && message.hasOwnProperty("openWithApp")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.OpenWithAppResponse.verify(message.openWithApp);
              if (error)
                return "openWithApp." + error;
            }
          }
          if (message.getBrowserConfig != null && message.hasOwnProperty("getBrowserConfig")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetBrowserConfigResponse.verify(message.getBrowserConfig);
              if (error)
                return "getBrowserConfig." + error;
            }
          }
          if (message.getFileBadges != null && message.hasOwnProperty("getFileBadges")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetFileBadgesResponse.verify(message.getFileBadges);
              if (error)
                return "getFileBadges." + error;
            }
          }
          if (message.getFileActions != null && message.hasOwnProperty("getFileActions")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.GetFileActionsResponse.verify(message.getFileActions);
              if (error)
                return "getFileActions." + error;
            }
          }
          if (message.runFileAction != null && message.hasOwnProperty("runFileAction")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.RunFileActionResponse.verify(message.runFileAction);
              if (error)
                return "runFileAction." + error;
            }
          }
          if (message.launchGui != null && message.hasOwnProperty("launchGui")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.LaunchGUIResponse.verify(message.launchGui);
              if (error)
                return "launchGui." + error;
            }
          }
          return null;
        };
        Response.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.Response)
            return object;
          let message = new $root.tilbo.ipc.v1.Response();
          if (object.error != null) {
            if (typeof object.error !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.error: object expected");
            message.error = $root.tilbo.ipc.v1.ErrorResponse.fromObject(object.error);
          }
          if (object.search != null) {
            if (typeof object.search !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.search: object expected");
            message.search = $root.tilbo.ipc.v1.SearchResponse.fromObject(object.search);
          }
          if (object.tag != null) {
            if (typeof object.tag !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.tag: object expected");
            message.tag = $root.tilbo.ipc.v1.TagResponse.fromObject(object.tag);
          }
          if (object.metadata != null) {
            if (typeof object.metadata !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.metadata: object expected");
            message.metadata = $root.tilbo.ipc.v1.MetadataResponse.fromObject(object.metadata);
          }
          if (object.related != null) {
            if (typeof object.related !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.related: object expected");
            message.related = $root.tilbo.ipc.v1.RelatedResponse.fromObject(object.related);
          }
          if (object.status != null) {
            if (typeof object.status !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.status: object expected");
            message.status = $root.tilbo.ipc.v1.StatusResponse.fromObject(object.status);
          }
          if (object.reloadRules != null) {
            if (typeof object.reloadRules !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.reloadRules: object expected");
            message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.fromObject(object.reloadRules);
          }
          if (object.listTags != null) {
            if (typeof object.listTags !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.listTags: object expected");
            message.listTags = $root.tilbo.ipc.v1.ListTagsResponse.fromObject(object.listTags);
          }
          if (object.hydrateTags != null) {
            if (typeof object.hydrateTags !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.hydrateTags: object expected");
            message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.fromObject(object.hydrateTags);
          }
          if (object.listDirectory != null) {
            if (typeof object.listDirectory !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.listDirectory: object expected");
            message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.fromObject(object.listDirectory);
          }
          if (object.statFile != null) {
            if (typeof object.statFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.statFile: object expected");
            message.statFile = $root.tilbo.ipc.v1.StatFileResponse.fromObject(object.statFile);
          }
          if (object.globSearch != null) {
            if (typeof object.globSearch !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.globSearch: object expected");
            message.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.fromObject(object.globSearch);
          }
          if (object.renameFile != null) {
            if (typeof object.renameFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.renameFile: object expected");
            message.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.fromObject(object.renameFile);
          }
          if (object.deleteFile != null) {
            if (typeof object.deleteFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.deleteFile: object expected");
            message.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.fromObject(object.deleteFile);
          }
          if (object.chmodFile != null) {
            if (typeof object.chmodFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.chmodFile: object expected");
            message.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.fromObject(object.chmodFile);
          }
          if (object.listPlaces != null) {
            if (typeof object.listPlaces !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.listPlaces: object expected");
            message.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.fromObject(object.listPlaces);
          }
          if (object.pinPlace != null) {
            if (typeof object.pinPlace !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.pinPlace: object expected");
            message.pinPlace = $root.tilbo.ipc.v1.PinPlaceResponse.fromObject(object.pinPlace);
          }
          if (object.unpinPlace != null) {
            if (typeof object.unpinPlace !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.unpinPlace: object expected");
            message.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceResponse.fromObject(object.unpinPlace);
          }
          if (object.trashFile != null) {
            if (typeof object.trashFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.trashFile: object expected");
            message.trashFile = $root.tilbo.ipc.v1.TrashFileResponse.fromObject(object.trashFile);
          }
          if (object.listTrash != null) {
            if (typeof object.listTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.listTrash: object expected");
            message.listTrash = $root.tilbo.ipc.v1.ListTrashResponse.fromObject(object.listTrash);
          }
          if (object.restoreTrash != null) {
            if (typeof object.restoreTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.restoreTrash: object expected");
            message.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashResponse.fromObject(object.restoreTrash);
          }
          if (object.emptyTrash != null) {
            if (typeof object.emptyTrash !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.emptyTrash: object expected");
            message.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashResponse.fromObject(object.emptyTrash);
          }
          if (object.listAppsForFile != null) {
            if (typeof object.listAppsForFile !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.listAppsForFile: object expected");
            message.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileResponse.fromObject(object.listAppsForFile);
          }
          if (object.openWithApp != null) {
            if (typeof object.openWithApp !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.openWithApp: object expected");
            message.openWithApp = $root.tilbo.ipc.v1.OpenWithAppResponse.fromObject(object.openWithApp);
          }
          if (object.getBrowserConfig != null) {
            if (typeof object.getBrowserConfig !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.getBrowserConfig: object expected");
            message.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigResponse.fromObject(object.getBrowserConfig);
          }
          if (object.getFileBadges != null) {
            if (typeof object.getFileBadges !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.getFileBadges: object expected");
            message.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesResponse.fromObject(object.getFileBadges);
          }
          if (object.getFileActions != null) {
            if (typeof object.getFileActions !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.getFileActions: object expected");
            message.getFileActions = $root.tilbo.ipc.v1.GetFileActionsResponse.fromObject(object.getFileActions);
          }
          if (object.runFileAction != null) {
            if (typeof object.runFileAction !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.runFileAction: object expected");
            message.runFileAction = $root.tilbo.ipc.v1.RunFileActionResponse.fromObject(object.runFileAction);
          }
          if (object.launchGui != null) {
            if (typeof object.launchGui !== "object")
              throw TypeError(".tilbo.ipc.v1.Response.launchGui: object expected");
            message.launchGui = $root.tilbo.ipc.v1.LaunchGUIResponse.fromObject(object.launchGui);
          }
          return message;
        };
        Response.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (message.error != null && message.hasOwnProperty("error")) {
            object.error = $root.tilbo.ipc.v1.ErrorResponse.toObject(message.error, options);
            if (options.oneofs)
              object.kind = "error";
          }
          if (message.search != null && message.hasOwnProperty("search")) {
            object.search = $root.tilbo.ipc.v1.SearchResponse.toObject(message.search, options);
            if (options.oneofs)
              object.kind = "search";
          }
          if (message.tag != null && message.hasOwnProperty("tag")) {
            object.tag = $root.tilbo.ipc.v1.TagResponse.toObject(message.tag, options);
            if (options.oneofs)
              object.kind = "tag";
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            object.metadata = $root.tilbo.ipc.v1.MetadataResponse.toObject(message.metadata, options);
            if (options.oneofs)
              object.kind = "metadata";
          }
          if (message.related != null && message.hasOwnProperty("related")) {
            object.related = $root.tilbo.ipc.v1.RelatedResponse.toObject(message.related, options);
            if (options.oneofs)
              object.kind = "related";
          }
          if (message.status != null && message.hasOwnProperty("status")) {
            object.status = $root.tilbo.ipc.v1.StatusResponse.toObject(message.status, options);
            if (options.oneofs)
              object.kind = "status";
          }
          if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
            object.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.toObject(message.reloadRules, options);
            if (options.oneofs)
              object.kind = "reloadRules";
          }
          if (message.listTags != null && message.hasOwnProperty("listTags")) {
            object.listTags = $root.tilbo.ipc.v1.ListTagsResponse.toObject(message.listTags, options);
            if (options.oneofs)
              object.kind = "listTags";
          }
          if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
            object.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.toObject(message.hydrateTags, options);
            if (options.oneofs)
              object.kind = "hydrateTags";
          }
          if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
            object.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.toObject(message.listDirectory, options);
            if (options.oneofs)
              object.kind = "listDirectory";
          }
          if (message.statFile != null && message.hasOwnProperty("statFile")) {
            object.statFile = $root.tilbo.ipc.v1.StatFileResponse.toObject(message.statFile, options);
            if (options.oneofs)
              object.kind = "statFile";
          }
          if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
            object.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.toObject(message.globSearch, options);
            if (options.oneofs)
              object.kind = "globSearch";
          }
          if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
            object.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.toObject(message.renameFile, options);
            if (options.oneofs)
              object.kind = "renameFile";
          }
          if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
            object.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.toObject(message.deleteFile, options);
            if (options.oneofs)
              object.kind = "deleteFile";
          }
          if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
            object.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.toObject(message.chmodFile, options);
            if (options.oneofs)
              object.kind = "chmodFile";
          }
          if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
            object.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.toObject(message.listPlaces, options);
            if (options.oneofs)
              object.kind = "listPlaces";
          }
          if (message.pinPlace != null && message.hasOwnProperty("pinPlace")) {
            object.pinPlace = $root.tilbo.ipc.v1.PinPlaceResponse.toObject(message.pinPlace, options);
            if (options.oneofs)
              object.kind = "pinPlace";
          }
          if (message.unpinPlace != null && message.hasOwnProperty("unpinPlace")) {
            object.unpinPlace = $root.tilbo.ipc.v1.UnpinPlaceResponse.toObject(message.unpinPlace, options);
            if (options.oneofs)
              object.kind = "unpinPlace";
          }
          if (message.trashFile != null && message.hasOwnProperty("trashFile")) {
            object.trashFile = $root.tilbo.ipc.v1.TrashFileResponse.toObject(message.trashFile, options);
            if (options.oneofs)
              object.kind = "trashFile";
          }
          if (message.listTrash != null && message.hasOwnProperty("listTrash")) {
            object.listTrash = $root.tilbo.ipc.v1.ListTrashResponse.toObject(message.listTrash, options);
            if (options.oneofs)
              object.kind = "listTrash";
          }
          if (message.restoreTrash != null && message.hasOwnProperty("restoreTrash")) {
            object.restoreTrash = $root.tilbo.ipc.v1.RestoreTrashResponse.toObject(message.restoreTrash, options);
            if (options.oneofs)
              object.kind = "restoreTrash";
          }
          if (message.emptyTrash != null && message.hasOwnProperty("emptyTrash")) {
            object.emptyTrash = $root.tilbo.ipc.v1.EmptyTrashResponse.toObject(message.emptyTrash, options);
            if (options.oneofs)
              object.kind = "emptyTrash";
          }
          if (message.listAppsForFile != null && message.hasOwnProperty("listAppsForFile")) {
            object.listAppsForFile = $root.tilbo.ipc.v1.ListAppsForFileResponse.toObject(message.listAppsForFile, options);
            if (options.oneofs)
              object.kind = "listAppsForFile";
          }
          if (message.openWithApp != null && message.hasOwnProperty("openWithApp")) {
            object.openWithApp = $root.tilbo.ipc.v1.OpenWithAppResponse.toObject(message.openWithApp, options);
            if (options.oneofs)
              object.kind = "openWithApp";
          }
          if (message.getBrowserConfig != null && message.hasOwnProperty("getBrowserConfig")) {
            object.getBrowserConfig = $root.tilbo.ipc.v1.GetBrowserConfigResponse.toObject(message.getBrowserConfig, options);
            if (options.oneofs)
              object.kind = "getBrowserConfig";
          }
          if (message.getFileBadges != null && message.hasOwnProperty("getFileBadges")) {
            object.getFileBadges = $root.tilbo.ipc.v1.GetFileBadgesResponse.toObject(message.getFileBadges, options);
            if (options.oneofs)
              object.kind = "getFileBadges";
          }
          if (message.getFileActions != null && message.hasOwnProperty("getFileActions")) {
            object.getFileActions = $root.tilbo.ipc.v1.GetFileActionsResponse.toObject(message.getFileActions, options);
            if (options.oneofs)
              object.kind = "getFileActions";
          }
          if (message.runFileAction != null && message.hasOwnProperty("runFileAction")) {
            object.runFileAction = $root.tilbo.ipc.v1.RunFileActionResponse.toObject(message.runFileAction, options);
            if (options.oneofs)
              object.kind = "runFileAction";
          }
          if (message.launchGui != null && message.hasOwnProperty("launchGui")) {
            object.launchGui = $root.tilbo.ipc.v1.LaunchGUIResponse.toObject(message.launchGui, options);
            if (options.oneofs)
              object.kind = "launchGui";
          }
          return object;
        };
        Response.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        Response.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.Response";
        };
        return Response;
      })();
      v1.Event = (function() {
        function Event(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        Event.prototype.fileTagged = null;
        Event.prototype.indexUpdated = null;
        Event.prototype.daemonStateChanged = null;
        Event.prototype.showWindow = null;
        let $oneOfFields;
        Object.defineProperty(Event.prototype, "kind", {
          get: $util.oneOfGetter($oneOfFields = ["fileTagged", "indexUpdated", "daemonStateChanged", "showWindow"]),
          set: $util.oneOfSetter($oneOfFields)
        });
        Event.create = function create(properties) {
          return new Event(properties);
        };
        Event.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.fileTagged != null && Object.hasOwnProperty.call(message, "fileTagged"))
            $root.tilbo.ipc.v1.FileTaggedEvent.encode(message.fileTagged, writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
          if (message.indexUpdated != null && Object.hasOwnProperty.call(message, "indexUpdated"))
            $root.tilbo.ipc.v1.IndexUpdatedEvent.encode(message.indexUpdated, writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
          if (message.daemonStateChanged != null && Object.hasOwnProperty.call(message, "daemonStateChanged"))
            $root.tilbo.ipc.v1.DaemonStateChangedEvent.encode(message.daemonStateChanged, writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).fork()).ldelim();
          if (message.showWindow != null && Object.hasOwnProperty.call(message, "showWindow"))
            $root.tilbo.ipc.v1.ShowWindowEvent.encode(message.showWindow, writer.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
          return writer;
        };
        Event.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        Event.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Event();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.decode(reader, reader.uint32());
                break;
              }
              case 2: {
                message.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.decode(reader, reader.uint32());
                break;
              }
              case 3: {
                message.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.decode(reader, reader.uint32());
                break;
              }
              case 4: {
                message.showWindow = $root.tilbo.ipc.v1.ShowWindowEvent.decode(reader, reader.uint32());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        Event.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        Event.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          let properties = {};
          if (message.fileTagged != null && message.hasOwnProperty("fileTagged")) {
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.FileTaggedEvent.verify(message.fileTagged);
              if (error)
                return "fileTagged." + error;
            }
          }
          if (message.indexUpdated != null && message.hasOwnProperty("indexUpdated")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.IndexUpdatedEvent.verify(message.indexUpdated);
              if (error)
                return "indexUpdated." + error;
            }
          }
          if (message.daemonStateChanged != null && message.hasOwnProperty("daemonStateChanged")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.DaemonStateChangedEvent.verify(message.daemonStateChanged);
              if (error)
                return "daemonStateChanged." + error;
            }
          }
          if (message.showWindow != null && message.hasOwnProperty("showWindow")) {
            if (properties.kind === 1)
              return "kind: multiple values";
            properties.kind = 1;
            {
              let error = $root.tilbo.ipc.v1.ShowWindowEvent.verify(message.showWindow);
              if (error)
                return "showWindow." + error;
            }
          }
          return null;
        };
        Event.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.Event)
            return object;
          let message = new $root.tilbo.ipc.v1.Event();
          if (object.fileTagged != null) {
            if (typeof object.fileTagged !== "object")
              throw TypeError(".tilbo.ipc.v1.Event.fileTagged: object expected");
            message.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.fromObject(object.fileTagged);
          }
          if (object.indexUpdated != null) {
            if (typeof object.indexUpdated !== "object")
              throw TypeError(".tilbo.ipc.v1.Event.indexUpdated: object expected");
            message.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.fromObject(object.indexUpdated);
          }
          if (object.daemonStateChanged != null) {
            if (typeof object.daemonStateChanged !== "object")
              throw TypeError(".tilbo.ipc.v1.Event.daemonStateChanged: object expected");
            message.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.fromObject(object.daemonStateChanged);
          }
          if (object.showWindow != null) {
            if (typeof object.showWindow !== "object")
              throw TypeError(".tilbo.ipc.v1.Event.showWindow: object expected");
            message.showWindow = $root.tilbo.ipc.v1.ShowWindowEvent.fromObject(object.showWindow);
          }
          return message;
        };
        Event.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (message.fileTagged != null && message.hasOwnProperty("fileTagged")) {
            object.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.toObject(message.fileTagged, options);
            if (options.oneofs)
              object.kind = "fileTagged";
          }
          if (message.indexUpdated != null && message.hasOwnProperty("indexUpdated")) {
            object.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.toObject(message.indexUpdated, options);
            if (options.oneofs)
              object.kind = "indexUpdated";
          }
          if (message.daemonStateChanged != null && message.hasOwnProperty("daemonStateChanged")) {
            object.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.toObject(message.daemonStateChanged, options);
            if (options.oneofs)
              object.kind = "daemonStateChanged";
          }
          if (message.showWindow != null && message.hasOwnProperty("showWindow")) {
            object.showWindow = $root.tilbo.ipc.v1.ShowWindowEvent.toObject(message.showWindow, options);
            if (options.oneofs)
              object.kind = "showWindow";
          }
          return object;
        };
        Event.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.Event";
        };
        return Event;
      })();
      v1.ErrorResponse = (function() {
        function ErrorResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ErrorResponse.prototype.code = 0;
        ErrorResponse.prototype.message = "";
        ErrorResponse.create = function create(properties) {
          return new ErrorResponse(properties);
        };
        ErrorResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.code != null && Object.hasOwnProperty.call(message, "code"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).uint32(message.code);
          if (message.message != null && Object.hasOwnProperty.call(message, "message"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.message);
          return writer;
        };
        ErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ErrorResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ErrorResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.code = reader.uint32();
                break;
              }
              case 2: {
                message.message = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ErrorResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ErrorResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.code != null && message.hasOwnProperty("code")) {
            if (!$util.isInteger(message.code))
              return "code: integer expected";
          }
          if (message.message != null && message.hasOwnProperty("message")) {
            if (!$util.isString(message.message))
              return "message: string expected";
          }
          return null;
        };
        ErrorResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ErrorResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ErrorResponse();
          if (object.code != null)
            message.code = object.code >>> 0;
          if (object.message != null)
            message.message = String(object.message);
          return message;
        };
        ErrorResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.code = 0;
            object.message = "";
          }
          if (message.code != null && message.hasOwnProperty("code"))
            object.code = message.code;
          if (message.message != null && message.hasOwnProperty("message"))
            object.message = message.message;
          return object;
        };
        ErrorResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ErrorResponse";
        };
        return ErrorResponse;
      })();
      v1.SearchRequest = (function() {
        function SearchRequest(properties) {
          this.tags = [];
          this.tagExclude = [];
          this.metaFilters = {};
          this.sortBy = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        SearchRequest.prototype.tags = $util.emptyArray;
        SearchRequest.prototype.tagsAny = false;
        SearchRequest.prototype.tagExclude = $util.emptyArray;
        SearchRequest.prototype.metaFilters = $util.emptyObject;
        SearchRequest.prototype.ftsQuery = "";
        SearchRequest.prototype.limit = 0;
        SearchRequest.prototype.offset = 0;
        SearchRequest.prototype.sortBy = $util.emptyArray;
        SearchRequest.prototype.vectorQuery = "";
        SearchRequest.create = function create(properties) {
          return new SearchRequest(properties);
        };
        SearchRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.tags != null && message.tags.length)
            for (let i = 0; i < message.tags.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.tags[i]);
          if (message.tagsAny != null && Object.hasOwnProperty.call(message, "tagsAny"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(message.tagsAny);
          if (message.tagExclude != null && message.tagExclude.length)
            for (let i = 0; i < message.tagExclude.length; ++i)
              writer.uint32(
                /* id 3, wireType 2 =*/
                26
              ).string(message.tagExclude[i]);
          if (message.metaFilters != null && Object.hasOwnProperty.call(message, "metaFilters"))
            for (let keys = Object.keys(message.metaFilters), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 4, wireType 2 =*/
                34
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.metaFilters[keys[i]]).ldelim();
          if (message.ftsQuery != null && Object.hasOwnProperty.call(message, "ftsQuery"))
            writer.uint32(
              /* id 5, wireType 2 =*/
              42
            ).string(message.ftsQuery);
          if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
            writer.uint32(
              /* id 6, wireType 0 =*/
              48
            ).uint32(message.limit);
          if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
            writer.uint32(
              /* id 7, wireType 0 =*/
              56
            ).uint32(message.offset);
          if (message.sortBy != null && message.sortBy.length)
            for (let i = 0; i < message.sortBy.length; ++i)
              writer.uint32(
                /* id 8, wireType 2 =*/
                66
              ).string(message.sortBy[i]);
          if (message.vectorQuery != null && Object.hasOwnProperty.call(message, "vectorQuery"))
            writer.uint32(
              /* id 9, wireType 2 =*/
              74
            ).string(message.vectorQuery);
          return writer;
        };
        SearchRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        SearchRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.SearchRequest(), key, value;
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.tags && message.tags.length))
                  message.tags = [];
                message.tags.push(reader.string());
                break;
              }
              case 2: {
                message.tagsAny = reader.bool();
                break;
              }
              case 3: {
                if (!(message.tagExclude && message.tagExclude.length))
                  message.tagExclude = [];
                message.tagExclude.push(reader.string());
                break;
              }
              case 4: {
                if (message.metaFilters === $util.emptyObject)
                  message.metaFilters = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.metaFilters[key] = value;
                break;
              }
              case 5: {
                message.ftsQuery = reader.string();
                break;
              }
              case 6: {
                message.limit = reader.uint32();
                break;
              }
              case 7: {
                message.offset = reader.uint32();
                break;
              }
              case 8: {
                if (!(message.sortBy && message.sortBy.length))
                  message.sortBy = [];
                message.sortBy.push(reader.string());
                break;
              }
              case 9: {
                message.vectorQuery = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        SearchRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        SearchRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.tags != null && message.hasOwnProperty("tags")) {
            if (!Array.isArray(message.tags))
              return "tags: array expected";
            for (let i = 0; i < message.tags.length; ++i)
              if (!$util.isString(message.tags[i]))
                return "tags: string[] expected";
          }
          if (message.tagsAny != null && message.hasOwnProperty("tagsAny")) {
            if (typeof message.tagsAny !== "boolean")
              return "tagsAny: boolean expected";
          }
          if (message.tagExclude != null && message.hasOwnProperty("tagExclude")) {
            if (!Array.isArray(message.tagExclude))
              return "tagExclude: array expected";
            for (let i = 0; i < message.tagExclude.length; ++i)
              if (!$util.isString(message.tagExclude[i]))
                return "tagExclude: string[] expected";
          }
          if (message.metaFilters != null && message.hasOwnProperty("metaFilters")) {
            if (!$util.isObject(message.metaFilters))
              return "metaFilters: object expected";
            let key = Object.keys(message.metaFilters);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.metaFilters[key[i]]))
                return "metaFilters: string{k:string} expected";
          }
          if (message.ftsQuery != null && message.hasOwnProperty("ftsQuery")) {
            if (!$util.isString(message.ftsQuery))
              return "ftsQuery: string expected";
          }
          if (message.limit != null && message.hasOwnProperty("limit")) {
            if (!$util.isInteger(message.limit))
              return "limit: integer expected";
          }
          if (message.offset != null && message.hasOwnProperty("offset")) {
            if (!$util.isInteger(message.offset))
              return "offset: integer expected";
          }
          if (message.sortBy != null && message.hasOwnProperty("sortBy")) {
            if (!Array.isArray(message.sortBy))
              return "sortBy: array expected";
            for (let i = 0; i < message.sortBy.length; ++i)
              if (!$util.isString(message.sortBy[i]))
                return "sortBy: string[] expected";
          }
          if (message.vectorQuery != null && message.hasOwnProperty("vectorQuery")) {
            if (!$util.isString(message.vectorQuery))
              return "vectorQuery: string expected";
          }
          return null;
        };
        SearchRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.SearchRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.SearchRequest();
          if (object.tags) {
            if (!Array.isArray(object.tags))
              throw TypeError(".tilbo.ipc.v1.SearchRequest.tags: array expected");
            message.tags = [];
            for (let i = 0; i < object.tags.length; ++i)
              message.tags[i] = String(object.tags[i]);
          }
          if (object.tagsAny != null)
            message.tagsAny = Boolean(object.tagsAny);
          if (object.tagExclude) {
            if (!Array.isArray(object.tagExclude))
              throw TypeError(".tilbo.ipc.v1.SearchRequest.tagExclude: array expected");
            message.tagExclude = [];
            for (let i = 0; i < object.tagExclude.length; ++i)
              message.tagExclude[i] = String(object.tagExclude[i]);
          }
          if (object.metaFilters) {
            if (typeof object.metaFilters !== "object")
              throw TypeError(".tilbo.ipc.v1.SearchRequest.metaFilters: object expected");
            message.metaFilters = {};
            for (let keys = Object.keys(object.metaFilters), i = 0; i < keys.length; ++i)
              message.metaFilters[keys[i]] = String(object.metaFilters[keys[i]]);
          }
          if (object.ftsQuery != null)
            message.ftsQuery = String(object.ftsQuery);
          if (object.limit != null)
            message.limit = object.limit >>> 0;
          if (object.offset != null)
            message.offset = object.offset >>> 0;
          if (object.sortBy) {
            if (!Array.isArray(object.sortBy))
              throw TypeError(".tilbo.ipc.v1.SearchRequest.sortBy: array expected");
            message.sortBy = [];
            for (let i = 0; i < object.sortBy.length; ++i)
              message.sortBy[i] = String(object.sortBy[i]);
          }
          if (object.vectorQuery != null)
            message.vectorQuery = String(object.vectorQuery);
          return message;
        };
        SearchRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults) {
            object.tags = [];
            object.tagExclude = [];
            object.sortBy = [];
          }
          if (options.objects || options.defaults)
            object.metaFilters = {};
          if (options.defaults) {
            object.tagsAny = false;
            object.ftsQuery = "";
            object.limit = 0;
            object.offset = 0;
            object.vectorQuery = "";
          }
          if (message.tags && message.tags.length) {
            object.tags = [];
            for (let j = 0; j < message.tags.length; ++j)
              object.tags[j] = message.tags[j];
          }
          if (message.tagsAny != null && message.hasOwnProperty("tagsAny"))
            object.tagsAny = message.tagsAny;
          if (message.tagExclude && message.tagExclude.length) {
            object.tagExclude = [];
            for (let j = 0; j < message.tagExclude.length; ++j)
              object.tagExclude[j] = message.tagExclude[j];
          }
          let keys2;
          if (message.metaFilters && (keys2 = Object.keys(message.metaFilters)).length) {
            object.metaFilters = {};
            for (let j = 0; j < keys2.length; ++j)
              object.metaFilters[keys2[j]] = message.metaFilters[keys2[j]];
          }
          if (message.ftsQuery != null && message.hasOwnProperty("ftsQuery"))
            object.ftsQuery = message.ftsQuery;
          if (message.limit != null && message.hasOwnProperty("limit"))
            object.limit = message.limit;
          if (message.offset != null && message.hasOwnProperty("offset"))
            object.offset = message.offset;
          if (message.sortBy && message.sortBy.length) {
            object.sortBy = [];
            for (let j = 0; j < message.sortBy.length; ++j)
              object.sortBy[j] = message.sortBy[j];
          }
          if (message.vectorQuery != null && message.hasOwnProperty("vectorQuery"))
            object.vectorQuery = message.vectorQuery;
          return object;
        };
        SearchRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        SearchRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.SearchRequest";
        };
        return SearchRequest;
      })();
      v1.FileResult = (function() {
        function FileResult(properties) {
          this.tags = [];
          this.metadata = {};
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        FileResult.prototype.path = "";
        FileResult.prototype.tags = $util.emptyArray;
        FileResult.prototype.metadata = $util.emptyObject;
        FileResult.prototype.score = 0;
        FileResult.prototype.mtime = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        FileResult.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        FileResult.create = function create(properties) {
          return new FileResult(properties);
        };
        FileResult.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.tags != null && message.tags.length)
            for (let i = 0; i < message.tags.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.tags[i]);
          if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
            for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 3, wireType 2 =*/
                26
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.metadata[keys[i]]).ldelim();
          if (message.score != null && Object.hasOwnProperty.call(message, "score"))
            writer.uint32(
              /* id 4, wireType 1 =*/
              33
            ).double(message.score);
          if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
            writer.uint32(
              /* id 5, wireType 0 =*/
              40
            ).int64(message.mtime);
          if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
            writer.uint32(
              /* id 6, wireType 0 =*/
              48
            ).int64(message.sizeBytes);
          return writer;
        };
        FileResult.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        FileResult.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileResult(), key, value;
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                if (!(message.tags && message.tags.length))
                  message.tags = [];
                message.tags.push(reader.string());
                break;
              }
              case 3: {
                if (message.metadata === $util.emptyObject)
                  message.metadata = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.metadata[key] = value;
                break;
              }
              case 4: {
                message.score = reader.double();
                break;
              }
              case 5: {
                message.mtime = reader.int64();
                break;
              }
              case 6: {
                message.sizeBytes = reader.int64();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        FileResult.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        FileResult.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.tags != null && message.hasOwnProperty("tags")) {
            if (!Array.isArray(message.tags))
              return "tags: array expected";
            for (let i = 0; i < message.tags.length; ++i)
              if (!$util.isString(message.tags[i]))
                return "tags: string[] expected";
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            if (!$util.isObject(message.metadata))
              return "metadata: object expected";
            let key = Object.keys(message.metadata);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.metadata[key[i]]))
                return "metadata: string{k:string} expected";
          }
          if (message.score != null && message.hasOwnProperty("score")) {
            if (typeof message.score !== "number")
              return "score: number expected";
          }
          if (message.mtime != null && message.hasOwnProperty("mtime")) {
            if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
              return "mtime: integer|Long expected";
          }
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes")) {
            if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
              return "sizeBytes: integer|Long expected";
          }
          return null;
        };
        FileResult.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.FileResult)
            return object;
          let message = new $root.tilbo.ipc.v1.FileResult();
          if (object.path != null)
            message.path = String(object.path);
          if (object.tags) {
            if (!Array.isArray(object.tags))
              throw TypeError(".tilbo.ipc.v1.FileResult.tags: array expected");
            message.tags = [];
            for (let i = 0; i < object.tags.length; ++i)
              message.tags[i] = String(object.tags[i]);
          }
          if (object.metadata) {
            if (typeof object.metadata !== "object")
              throw TypeError(".tilbo.ipc.v1.FileResult.metadata: object expected");
            message.metadata = {};
            for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
              message.metadata[keys[i]] = String(object.metadata[keys[i]]);
          }
          if (object.score != null)
            message.score = Number(object.score);
          if (object.mtime != null) {
            if ($util.Long)
              (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
            else if (typeof object.mtime === "string")
              message.mtime = parseInt(object.mtime, 10);
            else if (typeof object.mtime === "number")
              message.mtime = object.mtime;
            else if (typeof object.mtime === "object")
              message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
          }
          if (object.sizeBytes != null) {
            if ($util.Long)
              (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
            else if (typeof object.sizeBytes === "string")
              message.sizeBytes = parseInt(object.sizeBytes, 10);
            else if (typeof object.sizeBytes === "number")
              message.sizeBytes = object.sizeBytes;
            else if (typeof object.sizeBytes === "object")
              message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
          }
          return message;
        };
        FileResult.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.tags = [];
          if (options.objects || options.defaults)
            object.metadata = {};
          if (options.defaults) {
            object.path = "";
            object.score = 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.mtime = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.sizeBytes = options.longs === String ? "0" : 0;
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.tags && message.tags.length) {
            object.tags = [];
            for (let j = 0; j < message.tags.length; ++j)
              object.tags[j] = message.tags[j];
          }
          let keys2;
          if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
            object.metadata = {};
            for (let j = 0; j < keys2.length; ++j)
              object.metadata[keys2[j]] = message.metadata[keys2[j]];
          }
          if (message.score != null && message.hasOwnProperty("score"))
            object.score = options.json && !isFinite(message.score) ? String(message.score) : message.score;
          if (message.mtime != null && message.hasOwnProperty("mtime"))
            if (typeof message.mtime === "number")
              object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
            else
              object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
            if (typeof message.sizeBytes === "number")
              object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
            else
              object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
          return object;
        };
        FileResult.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        FileResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.FileResult";
        };
        return FileResult;
      })();
      v1.SearchResponse = (function() {
        function SearchResponse(properties) {
          this.files = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        SearchResponse.prototype.files = $util.emptyArray;
        SearchResponse.prototype.total = 0;
        SearchResponse.create = function create(properties) {
          return new SearchResponse(properties);
        };
        SearchResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.files != null && message.files.length)
            for (let i = 0; i < message.files.length; ++i)
              $root.tilbo.ipc.v1.FileResult.encode(message.files[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          if (message.total != null && Object.hasOwnProperty.call(message, "total"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint32(message.total);
          return writer;
        };
        SearchResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        SearchResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.SearchResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.files && message.files.length))
                  message.files = [];
                message.files.push($root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32()));
                break;
              }
              case 2: {
                message.total = reader.uint32();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        SearchResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        SearchResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.files != null && message.hasOwnProperty("files")) {
            if (!Array.isArray(message.files))
              return "files: array expected";
            for (let i = 0; i < message.files.length; ++i) {
              let error = $root.tilbo.ipc.v1.FileResult.verify(message.files[i]);
              if (error)
                return "files." + error;
            }
          }
          if (message.total != null && message.hasOwnProperty("total")) {
            if (!$util.isInteger(message.total))
              return "total: integer expected";
          }
          return null;
        };
        SearchResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.SearchResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.SearchResponse();
          if (object.files) {
            if (!Array.isArray(object.files))
              throw TypeError(".tilbo.ipc.v1.SearchResponse.files: array expected");
            message.files = [];
            for (let i = 0; i < object.files.length; ++i) {
              if (typeof object.files[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.SearchResponse.files: object expected");
              message.files[i] = $root.tilbo.ipc.v1.FileResult.fromObject(object.files[i]);
            }
          }
          if (object.total != null)
            message.total = object.total >>> 0;
          return message;
        };
        SearchResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.files = [];
          if (options.defaults)
            object.total = 0;
          if (message.files && message.files.length) {
            object.files = [];
            for (let j = 0; j < message.files.length; ++j)
              object.files[j] = $root.tilbo.ipc.v1.FileResult.toObject(message.files[j], options);
          }
          if (message.total != null && message.hasOwnProperty("total"))
            object.total = message.total;
          return object;
        };
        SearchResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        SearchResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.SearchResponse";
        };
        return SearchResponse;
      })();
      v1.TagOperation = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "TAG_OPERATION_UNSPECIFIED"] = 0;
        values[valuesById[1] = "TAG_OPERATION_ADD"] = 1;
        values[valuesById[2] = "TAG_OPERATION_REMOVE"] = 2;
        values[valuesById[3] = "TAG_OPERATION_SET"] = 3;
        return values;
      })();
      v1.TagRequest = (function() {
        function TagRequest(properties) {
          this.paths = [];
          this.tags = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        TagRequest.prototype.paths = $util.emptyArray;
        TagRequest.prototype.tags = $util.emptyArray;
        TagRequest.prototype.operation = 0;
        TagRequest.create = function create(properties) {
          return new TagRequest(properties);
        };
        TagRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.paths != null && message.paths.length)
            for (let i = 0; i < message.paths.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.paths[i]);
          if (message.tags != null && message.tags.length)
            for (let i = 0; i < message.tags.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.tags[i]);
          if (message.operation != null && Object.hasOwnProperty.call(message, "operation"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).int32(message.operation);
          return writer;
        };
        TagRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        TagRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TagRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.paths && message.paths.length))
                  message.paths = [];
                message.paths.push(reader.string());
                break;
              }
              case 2: {
                if (!(message.tags && message.tags.length))
                  message.tags = [];
                message.tags.push(reader.string());
                break;
              }
              case 3: {
                message.operation = reader.int32();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        TagRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        TagRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.paths != null && message.hasOwnProperty("paths")) {
            if (!Array.isArray(message.paths))
              return "paths: array expected";
            for (let i = 0; i < message.paths.length; ++i)
              if (!$util.isString(message.paths[i]))
                return "paths: string[] expected";
          }
          if (message.tags != null && message.hasOwnProperty("tags")) {
            if (!Array.isArray(message.tags))
              return "tags: array expected";
            for (let i = 0; i < message.tags.length; ++i)
              if (!$util.isString(message.tags[i]))
                return "tags: string[] expected";
          }
          if (message.operation != null && message.hasOwnProperty("operation"))
            switch (message.operation) {
              default:
                return "operation: enum value expected";
              case 0:
              case 1:
              case 2:
              case 3:
                break;
            }
          return null;
        };
        TagRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.TagRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.TagRequest();
          if (object.paths) {
            if (!Array.isArray(object.paths))
              throw TypeError(".tilbo.ipc.v1.TagRequest.paths: array expected");
            message.paths = [];
            for (let i = 0; i < object.paths.length; ++i)
              message.paths[i] = String(object.paths[i]);
          }
          if (object.tags) {
            if (!Array.isArray(object.tags))
              throw TypeError(".tilbo.ipc.v1.TagRequest.tags: array expected");
            message.tags = [];
            for (let i = 0; i < object.tags.length; ++i)
              message.tags[i] = String(object.tags[i]);
          }
          switch (object.operation) {
            default:
              if (typeof object.operation === "number") {
                message.operation = object.operation;
                break;
              }
              break;
            case "TAG_OPERATION_UNSPECIFIED":
            case 0:
              message.operation = 0;
              break;
            case "TAG_OPERATION_ADD":
            case 1:
              message.operation = 1;
              break;
            case "TAG_OPERATION_REMOVE":
            case 2:
              message.operation = 2;
              break;
            case "TAG_OPERATION_SET":
            case 3:
              message.operation = 3;
              break;
          }
          return message;
        };
        TagRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults) {
            object.paths = [];
            object.tags = [];
          }
          if (options.defaults)
            object.operation = options.enums === String ? "TAG_OPERATION_UNSPECIFIED" : 0;
          if (message.paths && message.paths.length) {
            object.paths = [];
            for (let j = 0; j < message.paths.length; ++j)
              object.paths[j] = message.paths[j];
          }
          if (message.tags && message.tags.length) {
            object.tags = [];
            for (let j = 0; j < message.tags.length; ++j)
              object.tags[j] = message.tags[j];
          }
          if (message.operation != null && message.hasOwnProperty("operation"))
            object.operation = options.enums === String ? $root.tilbo.ipc.v1.TagOperation[message.operation] === void 0 ? message.operation : $root.tilbo.ipc.v1.TagOperation[message.operation] : message.operation;
          return object;
        };
        TagRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        TagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.TagRequest";
        };
        return TagRequest;
      })();
      v1.TagResponse = (function() {
        function TagResponse(properties) {
          this.pathsOk = [];
          this.pathsError = [];
          this.errors = {};
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        TagResponse.prototype.pathsOk = $util.emptyArray;
        TagResponse.prototype.pathsError = $util.emptyArray;
        TagResponse.prototype.errors = $util.emptyObject;
        TagResponse.create = function create(properties) {
          return new TagResponse(properties);
        };
        TagResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.pathsOk != null && message.pathsOk.length)
            for (let i = 0; i < message.pathsOk.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.pathsOk[i]);
          if (message.pathsError != null && message.pathsError.length)
            for (let i = 0; i < message.pathsError.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.pathsError[i]);
          if (message.errors != null && Object.hasOwnProperty.call(message, "errors"))
            for (let keys = Object.keys(message.errors), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 3, wireType 2 =*/
                26
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.errors[keys[i]]).ldelim();
          return writer;
        };
        TagResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        TagResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TagResponse(), key, value;
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.pathsOk && message.pathsOk.length))
                  message.pathsOk = [];
                message.pathsOk.push(reader.string());
                break;
              }
              case 2: {
                if (!(message.pathsError && message.pathsError.length))
                  message.pathsError = [];
                message.pathsError.push(reader.string());
                break;
              }
              case 3: {
                if (message.errors === $util.emptyObject)
                  message.errors = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.errors[key] = value;
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        TagResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        TagResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.pathsOk != null && message.hasOwnProperty("pathsOk")) {
            if (!Array.isArray(message.pathsOk))
              return "pathsOk: array expected";
            for (let i = 0; i < message.pathsOk.length; ++i)
              if (!$util.isString(message.pathsOk[i]))
                return "pathsOk: string[] expected";
          }
          if (message.pathsError != null && message.hasOwnProperty("pathsError")) {
            if (!Array.isArray(message.pathsError))
              return "pathsError: array expected";
            for (let i = 0; i < message.pathsError.length; ++i)
              if (!$util.isString(message.pathsError[i]))
                return "pathsError: string[] expected";
          }
          if (message.errors != null && message.hasOwnProperty("errors")) {
            if (!$util.isObject(message.errors))
              return "errors: object expected";
            let key = Object.keys(message.errors);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.errors[key[i]]))
                return "errors: string{k:string} expected";
          }
          return null;
        };
        TagResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.TagResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.TagResponse();
          if (object.pathsOk) {
            if (!Array.isArray(object.pathsOk))
              throw TypeError(".tilbo.ipc.v1.TagResponse.pathsOk: array expected");
            message.pathsOk = [];
            for (let i = 0; i < object.pathsOk.length; ++i)
              message.pathsOk[i] = String(object.pathsOk[i]);
          }
          if (object.pathsError) {
            if (!Array.isArray(object.pathsError))
              throw TypeError(".tilbo.ipc.v1.TagResponse.pathsError: array expected");
            message.pathsError = [];
            for (let i = 0; i < object.pathsError.length; ++i)
              message.pathsError[i] = String(object.pathsError[i]);
          }
          if (object.errors) {
            if (typeof object.errors !== "object")
              throw TypeError(".tilbo.ipc.v1.TagResponse.errors: object expected");
            message.errors = {};
            for (let keys = Object.keys(object.errors), i = 0; i < keys.length; ++i)
              message.errors[keys[i]] = String(object.errors[keys[i]]);
          }
          return message;
        };
        TagResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults) {
            object.pathsOk = [];
            object.pathsError = [];
          }
          if (options.objects || options.defaults)
            object.errors = {};
          if (message.pathsOk && message.pathsOk.length) {
            object.pathsOk = [];
            for (let j = 0; j < message.pathsOk.length; ++j)
              object.pathsOk[j] = message.pathsOk[j];
          }
          if (message.pathsError && message.pathsError.length) {
            object.pathsError = [];
            for (let j = 0; j < message.pathsError.length; ++j)
              object.pathsError[j] = message.pathsError[j];
          }
          let keys2;
          if (message.errors && (keys2 = Object.keys(message.errors)).length) {
            object.errors = {};
            for (let j = 0; j < keys2.length; ++j)
              object.errors[keys2[j]] = message.errors[keys2[j]];
          }
          return object;
        };
        TagResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        TagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.TagResponse";
        };
        return TagResponse;
      })();
      v1.MetadataRequest = (function() {
        function MetadataRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        MetadataRequest.prototype.path = "";
        MetadataRequest.create = function create(properties) {
          return new MetadataRequest(properties);
        };
        MetadataRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        MetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        MetadataRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        MetadataRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        MetadataRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        MetadataRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.MetadataRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.MetadataRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        MetadataRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        MetadataRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        MetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.MetadataRequest";
        };
        return MetadataRequest;
      })();
      v1.MetadataResponse = (function() {
        function MetadataResponse(properties) {
          this.metadata = {};
          this.sources = {};
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        MetadataResponse.prototype.path = "";
        MetadataResponse.prototype.metadata = $util.emptyObject;
        MetadataResponse.prototype.sources = $util.emptyObject;
        MetadataResponse.create = function create(properties) {
          return new MetadataResponse(properties);
        };
        MetadataResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
            for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.metadata[keys[i]]).ldelim();
          if (message.sources != null && Object.hasOwnProperty.call(message, "sources"))
            for (let keys = Object.keys(message.sources), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 3, wireType 2 =*/
                26
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.sources[keys[i]]).ldelim();
          return writer;
        };
        MetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        MetadataResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataResponse(), key, value;
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                if (message.metadata === $util.emptyObject)
                  message.metadata = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.metadata[key] = value;
                break;
              }
              case 3: {
                if (message.sources === $util.emptyObject)
                  message.sources = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.sources[key] = value;
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        MetadataResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        MetadataResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.metadata != null && message.hasOwnProperty("metadata")) {
            if (!$util.isObject(message.metadata))
              return "metadata: object expected";
            let key = Object.keys(message.metadata);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.metadata[key[i]]))
                return "metadata: string{k:string} expected";
          }
          if (message.sources != null && message.hasOwnProperty("sources")) {
            if (!$util.isObject(message.sources))
              return "sources: object expected";
            let key = Object.keys(message.sources);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.sources[key[i]]))
                return "sources: string{k:string} expected";
          }
          return null;
        };
        MetadataResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.MetadataResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.MetadataResponse();
          if (object.path != null)
            message.path = String(object.path);
          if (object.metadata) {
            if (typeof object.metadata !== "object")
              throw TypeError(".tilbo.ipc.v1.MetadataResponse.metadata: object expected");
            message.metadata = {};
            for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
              message.metadata[keys[i]] = String(object.metadata[keys[i]]);
          }
          if (object.sources) {
            if (typeof object.sources !== "object")
              throw TypeError(".tilbo.ipc.v1.MetadataResponse.sources: object expected");
            message.sources = {};
            for (let keys = Object.keys(object.sources), i = 0; i < keys.length; ++i)
              message.sources[keys[i]] = String(object.sources[keys[i]]);
          }
          return message;
        };
        MetadataResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.objects || options.defaults) {
            object.metadata = {};
            object.sources = {};
          }
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          let keys2;
          if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
            object.metadata = {};
            for (let j = 0; j < keys2.length; ++j)
              object.metadata[keys2[j]] = message.metadata[keys2[j]];
          }
          if (message.sources && (keys2 = Object.keys(message.sources)).length) {
            object.sources = {};
            for (let j = 0; j < keys2.length; ++j)
              object.sources[keys2[j]] = message.sources[keys2[j]];
          }
          return object;
        };
        MetadataResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        MetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.MetadataResponse";
        };
        return MetadataResponse;
      })();
      v1.MetadataSetRequest = (function() {
        function MetadataSetRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        MetadataSetRequest.prototype.path = "";
        MetadataSetRequest.prototype.key = "";
        MetadataSetRequest.prototype.value = "";
        MetadataSetRequest.create = function create(properties) {
          return new MetadataSetRequest(properties);
        };
        MetadataSetRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.key != null && Object.hasOwnProperty.call(message, "key"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.key);
          if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(message.value);
          return writer;
        };
        MetadataSetRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        MetadataSetRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataSetRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.key = reader.string();
                break;
              }
              case 3: {
                message.value = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        MetadataSetRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        MetadataSetRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.key != null && message.hasOwnProperty("key")) {
            if (!$util.isString(message.key))
              return "key: string expected";
          }
          if (message.value != null && message.hasOwnProperty("value")) {
            if (!$util.isString(message.value))
              return "value: string expected";
          }
          return null;
        };
        MetadataSetRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.MetadataSetRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.MetadataSetRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.key != null)
            message.key = String(object.key);
          if (object.value != null)
            message.value = String(object.value);
          return message;
        };
        MetadataSetRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.key = "";
            object.value = "";
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.key != null && message.hasOwnProperty("key"))
            object.key = message.key;
          if (message.value != null && message.hasOwnProperty("value"))
            object.value = message.value;
          return object;
        };
        MetadataSetRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        MetadataSetRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.MetadataSetRequest";
        };
        return MetadataSetRequest;
      })();
      v1.RelatedRequest = (function() {
        function RelatedRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RelatedRequest.prototype.seedPath = "";
        RelatedRequest.prototype.limit = 0;
        RelatedRequest.prototype.maxHops = 0;
        RelatedRequest.prototype.hopWeight = 0;
        RelatedRequest.prototype.vecWeight = 0;
        RelatedRequest.create = function create(properties) {
          return new RelatedRequest(properties);
        };
        RelatedRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.seedPath != null && Object.hasOwnProperty.call(message, "seedPath"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.seedPath);
          if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint32(message.limit);
          if (message.maxHops != null && Object.hasOwnProperty.call(message, "maxHops"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).uint32(message.maxHops);
          if (message.hopWeight != null && Object.hasOwnProperty.call(message, "hopWeight"))
            writer.uint32(
              /* id 4, wireType 5 =*/
              37
            ).float(message.hopWeight);
          if (message.vecWeight != null && Object.hasOwnProperty.call(message, "vecWeight"))
            writer.uint32(
              /* id 5, wireType 5 =*/
              45
            ).float(message.vecWeight);
          return writer;
        };
        RelatedRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RelatedRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RelatedRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.seedPath = reader.string();
                break;
              }
              case 2: {
                message.limit = reader.uint32();
                break;
              }
              case 3: {
                message.maxHops = reader.uint32();
                break;
              }
              case 4: {
                message.hopWeight = reader.float();
                break;
              }
              case 5: {
                message.vecWeight = reader.float();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RelatedRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RelatedRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.seedPath != null && message.hasOwnProperty("seedPath")) {
            if (!$util.isString(message.seedPath))
              return "seedPath: string expected";
          }
          if (message.limit != null && message.hasOwnProperty("limit")) {
            if (!$util.isInteger(message.limit))
              return "limit: integer expected";
          }
          if (message.maxHops != null && message.hasOwnProperty("maxHops")) {
            if (!$util.isInteger(message.maxHops))
              return "maxHops: integer expected";
          }
          if (message.hopWeight != null && message.hasOwnProperty("hopWeight")) {
            if (typeof message.hopWeight !== "number")
              return "hopWeight: number expected";
          }
          if (message.vecWeight != null && message.hasOwnProperty("vecWeight")) {
            if (typeof message.vecWeight !== "number")
              return "vecWeight: number expected";
          }
          return null;
        };
        RelatedRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RelatedRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.RelatedRequest();
          if (object.seedPath != null)
            message.seedPath = String(object.seedPath);
          if (object.limit != null)
            message.limit = object.limit >>> 0;
          if (object.maxHops != null)
            message.maxHops = object.maxHops >>> 0;
          if (object.hopWeight != null)
            message.hopWeight = Number(object.hopWeight);
          if (object.vecWeight != null)
            message.vecWeight = Number(object.vecWeight);
          return message;
        };
        RelatedRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.seedPath = "";
            object.limit = 0;
            object.maxHops = 0;
            object.hopWeight = 0;
            object.vecWeight = 0;
          }
          if (message.seedPath != null && message.hasOwnProperty("seedPath"))
            object.seedPath = message.seedPath;
          if (message.limit != null && message.hasOwnProperty("limit"))
            object.limit = message.limit;
          if (message.maxHops != null && message.hasOwnProperty("maxHops"))
            object.maxHops = message.maxHops;
          if (message.hopWeight != null && message.hasOwnProperty("hopWeight"))
            object.hopWeight = options.json && !isFinite(message.hopWeight) ? String(message.hopWeight) : message.hopWeight;
          if (message.vecWeight != null && message.hasOwnProperty("vecWeight"))
            object.vecWeight = options.json && !isFinite(message.vecWeight) ? String(message.vecWeight) : message.vecWeight;
          return object;
        };
        RelatedRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RelatedRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RelatedRequest";
        };
        return RelatedRequest;
      })();
      v1.ScoredFile = (function() {
        function ScoredFile(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ScoredFile.prototype.file = null;
        ScoredFile.prototype.score = 0;
        ScoredFile.prototype.hopDistance = 0;
        ScoredFile.prototype.cosineSim = 0;
        ScoredFile.create = function create(properties) {
          return new ScoredFile(properties);
        };
        ScoredFile.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.file != null && Object.hasOwnProperty.call(message, "file"))
            $root.tilbo.ipc.v1.FileResult.encode(message.file, writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
          if (message.score != null && Object.hasOwnProperty.call(message, "score"))
            writer.uint32(
              /* id 2, wireType 1 =*/
              17
            ).double(message.score);
          if (message.hopDistance != null && Object.hasOwnProperty.call(message, "hopDistance"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).uint32(message.hopDistance);
          if (message.cosineSim != null && Object.hasOwnProperty.call(message, "cosineSim"))
            writer.uint32(
              /* id 4, wireType 1 =*/
              33
            ).double(message.cosineSim);
          return writer;
        };
        ScoredFile.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ScoredFile.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ScoredFile();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.file = $root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32());
                break;
              }
              case 2: {
                message.score = reader.double();
                break;
              }
              case 3: {
                message.hopDistance = reader.uint32();
                break;
              }
              case 4: {
                message.cosineSim = reader.double();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ScoredFile.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ScoredFile.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.file != null && message.hasOwnProperty("file")) {
            let error = $root.tilbo.ipc.v1.FileResult.verify(message.file);
            if (error)
              return "file." + error;
          }
          if (message.score != null && message.hasOwnProperty("score")) {
            if (typeof message.score !== "number")
              return "score: number expected";
          }
          if (message.hopDistance != null && message.hasOwnProperty("hopDistance")) {
            if (!$util.isInteger(message.hopDistance))
              return "hopDistance: integer expected";
          }
          if (message.cosineSim != null && message.hasOwnProperty("cosineSim")) {
            if (typeof message.cosineSim !== "number")
              return "cosineSim: number expected";
          }
          return null;
        };
        ScoredFile.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ScoredFile)
            return object;
          let message = new $root.tilbo.ipc.v1.ScoredFile();
          if (object.file != null) {
            if (typeof object.file !== "object")
              throw TypeError(".tilbo.ipc.v1.ScoredFile.file: object expected");
            message.file = $root.tilbo.ipc.v1.FileResult.fromObject(object.file);
          }
          if (object.score != null)
            message.score = Number(object.score);
          if (object.hopDistance != null)
            message.hopDistance = object.hopDistance >>> 0;
          if (object.cosineSim != null)
            message.cosineSim = Number(object.cosineSim);
          return message;
        };
        ScoredFile.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.file = null;
            object.score = 0;
            object.hopDistance = 0;
            object.cosineSim = 0;
          }
          if (message.file != null && message.hasOwnProperty("file"))
            object.file = $root.tilbo.ipc.v1.FileResult.toObject(message.file, options);
          if (message.score != null && message.hasOwnProperty("score"))
            object.score = options.json && !isFinite(message.score) ? String(message.score) : message.score;
          if (message.hopDistance != null && message.hasOwnProperty("hopDistance"))
            object.hopDistance = message.hopDistance;
          if (message.cosineSim != null && message.hasOwnProperty("cosineSim"))
            object.cosineSim = options.json && !isFinite(message.cosineSim) ? String(message.cosineSim) : message.cosineSim;
          return object;
        };
        ScoredFile.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ScoredFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ScoredFile";
        };
        return ScoredFile;
      })();
      v1.RelatedResponse = (function() {
        function RelatedResponse(properties) {
          this.files = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RelatedResponse.prototype.files = $util.emptyArray;
        RelatedResponse.create = function create(properties) {
          return new RelatedResponse(properties);
        };
        RelatedResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.files != null && message.files.length)
            for (let i = 0; i < message.files.length; ++i)
              $root.tilbo.ipc.v1.ScoredFile.encode(message.files[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        RelatedResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RelatedResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RelatedResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.files && message.files.length))
                  message.files = [];
                message.files.push($root.tilbo.ipc.v1.ScoredFile.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RelatedResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RelatedResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.files != null && message.hasOwnProperty("files")) {
            if (!Array.isArray(message.files))
              return "files: array expected";
            for (let i = 0; i < message.files.length; ++i) {
              let error = $root.tilbo.ipc.v1.ScoredFile.verify(message.files[i]);
              if (error)
                return "files." + error;
            }
          }
          return null;
        };
        RelatedResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RelatedResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.RelatedResponse();
          if (object.files) {
            if (!Array.isArray(object.files))
              throw TypeError(".tilbo.ipc.v1.RelatedResponse.files: array expected");
            message.files = [];
            for (let i = 0; i < object.files.length; ++i) {
              if (typeof object.files[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.RelatedResponse.files: object expected");
              message.files[i] = $root.tilbo.ipc.v1.ScoredFile.fromObject(object.files[i]);
            }
          }
          return message;
        };
        RelatedResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.files = [];
          if (message.files && message.files.length) {
            object.files = [];
            for (let j = 0; j < message.files.length; ++j)
              object.files[j] = $root.tilbo.ipc.v1.ScoredFile.toObject(message.files[j], options);
          }
          return object;
        };
        RelatedResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RelatedResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RelatedResponse";
        };
        return RelatedResponse;
      })();
      v1.DaemonState = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "DAEMON_STATE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "DAEMON_STATE_IDLE"] = 1;
        values[valuesById[2] = "DAEMON_STATE_SCANNING"] = 2;
        values[valuesById[3] = "DAEMON_STATE_READY"] = 3;
        values[valuesById[4] = "DAEMON_STATE_DEGRADED"] = 4;
        return values;
      })();
      v1.StatusRequest = (function() {
        function StatusRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        StatusRequest.create = function create(properties) {
          return new StatusRequest(properties);
        };
        StatusRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        StatusRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        StatusRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatusRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        StatusRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        StatusRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        StatusRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.StatusRequest)
            return object;
          return new $root.tilbo.ipc.v1.StatusRequest();
        };
        StatusRequest.toObject = function toObject() {
          return {};
        };
        StatusRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        StatusRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.StatusRequest";
        };
        return StatusRequest;
      })();
      v1.StatusResponse = (function() {
        function StatusResponse(properties) {
          this.warnings = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        StatusResponse.prototype.state = 0;
        StatusResponse.prototype.filesIndexed = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        StatusResponse.prototype.tagsTotal = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        StatusResponse.prototype.indexSizeMb = 0;
        StatusResponse.prototype.warnings = $util.emptyArray;
        StatusResponse.prototype.uptimeSeconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        StatusResponse.create = function create(properties) {
          return new StatusResponse(properties);
        };
        StatusResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).int32(message.state);
          if (message.filesIndexed != null && Object.hasOwnProperty.call(message, "filesIndexed"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint64(message.filesIndexed);
          if (message.tagsTotal != null && Object.hasOwnProperty.call(message, "tagsTotal"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).uint64(message.tagsTotal);
          if (message.indexSizeMb != null && Object.hasOwnProperty.call(message, "indexSizeMb"))
            writer.uint32(
              /* id 4, wireType 5 =*/
              37
            ).float(message.indexSizeMb);
          if (message.warnings != null && message.warnings.length)
            for (let i = 0; i < message.warnings.length; ++i)
              writer.uint32(
                /* id 5, wireType 2 =*/
                42
              ).string(message.warnings[i]);
          if (message.uptimeSeconds != null && Object.hasOwnProperty.call(message, "uptimeSeconds"))
            writer.uint32(
              /* id 6, wireType 0 =*/
              48
            ).int64(message.uptimeSeconds);
          return writer;
        };
        StatusResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        StatusResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatusResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.state = reader.int32();
                break;
              }
              case 2: {
                message.filesIndexed = reader.uint64();
                break;
              }
              case 3: {
                message.tagsTotal = reader.uint64();
                break;
              }
              case 4: {
                message.indexSizeMb = reader.float();
                break;
              }
              case 5: {
                if (!(message.warnings && message.warnings.length))
                  message.warnings = [];
                message.warnings.push(reader.string());
                break;
              }
              case 6: {
                message.uptimeSeconds = reader.int64();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        StatusResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        StatusResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.state != null && message.hasOwnProperty("state"))
            switch (message.state) {
              default:
                return "state: enum value expected";
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
                break;
            }
          if (message.filesIndexed != null && message.hasOwnProperty("filesIndexed")) {
            if (!$util.isInteger(message.filesIndexed) && !(message.filesIndexed && $util.isInteger(message.filesIndexed.low) && $util.isInteger(message.filesIndexed.high)))
              return "filesIndexed: integer|Long expected";
          }
          if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal")) {
            if (!$util.isInteger(message.tagsTotal) && !(message.tagsTotal && $util.isInteger(message.tagsTotal.low) && $util.isInteger(message.tagsTotal.high)))
              return "tagsTotal: integer|Long expected";
          }
          if (message.indexSizeMb != null && message.hasOwnProperty("indexSizeMb")) {
            if (typeof message.indexSizeMb !== "number")
              return "indexSizeMb: number expected";
          }
          if (message.warnings != null && message.hasOwnProperty("warnings")) {
            if (!Array.isArray(message.warnings))
              return "warnings: array expected";
            for (let i = 0; i < message.warnings.length; ++i)
              if (!$util.isString(message.warnings[i]))
                return "warnings: string[] expected";
          }
          if (message.uptimeSeconds != null && message.hasOwnProperty("uptimeSeconds")) {
            if (!$util.isInteger(message.uptimeSeconds) && !(message.uptimeSeconds && $util.isInteger(message.uptimeSeconds.low) && $util.isInteger(message.uptimeSeconds.high)))
              return "uptimeSeconds: integer|Long expected";
          }
          return null;
        };
        StatusResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.StatusResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.StatusResponse();
          switch (object.state) {
            default:
              if (typeof object.state === "number") {
                message.state = object.state;
                break;
              }
              break;
            case "DAEMON_STATE_UNSPECIFIED":
            case 0:
              message.state = 0;
              break;
            case "DAEMON_STATE_IDLE":
            case 1:
              message.state = 1;
              break;
            case "DAEMON_STATE_SCANNING":
            case 2:
              message.state = 2;
              break;
            case "DAEMON_STATE_READY":
            case 3:
              message.state = 3;
              break;
            case "DAEMON_STATE_DEGRADED":
            case 4:
              message.state = 4;
              break;
          }
          if (object.filesIndexed != null) {
            if ($util.Long)
              (message.filesIndexed = $util.Long.fromValue(object.filesIndexed)).unsigned = true;
            else if (typeof object.filesIndexed === "string")
              message.filesIndexed = parseInt(object.filesIndexed, 10);
            else if (typeof object.filesIndexed === "number")
              message.filesIndexed = object.filesIndexed;
            else if (typeof object.filesIndexed === "object")
              message.filesIndexed = new $util.LongBits(object.filesIndexed.low >>> 0, object.filesIndexed.high >>> 0).toNumber(true);
          }
          if (object.tagsTotal != null) {
            if ($util.Long)
              (message.tagsTotal = $util.Long.fromValue(object.tagsTotal)).unsigned = true;
            else if (typeof object.tagsTotal === "string")
              message.tagsTotal = parseInt(object.tagsTotal, 10);
            else if (typeof object.tagsTotal === "number")
              message.tagsTotal = object.tagsTotal;
            else if (typeof object.tagsTotal === "object")
              message.tagsTotal = new $util.LongBits(object.tagsTotal.low >>> 0, object.tagsTotal.high >>> 0).toNumber(true);
          }
          if (object.indexSizeMb != null)
            message.indexSizeMb = Number(object.indexSizeMb);
          if (object.warnings) {
            if (!Array.isArray(object.warnings))
              throw TypeError(".tilbo.ipc.v1.StatusResponse.warnings: array expected");
            message.warnings = [];
            for (let i = 0; i < object.warnings.length; ++i)
              message.warnings[i] = String(object.warnings[i]);
          }
          if (object.uptimeSeconds != null) {
            if ($util.Long)
              (message.uptimeSeconds = $util.Long.fromValue(object.uptimeSeconds)).unsigned = false;
            else if (typeof object.uptimeSeconds === "string")
              message.uptimeSeconds = parseInt(object.uptimeSeconds, 10);
            else if (typeof object.uptimeSeconds === "number")
              message.uptimeSeconds = object.uptimeSeconds;
            else if (typeof object.uptimeSeconds === "object")
              message.uptimeSeconds = new $util.LongBits(object.uptimeSeconds.low >>> 0, object.uptimeSeconds.high >>> 0).toNumber();
          }
          return message;
        };
        StatusResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.warnings = [];
          if (options.defaults) {
            object.state = options.enums === String ? "DAEMON_STATE_UNSPECIFIED" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, true);
              object.filesIndexed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.filesIndexed = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, true);
              object.tagsTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.tagsTotal = options.longs === String ? "0" : 0;
            object.indexSizeMb = 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.uptimeSeconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.uptimeSeconds = options.longs === String ? "0" : 0;
          }
          if (message.state != null && message.hasOwnProperty("state"))
            object.state = options.enums === String ? $root.tilbo.ipc.v1.DaemonState[message.state] === void 0 ? message.state : $root.tilbo.ipc.v1.DaemonState[message.state] : message.state;
          if (message.filesIndexed != null && message.hasOwnProperty("filesIndexed"))
            if (typeof message.filesIndexed === "number")
              object.filesIndexed = options.longs === String ? String(message.filesIndexed) : message.filesIndexed;
            else
              object.filesIndexed = options.longs === String ? $util.Long.prototype.toString.call(message.filesIndexed) : options.longs === Number ? new $util.LongBits(message.filesIndexed.low >>> 0, message.filesIndexed.high >>> 0).toNumber(true) : message.filesIndexed;
          if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
            if (typeof message.tagsTotal === "number")
              object.tagsTotal = options.longs === String ? String(message.tagsTotal) : message.tagsTotal;
            else
              object.tagsTotal = options.longs === String ? $util.Long.prototype.toString.call(message.tagsTotal) : options.longs === Number ? new $util.LongBits(message.tagsTotal.low >>> 0, message.tagsTotal.high >>> 0).toNumber(true) : message.tagsTotal;
          if (message.indexSizeMb != null && message.hasOwnProperty("indexSizeMb"))
            object.indexSizeMb = options.json && !isFinite(message.indexSizeMb) ? String(message.indexSizeMb) : message.indexSizeMb;
          if (message.warnings && message.warnings.length) {
            object.warnings = [];
            for (let j = 0; j < message.warnings.length; ++j)
              object.warnings[j] = message.warnings[j];
          }
          if (message.uptimeSeconds != null && message.hasOwnProperty("uptimeSeconds"))
            if (typeof message.uptimeSeconds === "number")
              object.uptimeSeconds = options.longs === String ? String(message.uptimeSeconds) : message.uptimeSeconds;
            else
              object.uptimeSeconds = options.longs === String ? $util.Long.prototype.toString.call(message.uptimeSeconds) : options.longs === Number ? new $util.LongBits(message.uptimeSeconds.low >>> 0, message.uptimeSeconds.high >>> 0).toNumber() : message.uptimeSeconds;
          return object;
        };
        StatusResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        StatusResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.StatusResponse";
        };
        return StatusResponse;
      })();
      v1.ReloadRulesRequest = (function() {
        function ReloadRulesRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ReloadRulesRequest.create = function create(properties) {
          return new ReloadRulesRequest(properties);
        };
        ReloadRulesRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        ReloadRulesRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ReloadRulesRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ReloadRulesRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ReloadRulesRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ReloadRulesRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        ReloadRulesRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ReloadRulesRequest)
            return object;
          return new $root.tilbo.ipc.v1.ReloadRulesRequest();
        };
        ReloadRulesRequest.toObject = function toObject() {
          return {};
        };
        ReloadRulesRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ReloadRulesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ReloadRulesRequest";
        };
        return ReloadRulesRequest;
      })();
      v1.ReloadRulesResponse = (function() {
        function ReloadRulesResponse(properties) {
          this.errors = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ReloadRulesResponse.prototype.rulesLoaded = 0;
        ReloadRulesResponse.prototype.errors = $util.emptyArray;
        ReloadRulesResponse.create = function create(properties) {
          return new ReloadRulesResponse(properties);
        };
        ReloadRulesResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.rulesLoaded != null && Object.hasOwnProperty.call(message, "rulesLoaded"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).uint32(message.rulesLoaded);
          if (message.errors != null && message.errors.length)
            for (let i = 0; i < message.errors.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.errors[i]);
          return writer;
        };
        ReloadRulesResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ReloadRulesResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ReloadRulesResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.rulesLoaded = reader.uint32();
                break;
              }
              case 2: {
                if (!(message.errors && message.errors.length))
                  message.errors = [];
                message.errors.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ReloadRulesResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ReloadRulesResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.rulesLoaded != null && message.hasOwnProperty("rulesLoaded")) {
            if (!$util.isInteger(message.rulesLoaded))
              return "rulesLoaded: integer expected";
          }
          if (message.errors != null && message.hasOwnProperty("errors")) {
            if (!Array.isArray(message.errors))
              return "errors: array expected";
            for (let i = 0; i < message.errors.length; ++i)
              if (!$util.isString(message.errors[i]))
                return "errors: string[] expected";
          }
          return null;
        };
        ReloadRulesResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ReloadRulesResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ReloadRulesResponse();
          if (object.rulesLoaded != null)
            message.rulesLoaded = object.rulesLoaded >>> 0;
          if (object.errors) {
            if (!Array.isArray(object.errors))
              throw TypeError(".tilbo.ipc.v1.ReloadRulesResponse.errors: array expected");
            message.errors = [];
            for (let i = 0; i < object.errors.length; ++i)
              message.errors[i] = String(object.errors[i]);
          }
          return message;
        };
        ReloadRulesResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.errors = [];
          if (options.defaults)
            object.rulesLoaded = 0;
          if (message.rulesLoaded != null && message.hasOwnProperty("rulesLoaded"))
            object.rulesLoaded = message.rulesLoaded;
          if (message.errors && message.errors.length) {
            object.errors = [];
            for (let j = 0; j < message.errors.length; ++j)
              object.errors[j] = message.errors[j];
          }
          return object;
        };
        ReloadRulesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ReloadRulesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ReloadRulesResponse";
        };
        return ReloadRulesResponse;
      })();
      v1.ListTagsRequest = (function() {
        function ListTagsRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListTagsRequest.prototype.prefix = "";
        ListTagsRequest.create = function create(properties) {
          return new ListTagsRequest(properties);
        };
        ListTagsRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.prefix != null && Object.hasOwnProperty.call(message, "prefix"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.prefix);
          return writer;
        };
        ListTagsRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListTagsRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTagsRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.prefix = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListTagsRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListTagsRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.prefix != null && message.hasOwnProperty("prefix")) {
            if (!$util.isString(message.prefix))
              return "prefix: string expected";
          }
          return null;
        };
        ListTagsRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListTagsRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.ListTagsRequest();
          if (object.prefix != null)
            message.prefix = String(object.prefix);
          return message;
        };
        ListTagsRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.prefix = "";
          if (message.prefix != null && message.hasOwnProperty("prefix"))
            object.prefix = message.prefix;
          return object;
        };
        ListTagsRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListTagsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListTagsRequest";
        };
        return ListTagsRequest;
      })();
      v1.ListTagsResponse = (function() {
        function ListTagsResponse(properties) {
          this.tags = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListTagsResponse.prototype.tags = $util.emptyArray;
        ListTagsResponse.create = function create(properties) {
          return new ListTagsResponse(properties);
        };
        ListTagsResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.tags != null && message.tags.length)
            for (let i = 0; i < message.tags.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.tags[i]);
          return writer;
        };
        ListTagsResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListTagsResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTagsResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.tags && message.tags.length))
                  message.tags = [];
                message.tags.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListTagsResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListTagsResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.tags != null && message.hasOwnProperty("tags")) {
            if (!Array.isArray(message.tags))
              return "tags: array expected";
            for (let i = 0; i < message.tags.length; ++i)
              if (!$util.isString(message.tags[i]))
                return "tags: string[] expected";
          }
          return null;
        };
        ListTagsResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListTagsResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ListTagsResponse();
          if (object.tags) {
            if (!Array.isArray(object.tags))
              throw TypeError(".tilbo.ipc.v1.ListTagsResponse.tags: array expected");
            message.tags = [];
            for (let i = 0; i < object.tags.length; ++i)
              message.tags[i] = String(object.tags[i]);
          }
          return message;
        };
        ListTagsResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.tags = [];
          if (message.tags && message.tags.length) {
            object.tags = [];
            for (let j = 0; j < message.tags.length; ++j)
              object.tags[j] = message.tags[j];
          }
          return object;
        };
        ListTagsResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListTagsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListTagsResponse";
        };
        return ListTagsResponse;
      })();
      v1.HydrateTagsRequest = (function() {
        function HydrateTagsRequest(properties) {
          this.paths = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        HydrateTagsRequest.prototype.paths = $util.emptyArray;
        HydrateTagsRequest.create = function create(properties) {
          return new HydrateTagsRequest(properties);
        };
        HydrateTagsRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.paths != null && message.paths.length)
            for (let i = 0; i < message.paths.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.paths[i]);
          return writer;
        };
        HydrateTagsRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        HydrateTagsRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydrateTagsRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.paths && message.paths.length))
                  message.paths = [];
                message.paths.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        HydrateTagsRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        HydrateTagsRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.paths != null && message.hasOwnProperty("paths")) {
            if (!Array.isArray(message.paths))
              return "paths: array expected";
            for (let i = 0; i < message.paths.length; ++i)
              if (!$util.isString(message.paths[i]))
                return "paths: string[] expected";
          }
          return null;
        };
        HydrateTagsRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.HydrateTagsRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.HydrateTagsRequest();
          if (object.paths) {
            if (!Array.isArray(object.paths))
              throw TypeError(".tilbo.ipc.v1.HydrateTagsRequest.paths: array expected");
            message.paths = [];
            for (let i = 0; i < object.paths.length; ++i)
              message.paths[i] = String(object.paths[i]);
          }
          return message;
        };
        HydrateTagsRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.paths = [];
          if (message.paths && message.paths.length) {
            object.paths = [];
            for (let j = 0; j < message.paths.length; ++j)
              object.paths[j] = message.paths[j];
          }
          return object;
        };
        HydrateTagsRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        HydrateTagsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.HydrateTagsRequest";
        };
        return HydrateTagsRequest;
      })();
      v1.HydratedPathTags = (function() {
        function HydratedPathTags(properties) {
          this.tags = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        HydratedPathTags.prototype.path = "";
        HydratedPathTags.prototype.tags = $util.emptyArray;
        HydratedPathTags.create = function create(properties) {
          return new HydratedPathTags(properties);
        };
        HydratedPathTags.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.tags != null && message.tags.length)
            for (let i = 0; i < message.tags.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.tags[i]);
          return writer;
        };
        HydratedPathTags.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        HydratedPathTags.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydratedPathTags();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                if (!(message.tags && message.tags.length))
                  message.tags = [];
                message.tags.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        HydratedPathTags.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        HydratedPathTags.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.tags != null && message.hasOwnProperty("tags")) {
            if (!Array.isArray(message.tags))
              return "tags: array expected";
            for (let i = 0; i < message.tags.length; ++i)
              if (!$util.isString(message.tags[i]))
                return "tags: string[] expected";
          }
          return null;
        };
        HydratedPathTags.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.HydratedPathTags)
            return object;
          let message = new $root.tilbo.ipc.v1.HydratedPathTags();
          if (object.path != null)
            message.path = String(object.path);
          if (object.tags) {
            if (!Array.isArray(object.tags))
              throw TypeError(".tilbo.ipc.v1.HydratedPathTags.tags: array expected");
            message.tags = [];
            for (let i = 0; i < object.tags.length; ++i)
              message.tags[i] = String(object.tags[i]);
          }
          return message;
        };
        HydratedPathTags.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.tags = [];
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.tags && message.tags.length) {
            object.tags = [];
            for (let j = 0; j < message.tags.length; ++j)
              object.tags[j] = message.tags[j];
          }
          return object;
        };
        HydratedPathTags.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        HydratedPathTags.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.HydratedPathTags";
        };
        return HydratedPathTags;
      })();
      v1.HydrateTagsResponse = (function() {
        function HydrateTagsResponse(properties) {
          this.entries = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        HydrateTagsResponse.prototype.entries = $util.emptyArray;
        HydrateTagsResponse.create = function create(properties) {
          return new HydrateTagsResponse(properties);
        };
        HydrateTagsResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.entries != null && message.entries.length)
            for (let i = 0; i < message.entries.length; ++i)
              $root.tilbo.ipc.v1.HydratedPathTags.encode(message.entries[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        HydrateTagsResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        HydrateTagsResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydrateTagsResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.entries && message.entries.length))
                  message.entries = [];
                message.entries.push($root.tilbo.ipc.v1.HydratedPathTags.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        HydrateTagsResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        HydrateTagsResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.entries != null && message.hasOwnProperty("entries")) {
            if (!Array.isArray(message.entries))
              return "entries: array expected";
            for (let i = 0; i < message.entries.length; ++i) {
              let error = $root.tilbo.ipc.v1.HydratedPathTags.verify(message.entries[i]);
              if (error)
                return "entries." + error;
            }
          }
          return null;
        };
        HydrateTagsResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.HydrateTagsResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.HydrateTagsResponse();
          if (object.entries) {
            if (!Array.isArray(object.entries))
              throw TypeError(".tilbo.ipc.v1.HydrateTagsResponse.entries: array expected");
            message.entries = [];
            for (let i = 0; i < object.entries.length; ++i) {
              if (typeof object.entries[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.HydrateTagsResponse.entries: object expected");
              message.entries[i] = $root.tilbo.ipc.v1.HydratedPathTags.fromObject(object.entries[i]);
            }
          }
          return message;
        };
        HydrateTagsResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.entries = [];
          if (message.entries && message.entries.length) {
            object.entries = [];
            for (let j = 0; j < message.entries.length; ++j)
              object.entries[j] = $root.tilbo.ipc.v1.HydratedPathTags.toObject(message.entries[j], options);
          }
          return object;
        };
        HydrateTagsResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        HydrateTagsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.HydrateTagsResponse";
        };
        return HydrateTagsResponse;
      })();
      v1.ListDirectoryRequest = (function() {
        function ListDirectoryRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListDirectoryRequest.prototype.path = "";
        ListDirectoryRequest.prototype.hidden = false;
        ListDirectoryRequest.create = function create(properties) {
          return new ListDirectoryRequest(properties);
        };
        ListDirectoryRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.hidden != null && Object.hasOwnProperty.call(message, "hidden"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(message.hidden);
          return writer;
        };
        ListDirectoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListDirectoryRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListDirectoryRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.hidden = reader.bool();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListDirectoryRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListDirectoryRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.hidden != null && message.hasOwnProperty("hidden")) {
            if (typeof message.hidden !== "boolean")
              return "hidden: boolean expected";
          }
          return null;
        };
        ListDirectoryRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListDirectoryRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.ListDirectoryRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.hidden != null)
            message.hidden = Boolean(object.hidden);
          return message;
        };
        ListDirectoryRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.hidden = false;
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.hidden != null && message.hasOwnProperty("hidden"))
            object.hidden = message.hidden;
          return object;
        };
        ListDirectoryRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListDirectoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListDirectoryRequest";
        };
        return ListDirectoryRequest;
      })();
      v1.DirEntry = (function() {
        function DirEntry(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        DirEntry.prototype.name = "";
        DirEntry.prototype.path = "";
        DirEntry.prototype.isDir = false;
        DirEntry.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        DirEntry.prototype.mtime = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        DirEntry.prototype.mode = 0;
        DirEntry.prototype.hidden = false;
        DirEntry.prototype.mimeType = "";
        DirEntry.prototype.iconName = "";
        DirEntry.create = function create(properties) {
          return new DirEntry(properties);
        };
        DirEntry.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.name);
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.path);
          if (message.isDir != null && Object.hasOwnProperty.call(message, "isDir"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).bool(message.isDir);
          if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
            writer.uint32(
              /* id 4, wireType 0 =*/
              32
            ).int64(message.sizeBytes);
          if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
            writer.uint32(
              /* id 5, wireType 0 =*/
              40
            ).int64(message.mtime);
          if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
            writer.uint32(
              /* id 6, wireType 0 =*/
              48
            ).uint32(message.mode);
          if (message.hidden != null && Object.hasOwnProperty.call(message, "hidden"))
            writer.uint32(
              /* id 7, wireType 0 =*/
              56
            ).bool(message.hidden);
          if (message.mimeType != null && Object.hasOwnProperty.call(message, "mimeType"))
            writer.uint32(
              /* id 8, wireType 2 =*/
              66
            ).string(message.mimeType);
          if (message.iconName != null && Object.hasOwnProperty.call(message, "iconName"))
            writer.uint32(
              /* id 9, wireType 2 =*/
              74
            ).string(message.iconName);
          return writer;
        };
        DirEntry.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        DirEntry.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DirEntry();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.name = reader.string();
                break;
              }
              case 2: {
                message.path = reader.string();
                break;
              }
              case 3: {
                message.isDir = reader.bool();
                break;
              }
              case 4: {
                message.sizeBytes = reader.int64();
                break;
              }
              case 5: {
                message.mtime = reader.int64();
                break;
              }
              case 6: {
                message.mode = reader.uint32();
                break;
              }
              case 7: {
                message.hidden = reader.bool();
                break;
              }
              case 8: {
                message.mimeType = reader.string();
                break;
              }
              case 9: {
                message.iconName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        DirEntry.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        DirEntry.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.name != null && message.hasOwnProperty("name")) {
            if (!$util.isString(message.name))
              return "name: string expected";
          }
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.isDir != null && message.hasOwnProperty("isDir")) {
            if (typeof message.isDir !== "boolean")
              return "isDir: boolean expected";
          }
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes")) {
            if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
              return "sizeBytes: integer|Long expected";
          }
          if (message.mtime != null && message.hasOwnProperty("mtime")) {
            if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
              return "mtime: integer|Long expected";
          }
          if (message.mode != null && message.hasOwnProperty("mode")) {
            if (!$util.isInteger(message.mode))
              return "mode: integer expected";
          }
          if (message.hidden != null && message.hasOwnProperty("hidden")) {
            if (typeof message.hidden !== "boolean")
              return "hidden: boolean expected";
          }
          if (message.mimeType != null && message.hasOwnProperty("mimeType")) {
            if (!$util.isString(message.mimeType))
              return "mimeType: string expected";
          }
          if (message.iconName != null && message.hasOwnProperty("iconName")) {
            if (!$util.isString(message.iconName))
              return "iconName: string expected";
          }
          return null;
        };
        DirEntry.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.DirEntry)
            return object;
          let message = new $root.tilbo.ipc.v1.DirEntry();
          if (object.name != null)
            message.name = String(object.name);
          if (object.path != null)
            message.path = String(object.path);
          if (object.isDir != null)
            message.isDir = Boolean(object.isDir);
          if (object.sizeBytes != null) {
            if ($util.Long)
              (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
            else if (typeof object.sizeBytes === "string")
              message.sizeBytes = parseInt(object.sizeBytes, 10);
            else if (typeof object.sizeBytes === "number")
              message.sizeBytes = object.sizeBytes;
            else if (typeof object.sizeBytes === "object")
              message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
          }
          if (object.mtime != null) {
            if ($util.Long)
              (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
            else if (typeof object.mtime === "string")
              message.mtime = parseInt(object.mtime, 10);
            else if (typeof object.mtime === "number")
              message.mtime = object.mtime;
            else if (typeof object.mtime === "object")
              message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
          }
          if (object.mode != null)
            message.mode = object.mode >>> 0;
          if (object.hidden != null)
            message.hidden = Boolean(object.hidden);
          if (object.mimeType != null)
            message.mimeType = String(object.mimeType);
          if (object.iconName != null)
            message.iconName = String(object.iconName);
          return message;
        };
        DirEntry.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.name = "";
            object.path = "";
            object.isDir = false;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.sizeBytes = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.mtime = options.longs === String ? "0" : 0;
            object.mode = 0;
            object.hidden = false;
            object.mimeType = "";
            object.iconName = "";
          }
          if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.isDir != null && message.hasOwnProperty("isDir"))
            object.isDir = message.isDir;
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
            if (typeof message.sizeBytes === "number")
              object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
            else
              object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
          if (message.mtime != null && message.hasOwnProperty("mtime"))
            if (typeof message.mtime === "number")
              object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
            else
              object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
          if (message.mode != null && message.hasOwnProperty("mode"))
            object.mode = message.mode;
          if (message.hidden != null && message.hasOwnProperty("hidden"))
            object.hidden = message.hidden;
          if (message.mimeType != null && message.hasOwnProperty("mimeType"))
            object.mimeType = message.mimeType;
          if (message.iconName != null && message.hasOwnProperty("iconName"))
            object.iconName = message.iconName;
          return object;
        };
        DirEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        DirEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.DirEntry";
        };
        return DirEntry;
      })();
      v1.ListDirectoryResponse = (function() {
        function ListDirectoryResponse(properties) {
          this.entries = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListDirectoryResponse.prototype.entries = $util.emptyArray;
        ListDirectoryResponse.create = function create(properties) {
          return new ListDirectoryResponse(properties);
        };
        ListDirectoryResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.entries != null && message.entries.length)
            for (let i = 0; i < message.entries.length; ++i)
              $root.tilbo.ipc.v1.DirEntry.encode(message.entries[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        ListDirectoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListDirectoryResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListDirectoryResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.entries && message.entries.length))
                  message.entries = [];
                message.entries.push($root.tilbo.ipc.v1.DirEntry.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListDirectoryResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListDirectoryResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.entries != null && message.hasOwnProperty("entries")) {
            if (!Array.isArray(message.entries))
              return "entries: array expected";
            for (let i = 0; i < message.entries.length; ++i) {
              let error = $root.tilbo.ipc.v1.DirEntry.verify(message.entries[i]);
              if (error)
                return "entries." + error;
            }
          }
          return null;
        };
        ListDirectoryResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListDirectoryResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ListDirectoryResponse();
          if (object.entries) {
            if (!Array.isArray(object.entries))
              throw TypeError(".tilbo.ipc.v1.ListDirectoryResponse.entries: array expected");
            message.entries = [];
            for (let i = 0; i < object.entries.length; ++i) {
              if (typeof object.entries[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.ListDirectoryResponse.entries: object expected");
              message.entries[i] = $root.tilbo.ipc.v1.DirEntry.fromObject(object.entries[i]);
            }
          }
          return message;
        };
        ListDirectoryResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.entries = [];
          if (message.entries && message.entries.length) {
            object.entries = [];
            for (let j = 0; j < message.entries.length; ++j)
              object.entries[j] = $root.tilbo.ipc.v1.DirEntry.toObject(message.entries[j], options);
          }
          return object;
        };
        ListDirectoryResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListDirectoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListDirectoryResponse";
        };
        return ListDirectoryResponse;
      })();
      v1.StatFileRequest = (function() {
        function StatFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        StatFileRequest.prototype.path = "";
        StatFileRequest.create = function create(properties) {
          return new StatFileRequest(properties);
        };
        StatFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        StatFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        StatFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        StatFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        StatFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        StatFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.StatFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.StatFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        StatFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        StatFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        StatFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.StatFileRequest";
        };
        return StatFileRequest;
      })();
      v1.FileStat = (function() {
        function FileStat(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        FileStat.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        FileStat.prototype.mtime = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        FileStat.prototype.mode = 0;
        FileStat.create = function create(properties) {
          return new FileStat(properties);
        };
        FileStat.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).int64(message.sizeBytes);
          if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).int64(message.mtime);
          if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).uint32(message.mode);
          return writer;
        };
        FileStat.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        FileStat.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileStat();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.sizeBytes = reader.int64();
                break;
              }
              case 2: {
                message.mtime = reader.int64();
                break;
              }
              case 3: {
                message.mode = reader.uint32();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        FileStat.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        FileStat.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes")) {
            if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
              return "sizeBytes: integer|Long expected";
          }
          if (message.mtime != null && message.hasOwnProperty("mtime")) {
            if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
              return "mtime: integer|Long expected";
          }
          if (message.mode != null && message.hasOwnProperty("mode")) {
            if (!$util.isInteger(message.mode))
              return "mode: integer expected";
          }
          return null;
        };
        FileStat.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.FileStat)
            return object;
          let message = new $root.tilbo.ipc.v1.FileStat();
          if (object.sizeBytes != null) {
            if ($util.Long)
              (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
            else if (typeof object.sizeBytes === "string")
              message.sizeBytes = parseInt(object.sizeBytes, 10);
            else if (typeof object.sizeBytes === "number")
              message.sizeBytes = object.sizeBytes;
            else if (typeof object.sizeBytes === "object")
              message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
          }
          if (object.mtime != null) {
            if ($util.Long)
              (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
            else if (typeof object.mtime === "string")
              message.mtime = parseInt(object.mtime, 10);
            else if (typeof object.mtime === "number")
              message.mtime = object.mtime;
            else if (typeof object.mtime === "object")
              message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
          }
          if (object.mode != null)
            message.mode = object.mode >>> 0;
          return message;
        };
        FileStat.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.sizeBytes = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.mtime = options.longs === String ? "0" : 0;
            object.mode = 0;
          }
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
            if (typeof message.sizeBytes === "number")
              object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
            else
              object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
          if (message.mtime != null && message.hasOwnProperty("mtime"))
            if (typeof message.mtime === "number")
              object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
            else
              object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
          if (message.mode != null && message.hasOwnProperty("mode"))
            object.mode = message.mode;
          return object;
        };
        FileStat.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        FileStat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.FileStat";
        };
        return FileStat;
      })();
      v1.StatFileResponse = (function() {
        function StatFileResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        StatFileResponse.prototype.stat = null;
        StatFileResponse.create = function create(properties) {
          return new StatFileResponse(properties);
        };
        StatFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.stat != null && Object.hasOwnProperty.call(message, "stat"))
            $root.tilbo.ipc.v1.FileStat.encode(message.stat, writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
          return writer;
        };
        StatFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        StatFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.stat = $root.tilbo.ipc.v1.FileStat.decode(reader, reader.uint32());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        StatFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        StatFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.stat != null && message.hasOwnProperty("stat")) {
            let error = $root.tilbo.ipc.v1.FileStat.verify(message.stat);
            if (error)
              return "stat." + error;
          }
          return null;
        };
        StatFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.StatFileResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.StatFileResponse();
          if (object.stat != null) {
            if (typeof object.stat !== "object")
              throw TypeError(".tilbo.ipc.v1.StatFileResponse.stat: object expected");
            message.stat = $root.tilbo.ipc.v1.FileStat.fromObject(object.stat);
          }
          return message;
        };
        StatFileResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.stat = null;
          if (message.stat != null && message.hasOwnProperty("stat"))
            object.stat = $root.tilbo.ipc.v1.FileStat.toObject(message.stat, options);
          return object;
        };
        StatFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        StatFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.StatFileResponse";
        };
        return StatFileResponse;
      })();
      v1.GlobSearchRequest = (function() {
        function GlobSearchRequest(properties) {
          this.patterns = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GlobSearchRequest.prototype.patterns = $util.emptyArray;
        GlobSearchRequest.prototype.limit = 0;
        GlobSearchRequest.prototype.allowHidden = false;
        GlobSearchRequest.create = function create(properties) {
          return new GlobSearchRequest(properties);
        };
        GlobSearchRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.patterns != null && message.patterns.length)
            for (let i = 0; i < message.patterns.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.patterns[i]);
          if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint32(message.limit);
          if (message.allowHidden != null && Object.hasOwnProperty.call(message, "allowHidden"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).bool(message.allowHidden);
          return writer;
        };
        GlobSearchRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GlobSearchRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GlobSearchRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.patterns && message.patterns.length))
                  message.patterns = [];
                message.patterns.push(reader.string());
                break;
              }
              case 2: {
                message.limit = reader.uint32();
                break;
              }
              case 3: {
                message.allowHidden = reader.bool();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GlobSearchRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GlobSearchRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.patterns != null && message.hasOwnProperty("patterns")) {
            if (!Array.isArray(message.patterns))
              return "patterns: array expected";
            for (let i = 0; i < message.patterns.length; ++i)
              if (!$util.isString(message.patterns[i]))
                return "patterns: string[] expected";
          }
          if (message.limit != null && message.hasOwnProperty("limit")) {
            if (!$util.isInteger(message.limit))
              return "limit: integer expected";
          }
          if (message.allowHidden != null && message.hasOwnProperty("allowHidden")) {
            if (typeof message.allowHidden !== "boolean")
              return "allowHidden: boolean expected";
          }
          return null;
        };
        GlobSearchRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GlobSearchRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.GlobSearchRequest();
          if (object.patterns) {
            if (!Array.isArray(object.patterns))
              throw TypeError(".tilbo.ipc.v1.GlobSearchRequest.patterns: array expected");
            message.patterns = [];
            for (let i = 0; i < object.patterns.length; ++i)
              message.patterns[i] = String(object.patterns[i]);
          }
          if (object.limit != null)
            message.limit = object.limit >>> 0;
          if (object.allowHidden != null)
            message.allowHidden = Boolean(object.allowHidden);
          return message;
        };
        GlobSearchRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.patterns = [];
          if (options.defaults) {
            object.limit = 0;
            object.allowHidden = false;
          }
          if (message.patterns && message.patterns.length) {
            object.patterns = [];
            for (let j = 0; j < message.patterns.length; ++j)
              object.patterns[j] = message.patterns[j];
          }
          if (message.limit != null && message.hasOwnProperty("limit"))
            object.limit = message.limit;
          if (message.allowHidden != null && message.hasOwnProperty("allowHidden"))
            object.allowHidden = message.allowHidden;
          return object;
        };
        GlobSearchRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GlobSearchRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GlobSearchRequest";
        };
        return GlobSearchRequest;
      })();
      v1.GlobSearchResponse = (function() {
        function GlobSearchResponse(properties) {
          this.files = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GlobSearchResponse.prototype.files = $util.emptyArray;
        GlobSearchResponse.create = function create(properties) {
          return new GlobSearchResponse(properties);
        };
        GlobSearchResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.files != null && message.files.length)
            for (let i = 0; i < message.files.length; ++i)
              $root.tilbo.ipc.v1.FileResult.encode(message.files[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        GlobSearchResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GlobSearchResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GlobSearchResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.files && message.files.length))
                  message.files = [];
                message.files.push($root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GlobSearchResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GlobSearchResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.files != null && message.hasOwnProperty("files")) {
            if (!Array.isArray(message.files))
              return "files: array expected";
            for (let i = 0; i < message.files.length; ++i) {
              let error = $root.tilbo.ipc.v1.FileResult.verify(message.files[i]);
              if (error)
                return "files." + error;
            }
          }
          return null;
        };
        GlobSearchResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GlobSearchResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.GlobSearchResponse();
          if (object.files) {
            if (!Array.isArray(object.files))
              throw TypeError(".tilbo.ipc.v1.GlobSearchResponse.files: array expected");
            message.files = [];
            for (let i = 0; i < object.files.length; ++i) {
              if (typeof object.files[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.GlobSearchResponse.files: object expected");
              message.files[i] = $root.tilbo.ipc.v1.FileResult.fromObject(object.files[i]);
            }
          }
          return message;
        };
        GlobSearchResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.files = [];
          if (message.files && message.files.length) {
            object.files = [];
            for (let j = 0; j < message.files.length; ++j)
              object.files[j] = $root.tilbo.ipc.v1.FileResult.toObject(message.files[j], options);
          }
          return object;
        };
        GlobSearchResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GlobSearchResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GlobSearchResponse";
        };
        return GlobSearchResponse;
      })();
      v1.RenameFileRequest = (function() {
        function RenameFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RenameFileRequest.prototype.path = "";
        RenameFileRequest.prototype.newName = "";
        RenameFileRequest.create = function create(properties) {
          return new RenameFileRequest(properties);
        };
        RenameFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.newName != null && Object.hasOwnProperty.call(message, "newName"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.newName);
          return writer;
        };
        RenameFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RenameFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RenameFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.newName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RenameFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RenameFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.newName != null && message.hasOwnProperty("newName")) {
            if (!$util.isString(message.newName))
              return "newName: string expected";
          }
          return null;
        };
        RenameFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RenameFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.RenameFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.newName != null)
            message.newName = String(object.newName);
          return message;
        };
        RenameFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.newName = "";
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.newName != null && message.hasOwnProperty("newName"))
            object.newName = message.newName;
          return object;
        };
        RenameFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RenameFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RenameFileRequest";
        };
        return RenameFileRequest;
      })();
      v1.RenameFileResponse = (function() {
        function RenameFileResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RenameFileResponse.prototype.newPath = "";
        RenameFileResponse.create = function create(properties) {
          return new RenameFileResponse(properties);
        };
        RenameFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.newPath != null && Object.hasOwnProperty.call(message, "newPath"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.newPath);
          return writer;
        };
        RenameFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RenameFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RenameFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.newPath = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RenameFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RenameFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.newPath != null && message.hasOwnProperty("newPath")) {
            if (!$util.isString(message.newPath))
              return "newPath: string expected";
          }
          return null;
        };
        RenameFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RenameFileResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.RenameFileResponse();
          if (object.newPath != null)
            message.newPath = String(object.newPath);
          return message;
        };
        RenameFileResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.newPath = "";
          if (message.newPath != null && message.hasOwnProperty("newPath"))
            object.newPath = message.newPath;
          return object;
        };
        RenameFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RenameFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RenameFileResponse";
        };
        return RenameFileResponse;
      })();
      v1.DeleteFileRequest = (function() {
        function DeleteFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        DeleteFileRequest.prototype.path = "";
        DeleteFileRequest.create = function create(properties) {
          return new DeleteFileRequest(properties);
        };
        DeleteFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        DeleteFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        DeleteFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DeleteFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        DeleteFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        DeleteFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        DeleteFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.DeleteFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.DeleteFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        DeleteFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        DeleteFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        DeleteFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.DeleteFileRequest";
        };
        return DeleteFileRequest;
      })();
      v1.DeleteFileResponse = (function() {
        function DeleteFileResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        DeleteFileResponse.create = function create(properties) {
          return new DeleteFileResponse(properties);
        };
        DeleteFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        DeleteFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        DeleteFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DeleteFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        DeleteFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        DeleteFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        DeleteFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.DeleteFileResponse)
            return object;
          return new $root.tilbo.ipc.v1.DeleteFileResponse();
        };
        DeleteFileResponse.toObject = function toObject() {
          return {};
        };
        DeleteFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        DeleteFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.DeleteFileResponse";
        };
        return DeleteFileResponse;
      })();
      v1.ChmodFileRequest = (function() {
        function ChmodFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ChmodFileRequest.prototype.path = "";
        ChmodFileRequest.prototype.mode = 0;
        ChmodFileRequest.create = function create(properties) {
          return new ChmodFileRequest(properties);
        };
        ChmodFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint32(message.mode);
          return writer;
        };
        ChmodFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ChmodFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ChmodFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.mode = reader.uint32();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ChmodFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ChmodFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.mode != null && message.hasOwnProperty("mode")) {
            if (!$util.isInteger(message.mode))
              return "mode: integer expected";
          }
          return null;
        };
        ChmodFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ChmodFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.ChmodFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.mode != null)
            message.mode = object.mode >>> 0;
          return message;
        };
        ChmodFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.mode = 0;
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.mode != null && message.hasOwnProperty("mode"))
            object.mode = message.mode;
          return object;
        };
        ChmodFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ChmodFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ChmodFileRequest";
        };
        return ChmodFileRequest;
      })();
      v1.ChmodFileResponse = (function() {
        function ChmodFileResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ChmodFileResponse.create = function create(properties) {
          return new ChmodFileResponse(properties);
        };
        ChmodFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        ChmodFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ChmodFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ChmodFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ChmodFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ChmodFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        ChmodFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ChmodFileResponse)
            return object;
          return new $root.tilbo.ipc.v1.ChmodFileResponse();
        };
        ChmodFileResponse.toObject = function toObject() {
          return {};
        };
        ChmodFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ChmodFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ChmodFileResponse";
        };
        return ChmodFileResponse;
      })();
      v1.ListPlacesRequest = (function() {
        function ListPlacesRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListPlacesRequest.create = function create(properties) {
          return new ListPlacesRequest(properties);
        };
        ListPlacesRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        ListPlacesRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListPlacesRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListPlacesRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListPlacesRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListPlacesRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        ListPlacesRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListPlacesRequest)
            return object;
          return new $root.tilbo.ipc.v1.ListPlacesRequest();
        };
        ListPlacesRequest.toObject = function toObject() {
          return {};
        };
        ListPlacesRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListPlacesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListPlacesRequest";
        };
        return ListPlacesRequest;
      })();
      v1.PlaceEntry = (function() {
        function PlaceEntry(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        PlaceEntry.prototype.name = "";
        PlaceEntry.prototype.path = "";
        PlaceEntry.prototype.pinned = false;
        PlaceEntry.prototype.iconName = "";
        PlaceEntry.create = function create(properties) {
          return new PlaceEntry(properties);
        };
        PlaceEntry.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.name);
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.path);
          if (message.pinned != null && Object.hasOwnProperty.call(message, "pinned"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).bool(message.pinned);
          if (message.iconName != null && Object.hasOwnProperty.call(message, "iconName"))
            writer.uint32(
              /* id 4, wireType 2 =*/
              34
            ).string(message.iconName);
          return writer;
        };
        PlaceEntry.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        PlaceEntry.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.PlaceEntry();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.name = reader.string();
                break;
              }
              case 2: {
                message.path = reader.string();
                break;
              }
              case 3: {
                message.pinned = reader.bool();
                break;
              }
              case 4: {
                message.iconName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        PlaceEntry.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        PlaceEntry.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.name != null && message.hasOwnProperty("name")) {
            if (!$util.isString(message.name))
              return "name: string expected";
          }
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.pinned != null && message.hasOwnProperty("pinned")) {
            if (typeof message.pinned !== "boolean")
              return "pinned: boolean expected";
          }
          if (message.iconName != null && message.hasOwnProperty("iconName")) {
            if (!$util.isString(message.iconName))
              return "iconName: string expected";
          }
          return null;
        };
        PlaceEntry.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.PlaceEntry)
            return object;
          let message = new $root.tilbo.ipc.v1.PlaceEntry();
          if (object.name != null)
            message.name = String(object.name);
          if (object.path != null)
            message.path = String(object.path);
          if (object.pinned != null)
            message.pinned = Boolean(object.pinned);
          if (object.iconName != null)
            message.iconName = String(object.iconName);
          return message;
        };
        PlaceEntry.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.name = "";
            object.path = "";
            object.pinned = false;
            object.iconName = "";
          }
          if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.pinned != null && message.hasOwnProperty("pinned"))
            object.pinned = message.pinned;
          if (message.iconName != null && message.hasOwnProperty("iconName"))
            object.iconName = message.iconName;
          return object;
        };
        PlaceEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        PlaceEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.PlaceEntry";
        };
        return PlaceEntry;
      })();
      v1.ListPlacesResponse = (function() {
        function ListPlacesResponse(properties) {
          this.places = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListPlacesResponse.prototype.places = $util.emptyArray;
        ListPlacesResponse.create = function create(properties) {
          return new ListPlacesResponse(properties);
        };
        ListPlacesResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.places != null && message.places.length)
            for (let i = 0; i < message.places.length; ++i)
              $root.tilbo.ipc.v1.PlaceEntry.encode(message.places[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        ListPlacesResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListPlacesResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListPlacesResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.places && message.places.length))
                  message.places = [];
                message.places.push($root.tilbo.ipc.v1.PlaceEntry.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListPlacesResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListPlacesResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.places != null && message.hasOwnProperty("places")) {
            if (!Array.isArray(message.places))
              return "places: array expected";
            for (let i = 0; i < message.places.length; ++i) {
              let error = $root.tilbo.ipc.v1.PlaceEntry.verify(message.places[i]);
              if (error)
                return "places." + error;
            }
          }
          return null;
        };
        ListPlacesResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListPlacesResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ListPlacesResponse();
          if (object.places) {
            if (!Array.isArray(object.places))
              throw TypeError(".tilbo.ipc.v1.ListPlacesResponse.places: array expected");
            message.places = [];
            for (let i = 0; i < object.places.length; ++i) {
              if (typeof object.places[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.ListPlacesResponse.places: object expected");
              message.places[i] = $root.tilbo.ipc.v1.PlaceEntry.fromObject(object.places[i]);
            }
          }
          return message;
        };
        ListPlacesResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.places = [];
          if (message.places && message.places.length) {
            object.places = [];
            for (let j = 0; j < message.places.length; ++j)
              object.places[j] = $root.tilbo.ipc.v1.PlaceEntry.toObject(message.places[j], options);
          }
          return object;
        };
        ListPlacesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListPlacesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListPlacesResponse";
        };
        return ListPlacesResponse;
      })();
      v1.FileTaggedEvent = (function() {
        function FileTaggedEvent(properties) {
          this.added = [];
          this.removed = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        FileTaggedEvent.prototype.path = "";
        FileTaggedEvent.prototype.added = $util.emptyArray;
        FileTaggedEvent.prototype.removed = $util.emptyArray;
        FileTaggedEvent.create = function create(properties) {
          return new FileTaggedEvent(properties);
        };
        FileTaggedEvent.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.added != null && message.added.length)
            for (let i = 0; i < message.added.length; ++i)
              writer.uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.added[i]);
          if (message.removed != null && message.removed.length)
            for (let i = 0; i < message.removed.length; ++i)
              writer.uint32(
                /* id 3, wireType 2 =*/
                26
              ).string(message.removed[i]);
          return writer;
        };
        FileTaggedEvent.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        FileTaggedEvent.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileTaggedEvent();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                if (!(message.added && message.added.length))
                  message.added = [];
                message.added.push(reader.string());
                break;
              }
              case 3: {
                if (!(message.removed && message.removed.length))
                  message.removed = [];
                message.removed.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        FileTaggedEvent.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        FileTaggedEvent.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.added != null && message.hasOwnProperty("added")) {
            if (!Array.isArray(message.added))
              return "added: array expected";
            for (let i = 0; i < message.added.length; ++i)
              if (!$util.isString(message.added[i]))
                return "added: string[] expected";
          }
          if (message.removed != null && message.hasOwnProperty("removed")) {
            if (!Array.isArray(message.removed))
              return "removed: array expected";
            for (let i = 0; i < message.removed.length; ++i)
              if (!$util.isString(message.removed[i]))
                return "removed: string[] expected";
          }
          return null;
        };
        FileTaggedEvent.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.FileTaggedEvent)
            return object;
          let message = new $root.tilbo.ipc.v1.FileTaggedEvent();
          if (object.path != null)
            message.path = String(object.path);
          if (object.added) {
            if (!Array.isArray(object.added))
              throw TypeError(".tilbo.ipc.v1.FileTaggedEvent.added: array expected");
            message.added = [];
            for (let i = 0; i < object.added.length; ++i)
              message.added[i] = String(object.added[i]);
          }
          if (object.removed) {
            if (!Array.isArray(object.removed))
              throw TypeError(".tilbo.ipc.v1.FileTaggedEvent.removed: array expected");
            message.removed = [];
            for (let i = 0; i < object.removed.length; ++i)
              message.removed[i] = String(object.removed[i]);
          }
          return message;
        };
        FileTaggedEvent.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults) {
            object.added = [];
            object.removed = [];
          }
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.added && message.added.length) {
            object.added = [];
            for (let j = 0; j < message.added.length; ++j)
              object.added[j] = message.added[j];
          }
          if (message.removed && message.removed.length) {
            object.removed = [];
            for (let j = 0; j < message.removed.length; ++j)
              object.removed[j] = message.removed[j];
          }
          return object;
        };
        FileTaggedEvent.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        FileTaggedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.FileTaggedEvent";
        };
        return FileTaggedEvent;
      })();
      v1.IndexUpdatedEvent = (function() {
        function IndexUpdatedEvent(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        IndexUpdatedEvent.prototype.filesTotal = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        IndexUpdatedEvent.prototype.tagsTotal = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        IndexUpdatedEvent.create = function create(properties) {
          return new IndexUpdatedEvent(properties);
        };
        IndexUpdatedEvent.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.filesTotal != null && Object.hasOwnProperty.call(message, "filesTotal"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).uint64(message.filesTotal);
          if (message.tagsTotal != null && Object.hasOwnProperty.call(message, "tagsTotal"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).uint64(message.tagsTotal);
          return writer;
        };
        IndexUpdatedEvent.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        IndexUpdatedEvent.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.IndexUpdatedEvent();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.filesTotal = reader.uint64();
                break;
              }
              case 2: {
                message.tagsTotal = reader.uint64();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        IndexUpdatedEvent.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        IndexUpdatedEvent.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.filesTotal != null && message.hasOwnProperty("filesTotal")) {
            if (!$util.isInteger(message.filesTotal) && !(message.filesTotal && $util.isInteger(message.filesTotal.low) && $util.isInteger(message.filesTotal.high)))
              return "filesTotal: integer|Long expected";
          }
          if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal")) {
            if (!$util.isInteger(message.tagsTotal) && !(message.tagsTotal && $util.isInteger(message.tagsTotal.low) && $util.isInteger(message.tagsTotal.high)))
              return "tagsTotal: integer|Long expected";
          }
          return null;
        };
        IndexUpdatedEvent.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.IndexUpdatedEvent)
            return object;
          let message = new $root.tilbo.ipc.v1.IndexUpdatedEvent();
          if (object.filesTotal != null) {
            if ($util.Long)
              (message.filesTotal = $util.Long.fromValue(object.filesTotal)).unsigned = true;
            else if (typeof object.filesTotal === "string")
              message.filesTotal = parseInt(object.filesTotal, 10);
            else if (typeof object.filesTotal === "number")
              message.filesTotal = object.filesTotal;
            else if (typeof object.filesTotal === "object")
              message.filesTotal = new $util.LongBits(object.filesTotal.low >>> 0, object.filesTotal.high >>> 0).toNumber(true);
          }
          if (object.tagsTotal != null) {
            if ($util.Long)
              (message.tagsTotal = $util.Long.fromValue(object.tagsTotal)).unsigned = true;
            else if (typeof object.tagsTotal === "string")
              message.tagsTotal = parseInt(object.tagsTotal, 10);
            else if (typeof object.tagsTotal === "number")
              message.tagsTotal = object.tagsTotal;
            else if (typeof object.tagsTotal === "object")
              message.tagsTotal = new $util.LongBits(object.tagsTotal.low >>> 0, object.tagsTotal.high >>> 0).toNumber(true);
          }
          return message;
        };
        IndexUpdatedEvent.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            if ($util.Long) {
              let long = new $util.Long(0, 0, true);
              object.filesTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.filesTotal = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, true);
              object.tagsTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.tagsTotal = options.longs === String ? "0" : 0;
          }
          if (message.filesTotal != null && message.hasOwnProperty("filesTotal"))
            if (typeof message.filesTotal === "number")
              object.filesTotal = options.longs === String ? String(message.filesTotal) : message.filesTotal;
            else
              object.filesTotal = options.longs === String ? $util.Long.prototype.toString.call(message.filesTotal) : options.longs === Number ? new $util.LongBits(message.filesTotal.low >>> 0, message.filesTotal.high >>> 0).toNumber(true) : message.filesTotal;
          if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
            if (typeof message.tagsTotal === "number")
              object.tagsTotal = options.longs === String ? String(message.tagsTotal) : message.tagsTotal;
            else
              object.tagsTotal = options.longs === String ? $util.Long.prototype.toString.call(message.tagsTotal) : options.longs === Number ? new $util.LongBits(message.tagsTotal.low >>> 0, message.tagsTotal.high >>> 0).toNumber(true) : message.tagsTotal;
          return object;
        };
        IndexUpdatedEvent.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        IndexUpdatedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.IndexUpdatedEvent";
        };
        return IndexUpdatedEvent;
      })();
      v1.DaemonStateChangedEvent = (function() {
        function DaemonStateChangedEvent(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        DaemonStateChangedEvent.prototype.state = "";
        DaemonStateChangedEvent.create = function create(properties) {
          return new DaemonStateChangedEvent(properties);
        };
        DaemonStateChangedEvent.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.state);
          return writer;
        };
        DaemonStateChangedEvent.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        DaemonStateChangedEvent.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DaemonStateChangedEvent();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.state = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        DaemonStateChangedEvent.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        DaemonStateChangedEvent.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.state != null && message.hasOwnProperty("state")) {
            if (!$util.isString(message.state))
              return "state: string expected";
          }
          return null;
        };
        DaemonStateChangedEvent.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.DaemonStateChangedEvent)
            return object;
          let message = new $root.tilbo.ipc.v1.DaemonStateChangedEvent();
          if (object.state != null)
            message.state = String(object.state);
          return message;
        };
        DaemonStateChangedEvent.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.state = "";
          if (message.state != null && message.hasOwnProperty("state"))
            object.state = message.state;
          return object;
        };
        DaemonStateChangedEvent.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        DaemonStateChangedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.DaemonStateChangedEvent";
        };
        return DaemonStateChangedEvent;
      })();
      v1.PinPlaceRequest = (function() {
        function PinPlaceRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        PinPlaceRequest.prototype.name = "";
        PinPlaceRequest.prototype.path = "";
        PinPlaceRequest.prototype.iconName = "";
        PinPlaceRequest.create = function create(properties) {
          return new PinPlaceRequest(properties);
        };
        PinPlaceRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.name);
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.path);
          if (message.iconName != null && Object.hasOwnProperty.call(message, "iconName"))
            writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(message.iconName);
          return writer;
        };
        PinPlaceRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        PinPlaceRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.PinPlaceRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.name = reader.string();
                break;
              }
              case 2: {
                message.path = reader.string();
                break;
              }
              case 3: {
                message.iconName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        PinPlaceRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        PinPlaceRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.name != null && message.hasOwnProperty("name")) {
            if (!$util.isString(message.name))
              return "name: string expected";
          }
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.iconName != null && message.hasOwnProperty("iconName")) {
            if (!$util.isString(message.iconName))
              return "iconName: string expected";
          }
          return null;
        };
        PinPlaceRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.PinPlaceRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.PinPlaceRequest();
          if (object.name != null)
            message.name = String(object.name);
          if (object.path != null)
            message.path = String(object.path);
          if (object.iconName != null)
            message.iconName = String(object.iconName);
          return message;
        };
        PinPlaceRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.name = "";
            object.path = "";
            object.iconName = "";
          }
          if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.iconName != null && message.hasOwnProperty("iconName"))
            object.iconName = message.iconName;
          return object;
        };
        PinPlaceRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        PinPlaceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.PinPlaceRequest";
        };
        return PinPlaceRequest;
      })();
      v1.PinPlaceResponse = (function() {
        function PinPlaceResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        PinPlaceResponse.create = function create(properties) {
          return new PinPlaceResponse(properties);
        };
        PinPlaceResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        PinPlaceResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        PinPlaceResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.PinPlaceResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        PinPlaceResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        PinPlaceResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        PinPlaceResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.PinPlaceResponse)
            return object;
          return new $root.tilbo.ipc.v1.PinPlaceResponse();
        };
        PinPlaceResponse.toObject = function toObject() {
          return {};
        };
        PinPlaceResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        PinPlaceResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.PinPlaceResponse";
        };
        return PinPlaceResponse;
      })();
      v1.UnpinPlaceRequest = (function() {
        function UnpinPlaceRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        UnpinPlaceRequest.prototype.path = "";
        UnpinPlaceRequest.create = function create(properties) {
          return new UnpinPlaceRequest(properties);
        };
        UnpinPlaceRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        UnpinPlaceRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        UnpinPlaceRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.UnpinPlaceRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        UnpinPlaceRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        UnpinPlaceRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        UnpinPlaceRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.UnpinPlaceRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.UnpinPlaceRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        UnpinPlaceRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        UnpinPlaceRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        UnpinPlaceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.UnpinPlaceRequest";
        };
        return UnpinPlaceRequest;
      })();
      v1.UnpinPlaceResponse = (function() {
        function UnpinPlaceResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        UnpinPlaceResponse.create = function create(properties) {
          return new UnpinPlaceResponse(properties);
        };
        UnpinPlaceResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        UnpinPlaceResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        UnpinPlaceResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.UnpinPlaceResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        UnpinPlaceResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        UnpinPlaceResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        UnpinPlaceResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.UnpinPlaceResponse)
            return object;
          return new $root.tilbo.ipc.v1.UnpinPlaceResponse();
        };
        UnpinPlaceResponse.toObject = function toObject() {
          return {};
        };
        UnpinPlaceResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        UnpinPlaceResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.UnpinPlaceResponse";
        };
        return UnpinPlaceResponse;
      })();
      v1.TrashFileRequest = (function() {
        function TrashFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        TrashFileRequest.prototype.path = "";
        TrashFileRequest.create = function create(properties) {
          return new TrashFileRequest(properties);
        };
        TrashFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        TrashFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        TrashFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TrashFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        TrashFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        TrashFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        TrashFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.TrashFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.TrashFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        TrashFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        TrashFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        TrashFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.TrashFileRequest";
        };
        return TrashFileRequest;
      })();
      v1.TrashFileResponse = (function() {
        function TrashFileResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        TrashFileResponse.create = function create(properties) {
          return new TrashFileResponse(properties);
        };
        TrashFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        TrashFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        TrashFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TrashFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        TrashFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        TrashFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        TrashFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.TrashFileResponse)
            return object;
          return new $root.tilbo.ipc.v1.TrashFileResponse();
        };
        TrashFileResponse.toObject = function toObject() {
          return {};
        };
        TrashFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        TrashFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.TrashFileResponse";
        };
        return TrashFileResponse;
      })();
      v1.ListTrashRequest = (function() {
        function ListTrashRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListTrashRequest.create = function create(properties) {
          return new ListTrashRequest(properties);
        };
        ListTrashRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        ListTrashRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListTrashRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTrashRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListTrashRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListTrashRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        ListTrashRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListTrashRequest)
            return object;
          return new $root.tilbo.ipc.v1.ListTrashRequest();
        };
        ListTrashRequest.toObject = function toObject() {
          return {};
        };
        ListTrashRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListTrashRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListTrashRequest";
        };
        return ListTrashRequest;
      })();
      v1.TrashEntry = (function() {
        function TrashEntry(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        TrashEntry.prototype.name = "";
        TrashEntry.prototype.originalPath = "";
        TrashEntry.prototype.deletionDate = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        TrashEntry.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        TrashEntry.create = function create(properties) {
          return new TrashEntry(properties);
        };
        TrashEntry.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.name);
          if (message.originalPath != null && Object.hasOwnProperty.call(message, "originalPath"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.originalPath);
          if (message.deletionDate != null && Object.hasOwnProperty.call(message, "deletionDate"))
            writer.uint32(
              /* id 3, wireType 0 =*/
              24
            ).int64(message.deletionDate);
          if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
            writer.uint32(
              /* id 4, wireType 0 =*/
              32
            ).int64(message.sizeBytes);
          return writer;
        };
        TrashEntry.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        TrashEntry.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TrashEntry();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.name = reader.string();
                break;
              }
              case 2: {
                message.originalPath = reader.string();
                break;
              }
              case 3: {
                message.deletionDate = reader.int64();
                break;
              }
              case 4: {
                message.sizeBytes = reader.int64();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        TrashEntry.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        TrashEntry.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.name != null && message.hasOwnProperty("name")) {
            if (!$util.isString(message.name))
              return "name: string expected";
          }
          if (message.originalPath != null && message.hasOwnProperty("originalPath")) {
            if (!$util.isString(message.originalPath))
              return "originalPath: string expected";
          }
          if (message.deletionDate != null && message.hasOwnProperty("deletionDate")) {
            if (!$util.isInteger(message.deletionDate) && !(message.deletionDate && $util.isInteger(message.deletionDate.low) && $util.isInteger(message.deletionDate.high)))
              return "deletionDate: integer|Long expected";
          }
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes")) {
            if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
              return "sizeBytes: integer|Long expected";
          }
          return null;
        };
        TrashEntry.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.TrashEntry)
            return object;
          let message = new $root.tilbo.ipc.v1.TrashEntry();
          if (object.name != null)
            message.name = String(object.name);
          if (object.originalPath != null)
            message.originalPath = String(object.originalPath);
          if (object.deletionDate != null) {
            if ($util.Long)
              (message.deletionDate = $util.Long.fromValue(object.deletionDate)).unsigned = false;
            else if (typeof object.deletionDate === "string")
              message.deletionDate = parseInt(object.deletionDate, 10);
            else if (typeof object.deletionDate === "number")
              message.deletionDate = object.deletionDate;
            else if (typeof object.deletionDate === "object")
              message.deletionDate = new $util.LongBits(object.deletionDate.low >>> 0, object.deletionDate.high >>> 0).toNumber();
          }
          if (object.sizeBytes != null) {
            if ($util.Long)
              (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
            else if (typeof object.sizeBytes === "string")
              message.sizeBytes = parseInt(object.sizeBytes, 10);
            else if (typeof object.sizeBytes === "number")
              message.sizeBytes = object.sizeBytes;
            else if (typeof object.sizeBytes === "object")
              message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
          }
          return message;
        };
        TrashEntry.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.name = "";
            object.originalPath = "";
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.deletionDate = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.deletionDate = options.longs === String ? "0" : 0;
            if ($util.Long) {
              let long = new $util.Long(0, 0, false);
              object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
              object.sizeBytes = options.longs === String ? "0" : 0;
          }
          if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
          if (message.originalPath != null && message.hasOwnProperty("originalPath"))
            object.originalPath = message.originalPath;
          if (message.deletionDate != null && message.hasOwnProperty("deletionDate"))
            if (typeof message.deletionDate === "number")
              object.deletionDate = options.longs === String ? String(message.deletionDate) : message.deletionDate;
            else
              object.deletionDate = options.longs === String ? $util.Long.prototype.toString.call(message.deletionDate) : options.longs === Number ? new $util.LongBits(message.deletionDate.low >>> 0, message.deletionDate.high >>> 0).toNumber() : message.deletionDate;
          if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
            if (typeof message.sizeBytes === "number")
              object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
            else
              object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
          return object;
        };
        TrashEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        TrashEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.TrashEntry";
        };
        return TrashEntry;
      })();
      v1.ListTrashResponse = (function() {
        function ListTrashResponse(properties) {
          this.entries = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListTrashResponse.prototype.entries = $util.emptyArray;
        ListTrashResponse.create = function create(properties) {
          return new ListTrashResponse(properties);
        };
        ListTrashResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.entries != null && message.entries.length)
            for (let i = 0; i < message.entries.length; ++i)
              $root.tilbo.ipc.v1.TrashEntry.encode(message.entries[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        ListTrashResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListTrashResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTrashResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.entries && message.entries.length))
                  message.entries = [];
                message.entries.push($root.tilbo.ipc.v1.TrashEntry.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListTrashResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListTrashResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.entries != null && message.hasOwnProperty("entries")) {
            if (!Array.isArray(message.entries))
              return "entries: array expected";
            for (let i = 0; i < message.entries.length; ++i) {
              let error = $root.tilbo.ipc.v1.TrashEntry.verify(message.entries[i]);
              if (error)
                return "entries." + error;
            }
          }
          return null;
        };
        ListTrashResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListTrashResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ListTrashResponse();
          if (object.entries) {
            if (!Array.isArray(object.entries))
              throw TypeError(".tilbo.ipc.v1.ListTrashResponse.entries: array expected");
            message.entries = [];
            for (let i = 0; i < object.entries.length; ++i) {
              if (typeof object.entries[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.ListTrashResponse.entries: object expected");
              message.entries[i] = $root.tilbo.ipc.v1.TrashEntry.fromObject(object.entries[i]);
            }
          }
          return message;
        };
        ListTrashResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.entries = [];
          if (message.entries && message.entries.length) {
            object.entries = [];
            for (let j = 0; j < message.entries.length; ++j)
              object.entries[j] = $root.tilbo.ipc.v1.TrashEntry.toObject(message.entries[j], options);
          }
          return object;
        };
        ListTrashResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListTrashResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListTrashResponse";
        };
        return ListTrashResponse;
      })();
      v1.RestoreTrashRequest = (function() {
        function RestoreTrashRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RestoreTrashRequest.prototype.trashName = "";
        RestoreTrashRequest.create = function create(properties) {
          return new RestoreTrashRequest(properties);
        };
        RestoreTrashRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.trashName != null && Object.hasOwnProperty.call(message, "trashName"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.trashName);
          return writer;
        };
        RestoreTrashRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RestoreTrashRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RestoreTrashRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.trashName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RestoreTrashRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RestoreTrashRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.trashName != null && message.hasOwnProperty("trashName")) {
            if (!$util.isString(message.trashName))
              return "trashName: string expected";
          }
          return null;
        };
        RestoreTrashRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RestoreTrashRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.RestoreTrashRequest();
          if (object.trashName != null)
            message.trashName = String(object.trashName);
          return message;
        };
        RestoreTrashRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.trashName = "";
          if (message.trashName != null && message.hasOwnProperty("trashName"))
            object.trashName = message.trashName;
          return object;
        };
        RestoreTrashRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RestoreTrashRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RestoreTrashRequest";
        };
        return RestoreTrashRequest;
      })();
      v1.RestoreTrashResponse = (function() {
        function RestoreTrashResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RestoreTrashResponse.create = function create(properties) {
          return new RestoreTrashResponse(properties);
        };
        RestoreTrashResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        RestoreTrashResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RestoreTrashResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RestoreTrashResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RestoreTrashResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RestoreTrashResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        RestoreTrashResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RestoreTrashResponse)
            return object;
          return new $root.tilbo.ipc.v1.RestoreTrashResponse();
        };
        RestoreTrashResponse.toObject = function toObject() {
          return {};
        };
        RestoreTrashResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RestoreTrashResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RestoreTrashResponse";
        };
        return RestoreTrashResponse;
      })();
      v1.EmptyTrashRequest = (function() {
        function EmptyTrashRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        EmptyTrashRequest.create = function create(properties) {
          return new EmptyTrashRequest(properties);
        };
        EmptyTrashRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        EmptyTrashRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        EmptyTrashRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.EmptyTrashRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        EmptyTrashRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        EmptyTrashRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        EmptyTrashRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.EmptyTrashRequest)
            return object;
          return new $root.tilbo.ipc.v1.EmptyTrashRequest();
        };
        EmptyTrashRequest.toObject = function toObject() {
          return {};
        };
        EmptyTrashRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        EmptyTrashRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.EmptyTrashRequest";
        };
        return EmptyTrashRequest;
      })();
      v1.EmptyTrashResponse = (function() {
        function EmptyTrashResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        EmptyTrashResponse.create = function create(properties) {
          return new EmptyTrashResponse(properties);
        };
        EmptyTrashResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        EmptyTrashResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        EmptyTrashResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.EmptyTrashResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        EmptyTrashResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        EmptyTrashResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        EmptyTrashResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.EmptyTrashResponse)
            return object;
          return new $root.tilbo.ipc.v1.EmptyTrashResponse();
        };
        EmptyTrashResponse.toObject = function toObject() {
          return {};
        };
        EmptyTrashResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        EmptyTrashResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.EmptyTrashResponse";
        };
        return EmptyTrashResponse;
      })();
      v1.AppEntry = (function() {
        function AppEntry(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        AppEntry.prototype.id = "";
        AppEntry.prototype.name = "";
        AppEntry.prototype.iconName = "";
        AppEntry.create = function create(properties) {
          return new AppEntry(properties);
        };
        AppEntry.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.id);
          if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.name);
          if (message.iconName != null && Object.hasOwnProperty.call(message, "iconName"))
            writer.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(message.iconName);
          return writer;
        };
        AppEntry.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        AppEntry.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.AppEntry();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.id = reader.string();
                break;
              }
              case 2: {
                message.name = reader.string();
                break;
              }
              case 3: {
                message.iconName = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        AppEntry.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        AppEntry.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.id != null && message.hasOwnProperty("id")) {
            if (!$util.isString(message.id))
              return "id: string expected";
          }
          if (message.name != null && message.hasOwnProperty("name")) {
            if (!$util.isString(message.name))
              return "name: string expected";
          }
          if (message.iconName != null && message.hasOwnProperty("iconName")) {
            if (!$util.isString(message.iconName))
              return "iconName: string expected";
          }
          return null;
        };
        AppEntry.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.AppEntry)
            return object;
          let message = new $root.tilbo.ipc.v1.AppEntry();
          if (object.id != null)
            message.id = String(object.id);
          if (object.name != null)
            message.name = String(object.name);
          if (object.iconName != null)
            message.iconName = String(object.iconName);
          return message;
        };
        AppEntry.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.id = "";
            object.name = "";
            object.iconName = "";
          }
          if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
          if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
          if (message.iconName != null && message.hasOwnProperty("iconName"))
            object.iconName = message.iconName;
          return object;
        };
        AppEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        AppEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.AppEntry";
        };
        return AppEntry;
      })();
      v1.ListAppsForFileRequest = (function() {
        function ListAppsForFileRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListAppsForFileRequest.prototype.path = "";
        ListAppsForFileRequest.create = function create(properties) {
          return new ListAppsForFileRequest(properties);
        };
        ListAppsForFileRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        ListAppsForFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListAppsForFileRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListAppsForFileRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListAppsForFileRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListAppsForFileRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        ListAppsForFileRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListAppsForFileRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.ListAppsForFileRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        ListAppsForFileRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        ListAppsForFileRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListAppsForFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListAppsForFileRequest";
        };
        return ListAppsForFileRequest;
      })();
      v1.ListAppsForFileResponse = (function() {
        function ListAppsForFileResponse(properties) {
          this.apps = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ListAppsForFileResponse.prototype.apps = $util.emptyArray;
        ListAppsForFileResponse.create = function create(properties) {
          return new ListAppsForFileResponse(properties);
        };
        ListAppsForFileResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.apps != null && message.apps.length)
            for (let i = 0; i < message.apps.length; ++i)
              $root.tilbo.ipc.v1.AppEntry.encode(message.apps[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        ListAppsForFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ListAppsForFileResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListAppsForFileResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.apps && message.apps.length))
                  message.apps = [];
                message.apps.push($root.tilbo.ipc.v1.AppEntry.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ListAppsForFileResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ListAppsForFileResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.apps != null && message.hasOwnProperty("apps")) {
            if (!Array.isArray(message.apps))
              return "apps: array expected";
            for (let i = 0; i < message.apps.length; ++i) {
              let error = $root.tilbo.ipc.v1.AppEntry.verify(message.apps[i]);
              if (error)
                return "apps." + error;
            }
          }
          return null;
        };
        ListAppsForFileResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ListAppsForFileResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.ListAppsForFileResponse();
          if (object.apps) {
            if (!Array.isArray(object.apps))
              throw TypeError(".tilbo.ipc.v1.ListAppsForFileResponse.apps: array expected");
            message.apps = [];
            for (let i = 0; i < object.apps.length; ++i) {
              if (typeof object.apps[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.ListAppsForFileResponse.apps: object expected");
              message.apps[i] = $root.tilbo.ipc.v1.AppEntry.fromObject(object.apps[i]);
            }
          }
          return message;
        };
        ListAppsForFileResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.apps = [];
          if (message.apps && message.apps.length) {
            object.apps = [];
            for (let j = 0; j < message.apps.length; ++j)
              object.apps[j] = $root.tilbo.ipc.v1.AppEntry.toObject(message.apps[j], options);
          }
          return object;
        };
        ListAppsForFileResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ListAppsForFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ListAppsForFileResponse";
        };
        return ListAppsForFileResponse;
      })();
      v1.OpenWithAppRequest = (function() {
        function OpenWithAppRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        OpenWithAppRequest.prototype.path = "";
        OpenWithAppRequest.prototype.appId = "";
        OpenWithAppRequest.create = function create(properties) {
          return new OpenWithAppRequest(properties);
        };
        OpenWithAppRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.appId != null && Object.hasOwnProperty.call(message, "appId"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.appId);
          return writer;
        };
        OpenWithAppRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        OpenWithAppRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.OpenWithAppRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.appId = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        OpenWithAppRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        OpenWithAppRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.appId != null && message.hasOwnProperty("appId")) {
            if (!$util.isString(message.appId))
              return "appId: string expected";
          }
          return null;
        };
        OpenWithAppRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.OpenWithAppRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.OpenWithAppRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.appId != null)
            message.appId = String(object.appId);
          return message;
        };
        OpenWithAppRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.appId = "";
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.appId != null && message.hasOwnProperty("appId"))
            object.appId = message.appId;
          return object;
        };
        OpenWithAppRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        OpenWithAppRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.OpenWithAppRequest";
        };
        return OpenWithAppRequest;
      })();
      v1.OpenWithAppResponse = (function() {
        function OpenWithAppResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        OpenWithAppResponse.create = function create(properties) {
          return new OpenWithAppResponse(properties);
        };
        OpenWithAppResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        OpenWithAppResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        OpenWithAppResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.OpenWithAppResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        OpenWithAppResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        OpenWithAppResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        OpenWithAppResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.OpenWithAppResponse)
            return object;
          return new $root.tilbo.ipc.v1.OpenWithAppResponse();
        };
        OpenWithAppResponse.toObject = function toObject() {
          return {};
        };
        OpenWithAppResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        OpenWithAppResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.OpenWithAppResponse";
        };
        return OpenWithAppResponse;
      })();
      v1.GetBrowserConfigRequest = (function() {
        function GetBrowserConfigRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetBrowserConfigRequest.create = function create(properties) {
          return new GetBrowserConfigRequest(properties);
        };
        GetBrowserConfigRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        GetBrowserConfigRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetBrowserConfigRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetBrowserConfigRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetBrowserConfigRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetBrowserConfigRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        GetBrowserConfigRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetBrowserConfigRequest)
            return object;
          return new $root.tilbo.ipc.v1.GetBrowserConfigRequest();
        };
        GetBrowserConfigRequest.toObject = function toObject() {
          return {};
        };
        GetBrowserConfigRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetBrowserConfigRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetBrowserConfigRequest";
        };
        return GetBrowserConfigRequest;
      })();
      v1.GetBrowserConfigResponse = (function() {
        function GetBrowserConfigResponse(properties) {
          this.keybindings = {};
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetBrowserConfigResponse.prototype.keybindings = $util.emptyObject;
        GetBrowserConfigResponse.prototype.useTrash = false;
        GetBrowserConfigResponse.create = function create(properties) {
          return new GetBrowserConfigResponse(properties);
        };
        GetBrowserConfigResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.keybindings != null && Object.hasOwnProperty.call(message, "keybindings"))
            for (let keys = Object.keys(message.keybindings), i = 0; i < keys.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork().uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(keys[i]).uint32(
                /* id 2, wireType 2 =*/
                18
              ).string(message.keybindings[keys[i]]).ldelim();
          if (message.useTrash != null && Object.hasOwnProperty.call(message, "useTrash"))
            writer.uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(message.useTrash);
          return writer;
        };
        GetBrowserConfigResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetBrowserConfigResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetBrowserConfigResponse(), key, value;
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (message.keybindings === $util.emptyObject)
                  message.keybindings = {};
                let end2 = reader.uint32() + reader.pos;
                key = "";
                value = "";
                while (reader.pos < end2) {
                  let tag2 = reader.uint32();
                  switch (tag2 >>> 3) {
                    case 1:
                      key = reader.string();
                      break;
                    case 2:
                      value = reader.string();
                      break;
                    default:
                      reader.skipType(tag2 & 7);
                      break;
                  }
                }
                message.keybindings[key] = value;
                break;
              }
              case 2: {
                message.useTrash = reader.bool();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetBrowserConfigResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetBrowserConfigResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.keybindings != null && message.hasOwnProperty("keybindings")) {
            if (!$util.isObject(message.keybindings))
              return "keybindings: object expected";
            let key = Object.keys(message.keybindings);
            for (let i = 0; i < key.length; ++i)
              if (!$util.isString(message.keybindings[key[i]]))
                return "keybindings: string{k:string} expected";
          }
          if (message.useTrash != null && message.hasOwnProperty("useTrash")) {
            if (typeof message.useTrash !== "boolean")
              return "useTrash: boolean expected";
          }
          return null;
        };
        GetBrowserConfigResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetBrowserConfigResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.GetBrowserConfigResponse();
          if (object.keybindings) {
            if (typeof object.keybindings !== "object")
              throw TypeError(".tilbo.ipc.v1.GetBrowserConfigResponse.keybindings: object expected");
            message.keybindings = {};
            for (let keys = Object.keys(object.keybindings), i = 0; i < keys.length; ++i)
              message.keybindings[keys[i]] = String(object.keybindings[keys[i]]);
          }
          if (object.useTrash != null)
            message.useTrash = Boolean(object.useTrash);
          return message;
        };
        GetBrowserConfigResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.objects || options.defaults)
            object.keybindings = {};
          if (options.defaults)
            object.useTrash = false;
          let keys2;
          if (message.keybindings && (keys2 = Object.keys(message.keybindings)).length) {
            object.keybindings = {};
            for (let j = 0; j < keys2.length; ++j)
              object.keybindings[keys2[j]] = message.keybindings[keys2[j]];
          }
          if (message.useTrash != null && message.hasOwnProperty("useTrash"))
            object.useTrash = message.useTrash;
          return object;
        };
        GetBrowserConfigResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetBrowserConfigResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetBrowserConfigResponse";
        };
        return GetBrowserConfigResponse;
      })();
      v1.GetFileBadgesRequest = (function() {
        function GetFileBadgesRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetFileBadgesRequest.prototype.path = "";
        GetFileBadgesRequest.create = function create(properties) {
          return new GetFileBadgesRequest(properties);
        };
        GetFileBadgesRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        GetFileBadgesRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetFileBadgesRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetFileBadgesRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetFileBadgesRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetFileBadgesRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        GetFileBadgesRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetFileBadgesRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.GetFileBadgesRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        GetFileBadgesRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        GetFileBadgesRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetFileBadgesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetFileBadgesRequest";
        };
        return GetFileBadgesRequest;
      })();
      v1.GetFileBadgesResponse = (function() {
        function GetFileBadgesResponse(properties) {
          this.badges = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetFileBadgesResponse.prototype.badges = $util.emptyArray;
        GetFileBadgesResponse.create = function create(properties) {
          return new GetFileBadgesResponse(properties);
        };
        GetFileBadgesResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.badges != null && message.badges.length)
            for (let i = 0; i < message.badges.length; ++i)
              writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).string(message.badges[i]);
          return writer;
        };
        GetFileBadgesResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetFileBadgesResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetFileBadgesResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.badges && message.badges.length))
                  message.badges = [];
                message.badges.push(reader.string());
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetFileBadgesResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetFileBadgesResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.badges != null && message.hasOwnProperty("badges")) {
            if (!Array.isArray(message.badges))
              return "badges: array expected";
            for (let i = 0; i < message.badges.length; ++i)
              if (!$util.isString(message.badges[i]))
                return "badges: string[] expected";
          }
          return null;
        };
        GetFileBadgesResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetFileBadgesResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.GetFileBadgesResponse();
          if (object.badges) {
            if (!Array.isArray(object.badges))
              throw TypeError(".tilbo.ipc.v1.GetFileBadgesResponse.badges: array expected");
            message.badges = [];
            for (let i = 0; i < object.badges.length; ++i)
              message.badges[i] = String(object.badges[i]);
          }
          return message;
        };
        GetFileBadgesResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.badges = [];
          if (message.badges && message.badges.length) {
            object.badges = [];
            for (let j = 0; j < message.badges.length; ++j)
              object.badges[j] = message.badges[j];
          }
          return object;
        };
        GetFileBadgesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetFileBadgesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetFileBadgesResponse";
        };
        return GetFileBadgesResponse;
      })();
      v1.FileAction = (function() {
        function FileAction(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        FileAction.prototype.id = "";
        FileAction.prototype.label = "";
        FileAction.create = function create(properties) {
          return new FileAction(properties);
        };
        FileAction.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.id);
          if (message.label != null && Object.hasOwnProperty.call(message, "label"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.label);
          return writer;
        };
        FileAction.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        FileAction.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileAction();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.id = reader.string();
                break;
              }
              case 2: {
                message.label = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        FileAction.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        FileAction.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.id != null && message.hasOwnProperty("id")) {
            if (!$util.isString(message.id))
              return "id: string expected";
          }
          if (message.label != null && message.hasOwnProperty("label")) {
            if (!$util.isString(message.label))
              return "label: string expected";
          }
          return null;
        };
        FileAction.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.FileAction)
            return object;
          let message = new $root.tilbo.ipc.v1.FileAction();
          if (object.id != null)
            message.id = String(object.id);
          if (object.label != null)
            message.label = String(object.label);
          return message;
        };
        FileAction.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.id = "";
            object.label = "";
          }
          if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
          if (message.label != null && message.hasOwnProperty("label"))
            object.label = message.label;
          return object;
        };
        FileAction.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        FileAction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.FileAction";
        };
        return FileAction;
      })();
      v1.GetFileActionsRequest = (function() {
        function GetFileActionsRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetFileActionsRequest.prototype.path = "";
        GetFileActionsRequest.create = function create(properties) {
          return new GetFileActionsRequest(properties);
        };
        GetFileActionsRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        GetFileActionsRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetFileActionsRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetFileActionsRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetFileActionsRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetFileActionsRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        GetFileActionsRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetFileActionsRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.GetFileActionsRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        GetFileActionsRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        GetFileActionsRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetFileActionsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetFileActionsRequest";
        };
        return GetFileActionsRequest;
      })();
      v1.GetFileActionsResponse = (function() {
        function GetFileActionsResponse(properties) {
          this.actions = [];
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        GetFileActionsResponse.prototype.actions = $util.emptyArray;
        GetFileActionsResponse.create = function create(properties) {
          return new GetFileActionsResponse(properties);
        };
        GetFileActionsResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.actions != null && message.actions.length)
            for (let i = 0; i < message.actions.length; ++i)
              $root.tilbo.ipc.v1.FileAction.encode(message.actions[i], writer.uint32(
                /* id 1, wireType 2 =*/
                10
              ).fork()).ldelim();
          return writer;
        };
        GetFileActionsResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        GetFileActionsResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GetFileActionsResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                if (!(message.actions && message.actions.length))
                  message.actions = [];
                message.actions.push($root.tilbo.ipc.v1.FileAction.decode(reader, reader.uint32()));
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        GetFileActionsResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        GetFileActionsResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.actions != null && message.hasOwnProperty("actions")) {
            if (!Array.isArray(message.actions))
              return "actions: array expected";
            for (let i = 0; i < message.actions.length; ++i) {
              let error = $root.tilbo.ipc.v1.FileAction.verify(message.actions[i]);
              if (error)
                return "actions." + error;
            }
          }
          return null;
        };
        GetFileActionsResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.GetFileActionsResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.GetFileActionsResponse();
          if (object.actions) {
            if (!Array.isArray(object.actions))
              throw TypeError(".tilbo.ipc.v1.GetFileActionsResponse.actions: array expected");
            message.actions = [];
            for (let i = 0; i < object.actions.length; ++i) {
              if (typeof object.actions[i] !== "object")
                throw TypeError(".tilbo.ipc.v1.GetFileActionsResponse.actions: object expected");
              message.actions[i] = $root.tilbo.ipc.v1.FileAction.fromObject(object.actions[i]);
            }
          }
          return message;
        };
        GetFileActionsResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.arrays || options.defaults)
            object.actions = [];
          if (message.actions && message.actions.length) {
            object.actions = [];
            for (let j = 0; j < message.actions.length; ++j)
              object.actions[j] = $root.tilbo.ipc.v1.FileAction.toObject(message.actions[j], options);
          }
          return object;
        };
        GetFileActionsResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        GetFileActionsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.GetFileActionsResponse";
        };
        return GetFileActionsResponse;
      })();
      v1.RunFileActionRequest = (function() {
        function RunFileActionRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RunFileActionRequest.prototype.path = "";
        RunFileActionRequest.prototype.actionId = "";
        RunFileActionRequest.create = function create(properties) {
          return new RunFileActionRequest(properties);
        };
        RunFileActionRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          if (message.actionId != null && Object.hasOwnProperty.call(message, "actionId"))
            writer.uint32(
              /* id 2, wireType 2 =*/
              18
            ).string(message.actionId);
          return writer;
        };
        RunFileActionRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RunFileActionRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RunFileActionRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              case 2: {
                message.actionId = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RunFileActionRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RunFileActionRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          if (message.actionId != null && message.hasOwnProperty("actionId")) {
            if (!$util.isString(message.actionId))
              return "actionId: string expected";
          }
          return null;
        };
        RunFileActionRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RunFileActionRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.RunFileActionRequest();
          if (object.path != null)
            message.path = String(object.path);
          if (object.actionId != null)
            message.actionId = String(object.actionId);
          return message;
        };
        RunFileActionRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults) {
            object.path = "";
            object.actionId = "";
          }
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          if (message.actionId != null && message.hasOwnProperty("actionId"))
            object.actionId = message.actionId;
          return object;
        };
        RunFileActionRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RunFileActionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RunFileActionRequest";
        };
        return RunFileActionRequest;
      })();
      v1.RunFileActionResponse = (function() {
        function RunFileActionResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        RunFileActionResponse.create = function create(properties) {
          return new RunFileActionResponse(properties);
        };
        RunFileActionResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          return writer;
        };
        RunFileActionResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        RunFileActionResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RunFileActionResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        RunFileActionResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        RunFileActionResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          return null;
        };
        RunFileActionResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.RunFileActionResponse)
            return object;
          return new $root.tilbo.ipc.v1.RunFileActionResponse();
        };
        RunFileActionResponse.toObject = function toObject() {
          return {};
        };
        RunFileActionResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        RunFileActionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.RunFileActionResponse";
        };
        return RunFileActionResponse;
      })();
      v1.LaunchGUIRequest = (function() {
        function LaunchGUIRequest(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        LaunchGUIRequest.prototype.path = "";
        LaunchGUIRequest.create = function create(properties) {
          return new LaunchGUIRequest(properties);
        };
        LaunchGUIRequest.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        LaunchGUIRequest.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        LaunchGUIRequest.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.LaunchGUIRequest();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        LaunchGUIRequest.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        LaunchGUIRequest.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        LaunchGUIRequest.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.LaunchGUIRequest)
            return object;
          let message = new $root.tilbo.ipc.v1.LaunchGUIRequest();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        LaunchGUIRequest.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        LaunchGUIRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        LaunchGUIRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.LaunchGUIRequest";
        };
        return LaunchGUIRequest;
      })();
      v1.LaunchGUIResponse = (function() {
        function LaunchGUIResponse(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        LaunchGUIResponse.prototype.alreadyRunning = false;
        LaunchGUIResponse.create = function create(properties) {
          return new LaunchGUIResponse(properties);
        };
        LaunchGUIResponse.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.alreadyRunning != null && Object.hasOwnProperty.call(message, "alreadyRunning"))
            writer.uint32(
              /* id 1, wireType 0 =*/
              8
            ).bool(message.alreadyRunning);
          return writer;
        };
        LaunchGUIResponse.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        LaunchGUIResponse.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.LaunchGUIResponse();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.alreadyRunning = reader.bool();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        LaunchGUIResponse.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        LaunchGUIResponse.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.alreadyRunning != null && message.hasOwnProperty("alreadyRunning")) {
            if (typeof message.alreadyRunning !== "boolean")
              return "alreadyRunning: boolean expected";
          }
          return null;
        };
        LaunchGUIResponse.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.LaunchGUIResponse)
            return object;
          let message = new $root.tilbo.ipc.v1.LaunchGUIResponse();
          if (object.alreadyRunning != null)
            message.alreadyRunning = Boolean(object.alreadyRunning);
          return message;
        };
        LaunchGUIResponse.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.alreadyRunning = false;
          if (message.alreadyRunning != null && message.hasOwnProperty("alreadyRunning"))
            object.alreadyRunning = message.alreadyRunning;
          return object;
        };
        LaunchGUIResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        LaunchGUIResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.LaunchGUIResponse";
        };
        return LaunchGUIResponse;
      })();
      v1.ShowWindowEvent = (function() {
        function ShowWindowEvent(properties) {
          if (properties) {
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
              if (properties[keys[i]] != null)
                this[keys[i]] = properties[keys[i]];
          }
        }
        ShowWindowEvent.prototype.path = "";
        ShowWindowEvent.create = function create(properties) {
          return new ShowWindowEvent(properties);
        };
        ShowWindowEvent.encode = function encode(message, writer) {
          if (!writer)
            writer = $Writer.create();
          if (message.path != null && Object.hasOwnProperty.call(message, "path"))
            writer.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(message.path);
          return writer;
        };
        ShowWindowEvent.encodeDelimited = function encodeDelimited(message, writer) {
          return this.encode(message, writer).ldelim();
        };
        ShowWindowEvent.decode = function decode(reader, length, error) {
          if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
          let end = length === void 0 ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ShowWindowEvent();
          while (reader.pos < end) {
            let tag = reader.uint32();
            if (tag === error)
              break;
            switch (tag >>> 3) {
              case 1: {
                message.path = reader.string();
                break;
              }
              default:
                reader.skipType(tag & 7);
                break;
            }
          }
          return message;
        };
        ShowWindowEvent.decodeDelimited = function decodeDelimited(reader) {
          if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
          return this.decode(reader, reader.uint32());
        };
        ShowWindowEvent.verify = function verify(message) {
          if (typeof message !== "object" || message === null)
            return "object expected";
          if (message.path != null && message.hasOwnProperty("path")) {
            if (!$util.isString(message.path))
              return "path: string expected";
          }
          return null;
        };
        ShowWindowEvent.fromObject = function fromObject(object) {
          if (object instanceof $root.tilbo.ipc.v1.ShowWindowEvent)
            return object;
          let message = new $root.tilbo.ipc.v1.ShowWindowEvent();
          if (object.path != null)
            message.path = String(object.path);
          return message;
        };
        ShowWindowEvent.toObject = function toObject(message, options) {
          if (!options)
            options = {};
          let object = {};
          if (options.defaults)
            object.path = "";
          if (message.path != null && message.hasOwnProperty("path"))
            object.path = message.path;
          return object;
        };
        ShowWindowEvent.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ShowWindowEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
          if (typeUrlPrefix === void 0) {
            typeUrlPrefix = "type.googleapis.com";
          }
          return typeUrlPrefix + "/tilbo.ipc.v1.ShowWindowEvent";
        };
        return ShowWindowEvent;
      })();
      return v1;
    })();
    return ipc;
  })();
  return tilbo2;
})();
export {
  $root as default,
  tilbo
};
