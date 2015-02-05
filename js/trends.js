
function contains(url, obj) {
    if (obj == undefined)
        return -1;
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].site == url)
            return i;
    }
    return -1;
}

function trends(callback) {
    var data = {};
    var topValue = 4;

    chrome.history.search({ text: '', startTime: 0, maxResults: 1000000000 },function(d) {
        setData(d);
        callback(data);
    });

    function setData(d) {
        initData(data);
        for (var i = 0; i < d.length; i++) {
            date = new Date(d[i].lastVisitTime);
            url = hostname(d[i].url);
            addSite(url, data.hours, date.getHours());
            addSite(url, data.days, date.getUTCDate() - 1);
            addSite(url, data.months, date.getMonth());
            addSite(url, data.week, date.getDay());
        }

        overallData(data);

        data.hours.forEach(sortArr);
        data.days.forEach(sortArr);
        data.months.forEach(sortArr);
        data.week.forEach(sortArr);

    };

    function sortArr(d) {
        d.sites = top(d.sites, d.count, topValue);
    }

    function addSite(site, arr, i) {
        index = contains(site, arr[i].sites);
        if (index == -1) {
            arr[i].sites.push({ count: 1, site: site });
        } else {
            arr[i].sites[index].count++;
        }
        arr[i].count++;
    };  


    function initData(d) {
        d.hours = [];
        d.days = [];
        d.week = [];
        d.months = [];
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        days = ["Sunday", "Monday", "Tuesday", "Wedneday", "Thursday", "Friday", "Saturday"];
        for (var i = 0; i < 24; i++)
            d.hours.push({ count: 0, value: i, sites: [] });
        for (var i = 0; i < 31; i++)
            d.days.push({ count: 0, value: i + 1, sites: [] });
        for (var i = 0; i < 7; i++)
            d.week.push({ count: 0, value: days[i], sites: [] });
        for (var i = 0; i < 12; i++) {
            d.months.push({ count: 0, value: months[i], sites: [] });
        }

    };

    function top(d, t, m) {
        d.sort(sortDesc);
        if (d.length > m) {
            var temp = [], total = 0;
            for (var i = 0; i < m; i++) {
                temp.push(d[i]);
                total += d[i].count;
            }
            temp.push({ count: t - total, site: 'others' });
            return temp;
        }
        return d;
    };

    function overallData(d) {
        var temp = [];
        var total = 0;

        for (var i = 0; i < data.hours.length; i++) {
            for (var j = 0; j < data.hours[i].sites.length; j++) {
                var url = data.hours[i].sites[j].site;
                var index = contains(url, temp);
                if (index == -1) {
                    temp.push({ count: data.hours[i].sites[j].count, site: url })
                } else {
                    temp[index].count += data.hours[i].sites[j].count;
                }
                total += data.hours[i].sites[j].count;
            }
        }

        temp = top(temp, total, topValue);
        d.overall = { count: total, sites: temp };
    };

    function sortDesc(a, b) {
        if (a.count < b.count)
            return 1;
        if (a.count > b.count)
            return -1;
        return 0;
    };

};
