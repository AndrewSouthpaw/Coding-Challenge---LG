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
function scrapeEvents(url, body, cb) {

  console.log('Parsing events for', url);

  // available specialized scraper logic
  var actions = {
    eventbrite: scrapeEventsEventbrite,
    meetup: scrapeEventsMeetup,
    stanford: scrapeEventsStanford
  };

  // Choose specialized parser based on URL
  var method = '';
  if (/stanford/.test(url)) {
    method = 'stanford';
  } else if (/meetup/.test(url)) {
    method = 'meetup';
  } else if (/eventbrite/.test(url)) {
    method = 'eventbrite';
  } else {
    throw new VError('Couldn\'t find parser logic for %s', url);
  }

  // parse HTML into events
  var $ = cheerio.load(body);
  var parsedData = actions[method]($, url, function(numParseErrors, results) {

    // Log number of parse errors
    console.log('Error parsing', numParseErrors,
                'out of', results.length + numParseErrors);

    // respond with results
    cb(results);
  });
}

/**
 * Specialized scraper for Eventbrite. Uses PhantomJS.
 * @param  {Cheerio data}   $   DOM parsed tree
 * @param  {String}   url Original url
 * @param  {Function} cb  Callback
 * @return {undefined}
 */
function scrapeEventsEventbrite($, url, cb) {
  var results = [];
  var numParseErrors = 0;

  /**
   * Eventbrite loads events dynamically, so a simple scraping will not work.
   * Instead, navigate to site using Phantom to extract data.
   *
   * Phantom logic modified from http://code.tutsplus.com/tutorials/screen-scraping-with-nodejs--net-25560
   */
  var phantom = require('phantom');
  phantom.create(function(ph) {
    return ph.createPage(function(page) {
      return page.open(url, function(status) {
        page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
          return page.evaluate(function() {
            var results = [];
            var numParseErrors = 0;
            $('.event-poster').each(function() {
              // check for malformed date
              var date = new Date($(this).find('.event-poster__date')
                                    .text()
                                    .replace(/\s+/g, ' ')
                                    .replace(/None/, new Date().getFullYear()));
              if (isNaN(date)) return numParseErrors++;

              // Otherwise, build event
              var eventData = {};
              eventData.name = $(this).find('.event-poster__title').text().trim();
              eventData.date = date;
              results.push(eventData);
            });

            return {numParseErrors: numParseErrors, results: results};
          }, function(result) {
            ph.exit();
            cb(result.numParseErrors, result.results)
          });
        });
      });
    });
  });
}

/**
 * Specialized scraper for Meetup search
 * @param  {Cheerio data} $ DOM tree parsed by Cheerio of webpage
 * @return {Object}   Number of errors parsing and list of events
 */
function scrapeEventsMeetup($, url, cb) {
  var results = [];
  var numParseErrors = 0;

  $('.event-listing').each(function() {
    // Check to see if date will parse successfully
    var date = new Date($(this).find('time[itemprop="startDate"]').attr('datetime'));
    if (isNaN(date)) return numParseErrors++;

    // Otherwise, build a new event
    var eventData = {};
    eventData.name = $(this).find('.event-title span').text();
    eventData.date = date;
    results.push(eventData);
  });

  cb(numParseErrors, results);
}

/**
 * Specialized scraper for http://events.stanford.edu
 * @param  {Cheerio data} $ DOM tree parsed by Cheerio of webpage
 * @return {Object}   Number of errors parsing and list of events
 */
function scrapeEventsStanford($, url, cb) {
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

  cb(numParseErrors, results);
}
