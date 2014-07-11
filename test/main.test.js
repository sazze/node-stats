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
});
