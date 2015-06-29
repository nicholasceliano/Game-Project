module PageViewObjects {

    export function UsersPageData() {
        var self = this;
        self.userDataList = ko.observableArray<UserIdentificationData>([]);
        self.removeUser = (e:UserIdentificationData) => {
            self.userDataList.remove(e);
        }
        self.userCount = ko.computed(() => {
            return self.userDataList().length;
        });
    }

    export class UserIdentificationData {
        user = ko.observable("");
        name = ko.observable("");
    }
}