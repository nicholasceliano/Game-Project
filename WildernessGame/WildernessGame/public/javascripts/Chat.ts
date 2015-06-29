module Chat {
    export function sendChatMessage(e) {
        if (e.keyCode === 13) {//Enter Key
            var txtChat = $("#txtChat");
            ClientSocket.sendChatMessage(txtChat.val());
            txtChat.val("");
            txtChat.hide();
        }
    }
}