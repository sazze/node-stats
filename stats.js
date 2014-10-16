/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2014 Sazze, Inc.
 */

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var defaultOptions = {
  precision: 3,
  sendEvents: false
};

function Stats(opts) {
  EventEmitter.call(this);

  this.options = _.merge({}, defaultOptions, opts);
  this.clear();

  this.on('newListener', function () {
    if (EventEmitter.listenerCount(this, 'stats') > 0) {
      this.enableEvents();
    }
  }.bind(this));

  this.on('removeListener', function () {
    if (EventEmitter.listenerCount(this, 'stats') < 1) {
      this.disableEvents();
    }
  }.bind(this));
}

module.exports.Stats = Stats;

util.inherits(Stats, EventEmitter);

Stats.prototype.clear = function() {
  this.count = 0;
  this.oldMean = 0;
  this.newMean = 0;
  this.oldVariance = 0;
  this.newVariance = 0;
  this.maximum = 0;
  this.minimum = 0;
};

Stats.prototype.load = function (state) {
  _.forEach(this, function (val, name) {
    if (!_.isNumber(val) || _.isUndefined(state[name]) || !_.isNumber(state[name])) {
      return;
    }

    this[name] = state[name];
  }, this);
};

Stats.prototype.mean = function(raw) {
  return this.format((this.count > 0 ? this.newMean : 0), raw);
};

Stats.prototype.variance = function(raw) {
  return this.format((this.count > 1 ? this.newVariance / (this.count - 1) : 0), raw);
};

Stats.prototype.standardDeviation = function(raw) {
  return this.format(Math.sqrt(this.variance(true)), raw);
};

Stats.prototype.min = function(raw) {
  return this.format((this.count > 0 ? this.minimum : 0), raw);
};

Stats.prototype.max = function(raw) {
  return this.format((this.count > 0 ? this.maximum : 0), raw);
};

Stats.prototype.format = function(val, raw) {
  if (!_.isUndefined(raw) && raw) {
    // we want the raw value without formatting
    return val;
  }

  return Math.round(+(val + 'e' + this.options.precision)) / Math.pow(10, this.options.precision);
};

Stats.prototype.push = function(x) {
  this.count++;

  if (this.count == 1) {
    this.oldMean = x;
    this.newMean = x;
    this.oldVariance = 0.0;
    this.minimum = x;
    this.maximum = x;

    this.emit('stats', this.allStats());

    return;
  }

  this.newMean = this.oldMean + (x - this.oldMean) / this.count;
  this.newVariance = this.oldVariance + (x - this.oldMean) * (x - this.newMean);

  this.minimum = Math.min(this.minimum, x);
  this.maximum = Math.max(this.maximum, x);

  // setup for next iteration
  this.oldMean = this.newMean;
  this.oldVariance = this.newVariance;

  // send event
  if (this.options.sendEvents) {
    this.emit('stats', this.allStats());
  }
};

Stats.prototype.allStats = function(raw) {
  return {
    min: this.min(raw),
    max: this.max(raw),
    mean: this.mean(raw),
    sd: this.standardDeviation(raw),
    variance: this.variance(raw)
  };
};

Stats.prototype.enableEvents = function () {
  this.options.sendEvents = true;
};

Stats.prototype.disableEvents = function () {
  this.options.sendEvents = false;
};

Stats.prototype.toJSON = function () {
  return _.pick(this, ['options', 'count', 'oldMean', 'newMean', 'oldVariance', 'newVariance', 'maximum', 'minimum']);
};