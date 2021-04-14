'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarDayCtrl', function($scope, $window, $timeout, moment, calendarHelper, calendarEventTitle) {

    var vm = this;

    vm.calendarEventTitle = calendarEventTitle;

    function refreshView() {

      vm.showAllDayEventTips = false;

      vm.timeHidden = vm.dayViewTimePosition === 'hidden';
      vm.dayViewTimePositionOffset = vm.dayViewTimePosition !== 'default' ? 0 : 60;

      vm.dayViewSplit = vm.dayViewSplit || 30;
      vm.dayViewHeight = calendarHelper.getDayViewHeight(
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit,
        vm.dayViewSegmentSize
      );
      angular.forEach(vm.events, function(dayEvent) {
        var a1 = new Date(dayEvent.startsAt);
        var a2 = new Date(dayEvent.endsAt);
        //判断时间差;
        var total = (a2.getTime() - a1.getTime()) / 1000;//相差的秒数;
        var endTime = parseInt(total / ( 60 * 60));//计算是否超过24小时;
        if (endTime >= 24) {
          dayEvent.allDay = true;
        } else {
          let secondary = '';
          if (dayEvent.calendarFlag == 1) {
            // 日程
            secondary = 'rgba(36, 161, 72, 0.15)';
          } else if (dayEvent.calendarFlag == 2) {
            // 任务
            secondary = 'rgba(54, 168, 199, 0.15)';
            if (dayEvent.calendarStatus == 2) {
              secondary = 'rgba(251, 105, 99, 0.15)';
            }
          } else if (dayEvent.calendarFlag == 3) {
            // 发布计划
            secondary = 'rgba(36, 161, 72, 0.15)';
          }
          let color = {secondary: secondary};
          dayEvent.color = color;
        }
      });
      var view = calendarHelper.getDayView(
        vm.events,
        vm.viewDate,
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit,
        vm.dayViewEventWidth,
        vm.dayViewSegmentSize
      );
      
      vm.allDayEvents = view.allDayEvents;
      vm.nonAllDayEvents = view.events;
      vm.viewWidth = view.width + 62;
      
    }

    $scope.$on('calendar.refreshView', refreshView);

    $scope.$watchGroup([
      'vm.dayViewStart',
      'vm.dayViewEnd',
      'vm.dayViewSplit'
    ], refreshView);

    vm.showAllDayOver = function() {
      $timeout(function() {
        if (vm.showAllDayEventTips === true) {
          vm.showAllDayEventTips = false;
        } else {
          vm.showAllDayEventTips = true;
        }
        $scope.$apply();
      }, 100);
    }

    $window.onclick = function(event) {
      if(event.srcElement && event.srcElement.className.indexOf('myShowClass')===-1) {
        vm.showAllDayEventTips = false;
        $scope.$apply();
      }
    };

    vm.eventDragComplete = function(event, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      var newStart = moment(event.startsAt).add(minutesDiff, 'minutes');
      var newEnd = moment(event.endsAt).add(minutesDiff, 'minutes');
      delete event.tempStartsAt;

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: event.endsAt ? newEnd.toDate() : null
      });
    };

    vm.eventDragged = function(event, minuteChunksMoved) {
      
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
    };

    vm.eventResizeComplete = function(event, edge, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      var start = moment(event.startsAt);
      var end = moment(event.endsAt);
      if (edge === 'start') {
        start.add(minutesDiff, 'minutes');
      } else {
        end.add(minutesDiff, 'minutes');
      }
      delete event.tempStartsAt;

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: start.toDate(),
        calendarNewEventEnd: end.toDate()
      });
    };

    vm.eventResized = function(event, edge, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      if (edge === 'start') {
        event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
      }
    };

  })
  .directive('mwlCalendarDay', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendarDayView" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        viewDate: '=',
        onEventClick: '=',
        onEventTimesChanged: '=',
        onTimespanClick: '=',
        onDateRangeSelect: '=',
        dayViewStart: '=',
        dayViewEnd: '=',
        dayViewSplit: '=',
        dayViewEventChunkSize: '=',
        dayViewSegmentSize: '=',
        dayViewEventWidth: '=',
        customTemplateUrls: '=?',
        cellModifier: '=',
        templateScope: '=',
        dayViewTimePosition: '=',
        draggableAutoScroll: '='
      },
      controller: 'MwlCalendarDayCtrl as vm',
      bindToController: true
    };

  });
