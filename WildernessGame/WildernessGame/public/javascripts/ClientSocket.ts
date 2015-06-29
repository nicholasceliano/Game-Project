/// <reference path="typings/jQuery.d.ts" />
/// <reference path="typings/socket.io.d.ts" />

var socket = io();

module ClientSocket {

    //////////////
    //To Server//
    /////////////

    export function userConnect() {
        var userName: string = $("#txtUsername").val() || $("#lblUsername").text();

        if (userName.trim() === "") {
            alert("Please enter a username to proceed");
            return;
        } else
            socket.emit("userConnect", userName);
    }

    export function logOut() {
        socket.emit("userLogOut", GeneralGameFunctions.getUserName());
        GeneralGameFunctions.removeUserName();
    }

    export function userPositionChange(obj: THREE.Object3D) {
        socket.emit("userPositionChange", GeneralGameFunctions.getUserName(), obj.position.x, obj.position.y,
            obj.position.z, obj.rotation.x, obj.rotation.y, obj.rotation.z);
    }

    export function userDisconnected() {
        socket.emit("userDisconnect", GeneralGameFunctions.getUserName());
    }

    export function beginDataTransmit() {
        socket.emit("beginDataTransmit");
    }

    export function sendChatMessage(msg: string) {
        socket.emit("sendChatMessage", GeneralGameFunctions.getUserName(), msg);
    }

    ////////////////
    //From Server//
    ///////////////

    socket.on("userAccepted", (uri: string, userName: string) => {
        GeneralGameFunctions.setUserName(userName);
        window.location.href = uri;
    });

    socket.on("redirect", (uri: string) => {
        window.location.href = uri;
    });

    socket.on("ErrorMsg", (msg: string) => {
        alert(msg);
    });

    socket.on("loadNewUser",(userName) => {
        var newUser = new PageViewObjects.UserIdentificationData();
        newUser.name("");
        newUser.user(userName);
        viewModel.PageData.userDataList.push(newUser);
        Graphics.createNewUser(userName);
    });

    socket.on("removeUser",(objName: string) => {
        $(viewModel.PageData.userDataList()).each((i, e:any) => {
            if (e.user() === objName)
                viewModel.PageData.removeUser(viewModel.PageData.userDataList()[i]);
        });
        Graphics.removeExistingUser(objName);
    });

    socket.on("updateUsersPosition", (usersPositionArray: UserPosition[]) => {
        //need to update all positions for all other
        var currUser = GeneralGameFunctions.getUserName();
        $.each(usersPositionArray, (i: number, e: UserPosition) => {
            if (e.userName !== currUser) {
                var obj = Graphics.scene.getObjectByName(e.userName);
                obj.position.setX(e.xPos);
                obj.position.setY(e.yPos);
                obj.position.setZ(e.zPos);
                obj.rotation.set(e.xRot, e.yRot, e.zRot);
            }
        });
    });

    socket.on("updateChat", (chatMsg: ChatLog) => {
        var name = $("#tmpChatMessage").html();

        if (chatMsg.userName === GeneralGameFunctions.getUserName())
            name = $("#tmpChatMessageCurrentUser").html();

        var tmpChatMessage = Handlebars.compile(name);
        $("#lstChat").append(tmpChatMessage({ userName: chatMsg.userName, msg: chatMsg.msg }));
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);
    });
}