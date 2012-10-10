var auths = [
    {sid: 'ACT4%2FmQzPK3o', token: 'm7MRkaRlX8SzgTOm'}
];
var cache = localStorage['sgchrome.cache'];
if(cache !== undefined) {
    cache = JSON.parse(cache);
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
            xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.sid + ":" + auth.token));
        },
        success : callback,
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error in sunglass API call : " + textStatus + errorThrown);
        }
    });
}

function getData(callback, forceLoad) {
    var data = [],       // all data to be displayed
        projectMap = [], // map from projectid to project for easy lookup
        finished = 0;
    forceLoad = (forceLoad === undefined?false:forceLoad);

    if(!forceLoad && cache !== undefined) {
        console.log('from cache');
        callback(cache.data);
        return;
    }

    $.each(auths, function(index, auth) {
        apiCall('users', auth, function(account) {
            apiCall('projects', auth, function(resp) {
                var projects = [];
                for(var role in resp) {
                    for(var i = 0;i < resp[role].length;i++) {
                        var project = resp[role][i];
                        var oldProject = (cache !== undefined?cache.projectMap[project.id]:undefined);

                        project.userRole = role;
                        project.changedAssetCounts = [];
                        if(oldProject !== undefined) {
                            var assetNames = ['spaces', 'collaborators', 'models', 'metaModels', 'notes'];
                            for(var j in assetNames) {
                                var assetName = assetNames[j]
                                if(oldProject.assetCounts[assetName] != project.assetCounts[assetName]) {
                                    project.changedAssetCounts.push(assetName);
                                }
                            }
                        }
                        projects.push(project);
                        projectMap[project.id] = project;
                    }
                }
                data.push({account:account, projects:projects});
                finished++;
                if(finished == auths.length) {
                    if(callback !== undefined) {
                        callback(data);
                    }
                    cache = {data:data, projectMap:projectMap};
                    localStorage['sgchrome.cache'] = JSON.stringify(cache);
                }
            })
        });
    });
}