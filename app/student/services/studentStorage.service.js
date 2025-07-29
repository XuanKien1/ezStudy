angular.module('student')
  .service('StudentStorageService', function() {
    const STORAGE_KEY = 'students';

    this.load = function() {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    };

    this.save = function(students) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    };
  });
