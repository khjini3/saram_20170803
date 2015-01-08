// Author: sanghee park <novles@naver.com>
// Create Date: 2014.12.18

define([
	'jquery',
	'underscore',
	'backbone',
	'animator',
	'util',
	'log',
	'models/sm/SessionModel',
	'core/BaseRouter',
	'views/DashBoardView',
	'views/LoginView',
	'views/NavigationView',
	'views/sm/UserListView',
	'views/sm/AddUserView',
	'views/am/AddRawDataView',
	'views/am/HolidayListView',
	'views/cm/CommuteListView',
	'views/cm/CreateDataView',
], function($, _,  Backbone, animator, Util, log, SessionModel, BaseRouter,
DashBoardView, LoginView, NavigationView, // Main View
UserListView, AddUserView,	// 사원관리
AddRawDataView, HolidayListView, // 근태관리
CommuteListView,CreateDataView // CM View
){
	var LOG=log.getLogger('MainRouter');
	var mainContainer='.main-container';
	var loginContainer='.login-container';
	var LOGIN='login';
	
	var Router = BaseRouter.extend({
		routes : {
			'login' : 'showLogin',
			'usermanager/add' : 'showAddUser',
			'usermanager' : 'showUserList',
			'addrawdata' : 'showAddRawData',
			'createdata' : 'showCreateData',
			'holidaymanager' : 'showHolidayManager',
			'commutemanager' : 'showCommuteManager',
			'*actions' : 'showHome',
		},
		initialize:function(option){
			var affterCallback,beforeCallback;
			if (Util.isNotNull(option)){
				for (var name in option){
					if (name=="affterCallback"||name=="beforeCallback"){
						affterCallback=option[name];
					}
				}
			}
			if (Util.isNotNull(beforeCallback)&&_.isFunction(beforeCallback)){
				beforeCallback();
			} 
			
			if (Util.isNotNull(affterCallback)&&_.isFunction(affterCallback)){
				affterCallback();
			} 
			LOG.debug("Initalize Success");
		},
		
		before : function(url, next){
			LOG.debug(url);
			var router=this;
			// var session=SessionModel.getInstance();
			
			// if(!session.isLogin){
			// 	if (url==LOGIN){// session이 없을 때 로그인화면으로 전환시 next()를 해줘야지 정상적으로 넘어감. 안그러면 계속 login으로 navigate함.
			// 		return next();
			// 	}
			// 	Backbone.history.navigate(LOGIN, { trigger : true });
			// }else{
			// 	return next();
			// } 
			return next();
		},
		
		after : function(){
		},
		
		changeView : function(view){
			LOG.debug("Initalize changeView");
		    if(this.currentView)
				this.currentView.close();

	        this.currentView = view;
	        view.initialize();
    		view.render();
    		animator.animate($(view.el), animator.FADE_IN);	
		},
		showAddUser : function(){
			var addUserView = new AddUserView();
			this.changeView(addUserView);
		},
		
		showUserList : function(){
			LOG.debug("Initalize showUserList");
			var userListView = new UserListView();
			this.changeView(userListView)
		},
		
		showAddRawData : function(){
			var addRawDataView = new AddRawDataView();
			this.changeView(addRawDataView);
		},
		
		showCreateData : function(){
			var createDataView = new CreateDataView();
			this.changeView(createDataView);
		},
		
		showHome : function(){
		    var dashBoardView = new DashBoardView({el:mainContainer});
		    this.changeView(dashBoardView);
		},

		showLogin : function(){
			var loginView = new LoginView({el:loginContainer});
			loginView.render();
		},
		
		showHolidayManager : function(){
			var holidayListView = new HolidayListView();
			this.changeView(holidayListView);
		},
		
		showCommuteManager : function(){
			var commuteListView = new CommuteListView();
			this.changeView(commuteListView);
		},
		
	});

	return Router;
});