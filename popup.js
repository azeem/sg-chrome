var popupContainer, template;

function updatePopup(accounts, projects) {
    for(var key in accounts) {
        var account = accounts[key];
        var accContainer = template.clone();
        accContainer.find('.acc-name').text(account.name);

        for(var projId in )
    }

    apiCall('projects', account, function(projects) {
        var accContainer = template.clone();
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
    template = popupContainer.children().detach();
	for(var i in accounts) {
		var account = accounts[i];
		apiCall('users', account, function(accDetails) {
            loadProjectDetails(account, accDetails);
        });
	}
});