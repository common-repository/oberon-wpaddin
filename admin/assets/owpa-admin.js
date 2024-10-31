/**
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see exalogic_oberon_plugins.php.
 * 
 * Copyright (c) 2007-2020 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.0
 */

(function () {

	var eSettingsPage;
	jQuery.fn.extend({
		eSettingsPage: function (options) {
			return jQuery(this).each(function (input_field) {
				return new eModule(this, options);
			});
		}
	});

	var eModule = (function (elmn, options) {
		_self = this;		
		_self.base_elm = jQuery(elmn);
		_self.controls = {
			messageContainer: null,
		};

		_self.init = function (options) {//init						
			_self.defaults = {
				lang: 'sk',
				key: '',
				nonce: '',
				root: '',
				version: '',
				apiBase: '',
				wpBaseUrl: '/wp-json/', //this must be set by rest controller settings
			};
			if (options) {
				jQuery.extend(_self.defaults, options);
			}		

			_self.controls.messageContainer = jQuery(_self.base_elm.find('.owpa-settings-message'));
			_self.controls.messageContainer.hide();
			
			// Init controls
			_self.controls.testConnection = jQuery(_self.base_elm.find('.owpa-test-connection'));
			_self.controls.testConnection.on('click', function (evt) { evh_TestConnection(evt); });

			_self.controls.tabs = jQuery(_self.base_elm.find('.owpa-tab'));
			_self.controls.tabButtons = jQuery(_self.controls.tabs.find('.owpa-tab-buttons'));

			jQuery(_self.controls.tabButtons.find('.tab-button')).on( 'click', function( event ) {
				event.preventDefault();
				jQuery(_self.controls.tabButtons.find('.tab-button')).removeClass( 'active' );
				var itm = jQuery(event.target);
				itm.addClass( 'active' );
				jQuery(_self.controls.tabs.find('.tab-page')).addClass( 'hidden' );
				jQuery(_self.controls.tabs.find('#'+ itm.attr('data-id'))).removeClass('hidden');			
			});

			return this;
		}


		function evh_TestConnection(event) {
			event.preventDefault();
			if (jQuery(event.target).hasClass( 'disabled' )) { return; }
			var exc  = testServiceAvailability();
			if ( !exc.result ) {
				showMessage('e', exc.description);
				return;
			}
			showMessage('i', 'Overenie prebehlo v poriadku. Návratová hodnota z OBERON Web API: ' + exc.data);
		}
		

		/* ------ SYSTEM ------- */

		function getUrl(method) {
			var url = _self.defaults.root;
			if (url == 'undefined'){ url = ''; }
			if (!method.startsWith('/')) { method = '/' + method; }
			url += _self.defaults.apiBase + '/v' + _self.defaults.version + method;
			return url;
		};

		function showMessage(type, message) {
			_self.controls.messageContainer.show();			
			_self.controls.messageContainer.removeClass('alert');
			_self.controls.messageContainer.removeClass('info');

			var ico = jQuery(_self.controls.messageContainer.find('.inner-icon'));			
			if(!type || type=='i') {
				_self.controls.messageContainer.addClass('info');
				ico.html(jQuery('<span class="dashicons dashicons-info-outline info"></span>')); // 'dashicons-yes-alt'
			} else if(type=='e') {
				_self.controls.messageContainer.addClass('alert');
				ico.html(jQuery('<span class="dashicons dashicons-warning alert"></span>')); // 'dashicons-dismiss'
			}

			_self.controls.messageContainer.find('.inner-message').html(message);

			OBERONApplicationBase.wait(10000, function(){ _self.controls.messageContainer.hide(); });
		}

		function testServiceAvailability() {
			var ajaxurl = getUrl("/ping");
			var result = false;
			jQuery.ajax({ type: "GET", url: ajaxurl, cache: false, async: false, dataType: 'json', contentType: 'application/json; charset=utf-8', timeout: 1000, processData: false,
				success: function (data, textStatus, xhr) {
					if(!data || (!data.result && !data.description)) {
						result = { result: false, data: '', description: 'Nebola načítaná adresa IP. Skontrolujte nastavenie OBERON Center prípadne, či je služba dostupná.' };	
					} else if(!data.result) { 
						result = { result: false, data: '', description: data.description };	
					} else if(!OBERONApplicationBase.validateIP(data.data)) {
						result = { result: false, data: '', description: 'Nebola načítaná adresa IP. Skontrolujte nastavenie OBERON Center prípadne, či je služba dostupná.' };	
					} else {
						result = data;
					}
				},
				error: function (xhr, textStatus, errorThrown) { 
					result = { result: false, data: null, description: '' };
					var js = JSON.parse(xhr.responseText);					
					if(js) {
						result.description = js.message;
					} else {
						result.description = xhr.responseText;
					}					
				}
			});
			return result;
		};


		_self.init(options);
		return _self;
	});

}).call(this);
