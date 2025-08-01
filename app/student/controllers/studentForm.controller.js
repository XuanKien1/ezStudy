angular.module('student').controller('StudentFormController', function ($scope, $location, $routeParams, $timeout, StudentService, ClassService) {
  const id = $routeParams.id;
  $scope.title = id ? 'Sửa thông tin học sinh' : 'Thêm học sinh';
  $scope.student = { fullName: '', dob: '', className: '', age: undefined };
  $scope.groupedClasses = []; let allClassNames = [];

  // Helpers
  const normalize = name => name?.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || '';
  const isValidName = name => /^[A-Za-zÀ-ỹ\s'-]+$/.test(name.trim());
  const parseClass = c => (c.name.match(/^(\d+)(.*)$/) || [0, '', '']).slice(1).map((v, i) => i ? v : +v);
  const sortClasses = cls => cls.sort((a, b) => {
    const [a1, a2] = parseClass(a), [b1, b2] = parseClass(b);
    return a1 - b1 || a2.localeCompare(b2);
  });
  const groupByGrade = cls => Object.entries(cls.reduce((g, c) => {
    const k = c.name.match(/^(\d+)/)?.[1] || 'Khác';
    (g[k] = g[k] || []).push(c); return g;
  }, {})).sort((a, b) => a[0] - b[0]).map(([grade, cl]) => ({ grade, classes: sortClasses(cl) }));

  // Tính tuổi
  $scope.calculateAge = () => {
    const d = new Date($scope.student.dob), t = new Date();
    if (isNaN(d) || d > t) return $scope.student.age = undefined;
    let a = t.getFullYear() - d.getFullYear();
    if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate())) a--;
    $scope.student.age = (a >= 1 && a <= 90) ? a : undefined;
  };

  // Save
  $scope.save = () => {
    $scope.student.fullName = normalize($scope.student.fullName);
    if (!isValidName($scope.student.fullName)) return alert('Họ tên không hợp lệ!');
    if (!$scope.student.fullName || !$scope.student.dob || !$scope.student.className) return alert('Vui lòng điền đủ thông tin');
    $scope.calculateAge(); if ($scope.student.age === undefined) return alert('Ngày sinh không hợp lệ!');
    const className = $scope.student.className.toUpperCase();
    if (!allClassNames.includes(className))
      return alert(`Lớp "${className}" không tồn tại!`);

    // Tạo câu chữ đầy đủ
    const classText = $scope.student.className ? ` lớp "${$scope.student.className}"` : '';
    if (!confirm(`${id ? 'Cập nhật' : 'Thêm'} học sinh "${$scope.student.fullName}"${classText}?`)) return;

    // Lưu + thông báo
    (id ? StudentService.update(id, $scope.student) : StudentService.create($scope.student))
      .then(r => {
        const classText2 = r.className ? ` lớp "${r.className}"` : '';
        alert(`Đã ${id ? 'cập nhật' : 'thêm'} học sinh "${r.fullName}"${classText2} thành công`);
        $timeout(() => $location.path('/students'), 0);
      })
      .catch(e => alert(e.message));
  };

  // Load lớp + Selectize
  const initSelectize = () => {
    const el = document.getElementById('classSelect');
    if (!el || el.selectize || !window.$ || !$.fn || !$.fn.selectize) return;
    $(el).selectize({
      allowEmptyOption: true,
      placeholder: '--- Chọn lớp ---',
      searchField: ['text'],
      onChange: val => $scope.$apply(() => $scope.student.className = val || '')
    });
  };

  ClassService.getAll().then(cls => {
    $scope.groupedClasses = groupByGrade(cls || []);
    allClassNames = cls.map(c => c.name.toUpperCase());
    $scope.$apply();
    $timeout(initSelectize, 0);

    if (id) {
      StudentService.getById(id).then(d => {
        if (!d?.fullName) return alert('Không tìm thấy học sinh'), $location.path('/students');
        $scope.student = { ...d, dob: new Date(d.dob) };
        $scope.calculateAge();
        $scope.$apply();
        // Set value cho selectize
        const el = document.getElementById('classSelect');
        $timeout(() => { if (el?.selectize) el.selectize.setValue(d.className); }, 0);
      });
    }
  });

  $scope.goBack = () => $location.path('/students');
});
