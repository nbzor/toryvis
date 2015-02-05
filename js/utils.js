

function hostname(url) {
    var matches = url.match(/^.+?:\/\/(?:[^:@]+:[^@]+@)?([^\/?:]+)/);
    return matches ? matches[1] : undefined;
}