var auths = [
    {sid: 'ACT4%2FmQzPK3o', token: 'm7MRkaRlX8SzgTOm', authString: 'QUNUNCUyRm1RelBLM286bTdNUmthUmxYOFN6Z1RPbQ=='}
];
var cache = localStorage['sgchrome.cache'];

function getData(callback) {
    if(cache === undefined) {
        reloadAll(function() {
            callback(cache.accounts, cache.projects);
        });
    }
    else {
        callback(cache.accounts, cache.projects);
    }
}

function apiCall(url, auth, callback) {
    $.ajax({
        type : "GET",
        url : "https://sunglass.io/api/v1/" + url,
        contentType : "application/json",
        async : true,
        cache : false,
        timeout : 100000,
        beforeSend : function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + auth.authString);
        },
        success : callback,
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error in sunglass API call : " + textStatus + errorThrown);
        }
    });
}

function reloadAll(callback) {
    var projects, accounts;
    var finished = 0;
    for(var i in auths) {
        var auth = auths[i];
        apiCall('users', auth, function(account) { // fetch account details
            accounts[auth.authString] = account;
            apiCall('projects', auth, function(resp) { // fetch user details
                for(var role in resp) {
                    var project = resp[role];
                    var oldProject = cache.projects[auth.authString][project.id];

                    project.userRole = role;
                    project.changedAssetCounts = [];
                    if(oldProject !== undefined) {
                        // find changed asset counts
                        var assetNames = ['spaces', 'collaborators', 'models', 'metaModels', 'notes'];
                        for(var j in assetNames) {
                            var assetName = assetNames[j]
                            if(oldProject.assetCounts[assetName] != project.assetCounts[assetName]) {
                                project.changedAssetCounts.push(assetName)
                            }
                        }
                    }
                    projects[auth.authString][project.id] = project;
                }
                finished++;
                if(finished == auths.length ) {
                    if(cache === undefined) {
                        cache = {projects: projects, accounts: accounts}
                    }
                    else {
                        cache.projects = projects;
                        cache.accounts = accounts;
                    }
                    localStorage['sgchrome.cache'] = cache;
                    if(callback !== undefined) {
                        callback();
                    }
                }
            });
        });
    }
}