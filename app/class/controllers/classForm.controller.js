angular.module('class')
  .controller('ClassFormController', function($scope, $routeParams, $location, $timeout, ClassService) {
    $scope.classData = {};
    const classId = $routeParams.id;

    // Validate khối
    $scope.validateGrade = (isFinal = false) => {
      let g = String($scope.classData.grade || '').trim();

      // Chưa kết thúc nhập thì bỏ qua
      if (!isFinal && g.length < 2) return;

      if (!/^\d+$/.test(g)) {
        alert('Khối chỉ được nhập số từ 1 đến 12.');
        $scope.classData.grade = '';
        return false;
      }
      const num = parseInt(g, 10);
      if (num < 1 || num > 12) {
        alert(`Số ${num} không hợp lệ. Nhập số từ 1 đến 12`);
        $scope.classData.grade = '';
        return false;
      }

      $scope.classData.grade = num;
      if (isFinal) {
        $timeout(() => document.getElementById('suffix')?.focus(), 0);
      }
      return true;
    };

    // Chặn ký tự đặc biệt + space khi nhập hậu tố
    $scope.preventInvalidKey = (event) => {
      const key = event.key;
      // Chặn space hoặc ký tự đặc biệt (chỉ cho chữ và số)
      if (!/^[A-Za-z0-9]$/.test(key)) {
        event.preventDefault();
      }
    };

    // Format lại hậu tố mỗi khi thay đổi
    $scope.handleSuffixInput = () => {
      if (!$scope.classData.grade) {
        alert('Vui lòng nhập khối trước!');
        $scope.classData.suffix = '';
        $timeout(() => document.getElementById('grade')?.focus(), 0);
        return;
      }
      let s = ($scope.classData.suffix || '').toUpperCase().substr(0, 10);
      $scope.classData.suffix = s;
    };

    // Load dữ liệu khi sửa
    if (classId) {
      ClassService.getById(classId).then(data => {
        if (!data) throw new Error('Không tìm thấy lớp học');
        $scope.classData = {
          id: data.id,
          grade: data.grade,
          suffix: data.name.replace(data.grade, '').toUpperCase()
        };
        $scope.originalName = data.name;
        $scope.$apply();
      }).catch(err => {
        alert(err.message);
        $location.path('/classes');
      });
    }

    // Lưu lớp
    $scope.save = () => {
      if (!$scope.validateGrade(true)) return;
      $scope.handleSuffixInput();

      const { grade, suffix } = $scope.classData;
      if (!suffix || !/^[A-Z][A-Z0-9]*$/.test(suffix))
        return alert('Hậu tố không hợp lệ');

      const name = `${grade}${suffix}`;
      const msg = classId
        ? `đổi tên lớp "${$scope.originalName}" thành "${name}"`
        : `thêm lớp "${name}"`;

      if (!confirm(`Bạn có chắc chắn muốn ${msg}?`)) return;

      const action = classId
        ? ClassService.update(classId, $scope.classData)
        : ClassService.create($scope.classData);

      action
        .then(r => {
          alert(`Đã ${classId ? 'cập nhật' : 'thêm'} lớp "${r.name}" thành công`);
          $location.path('/classes');
          $scope.$apply();
        })
        .catch(e => {
          alert(e.message);
          if (e.message.includes('đã tồn tại')) $scope.classData.suffix = '';
          $scope.$apply();
        });
    };
  });
