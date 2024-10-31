/**
 * OBERONApplicationBase - Base methods used in OBERON web service javascripts.
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * Copyright (c) 2007-2020 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.0
 */

(function () {

    var OBERONApplicationBase = function () {
        return new OBERONApplicationBase.init();
    };
    
    OBERONApplicationBase.settings = {
        version: "1.0",
        monthNames: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'],
        dayNames: ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'],
        dayNamesShort: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'], 
		apiNonce: '',        
    };
        
    OBERONApplicationBase.init = function () {        
    };

    /* --- API --- */
    OBERONApplicationBase.apiVersion = function (baseUrl) {
        return OBERONApplicationBase.getData(baseUrl + '/version');
    }


    /* --- SYSTÉMOVÉ FUNKCIE --- */

	OBERONApplicationBase.postData = function (ajaxurl, jdata) {
        var exc = OBERONApplicationBase.myException('');
        jQuery.ajax({ type: 'POST', url: ajaxurl, cache: false, async: false,
            dataType: 'json', contentType: 'application/json; charset=utf-8',
            processData: false,
            data: JSON.stringify(jdata), //--- musí byt konverzia na text
            beforeSend: function (xhr) {
				if ( OBERONApplicationBase.settings.apiNonce && OBERONApplicationBase.settings.apiNonce.length != 0 ) {				
					xhr.setRequestHeader( 'X-WP-Nonce', OBERONApplicationBase.settings.apiNonce );
				}
            },
            success: function (data, textStatus, xhr) {
                exc = dataResultGet(data); 
            },
            error: function (xhr, exception, errorThrown) {
                exc = z_GetAjaxException(xhr, exception, errorThrown);
                OBERONApplicationBase.logException(exc);
            }
        });
        return exc;
    }

    OBERONApplicationBase.getData = function (ajaxurl) {
        var exc = OBERONApplicationBase.myException('');                
        jQuery.ajax({ type: 'GET', cache: false, async: false,
            dataType: 'json', contentType: 'application/json; charset=utf-8',
            url: ajaxurl, processData: true,
            beforeSend: function (xhr) {            
				if ( OBERONApplicationBase.settings.apiNonce && OBERONApplicationBase.settings.apiNonce.length != 0 ) {
					xhr.setRequestHeader( 'X-WP-Nonce', OBERONApplicationBase.settings.apiNonce );
				}
            },
            success: function (data, textStatus, xhr) {
                exc = dataResultGet(data);
            },
            error: function (xhr, exception, errorThrown) {
                exc = z_GetAjaxException(xhr, exception, errorThrown);
                OBERONApplicationBase.logException(exc);
            }
        });
        return exc;
    }

    OBERONApplicationBase.getHtml = function (ajaxurl, callType, jdata) {
        var exc = OBERONApplicationBase.myException('');
        if (!callType) { callType = 'GET'; }
        jQuery.ajax({ type: callType, url: ajaxurl, cache: false, async: false, timeout: 10000,
            dataType: 'html', contentType: 'text/html; charset=utf-8',
            processData: false, data: JSON.stringify(jdata),
            beforeSend: function (xhr) {
				if ( OBERONApplicationBase.settings.apiNonce && OBERONApplicationBase.settings.apiNonce.length != 0 ) {
					xhr.setRequestHeader( 'X-WP-Nonce', OBERONApplicationBase.settings.apiNonce );
				}
            },
            success: function (data, textStatus, xhr) {
                exc.data = data;
                exc.result = true;
            },
            error: function (xhr, exception, errorThrown) {
                exc = z_GetAjaxException(xhr, exception, errorThrown);
                OBERONApplicationBase.logException(exc);
            }
        });
        return exc;
    }
    
    OBERONApplicationBase.numFormat = function (num, decimals, useFormat) {
        var res = '';
        if (useFormat && useFormat != true) {
            return eval(num).toFixed(eval(decimals));
        } else {
            return z_numFormat(num, decimals, ',', ' ');            
        }
    };

	//--- Format number that is always in correct format 12345.45.
    function z_numFormat(number, decimals, dec_point, thousands_sep) {
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
          prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
          sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
          dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
          s = '',
          toFixedFix = function (n, prec) {
              var k = Math.pow(10, prec);
              return '' + (Math.round(n * k) / k).toFixed(prec);
          };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }

	//--- Format (get) date from .NET web service value structure to number in js.
    OBERONApplicationBase.dateGet = function (dat) {
        var result = null;
        try {
            result = new Date(dat);
            if (typeof (result) === "date") { return result; }
        } catch (e) {/* testujeme ešte nižšie */}
        if (typeof (dat) === "string") {
            dat = jQuery.trim(dat);
            if (dat.indexOf('/Date(') >= 0) {
                result = new Date(parseFloat(dat.replace("/Date(", "").replace(")/", "")));
            } else if (dat.indexOf('-') > -1) {
                if (dat.indexOf(':') > -1) {                                        
                    result = new Date(dat.replace(/(\d{2,4})\-\s*(\d{1,2})\-\s*(\d{1,2})\s*(\d{1,2})\:\s*(\d{1,2})\:\s*(\d{1,2})/, "$1-$2-$3T$4:$5:00"));
                } else {
                    result = new Date(dat.replace(/(\d{2,4})\-\s*(\d{1,2})\-\s*(\d{1,2})/, "$2/$3/$1"));
                }
            } else if (dat.indexOf('.') > -1) {
                if (dat.indexOf(':') > -1) {
                    result = new Date(dat.replace(/(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{2})\:(\d{2})\:(\d{2})/, "$3-$2-$1T$4:$5:00"));
                } else {
                    result = new Date(dat.replace(/(\d{2})\.(\d{2})\.(\d{2,4})/, "$2/$1/$3"));
                }
            } else if (dat.indexOf('/') > -1) {
                if (dat.indexOf(':') > -1) {
                    result = new Date(dat.replace(/(\d{2})\/(\d{2})\/(\d{2,4})\s+(\d{2})\:(\d{2})\:(\d{2})/, "$3-$2-$1T$4:$5:00"));
                } else {
                    result = new Date(dat.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, "$2/$1/$3"));
                }
            }
            if (result) {
                if (result < new Date("1/1/1900")) { result = null; }
            }
        } else { result = dat; }
        return result;
    };

	//--- Format date to expected format dd.MM.yyyy.
    OBERONApplicationBase.dateFormat = function (dat, format) {
        var date;
        if (!dat) { return ''; }
        if (dat instanceof Date) { date = dat; } else { date = OBERONApplicationBase.dateGet(dat); }
        if (!date) { return ''; }
        if (!format) { format = 'dd.MM.yyyy'; }
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        format = format.replace("MM", month.toString().padL(2, "0"));
        if (format.indexOf("yyyy") > -1) { format = format.replace("yyyy", year.toString()); }
        if (format.indexOf("yy") > -1) { format = format.replace("yy", year.toString().substr(2, 2)); }
        format = format.replace("dd", date.getDate().toString().padL(2, "0"));
        var hours = date.getHours();

        if (format.indexOf("HH") > -1) { format = format.replace("HH", hours.toString().padL(2, "0")); }
        if (format.indexOf("t") > -1) {
            //--- ak je 12 hodinový formát tak musí byť označenie pm/am
            if (hours > 11) { format = format.replace("t", "pm"); } else { format = format.replace("t", "am"); }
            if (format.indexOf("hh") > -1) {
                if (hours > 12) { hours -= 12; }
                if (hours === 0) { hours = 12; }
                format = format.replace("hh", hours.toString().padL(2, "0"));
            }
        }
        if (format.indexOf("mm") > -1) { format = format.replace("mm", date.getMinutes().toString().padL(2, '0')); }
        if (format.indexOf("ss") > -1) { format = format.replace("ss", date.getSeconds().toString().padL(2, '0')); }
        return format;
    };


    OBERONApplicationBase.monthName = function (dat, getShort) {
        if (!dat) { return ''; }
        if (dat instanceof Date) { date = dat; } else { date = OBERONApplicationBase.dateGet(dat); }
        if (!date) { return ''; }
        var res = '';
        res = OBERONApplicationBase.settings.monthNames[date.getMonth()];
        if (getShort && getShort == true) { res = res.substr(0, 3); }
        return res;
    };

    OBERONApplicationBase.dayName = function (dat, getShort) {
        if (!dat) { return ''; }
        if (dat instanceof Date) { date = dat; } else { date = OBERONApplicationBase.dateGet(dat); }
        if (!date) { return ''; }
        var res = '';
        if (getShort && getShort == true) {
            res = OBERONApplicationBase.settings.dayNamesShort[date.getDay()];
        } else {
            res = OBERONApplicationBase.settings.dayNames[date.getDay()];
        }
        return res;
    };

    OBERONApplicationBase.pause = function (milisec) {
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while (curDate - date < milisec);
    };

    OBERONApplicationBase.wait = function (ms, handler) {
        setTimeout(handler, ms);
    };

	// Redirect page.
    OBERONApplicationBase.pageRedirect = function (url) { document.location.href = url; };

	// Application type exceptions.
    OBERONApplicationBase.myException = function (descr, msg, errNum, res) { //exception object
        return { result: !res ? false : res, errNumber: !errNum ? 0 : errNum, message: !msg ? '' : msg, description: !descr ? '' : descr };
    };

	// Get empty ajax call data result object for reference.
    OBERONApplicationBase.dataResult = function () { //data result object
        return { result: false, errNumber: 0, description: '', data: null };
	};
	// Get empty method result.
    OBERONApplicationBase.result = function () {
        this.errNumber = 0;
        this.description = '';
        this.result = false;
    };

	// Log error to browser console with message.
    OBERONApplicationBase.log = function (msg) {
        if (!msg) return;
        setTimeout(function () {
            throw new Error(msg);
        }, 0);
	};
	// Log method exception.
    OBERONApplicationBase.logException = function (exc) {
        if (!exc) return;
        var msg = '';
        msg += !exc.errNumber ? '' : exc.errNumber + ': ';
        msg += !exc.description ? '' : exc.description;
        msg += !exc.message ? '' : ' (' + exc.message + ')';
        OBERONApplicationBase.log(msg);
    };

    /* - validation methods - */

    OBERONApplicationBase.validateEmail = function (email) {
        return OBERONApplicationBase.validateRegEx(email, /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };
    OBERONApplicationBase.validatePhone = function (phoneNo) {
        return OBERONApplicationBase.validateRegEx(phoneNo, /^([\+]{1}[\d]{3}?|[\d]{5}|[\d]{4})?[\s\.-]*(\d{3})[\s\.-]*(\d{3})[\s\.-]*(\d{3})?$/);
    };
    OBERONApplicationBase.validateIP = function (ip) {
        return OBERONApplicationBase.validateRegEx(ip, /^\d{1,3}.{0,1}\d{1,3}.{0,1}\d{1,3}.{0,1}\d{1,3}$/);
    };
    OBERONApplicationBase.validateRegEx = function (text, regex) {
        if (!text || text.length === 0) { return false; }
        if (!regex) { return false; }
        var res = regex.test(text);
        return res;
    };

	
	// Get dataresult from ajax call to method result.
    function dataResultGet(data) {        
        var exc = OBERONApplicationBase.myException('');
        exc.result = true; 
        if(!data) {
            exc.result = false;
            exc.description = '';
        } else {
            exc.result = !data.result ? false : data.result; 
            exc.errNumber = !data.errNumber ? 0 : data.errNumber;
            exc.description = !data.description ? '' : data.description;
            exc.data = !data.data ? '' : data.data;
        }
        return exc;
	}
	

    /* --- Support methods --- */
    function z_GetAjaxException(jqXHR, exception, errorThrown) {
        var exc = OBERONApplicationBase.myException();

        if (jqXHR.status === 0) {
            exc = OBERONApplicationBase.myException('Server webovej služby je v tejto chvíli nedostupný.','',111);
        } else if (jqXHR.status == 404) {
            exc = OBERONApplicationBase.myException('Metóda pre spracovanie požiadavky nebola nájdená.', '', 404);
        } else if (jqXHR.status == 401) {
            exc = OBERONApplicationBase.myException('Užívateľ nie je prihlásený.', '', 401);
        } else if (jqXHR.status == 500) {
            exc = OBERONApplicationBase.myException('Interná chyba servera webovej služby.', '', 500);
        } else if (exception === 'parsererror') {
            exc = OBERONApplicationBase.myException('Chyba pre spracovaní JSON dát zo servera.', '', 900);
        } else if (exception === 'timeout') {
            exc = OBERONApplicationBase.myException('Čas pre spracovanie požiadavky vypršal.', '', 901);
        } else if (exception === 'abort') {
            exc = OBERONApplicationBase.myException('Asynchrónne volanie bolo prerušené.', '', 902);
        } else {
            exc = OBERONApplicationBase.myException('Neznáma chyba.<br/>' + jqXHR.statusText, '', 99);
        }
        return exc;
    }


	/* --- Extension methods --- */
	
	//--- Convert date value to .NET web service text value.
    Date.toRequest = function (dat, jsonNet) {
        var result = '';
        if (!dat || dat.length == 0) { return ''; }
        if (!(dat instanceof Date)) { return ''; }
        if (isNaN(dat.getTime())) { return ''; }
        if (jsonNet && jsonNet == true) {
            result = '/Date(' + Date.parse(dat) + '+0100)/';
        } else {// formát 'yyyy-mm-ddThh:mm:ss'
            result = dat.toISOString();
        }
        return result;
    }

	//--- Add days to date.
    Date.addDays = function (date, days) {
        return new Date(date.setDate(date.getDate() + days));
    };

	//--- Add value to actual date.
    Date.prototype.add = function (sInterval, iNum) {
        var dTemp = this;
        if (!sInterval || iNum == 0) return dTemp;
        switch (sInterval.toLowerCase()) {
            case "ms":
                dTemp.setMilliseconds(dTemp.getMilliseconds() + iNum);
                break;
            case "s":
                dTemp.setSeconds(dTemp.getSeconds() + iNum);
                break;
            case "mi":
                dTemp.setMinutes(dTemp.getMinutes() + iNum);
                break;
            case "h":
                dTemp.setHours(dTemp.getHours() + iNum);
                break;
            case "d":
                dTemp.setDate(dTemp.getDate() + iNum);
                break;
            case "mo":
                dTemp.setMonth(dTemp.getMonth() + iNum);
                break;
            case "y":
                dTemp.setFullYear(dTemp.getFullYear() + iNum);
                break;
        }
        return dTemp;
    }

	//--- comapare two dates with seconds resolution.
    Date.areEqual = function (date1, date2) {//--- porovná či je rovnaký, bez tickov a detailov
        if (!date1 || !date2) { return false; }
        if (date1.getFullYear() != date2.getFullYear() || date1.getMonth() != date2.getMonth() || date1.getDay() != date2.getDay() || date1.getHours() != date2.getHours() || date1.getMinutes() != date2.getMinutes() || date1.getSeconds() != date2.getSeconds()) {
            return false;
        } else {
            return true;
        }
    };

	//--- Repeat given string n-times
    String.repeat = function (chr, count) {
        var str = "";
        for (var x = 0; x < count; x += 1) { str += chr }
        return str;
    };

	//--- Add left padding to text.
    String.prototype.padL = function (width, pad) {
        if (!width || width < 1) { return this; }
        if (!pad) { pad = " "; }
        var length = width - this.length;
        if (length < 1) { return this.substr(0, width); }
        return (String.repeat(pad, length) + this).substr(0, width);
    };

	//--- Add right padding to text.
    String.prototype.padR = function (width, pad) {
        if (!width || width < 1) { return this; }
        if (!pad) { pad = " "; }
        var length = width - this.length;
        if (length < 1) { this.substr(0, width); }
        return (this + String.repeat(pad, length)).substr(0, width);
    };

	//--- Format text.
    String.format = function (frmt, args) {        
        for (var x = 0; x < args.length; x++) {            
            var val = args[x];
            if (!val || val == null) { val = ''; }
            frmt = frmt.replace(new RegExp('\\{' + (x + 1) + '\\}','g'), val);
        }
        return frmt;
    };


    window.OBERONApplicationBase = OBERONApplicationBase;
    window.OBERONApplicationBase.init();

}).call(window);