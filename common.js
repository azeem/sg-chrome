/*
 * Makes a Sunglass API call
 */
function apiCall(url, auth, success, error) {
    /*if(error === undefined) {
        error = function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error in sunglass API call : " + textStatus + " " + errorThrown);
        }
    }
    $.ajax({
        url : "https://sunglass.io/api/v1/" + url,
        type: 'GET',
        async : true,
        cache : false,
        timeout : 100000,
        beforeSend : function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.sid + ":" + auth.token));
        },
        success : success,
        error : error 
    }); */
    apiAjax(url, {
       beforeSend : function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.sid + ":" + auth.token));
        },
        success : success,
        error : error 
    });
}

function apiAjax(url, options) {
    var opt = {
        url : "https://sunglass.io/api/v1/" + url,
        async : true,
        cache : false,
        timeout : 100000,
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error in sunglass API call : " + textStatus + " " + errorThrown);
        }
    };
    $.extend(opt, options);
    $.ajax(opt);
}