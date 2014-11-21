/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2014 Sazze, Inc.
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Stats = require('./stats');
var net = require('net');
var moment = require('moment');
var _ = require('lodash');

function ConnectionTracker(server, interval, callback) {
  EventEmitter.call(this);

  if (_.isFunction(interval)) {
    callback = interval;
    interval = null;
  }

  this.openConnections = 0;
  this.openConnectionsReport = new Stats();
  this.responseTimeReport = new Stats();
  this.connectionErrorsReport = new Stats();
  this.reportInterval = interval || 1000;   // interval that reports cover (in milliseconds)
  this.connectionErrors = 0;

  if (_.isFunction(callback)) {
    this.on('report', callback);
  }

  this.trackServer(server);

  this.scheduleNextReport();
}

util.inherits(ConnectionTracker, EventEmitter);

module.exports = ConnectionTracker;

ConnectionTracker.prototype.sendReport = function () {
  this.emit('report', {
    reports: {
      openConnections: this.openConnectionsReport.allStats(),
      responseTime: this.responseTimeReport.allStats(),
      connectionErrors: this.connectionErrorsReport.allStats()
    },
    interval: this.reportInterval
  });

  this.openConnectionsReport.clear();
  this.responseTimeReport.clear();
  this.connectionErrorsReport.clear();

  this.connectionErrors = 0;

  this.scheduleNextReport();
};

ConnectionTracker.prototype.scheduleNextReport = function() {
  setTimeout(this.sendReport.bind(this), this.reportInterval).unref();
};

ConnectionTracker.prototype.trackServer = function (server) {
  // verify this is a net.Server
  if (!(server instanceof net.Server)) {
    throw new Error('server must be an instance of net.Server');
  }

  server.on('connection', function (socket) {
    var startTime = moment();

    this.openConnectionsReport.push(++this.openConnections);

    socket.on('close', function (hadError) {
      this.openConnections--;

      if (hadError) {
        this.connectionErrorsReport.push(++this.connectionErrors);
      }

      this.responseTimeReport.push(moment().diff(startTime));
    }.bind(this));
  }.bind(this));

  server.on('close', function () {
    this.openConnections = 0;
  }.bind(this));
};
