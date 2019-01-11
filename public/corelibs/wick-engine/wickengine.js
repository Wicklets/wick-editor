/*Wick Engine https://github.com/Wicklets/wick-engine*/

/**
* Tween.js - Licensed under the MIT license
* https://github.com/tweenjs/tween.js
* ----------------------------------------------
*
* See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
* Thank you all, you're awesome!
*/
var TWEEN = TWEEN || function () {
  var _tweens = [];
  return {
    getAll: function () {
      return _tweens;
    },
    removeAll: function () {
      _tweens = [];
    },
    add: function (tween) {
      _tweens.push(tween);
    },
    remove: function (tween) {
      var i = _tweens.indexOf(tween);

      if (i !== -1) {
        _tweens.splice(i, 1);
      }
    },
    update: function (time, preserve) {
      if (_tweens.length === 0) {
        return false;
      }

      var i = 0;
      time = time !== undefined ? time : TWEEN.now();

      while (i < _tweens.length) {
        if (_tweens[i].update(time) || preserve) {
          i++;
        } else {
          _tweens.splice(i, 1);
        }
      }

      return true;
    }
  };
}(); // Include a performance.now polyfill.
// In node.js, use process.hrtime.


if (typeof window === 'undefined' && typeof process !== 'undefined') {
  TWEEN.now = function () {
    var time = process.hrtime(); // Convert [seconds, nanoseconds] to milliseconds.

    return time[0] * 1000 + time[1] / 1000000;
  };
} // In a browser, use window.performance.now if it is available.
else if (typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    TWEEN.now = window.performance.now.bind(window.performance);
  } // Use Date.now if it is available.
  else if (Date.now !== undefined) {
      TWEEN.now = Date.now;
    } // Otherwise, use 'new Date().getTime()'.
    else {
        TWEEN.now = function () {
          return new Date().getTime();
        };
      }

TWEEN.Tween = function (object) {
  var _object = object;
  var _valuesStart = {};
  var _valuesEnd = {};
  var _valuesStartRepeat = {};
  var _duration = 1000;
  var _repeat = 0;

  var _repeatDelayTime;

  var _yoyo = false;
  var _isPlaying = false;
  var _reversed = false;
  var _delayTime = 0;
  var _startTime = null;
  var _easingFunction = TWEEN.Easing.Linear.None;
  var _interpolationFunction = TWEEN.Interpolation.Linear;
  var _chainedTweens = [];
  var _onStartCallback = null;
  var _onStartCallbackFired = false;
  var _onUpdateCallback = null;
  var _onCompleteCallback = null;
  var _onStopCallback = null;

  this.to = function (properties, duration) {
    _valuesEnd = properties;

    if (duration !== undefined) {
      _duration = duration;
    }

    return this;
  };

  this.start = function (time) {
    TWEEN.add(this);
    _isPlaying = true;
    _onStartCallbackFired = false;
    _startTime = time !== undefined ? time : TWEEN.now();
    _startTime += _delayTime;

    for (var property in _valuesEnd) {
      // Check if an Array was provided as property value
      if (_valuesEnd[property] instanceof Array) {
        if (_valuesEnd[property].length === 0) {
          continue;
        } // Create a local copy of the Array with the start value at the front


        _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);
      } // If `to()` specifies a property that doesn't exist in the source object,
      // we should not set that property in the object


      if (_object[property] === undefined) {
        continue;
      } // Save the starting value.


      _valuesStart[property] = _object[property];

      if (_valuesStart[property] instanceof Array === false) {
        _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
      }

      _valuesStartRepeat[property] = _valuesStart[property] || 0;
    }

    return this;
  };

  this.stop = function () {
    if (!_isPlaying) {
      return this;
    }

    TWEEN.remove(this);
    _isPlaying = false;

    if (_onStopCallback !== null) {
      _onStopCallback.call(_object, _object);
    }

    this.stopChainedTweens();
    return this;
  };

  this.end = function () {
    this.update(_startTime + _duration);
    return this;
  };

  this.stopChainedTweens = function () {
    for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
      _chainedTweens[i].stop();
    }
  };

  this.delay = function (amount) {
    _delayTime = amount;
    return this;
  };

  this.repeat = function (times) {
    _repeat = times;
    return this;
  };

  this.repeatDelay = function (amount) {
    _repeatDelayTime = amount;
    return this;
  };

  this.yoyo = function (yoyo) {
    _yoyo = yoyo;
    return this;
  };

  this.easing = function (easing) {
    _easingFunction = easing;
    return this;
  };

  this.interpolation = function (interpolation) {
    _interpolationFunction = interpolation;
    return this;
  };

  this.chain = function () {
    _chainedTweens = arguments;
    return this;
  };

  this.onStart = function (callback) {
    _onStartCallback = callback;
    return this;
  };

  this.onUpdate = function (callback) {
    _onUpdateCallback = callback;
    return this;
  };

  this.onComplete = function (callback) {
    _onCompleteCallback = callback;
    return this;
  };

  this.onStop = function (callback) {
    _onStopCallback = callback;
    return this;
  };

  this.update = function (time) {
    var property;
    var elapsed;
    var value;

    if (time < _startTime) {
      return true;
    }

    if (_onStartCallbackFired === false) {
      if (_onStartCallback !== null) {
        _onStartCallback.call(_object, _object);
      }

      _onStartCallbackFired = true;
    }

    elapsed = (time - _startTime) / _duration;
    elapsed = elapsed > 1 ? 1 : elapsed;
    value = _easingFunction(elapsed);

    for (property in _valuesEnd) {
      // Don't update properties that do not exist in the source object
      if (_valuesStart[property] === undefined) {
        continue;
      }

      var start = _valuesStart[property] || 0;
      var end = _valuesEnd[property];

      if (end instanceof Array) {
        _object[property] = _interpolationFunction(end, value);
      } else {
        // Parses relative end values with start as base (e.g.: +10, -3)
        if (typeof end === 'string') {
          if (end.charAt(0) === '+' || end.charAt(0) === '-') {
            end = start + parseFloat(end);
          } else {
            end = parseFloat(end);
          }
        } // Protect against non numeric properties.


        if (typeof end === 'number') {
          _object[property] = start + (end - start) * value;
        }
      }
    }

    if (_onUpdateCallback !== null) {
      _onUpdateCallback.call(_object, value);
    }

    if (elapsed === 1) {
      if (_repeat > 0) {
        if (isFinite(_repeat)) {
          _repeat--;
        } // Reassign starting values, restart by making startTime = now


        for (property in _valuesStartRepeat) {
          if (typeof _valuesEnd[property] === 'string') {
            _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
          }

          if (_yoyo) {
            var tmp = _valuesStartRepeat[property];
            _valuesStartRepeat[property] = _valuesEnd[property];
            _valuesEnd[property] = tmp;
          }

          _valuesStart[property] = _valuesStartRepeat[property];
        }

        if (_yoyo) {
          _reversed = !_reversed;
        }

        if (_repeatDelayTime !== undefined) {
          _startTime = time + _repeatDelayTime;
        } else {
          _startTime = time + _delayTime;
        }

        return true;
      } else {
        if (_onCompleteCallback !== null) {
          _onCompleteCallback.call(_object, _object);
        }

        for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
          // Make the chained tweens start exactly at the time they should,
          // even if the `update()` method was called way past the duration of the tween
          _chainedTweens[i].start(_startTime + _duration);
        }

        return false;
      }
    }

    return true;
  };
};

