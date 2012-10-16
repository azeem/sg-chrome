function apiCall(url, auth, success, error) {
    if(error === undefined) {
        error = function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error in sunglass API call : " + textStatus + " " + errorThrown);
        }
    }

    $.ajax({
        type : "GET",
        url : "https://sunglass.io/api/v1/" + url,
        contentType : "application/json",
        async : true,
        cache : false,
        timeout : 100000,
        beforeSend : function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.sid + ":" + auth.token));
        },
        success : success,
        error : error 
    });
}