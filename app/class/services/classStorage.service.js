angular.module('class')
  .service('ClassStorageService', function() {
    const STORAGE_KEY = 'classes';

    this.load = function() {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    };

    this.save = function(classes) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    };
  });
