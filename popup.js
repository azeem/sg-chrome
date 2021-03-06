var popupContainer; // container for popup
var acctsTemplate;  // template for popup
var busyTemplate;   // template for busy message
var emptyTemplate;   // template for empty message

function fixHeight() {
    $('html,body').height(popupContainer.outerHeight()+10);
}

/*
 * popup refresh handler
 */
function updatePopup(data, changeCount, notifs) {
    popupContainer.children().remove();
    if(data.length == 0) {
        emptyTemplate.clone().appendTo(popupContainer);
    }
    else {
        $.each(data, function(i, item) {
            var account = data[i].account;
            var projects = data[i].projects;

            var accContainer = acctsTemplate.clone();
            accContainer.find('.acc-name').text(account.name);
            var projTemplate = accContainer.find('.project-details').detach();

            $.each(projects, function(index, project) {
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
                    if(notifs[project.id] !== undefined && $.inArray(assetname, notifs[project.id]) != -1) {
                        elem.addClass('highlight');
                    }
                });
                projContainer.appendTo(accContainer);
            });
            accContainer.appendTo(popupContainer);
        });
    }
    fixHeight();
}

/*
 * Bootstrap
 */
function boot() {
    popupContainer = $('#popup-container');
    acctsTemplate = popupContainer.find('.acc-container').detach();
    busyTemplate = popupContainer.find('.busybox').detach();
    emptyTemplate = popupContainer.find('.emptybox').detach();
    chrome.runtime.getBackgroundPage(function(bgPage) {
        busyTemplate.clone().appendTo(popupContainer);
        fixHeight();
        bgPage.getData(updatePopup);
        bgPage.clearNotifs();
    });
}

//if(chrome.extension !== undefined) { // boot javascript only if loaded as extension
    $(document).ready(boot);
//}