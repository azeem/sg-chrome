var accounts = [
	{sid: 'ACT4%2FmQzPK3o', token: 'm7MRkaRlX8SzgTOm'}
];
var popupContainer, templateContainer;

function apiCall(url, account, callback) {
    $.ajax({
            type : "GET",
            url : "https://sunglass.io/api/v1/" + url,
            contentType : "application/json",
            async : true,
            cache : false,
            timeout : 100000,
            beforeSend : function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(account.sid + ":" + account.token));
            },
            success : callback,
            error : function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Error in sunglass API call : " + textStatus + errorThrown);
            }
    });
}

function loadProjectDetails(account, accDetails) {
    apiCall('projects', account, function(projects) {
        var accContainer = templateContainer.find('.acc-container').clone();
        accContainer.find('.acc-name').text(accDetails.name);
        
        var projTemplate = accContainer.find('.project-details').detach();
        for(var role in projects) {
            for(var i in projects[role]) {
                var project = projects[role][i];
                var projContainer = projTemplate.clone();
                projContainer.find('.project-name').text(project.name).click(function() {
                    var url = 'https://sunglass.io/project/' + project.id
                    var spaceUrlSplits = project.links.rootSpace.split('/')
                    url += '?spaceId=' + spaceUrlSplits[spaceUrlSplits.length-1]
                    chrome.tabs.create({url:url});
                });
                projContainer.find('.project-desc').text(project.description);
                projContainer.find('.project-visibility').text(project.visibility);
                projContainer.find('.space').text(project.assetCounts.spaces);
                projContainer.find('.people').text(project.assetCounts.collaborators);
                projContainer.find('.model').text(project.assetCounts.metaModels);
                projContainer.find('.note').text(project.assetCounts.notes);
                projContainer.appendTo(accContainer);
            }
        }

        accContainer.appendTo(popupContainer);
    });
}

$(document).ready(function() {
    popupContainer = $('#popup-container');
    templateContainer = $('#template-container');
	for(var i in accounts) {
		var account = accounts[i];
		apiCall('users', account, function(accDetails) {
            loadProjectDetails(account, accDetails);
        });
	}
});