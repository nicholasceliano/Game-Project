var err = require('../zServerSideCode/Errors.js');

exports.index = function (req, res) {
    res.render('index', { title: 'Game - Please Choose UserName' });
};

exports.game = function (req, res) {
    //if username is something then go to game, otherwise go to error page?
    if (req.usersList.indexOf(req.params.username) > -1)
        res.render('game', { title: 'Game - Play', userList: req.usersList, userName: req.params.username });
    else
        res.render('error', { msg: err.errorMsg.MustConnectWithUsername });
};

exports.error = function (req, res) {
    var errorMsg;

    switch (req.params.errorNumber) {
        case '1':
            errorMsg = err.errorMsg.MustConnectWithUsername;
            break;
        default:
            errorMsg = 'Error';
    }

    res.render('error', { msg: errorMsg });
};