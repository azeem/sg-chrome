var settings = localStorage['sgchrome.settings'];
if(settings === undefined) {
    settings = {accounts:[]}
}
else {
    settings = JSON.parse(settings);
}

var cache = localStorage['sgchrome.cache'];
if(cache === undefined) {
    cache = {data:[], projectMap:[], notifs:[], changeCount:0, valid:true}
}
else {
    cache = JSON.parse(cache);
}

function getSettings() {
    return settings;
}

function saveSettings(newSettings) {
    settings = newSettings;
    localStorage['sgchrome.settings'] = JSON.stringify(newSettings);

    // invalidate cache to force popup reload
    cache.valid = false;
    localStorage['sgchrome.cache'] = JSON.stringify(cache);
}

function clearNotifs() {
    if(cache !== undefined) {
        cache.notifs = [];
        cache.changeCount = []
    }
    localStorage['sgchrome.cache'] = JSON.stringify(cache);
    chrome.browserAction.setBadgeText({text:''});
}

function getData(callback, forceLoad) {
    var data = [],       // all data to be displayed
        projectMap = [], // map from projectid to project for easy lookup
        notifs = [],     // list of notifications
        finished = 0,
        changeCount = 0;
    forceLoad = (forceLoad === undefined?false:forceLoad);

    if(!forceLoad && cache.valid) {
        console.log('from cache');
        callback(cache.data, cache.changeCount, cache.notifs);
        return;
    }

    $.each(settings.accounts, function(index, account) {
        console.log('Fetching Account : ' + account.name);
        apiCall('projects', account, function(resp) {
            var projects = [];
            for(var role in resp) {
                for(var i = 0;i < resp[role].length;i++) {
                    var project = resp[role][i];
                    var oldProject = cache.projectMap[project.id];
                    var notif = cache.notifs[project.id];

                    if(oldProject !== undefined) {
                        $.each(['spaces', 'collaborators', 'models', 'metaModels', 'notes'], function(index, assetName) {
                            if(oldProject.assetCounts[assetName] != project.assetCounts[assetName]) {
                                if($.inArray(assetName, notif) == -1) {
                                    notif.push(assetName);
                                }
                            }
                        });
                    }

                    if(notif === undefined) {
                        notif = [];
                    }
                    if(notif.length > 0) {
                        changeCount++;
                    }

                    projects.push(project);
                    projectMap[project.id] = project;
                    notifs[project.id] = notif;
                }
            }
            data.push({account:account, projects:projects});
            finished++;
            if(finished == settings.accounts.length) {
                console.log('Finished fetching all data');
                if(callback) {
                    callback(data, changeCount, notifs);
                }
                cache = {data:data, projectMap:projectMap,
                         notifs:notifs, changeCount:changeCount,
                         valid:true};
                localStorage['sgchrome.cache'] = JSON.stringify(cache);
            }
        });
    });
}

function onAlarm(alarm) {
    if(alarm.name == 'sg-chrome-update-alarm') {
        getData(function(data, changeCount) {
            if(changeCount > 0) {
                chrome.browserAction.setBadgeText({text:'' + changeCount});
            }
            else {
                chrome.browserAction.setBadgeText({text:''});
            }
        }, true);
    }
}

chrome.alarms.onAlarm.addListener(onAlarm);
console.log('scheduling reload');
chrome.alarms.create('sg-chrome-update-alarm', {periodInMinutes:1})