TWEEN.Easing = {
  Linear: {
    None: function (k) {
      return k;
    }
  },
  Quadratic: {
    In: function (k) {
      return k * k;
    },
    Out: function (k) {
      return k * (2 - k);
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k;
      }

      return -0.5 * (--k * (k - 2) - 1);
    }
  },
  Cubic: {
    In: function (k) {
      return k * k * k;
    },
    Out: function (k) {
      return --k * k * k + 1;
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k;
      }

      return 0.5 * ((k -= 2) * k * k + 2);
    }
  },
  Quartic: {
    In: function (k) {
      return k * k * k * k;
    },
    Out: function (k) {
      return 1 - --k * k * k * k;
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k;
      }

      return -0.5 * ((k -= 2) * k * k * k - 2);
    }
  },
  Quintic: {
    In: function (k) {
      return k * k * k * k * k;
    },
    Out: function (k) {
      return --k * k * k * k * k + 1;
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k * k;
      }

      return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
  },
  Sinusoidal: {
    In: function (k) {
      return 1 - Math.cos(k * Math.PI / 2);
    },
    Out: function (k) {
      return Math.sin(k * Math.PI / 2);
    },
    InOut: function (k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }
  },
  Exponential: {
    In: function (k) {
      return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    Out: function (k) {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    InOut: function (k) {
      if (k === 0) {
        return 0;
      }

      if (k === 1) {
        return 1;
      }

      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(1024, k - 1);
      }

      return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }
  },
  Circular: {
    In: function (k) {
      return 1 - Math.sqrt(1 - k * k);
    },
    Out: function (k) {
      return Math.sqrt(1 - --k * k);
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - k * k) - 1);
      }

      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
  },
  Elastic: {
    In: function (k) {
      if (k === 0) {
        return 0;
      }

      if (k === 1) {
        return 1;
      }

      return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    },
    Out: function (k) {
      if (k === 0) {
        return 0;
      }

      if (k === 1) {
        return 1;
      }

      return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    },
    InOut: function (k) {
      if (k === 0) {
        return 0;
      }

      if (k === 1) {
        return 1;
      }

      k *= 2;

      if (k < 1) {
        return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
      }

      return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
    }
  },
  Back: {
    In: function (k) {
      var s = 1.70158;
      return k * k * ((s + 1) * k - s);
    },
    Out: function (k) {
      var s = 1.70158;
      return --k * k * ((s + 1) * k + s) + 1;
    },
    InOut: function (k) {
      var s = 1.70158 * 1.525;

      if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s));
      }

      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
  },
  Bounce: {
    In: function (k) {
      return 1 - TWEEN.Easing.Bounce.Out(1 - k);
    },
    Out: function (k) {
      if (k < 1 / 2.75) {
        return 7.5625 * k * k;
      } else if (k < 2 / 2.75) {
        return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
      } else if (k < 2.5 / 2.75) {
        return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
      } else {
        return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
      }
    },
    InOut: function (k) {
      if (k < 0.5) {
        return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
      }

      return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
    }
  }
};
TWEEN.Interpolation = {
  Linear: function (v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);
    var fn = TWEEN.Interpolation.Utils.Linear;

    if (k < 0) {
      return fn(v[0], v[1], f);
    }

    if (k > 1) {
      return fn(v[m], v[m - 1], m - f);
    }

    return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
  },
  Bezier: function (v, k) {
    var b = 0;
    var n = v.length - 1;
    var pw = Math.pow;
    var bn = TWEEN.Interpolation.Utils.Bernstein;

    for (var i = 0; i <= n; i++) {
      b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
    }

    return b;
  },
  CatmullRom: function (v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = Math.floor(f);
    var fn = TWEEN.Interpolation.Utils.CatmullRom;

    if (v[0] === v[m]) {
      if (k < 0) {
        i = Math.floor(f = m * (1 + k));
      }

      return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    } else {
      if (k < 0) {
        return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
      }

      if (k > 1) {
        return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
      }

      return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
  },
  Utils: {
    Linear: function (p0, p1, t) {
      return (p1 - p0) * t + p0;
    },
    Bernstein: function (n, i) {
      var fc = TWEEN.Interpolation.Utils.Factorial;
      return fc(n) / fc(i) / fc(n - i);
    },
    Factorial: function () {
      var a = [1];
      return function (n) {
        var s = 1;

        if (a[n]) {
          return a[n];
        }

        for (var i = n; i > 1; i--) {
          s *= i;
        }

        a[n] = s;
        return s;
      };
    }(),
    CatmullRom: function (p0, p1, p2, p3, t) {
      var v0 = (p2 - p0) * 0.5;
      var v1 = (p3 - p1) * 0.5;
      var t2 = t * t;
      var t3 = t * t2;
      return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    }
  }
}; // UMD (Universal Module Definition)

