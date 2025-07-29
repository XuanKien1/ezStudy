angular.module('shared')
  .controller('NavController', function($scope, $location) {
    $scope.isActive = function(path) {
      return $location.path().startsWith(path);
    };
  });
