angular.module('shared')
  .component('pagination', {
    bindings: {
      currentPage: '<',
      totalPages: '<',
      onPrev: '&',
      onNext: '&'
    },
    templateUrl: 'app/shared/components/pagination/pagination.html',
    controller: function() {
      this.canPrev = () => this.currentPage > 0;
      this.canNext = () => this.currentPage + 1 < this.totalPages;
    }
  });
