var settings, cache;

/*
 * [Public] returns the extension settings
 */
function getSettings() {
    var copy = {};
    $.extend(true, copy, settings);
    return copy;
}

/*
 * [Public] replaces current settings object and
 * persists it
 */
function saveSettings(newSettings) {
    settings = newSettings;
    localStorage['sgchrome.settings'] = JSON.stringify(newSettings);

    // invalidate cache to force popup reload
    cache.valid = false;
    localStorage['sgchrome.cache'] = JSON.stringify(cache);

    //reset alarm
    console.log('resetting alarm')
    chrome.alarms.clear('sg-chrome-update-alarm');
    chrome.alarms.create('sg-chrome-update-alarm', {periodInMinutes:settings.refreshFreq});
}

/*
 * [Public] clears all notifications in the cache
 * and resets the bade. Also persists the cache
 */
function clearNotifs() {
    if(cache !== undefined) {
        cache.notifs = {};
        cache.changeCount = 0;
    }
    localStorage['sgchrome.cache'] = JSON.stringify(cache);
    chrome.browserAction.setBadgeText({text:''});
}

/*
 * [Public] returns extension content data. either from
 * the cache or loads it on the fly
 */
function getData(callback, forceLoad) {
    var data = [],       // all data to be displayed
        projectMap = {}, // map from projectid to project for easy lookup
        notifs = {},     // list of notifications
        finished = 0,
        changeCount = 0;
    console.log('inside getData');
    forceLoad = (forceLoad === undefined?false:forceLoad);

    if(!forceLoad && cache.valid) {
        console.log('from cache');
        callback(cache.data, cache.changeCount, cache.notifs);
        return;
    }

    if(settings.accounts == 0) {
        if(callback !== undefined) {
            callback(data, changeCount, notifs);
        }
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
                    
                    if(notif === undefined) {
                        notif = [];
                    }

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
            if(finished == settings.accounts.length) {
                console.log('Finished fetching all data');
                if(callback !== undefined) {
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

/*
 * Alarm handler
 */
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

/*
 * Bootstrap
 */
function boot() {
    // load settings and cache from local storage,
    // initialize with defaults
    settings = localStorage['sgchrome.settings'];
    if(settings === undefined) {
        settings = {accounts:[], refreshFreq:5}
    }
    else {
        settings = JSON.parse(settings);
    }
    
    cache = localStorage['sgchrome.cache'];
    if(cache === undefined) {
        cache = {data:[], projectMap:{}, notifs:{}, changeCount:0, valid:true}
    }
    else {
        cache = JSON.parse(cache);
    }

    // setup alarm
    chrome.alarms.onAlarm.addListener(onAlarm);
    chrome.alarms.create('sg-chrome-update-alarm', {periodInMinutes:settings.refreshFreq});
}

boot(); // boot up mother fucker!!