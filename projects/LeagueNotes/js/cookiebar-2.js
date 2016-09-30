var cname = "consentCookie";
var cvalue = "on";
var exdays = "1";
var cookiehtml = '\
	<div id="cookiebar">\
	We use cookies to track usage and preferences  \
	<a href="#" id="enablecookies" onclick="setCookie();">I Understand.</a>\
	</div>';
function setCookie() {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
	$('#cookiebar').slideUp();
}

function getCookie() {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

$(document).ready(function(){
	if(getCookie() == ''){
		$('#wrapper').prepend(cookiehtml);
	}
	else if(getCookie() == 'on'){
		$('#cookiebar').hide();
	}
});