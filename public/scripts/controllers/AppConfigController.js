angular.module('main')
    .controller('AppConfigCtrl', function ($scope, Toast, $mdDialog, $translate, AppConfig, File, Auth) {

        Auth.ensureLoggedIn().then(function () {
            AppConfig.loadOne().then(function (appConfig) {
                $scope.obj = appConfig || new AppConfig;
                $scope.$apply();
            });
        });

        $scope.uploadImage = function (field, file) {

            if (file) {

                File.upload(file).then(function (savedFile) {
                    $scope.obj.admin[field] = savedFile;
                    $translate('FILE_UPLOADED').then(function(str) {
                        Toast.show(str);
                    });
                    $scope.$apply();
                }, function (error) {
                    Toast.show(error.message);
                    $scope.$apply();
                });
            }
        };

        $scope.onSave = function () {

            $scope.isSaving = true;

            AppConfig.save($scope.obj).then(function () {
                $translate('SAVED').then(function(str) {
                    Toast.show(str);
                });
                $mdDialog.hide();
                $scope.isSaving = false;
                $scope.$apply();
            }, function (error) {
                Toast.show(error.message);
                $scope.isSaving = false;
                $scope.$apply();
            });

        };

        $scope.hide = function () {
            $mdDialog.cancel();
        };

        $scope.openStripeCurrencies = function () {
            window.open('https://stripe.com/docs/currencies', '_blank');
        };

    });