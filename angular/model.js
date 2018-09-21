import { load } from '../res/data.js';

export default function model() {
  var calendar = this;
  calendar.days = load();

  calendar.reorder = () => {
    calendar.days.map(day => day.tasks.sort((t1, t2) => t1.time - t2.time));
  }
  calendar.checkConflicts = () => {
    calendar.days.map(day => day.tasks.map(
      (task, index, tasks) => {
        if (tasks[index + 1])
          task.conflict = tasks[index + 1].time.getTime() == task.time.getTime()
        if (!task.conflict && tasks[index - 1])
          task.conflict = tasks[index - 1].time.getTime() == task.time.getTime()
      }))

    calendar.days.map(day => day.conflict = day.tasks.reduce(
      (conflict, task) => conflict
        || task.conflict
      , false /*No conflict as initial state*/))
  }

  calendar.reorder();
  calendar.checkConflicts();

  calendar.edit = task => task.edit = true;
  calendar.confirm = task => {
    task.edit = false;
    calendar.reorder();
    calendar.checkConflicts();
  }
  calendar.add = () => {
    calendar.currentDay.tasks.push(calendar.currentDay.newTask);
    calendar.currentDay.newTask = {};
    calendar.reorder();
    calendar.checkConflicts();
  }
  calendar.delete = task => {
    calendar.currentDay.tasks = calendar.currentDay.tasks.filter(t => t != task);
    calendar.reorder();
    calendar.checkConflicts();
  }
  calendar.setCurrent = day => calendar.currentDay = day;
}

// export function getData() {
//   return data;
// }

// export function getTasks() {
//   return data.map(day => day.tasks);
// }

// export function getDays() {
//   return data.map(day => day.date);
// }

// export function getDay(args) {
//   var date = args ? args.date : getCurrentDay().date;
//   return data.find(day => day.date == date);
// }

// export function getDayTasks(args) {
//   var date = args ? args.date : getCurrentDay().date;
//   return data.find(day => day.date == date).tasks;
// }

// export function editTask([date, index, task]) {
//   if (!date) date = getCurrentDay().date;
//   data.find(day => day.date == date).tasks[index] = task;
//   reorder(date);
// }

// export function addTask([date, task]) {
//   if (!date) date = getCurrentDay().date;
//   data.find(day => day.date == date).tasks.push(task);
//   reorder(date);
// }

// export function removeTask([date, index]) {
//   if (!date) date = getCurrentDay().date;
//   data.find(day => day.date == date).tasks.splice(index, 1);
//   reorder(date);
// }
// export function setCurrentDay([index]) {
//   currentDay = index;
// }

// export function getCurrentDay() {
//   return data[currentDay];
// }