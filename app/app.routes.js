angular.module('ezStudy')
  .config(function($routeProvider) {
    $routeProvider
      // Student routes
      .when('/students', {
        templateUrl: 'app/student/views/studentList.html',
        controller: 'StudentListController'
      })
      .when('/students/form/:id?', {
        templateUrl: 'app/student/views/studentForm.html',
        controller: 'StudentFormController'
      })
      // Class routes
      .when('/classes', {
        templateUrl: 'app/class/views/classList.html',
        controller: 'ClassListController'
      })
      .when('/classes/form/:id?', {
        templateUrl: 'app/class/views/classForm.html',
        controller: 'ClassFormController'
      })
      .otherwise({
        redirectTo: '/students'
      });
  });