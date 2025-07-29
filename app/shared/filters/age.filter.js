angular.module('shared')
  .filter('age', function() {
    return function(dob) {
      if (!dob) return '';
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();

      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age;
    };
  });
