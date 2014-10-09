var expect = require('chai').expect;
var Stats = require('../stats').Stats;
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
  it('should calculate the correct stats', function (done) {
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

    done();
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
});
