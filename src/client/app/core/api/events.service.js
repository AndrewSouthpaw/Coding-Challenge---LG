;(function() {

  'use strict';

  angular.module('app.core')
    .factory('events', events);

  /* @ngInject */
  function events($http) {
    var service = {
      // Data
      events: [],

      // Methods
      scrapeEventsPage: scrapeEventsPage
    };

    return service;

    //////////

    function scrapeEventsPage(url) {
      $http({
        method: 'GET',
        url: url
      }).then(function(res) {
        console.log(res.data);
        service.events.events = res.data;
      }).catch(function(err) {
        console.error('Error scraping page', url);
        console.error(err);
      });
    }

  }

}).call(this);
