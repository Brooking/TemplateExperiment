import { load } from '../res/data.js';

var data = load();
data.forEach(day => reorder(day.date));
var currentDayIndex;

export function getData() {
  return data;
}

export function getTasks() {
  return data.map(day => day.tasks);
}

export function getDays() {
  return data.map(day => day.date);
}

export function getDay(args) {
  var date = args ? args.date : getCurrentDay().date;
  return data.find(day => day.date == date);
}

export function getDayTasks(args) {
  var date = args ? args.date : getCurrentDay().date;
  return data.find(day => day.date == date).tasks;
}

export function editTask([date, index, task]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks[index] = task;
  reorder(date);
}

export function addTask([date, task]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks.push(task);
  reorder(date);
}

export function removeTask([date, index]) {
  if (!date) date = getCurrentDay().date;
  data.find(day => day.date == date).tasks.splice(index, 1);
  reorder(date);
}

function reorder(date) {
  data.find(day => day.date == date).tasks.sort(
    (t1, t2) =>
      Date.parse('01 Jan 1970 ' + t1.time + ':00 GMT') -
      Date.parse('01 Jan 1970 ' + t2.time + ':00 GMT')
  );
  checkConflicts(date);
}

function checkConflicts(date) {
  data.filter(day => date ? day.date == date : true)
    .map(day => day.tasks.map(
      (task, index, tasks) => {
        if (tasks[index + 1])
          task.conflict = tasks[index + 1].time == task.time
        if (!task.conflict && tasks[index - 1])
          task.conflict = tasks[index - 1].time == task.time
      }))

  data.filter(day => date ? day.date == date : true)
    .map(day => day.conflict = day.tasks.reduce(
      (conflict, task) => conflict
        || task.conflict
      , false /*No conflict as initial state*/))
}

export function setCurrentDay([dateString]) {
  currentDayIndex = data.findIndex(day => day.date.toString() == dateString);
}

export function getCurrentDay() {
  return data[currentDayIndex];
}