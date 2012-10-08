var accounts = [
	{sid: 'ACT4%2FmQzPK3o', token: 'm7MRkaRlX8SzgTOm'}
];
var popupContainer;

function loadProjectDetails(account, projDetails) {
    for(var i in projDetails.owner) {
        var project = projDetails.owner[i];
        var accContainer = popupContainer.find('.acc-container').clone().appendTo(popupContainer);
        accContainer.find('')
    }
}

$(document).ready(function() {
    popupContainer = $('#popup-container');
    $('.template').hide();

	for(var i in accounts) {
		var account = accounts[i];
		$.ajax( {
            type : "GET",
            url : "https://sunglass.io/api/v1/projects",
            contentType : "application/json",
            async : true,
            cache : false,
            timeout : 100000,
            beforeSend : function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(account.sid + ":" + account.token));
            },
            success : loadProjectDetails,
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Error in fetching the project details : " + textStatus + errorThrown);
            }
        });
	}
});