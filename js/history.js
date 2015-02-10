$(document).ready(function () {

    var rows = 50;
    var data = {};
    var start = 0;
    var end = rows;
    var totalData = {};
    var bookmarks = {};  

    getBookmarks(function (d) {
        bookmarks = d;
        console.log(d);
        search('');       
    });    

    $('#input_search').keypress(function (e) {
        if (e.keyCode == 13) {
            search($('#input_search').val());
        }
    });

    $('#btn_delete').click(function () {
        $('#input_search').val("");
        search('');
    });

    $('#btn_search').click(function () {
        search($('#input_search').val());
    });

    $('#btn-next').click(function () {
        if (start + rows < totalData.length) {
            start += rows;
            end += rows;
            data = totalData.slice(start, end);
            display();
        } else {
            data = totalData.slice(start, totalData.length);
        }
    });

    $('#btn-prev').click(function () {
        if (start - rows >= 0) {
            start -= rows;
            end -= rows;
            data = totalData.slice(start, end);
            display();
        }
    });

    function createItem(d) {
        var date = new Date(d.lastVisitTime);
        var item = $(document.createElement('li'))
                .addClass('list-group-item')
                .attr('url-data', d.url);
       

        var hour = $(document.createElement('span'))
            .append(getHour(date))
            .css('padding-right', '15px');
        var icon = $(document.createElement('img'))
            .attr("src", new URL('chrome://favicon/size/16@1x/' + d.url))
            .attr("height", 16)
            .attr("width", 16)
            .css('padding-right', '5px');

        var link = $(document.createElement('a'))
            .attr('href', d.url)
            .append(d.title.length == 0 ? d.url : d.title)
            .css('padding-right', '15px');

        if (contains(d)) {
            $(link).addClass('fav');
        }


        var domain = $(document.createElement('span'))
            .addClass('domain')
            .append(hostname(d.url));

        var rem = $(document.createElement('button'))
            .addClass('btn btn-default')
            .append('x')
            .click(function () {
                var d = $(this).parent()[0];
                chrome.history.deleteUrl({ url: $(d).attr('url-data') });
                $($(this).parent()[0]).remove();
                search('', '');
            });

        $(item).append(hour);
        $(item).append(icon);
        $(item).append($(document.createElement('div')).addClass('title').css('display', 'inline-block').append(link));
        $(item).append(domain);
        $(item).append(rem);
        return item;
    }

    function contains(d) {
        for (var i = 0; i < bookmarks.length; i++) {            
            if (hostname(d.url) == hostname(bookmarks[i].url))
                return true;
        }
        return false;
    }

    function createTable(t) {
        var container = $(document.createElement('div'))
           .addClass('history-day container-fluid');

        var title = $(document.createElement('h4'))
            .append(t);

        var list = $(document.createElement('ul'))
            .addClass('list-group');

        $(container).append($(document.createElement('div')).addClass('row').append(title));
        $(container).append($(document.createElement('div')).addClass('row').append(list));
        return { container: container, list: list };
    }

    function display() {
        var table = {};
        $('.history-day').remove();
        if (data.length > 0) {
            table = createTable(getDate(new Date(data[0].lastVisitTime)));
            $(table.list).append(createItem(data[0]));
        }

        for (var i = 1; i < data.length; i++) {          
            if (!compareDate(new Date(data[i - 1].lastVisitTime), new Date(data[i].lastVisitTime))) {
                $(table.container).insertBefore('#btn-prev');
                table = createTable(getDate(new Date(data[i].lastVisitTime)));
            }
            $(table.list).append(createItem(data[i]));
        }
        $(table.container).insertBefore('#btn-prev');
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


    function compareDate(d1, d2) {
        return (d1.getDate() == d2.getDate() &&
          d1.getMonth() == d2.getMonth() &&
          d1.getFullYear() == d2.getFullYear());
    }

    function search(t, d) {
        if (d == undefined) {
            start = 0;
            end = rows;
            chrome.history.search({ text: t, startTime: 0, maxResults: 1000000 }, callback);
        } else {
            chrome.history.search({ text: t, startTime: 0, maxResults: 1000000 }, callback);
        }

    }

    function callback(d) {
        totalData = d;           
        data = totalData.slice(start, end);        
        display();
    }
});