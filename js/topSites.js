
function topSites(callback) {    
    var topSites = { startTime: 0, endTime: 0, data: [] };

    chrome.topSites.get(function (d) {
        for (i = 0; i < 5; i++) {
            getHistory(d[i].url, d[i].title);
        }
    });

    function getHistory(text, title) {
        chrome.history.search({ text: text, startTime: 0, maxResults: 1000000 }, function (dt) {

            var data = { name: title, dates: [] };
            for (j = 0; j < dt.length; j++) {
                data.dates.push(new Date(dt[j].lastVisitTime));
            }
            topSites.data.push(data);
            if (topSites.data.length == 5) {                
                getMaxMinTime();               
                callback(topSites);
            }
        });
    }

    function getMaxMinTime() {
        var min = Number.MAX_VALUE;
        var max = 0;
        for (i = 0; i < topSites.data.length; i++) {         
            for (j = 0; j < topSites.data[i].dates.length; j++) {
                
                if (topSites.data[i].dates[j] > max) {                  
                    max = topSites.data[i].dates[j];
                }
                if (topSites.data[i].dates[j] < min) {                   
                    min = topSites.data[i].dates[j];
                }
            }
        }  
        
        topSites.startTime = min;
        topSites.endTime = max;
    }
}


