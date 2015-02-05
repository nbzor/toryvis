$(document).ready(function () {
    var rows = 50;
    var lastTime;
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
        var ol = $(document.createElement('ol')).attr('id', 'list')
            .css('list-style', 'none');
        for (var i = 0; i < data.length; i++) {
            var li = $(document.createElement('li'));
            var check = $(document.createElement('input')).attr('type', 'checkbox');
            var span = $(document.createElement('span'));
            var divtitle = $(document.createElement('div'));
            var aref = $(document.createElement('a'));
            var divdom = $(document.createElement('div'));

            $(divtitle).css('display', 'inline-block').css('margin-left', '5px');

            $(span).append(new Date(data[i].lastVisitTime).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"));

            $(aref).attr('href', data[i].url);
            if (data[i].title.length == 0)
                $(aref).append(data[i].url);
            else
                $(aref).append(data[i].title);

            $(divtitle).append(aref);
            $(divdom).append(hostname(data[i].url));
            $(divdom).css('display', 'inline-block').css('margin-left', '10px');

            $(li).append(check);
            $(li).append(span);
            $(li).append(divtitle);
            $(li).append(divdom);

            $(ol).append(li);
        }
        $('#list').remove();
        $('#history_container').append(ol);
    }

    function search(t, d) {
        if (d != undefined) {
            chrome.history.search({ text: t, endTime: lastTime, maxResults: rows }, callback);
        } else
            chrome.history.search({ text: t, startTime: 0, maxResults: rows }, callback);
    }

    function callback(d) {
        data = d;
        lastTime = d[d.length-1].lastVisitTime;
        display();
    }
});