(function () {    
    /*
    * Exalogic Guest Check-In 1.1.1
    * by Mario Moravcik - November 2020
    */		
    jQuery.fn.extend({
        owpaCheckIn: function (options) {
            return new eModule(this, options);				
        }
    });

    var eModule = (function (elmn, options) {
        var _self = this;

        // Inicializovanie objektu
        _self.init = function () {
            _self.cache = {
                settings: {},
                company: {},
                rooms: [],
                guests: [],
                reservation: {},
                countries: [],
                languages: [],
            };
            _self.controls = {
                form: null,
                guests: null,                
                reservation: null,
                buttonPanel: null,
                submitButton: null,
                modal: null,
            };
            var defaults = {
                lang: 'sk',
                formContentId: '.online-checkin-content', 	//
                reservationId: '.reservation',   //
                reservationItems: '.reservation-items',   //
                guestsListId: '.owpa-guests',			  // Selector pre zoznam osôb pre rezerváciu.
                buttonPanelId: '.owpa-buttons',
                submitBtnId: '.owpa-submit-checkin',
                modalId: '.owpa-modal',
                errorPanelId: '.owpa-error-panel',
                visaToggleId: '.btn-visa-toggle',
                visaContainerId: '.owpa-visa-container',
                restUrl: '',
                guid: '',
                visaTypes: 'A,Letiskové tranzitné vízum (A vízum);C,Jednotné vízum (C vízum);LTV,Vízum s obmedzenou územnou platnosťou (LTV vízum);D,Národné dlhodobé vízum (D vízum)',
                icons: {                    
                    error: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;"><circle style="fill:#D75A4A;" cx="25" cy="25" r="25"/><polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" points="16,34 25,25 34,16   "/><polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" points="16,16 25,25 34,34"/></svg>',
                    warning: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;"><circle style="fill:#EFCE4A;" cx="25" cy="25" r="25"/><line style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" x1="25" y1="10" x2="25" y2="32"/><line style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" x1="25" y1="37" x2="25" y2="39"/></svg>',
                    question: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;"><circle style="fill:#48A0DC;" cx="25" cy="25" r="25"/><line style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" x1="25" y1="37" x2="25" y2="39"/><path style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" d="M18,16c0-3.899,3.188-7.054,7.1-6.999c3.717,0.052,6.848,3.182,6.9,6.9c0.035,2.511-1.252,4.723-3.21,5.986C26.355,23.457,25,26.261,25,29.158V32"/></svg>',
                    success: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;"><circle style="fill:#25AE88;" cx="25" cy="25" r="25"/><polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="38,15 22,33 12,25 "/></svg>',
                },
            };
            _self.options = jQuery.extend(defaults, options);

            _self.controls.form = jQuery(_self.options.formContentId);
            _self.controls.guests = _self.controls.form.find(_self.options.guestsListId);
            _self.controls.reservation = _self.controls.form.find(_self.options.reservationId);
            _self.controls.reservationItems = _self.controls.reservation.find(_self.options.reservationItems);
            _self.controls.submitButton = jQuery(_self.options.submitBtnId);
            _self.controls.modal = jQuery(_self.options.modalId);
            _self.controls.buttonPanel = jQuery(_self.options.buttonPanelId);

            //Test API
            var exc = OBERONApplicationBase.dataResult();
            exc = OBERONApplicationBase.apiVersion(getUrl(''));
            if (!exc || !exc.result) {
                _self.renderNotAvailable(exc);
                return;
            }
            
            _self.controls.submitButton.on("click", function (evt) { ehSubmitClick(this, evt) });

            _self.countryList();
            _self.reservationLoad();
            _self.updateForm();

        }

        // Spracovanie udalosti zmeny jazyka.
        _self.ehLanguageClick = function (elm, evt) {
            evt.preventDefault();
            var lang = jQuery(elm).attr('data-value');				
            console.log(lang);				
            lang = (lang =='sk' ? '' : lang);
            jQuery.linguaLoadAutoUpdate(lang);
            _self.updateForm();
        }

        // Spracovanie udalosti odoslania údajov.
        function ehSubmitClick(elm, evt) {
            evt.preventDefault();
            showModal(jQuery.lingua("modalSubmitTitle"), jQuery.lingua("modalSubmitText"), { icon: 'q', clickHandler: submitHandler });
        }

        function submitHandler() {
            var exc = OBERONApplicationBase.dataResult(),
                msg = '',
                apiUrl = getUrl("/SetHotel_Guests"),
                param = { HotelGuestsSetArg: { ParentType: 0, IDNumParent: 1, GUID: '', Guests: [] } };

            // Typ rodiča - určuje, k akej evidencii budú hostia zapísaný (None = 0, Reservation = 1, Accommondation = 2)
            param.HotelGuestsSetArg.ParentType = 1;
            // Jednoznačný identifikátor rodiča (záznamu), ku ktorému sa osoby zapisujú, napr. jednoznačný identifikátor rezervácie.
            param.HotelGuestsSetArg.IDNumParent = 0;
            // Jednoznačný identifikátor GUID rodiča (záznamu), ku ktorému sa osoby zapisujú, napr. jednoznačný identifikátor rezervácie. Identifikátor ako náhrada IDNumParent.		
            param.HotelGuestsSetArg.GUID = _self.cache.reservation.GUID;
            // Zoznam hostí - obsahuje jednu alebo viac hodnôt (štruktúr <see cref=" Hotel_Guest "> Hotel_Guest </see>).
            param.HotelGuestsSetArg.Guests = [];

            var guestItems = _self.controls.guests.find('.guest-item');
            guestItems.each(function (index, item) {
                var person = guestInfoInit();

                person.Name = jQuery(item).find('.given-name-' + index + ' input').val();
                person.FamilyName = jQuery(item).find('.family-name-' + index + ' input').val();
                person.DateOfBirth = Date.toRequest(OBERONApplicationBase.dateGet(jQuery(item).find('.birth-date-' + index + ' input').val()), false);
                person.PlaceOfBirth = jQuery(item).find('.birth-place-' + index + ' input').val();
                person.DocumentIdentificationNumber = jQuery(item).find('.personal-doc-' + index + ' input').val();
                person.LoyaltyCardNumber = jQuery(item).find('.loyalty-card-' + index + ' input').val();
                

                if (index === 0) {
                    
                    person.PhoneNumber = jQuery(item).find('.phone-' + index + ' input').val();
                    person.Email = jQuery(item).find('.email-' + index + ' input').val();
                    person.Notice = jQuery(item).find('.notice-' + index + ' input').val();

                    person.Address_Street = jQuery(item).find('.street-' + index + ' input').val();
                    person.Address_PostalCode = jQuery(item).find('.zip-' + index + ' input').val();
                    person.Address_City = jQuery(item).find('.city-' + index + ' input').val();
                    person.Address_Country = jQuery(item).find('.country-' + index + ' input').val();
                    person.Nationality = person.Address_Country; // Budeme dávať krajinu, aby sa dva krát nezadávalo		
                                    
                    person.Visa_Type = jQuery(item).find('.visa-type-' + index + ' input').val();
                    person.Visa_Number = jQuery(item).find('.visa-number-' + index + ' input').val();
                    person.Visa_Issuer = jQuery(item).find('.visa-issuer-' + index + ' input').val();
                    person.Visa_Date_ValidFrom = Date.toRequest(OBERONApplicationBase.dateGet(jQuery(item).find('.visa-valid-from-' + index + ' input').val()), false);
                    person.Visa_Date_ValidTo = Date.toRequest(OBERONApplicationBase.dateGet(jQuery(item).find('.visa-valid-to-' + index + ' input').val()), false);
                    
                } else {
                    // Údaje podľa prvej osoby
                    if(param.HotelGuestsSetArg.Guests.length > 0) {
                        // Údaje podľa prvej osoby
                        person.Nationality = param.HotelGuestsSetArg.Guests[0].Address_Country;
                    }
                }
                exc = _self.validatePerson(person, index)
                if(!exc.result) { // Chyby pri osobe
                    msg += exc.description + '<br/>';
                } else {
                    param.HotelGuestsSetArg.Guests.push(person);
                }
            });
            if(msg.length !== 0) { // chyby pri osobách
                showModal(jQuery.lingua('modalTitleValidate'), msg, { icon: 'w', buttonOk: false, clickHandler: null });
                return;
            }
            exc = OBERONApplicationBase.postData(apiUrl, param);
            if (!exc) {
                var text = jQuery.lingua("err_ApiPostError");					
                exc = OBERONApplicationBase.myException(text);
                text = jQuery.lingua("err_ApiError");
                showModal(text, exc.description, { icon: 'err', buttonOk: false, clickHandler: null });
                return;
            }
            if (!exc.result) {
                var text = jQuery.lingua('err_ApiError');
                showModal(text, exc.description, { icon: 'err', buttonOk: false, clickHandler: null });
                return;                
            }
            if( _self.options.successRedirect && _self.options.successRedirect.length !== 0 ){
                window.location.replace(_self.options.successRedirect);
            } else {
                showModal(jQuery.lingua('modalSubmitTitle'), jQuery.lingua('modalSubmitSucceessfull'), { icon: 'o', buttonOk: false, clickHandler: null });
            }
        }

        _self.validatePerson = function(person, index) {
            var exc = OBERONApplicationBase.dataResult(),
                msg = '';
            exc.result = true; //default

            if(!person) {
                exc.result = false;
                exc.description = jQuery.lingua('err_EmptyPerson');
                return exc;
            }
            if(!person.Name || person.Name.length < 2) msg += jQuery.lingua('err_EmptyGivenName') + '<br/>';
            if(!person.FamilyName || person.FamilyName.length < 2) msg += jQuery.lingua('err_EmptyFamilyName') + '<br/>';
            if(!person.DateOfBirth || person.DateOfBirth.length < 8 || person.DateOfBirth.length > 24) msg += jQuery.lingua('err_EmptyDateOfBirth') + '<br/>';             
            if(!person.PlaceOfBirth || person.PlaceOfBirth.length < 2) msg += jQuery.lingua('err_EmptyPlaceOfBirth') + '<br/>';
            if(index===0){
                if(!person.Nationality || person.Nationality.length < 4) msg += jQuery.lingua('err_EmptyCitizenship') + '<br/>';	
            }
            var pn = jQuery.lingua("lblGuest") + ' - ' + (index + 1);            
            if(msg.length !== 0) { exc.result = false; exc.description = '<h5>' + pn + '</h5>' + msg; }

            return exc;
        }

        // Úvodné generovanie a nastavenie stránky
        _self.render = function () {

            if (!_self.cache.reservation || !_self.cache.reservation.GUID || _self.cache.reservation.GUID.length == 0) {
                //--- 
                return;
            } else {
                var html = '',
                    count = 0;
                count = (_self.cache.reservation.AdultsCount != 0 ? _self.cache.reservation.AdultsCount: 0);
                count += (_self.cache.reservation.ChildrenCount != 0 ? _self.cache.reservation.ChildrenCount: 0);
                for (var i = 0; i < count; i++) {
                    html = z_RenderGuest(i, false);
                    _self.controls.guests.append(jQuery(html));
                }                
            }

            _self.controls.guests.find('.combo-toggle').click(function (evt) {
                jQuery(this.parentElement).find('.combo-menu').toggleClass('closed');
            });
            _self.controls.guests.find('.combo-menu a').click(function (evt) {
                evt.preventDefault();
                jQuery(this).closest('.combo').find('input.form-control').val(jQuery(this).attr('data-value'));
                jQuery(this).closest('.combo-menu').toggleClass('closed');
            });

            _self.controls.reservationItems.show();
            _self.controls.buttonPanel.show();

            _self.controls.form.find('.btnReservationToggle').on('click', function (evt) {                
                _self.controls.reservationItems.slideToggle();
                var tg = jQuery(evt.target);
                if( !tg.hasClass('btnReservationToggle') ) {
                    tg.parent().toggleClass('closed');
                } else {
                    tg.toggleClass('closed');
                }
            });

        }

        _self.renderNotAvailable = function(exc) {
            var html = '';
            _self.controls.reservationItems.hide();
            if (!exc || exc.description.length == 0) {
                html = jQuery.lingua('err_Availability');
            } else if(exc.errNumber = 22201) {
                html = jQuery.lingua("err_ReservationNotFoud");
            } else {
                html = exc.description;
            }   
            //showModal(text, errDesc, { icon: 'err', buttonOk: false, clickHandler: null });

            var pnl = jQuery(_self.controls.form.find(_self.options.errorPanelId));
            pnl.show();

            pnl.find('.owpa-error-icon').append(jQuery( _self.options.icons.error));
            pnl.find('.owpa-error-message').html(html);
        }

        // Aktualizovanie stránky
        _self.updateForm = function() {
            
            var visacnt = _self.controls.form.find(_self.options.visaToggleId);
            if(visacnt) { visacnt.off('click'); visacnt = null; }
            _self.controls.guests.empty();

            _self.renderReservation();

            _self.render();

            //Texty
            _self.controls.submitButton.html(jQuery.lingua('btnSubmit'));

            visacnt = _self.controls.form.find(_self.options.visaToggleId)                        
            visacnt.on('click', function (evt) {    
                var tg = jQuery(evt.target);
                var pngue = jQuery(tg.closest('.guest-item'));
                pngue.find(_self.options.visaContainerId).slideToggle();                
                if( !tg.hasClass('btn-visa-toggle') ) {
                    tg.parent().toggleClass('closed');
                } else {
                    tg.toggleClass('closed');
                }
            });

        }       

        _self.renderReservation = function() {
            var html = '', text = '';

            _self.controls.form.find('.reservationTitle').html( jQuery.lingua("reservationTitle") );

            if(!_self.cache.reservation) { 
                return;
            }
            var rn = '';
            rn += jQuery.lingua("lblNumberShort");
            rn += '&nbsp;' + _self.cache.reservation.Number.toString() + '&nbsp;-&nbsp;' + _self.cache.reservation.Name;            
            _self.controls.form.find('.reservationName').html(rn);
            

            // Polia s popiskami a hodnoty
            _self.setReservationValue('DateArrival', OBERONApplicationBase.dateFormat(_self.cache.reservation.DateArrival, 'dd.MM.yyyy'));
            _self.setReservationValue('DateDeparture', OBERONApplicationBase.dateFormat(_self.cache.reservation.DateDeparture, 'dd.MM.yyyy'));
            _self.setReservationValue('NigthCount', OBERONApplicationBase.numFormat(_self.cache.reservation.Nights, 0));
            _self.setReservationValue('ReservationState', reservationToType(_self.cache.reservation.ReservationState));
            _self.setReservationValue('Persons', _self.cache.reservation.AdultsCount + ' + ' + _self.cache.reservation.ChildrenCount);

        }

        // Nastavenie hodnôt v položke rezervácie
        _self.setReservationValue = function(itemName, value) {
            _self.controls.reservationItems.find('.itm-owpa' + itemName + ' label').html( jQuery.lingua("lbl" + itemName) + ":" );
            _self.controls.reservationItems.find('.itm-owpa' + itemName + ' input').val( value );
        }
      
        // Generovanie html hlavného hosťa
        function z_RenderGuest(index, isChild = false) {            
            var html = '';
            html += '<div class="container guest-item' + (index == 0 ? ' guest-main' : '') + ' form-panel"><div class="row">' +
                    '<div class="col-12 title"><h4>' + jQuery.lingua("lblGuest") + ' - ' + (index + 1) + '</h4></div></div>' +
                    '<div class="row">';
            html += z_RenderInputControl('col-md-6 col-lg-6', 'given-name-' + index, jQuery.lingua("lblGivenName") + '*', 'text'); 			// Meno
            html += z_RenderInputControl('col-md-6 col-lg-6', 'family-name-' + index, jQuery.lingua("lblFamilyName") + '*', 'text'); 		// Priezvisko
            html += z_RenderInputControl('col-md-6 col-lg-6', 'birth-date-' + index, jQuery.lingua("lblBirthDate") + '*', 'date');			// Dátum Narodenia
            html += z_RenderInputControl('col-md-6 col-lg-6', 'birth-place-' + index, jQuery.lingua("lblBirthPlace") + '*', 'text');		// Miesto narodenia
            html += z_RenderInputControl('col-md-6 col-lg-6', 'personal-doc-' + index, jQuery.lingua("lblPersonalDocument") + '**', 'text');	// Doklad
            html += z_RenderInputControl('col-md-6 col-lg-6', 'loyalty-card-' + index, jQuery.lingua("lblLoyaltyCard"), 'text');			// Vernostná karta				
            html += '</div>';

            if(index==0) {//prvý hosť je hlavný
					
                html += '<div class="row">';
                html += z_RenderInputControl('col-md-6 col-lg-6', 'phone-' + index, jQuery.lingua("lblPhone"), 'tel');						// Telefón
                html += z_RenderInputControl('col-md-6 col-lg-6', 'email-' + index, jQuery.lingua("lblEmail"), 'email');					// Mail
                html += z_RenderInputControl('col-12', 'notice-' + index, jQuery.lingua("lblNotice"), 'text');					// Poznámka
                html += '</div>';
                // Adresa
                html += '<div class="row"><div class="col-12"><h4>' + jQuery.lingua("lblAddress") + '</h4></div></div>';
                html += '<div class="row">';
                html += z_RenderInputControl('col-md-6 col-lg-6', 'street-' + index, jQuery.lingua("lblStreet"), 'text');					// Ulica
                html += z_RenderInputControl('col-md-6 col-lg-6', 'zip-' + index, jQuery.lingua("lblPostCode"), 'text');					// PSČ
                html += z_RenderInputControl('col-md-6 col-lg-6', 'city-' + index, jQuery.lingua("lblCity"), 'text');						// Obec

                var items = '';
                if (_self.cache.countries && _self.cache.countries.length != 0) {
                    for (var i = 0; i < _self.cache.countries.length; i++) {
                        items += '<a class="combo-item" href="#" data-value="' + _self.cache.countries[i].name + '">' + _self.cache.countries[i].name + '</a>';
                    }
                }
                html += z_RenderSelectControl('col-md-6 col-lg-6', 'country-' + index, jQuery.lingua("lblCountry") + '*', items, 'text');	// Krajina
                html += '</div>';

                // Víza
                html += '<div class="row"><div class="col-10"><h4>' + jQuery.lingua("lblVisa") + '</h4></div>' + 
                        '<div class="col-2 text-right"><button type="button" class="btn btn-flat btn-visa-toggle closed"></button></div>' +
                        '</div><div class="owpa-visa-container spacer-no1" style="display: none;"><div class="row">';
                items = visaTypes();
                html += z_RenderSelectControl('col-md-6 col-lg-6', 'visa-type-' + index, jQuery.lingua("lblVisaType") + '*', items, 'text');// Typ víza
                html += z_RenderInputControl('col-md-6 col-lg-6', 'visa-number-' + index, jQuery.lingua("lblVisaNumber"), 'text');			// číslo víza
                html += z_RenderInputControl('col-12', 'visa-issuer-' + index, jQuery.lingua("lblVisaIssuer"), 'text');			// vydavateľ
                html += z_RenderInputControl('col-md-6 col-lg-6', 'visa-valid-from-' + index, jQuery.lingua("lblVisaValidFrom"), 'date');
                html += z_RenderInputControl('col-md-6 col-lg-6', 'visa-valid-to-' + index, jQuery.lingua("lblVisaValidTo"), 'date');
                html += '</div>';
                html += '<div class="row"><div class="spacer-1"></div></div>';
                html += '</div>';
            }            
            html += '</div>';
                          
            return html;

        }
       
        
        function z_RenderInputControl(css, name, label, type = "text") {
            return '<div class="form-group ' + css + ' ' + name + '">' + 
                '  <label for="i-' + name + '">' + label + '</label>' +
                '  <input type="' + type + '" class="form-control" id="i-' + name + '" />' + 
                '</div>';
        }

        function z_RenderSelectControl(css, name, label, items, type = "text") {				
            var html = '<div class="form-group ' + css + ' ' + name + '">' +
                    '  <label for="i-' + name + '">' + label + '</label>' +
                    '  <div class="input-group combo">' +
                    '  <input type="' + type + '" class="form-control" id="i-' + name + '" />';

                if (items && items.length != 0) {
                    html += '<div class="input-group-append">' +
                            '  <button class="btn btn-outline-secondary combo-toggle" type="button" data-toggle="combo"></button>' +
                            '  <div class="combo-menu combo-scrollable closed">' + items + '</div>' +
                            '</div>';
                }
            html += '</div></div>';
            return html;
        }

        _self.reservationLoad = function() {
            var exc = OBERONApplicationBase.myException();
            _self.cache.reservation = null;
            var url = getUrl('/GetHotel_RoomReservation');
            var  param = { HotelReservationArg: { FindBy: 1, FindByValue: _self.options.guid }};
            exc = OBERONApplicationBase.postData(url, param)
            if (!exc.result) { 
                _self.cache.reservation = null;               
                _self.renderNotAvailable(exc);                
            } else {
                _self.cache.reservation = reservationInit();
                _self.cache.reservation.fromData(exc.data);                
            }           

        }

        // Inicializovanie objektu hosťa.
        function guestInfoInit() {
            return {
                IDNum: 0, 							// Jednoznačný identifikátor hosťa v systéme OBERON. Pri zadávaní nového záznamu sa hodnota nenastavuje.					
                DocumentIdentificationNumber: '', 	// Číslo dokladu totožnosti.					
                Name: '',							// Meno.					
                FamilyName: '',						// Priezvisko.					
                Title: '',							// Titul hosťa (pred menom).					
                DateOfBirth: '',					// Dátum narodenia (SOAP formát yyyy-MM-ddTHH:mm:ss).					
                PlaceOfBirth: '',					// Miesto narodenia.					
                Nationality: '',					// Štátna príslušnosť. Pri zadávaní nového záznamu o hosťovi nemusí byť hodnota zadaná.					
                NationalityISO: '',					// Štátna príslušnosť (ISO kód), napr. SVK, CZK.					
                Address_Street: '',					// Adresa - ulica (aj so súpisným číslo).					
                Address_PostalCode: '',				// Adresa - poštové smerovacie číslo.					
                Address_City: '',					// Adresa - obec.					
                Address_Country: '',				// Adresa - štát. Pri zadávaní nového záznamu o hosťovi nemusí byť hodnota zadaná.
                Address_CountryISO: '', 			// Adresa - štát (ISO kód), napr. SVK, CZK.					
                Email: '',							// Email.
                PhoneNumber: '',					// Telefónne číslo.
                RoomNumber: '',
                Notice: '',							// Poznámka - ľubovolný ďalší údaj (max 255 znakov).
                LoyaltyCardNumber: '',				// Číslo vernostnej karty.
                Visa_Type: '',						// Typ víza.
                Visa_Number: '',					// Číslo víza.
                Visa_Issuer: '',					// Údaj o udelení víza (kde bolo vízum udelené).
                Visa_Date_ValidFrom: '',			// Dátum začiatku platnosti víza (SOAP formát yyyy-MM-ddTHH:mm:ss).
                Visa_Date_ValidTo: '',				// Dátum konca platnosti víza (SOAP formát yyyy-MM-ddTHH:mm:ss).
            }
        }

        // Inicializovanie položky z API.
        function reservationInit() {
            return {
                /* Stav novej rezervácie. Pri novej rezervácii je možné určiť, či ide o dopyt, alebo on-line rezerváciu.  (1 = Dopyt, 2 = On-Line rezervácia.)  */
                ReservationType: 0,
                GUID: '',				// Verejný jedinečný identifikátor rezervácie.
                Number: '',				// Číslo rezervácie priradené systémom OBERON.
                DateArrival: '',		// Dátum príchodu (dátum vo formáte yyyy-MM-ddTHH:mm:ss).
                DateDeparture: '',		// Dátum odchodu (dátum vo formáte yyyy-MM-ddTHH:mm:ss).
                Nights: 0,				// Počet nocí.					
                Rooms: [], 				// Objekt 'reservationRoomInit'. Rezervované typy izieb, prípadne aj konkrétne izby. Pri dopyte na voľný termín ak sa zadá len typ izby, OBERON priradí konkrétnu izbu automaticky (ak je voľná/dostupná).
                Calculated_Price: 0,	// Cenová kalkulácia (cena).
                PriceInAdvance: 0,		// Suma požadovanej zálohovej (rezervačnej) platby.
                DateExpiration: '',		// Dátum vypršania platnosti rezervácie. Platnosť rezervácie skončí ak nie je potvrdená (SOAP formát yyyy-MM-ddTHH:mm:ss).
                ReservationState: 0, // Stav novej rezervácie (napr. 16 = Nepotvrdená rezervácia, 32 = Potvrdená rezervácia). Stav rezervácie určuje systém a užívatelia.
                /*-----------------------------------------------------------------
                '--- Nepovinné parametre -----------
                '-----------------------------------------------------------------*/
                PartnerNumber: '',			// Identifikačné číslo partnera, ktorý vykonal rezerváciu.
                PartnerNumberContractReservation: '',	// Identifikačné číslo zmluvného partnera.
                VariableSymbol: '',			// Variabilný symbol - môže obsahovať údaj napojenia na externé systémy (ľubovolná textová hodnota).
                Name: '', 					// Názov rezervácie - meno osoby.
                FamilyName: '',				// Názov rezervácie - priezvisko.
                Email: '',					// E-mail osoby, ktorá rezerváciu vykonala.
                Notice: '',					// Poznámka k rezervácii.
                OtherRecords: '',			// Iné záznamy (dlhší textový popis (65536 znakov)).
                Phone: '',					// Telefónny kontakt na osobu, ktorý vykonala rezerváciu.
                Address_Street: '',			// Adresa osoby (ulica), ktorá si rezervovala ubytovanie.
                Address_City: '',			// Adresa osoby (obec), ktorá si rezervovala ubytovanie.
                Address_Country: '',		// Adresa osoby (krajina), ktorá si rezervovala ubytovanie.
                Address_PostalCode: '',		// Adresa osoby (PSČ), ktorá si rezervovala ubytovanie.
                ReservationSourceName: '',	// Názov (pomenovanie) zdroja rezervácie.
                AdultsCount: '',			// Počet dospelých osôb v rezervácii.
                ChildrenCount: '',			// Počet detí v rezervácii.
                ReservationStateText: '',
                // Mapovanie hodnôt
                fromData: function (data) {
                    if (!data) return;
                    this.ReservationType = data.ReservationType;
                    this.GUID = data.GUID;
                    this.DateArrival = data.DateArrival;
                    this.DateDeparture = data.DateDeparture;
                    this.Nights = data.Nights;
                    this.Calculated_Price = data.Calculated_Price;
                    this.PriceInAdvance = data.PriceInAdvance;
                    this.DateExpiration = data.DateExpiration;
                    this.ReservationState = data.ReservationState;
                    this.PartnerNumber = data.PartnerNumber;
                    this.PartnerNumberContractReservation = data.PartnerNumberContractReservation;
                    this.VariableSymbol = data.VariableSymbol;
                    this.Name = data.Name;
                    this.Number = data.Number;
                    this.FamilyName = data.FamilyName;
                    this.Email = data.Email;
                    this.Notice = data.Notice;
                    this.OtherRecords = data.OtherRecords;
                    this.Phone = data.Phone;
                    this.Address_Street = data.Address_Street;
                    this.Address_City = data.Address_City;
                    this.Address_Country = data.Address_Country;
                    this.Address_PostalCode = data.Address_PostalCode;
                    this.ReservationSourceName = data.ReservationSourceName;
                    this.AdultsCount = data.AdultsCount;
                    this.ChildrenCount = data.ChildrenCount;
                    this.Rooms = [];
                    this.ReservationStateText = reservationToType(this.ReservationState);

                }

            }
        }

        // Typ rezervácie
        function reservationToType(reservationState) {
            var text = '';
            switch (reservationState) {
                case 1:   { text = jQuery.lingua("stateOnlineRequest"); break; } 	// onlineRequest = 1
                case 8:   { text = jQuery.lingua("stateRequestInProgress"); break; }	// requestInProgress = 8
                case 2:   { text = jQuery.lingua("stateOnLineReservation"); break; } // onLineReservation = 2
                case 4:   { text = jQuery.lingua("stateOnLineInProgress"); break; }// onLineReservationInProgress = 4								
                case 16:  { text = jQuery.lingua("stateNotConfirmed"); break; }	// notConfirmed = 16
                case 32:  { text = jQuery.lingua("stateConfirmed"); break; }	// confirmed = 32
                case 64:  { text = jQuery.lingua("stateConfirmedAdvance"); break; } // confirmedAdvance = 64
                case 512: { text = jQuery.lingua("stateCanceled"); break; }	// canceled = 512
                default:  { text = jQuery.lingua("stateUnknown"); } // None - nie je zadaný stav (napr. zmluvné rezervácie).
            }
            return text;
        }		

        // Typ víZA
        function visaTypes(reservationState) {            
            var types = jQuery.lingua("visaTypes");
            var html = '';
            if(!types || types.length == 0) {
                types = _self.options.visaTypes;
            }

            var itm = types.split(";");
            for (var i=0;i<itm.length;i++){
                var itmv = itm[i].split(',');
                if(!itmv || itmv.length == 0) { continue; }
                html += '<a class="combo-item" href="#" data-value="' + itmv[0] + '">' + itmv[0] + ' - ' + itmv[1] + '</a>';
            }
            return html;
        }

        // Zoznam krajín.
        _self.countryList = function() {            
            var exc = OBERONApplicationBase.myException();
            var url = getUrl('/GetCountryList');
            exc = OBERONApplicationBase.getData(url)
            if (!exc.result) {

            }
            _self.cache.countries = [];
            if (exc.data && exc.data.length !== 0) {            
                for (var i = 0; i < exc.data.length; i++) {
                    var cnt = countryInfo();
                    cnt.fromData(exc.data[i]);
                    _self.cache.countries.push(cnt)
                }
            }
        }
        function countryInfo() {
            return {					
                countryCode: '',	// Číselný kód štátu (ISO).
                name: '',			// Názov štátu.
                shortcut: '',		// Skrátený názov.
                visa: 0,			// Skrátený názov.
                iso2Code: '',		// Dvojznakový kód.
                iso3Code: '',		// Trojznakový kód.
                fromData: function(data){
                        this.countryCode = data.CountryCode;
                        this.name = data.Name;
                        this.shortcut = data.Shortcut;
                        this.visa = data.Visa;
                        this.iso2Code = data.ISO2Code;
                        this.iso3Code = data.ISO3Code;
                    }
            }	
        }

        // Show modal window
        function showModal(title, text, options = { icon: '', buttonOk: true, buttonClose: true, clickHandler: null } ) {

            if(!title || title.length == 0) {
                title = jQuery.lingua("modalSubmitTitle");
            }

            if(!text || text.length == 0) {
                text = jQuery.lingua("modalSubmitText");
            }
            var toggle = true;
            if(_self.controls.modal.is(":visible")) toggle = false;

            _self.controls.modal.find(".owpa-modal-title").html(title);
            _self.controls.modal.find(".owpa-modal-message").html(text);

            m_options = jQuery.extend({ icon: '', buttonOk: true, buttonClose: true, clickHandler: null }, options);

            if(!m_options.buttonOk) {
                jQuery(_self.controls.modal.find(".owpa-modal-ok")).hide();
            } else {					
                jQuery(_self.controls.modal.find(".owpa-modal-ok")).show();
                jQuery(_self.controls.modal.find(".owpa-modal-ok")).off('click');
                if(!m_options.clickHandler) {                    
                } else {
                    jQuery(_self.controls.modal.find(".owpa-modal-ok")).on('click', function (evt) {
                        if(m_options.clickHandler) {
                            m_options.clickHandler();
                        }
                    });
                }	
            }

            if(toggle) {
                jQuery(_self.controls.modal.find('.owpa-button-close')).off('click');
                jQuery(_self.controls.modal.find('.owpa-button-close')).on('click', function(evt){ 
                    evt.preventDefault();
                    _self.modalToggle(evt);
                });
            }
            if(!m_options.buttonClose) {
                jQuery(_self.controls.modal.find(".owpa-modal-header .close")).hide();
                jQuery(_self.controls.modal.find(".owpa-modal-close")).hide();                
                
            } else {					
                jQuery(_self.controls.modal.find(".owpa-modal-header .close")).show();
                jQuery(_self.controls.modal.find(".owpa-modal-close")).show();
            }

            var icEl = _self.controls.modal.find(".owpa-modal-icon");
            var ico = '';
            jQuery(icEl).empty();
            if(m_options.icon=='e' || m_options.icon=='error' || m_options.icon=='err'){
                jQuery(icEl).show().append(jQuery(_self.options.icons.error));
            } else if(m_options.icon=='w' || m_options.icon=='warn'){
                jQuery(icEl).show().append(jQuery(_self.options.icons.warning));
            } else if(m_options.icon=='q' || m_options.icon=='quest'){
                jQuery(icEl).show().append(jQuery(_self.options.icons.question));
            } else if(m_options.icon=='o' || m_options.icon=='ok'){
                jQuery(icEl).show().append(jQuery(_self.options.icons.success));
            } else {
                jQuery(icEl).hide();
            }         
            if(toggle) _self.modalToggle(null);
        }

        _self.modalToggle = function(evt) {

            if (_self.controls.modal.is(":visible")) {
                jQuery(_self.controls.modal.find('.owpa-button-close')).off('click');
                jQuery(_self.controls.modal.find('.owpa-button-ok')).off('click');
            }

            _self.controls.modal.toggle();
        }

        function getUrl(method) {
            var url = jQuery('link[rel="https://api.w.org/"]').eq(0).attr('href');
            if (url == 'undefined'){ url = ''; }
            url += _self.options.restUrl + method;
            return url;
        }

        this.init(elmn, options);
        return eModule;
    });


    jQuery.linguaInit(window.guestCheckInWidget.lingua, "owpa-lang-guestcheckin");
    jQuery.linguaLoadAutoUpdate(window.guestCheckInWidget.lang);

    jQuery(".online-checkin-content").owpaCheckIn(window.guestCheckInWidget);


}).call( jQuery );
