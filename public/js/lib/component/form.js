// Author: sanghee park <novles@naver.com>
// Create Date: 2014.12.18
define([
  'jquery',
  'underscore',
  'backbone',
  'log',
  'dialog',
  'schemas',
  'i18n!nls/common',
  'i18n!nls/error',
  'text!templates/default/form.html',
  'text!templates/default/input.html',
  'text!templates/default/datepicker.html',
  ], function($, _, Backbone, log, Dialog, Schemas, i18Common, i18nError, FormHTML, InputHTML, DatePickerHTML){
    var LOG=log.getLogger('Form');
    var _formId=0;
    var _inputId=0;
    var _formName="form_";
    var _INPUT="input",_COMBO="combo",_DATE="date";
    
    var _defaultInputType={
       input:{
          getElement:function(data){
            var _InputTemp=_.template(InputHTML);
            var _input=_.noop();
            _input=_InputTemp(data);
            return _input;
          }
       },
       date:{
          getElement:function(data){
            var _dateTemp=_.template(DatePickerHTML);
            var _datePicker=_.noop();
            _datePicker=_dateTemp(data);
            return _datePicker; 
          }
       },
       combo:{
          getElement:function(){
             
          }
          
       }
    };
    var Form = Backbone.View.extend({
    	initialize:function(options){
    	   var _formSchema=Schemas.getSchema('form');
    	   this.options=_formSchema.getDefault(options);
    	   
         var _formTemp=_.template(FormHTML);
         this.formTemp=_formTemp;
         this.childs=this.options.childs;
         this.elements=[];
         
         if (_.isUndefined(this.options.form.id)){
            this.id = _formName+(_formId++);    
         }
         
         var autoRender=this.options.autoRender;
         if (autoRender){
            this.render();   
         }
         _.bindAll(this, 'render');
    	},
    	render:function(){
    	   var dfd= new $.Deferred();
         
    	   var _view=this;
         var _form=$(_view.formTemp(this.options.form));
    	   var _childs=_view.childs;
    	   
    	   for (var i=0; i < _childs.length; i++){// form child make
    	      var _child=_childs[i];
    	      if (_.isObject(_child)){
    	         var _inputElement;
    	         switch (_child.type) {
    	            case _INPUT:
    	               _inputElement=this._createDefaultInput(_child);  
    	               break;
    	            case _DATE:
    	               _inputElement=this._createDatePicker(_child);  
    	               break;
 	               case _COMBO:
    	               _inputElement=this._createDefaultInput(_child);  
    	               break;
    	            default:
    	         }
    	         
    	         if (!_.isUndefined(_view.el)){
       	         _form.append(_inputElement);     
       	      }
    	      } else {
    	         Dialog.error(i18nError.NOT_SUPPORT_FORM_CHILD);
    	         dfd.reject();
    	      }
    	   }
    	   
    	   $(_view.el).html(_form);
    	   dfd.resolve();
    	   return dfd.promise();
     	},
     	_createDatePicker:function(child){
     	   var _view=this;
     	   // var _inputTypes=_.keys(_defaultInputType);
     	   // var _index=_.indexOf(_inputTypes, child.type);   
  	      var _data={
  	         el:child.el,
  	         label:child.label,
  	         name:child.name,
  	         id:_view.id+"_input_"+(_inputId++),
  	         value:child.value
  	      };
  	      var _datePickerTag=_defaultInputType[_DATE].getElement(_data);
  	      var _datePickerElement=$(_datePickerTag);
  	      
  	      _datePickerElement.find("#"+_data.id).datetimepicker({
            pickTime: false
         });
         
  	      _view.elements.push(_datePickerElement);
  	      return _datePickerElement;
     	},
     	_createDefaultInput:function(child){
     	   var _view=this;
     	   // var _inputTypes=_.keys(_defaultInputType);
     	   // var _index=_.indexOf(_inputTypes, child.type);   
  	      var _data={
  	         el:child.el,
  	         label:child.label,
  	         name:child.name,
  	         id:_view.id+"_input_"+(_inputId++),
  	         value:child.value
  	      };
  	      var _inputTag=_defaultInputType[_INPUT].getElement(_data);
  	      var _inputElement=$(_inputTag);
  	      _view.elements.push(_inputElement);
  	      return _inputElement;
     	},
     	getData: function() {
         var unindexed_array = $("#"+this.options.id).serializeArray();
         var indexed_array= {};
    	    
         $.map(unindexed_array, function(n, i){
            indexed_array[n['name']] = n['value'];
         });
         return indexed_array;
    	}
   });
   return Form;
});