'use strict';

var angular = require('angular');
var LOG_PREFIX = 'Bootstrap calendar:';

angular
  .module('mwl.calendar')
  .controller('MwlCalendarCtrl', function($scope, $log, $timeout, $attrs, $locale, moment, calendarTitle, calendarHelper) {
    
    moment.locale('zh-cn',{
      months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
      monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
      weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
      weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
      weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
      longDateFormat : {
          LT : 'Ah点mm分',
          LTS : 'Ah点m分s秒',
          L : 'YYYY-MM-DD',
          LL : 'YYYY年MMMD日',
          LLL : 'YYYY年MMMD日Ah点mm分',
          LLLL : 'YYYY年MMMD日ddddAh点mm分',
          l : 'YYYY-MM-DD',
          ll : 'YYYY年MMMD日',
          lll : 'YYYY年MMMD日Ah点mm分',
          llll : 'YYYY年MMMD日ddddAh点mm分'
      },
      meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
      meridiemHour: function (hour, meridiem) {
          if (hour === 12) {
              hour = 0;
          }
          if (meridiem === '凌晨' || meridiem === '早上' ||
                  meridiem === '上午') {
              return hour;
          } else if (meridiem === '下午' || meridiem === '晚上') {
              return hour + 12;
          } else {
              // '中午'
              return hour >= 11 ? hour : hour + 12;
          }
      },
      meridiem : function (hour, minute, isLower) {
          var hm = hour * 100 + minute;
          if (hm < 600) {
              return '凌晨';
          } else if (hm < 900) {
              return '早上';
          } else if (hm < 1130) {
              return '上午';
          } else if (hm < 1230) {
              return '中午';
          } else if (hm < 1800) {
              return '下午';
          } else {
              return '晚上';
          }
      },
      calendar : {
          sameDay : function () {
              return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
          },
          nextDay : function () {
              return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
          },
          lastDay : function () {
              return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
          },
          nextWeek : function () {
              var startOfWeek, prefix;
              startOfWeek = moment().startOf('week');
              prefix = this.diff(startOfWeek, 'days') >= 7 ? '[下]' : '[本]';
              return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
          },
          lastWeek : function () {
              var startOfWeek, prefix;
              startOfWeek = moment().startOf('week');
              prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
              return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
          },
          sameElse : 'LL'
      },
      ordinalParse: /\d{1,2}(日|月|周)/,
      ordinal : function (number, period) {
          switch (period) {
          case 'd':
          case 'D':
          case 'DDD':
              return number + '日';
          case 'M':
              return number + '月';
          case 'w':
          case 'W':
              return number + '周';
          default:
              return number;
          }
      },
      relativeTime : {
          future : '%s内',
          past : '%s前',
          s : '几秒',
          m : '1 分钟',
          mm : '%d 分钟',
          h : '1 小时',
          hh : '%d 小时',
          d : '1 天',
          dd : '%d 天',
          M : '1 个月',
          MM : '%d 个月',
          y : '1 年',
          yy : '%d 年'
      },
      week : {
          // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
          dow : 1, // Monday is the first day of the week.
          doy : 4  // The week that contains Jan 4th is the first week of the year.
      }
  });

    var vm = this;

    vm.changeView = function(view, newDay) {
      vm.view = view;
      vm.viewDate = newDay;
    };

    vm.dateClicked = function(date) {

      var rawDate = moment(date).toDate();

      var nextView = {
        year: 'month',
        month: 'day',
        week: 'day'
      };

      if (vm.onViewChangeClick({calendarDate: rawDate, calendarNextView: nextView[vm.view]}) !== false) {
        vm.changeView(nextView[vm.view], rawDate);
      }

    };

    vm.$onInit = function() {

      if (vm.slideBoxDisabled) {
        $log.warn(LOG_PREFIX, 'The `slide-box-disabled` option is deprecated and will be removed in the next release. ' +
          'Instead set `cell-auto-open-disabled` to true');
      }

      vm.events = vm.events || [];
      vm.excludedDays = vm.excludedDays || [];

      var previousDate = moment(vm.viewDate);
      var previousView = vm.view;

      function checkEventIsValid(event) {
        if (!event.startsAt) {
          $log.warn(LOG_PREFIX, 'Event is missing the startsAt field', event);
        } else if (!angular.isDate(event.startsAt)) {
          $log.warn(LOG_PREFIX, 'Event startsAt should be a javascript date object. Do `new Date(event.startsAt)` to fix it.', event);
        }

        if (event.endsAt) {
          if (!angular.isDate(event.endsAt)) {
            $log.warn(LOG_PREFIX, 'Event endsAt should be a javascript date object. Do `new Date(event.endsAt)` to fix it.', event);
          }
          if (moment(event.startsAt).isAfter(moment(event.endsAt))) {
            $log.warn(LOG_PREFIX, 'Event cannot start after it finishes', event);
          }
        }
      }

      function refreshCalendar() {

        if (calendarTitle[vm.view] && angular.isDefined($attrs.viewTitle)) {
          vm.viewTitle = calendarTitle[vm.view](vm.viewDate);
        }

        vm.events.forEach(function(event, index) {
          checkEventIsValid(event);
          event.calendarEventId = index;
        });

        //if on-timespan-click="calendarDay = calendarDate" is set then don't update the view as nothing needs to change
        var currentDate = moment(vm.viewDate);
        var shouldUpdate = true;
        if (
          previousDate.clone().startOf(vm.view).isSame(currentDate.clone().startOf(vm.view)) &&
          !previousDate.isSame(currentDate) &&
          vm.view === previousView
        ) {
          shouldUpdate = false;
        }
        previousDate = currentDate;
        previousView = vm.view;

        if (shouldUpdate) {
          // a $timeout is required as $broadcast is synchronous so if a new events array is set the calendar won't update
          $timeout(function() {
            $scope.$broadcast('calendar.refreshView');
          });
        }
      }

      calendarHelper.loadTemplates().then(function() {
        vm.templatesLoaded = true;

        var eventsWatched = false;

        //Refresh the calendar when any of these variables change.
        $scope.$watchGroup([
          'vm.viewDate',
          'vm.view',
          'vm.cellIsOpen',
          function() {
            return moment.locale() + $locale.id; //Auto update the calendar when the locale changes
          }
        ], function() {
          if (!eventsWatched) {
            eventsWatched = true;
            //need to deep watch events hence why it isn't included in the watch group
            $scope.$watch('vm.events', refreshCalendar, true); //this will call refreshCalendar when the watcher starts (i.e. now)
          } else {
            refreshCalendar();
          }
        });

      }).catch(function(err) {
        $log.error('Could not load all calendar templates', err);
      });

    };

    if (angular.version.minor < 5) {
      vm.$onInit();
    }

  })
  .directive('mwlCalendar', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendar" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      scope: {
        events: '=',
        view: '=',
        viewTitle: '=?',
        viewDate: '=',
        cellIsOpen: '=?',
        cellAutoOpenDisabled: '=?',
        excludedDays: '=?',
        slideBoxDisabled: '=?',
        customTemplateUrls: '=?',
        draggableAutoScroll: '=?',
        onEventClick: '&',
        onEventTimesChanged: '&',
        onTimespanClick: '&',
        onDateRangeSelect: '&?',
        onViewChangeClick: '&',
        cellModifier: '&',
        dayViewStart: '@',
        dayViewSegmentSize: '@',
        dayViewEnd: '@',
        dayViewSplit: '@',
        dayViewEventChunkSize: '@',
        dayViewEventWidth: '@',
        templateScope: '=?',
        dayViewTimePosition: '@'
      },
      controller: 'MwlCalendarCtrl as vm',
      bindToController: true
    };

  });
