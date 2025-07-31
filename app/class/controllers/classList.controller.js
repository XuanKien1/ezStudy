angular.module("class").controller("ClassListController", function ($scope, ClassService, StudentService) {
  $scope.currentPage = 0;
  $scope.pageSize = 5;
  $scope.classes = [];
  $scope.filteredGroupedClasses = [];

  const loadClasses = () => {
    ClassService.getAll().then(data => {
      $scope.classes = (data || []).sort((a, b) => a.grade - b.grade);
      const grouped = {};
      $scope.classes.forEach(c => {
        grouped[c.grade] = grouped[c.grade] || [];
        grouped[c.grade].push(c);
      });
      $scope.filteredGroupedClasses = Object.keys(grouped)
        .sort((a, b) => a - b)
        .map(grade => ({ grade, classes: grouped[grade] }));
      $scope.$apply();
    }).catch(() => alert("Không thể tải danh sách lớp"));
  };

  $scope.totalPages = () => Math.ceil($scope.filteredGroupedClasses.length / $scope.pageSize) || 1;
  $scope.paginatedGroupedClasses = () => $scope.filteredGroupedClasses.slice($scope.currentPage * $scope.pageSize, ($scope.currentPage + 1) * $scope.pageSize);
  $scope.prevPage = () => { if ($scope.currentPage > 0) $scope.currentPage--; };
  $scope.nextPage = () => { if ($scope.currentPage < $scope.totalPages() - 1) $scope.currentPage++; };

  $scope.deleteClass = (id) => {
    const cls = $scope.classes.find(c => c.id === id);
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp "${cls.name}"?`)) return;
    ClassService.delete(id).then(name => {
      alert(`Đã xóa lớp "${name}" thành công`);
      StudentService.getAll().then(students => students.forEach(s => {
        if (s.className === name) {
          s.className = '';
          StudentService.update(s.id, s);
        }
      }));
      loadClasses();
    }).catch(err => alert(err.message));
  };

  loadClasses();
});
