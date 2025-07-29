angular.module('class')
  .service('ClassService', function (ClassStorageService, StudentStorageService) {
    const handle = fn => new Promise((res, rej) => {
      try { res(fn(ClassStorageService.load())); } catch (e) { console.error('ClassService Error:', e); rej(e); }
    });
    const genName = d => `${d.grade}${d.suffix}`;
    const nameExists = (list, name, id) => list.some(c => c.name === name && c.id !== id);
    const saveStudents = (oldName, newName) => {
      const students = StudentStorageService.load();
      students.forEach(s => { if (s.className === oldName) s.className = newName; });
      StudentStorageService.save(students);
    };

    this.validateGrade = g => { const n = parseInt(g); return !isNaN(n) && n >= 1 && n <= 12; };
    this.getAll = () => handle(list => Array.isArray(list) ? list : []);
    this.getById = id => handle(list => list.find(c => c.id === id) || null);
    this.getGrades = () => Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    this.create = data => handle(list => {
      const name = genName(data);
      if (!this.validateGrade(data.grade)) throw new Error('Khối học phải từ 1–12');
      if (nameExists(list, name)) throw new Error(`Lớp "${name}" đã tồn tại`);
      const newCls = { ...data, id: Date.now().toString(), name };
      list.push(newCls); ClassStorageService.save(list); return newCls;
    });

    this.update = (id, data) => handle(list => {
      const i = list.findIndex(c => c.id === id);
      if (i === -1) throw new Error('Không tìm thấy lớp học');
      if (!this.validateGrade(data.grade)) throw new Error('Khối học phải từ 1–12');
      const oldName = list[i].name, newName = genName(data);
      if (nameExists(list, newName, id)) throw new Error(`Lớp "${newName}" đã tồn tại`);
      list[i] = { ...list[i], ...data, name: newName }; ClassStorageService.save(list);
      saveStudents(oldName, newName); return list[i];
    });

    this.delete = id => handle(list => {
      const c = list.find(c => c.id === id);
      if (!c) throw new Error('Không tìm thấy lớp học');
      ClassStorageService.save(list.filter(x => x.id !== id)); return c.name;
    });
  });
