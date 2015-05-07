'use strict';

var request = require('request');
var reportError = require('../../utils/errorReporter');
var utils = require('../../utils/scraper');
var VError = require('verror');

module.exports = {
  scrapeEvents: scrapeEvents
};

/////////////////

/**
 * Scrapes HTML from a queried website, runs it through a scraping utility
 * and returns the collected events in JSON format stringified, e.g.:
 * [
 *   {
 *     "name": "Big awesome party",
 *     "date": ISO format
 *   },
 *   {
 *     ...
 *   }
 * ]
 *
 * Currently only works for http://events.stanford.edu
 *
 * @param  {object}   req  Request
 * @param  {object}   res  Response
 * @param  {Function} next Next middleware
 * @return {string}        JSON stringified
 */
function scrapeEvents(req, res, next) {

  var url = req.query.url;

  request(url, function(err, resp, body) {
    if (err) return reportError(new VError(err, 'Error requesting url'), next);

    // Delegate to utility module for scraping logic
    var results;
    try {
      results = utils.scrapeEvents(url, body);
      return res.json(results);
    } catch (e) {
      return reportError(e, next, 'Error scraping event');
    }
  });

}