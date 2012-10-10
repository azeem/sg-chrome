var popupContainer, template;

function updatePopup(data) {
    for(var i = 0;i < data.length;i++) {
        var account = data[i].account;
        var projects = data[i].projects;

        var accContainer = template.clone();
        accContainer.find('.acc-name').text(account.name);
        var projTemplate = accContainer.find('.project-details').detach();
        for(var j = 0;j < projects.length;j++) {
            var project = projects[j];
            var projContainer = projTemplate.clone();
            projContainer.find('.project-name').text(project.name).click(function() {
                var url = 'https://sunglass.io/project/' + project.id
                var spaceUrlSplits = project.links.rootSpace.split('/')
                url += '?spaceId=' + spaceUrlSplits[spaceUrlSplits.length-1]
                chrome.tabs.create({url:url});
            });
            projContainer.find('.project-desc').text(project.description);
            projContainer.find('.project-visibility').text(project.visibility);            
            $.each(project.assetCounts, function(assetname, count) {
                var elem = projContainer.find('.' + assetname);
                elem.text(count);
                if($.inArray(assetname, project.changedAssetCounts) != -1) {
                    elem.addClass('highlight');
                }
            })
            projContainer.appendTo(accContainer);
        }
        accContainer.appendTo(popupContainer);
    }
}

$(document).ready(function() {
     popupContainer = $('#popup-container');
     template = popupContainer.children().detach();
     chrome.runtime.getBackgroundPage(function(bgPage) {
        bgPage.getData(updatePopup);
     });
});