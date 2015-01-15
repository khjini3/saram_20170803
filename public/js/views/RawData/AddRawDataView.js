define([
  'jquery',
  'underscore',
  'backbone',
  'core/BaseView',
  'grid',
  'schemas',
  'util',
  'dialog',
  'csvParser',
  'text!templates/default/head.html',
  'text!templates/default/content.html',
  'text!templates/default/button.html',
  'text!templates/layout/default.html',
  'models/common/RawDataModel',
  'collection/common/RawDataCollection',
  'models/sm/UserModel',
  'collection/sm/UserCollection',
  'views/RawData/popup/AddRawDataAddPopupView',
], function($, _, Backbone, BaseView, Grid, Schemas, Util, Dialog, csvParser,
HeadHTML, ContentHTML, ButtonHTML, LayoutHTML,
RawDataModel, RawDataCollection, UserModel, UserCollection,
AddRawDataAddPopupView){
    var AddRawDataView = BaseView.extend({
        el:$(".main-container"),
        
    	initialize:function(){
    		$(this.el).html('');
    	    $(this.el).empty();
    	    
    	    this.userCollection = new UserCollection();
    	    this.userCollection.fetch();
    	    
    	    this.rawDataCollection = new RawDataCollection();
    	    
            this.gridOption = {
    		    el:"addRawDataContent",
    		    id:"addRawDataTable",
    		    column:["사번", "이름", "부서", "날짜", "시간", "출입기록"],
    		    dataschema:["id", "name", "department", "date", "time", "type"],
    		    collection:this.rawDataCollection,
    		    detail: true,
    		    fetch: false,
    		    buttons:["search"]
    		};
    		
    		this.buttonInit();
    	},
    	
    	buttonInit:function(){
    	    var that = this;
    	    
    	    // ADD 버튼
    	    this.gridOption.buttons.push({
    	        type:"custom",
    	        name:"add",
    	        click:function(){
    	            var addRawDataAddPopupView = new AddRawDataAddPopupView();
    	            Dialog.show({
    	                title:"출입 기록 파일 등록", 
                        content:addRawDataAddPopupView, 
                        buttons: [{
                            id: 'rawDataCommitBtn',
                            cssClass: Dialog.CssClass.SUCCESS,
                            label: '등록',
                            action: function(dialog) {
                                var fileForm = dialog.getModalBody().find("input");

                                var selectedFiles = fileForm[0].files;
                                if(selectedFiles.length > 0){
                                    if(window.File && window.FileList && window.FileReader){
                                        
                                        addRawDataAddPopupView.setProgressVisible(true);
                                        //progress.css("display", "block"); // display progressbar 
                                        $(this).prop("disabled", true); // 버튼 disabled
                                        
                                        var file = selectedFiles[0];
                                        var csvReader = new FileReader();
                    
                                        csvReader.addEventListener("load",function(event){
                                            var result = csvParser.csvToArr(event.target.result, ",");
                                            that.rawDataCollection.reset();
                                            var errCount = 0;
                                            for(var i = 1; i < result.length; i++){ // 제목줄을 빼기 위해서 1부터 시작
                                                addRawDataAddPopupView.setProgressVisible(i / result.length);
                                                var item = result[i];
                                                
                                                if(item.length != 4){
                                                    continue;
                                                }
                                                
                                                var id = that.userCollection.where({name_commute:item[1]});
                                                
                                                var resultDate = new Date(item[2]);
                                                
                                                if(id.length == 1){ // 등록된 이름인 경우
                                                    that.rawDataCollection.add(new RawDataModel({
                                                        id : id[0].attributes.id,
                                                        name : item[1],
                                                        department : item[0],
                                                        time: Util.timeToString(resultDate),
                                                        date: Util.dateToString(resultDate),
                                                        year: resultDate.getFullYear(),
                                                        type: item[3]
                                                    }));
                                                }else{ // 등록되지 않은 이름인경우 (사번이 없는경우)
                                                    if(item[1] != "청소용 출입"){ // 청소 아저씨 제외하고 id에 '-' 넣어서 결과 출력
                                                        that.rawDataCollection.add(new RawDataModel({
                                                            id : "-",
                                                            name : item[1],
                                                            department : item[0],
                                                            time: Util.timeToString(resultDate),
                                                            date: Util.dateToString(resultDate),
                                                            year: resultDate.getFullYear(),
                                                            type: item[3]
                                                        })); 
                                                        errCount++;    
                                                    }
                                                    
                                                }
                                            }
                                            
                                            if(errCount > 0){ // 사번이 없는 데이터가 있을경우 갯수를 표시한다.
                                                    Dialog.error("분석되지 않은 데이터가 있습니다.\n 데이터를 확인하세요" , function(){
                                                    that._disabledOkBtn(true);
                                                    that.grid.render();
                                                    dialog.close();
                                                });
                                            }else{
                                                Dialog.info("파일 분석이 완료 되었습니다." , function(){
                                                    that._disabledOkBtn(false);
                                                    that.grid.render();
                                                    dialog.close();
                                                });
                                            }

                                        });
                                        
                                        csvReader.readAsText(file, 'euc-kr');
                                        
                                    } else{
                                        console.log("Your browser does not support File API");
                                    }
                                }else{
                                    Dialog.error("선택된 파일이 없습니다");
                                }
                            }
                        }, {
                            label: '취소',
                            action: function(dialog) {
                                dialog.close();
                            }
                        }]
    	            });
    	        }
    	    });
    	    
    	    // Commit
    	    this.gridOption.buttons.push({
    	        type:"custom",
    	        name:"ok",
    	        click:function(){
    	            that._disabledOkBtn(true);
    	            that.rawDataCollection.save({
    	                success:function(){
    	                    Dialog.info("데이터 전송이 완료되었습니다.");
    	                }
    	            });
    	        }
    	    });
    	   
    	},
    	
    	render:function(){
    	    var _headSchema=Schemas.getSchema('headTemp');
    	    var _headTemp=_.template(HeadHTML);
    	    var _layout=$(LayoutHTML);
    	    var _head=$(_headTemp(_headSchema.getDefault({title:"근태 관리 ", subTitle:"출입 기록 등록"})));
    	    
    	    _head.addClass("no-margin");
    	    _head.addClass("relative-layout");
    	    
    	     var _content=$(ContentHTML).attr("id", this.gridOption.el);
    	    _layout.append(_head);
            _layout.append(_content);
            
            
    	    $(this.el).append(_layout);
    	    
    	    var _gridSchema=Schemas.getSchema('grid');
    	    this.grid= new Grid(_gridSchema.getDefault(this.gridOption));
            
            this._disabledOkBtn(true);
            
            return this;
     	},
     	_disabledOkBtn : function(flag){
     	    var okbtn = this.grid.getButton("ok");
            $(this.el).find("#"+okbtn).prop("disabled", flag);
     	}
     	
    });
    return AddRawDataView;
});