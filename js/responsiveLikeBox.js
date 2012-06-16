(function($) {

	$.fn.responsiveLikeBox = function (options) {
	
		var settings = $.extend({
			initialTimeout : 5
		});
		
		// Create some defaults
		var defaults = {
			width : this.attr('data-width'),
			height : this.attr('data-width'),
			colorScheme : this.attr('data-colorscheme'),
			showFaces : this.attr('data-show-faces'),
			borderColor : escape(this.attr('data-border-color')),
			showStream : this.attr('data-stream'),
			showHeader : this.attr('data-header')
		};
		
		// Helpers to use when updating iframe src and data-attrs
		var helpers = {
			translateToUri : {
				width : 'width',
				height : 'height',
				colorScheme : 'colorscheme',
				showFaces : 'show_faces',
				borderColor : 'border_color',
				showStream : 'stream',
				showHeader : 'header'
			},
			translateToDataAttr : {
				width : 'data-width',
				height : 'data-height',
				colorScheme : 'data-colorscheme',
				showFaces : 'data-show-faces',
				borderColor : 'data-border-color',
				showStream : 'data-stream',
				showHeader : 'data-header'
			}
		};
	
		return this.each(function(){
			// Create the widget object assigning it to the wrapper (witch get the initalizer $().responsiveLikeBox();)
			// settings.initialTimeout = if facebook does'nt respond in 5 tries abort and use HTML implementation
			var widget = this, loader;
			
			// Extend to full object
			widget.init = function () {
				loader = $('<img class="responsive-lb-loader" src="img/ajax-loader.gif" alt="Loaing..."/>').appendTo(widget.wrapper.$domElem.parent());
				return $(this).each(function(){
			    	$(window).bind('load.responsiveLikeBox resize.responsiveLikeBox', widget.iframe.resize);
			    });
			};
			
			widget.wrapper = {
			    $domElem : $(this),
			    apperance : function(el, type) {
			    	// Hacky replace of quotes in JSON formated CSS
			    	var data = window.getComputedStyle(el, '::after').content;
			    	
			    	if (data){
				    	// Removes first quotes and removes escape char (Opera and FF escapes the quotes) if found
				    	data = data.substring(1, data.length - 1).replace(/\\/g, '');
				    	
				    	if (type != 'string'){
				    	    // If JSON is'nt correctly formated will throw error here
				    	    try {
				    	        data = $.parseJSON(data);
				    	    }
				    	    
				    	    catch (e) {
				    	        // Print error in widget
				    	        $('<p class="error-msg">There seem to be a problem with your JSON format in your CSS. The error message says: <strong>' 
				    	        + e.message + '</strong></p>').appendTo(el);
				    	        data = '';
				    	    }	
				    	}	
			    	}
			    	
			    	else{
			    		if(type != 'string'){
				    		data = defaults;
			    		}
			    		
			    		else {
				    		data = JSON.stringify(defaults);
			    		}
			    	}
			    	
			    	return data;
			    }
			};
			
			widget.iframe = {
				
			    apperance : defaults, /* Takes the defaults object (the markup implementation unless specified when initalizing) */
			    resizing : false,
			    resize : function () {
			    
			    	// Set iframe
			    	widget.iframe.$domElem = widget.wrapper.$domElem.find('iframe');
			    	
			    	// Iframe load event
			    	widget.iframe.$domElem.bind('load.responsiveLikeBox', function(){
				    	loader.hide();
			    	});
			    	
			    	// Check wether the src is set yet. Resize depends on it
			    	if (widget.iframe.$domElem.attr('src')) {
			    	
			    		// Check if styles matches using stringified
			    		var newApperanceString = widget.wrapper.apperance(widget, 'string');
				    	if(widget.iframe.apperance != newApperanceString && !widget.iframe.resizing){
				    	
				    		widget.iframe.resizing = true;
				    	
				    		// Get apperance as obj
				    		var newApperance = widget.wrapper.apperance(widget);
				    		
				        	//Change all data in iframe and data-attrs
				        	var newSrc = widget.iframe.$domElem.attr('src');
				        	
				        	for (option in newApperance){
				        		// Replace data-attrs for all options
				        		widget.wrapper.$domElem.attr(helpers.translateToDataAttr[option], newApperance[option]);
				        		
				        		//Replace all querysting parameters in ifram src		        	
					        	// Match on any queryparameter with option name
					            var regEx = new RegExp('[?&]' + helpers.translateToUri[option] + '=([a-z0-9%]*)', 'g');
					            					            
					            // Build new queryparameter
					            try {
						            var query = newSrc.match(regEx).toString();
						            newSrc = newSrc.replace(regEx, query.substring(0,1) 
						            + helpers.translateToUri[option] + '=' + escape(newApperance[option]));
					            }
					            
					            catch (e) {
						            console.log('Seems you want to change something you did not specify in your original implementation. If you want to change eg. border-color yo need to specify a border color when you get the code for your fb likebox. Error: ' + e.message);
					            }
					        	
					        	// Width and height need more replacements
					        	if (option === 'width' || option === 'height'){
					        		// Reset inline styles for wrapping span
						        	widget.wrapper.$domElem.children('span').css(option, newApperance[option]);
						        	
						        	// Set inline styles for iframe
						        	widget.iframe.$domElem.css(option, newApperance[option]);
					        	}
					        	
				        	}
				        	
				        	// Set new src (will make it reload)
					       	widget.iframe.$domElem.attr('src', newSrc);
					           
					        // Set iframe apperance to the new apperance without actually checking. Should be a callback to iframe load.
					        widget.iframe.apperance = newApperanceString;
				        	
				        	// Show loader while waiting for fb
				        	loader.show();
				        	
				        	widget.iframe.resizing = false;
				    	}
				    	
			    	}
			    	
			    	// If src is'nt set yet try again
			    	else {
			    		if(settings.initialTimeout){
			    			// Try in 0.5 seconds
				    		setTimeout(widget.iframe.resize, 500);	
			    		}
			    		
			    		else {
				    		loader.hide();
			    		}
			    		
			    		// One try is used try five times
				    	settings.initialTimeout --;
			    	}
			    }
			};
			
			// Runs plugin
			widget.init();	
				
		});	
	}
	
})(jQuery);