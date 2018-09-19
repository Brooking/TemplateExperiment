import { load } from './data.js';

var data = load();
data.forEach(day => reorder(day.date));
var currentDay;

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
}

export function setCurrentDay([index]) {
  currentDay = index;
}

export function getCurrentDay() {
  return data[currentDay];
}