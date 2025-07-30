angular.module('student').controller('StudentListController', function ($scope, $timeout, StudentService, ClassService) {
  $scope.currentPage = 0; $scope.pageSize = 5;
  $scope.students = []; $scope.filteredStudents = [];
  $scope.selectedClass = ''; $scope.searchText = ''; $scope.groupedClasses = [];

  const getGrade = (name) => {
    const m = (name || '').match(/^\d+/);
    return m ? m[0] : '';
  };

  const groupByGrade = (list) => {
    const groups = {};
    (list || []).forEach(c => {
      const grade = c.grade || getGrade(c.name) || '';
      (groups[grade] = groups[grade] || []).push(c);
    });
    return Object.keys(groups)
      .sort((a, b) => (+a || 0) - (+b || 0))
      .map(g => ({
        grade: g,
        classes: groups[g].slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }));
  };

  const sortStudentsByClass = (list) => list.slice().sort((a, b) => {
    const gA = +getGrade(a.className) || 0;
    const gB = +getGrade(b.className) || 0;
    if (gA !== gB) return gA - gB;
    return (a.className || '').localeCompare(b.className || '');
  });

  // Khởi tạo Selectize
  let selectizeInstance = null;
  const initSelectize = () => {
    const el = document.getElementById('classFilter');
    if (!el || el.selectize || !window.$ || !$.fn || !$.fn.selectize) return;
    selectizeInstance = $(el).selectize({
      allowEmptyOption: true,
      placeholder: '--- Chọn lớp/khối ---',
      searchField: ['text'],
      onChange: (val) => $scope.$apply(() => { $scope.selectedClass = val || ''; $scope.filter(); })
    })[0].selectize;
  };
  $scope.$on('$destroy', () => { if (selectizeInstance) selectizeInstance.destroy(); });

  // Lọc danh sách
  $scope.filter = () => {
    let list = $scope.students.slice();

    if ($scope.selectedClass) {
      if ($scope.selectedClass.indexOf('grade-') === 0) {
        const grade = $scope.selectedClass.split('-')[1];
        list = list.filter(s => getGrade(s.className) === grade);
      } else {
        list = list.filter(s => s.className === $scope.selectedClass);
      }
    }

    if ($scope.searchText) {
      const q = $scope.searchText.toLowerCase();
      list = list.filter(s => (s.fullName || '').toLowerCase().includes(q));
    }

    $scope.filteredStudents = sortStudentsByClass(list);
    $scope.currentPage = 0;
  };

  // Phân trang
  $scope.totalPages = () =>
    Math.ceil(($scope.filteredStudents.length || 0) / $scope.pageSize) || 1;

  $scope.paginatedStudents = () => {
    const start = $scope.currentPage * $scope.pageSize;
    return $scope.filteredStudents.slice(start, start + $scope.pageSize);
  };

  $scope.prevPage = () => { if ($scope.currentPage > 0) $scope.currentPage--; };
  $scope.nextPage = () => { if ($scope.currentPage < $scope.totalPages() - 1) $scope.currentPage++; };

  // Xoá học sinh
  $scope.deleteStudent = (id) => {
    const s = $scope.students.find(x => x.id === id);
    if (!s) return;

    // Hiển thị message xoá có hoặc không có lớp
    const classText = s.className ? ` lớp "${s.className}"` : '';
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${s.fullName}"${classText}?`)) {
      StudentService.delete(id).then(() => {
        alert(`Đã xoá học sinh "${s.fullName}"${classText} thành công`);
        loadStudents();
      });
    }
  };

  // Load dữ liệu
  const loadStudents = () =>
    StudentService.getAll().then(s => {
      $scope.students = sortStudentsByClass(s || []);
      $scope.filter();
      $scope.$apply();
    });

  ClassService.getAll().then(c => {
    $scope.groupedClasses = groupByGrade(c || []);
    $scope.$apply();
    $timeout(initSelectize, 0);
  });

  loadStudents();
});
