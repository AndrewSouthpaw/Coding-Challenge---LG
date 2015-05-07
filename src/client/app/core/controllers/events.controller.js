;(function() {

  'use strict';

  angular.module('app.core')
    .controller('EventsController', EventsController);

  /* @ngInject */
  function EventsController() {
    var vm = this;

    // Data
    vm.events = [];

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
  }

}).call(this);
