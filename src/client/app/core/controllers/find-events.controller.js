;(function() {

  'use strict';

  angular.module('app.core')
    .controller('FindEventsController', FindEventsController);

  /* @ngInject */
  function FindEventsController($http) {
    var vm = this;
    vm.scrapeEvent = scrapeEvent;

    //////////

    function scrapeEvent() {
      console.log('Scraping event', vm.url);
      $http({
        method: 'GET',
        url: '/1/scrape?url=' + vm.url
      }).then(function(res) {
        console.log(res.data);
      }).catch(function(err) {
        console.error('Error scraping page', vm.url);
        console.error(err);
      });
    }

  }

}).call(this);
