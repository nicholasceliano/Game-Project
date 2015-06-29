module GeneralGameFunctions {
    var siUserName = "gameUserName";

    export function getUserName() {
        if (sessionStorage.getItem(siUserName) == undefined)
            sessionStorage.setItem(siUserName, null);

        return sessionStorage.getItem(siUserName);
    }

    export function setUserName(userName: string) {
        sessionStorage.setItem(siUserName, userName);
    }

    export function removeUserName() {
        sessionStorage.removeItem(siUserName);
    }

    export function verifyUser(sessionUserName: string) {
        if (GeneralGameFunctions.getUserName() !== sessionUserName)
            window.location.href = "/error/1";
    }
    
    export function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}