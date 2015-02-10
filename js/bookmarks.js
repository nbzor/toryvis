
function getBookmarks(callback) {

    var data = [];

    chrome.bookmarks.getTree(function (d) {
        for (var i = 0; i < d.length; i++) {
            getChildren(d[i]);
        }
        callback(data);
    });

    function getChildren(d) {
        if (d.children != undefined && d.children.length > 0) {
            for (var i = 0; i < d.children.length; i++)
                getChildren(d.children[i]);
        } else {
            if (d.url != undefined) {
                var dt = { title: d.title, url: d.url };
                if (!contains(dt)) {
                    data.push(dt);
                }
            }
        }
    }

    function contains(d) {
        for (var i = 0; i < data.length; i++)
            if (data[i].url == d.url)
                return true;
        return false;
    }
}