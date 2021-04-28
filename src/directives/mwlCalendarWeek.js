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
      // debugger
      for (let eventRow of vm.view.eventRows) {
        if (eventRow) {
          for (let row of eventRow.row) {
            let startDayNumber = moment(row.startsAt).format('D');
            let endDayNumber = moment(row.endsAt).format('D');
            console.log(startDayNumber + "--" + endDayNumber);
          }
        }
      }
    });

    vm.weekDragged = function(event, daysDiff, minuteChunksMoved) {
      // debugger
      var newStart = moment(event.startsAt);
      var newEnd = moment(event.endsAt);
      if (newEnd.toDate().getTime() > moment().endOf('week').toDate().getTime()) {
        let endStrTime = moment(newEnd).format('HH:mm:ss');
        let endStrYear = moment().endOf('week').format('YYYY-MM-DD');
        newEnd = moment(moment(endStrYear + " " + endStrTime, "YYYY-MM-DD HH:mm:ss").toDate());
      }
      if (newStart.toDate().getTime() < moment().startOf('week').toDate().getTime()) {
        let startStrTime = moment(newStart).format('HH:mm:ss');
        let startStrYear = moment().startOf('week').format('YYYY-MM-DD');
        newStart = moment(moment(startStrYear + " " + startStrTime, "YYYY-MM-DD HH:mm:ss").toDate());
      }
      newStart = moment(newStart.add(daysDiff, 'days')._d);
      if (newStart._d.getTime() < moment().startOf('week').toDate().getTime()) {
        return;
      }
      newEnd = moment(moment(newEnd._i).add(daysDiff, 'days')._d);
      // debugger
      if (newEnd._d.getTime() > moment().endOf('week').toDate().getTime()) {
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
