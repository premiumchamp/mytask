angular.module('main').controller('NotificationCtrl',
    function ($scope, $translate, Auth, Notification, Toast) {

        $scope.notification = new Notification;

        $scope.notifications = [];

        Auth.ensureLoggedIn().then(function () {
            Notification.all().then(function (notifications) {
                $scope.notifications = notifications;
                $scope.$apply();
            });
        });

        $scope.onSubmit = function () {

            $scope.isSending = true;

            Notification.save($scope.notification).then(function () {

                $translate('SENT').then(function (str) {
                    Toast.show(str);
                });

                $scope.notifications.unshift($scope.notification);
                $scope.notification = new Notification;
                $scope.isSending = false;
                $scope.form.$setUntouched();
                $scope.form.$setPristine();

                $scope.$apply();

            }, function (error) {
                Toast.show(error.message);
                $scope.isSending = false;
                $scope.$apply();
            });
        }

    });