exports.logContent = function (content) {
    console.log(content);
    return content;
};

exports.throwError = function (e) {
    console.log(e);
    throw new Error('ERROR');
};