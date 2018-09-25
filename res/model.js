import { load } from './data.js';

// export default
class Model {
  constructor() {
    // this.calendar = this;
    this.days = load();
    this.reorder();
    this.checkConflicts();
    this.currentDay;
  }

  reorder() {
    this.days.map(day => day.tasks.sort((t1, t2) => t1.time - t2.time));
  }
  checkConflicts() {
    this.days.map(day => day.tasks.map(
      (task, index, tasks) => {
        if (tasks[index + 1])
          task.conflict = tasks[index + 1].time.getTime() == task.time.getTime()
        if (!task.conflict && tasks[index - 1])
          task.conflict = tasks[index - 1].time.getTime() == task.time.getTime()
      }))

    this.days.map(day => day.conflict = day.tasks.reduce(
      (conflict, task) => conflict
        || task.conflict
      , false /*No conflict as initial state*/))
  }


  getData() { return this.days; }
  getDayTasks() { return this.currentDay.tasks; }

  editingTask(task) { task.editing = true; }
  confirmTask(task) {
    task.editing = false;
    this.reorder();
    this.checkConflicts();
  }
  addTask(task) {
    if (!task) task = this.currentDay.newTask;
    this.currentDay.tasks.push(task);
    this.currentDay.newTask = {};
    this.reorder();
    this.checkConflicts();
  }
  deleteTask(task) {
    this.currentDay.tasks = this.currentDay.tasks.filter(t => t != task);
    this.reorder();
    this.checkConflicts();
  }
  setCurrentDay(day) {
    if (this.currentDay) this.currentDay.current = false;
    day.current = true;
    this.currentDay = day;
  }
  getCurrentDay() { return this.currentDay; }
}
export default Model;