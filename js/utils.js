document.getElementById("btn_search").onclick = function () {
    query_history(document.getElementById("search").value);
};

query_history("");

function convert_time(unix_time) {
    var d = (new Date(unix_time) + '').split(' ');
    return d[1] + ' ' + d[2] + ' ' + d[4];
};

function clear_table(table) {
    while (table.lastChild) {
        table.removeChild(table.lastChild);
    }
    init_table(table);
};

function init_table(table) {
    var row = document.createElement("tr");
    row.style.color = "#77E114";
    row.style.backgroundColor = "black";
    var id = document.createElement("td");
    var url = document.createElement("td");
    var title = document.createElement("td");
    var lvt = document.createElement("td");
    var vc = document.createElement("td");

    id.textContent = "Id";
    title.textContent = "Title";
    lvt.textContent = "Last time visited";
    vc.textContent = "Visited count";

    row.appendChild(id);
    row.appendChild(title);
    row.appendChild(lvt);
    row.appendChild(vc);

    table.appendChild(row);
};

function query_history(text) {
    chrome.history.search({ text: text }, function (obj) {
        var table = document.getElementById("test");
        clear_table(table);
        for (var i = 0; i < obj.length; i++) {
            var row = document.createElement("tr");
            var id = document.createElement("td");
            var title = document.createElement("td");
            var lvt = document.createElement("td");
            var vc = document.createElement("td");
            id.textContent = obj[i].id;
            title.textContent = obj[i].title;
            title.title = obj[i].url;
            lvt.textContent = convert_time(obj[i].lastVisitTime);
            vc.textContent = obj[i].visitCount;
            row.appendChild(id);
            row.appendChild(title);
            row.appendChild(lvt);
            row.appendChild(vc);
            table.appendChild(row);
        }
    });
};