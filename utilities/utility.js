module.exports.getQuery = function (req) {
    let query = req;
    let len = query.indexOf("?");
    let q = query.slice(len);

    query = q.indexOf("=");
    q = q.slice(query+1);

    return q;
}
