import { load } from '../res/data.js';

var data = load();
var currentDay;

function reorder() {
  data.map(day => day.tasks.sort((t1, t2) => t1.time - t2.time));
}
function checkConflicts() {
  data.map(day => day.tasks.map(
    (task, index, tasks) => {
      if (tasks[index + 1])
        task.conflict = tasks[index + 1].time.getTime() == task.time.getTime()
      if (!task.conflict && tasks[index - 1])
        task.conflict = tasks[index - 1].time.getTime() == task.time.getTime()
    }))

  data.map(day => day.conflict = day.tasks.reduce(
    (conflict, task) => conflict
      || task.conflict
    , false /*No conflict as initial state*/))
}

reorder();
checkConflicts();

export function getData() {
  return data;
}

export function getDayTasks(args) {
  var date = args ? args.date : getCurrentDay().date;
  return data.find(day => day.date == date).tasks;
}

export function editingTask([date, index]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks[index].editing = true;
}

export function confirmTask([date, index, task]) {
  if (!date) date = getCurrentDay().date;
  task.editing = false;
  data.find(day => day.date == date).tasks[index] = task;
  reorder();
  checkConflicts();
}

export function addTask([date, task]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks.push(task);
  reorder();
  checkConflicts();
}

export function removeTask([date, index]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks.splice(index, 1);
  reorder();
  checkConflicts();
}

export function setCurrentDay([index]) {
  currentDay = index;
}

export function getCurrentDay() {
  return data[currentDay];
}