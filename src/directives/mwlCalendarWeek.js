'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarWeekCtrl', function($scope, moment, calendarHelper, calendarConfig, calendarEventTitle) {

    var vm = this;

    vm.showTimes = calendarConfig.showTimesOnWeekView;
    vm.calendarEventTitle = calendarEventTitle;

    $scope.$on('calendar.refreshView', function() {
      vm.dayViewSplit = vm.dayViewSplit || 30;
      vm.dayViewHeight = calendarHelper.getDayViewHeight(
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit
      );
      if (vm.showTimes) {
        vm.view = calendarHelper.getWeekViewWithTimes(
          vm.events,
          vm.viewDate,
          vm.dayViewStart,
          vm.dayViewEnd,
          vm.dayViewSplit
        );
      } else {
        vm.view = calendarHelper.getWeekView(vm.events, vm.viewDate, vm.excludedDays);
      }
    });

    vm.weekDragged = function(event, daysDiff, minuteChunksMoved) {
      var newStart = moment(event.startsAt);
      var newEnd = moment(event.endsAt);
      if (newEnd.toDate().getTime() > vm.view.days[vm.view.days.length - 1].date.toDate().getTime()) {
        newEnd = vm.view.days[vm.view.days.length - 1].date;
      }
      if (newStart.toDate().getTime() < vm.view.days[0].date.toDate().getTime()) {
        newStart = vm.view.days[0].date;
      }
      newStart = newStart.add(daysDiff, 'days');
      if (newStart.toDate().getTime() < vm.view.days[0].date.toDate().getTime()) {
        return;
      }
      newEnd = newEnd.add(daysDiff, 'days');
      if (newEnd.toDate().getTime() > vm.view.days[vm.view.days.length - 1].date.toDate().getTime()) {
        return;
      }

      if (minuteChunksMoved) {
        var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
        newStart = newStart.add(minutesDiff, 'minutes');
        newEnd = newEnd.add(minutesDiff, 'minutes');
      }
      delete event.tempStartsAt;
      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: newEnd.toDate()
      });
    };

    vm.eventDropped = function(event, date) {
      var daysDiff = moment(date).diff(moment(event.startsAt), 'days');
      vm.weekDragged(event, daysDiff);
    };

    vm.weekResized = function(event, edge, daysDiff) {
      var startTime = moment(event.startsAt).add(daysDiff, 'days').toDate();
      var endTime = moment(event.endsAt).add(daysDiff, 'days').toDate();
      var start = moment(event.startsAt);
      var end = moment(event.endsAt);
      if (edge === 'start') {
        if (startTime.getTime() < vm.view.days[0].date.toDate().getTime()) {
          start = vm.view.days[0].date;
        }
        start = start.add(daysDiff, 'days');
      } else if(edge === 'end') {
        if (endTime.getTime() > vm.view.days[vm.view.days.length - 1].date.toDate().getTime()) {
          end = vm.view.days[vm.view.days.length - 1].date.add(1, 'days');
        }
        end.add(daysDiff, 'days');
      } else {
        if (startTime.getTime() < vm.view.days[0].date.toDate().getTime()) {
          start = vm.view.days[0].date;
        }
        start = start.add(daysDiff, 'days');
        if (endTime.getTime() > vm.view.days[vm.view.days.length - 1].date.toDate().getTime()) {
          end = vm.view.days[vm.view.days.length - 1].date.add(1, 'days');
        }
        end.add(daysDiff, 'days');
      }
      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: start.toDate(),
        calendarNewEventEnd: end.toDate()
      });

    };

    vm.tempTimeChanged = function(event, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
    };

  })
  .directive('mwlCalendarWeek', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendarWeekView" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        viewDate: '=',
        excludedDays: '=',
        onEventClick: '=',
        onEventTimesChanged: '=',
        dayViewStart: '=',
        dayViewEnd: '=',
        dayViewSplit: '=',
        dayViewEventChunkSize: '=',
        onTimespanClick: '=',
        onDateRangeSelect: '=',
        customTemplateUrls: '=?',
        cellModifier: '=',
        templateScope: '=',
        draggableAutoScroll: '='
      },
      controller: 'MwlCalendarWeekCtrl as vm',
      link: function(scope, element, attrs, calendarCtrl) {
        scope.vm.calendarCtrl = calendarCtrl;
      },
      bindToController: true
    };

  });
