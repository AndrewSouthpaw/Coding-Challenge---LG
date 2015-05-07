'use strict';

var request = require('request');
var cheerio = require('cheerio');
var verror = require('verror');
var reportError = require('../../utils/errorReporter');

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

    console.log('Parsing events for', url);

    var $ = cheerio.load(body);
    var results = [];
    var numParseErrors = 0;

    $('.postcard-text').each(function() {
      // Check to see if date will parse successfully
      var date = $(this).find('p strong').text().replace(/\s+/g, ' ');
      if (isNaN(new Date(date))) return numParseErrors++;

      // Otherwise, build a new event
      var eventData = {};
      eventData.name = $(this).find('h3').text().replace(/\s+/g, ' ').trim();
      eventData.date = $(this).find('p strong').text().replace(/\s+/g, ' ');
      results.push(eventData);
    });

    // Log number of parse errors
    console.log('Error parsing', numParseErrors, 'out of', results.length + numParseErrors);

    res.json(results);
  });

}
