var db = require('../lib/dbmanager.js');
var group = "changeHistory";

var ChangeHistoryDao = function (){
};

// 변경 이력 조회 
ChangeHistoryDao.prototype.selectChangeHistory =  function (data) {
    return db.query(group, "selectChangeHistory", [data.id, data.date, data.change_column]);
};

//퇴퇴근 변경 이력 조회 
ChangeHistoryDao.prototype.selectInOutChangeCount =  function (data) {
    return db.query(group, "selectInOutChangeCount", [data.year, data.id, data.date, data.year, data.id, data.date]);
};

//변경 이력 등록
ChangeHistoryDao.prototype.inserChangeHistory =  function (connection, data) {
	return db.queryTransaction(
	    connection,
        group, "inserChangeHistory",
        data,
        ["year", "id",  "date",  "change_column", "change_before", "change_after", "change_id"]
    ); 
};

module.exports = new ChangeHistoryDao();