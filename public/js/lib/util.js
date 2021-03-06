// Author: sanghee park <novles@naver.com>
// Create Date: 2014.12.18
define([
  'jquery',
  'underscore',
  'cmoment'
], function ($, _, Moment) {
  var isNull = function (obj) {
    if (obj === "" || obj === undefined || obj === "undefined" || obj === null || obj === "null") return true;
    return false;
  };
  var isNotNull = function (obj) {
    if (obj === "" || obj === undefined || obj === "undefined" || obj === null || obj === "null") return false;
    return true;
  };
  var inArray = function (value, arr) {
    if ($.inArray(value, arr) > -1) return true;
    return false;
  };
  var inObject = function (vName, obj) {
    for (var name in obj) {
      if (name == vName) {
        return true;
      }
    }
    return false;
  };
  var split = function (str, token) {
    if (this.isNull(str)) {
      return [];
    } else {
      return str.split(token);
    }
  };

  var get02dStr = function (num) {
    if (num < 10) {
      return "0" + num;
    }
    return num;
  }

  // form 태그 내 name 별 값을 json 형식으로 반환  
  var getFormJSON = function ($form) {
    var arr = $form.serializeArray();
    var data = _(arr).reduce(function (result, field) {
      result[field.name] = field.value;
      return result;
    }, {});

    return data;
  }

  var dateToString = function (date) {
    return date.getFullYear() + "-"
      + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-"
      + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
  }

  var timeToString = function (date) {
    return (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":"
      + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":"
      + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
  }

  var getMonday = function (date) { //월요일 ~ 일요일 구하기 201-01-01
    var intDayCnt1 = 0;
    var intDayCnt2 = 0;

    var year = date.substring(0, 4);
    var month = date.substring(5, 7);
    var day = date.substring(8, 10);
    var week = new Array("일", "월", "화", "수", "목", "금", "토");

    var vn_day1 = new Date(year, month - 1, day);

    var i = vn_day1.getDay(); //기준일의 요일을 구한다.( 0:일요일, 1:월요일, 2:화요일, 3:수요일, 4:목요일, 5:금요일, 6:토요일 )

    if ((i > 0) && (i < 7)) { //기준일이 월~토 일때
      intDayCnt1 = 1 - i;
      intDayCnt2 = 7 - i;
    }
    else if (i == 0) {  //기준일이 일요일일때
      intDayCnt1 = -6;
      intDayCnt2 = 0;
    }

    //기준일의 주의 월요일의 날짜와 토요일의 날짜
    var Cal_st = new Date(vn_day1.getFullYear(), vn_day1.getMonth(), vn_day1.getDate() + intDayCnt1);
    // var Cal_en = new Date(vn_day1.getYear(), vn_day1.getMonth(), vn_day1.getDate() + intDayCnt2);

    return Cal_st;
  }

  var getClientIp = function () {
    var dfd = new $.Deferred();
    _getClientIp(function (ip) {
      clientIp = ip;
      dfd.resolve(ip);
    });
    return dfd.promise();
  }

  // Only for firefox and chrome!!!!!!
  var _getClientIp = function (onNewIP) { //  onNewIp - your listener function for new IPs
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (_.isUndefined(myPeerConnection)) {
      onNewIP("");
      return;
    }
    var pc = new myPeerConnection({
      iceServers: []
    }),
      noop = function () { },
      localIPs = {},
      ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
      key;

    function iterateIP(ip) {
      if (!localIPs[ip]) onNewIP(ip);
      localIPs[ip] = true;
    }

    //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer().then(function (sdp) {
      sdp.sdp.split('\n').forEach(function (line) {
        if (line.indexOf('candidate') < 0) return;
        line.match(ipRegex).forEach(iterateIP);
      });

      pc.setLocalDescription(sdp, noop, noop);
    }).catch(function (reason) {
      // An error occurred, so handle the failure to connect
    });

    //listen for candidate events
    pc.onicecandidate = function (ice) {
      if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) {
        if (ice && ice.candidate && ice.candidate.address) {
          // 크롬브라우져의 경우
          iterateIP(ice.candidate.address);
        } else if (ice && ice.candidate && ice.candidate.candidate) {
          // 파이어폭스 / 오페라의 경우
          iterateIP(ice.candidate.candidate);
        } else {
          iterateIP("");
        }
      }
      else
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
  }

  var _isMobileAcc = function () {
    var filter = "win16|win32|win64|mac";

    if (navigator.platform) {
      if (0 > filter.indexOf(navigator.platform.toLowerCase())) {
        console.log('mobile');
        return true;
      } else {
        return false;
      }
    }
    return false;
  }


  var numberWithComma = function (data) {
    return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function timeformat(num, isSmallVersion) {
    var result = "";
    var hour = Math.floor(num / 60);
    var min = Math.floor(num % 60);

    if (hour < 1000) {
      result += " ";
    }
    if (hour < 100) {
      result += " ";
    }
    if (hour < 10) {
      result += " ";
    }
    if (isSmallVersion === true) {
      result += hour + '<span class="smallFont">시간 </span>';
    } else {
      result += hour + "시간 ";
    }

    if (min < 10) {
      result += "0";
    }

    if (isSmallVersion === true) {
      result += min + '<span class="smallFont">분</span>';
    } else {
      result += min + "분";
    }

    return result;
  }

  var getApprovalLimitDate = function (holidayCollection) {
    var day = Moment().hour(0).minute(0).second(0);
    var holidays = holidayCollection.pluck("date");

    for (var count = 0; ; day.add(-1, "days")) {
      if (day.day() == 0 || day.day() == 6 || _.indexOf(holidays, day.format("YYYY-MM-DD")) > -1) {

      } else {
        count++;
        if (count == 4) {
          break;
        }
      }
    }
    return day.format("YYYY-MM-DD");
  }

  var ajaxCall = function (url, method, data) {
    var dfd = new $.Deferred();
    var ajaxSetting = {
      method: method,
      data: data,
      success: function (result) {
        dfd.resolve(result);
      },
      error: function (err) {
        if (err.status === 401) {
          window.location.reload()
          localStorage.setItem('isNoSessionLogout', true)
        } else {
          alert("Error : " + err.responseJSON.message);
        }

        dfd.resolve();
      }
    };

    $.ajax(url, ajaxSetting);
    return dfd.promise();
  }

  // 회의실 예약 기능의 툴팁 생성
  var makeRoomRegTooltip = function (roomRegModel) {
    var attendance_list_str = "";
    if (roomRegModel.get("attendance_list")) {
      var attendance_list_arrary = [];
      if (typeof roomRegModel.get("attendance_list") === "string") {
        attendance_list_arrary = JSON.parse(roomRegModel.get("attendance_list"));
      } else {
        attendance_list_arrary = roomRegModel.get("attendance_list");
      }
      if (attendance_list_arrary) {
        for (var idx = 0; idx < attendance_list_arrary.length; idx++) {
          if ((idx + 1) % 10 === 0) {
            attendance_list_str += "&#10;"
          }
          attendance_list_str += attendance_list_arrary[idx].name + " ";
        }
      }
    }

    var tooltip
      = roomRegModel.get("title") + " - "
      + roomRegModel.get("user_name") + "&#10;"
      + roomRegModel.get("start_time").substring(0, 5) + "~" + roomRegModel.get("end_time").substring(0, 5) + "&#10;"
      + attendance_list_str;

    return tooltip;
  }

  var destoryDateTimePicker = function(isDialog) {
    var inputGroup = {}
    if (isDialog) {
      inputGroup = $('.modal-dialog .input-group');
    } else {
      inputGroup = $('.input-group');
    }
    for (var i = 0 ; i < inputGroup.length ; i++) {
      var $inputData = $(inputGroup[i]).data('DateTimePicker');
      if ($inputData) {
        $inputData.destroy();
      }
    }
  }

  return {
    isNull: isNull,
    isNotNull: isNotNull,
    isMobileAcc: _isMobileAcc,
    inArray: inArray,
    inObject: inObject,
    split: split,
    get02dStr: get02dStr,
    getFormJSON: getFormJSON,
    dateToString: dateToString,
    timeToString: timeToString,
    getMonday: getMonday,
    getClientIp: getClientIp,
    numberWithComma: numberWithComma,
    timeformat: timeformat,
    getApprovalLimitDate: getApprovalLimitDate,
    ajaxCall: ajaxCall,
    makeRoomRegTooltip: makeRoomRegTooltip,
    destoryDateTimePicker: destoryDateTimePicker
  };
});