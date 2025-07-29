angular.module('student').service('StudentService', function () {
  const KEY = 'students';
  const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = data => localStorage.setItem(KEY, JSON.stringify(data));

  this.getAll = () => {
    try { return Promise.resolve(load()); }
    catch (e) { console.error('Load error:', e); return Promise.reject(e); }
  };

  this.getById = id => {
    try { return Promise.resolve(load().find(s => s.id === id) || null); }
    catch (e) { return Promise.reject(e); }
  };

  this.create = student => {
    try {
      const list = load(); student.id = Date.now().toString();
      list.push(student); save(list); return Promise.resolve(student);
    } catch (e) { return Promise.reject(e); }
  };

  this.update = (id, data) => {
    try {
      const list = load(), i = list.findIndex(s => s.id === id);
      if (i === -1) return Promise.reject(new Error('Không tìm thấy học sinh'));
      list[i] = { ...list[i], ...data }; save(list);
      return Promise.resolve(list[i]);
    } catch (e) { return Promise.reject(e); }
  };

  this.delete = id => {
    try { save(load().filter(s => s.id !== id)); return Promise.resolve(); }
    catch (e) { return Promise.reject(e); }
  };
});
