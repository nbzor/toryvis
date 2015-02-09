$(document).ready(function () {

    var rows = 50;
    var lastTime;
    var firstTime;
    var data = {};

    search('');

    $('#btn_search').click(function () {
        if ($('#input_search').val().length > 0) {
            search($('#input_search').val());
        }
    });

    $('#btn_next').click(function () {
        search('', lastTime);
    })


    function display() {
        var container = $(document.createElement('div'))
            .addClass('container-fluid')
            .attr('id', 'history-day');

        var title = $(document.createElement('h4'))
            .append('Today - ' + getDate(new Date()));

        var list = $(document.createElement('ul'))
            .addClass('list-group');

        for (var i = 0; i < data.length; i++) {
            var date = new Date(data[i].lastVisitTime);
            var item = $(document.createElement('li'))
                .addClass('list-group-item')
                .attr('url-data', data[i].url);
            var hour = $(document.createElement('span'))
                .append(getHour(date))
                .css('padding-right', '15px');    
            var icon = $(document.createElement('img'))
                .attr("src", new URL('chrome://favicon/size/16@1x/' + data[i].url))
                .attr("height", 16)
                .attr("width", 16)
                .css('padding-right','5px');

            var link = $(document.createElement('a'))                
                .attr('href', data[i].url)
                .append(data[i].title.length == 0 ? data[i].url : data[i].title)
                .css('padding-right', '15px')                

            var domain = $(document.createElement('span'))
                .addClass('domain')
                .append(hostname(data[i].url));

            var rem = $(document.createElement('button'))
                .addClass('btn btn-default')
                .append('x')
                .click(function () {
                    var d = $(this).parent()[0];
                    chrome.history.deleteUrl({ url: $(d).attr('url-data') });
                    $($(this).parent()[0]).remove();
                    search('');
                });

            $(item).append(hour);
            $(item).append(icon);
            $(item).append($(document.createElement('div')).addClass('title').css('display','inline-block').append(link));
            $(item).append(domain);
            $(item).append(rem);

            $(list).append(item);
        }

        $('#history-day').remove();
        $(container).append($(document.createElement('div')).addClass('row').append(title));
        $(container).append($(document.createElement('div')).addClass('row').append(list));
        $(container).insertBefore('#btn-prev');
    }


    function getHour(d) {
        var h = d.getHours().toString();
        var m = d.getMinutes().toString();
        if (h.length == 1)
            h = '0' + h;
        if (m.length == 1)
            m = '0' + m;        
        return h + ':' + m;
    }

    function getDate(d) {
        var arr = d.toString().split(' ');

        return arr[0] + ',' + arr[1] + ' ' + arr[2] + ',' + arr[3];
    }

    function compareDate(date) {

    }

    function search(t, d) {
        if (d != undefined) {
            chrome.history.search({ text: t, endTime: lastTime, maxResults: rows }, callback);
        } else
            chrome.history.search({ text: t, startTime: 0, maxResults: rows }, callback);
    }

    function callback(d) {
        data = d;
        lastTime = d[d.length - 1].lastVisitTime;
        firstTime = d[0].lastVisitTime;
        display();
    }
});