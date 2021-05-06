'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarMonthCtrl', function($scope, moment, calendarHelper, calendarConfig, calendarEventTitle) {

    var vm = this;
    vm.calendarConfig = calendarConfig;
    vm.calendarEventTitle = calendarEventTitle;
    vm.openRowIndex = null;

    function toggleCell() {
      vm.openRowIndex = null;
      vm.openDayIndex = null;

      if (vm.cellIsOpen && vm.view && vm.weekDays) {
        vm.view.forEach(function(day, dayIndex) {
          if (moment(vm.viewDate).startOf('day').isSame(day.date)) {
            vm.openDayIndex = dayIndex;
            vm.openRowIndex = Math.floor(dayIndex / vm.weekDays.length);
          }
        });
      }
    }

    $scope.$on('calendar.refreshView', function() {

      vm.weekDays = calendarHelper.getWeekDayNames(vm.excludedDays);

      var monthView = calendarHelper.getMonthView(vm.events, vm.viewDate, vm.cellModifier, vm.excludedDays);
      vm.view = monthView.days;
      vm.monthOffsets = monthView.rowOffsets;

      function comparator(o1, o2) {
        return new Date(o1.startsAt).getTime() - new Date(o2.startsAt).getTime();
      }
      vm.view.forEach(day => {
          day.more = false;
          day.events.sort(comparator);
          //cell height except day label & triangle down
          let cellHeight = 102;
          day.events.forEach((event, $index) => {
            cellHeight -= event.calendarFlag == 3 ? 48 : 20 - 4;
            console.log(cellHeight);
            if (cellHeight > 0) {
              if (undefined == event.show) {
                event.show = true;
              }
            } else {
              if (undefined == event.show) {
                event.show = false;
              }
              day.more = true;
            }
          })
          console.log(day.events);
      })

      if (vm.cellAutoOpenDisabled) {
        toggleCell();
      } else if (!vm.cellAutoOpenDisabled && vm.cellIsOpen && vm.openRowIndex === null) {
        //Auto open the calendar to the current day if set
        vm.openDayIndex = null;
        vm.view.forEach(function(day) {
          if (day.inMonth && moment(vm.viewDate).startOf('day').isSame(day.date)) {
            vm.dayClicked(day, true);
          }
        });
      }

    });

    vm.dayClicked = function(day, dayClickedFirstRun, $event) {

      if (!dayClickedFirstRun) {
        vm.onTimespanClick({
          calendarDate: day.date.toDate(),
          calendarCell: day,
          $event: $event
        });
        if ($event && $event.defaultPrevented) {
          return;
        }
      }

      if (!vm.cellAutoOpenDisabled) {
        vm.openRowIndex = null;
        var dayIndex = vm.view.indexOf(day);
        if (dayIndex === vm.openDayIndex) { //the day has been clicked and is already open
          vm.openDayIndex = null; //close the open day
          vm.cellIsOpen = false;
        } else {
          vm.openDayIndex = dayIndex;
          vm.openRowIndex = Math.floor(dayIndex / vm.weekDays.length);
          vm.cellIsOpen = true;
        }
      }

    };

    vm.highlightEvent = function(event, shouldAddClass) {

      vm.view.forEach(function(day) {
        delete day.highlightClass;
        delete day.backgroundColor;
        if (shouldAddClass) {
          var dayContainsEvent = day.events.indexOf(event) > -1;
          if (dayContainsEvent) {
            day.backgroundColor = event.color ? event.color.secondary : '';
          }
        }
      });

    };

    vm.handleEventDrop = function(event, newDayDate, draggedFromDate) {

      var newStart = moment(event.startsAt)
        .year(moment(newDayDate).year())
        .month(moment(newDayDate).month())
        .date(moment(newDayDate).date());

      var newEnd = calendarHelper.adjustEndDateFromStartDiff(event.startsAt, newStart, event.endsAt);

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarDate: newDayDate,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: newEnd ? newEnd.toDate() : null,
        calendarDraggedFromDate: draggedFromDate
      });
    };

    vm.getWeekNumberLabel = function(day) {
      var weekNumber = day.date.clone().add(1, 'day').isoWeek();
      if (typeof calendarConfig.i18nStrings.weekNumber === 'function') {
        return calendarConfig.i18nStrings.weekNumber({weekNumber: weekNumber});
      } else {
        return calendarConfig.i18nStrings.weekNumber.replace('{week}', weekNumber);
      }
    };

    vm.onDragSelectStart = function(day) {
      if (!vm.dateRangeSelect) {
        vm.dateRangeSelect = {
          startDate: day.date,
          endDate: day.date
        };
      }
    };

    vm.onDragSelectMove = function(day) {
      if (vm.dateRangeSelect) {
        vm.dateRangeSelect.endDate = day.date;
      }
    };

    vm.onDragSelectEnd = function(day) {
      if (vm.dateRangeSelect) {
        vm.dateRangeSelect.endDate = day.date;
        if (vm.dateRangeSelect.endDate > vm.dateRangeSelect.startDate) {
          vm.onDateRangeSelect({
            calendarRangeStartDate: vm.dateRangeSelect.startDate.clone().startOf('day').toDate(),
            calendarRangeEndDate: vm.dateRangeSelect.endDate.clone().endOf('day').toDate()
          });
        }
        delete vm.dateRangeSelect;
      }
    };

    vm.$onInit = function() {

      if (vm.cellAutoOpenDisabled) {
        $scope.$watchGroup([
          'vm.cellIsOpen',
          'vm.viewDate'
        ], toggleCell);
      }

    };

    if (angular.version.minor < 5) {
      vm.$onInit();
    }

  })
  .directive('mwlCalendarMonth', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendarMonthView" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        viewDate: '=',
        excludedDays: '=',
        onEventClick: '=',
        onEventTimesChanged: '=',
        onDateRangeSelect: '=',
        cellIsOpen: '=',
        cellAutoOpenDisabled: '=',
        onTimespanClick: '=',
        cellModifier: '=',
        slideBoxDisabled: '=',
        customTemplateUrls: '=?',
        templateScope: '=',
        draggableAutoScroll: '='
      },
      controller: 'MwlCalendarMonthCtrl as vm',
      link: function(scope, element, attrs, calendarCtrl) {
        scope.vm.calendarCtrl = calendarCtrl;
      },
      bindToController: true
    };
  });