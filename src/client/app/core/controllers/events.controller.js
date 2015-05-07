;(function() {

  'use strict';

  angular.module('app.core')
    .controller('EventsController', EventsController);

  /* @ngInject */
  function EventsController($scope, events) {
    var vm = this;

    // Data
    vm.events = events.events;

    // Methods
    vm.displayEvents = displayEvents;

    /////////////

    /**
     * Updates events with new list of events passed as param
     * @param  {Array} events List of new events to display
     * @return {undefined}
     */
    function displayEvents(events) {
      vm.events = events;
    }

    /**
     * Listen for changes to events listing
     */
    $scope.$watch(function() {
      return events.events;
    }, function(newValue) {
      vm.events = events.events;
    });
  }

}).call(this);
