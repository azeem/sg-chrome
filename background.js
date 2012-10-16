var auths = [
    {sid: 'ACT4%2FmQzPK3o', token: 'm7MRkaRlX8SzgTOm'}
];
var cache = localStorage['sgchrome.cache'];
if(cache !== undefined) {
    cache = JSON.parse(cache);
}

function clearNotifs() {
    cache.notifs = [];
    cache.changeCount = []
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

    if(!forceLoad && cache !== undefined) {
        console.log('from cache');
        callback(cache.data, cache.changeCount, cache.notifs);
        return;
    }

    console.log('Reloading all data')
    $.each(auths, function(index, auth) {
        apiCall('users', auth, function(account) {
            apiCall('projects', auth, function(resp) {
                var projects = [];
                for(var role in resp) {
                    for(var i = 0;i < resp[role].length;i++) {
                        var project = resp[role][i];
                        var oldProject = (cache !== undefined?cache.projectMap[project.id]:undefined);

                        var oldNotif = (cache !== undefined?cache.notifs[project.id]:undefined);
                        var notif = (oldNotif !== undefined?oldNotif:[]);

                        if(oldProject !== undefined) {
                            $.each(['spaces', 'collaborators', 'models', 'metaModels', 'notes'], function(index, assetName) {
                                if(oldProject.assetCounts[assetName] != project.assetCounts[assetName]) {
                                    if($.inArray(assetName, notif) == -1) {
                                        notif.push(assetName);
                                    }
                                }
                            });
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
                if(finished == auths.length) {
                    console.log('Finished loading all data');
                    console.log('changeCount =' + changeCount);
                    if(callback) {
                        callback(data, changeCount, notifs);
                    }
                    cache = {data:data, projectMap:projectMap, notifs:notifs, changeCount:changeCount};
                    localStorage['sgchrome.cache'] = JSON.stringify(cache);
                }
            })
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