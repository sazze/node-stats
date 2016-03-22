var expect = require('chai').expect;
var Stats = require('../.').Stats;
var ConnectionTracker = require('../.').ConnectionTracker;
var _ = require('lodash');
var net = require('net');

describe('Running Stats', function () {
  var testData = [
    {
      data: [],
      results: {
        mean: 0,
        variance: 0,
        standardDeviation: 0,
        min: 0,
        max: 0
      }
    },
    {
      data: [1, 2, 3, 4, 5],
      results: {
        mean: 3,
        variance: 2.5,
        standardDeviation: 1.581,
        min: 1,
        max: 5
      }
    }
  ];

  var stats;

  it('should calculate the correct stats', function () {
    _.each(testData, function (test) {
      stats = new Stats();

      _.each(test.data, function (val) {
        stats.push(val);
      });

      expect(stats.mean()).to.equal(test.results.mean);
      expect(stats.variance()).to.equal(test.results.variance);
      expect(stats.standardDeviation()).to.equal(test.results.standardDeviation);
      expect(stats.min()).to.equal(test.results.min);
      expect(stats.max()).to.equal(test.results.max);
    });
  });

  it('should emit stats event', function (done) {
    var data = testData[1];

    stats = new Stats();

    stats.once('stats', function (statsObj) {
      expect(statsObj).to.be.an('object');
      expect(statsObj).to.have.property('mean');
      expect(statsObj).to.have.property('min');
      expect(statsObj).to.have.property('max');
      expect(statsObj).to.have.property('sd');
      expect(statsObj).to.have.property('variance');

      done();
    });

    stats.push(data.data[0]);
  });

  it('should convert to/from JSON', function () {
    var data = testData[1];
    var expectedJson = '{"options":{"precision":3,"sendEvents":false},"count":5,"oldMean":3,"newMean":3,"oldVariance":10,"newVariance":10,"maximum":5,"minimum":1}';

    stats = new Stats();

    _.each(data.data, function (val) {
      stats.push(val);
    });

    expect(stats.mean()).to.equal(data.results.mean);
    expect(stats.variance()).to.equal(data.results.variance);
    expect(stats.standardDeviation()).to.equal(data.results.standardDeviation);
    expect(stats.min()).to.equal(data.results.min);
    expect(stats.max()).to.equal(data.results.max);

    var json = JSON.stringify(stats);

    expect(json).to.equal(expectedJson);

    var stats = new Stats();

    expect(stats.mean()).to.not.equal(data.results.mean);
    expect(stats.variance()).to.not.equal(data.results.variance);
    expect(stats.standardDeviation()).to.not.equal(data.results.standardDeviation);
    expect(stats.min()).to.not.equal(data.results.min);
    expect(stats.max()).to.not.equal(data.results.max);

    stats.load(JSON.parse(json));

    expect(stats.mean()).to.equal(data.results.mean);
    expect(stats.variance()).to.equal(data.results.variance);
    expect(stats.standardDeviation()).to.equal(data.results.standardDeviation);
    expect(stats.min()).to.equal(data.results.min);
    expect(stats.max()).to.equal(data.results.max);
  });
});

describe('Connection Tracker', function () {
  it('should track connections', function (done) {
    var server = net.createServer(function (conn) {
      conn.pipe(conn);
    });

    var tracker = new ConnectionTracker(server, 50, function (reports) {
      //console.log(reports);

      expect(reports).to.be.an('object');
      expect(reports).to.have.property('reports');
      expect(reports.reports).to.be.an('object');
      expect(reports).to.have.property('interval');
      expect(reports.interval).to.be.a('number');
      expect(reports.interval).to.equal(50);
      expect(reports.reports).to.have.property('openConnections');
      expect(reports.reports.openConnections).to.be.an('object');
      expect(reports.reports.openConnections).to.have.property('min');
      expect(reports.reports.openConnections.min).to.be.a('number');
      expect(reports.reports.openConnections).to.have.property('max');
      expect(reports.reports.openConnections.max).to.be.a('number');
      expect(reports.reports.openConnections).to.have.property('sd');
      expect(reports.reports.openConnections.sd).to.be.a('number');
      expect(reports.reports.openConnections).to.have.property('mean');
      expect(reports.reports.openConnections.mean).to.be.a('number');
      expect(reports.reports.openConnections).to.have.property('variance');
      expect(reports.reports.openConnections.variance).to.be.a('number');
      expect(reports.reports).to.have.property('responseTime');
      expect(reports.reports.responseTime).to.be.an('object');
      expect(reports.reports.responseTime).to.have.property('min');
      expect(reports.reports.responseTime.min).to.be.a('number');
      expect(reports.reports.responseTime).to.have.property('max');
      expect(reports.reports.responseTime.max).to.be.a('number');
      expect(reports.reports.responseTime).to.have.property('sd');
      expect(reports.reports.responseTime.sd).to.be.a('number');
      expect(reports.reports.responseTime).to.have.property('mean');
      expect(reports.reports.responseTime.mean).to.be.a('number');
      expect(reports.reports.responseTime).to.have.property('variance');
      expect(reports.reports.responseTime.variance).to.be.a('number');
      expect(reports.reports).to.have.property('connectionErrors');
      expect(reports.reports.connectionErrors).to.be.an('object');
      expect(reports.reports.connectionErrors).to.have.property('min');
      expect(reports.reports.connectionErrors.min).to.be.a('number');
      expect(reports.reports.connectionErrors).to.have.property('max');
      expect(reports.reports.connectionErrors.max).to.be.a('number');
      expect(reports.reports.connectionErrors).to.have.property('sd');
      expect(reports.reports.connectionErrors.sd).to.be.a('number');
      expect(reports.reports.connectionErrors).to.have.property('mean');
      expect(reports.reports.connectionErrors.mean).to.be.a('number');
      expect(reports.reports.connectionErrors).to.have.property('variance');
      expect(reports.reports.connectionErrors.variance).to.be.a('number');

      expect(reports.reports.openConnections.min).to.equal(1);
      expect(reports.reports.openConnections.max).to.equal(2);

      server.close(done);
    });

    server.listen(0, function () {
      var address = server.address();

      var socket = net.connect(address.port, function () {
        socket.write('echo\r\n');
      });

      socket.on('data', function (data) {
        socket.end();
      });

      var socket2 = net.connect(address.port, function () {
        socket2.write('echo2\r\n');
      });

      socket2.on('data', function (data) {
        socket2.end();
      });
    });
  });
});