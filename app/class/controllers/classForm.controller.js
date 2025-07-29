angular.module('class')
  .controller('ClassFormController', function($scope, $routeParams, $location, ClassService) {
    $scope.classData = {};
    $scope.grades = ClassService.getGrades();
    const classId = $routeParams.id;

    const alertAndApply = (msg) => { alert(msg); $scope.$apply(); };
    const validateGrade = () => {
      const g = parseInt($scope.classData.grade);
      if (!g || g < 1 || g > 12) {
        alert(`Số ${g || ''} không hợp lệ. Nhập số từ 1 đến 12`); $scope.classData.grade = ''; return false;
      }
      return true;
    };
    const validateSuffix = () => {
      let s = ($scope.classData.suffix || '').replace(/[^A-Za-z0-9]/g, '');
      if (!/^[A-Za-z]/.test(s)) { alert('Hậu tố phải bắt đầu bằng chữ cái'); s = ''; }
      $scope.classData.suffix = s.substr(0, 10).toUpperCase();
    };

    if (classId) {
      ClassService.getById(classId).then(data => {
        if (!data) throw new Error('Không tìm thấy lớp học');
        $scope.classData = { id: data.id, grade: data.grade, suffix: data.name.replace(data.grade, '').toUpperCase() };
        $scope.originalName = data.name; $scope.$apply();
      }).catch(err => { alert(err.message); $location.path('/classes'); });
    }

    $scope.save = () => {
      if (!validateGrade()) return;
      validateSuffix();
      const { grade, suffix } = $scope.classData;
      if (!suffix || !/^[A-Z][A-Z0-9]*$/.test(suffix)) return alert('Hậu tố không hợp lệ');
      const name = `${grade}${suffix}`, msg = classId ? `đổi tên lớp "${$scope.originalName}" thành "${name}"` : `thêm lớp "${name}"`;
      if (!confirm(`Bạn có chắc chắn muốn ${msg}?`)) return;

      const action = classId ? ClassService.update(classId, $scope.classData) : ClassService.create($scope.classData);
      action.then(r => { alert(`Đã ${classId ? 'cập nhật' : 'thêm'} lớp "${r.name}" thành công`); $location.path('/classes'); $scope.$apply(); })
            .catch(e => { alert(e.message); if (e.message.includes('đã tồn tại')) $scope.classData.suffix = ''; $scope.$apply(); });
    };
  });