(function (root) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return TWEEN;
    });
  } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    // Node.js
    module.exports = TWEEN;
  } else if (root !== undefined) {
    // Global variable
    root.TWEEN = TWEEN;
  }
})(this);
/*Wick Engine https://github.com/Wicklets/wick-engine*/
// https://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
function convertRange(value, r1, r2) {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}
/*Wick Engine https://github.com/Wicklets/wick-engine*/
//https://github.com/mattdesl/lerp/blob/master/index.js
var lerp = function (v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*!
* Platform.js
* Copyright 2014-2018 Benjamin Tan
* Copyright 2011-2013 John-David Dalton
* Available under MIT license
*/
;
(function () {
  'use strict';
  /** Used to determine if values are of the language type `Object`. */

  var objectTypes = {
    'function': true,
    'object': true
  };
  /** Used as a reference to the global object. */

  var root = objectTypes[typeof window] && window || this;
  /** Backup possible global object. */

  var oldRoot = root;
  /** Detect free variable `exports`. */

  var freeExports = objectTypes[typeof exports] && exports;
  /** Detect free variable `module`. */

  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */

  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }
  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */


  var maxSafeInteger = Math.pow(2, 53) - 1;
  /** Regular expression to detect Opera. */

  var reOpera = /\bOpera/;
  /** Possible global object. */

  var thisBinding = this;
  /** Used for native method references. */

  var objectProto = Object.prototype;
  /** Used to check for own properties of an object. */

  var hasOwnProperty = objectProto.hasOwnProperty;
  /** Used to resolve the internal `[[Class]]` of values. */

  var toString = objectProto.toString;
  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */

  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */


  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4': '10 Technical Preview',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': 'Server 2008 R2 / 7',
      '6.0': 'Server 2008 / Vista',
      '5.2': 'Server 2003 / XP 64-bit',
      '5.1': 'XP',
      '5.01': '2000 SP1',
      '5.0': '2000',
      '4.0': 'NT',
      '4.90': 'ME'
    }; // Detect Windows version from platform tokens.

    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) && (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    } // Correct character case and cleanup string.


    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(os.replace(/ ce$/i, ' CE').replace(/\bhpw/i, 'web').replace(/\bMacintosh\b/, 'Mac OS').replace(/_PowerPC\b/i, ' OS').replace(/\b(OS X) [^ \d]+/i, '$1').replace(/\bMac (OS X)\b/, '$1').replace(/\/(\d)/, ' $1').replace(/_/g, '.').replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '').replace(/\bx86\.64\b/gi, 'x86_64').replace(/\b(Windows Phone) OS\b/, '$1').replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1').split(' on ')[0]);
    return os;
  }
  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */


  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }
  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */


  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string) ? string : capitalize(string);
  }
  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */


  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }
  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */


  function getClassOf(value) {
    return value == null ? capitalize(value) : toString.call(value).slice(8, -1);
  }
  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */


  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) && (type == 'object' ? !!object[property] : true);
  }
  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */


  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }
  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */


  function reduce(array, callback) {
    var accumulator = null;
    each(array, function (value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }
  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */


  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }
  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */


  function parse(ua) {
    /** The environment context object. */
    var context = root;
    /** Used to flag when a custom context is provided. */

    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String'; // Juggle arguments.

    if (isCustomContext) {
      context = ua;
      ua = null;
    }
    /** Browser navigator object. */


    var nav = context.navigator || {};
    /** Browser user agent string. */

    var userAgent = nav.userAgent || '';
    ua || (ua = userAgent);
    /** Used to flag when `thisBinding` is the [ModuleScope]. */

    var isModuleScope = isCustomContext || thisBinding == oldRoot;
    /** Used to detect if browser is like Chrome. */

    var likeChrome = isCustomContext ? !!nav.likeChrome : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());
    /** Internal `[[Class]]` value shortcuts. */

    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = isCustomContext && context.java ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';
    /** Detect Java environments. */

    var java = /\bJava/.test(javaClass) && context.java;
    /** Detect Rhino. */

    var rhino = java && getClassOf(context.environment) == enviroClass;
    /** A character to represent alpha. */

    var alpha = java ? 'a' : '\u03b1';
    /** A character to represent beta. */

    var beta = java ? 'b' : '\u03b2';
    /** Browser document object. */

    var doc = context.document || {};
    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */

    var opera = context.operamini || context.opera;
    /** Opera `[[Class]]`. */

    var operaClass = reOpera.test(operaClass = isCustomContext && opera ? opera['[[Class]]'] : getClassOf(opera)) ? operaClass : opera = null;
    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */

    var data;
    /** The CPU architecture. */

    var arch = ua;
    /** Platform description array. */

    var description = [];
    /** Platform alpha/beta indicator. */

    var prerelease = null;
    /** A flag to indicate that environment features should be used to resolve the platform. */

    var useFeatures = ua == userAgent;
    /** The browser/environment version. */

    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();
    /** A flag to indicate if the OS ends with "/ Version" */

    var isSpecialCasedOS;
    /* Detectable layout engines (order is important). */

    var layout = getLayout([{
      'label': 'EdgeHTML',
      'pattern': 'Edge'
    }, 'Trident', {
      'label': 'WebKit',
      'pattern': 'AppleWebKit'
    }, 'iCab', 'Presto', 'NetFront', 'Tasman', 'KHTML', 'Gecko']);
    /* Detectable browser names (order is important). */

    var name = getName(['Adobe AIR', 'Arora', 'Avant Browser', 'Breach', 'Camino', 'Electron', 'Epiphany', 'Fennec', 'Flock', 'Galeon', 'GreenBrowser', 'iCab', 'Iceweasel', 'K-Meleon', 'Konqueror', 'Lunascape', 'Maxthon', {
      'label': 'Microsoft Edge',
      'pattern': 'Edge'
    }, 'Midori', 'Nook Browser', 'PaleMoon', 'PhantomJS', 'Raven', 'Rekonq', 'RockMelt', {
      'label': 'Samsung Internet',
      'pattern': 'SamsungBrowser'
    }, 'SeaMonkey', {
      'label': 'Silk',
      'pattern': '(?:Cloud9|Silk-Accelerated)'
    }, 'Sleipnir', 'SlimBrowser', {
      'label': 'SRWare Iron',
      'pattern': 'Iron'
    }, 'Sunrise', 'Swiftfox', 'Waterfox', 'WebPositive', 'Opera Mini', {
      'label': 'Opera Mini',
      'pattern': 'OPiOS'
    }, 'Opera', {
      'label': 'Opera',
      'pattern': 'OPR'
    }, 'Chrome', {
      'label': 'Chrome Mobile',
      'pattern': '(?:CriOS|CrMo)'
    }, {
      'label': 'Firefox',
      'pattern': '(?:Firefox|Minefield)'
    }, {
      'label': 'Firefox for iOS',
      'pattern': 'FxiOS'
    }, {
      'label': 'IE',
      'pattern': 'IEMobile'
    }, {
      'label': 'IE',
      'pattern': 'MSIE'
    }, 'Safari']);
    /* Detectable products (order is important). */

    var product = getProduct([{
      'label': 'BlackBerry',
      'pattern': 'BB10'
    }, 'BlackBerry', {
      'label': 'Galaxy S',
      'pattern': 'GT-I9000'
    }, {
      'label': 'Galaxy S2',
      'pattern': 'GT-I9100'
    }, {
      'label': 'Galaxy S3',
      'pattern': 'GT-I9300'
    }, {
      'label': 'Galaxy S4',
      'pattern': 'GT-I9500'
    }, {
      'label': 'Galaxy S5',
      'pattern': 'SM-G900'
    }, {
      'label': 'Galaxy S6',
      'pattern': 'SM-G920'
    }, {
      'label': 'Galaxy S6 Edge',
      'pattern': 'SM-G925'
    }, {
      'label': 'Galaxy S7',
      'pattern': 'SM-G930'
    }, {
      'label': 'Galaxy S7 Edge',
      'pattern': 'SM-G935'
    }, 'Google TV', 'Lumia', 'iPad', 'iPod', 'iPhone', 'Kindle', {
      'label': 'Kindle Fire',
      'pattern': '(?:Cloud9|Silk-Accelerated)'
    }, 'Nexus', 'Nook', 'PlayBook', 'PlayStation Vita', 'PlayStation', 'TouchPad', 'Transformer', {
      'label': 'Wii U',
      'pattern': 'WiiU'
    }, 'Wii', 'Xbox One', {
      'label': 'Xbox 360',
      'pattern': 'Xbox'
    }, 'Xoom']);
    /* Detectable manufacturers. */

    var manufacturer = getManufacturer({
      'Apple': {
        'iPad': 1,
        'iPhone': 1,
        'iPod': 1
      },
      'Archos': {},
      'Amazon': {
        'Kindle': 1,
        'Kindle Fire': 1
      },
      'Asus': {
        'Transformer': 1
      },
      'Barnes & Noble': {
        'Nook': 1
      },
      'BlackBerry': {
        'PlayBook': 1
      },
      'Google': {
        'Google TV': 1,
        'Nexus': 1
      },
      'HP': {
        'TouchPad': 1
      },
      'HTC': {},
      'LG': {},
      'Microsoft': {
        'Xbox': 1,
        'Xbox One': 1
      },
      'Motorola': {
        'Xoom': 1
      },
      'Nintendo': {
        'Wii U': 1,
        'Wii': 1
      },
      'Nokia': {
        'Lumia': 1
      },
      'Samsung': {
        'Galaxy S': 1,
        'Galaxy S2': 1,
        'Galaxy S3': 1,
        'Galaxy S4': 1
      },
      'Sony': {
        'PlayStation': 1,
        'PlayStation Vita': 1
      }
    });
    /* Detectable operating systems (order is important). */

    var os = getOS(['Windows Phone', 'Android', 'CentOS', {
      'label': 'Chrome OS',
      'pattern': 'CrOS'
    }, 'Debian', 'Fedora', 'FreeBSD', 'Gentoo', 'Haiku', 'Kubuntu', 'Linux Mint', 'OpenBSD', 'Red Hat', 'SuSE', 'Ubuntu', 'Xubuntu', 'Cygwin', 'Symbian OS', 'hpwOS', 'webOS ', 'webOS', 'Tablet OS', 'Tizen', 'Linux', 'Mac OS X', 'Macintosh', 'Mac', 'Windows 98;', 'Windows ']);
    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */

    function getLayout(guesses) {
      return reduce(guesses, function (result, guess) {
        return result || RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }
    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */


    function getManufacturer(guesses) {
      return reduce(guesses, function (result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (value[product] || value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] || RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)) && key;
      });
    }
    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */


    function getName(guesses) {
      return reduce(guesses, function (result, guess) {
        return result || RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }
    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */


    function getOS(guesses) {
      return reduce(guesses, function (result, guess) {
        var pattern = guess.pattern || qualify(guess);

        if (!result && (result = RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua))) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }

        return result;
      });
    }
    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */


    function getProduct(guesses) {
      return reduce(guesses, function (result, guess) {
        var pattern = guess.pattern || qualify(guess);

        if (!result && (result = RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) || RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) || RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua))) {
          // Split by forward slash and append product version if needed.
          if ((result = String(guess.label && !RegExp(pattern, 'i').test(guess.label) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          } // Correct character case and cleanup string.


          guess = guess.label || guess;
          result = format(result[0].replace(RegExp(pattern, 'i'), guess).replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ').replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }

        return result;
      });
    }
    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */


    function getVersion(patterns) {
      return reduce(patterns, function (result, pattern) {
        return result || (RegExp(pattern + '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }
    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */


    function toStringPlatform() {
      return this.description || '';
    }
    /*------------------------------------------------------------------------*/
    // Convert layout to an array so we can add extra details.


    layout && (layout = [layout]); // Detect product names that contain their manufacturer's name.

    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    } // Clean up Google TV.


    if (data = /\bGoogle TV\b/.exec(product)) {
      product = data[0];
    } // Detect simulators.


    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    } // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.


    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    } // Detect IE Mobile 11.


    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    } // Detect iOS.
    else if (/^iP/.test(product)) {
        name || (name = 'Safari');
        os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua)) ? ' ' + data[1].replace(/_/g, '.') : '');
      } // Detect Kubuntu.
      else if (name == 'Konqueror' && !/buntu/i.test(os)) {
          os = 'Kubuntu';
        } // Detect Android browsers.
        else if (manufacturer && manufacturer != 'Google' && (/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua) || /\bVita\b/.test(product)) || /\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua)) {
            name = 'Android Browser';
            os = /\bAndroid\b/.test(os) ? os : 'Android';
          } // Detect Silk desktop/accelerated modes.
          else if (name == 'Silk') {
              if (!/\bMobi/i.test(ua)) {
                os = 'Android';
                description.unshift('desktop mode');
              }

              if (/Accelerated *= *true/i.test(ua)) {
                description.unshift('accelerated');
              }
            } // Detect PaleMoon identifying as Firefox.
            else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
                description.push('identifying as Firefox ' + data[1]);
              } // Detect Firefox OS and products running Firefox.
              else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
                  os || (os = 'Firefox OS');
                  product || (product = data[1]);
                } // Detect false positives for Firefox/Safari.
                else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
                    // Escape the `/` for Firefox 1.
                    if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
                      // Clear name of false positives.
                      name = null;
                    } // Reassign a generic name.


                    if ((data = product || manufacturer || os) && (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
                      name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
                    }
                  } // Add Chrome version to description for Electron.
                  else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
                      description.push('Chromium ' + data);
                    } // Detect non-Opera (Presto-based) versions (order is important).


    if (!version) {
      version = getVersion(['(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))', 'Version', qualify(name), '(?:Firefox|Minefield|NetFront)']);
    } // Detect stubborn layout engines.


    if (data = layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' || /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') || /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' || !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') || layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront') {
      layout = [data];
    } // Detect Windows Phone 7 desktop mode.


    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    } // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
        name = 'IE Mobile';
        os = 'Windows Phone 8.x';
        description.unshift('desktop mode');
        version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
      } // Detect IE 11 identifying as other browsers.
      else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
          if (name) {
            description.push('identifying as ' + name + (version ? ' ' + version : ''));
          }

          name = 'IE';
          version = data[1];
        } // Leverage environment features.


    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }

        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch (e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }

          if (!name) {
            name = 'Rhino';
          }
        } else if (typeof context.process == 'object' && !context.process.browser && (data = context.process)) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }

          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      } // Detect Adobe AIR.
      else if (getClassOf(data = context.runtime) == airRuntimeClass) {
          name = 'Adobe AIR';
          os = data.flash.system.Capabilities.os;
        } // Detect PhantomJS.
        else if (getClassOf(data = context.phantom) == phantomClass) {
            name = 'PhantomJS';
            version = (data = data.version || null) && data.major + '.' + data.minor + '.' + data.patch;
          } // Detect IE compatibility modes.
          else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
              // We're in compatibility mode when the Trident version + 4 doesn't
              // equal the document mode.
              version = [version, doc.documentMode];

              if ((data = +data[1] + 4) != version[1]) {
                description.push('IE ' + version[1] + ' mode');
                layout && (layout[1] = '');
                version[1] = data;
              }

              version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
            } // Detect IE 11 masking as other browsers.
            else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
                description.push('masking as ' + name + ' ' + version);
                name = 'IE';
                version = '11.0';
                layout = ['Trident'];
                os = 'Windows';
              }

      os = os && format(os);
    } // Detect prerelease phases.


    if (version && (data = /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) || /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) || /\bMinefield\b/i.test(ua) && 'a')) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') + (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    } // Detect Firefox Mobile.


    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    } // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
        version = version.replace(/\.[\d.]+/, '.x');
      } // Detect Xbox 360 and Xbox One.
      else if (/\bXbox\b/i.test(product)) {
          if (product == 'Xbox 360') {
            os = null;
          }

          if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
            description.unshift('mobile mode');
          }
        } // Add mobile postfix.
        else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) && (os == 'Windows CE' || /Mobi/i.test(ua))) {
            name += ' Mobile';
          } // Detect IE platform preview.
          else if (name == 'IE' && useFeatures) {
              try {
                if (context.external === null) {
                  description.unshift('platform preview');
                }
              } catch (e) {
                description.unshift('embedded');
              }
            } // Detect BlackBerry OS version.
            // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
            else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data = (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] || version)) {
                data = [data, /BB10/.test(ua)];
                os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
                version = null;
              } // Detect Opera identifying/masking itself as another browser.
              // http://www.opera.com/support/kb/view/843/
              else if (this != forOwn && product != 'Wii' && (useFeatures && opera || /Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua) || name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os) || name == 'IE' && (os && !/^Win/.test(os) && version > 5.5 || /\bWindows XP\b/.test(os) && version > 8 || version == 8 && !/\bTrident\b/.test(ua))) && !reOpera.test(data = parse.call(forOwn, ua.replace(reOpera, '') + ';')) && data.name) {
                  // When "identifying", the UA contains both Opera and the other browser's name.
                  data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');

                  if (reOpera.test(name)) {
                    if (/\bIE\b/.test(data) && os == 'Mac OS') {
                      os = null;
                    }

                    data = 'identify' + data;
                  } // When "masking", the UA contains only the other browser's name.
                  else {
                      data = 'mask' + data;

                      if (operaClass) {
                        name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
                      } else {
                        name = 'Opera';
                      }

                      if (/\bIE\b/.test(data)) {
                        os = null;
                      }

                      if (!useFeatures) {
                        version = null;
                      }
                    }

                  layout = ['Presto'];
                  description.push(data);
                } // Detect WebKit Nightly and approximate Chrome/Safari versions.


    if (data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1]) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data]; // Nightly builds are postfixed with a "+".

      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      } // Clear incorrect browser versions.
      else if (version == data[1] || version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
          version = null;
        } // Use the full Chrome version when available.


      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1]; // Detect Blink layout engine.

      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      } // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi


      if (!useFeatures || !likeChrome && !data[1]) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      } // Add the postfix of ".x" or "+" for approximate versions.


      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+')); // Obscure version for some Safari 1-2 releases.

      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    } // Detect Opera desktop modes.


    if (name == 'Opera' && (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');

      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }

      os = os.replace(RegExp(' *' + data + '$'), '');
    } // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
        description.unshift('desktop mode');
        name = 'Chrome Mobile';
        version = null;

        if (/\bOS X\b/.test(os)) {
          manufacturer = 'Apple';
          os = 'iOS 4.3+';
        } else {
          os = null;
        }
      } // Strip incorrect OS versions.


    if (version && version.indexOf(data = /[\d.]+$/.exec(os)) == 0 && ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    } // Add layout engine.


    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (/Browser|Lunascape|Maxthon/.test(name) || name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) || /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    } // Combine contextual information.


    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    } // Append manufacturer to description.


    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    } // Append product to description.


    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    } // Parse the OS into an object.


    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': data && !isSpecialCasedOS ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function () {
          var version = this.version;
          return this.family + (version && !isSpecialCasedOS ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    } // Add browser/OS architecture.


    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }

      if (name && (/\bWOW64\b/i.test(ua) || useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua))) {
        description.unshift('32-bit');
      }
    } // Chrome 39 and above on OS X is always 64-bit.
    else if (os && /^OS X/.test(os.family) && name == 'Chrome' && parseFloat(version) >= 39) {
        os.architecture = 64;
      }

    ua || (ua = null);
    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */

    var platform = {};
    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */

    platform.description = ua;
    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */

    platform.layout = layout && layout[0];
    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */

    platform.manufacturer = manufacturer;
    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */

    platform.name = name;
    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */

    platform.prerelease = prerelease;
    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */

    platform.product = product;
    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */

    platform.ua = ua;
    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */

    platform.version = name && version;
    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */

    platform.os = os || {
      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function () {
        return 'null';
      }
    };
    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }

    if (platform.name) {
      description.unshift(name);
    }

    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }

    if (description.length) {
      platform.description = description.join(' ');
    }

    return platform;
  }
  /*--------------------------------------------------------------------------*/
  // Export platform.


  var platform = parse(); // Some AMD build optimizers, like r.js, check for condition patterns like the following:

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform; // Define as an anonymous module so platform can be aliased through path mapping.

    define(function () {
      return platform;
    });
  } // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
      // Export for CommonJS support.
      forOwn(platform, function (value, key) {
        freeExports[key] = value;
      });
    } else {
      // Export to the global object.
      root.platform = platform;
    }
}).call(this);
/*Wick Engine https://github.com/Wicklets/wick-engine*/
// https://gist.github.com/hurjas/2660489

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */
function Timestamp() {
  // Create a date object with the current time
  var now = new Date();
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // Create an array with the current month, day and time

  var date = [months[now.getMonth()], now.getDate() + '-', now.getFullYear()]; // Create an array with the current hour, minute and second

  var time = [now.getHours(), now.getMinutes()]; // Determine AM or PM suffix based on the hour

  var suffix = time[0] < 12 ? "AM" : "PM"; // Convert hour from military time

  time[0] = time[0] < 12 ? time[0] : time[0] - 12; // If hour is 0, set it to 12

  time[0] = time[0] || 12; // If seconds and minutes are less than 10, add a zero

  for (var i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  } // Return the formatted string


  return date.join("") + "-" + time.join(".") + "" + suffix;
}
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/* https://github.com/kelektiv/node-uuid */
!function (r) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = r();else if ("function" == typeof define && define.amd) define([], r);else {
    var e;
    e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.uuidv4 = r();
  }
}(function () {
  return function r(e, n, t) {
    function o(f, u) {
      if (!n[f]) {
        if (!e[f]) {
          var a = "function" == typeof require && require;
          if (!u && a) return a(f, !0);
          if (i) return i(f, !0);
          var d = new Error("Cannot find module '" + f + "'");
          throw d.code = "MODULE_NOT_FOUND", d;
        }

        var p = n[f] = {
          exports: {}
        };
        e[f][0].call(p.exports, function (r) {
          var n = e[f][1][r];
          return o(n ? n : r);
        }, p, p.exports, r, e, n, t);
      }

      return n[f].exports;
    }

    for (var i = "function" == typeof require && require, f = 0; f < t.length; f++) o(t[f]);

    return o;
  }({
    1: [function (r, e, n) {
      function t(r, e) {
        var n = e || 0,
            t = o;
        return t[r[n++]] + t[r[n++]] + t[r[n++]] + t[r[n++]] + "-" + t[r[n++]] + t[r[n++]] + "-" + t[r[n++]] + t[r[n++]] + "-" + t[r[n++]] + t[r[n++]] + "-" + t[r[n++]] + t[r[n++]] + t[r[n++]] + t[r[n++]] + t[r[n++]] + t[r[n++]];
      }

      for (var o = [], i = 0; i < 256; ++i) o[i] = (i + 256).toString(16).substr(1);

      e.exports = t;
    }, {}],
    2: [function (r, e, n) {
      var t = "undefined" != typeof crypto && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && msCrypto.getRandomValues.bind(msCrypto);

      if (t) {
        var o = new Uint8Array(16);

        e.exports = function () {
          return t(o), o;
        };
      } else {
        var i = new Array(16);

        e.exports = function () {
          for (var r, e = 0; e < 16; e++) 0 === (3 & e) && (r = 4294967296 * Math.random()), i[e] = r >>> ((3 & e) << 3) & 255;

          return i;
        };
      }
    }, {}],
    3: [function (r, e, n) {
      function t(r, e, n) {
        var t = e && n || 0;
        "string" == typeof r && (e = "binary" === r ? new Array(16) : null, r = null), r = r || {};
        var f = r.random || (r.rng || o)();
        if (f[6] = 15 & f[6] | 64, f[8] = 63 & f[8] | 128, e) for (var u = 0; u < 16; ++u) e[t + u] = f[u];
        return e || i(f);
      }

      var o = r("./lib/rng"),
          i = r("./lib/bytesToUuid");
      e.exports = t;
    }, {
      "./lib/bytesToUuid": 1,
      "./lib/rng": 2
    }]
  }, {}, [3])(3);
});
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
class Wick {
  static get version() {
    return "1.0";
  }
  /* Getters */

