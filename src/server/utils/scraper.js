'use strict';

var cheerio = require('cheerio');
var VError = require('verror');

module.exports = {
  scrapeEvents: scrapeEvents
};

///////////////

/**
 * General handler to scrape events from website data. Delegates to specialized
 * scraper logic based on url.
 * @param  {String} url  Website url
 * @param  {String} body Raw request data from page
 * @return {Array}       List of events
 */
function scrapeEvents(url, body) {

  console.log('Parsing events for', url);

  // available specialized scraper logic
  var actions = {
    stanford: scrapeEventsStanford
  };

  // Choose specialized parser based on URL
  var method = '';
  if (/stanford/.test(url)) {
    method = 'stanford';
  } else {
    throw new VError('Couldn\'t find parser logic for %s', url);
  }

  // parse HTML into events
  var $ = cheerio.load(body);
  var parsedData = actions[method]($);

  // Log number of parse errors
  console.log('Error parsing', parsedData.numParseErrors,
              'out of', parsedData.results.length + parsedData.numParseErrors);

  // response with results
  return parsedData.results;
}

/**
 * Specialized scraper for http://events.stanford.edu
 * @param  {Cheerio data} $ DOM tree parsed by Cheerio of webpage
 * @return {Object}   Number of errors parsing and list of events
 */
function scrapeEventsStanford($) {
  var results = [];
  var numParseErrors = 0;

  $('.postcard-text').each(function() {
    // Check to see if date will parse successfully
    var date = $(this).find('p strong').text().replace(/\s+/g, ' ');
    if (isNaN(new Date(date))) return numParseErrors++;

    // Otherwise, build a new event
    var eventData = {};
    eventData.name = $(this).find('h3').text().replace(/\s+/g, ' ').trim();
    eventData.date = new Date(date);
    results.push(eventData);
  });

  return {numParseErrors: numParseErrors, results: results};
}
