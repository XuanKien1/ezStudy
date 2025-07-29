angular.module('student').controller('StudentListController', function ($scope, StudentService, ClassService) {
  $scope.currentPage = 0; $scope.pageSize = 5;
  $scope.students = []; $scope.filteredStudents = [];
  $scope.selectedClass = ''; $scope.classes = [];

  const loadClasses = () => ClassService.getAll().then(c => { $scope.classes = c || []; $scope.$apply(); });
  const loadStudents = () => StudentService.getAll().then(s => {
    $scope.students = s || []; $scope.filterByClass(); $scope.$apply();
  }).catch(e => { console.error('Lỗi tải học sinh:', e); alert('Không thể tải danh sách học sinh'); });

  $scope.filterByClass = () => {
    $scope.filteredStudents = !$scope.selectedClass
      ? [...$scope.students]
      : $scope.students.filter(s => s.className === $scope.selectedClass);
    $scope.currentPage = 0;
  };

  $scope.totalPages = () => Math.ceil($scope.filteredStudents.length / $scope.pageSize) || 1;
  $scope.paginatedStudents = () => {
    const start = $scope.currentPage * $scope.pageSize;
    return $scope.filteredStudents.slice(start, start + $scope.pageSize);
  };
  $scope.prevPage = () => { if ($scope.currentPage > 0) $scope.currentPage--; };
  $scope.nextPage = () => { if ($scope.currentPage < $scope.totalPages() - 1) $scope.currentPage++; };

  $scope.deleteStudent = (id) => {
    const s = $scope.students.find(s => s.id === id);
    if (!s) return alert('Không tìm thấy học sinh cần xoá');
    if (!confirm(`Bạn có chắc chắn muốn xóa học sinh "${s.fullName}"?`)) return;
    StudentService.delete(id).then(() => {
      alert(`Đã xoá học sinh "${s.fullName}" thành công`); loadStudents();
    }).catch(e => { console.error('Lỗi xoá:', e); alert(`Không thể xoá: ${e.message}`); });
  };

  loadClasses(); loadStudents();
});