  /* Setters */

  /* Methods */


}

console.log("Wick Engine 1.0 is available"); // Ensure that the Wick class is accessible in environments where globals are finicky (react, webpack, etc)

window.Wick = Wick;
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Base = class {
  constructor() {
    this._uuid = uuidv4();
    this._parent = null;
    this._children = [];
    this._project = null;
    this._classname = this.classname;
  }

  static deserialize(data) {
    var object = Wick[data.classname]._deserialize(data, new Wick[data.classname]());

    return object;
  }

  static _deserialize(data, object) {
    object._uuid = data.uuid;
    return object;
  }
  /* Getters */


  get classname() {
    return 'Base';
  }

  get uuid() {
    return this._uuid;
  }

  get parent() {
    return this._parent;
  }

  get parentFrame() {
    return this._parentByInstanceOf(Wick.Frame);
  }

  get parentTimeline() {
    return this._parentByInstanceOf(Wick.Timeline);
  }

  get project() {
    return this._project;
  }
  /* Setters */


  set project(project) {
    this._project = project;
    this._children = this._children.map(child => {
      child.project = project;
      return child;
    });
  }

  set parent(parent) {
    this._parent = parent;
    var self = this;
    this._children = this._children.map(child => {
      child.parent = self;
      return child;
    });
  }
  /* Methods */


  _addChild(child) {
    this._children.push(child);

    child.parent = this;
    child.project = this.project;
  }

  _removeChild(child) {
    child.parent = null;
    child.project = null;
    this._children = this._children.filter(seekChild => {
      return seekChild !== child;
    });
  }

  _childByUUID(uuid) {
    if (this.uuid === uuid) {
      return this;
    }

    var foundChild = null;

    this._children.forEach(child => {
      var checkChild = child._childByUUID(uuid);

      if (checkChild) {
        foundChild = checkChild;
      }
    });

    return foundChild;
  }

  _parentByInstanceOf(seekClass) {
    var instanceParent = this.parent;

    while (instanceParent !== undefined && instanceParent !== null && !(instanceParent instanceof seekClass)) {
      instanceParent = instanceParent.parent;
    }

    return instanceParent;
  }

  _regenUUIDs() {
    this._uuid = uuidv4();

    this._children.forEach(child => {
      child._regenUUIDs();
    });
  }

  clone(object) {
    if (!object) object = new Wick.Base();
    object._uuid = this._uuid;
    return object;
  }

  serialize() {
    var data = {};
    data.classname = this.classname;
    data.uuid = this._uuid;
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Layer = class extends Wick.Base {
  constructor(title) {
    super();
    this.locked = false;
    this.hidden = false;
    this.title = title || 'New Layer';
    this.frames = [];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.locked = data.locked;
    object.hidden = data.hidden;
    object.title = data.title;
    data.frames.forEach(frameData => {
      object.addFrame(Wick.Frame.deserialize(frameData));
    });
    return object;
  }
  /* Getters */


  get classname() {
    return 'Layer';
  }

  get index() {
    return this.parent.layers.indexOf(this);
  }

  get length() {
    var end = 0;
    this.frames.forEach(function (frame) {
      if (frame.end > end) {
        end = frame.end;
      }
    });
    return end;
  }

  get activeFrame() {
    return this.getFrame(this.parent.playheadPosition);
  }
  /* Setters */

  /* Methods */


  addFrame(frame) {
    this.frames.push(frame);

    this._addChild(frame);
  }

  removeFrame(frame) {
    this.frames = this.frames.filter(checkFrame => {
      return checkFrame !== frame;
    });

    this._removeChild(frame);
  }

  getFrame(playheadPosition) {
    return this.frames.find(frame => {
      return frame.inPosition(playheadPosition);
    });
  }

  clone(object) {
    if (!object) object = new Wick.Layer();
    super.clone(object);
    object.locked = this.locked;
    object.hidden = this.hidden;
    object.title = this.title;
    this.frames.forEach(frame => {
      object.addFrame(frame.clone());
    });
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.locked = this.locked;
    data.hidden = this.hidden;
    data.title = this.title;
    data.frames = this.frames.map(frame => {
      return frame.serialize();
    });
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Project = class extends Wick.Base {
  constructor() {
    super();
    this.name = 'New Project';
    this.width = 720;
    this.height = 405;
    this.framerate = 12;
    this.backgroundColor = '#ffffff';
    this.root = null;
    this.setRoot(new Wick.Clip());
    this.root.timeline.addLayer(new Wick.Layer());
    this.root.timeline.layers[0].addFrame(new Wick.Frame());
    this._focus = this.root.uuid;
    this.project = this;
    this.assets = [];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.name = data.name;
    object.width = data.width;
    object.height = data.height;
    object.framerate = data.framerate;
    object.backgroundColor = data.backgroundColor;
    object.setRoot(Wick.Clip.deserialize(data.root));
    object.focus = object.root;
    object.project = object;
    data.assets.forEach(assetData => {
      object.addAsset(Wick.Asset.deserialize(assetData));
    });
    return object;
  }
  /* Getters */


  get classname() {
    return 'Project';
  }

  get focus() {
    return this._childByUUID(this._focus);
  }
  /* Setters */


  set focus(clip) {
    this._focus = clip.uuid;
  }
  /* Methods */


  setRoot(clip) {
    if (this.root) {
      this._removeChild(this.root);
    }

    this.root = clip;

    this._addChild(this.root);
  }

  addAsset(asset) {
    this.assets.push(asset);

    this._refreshAssetUUIDRefs();

    this._addChild(asset);
  }

  removeAsset(asset) {
    this.assets = this.assets.filter(checkAsset => {
      return checkAsset !== asset;
    });

    this._refreshAssetUUIDRefs();

    this._removeChild(asset);
  }

  tick() {
    this.focus.tick();
  }

  clone(object) {
    if (!object) object = new Wick.Project();
    super.clone(object);
    object.name = this.name;
    object.width = this.width;
    object.height = this.height;
    object.backgroundColor = this.backgroundColor;
    object.framerate = this.framerate;
    object.setRoot(this.root.clone());
    object.focus = object._childByUUID(this.focus.uuid);
    this.assets.forEach(asset => {
      object.addAsset(asset.clone());
    });
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.name = this.name;
    data.width = this.width;
    data.height = this.height;
    data.backgroundColor = this.backgroundColor;
    data.framerate = this.framerate;
    data.root = this.root.serialize();
    data.assets = this.assets.map(asset => {
      return asset.serialize();
    });
    return data;
  }

  _refreshAssetUUIDRefs() {
    var assets = this.assets;
    assets.forEach(asset => {
      assets[asset.uuid] = asset;
    });
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Script = class extends Wick.Base {
  static get WICK_SCRIPT_FN_PREFIX() {
    return '_wick_script_';
  }

  constructor() {
    super();
    this.src = '';
    this._wrapper = null;
    this._globalWrapper = null;
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.src = data.src;
    return object;
  }
  /* Getters */


  get classname() {
    return 'Script';
  }
  /* Setters */

  /* Methods */
  // TODO this needs cleanup


  run() {
    this._createWrappers();

    if (!this._wrapper._wickFn) {
      var src_js = this._convertWickFunctions();

      this._wrapper._wickFn = Function('scopeObj', src_js);
    }

    this._globalWrapper.attachToWindow();

    if (this.parent instanceof Wick.Clip) this._wrapper.attachToClip();

    var result = this._wrapper._wickFn(this._wrapper);

    this._globalWrapper.detachFromWindow();

    if (this.parent instanceof Wick.Clip) this._wrapper.detatchFromClip();
    return result;
  } // TODO this needs cleanup


  runFn(fn) {
    if (!this._wrapper || !this._wrapper._wickFn) {
      this.run();
    }

    var fullFnName = Wick.Script.WICK_SCRIPT_FN_PREFIX + fn;

    if (this._wrapper[fullFnName]) {
      this._globalWrapper.attachToWindow();

      if (this.parent instanceof Wick.Clip) this._wrapper.attachToClip();

      var result = this._wrapper[fullFnName](this._wrapper);

      this._globalWrapper.detachFromWindow();

      if (this.parent instanceof Wick.Clip) this._wrapper.detatchFromClip();
      return result;
    }
  } // TODO this needs cleanup


  attachChildClipReferences() {
    this._createWrappers();

    if (this.parent instanceof Wick.Clip) this._wrapper.attachToClip();
  } // TODO this needs cleanup


  detatchChildClipReferences() {
    this._createWrappers();

    if (this.parent instanceof Wick.Clip) this._wrapper.detatchFromClip();
  }

  _convertWickFunctions() {
    var script = this.src;
    var regex = / *on *\( *[a-zA-Z]+ *\)/gm;
    var m;

    do {
      m = regex.exec(script, 'g');

      if (m) {
        var eventName = m[0].split('(')[1].split(')')[0];
        script = script.replace(m[0], 'scopeObj.' + Wick.Script.WICK_SCRIPT_FN_PREFIX + eventName + ' = function ()');
      }
    } while (m);

    return script;
  }

  _createWrappers() {
    if (!this._wrapper) {
      if (this.parent instanceof Wick.Clip) this._wrapper = new Wick.Script.ClipWrapper(this.parent);else if (this.parent instanceof Wick.Frame) this._wrapper = new Wick.Script.FrameWrapper(this.parent);else // This is here just so that tests pass even when attaching a script to an empty object
        this._wrapper = new Wick.Script.ClipWrapper(this.parent);
    }

    if (!this._globalWrapper) {
      this._globalWrapper = new Wick.Script.GlobalWrapper(this.parent);
    }
  }

  clone(object) {
    if (!object) object = new Wick.Script();
    super.clone(object);
    object.src = this.src;
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.src = this.src;
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Script.Wrapper = class {
  constructor(context) {
    this.context = context;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Script.GlobalWrapper = class extends Wick.Script.Wrapper {
  constructor(context) {
    super(context);
  }

  stop() {
    this.context.parentTimeline._playing = false;
  }

  play() {
    this.context.parentTimeline._playing = true;
  }

  gotoAndStop(frame) {
    this.context.parentTimeline._playing = false;
    this.context.parentTimeline._forceNextFrame = frame;
  }

  gotoAndPlay(frame) {
    this.context.parentTimeline._playing = true;
    this.context.parentTimeline._forceNextFrame = frame;
  }

  attachToWindow() {
    window.stop = this.stop.bind(this);
    window.play = this.play.bind(this);
    window.gotoAndStop = this.gotoAndStop.bind(this);
    window.gotoAndPlay = this.gotoAndPlay.bind(this);

    this._attachNamedClipsAccess();
  }

  detachFromWindow() {
    delete window.stop;
    delete window.play;
    delete window.gotoAndStop;
    delete window.gotoAndPlay;

    this._detatchNamedClipsAccess();
  }

  _attachNamedClipsAccess() {
    this._generateNamedClipsList().forEach(clip => {
      clip.script.attachChildClipReferences();
      window[clip.identifier] = clip.script._wrapper;
    });
  }

  _detatchNamedClipsAccess() {
    this._generateNamedClipsList().forEach(clip => {
      clip.script.detatchChildClipReferences();
      delete window[clip.identifier];
    });
  }

  _generateNamedClipsList() {
    if (!this.context.parentFrame) return [];
    return this.context.parentFrame.clips.filter(clip => {
      return clip.identifier !== undefined;
    });
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Script.ClipWrapper = class extends Wick.Script.Wrapper {
  constructor(context) {
    super(context);
  }

  stop() {
    this.context.timeline._playing = false;
  }

  play() {
    this.context.timeline._playing = true;
  }

  gotoAndStop(frame) {
    this.context.timeline._playing = false;
    this.context.timeline._forceNextFrame = frame;
  }

  gotoAndPlay(frame) {
    this.context.timeline._playing = true;
    this.context.timeline._forceNextFrame = frame;
  }

  attachToClip() {
    this._attachNamedChildrenClipsAccess();
  }

  detatchFromClip() {
    this._deatachNamedChildrenClipsAccess();
  }

  _attachNamedChildrenClipsAccess() {
    var self = this;

    this._generateNamedChildClipsList().forEach(clip => {
      clip.script.attachChildClipReferences();
      self[clip.identifier] = clip.script._wrapper;
    });
  }

  _deatachNamedChildrenClipsAccess() {
    var self = this;

    this._generateNamedChildClipsList().forEach(clip => {
      clip.script.detatchChildClipReferences();
      delete self[clip.identifier];
    });
  }

  _generateNamedChildClipsList() {
    var childClips = [];
    this.context.timeline.activeFrames.forEach(frame => {
      frame.clips.forEach(clip => {
        if (clip.identifier) {
          childClips.push(clip);
        }
      });
    });
    return childClips;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Script.FrameWrapper = class extends Wick.Script.Wrapper {
  constructor(context) {
    super(context);
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Timeline = class extends Wick.Base {
  constructor() {
    super();
    this.playheadPosition = 1;
    this.activeLayerIndex = 0;
    this._playing = true;
    this._forceNextFrame = null;
    this.layers = [];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.playheadPosition = data.playheadPosition;
    object.activeLayerIndex = data.activeLayerIndex;
    data.layers.forEach(layerData => {
      object.addLayer(Wick.Layer.deserialize(layerData));
    });
    return object;
  }
  /* Getters */


  get classname() {
    return 'Timeline';
  }

  get length() {
    var length = 0;
    this.layers.forEach(function (layer) {
      var layerLength = layer.length;

      if (layerLength > length) {
        length = layerLength;
      }
    });
    return length;
  }

  get activeLayer() {
    return this.layers[this.activeLayerIndex];
  }

  get activeFrames() {
    var frames = [];
    this.layers.forEach(layer => {
      var layerFrame = layer.activeFrame;

      if (layerFrame) {
        frames.push(layerFrame);
      }
    });
    return frames;
  }
  /* Setters */

  /* Methods */


  addLayer(layer) {
    this.layers.push(layer);

    this._addChild(layer);
  }

  removeLayer(layer) {
    this.layers = this.layers.filter(checkLayer => {
      return checkLayer !== layer;
    });

    this._removeChild(layer);
  }

  moveLayer(layer, index) {
    this.layers.splice(this.layers.indexOf(layer), 1);
    this.layers.splice(index, 0, layer);
  }

  advance() {
    if (this._forceNextFrame) {
      this.playheadPosition = this._forceNextFrame;
      this._forceNextFrame = null;
    } else if (this._playing) {
      this.playheadPosition++;

      if (this.playheadPosition > this.length) {
        this.playheadPosition = 1;
      }
    }
  }

  clone(object) {
    if (!object) object = new Wick.Timeline();
    super.clone(object);
    object.playheadPosition = this.playheadPosition;
    object.activeLayerIndex = this.activeLayerIndex;
    this.layers.forEach(layer => {
      object.addLayer(layer.clone());
    });
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.playheadPosition = this.playheadPosition;
    data.activeLayerIndex = this.activeLayerIndex;
    data.layers = this.layers.map(layer => {
      return layer.serialize();
    });
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Tween = class extends Wick.Base {
  constructor(playheadPosition, x, y, scaleX, scaleY, rotation, fullRotations, opacity) {
    super();
    this.playheadPosition = playheadPosition || 1;
    this.x = x === undefined ? 0 : x;
    this.y = y === undefined ? 0 : y;
    this.scaleX = scaleX === undefined ? 0 : scaleX;
    this.scaleY = scaleY === undefined ? 0 : scaleY;
    this.rotation = rotation === undefined ? 0 : rotation;
    this.fullRotations = fullRotations === undefined ? 0 : fullRotations;
    this.opacity = opacity === undefined ? 1 : opacity;
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.playheadPosition = data.playheadPosition;
    object.x = data.x;
    object.y = data.y;
    object.scaleX = data.scaleX;
    object.scaleY = data.scaleY;
    object.rotation = data.rotation;
    object.fullRotations = data.fullRotations;
    object.opacity = data.opacity;
    return object;
  }

  static get TWEEN_VALUE_NAMES() {
    return ["x", "y", "scaleX", "scaleY", "rotation", "opacity"];
  }

  static interpolate(tweenA, tweenB, playheadPosition) {
    var interpTween = new Wick.Tween(); // Calculate value (0.0-1.0) to pass to tweening function

    var t = Wick.Tween.tValue(tweenA.playheadPosition, tweenB.playheadPosition, playheadPosition); // Interpolate every transformation attribute using the t value

    Wick.Tween.TWEEN_VALUE_NAMES.forEach(function (name) {
      var tt = TWEEN.Easing.Linear.None(t);
      var valA = tweenA[name];
      var valB = tweenB[name];

      if (name === 'rotation') {
        // Constrain rotation values to range of -180 to 180
        while (valA < -180) valA += 360;

        while (valB < -180) valB += 360;

        while (valA > 180) valA -= 360;

        while (valB > 180) valB -= 360; // Convert full rotations to 360 degree amounts


        valB += tweenA.fullRotations * 360;
      }

      interpTween[name] = lerp(valA, valB, tt);
    });
    return interpTween;
  }

  static tValue(tweenAPlayhead, tweenBPlayhead, interpolatePlayhead) {
    var dist = tweenBPlayhead - tweenAPlayhead;
    var t = (interpolatePlayhead - tweenAPlayhead) / dist;
    return t;
  }
  /* Getters */


  get classname() {
    return 'Tween';
  }
  /* Setters */

  /* Methods */


  clone(object) {
    if (!object) object = new Wick.Tween();
    super.clone(object);
    object.playheadPosition = this.playheadPosition;
    object.x = this.x;
    object.y = this.y;
    object.scaleX = this.scaleX;
    object.scaleY = this.scaleY;
    object.rotation = this.rotation;
    object.fullRotations = this.fullRotations;
    object.opacity = this.opacity;
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.playheadPosition = this.playheadPosition;
    data.x = this.x;
    data.y = this.y;
    data.scaleX = this.scaleX;
    data.scaleY = this.scaleY;
    data.rotation = this.rotation;
    data.fullRotations = this.fullRotations;
    data.opacity = this.opacity;
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Asset = class extends Wick.Base {
  constructor(filename) {
    super();
    this.filename = filename;
    this._src = null;
    this.onload = null;
  }
  /**
   * Returns all valid MIME types for files which can be converted to Wick Engine Assets.
   * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
   */


  static getMIMETypes() {
    let imageTypes = Wick.ImageAsset.getMIMETypes();
    let soundTypes = Wick.SoundAsset.getMIMETypes();
    return imageTypes.concat(soundTypes);
  }
  /**
   * Creates an asset from a File object for use within the Wick Engine.
   * @param {File} file File object to be read and converted into an asset.
   * @param {function} callback Function which will be passed the Wick Asset on file load. Can be passed undefined on improper file input.
   */


  static createAsset(file, callback) {
    let imageTypes = Wick.ImageAsset.getMIMETypes();
    let soundTypes = Wick.SoundAsset.getMIMETypes();
    let asset = undefined;

    if (imageTypes.indexOf(file.type) > -1) {
      asset = new Wick.ImageAsset();
    } else if (soundTypes.indexOf(file.type) > -1) {
      asset = new Wick.SoundAsset();
    }

    if (asset === undefined) {
      callback(undefined);
      return;
    }

    let reader = new FileReader();

    reader.onload = function () {
      let dataURL = reader.result;
      asset.src = dataURL;
      asset.filename = file.name;
      callback(asset);
    };

    reader.readAsDataURL(file);
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.filename = data.filename;
    object.src = data.src;
    return object;
  }
  /* Getters */


  get classname() {
    return 'Asset';
  }

  get src() {
    return this._src;
  }

  get isLoaded() {
    console.error('All Wick.Asset subclasses must override isLoaded().');
  }
  /* Setters */


  set src(src) {
    this._src = src;
  }
  /* Methods */


  clone(object) {
    if (!object) object = new Wick.Asset();
    super.clone(object);
    object.src = this.src;
    object.filename = this.filename;
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.src = this.src;
    data.filename = this.filename;
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.ImageAsset = class extends Wick.Asset {
  constructor() {
    super();
    this.html5Image = null;
  }
  /**
   * Returns valid MIME types for an Image Asset.
   * @returns {string[]} Array of strings representing MIME types in the form image/Subtype.
   */


  static getMIMETypes() {
    return ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    return object;
  }
  /* Getters */


  get classname() {
    return 'ImageAsset';
  }

  get src() {
    return super.src;
  }

  get width() {
    return this.html5Image.width;
  }

  get height() {
    return this.html5Image.height;
  }

  get isLoaded() {
    return this.html5Image !== null;
  }
  /* Setters */


  set src(src) {
    super.src = src;
    this.html5Image = new Image();
    var self = this;

    this.html5Image.onload = function () {
      self.onload && self.onload();
    };

    this.html5Image.src = src;
  }
  /* Methods */


  clone(object) {
    if (!object) object = new Wick.ImageAsset();
    super.clone(object);
    return object;
  }

  serialize() {
    var data = super.serialize();
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.SoundAsset = class extends Wick.Asset {
  constructor() {
    super();
    this.html5Sound = null;
    this._loaded = false;
  }
  /**
   * Returns valid MIME types for a Sound Asset.
   * @returns {string[]} Array of strings representing MIME types in the form audio/Subtype.
   */


  static getMIMETypes() {
    return ['audio/mpeg3', 'audio/x-mpeg-3', 'audio/ogg'];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    return object;
  }
  /* Getters */


  get classname() {
    return 'SoundAsset';
  }

  get src() {
    return super.src;
  }

  get duration() {
    return this.html5Sound.duration;
  }

  get isLoaded() {
    return this._loaded;
  }
  /* Setters */


  set src(src) {
    super.src = src;
    this.html5Sound = document.createElement('audio');
    var self = this;
    this.html5Sound.addEventListener("canplay", () => {
      self._loaded = true;
      self.onload && self.onload();
    });
    this.html5Sound.setAttribute('src', super.src);
    this.html5Sound.load();
  }
  /* Methods */


  clone(object) {
    if (!object) object = new Wick.SoundAsset();
    super.clone(object);
    return object;
  }

  serialize() {
    var data = super.serialize();
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.ClipAsset = class extends Wick.Asset {
  constructor() {
    super();
    this.timeline = new Wick.Timeline();
    this.linkedClips = [];
  }

  static getMIMETypes() {
    return [];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.timeline = Wick.Timeline.deserialize(data.timeline);
    return object;
  }
  /* Getters */


  get classname() {
    return 'ClipAsset';
  }

  get isLoaded() {
    return true; // Because nothing is loaded async
  }
  /* Setters */

  /* Methods */


  useClipAsSource(clip) {
    this.timeline = clip.timeline.clone();

    this.timeline._regenUUIDs();
  }

  createInstance() {
    var clip = new Wick.Clip();
    this.useAsSourceForClip(clip);
    this.updateClipFromAsset(clip);
    return clip;
  }

  useAsSourceForClip(clip) {
    this.linkedClips.push(clip);
  }

  removeAsSourceForClip(clip) {
    this.linkedClips = this.linkedClips.filter(checkClip => {
      return checkClip !== clip;
    });
  }

  updateAssetFromClip(clip) {
    this.timeline = clip.timeline.clone();

    this.timeline._regenUUIDs();

    var self = this;
    this.linkedClips.forEach(linkedClip => {
      if (linkedClip === clip) return; // This one should already be synced, of course

      this.updateClipFromAsset(linkedClip);
    });
  }

  updateClipFromAsset(clip) {
    var timeline = this.timeline.clone();

    timeline._regenUUIDs();

    clip.setTimeline(timeline);
  }

  clone(object) {
    if (!object) object = new Wick.ClipAsset();
    super.clone(object);
    object.timeline = this.timeline.clone();
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.timeline = this.timeline.serialize();
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.ButtonAsset = class extends Wick.ClipAsset {
  constructor() {
    super();
  }

  static getMIMETypes() {
    return [];
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    return object;
  }
  /* Getters */


  get classname() {
    return 'ButtonAsset';
  }
  /* Setters */

  /* Methods */


  createInstance() {
    var button = new Wick.Button();
    this.useAsSourceForClip(button);
    return button;
  }

  clone(object) {
    if (!object) object = new Wick.ButtonAsset();
    super.clone(object);
    return object;
  }

  serialize() {
    var data = super.serialize();
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Tickable = class extends Wick.Base {
  constructor() {
    super();
    this.identifier = null;
    this._onscreen = false;
    this._onscreenLastTick = false;
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.identifier = data.identifier;
    return object;
  }
  /* Getters */


  get classname() {
    return 'Tickable';
  }
  /* Setters */

  /* Methods */


  tick() {
    // Update onScreen flags.
    this._onscreenLastTick = this._onscreen;
    this._onscreen = this.onScreen; // Call tick event function that corresponds to state.

    if (!this._onscreen && !this._onscreenLastTick) {
      return this.onInactive();
    } else if (this._onscreen && !this._onscreenLastTick) {
      return this.onActivated();
    } else if (this._onscreen && this._onscreenLastTick) {
      return this.onActive();
    } else if (!this._onscreen && this._onscreenLastTick) {
      return this.onDeactivated();
    }
  }

  onInactive() {
    return 'onInactive';
  }

  onActivated() {
    return 'onActivated';
  }

  onActive() {
    return 'onActive';
  }

  onDeactivated() {
    return 'onDeactivated';
  }

  clone(object) {
    if (!object) object = new Wick.Tickable();
    super.clone(object);
    object.identifier = this.identifier;
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.identifier = this.identifier;
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Frame = class extends Wick.Tickable {
  constructor(start, end) {
    super();
    this.start = start || 1;
    this.end = end || this.start;
    this.script = null;
    this.clips = [];
    this._svgString = '';
    this._svgDom = null;
    this._svgDirty = false;
    this.tweens = [];
    this._soundAssetUUID = null;
    this._soundWantsToPlay = false;
    this._soundWantsToStop = false;
    this._soundStartOffsetMS = 0;
    this.setScript(new Wick.Script());
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.start = data.start;
    object.end = data.end;
    object.script = Wick.Script.deserialize(data.script);
    data.clips.forEach(clipData => {
      object.addClip(Wick.Clip.deserialize(clipData));
    });
    object.svg = data.svg;
    object._soundAssetUUID = data.sound;
    data.tweens.forEach(tweenData => {
      object.addTween(Wick.Tween.deserialize(tweenData));
    });
    return object;
  }
  /* Getters */


  get classname() {
    return 'Frame';
  }

  get length() {
    return this.end - this.start + 1;
  }

  get midpoint() {
    return this.start + (this.end - this.start) / 2;
  }

  get svg() {
    return this._svgString;
  }

  get sound() {
    var uuid = this._soundAssetUUID;
    return uuid ? this.project.assets[uuid] : null;
  }

  get contentful() {
    if (this.clips.length > 0) return true;
    if (this._svgString === '') return false;

    this._parseSVG();

    return this._svgDom.children[0].children.length > 0;
  }

  get soundWantsToPlay() {
    return this._soundWantsToPlay;
  }

  get soundWantsToStop() {
    return this._soundWantsToStop;
  }

  get soundStartOffsetMS() {
    return this._soundStartOffsetMS;
  }
  /* Setters */


  set svg(svgString) {
    this._svgString = svgString;
    this._svgDirty = true;
  }

  set sound(soundAsset) {
    this._soundAssetUUID = soundAsset.uuid;
  }
  /* Methods */


  inPosition(playheadPosition) {
    return this.start <= playheadPosition && this.end >= playheadPosition;
  }

  inRange(start, end) {
    return this.inPosition(start) || this.inPosition(end) || this.start >= start && this.start <= end || this.end >= start && this.end <= end;
  }

  onScreen() {
    return this.inPosition(this.parent.parent.playheadPosition);
  }

  addClip(clip) {
    this.clips.push(clip);

    this._addChild(clip);
  }

  removeClip(clip) {
    this.clips = this.clips.filter(checkClip => {
      return checkClip !== clip;
    });

    this._removeChild(clip);
  }

  addTween(tween) {
    this.tweens.push(tween);

    this._addChild(tween);
  }

  removeTween(tween) {
    this.tweens = this.tweens.filter(checkTween => {
      return checkTween !== tween;
    });

    this._removeChild(tween);
  }

  setScript(script) {
    if (this.script) {
      this._removeChild(this.script);
    }

    this.script = script;

    this._addChild(script);
  }

  onInactive() {
    super.onInactive();
  }

  onActivated() {
    super.onActivated();
    this.script.run();
    this.script.runFn('load');

    if (this.sound) {
      this._soundWantsToPlay = true;
      this._soundStartOffsetMS = this._calculateSoundStartOffsetMS();
    }
  }

  onActive() {
    super.onActive();
    this.script.runFn('update');
  }

  onDeactivated() {
    super.onDeactivated();
    this._soundWantsToStop = true;
  }

  clone(object) {
    if (!object) object = new Wick.Frame();
    super.clone(object);
    object.start = this.start;
    object.end = this.end;
    object.setScript(this.script.clone());
    this.clips.forEach(clip => {
      object.addClip(clip.clone());
    });
    object.svg = this.svg;
    object._soundAssetUUID = this._soundAssetUUID;
    this.tweens.forEach(tween => {
      object.addTween(tween.clone());
    });
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.start = this.start;
    data.end = this.end;
    data.script = this.script.serialize();
    data.clips = this.clips.map(clip => {
      return clip.serialize();
    });
    data.svg = this._svgString;
    data.sound = this._soundAssetUUID;
    data.tweens = this.tweens.map(tween => {
      return tween.serialize();
    });
    return data;
  }

  _parseSVG() {
    if (this._svgDom === null || this._svgDirty) {
      this._svgDirty = false;
      var parser = new DOMParser();
      var doc = parser.parseFromString(this._svgString, "application/xml");
      this._svgDom = doc;
    }
  }

  _calculateSoundStartOffsetMS() {
    var offsetFrames = this.parent.parent.playheadPosition - this.start;
    var offsetMS = offsetFrames * 1000 / this.project.framerate;
    return offsetMS;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Clip = class extends Wick.Tickable {
  constructor() {
    super();
    this.timeline = null;
    this.setTimeline(new Wick.Timeline());
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.opacity = 1;
    this.script = null;
    this.setScript(new Wick.Script());
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    object.x = data.x;
    object.y = data.y;
    object.scaleX = data.scaleX;
    object.scaleY = data.scaleY;
    object.rotation = data.rotation;
    object.opacity = data.opacity;
    object.setTimeline(Wick.Timeline.deserialize(data.timeline));
    object.setScript(Wick.Script.deserialize(data.script));
    return object;
  }
  /* Getters */


  get classname() {
    return 'Clip';
  }
  /* Setters */

  /* Methods */


  setTimeline(timeline) {
    if (this.timeline) {
      this._removeChild(this.timeline);
    }

    this.timeline = timeline;

    this._addChild(this.timeline);
  }

  breakApart() {
    var self = this;
    this.timeline.activeFrames.forEach(frame => {
      frame.clips.forEach(clip => {
        frame.removeClip(clip);
        self.parent.addClip(clip);
      });
    });
    this.parent.removeClip(this);
  }

  onInactive() {
    super.onInactive();
  }

  onActivated() {
    super.onActivated();
    this.script.run();
    this.script.runFn('load');

    this._tickChildren();
  }

  onActive() {
    super.onActive();
    this.script.runFn('update');
    this.timeline.advance();

    this._tickChildren();
  }

  onDeactivated() {
    super.onDeactivated();

    this._tickChildren();
  }

  setScript(script) {
    if (this.script) {
      this._removeChild(this.script);
    }

    this.script = script;

    this._addChild(script);
  }

  _tickChildren() {
    this.timeline.layers.forEach(layer => {
      layer.frames.forEach(frame => {
        frame.tick();
        frame.clips.forEach(clip => {
          clip.tick();
        });
      });
    });
  }

  onScreen() {
    return this.parent.onScreen;
  }

  clone(object) {
    if (!object) object = new Wick.Clip();
    super.clone(object);
    object.x = this.x;
    object.y = this.y;
    object.scaleX = this.scaleX;
    object.scaleY = this.scaleY;
    object.rotation = this.rotation;
    object.opacity = this.opacity;
    object.setTimeline(this.timeline.clone());
    object.setScript(this.script.clone());
    return object;
  }

  serialize() {
    var data = super.serialize();
    data.x = this.x;
    data.y = this.y;
    data.scaleX = this.scaleX;
    data.scaleY = this.scaleY;
    data.rotation = this.rotation;
    data.opacity = this.opacity;
    data.timeline = this.timeline.serialize();
    data.script = this.script.serialize();
    return data;
  }

};
/*Wick Engine https://github.com/Wicklets/wick-engine*/

/*
* Copyright 2018 WICKLETS LLC
*
* This file is part of Wick Engine.
*
* Wick Engine is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Wick Engine is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
*/
Wick.Button = class extends Wick.Clip {
  constructor() {
    super(); // 'out' | 'over' | 'down'

    this._mouseState = 'out';
    this._lastMouseState = 'out';
  }

  static _deserialize(data, object) {
    super._deserialize(data, object);

    return object;
  }
  /* Getters */


  get classname() {
    return 'Button';
  }
  /* Setters */

  /* Methods */


  setMouseState(newState) {
    this._lastMouseState = this._mouseState;
    this._mouseState = newState;
  }

  onInactive() {
    super.onInactive();
  }

  onActivated() {
    super.onActivated();
    this.timeline.playheadPosition = 1;
  }

  onActive() {
    super.onActive();
    this.timeline.playheadPosition = 1;

    if (this._mouseState === 'over') {
      this.timeline.playheadPosition = 2;
    } else if (this._mouseState === 'down') {
      this.timeline.playheadPosition = 3;
    }

    if (this._mouseState === 'over' && this._lastMouseState === 'out') {
      this.script.runFn('rollover');
    } else if (this._mouseState === 'down' && this._lastMouseState === 'over') {
      this.script.runFn('click');
    }
  }

  onDeactivated() {
    super.onDeactivated();
  }

  clone(object) {
    if (!object) object = new Wick.Button(this.prototypeAsset);
    super.clone(object);
    return object;
  }

  serialize() {
    var data = super.serialize();
    return data;
  }

};