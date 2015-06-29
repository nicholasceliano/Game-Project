var express = require("express");
var path = require("path");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var err = require("./zServerSideCode/Errors.js");

//All environments - Set up basics
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(require("stylus").middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

// development only
if ("development" === app.get("env")) {
    //Dev enviornment
}

http.listen(app.get("port"), () => {
    console.log("listening on *:".concat(app.get("port")));
});

//Register Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Game - Please Choose UserName" });
});
app.get("/game/:username?", (req, res) => {
    if (usersList.indexOf(req.params.username) > -1)
        res.render("game", { title: "Game - Play", userList: usersList, userName: req.params.username });
    else
        res.render("error", { msg: err.ErrorMsg.mustConnectWithUsername });
});
app.get("/error/:errorNumber?", (req, res) => {
    var errorMsg: string;
    switch (req.params.errorNumber) {
        case "1":
            errorMsg = err.ErrorMsg.mustConnectWithUsername;
            break;
        default:
            errorMsg = "Error";
    }
    res.render("error", { msg: errorMsg });
});

//Server Variables
var usersList: string[] = [];
var usersPositionArray: UserPosition[] = [];
var chatLog: ChatLog[] = [];

//Sockets
io.on("connection", (socket) => {
    var transmitData: any;

    ///////////////
    //Connections//
    ///////////////
    
    socket.on("userConnect", (userName: string, initialLogIn: boolean) => {
        if (usersList.indexOf(userName) === -1) {
            logUserIn(socket, userName);
        } else
            socket.emit("ErrorMsg", err.ErrorMsg.userNameAlreadyTaken);
    });

    socket.on("userDisconnect", (userName: string) => {
        clearInterval(transmitData);//EndDataTransmit
        for (var i = 0; i < usersPositionArray.length; i++) {
            var e = usersPositionArray[i];
            if (e.userName === userName)
                logUserOut(socket, e.userName);
        }
    });
    
    socket.on("userLogOut", (userName: string) => {
        logUserOut(socket, userName);
        socket.emit("redirect", "/");
    });

    /////////////
    //Game Data//
    /////////////

    socket.on("beginDataTransmit", () => {
        setTimeout(() => {
            socket.emit("updateChat", { userName: "Server", msg: "Welcome to the Game", time: new Date() });
            transmitData = setInterval(() => {
                socket.emit("updateUsersPosition", usersPositionArray);
            }, 10);//refreshes the data every 10ms
        }, 1000);//waits 1s to load the data
    });

    socket.on("userPositionChange", (userName: string, xPos: number, yPos: number, zPos: number, xRot: number, yRot: number, zRot: number) => {
        for (var i = 0; i < usersPositionArray.length; i++) {
            var e = usersPositionArray[i];
            if (e.userName === userName) {
                e.xPos = xPos;
                e.yPos = yPos;
                e.zPos = zPos;
                e.xRot = xRot;
                e.yRot = yRot;
                e.zRot = zRot;
            }
        }
    });

    //////////////////
    //Chat Functions//
    //////////////////

    socket.on("sendChatMessage", (userName: string, msg: string) => {
        chatLog.push({ userName: userName, msg: msg, time: new Date() });
        io.emit("updateChat", chatLog[chatLog.length - 1]);
    });
});

function logUserOut(socket, userName: string) {
    usersList.splice(usersList.indexOf(userName), 1);
    usersPositionArray.splice(usersPositionArrayIndex(userName), 1);
    io.emit("removeUser", userName);
    console.log(userName + " has Logged Out");
}

function logUserIn(socket, userName:string) {
    usersList.push(userName);
    usersPositionArray.push({ userName: userName, xPos: 50, yPos: 50, zPos: 50, xRot:0, yRot:0, zRot:0, connected: true });
    socket.emit("userAccepted", "game/".concat(userName), userName);
    io.emit("loadNewUser", userName);
    console.log(userName + " has connected to the game");
}

////////////////////
//Helper Functions//
////////////////////

function usersPositionArrayIndex(userName:string): number {
    for (var i = 0; i < usersPositionArray.length; i++) {
        if (usersPositionArray[i].userName === userName)
            return i;
    }
    return 0;
}

function timeOfDate(date: Date) {
    return ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":" + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":" + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
}

///////////
//Classes//
///////////

class UserPosition {
    userName: string;
    xPos: number;
    yPos: number;
    zPos: number;
    xRot: number;
    yRot: number;
    zRot: number;
    connected: boolean;
}

class ChatLog {
    userName: string;
    msg: string;
    time: Date;
}