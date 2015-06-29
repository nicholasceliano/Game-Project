/// <reference path="typings/knockout.d.ts" />
/// <reference path="typings/handlebars.d.ts" />

var viewModel;

module PageLoad {
    export function index() {
        var userName = GeneralGameFunctions.getUserName();
        if (userName !== "null") {
            $("#lblUsername").text(userName);
            $("#pnlActiveUser").show();
            $("#pnlLogIn").hide();
        } else {
            $("#pnlLogIn").show();
            $("#pnlActiveUser").hide();
        }
    }

    export function game() {
        bindViewModel();

        GeneralGameFunctions.verifyUser($("#hfUserName").val());

        Graphics.initScene();
        ClientSocket.beginDataTransmit();

        var userList = $("#hfUserList").val().split(",");
        $.each(userList, (i, e) => {
            var userObj = Graphics.scene.getObjectByName(e);
            if (userObj == undefined)
                Graphics.createNewUser(e);

            var user = new PageViewObjects.UserIdentificationData();
            user.name('');
            user.user(e);
            viewModel.PageData.userDataList.push(user);
        });

        window.addEventListener("beforeunload", (e) => {
            ClientSocket.userDisconnected();
        });
    }

    export function bindViewModel() {
        viewModel = {
            PageData: new PageViewObjects.UsersPageData()
        }

        ko.applyBindings(viewModel);
    }
}