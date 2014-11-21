var expect = require('chai').expect;
var Stats = require('../.').Stats;
var _ = require('lodash');

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

describe('Test Running Stats', function () {
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
