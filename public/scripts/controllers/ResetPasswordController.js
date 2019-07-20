'use strict';

angular.module('main').controller('ResetPasswordCtrl', function($scope, $mdDialog, $translate, Auth) {

  $scope.isLoading = false;

  var showDialog = function (title, message, ev) {

    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .clickOutsideToClose(true)
        .title(title)
        .content(message)
        .ariaLabel('Alert Dialog')
        .ok('Ok')
        .targetEvent(ev)
    );
  }

	$scope.onResetPassword = function (isFormValid) {

		if (isFormValid) {

      $scope.isLoading = true;
      Auth.resetPassword($scope.email).then(function () {
        $scope.isLoading = false;

        $translate('RESET_PASSWORD_SUCCESS').then(function(str) {
          showDialog('', str);
        });

        $scope.$apply();
        
      }, function (error) {
        $scope.isLoading = false;
        showDialog('', error.message);
      })
		}
	}

});
