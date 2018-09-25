import { notify, observe, process } from './controller.js';
import { dayOfWeekShort, dayOfWeek } from '../res/helper.js';

Notify = notify; // Declared in index.html

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Nav Bar creation
function NavBar(data) {

  // Populate Nav Bar
  var navHead = document.querySelector('thead');
  clearChildren(navHead);
  var navBody = document.querySelector('tbody');
  clearChildren(navBody);
  data.forEach(day => {
    // Set day
    var navDay = document.querySelector('#navBarDay').content.cloneNode(true);

    navDay.querySelector('a').append(
      dayOfWeekShort(day.date.getDay()) + " " +
      (day.date.getMonth() + 1) + "/" + (day.date.getDate()));

    navDay.querySelector('a').day = day;

    if (day.conflict) navDay.querySelector('td').classList.add("conflict");
    if (day.current) navDay.querySelector('td').classList.add("active");

    navHead.append(navDay);

    // Tasks preview
    var taskList = document.querySelector('#navBarDayTasks').content.cloneNode(true);
    var navDayUL = taskList.querySelector('.navTasks');
    day.tasks.forEach(task => {
      var taskItem = document.querySelector('#navBarDayTask').content.cloneNode(true);
      taskItem.querySelector('li').append(task.title);
      navDayUL.append(taskItem);
    });

    if (day.conflict) taskList.querySelector('td').classList.add("conflict");
    if (day.current) taskList.querySelector('td').classList.add("active");

    navBody.append(taskList);
  });
}

function UpdateNavBar(day) {
  var navDay = document.querySelector('thead td:nth-child(' + (day.date.getDay() + 1) + ') a');
  clearChildren(navDay);
  navDay.append(
    dayOfWeekShort(day.date.getDay()) + " " +
    (day.date.getMonth() + 1) + "/" + (day.date.getDate()));
  if (day.conflict)
    navDay.parentNode.classList.add("conflict");
  else
    navDay.parentNode.classList.remove("conflict");

  var taskList = document.querySelector('tbody td:nth-child(' + (day.date.getDay() + 1) + ') .navTasks');
  clearChildren(taskList);
  day.tasks.forEach(task => {
    var taskItem = document.querySelector('#navBarDayTask').content.cloneNode(true);
    taskItem.querySelector('li').append(task.title);
    taskList.append(taskItem);
  });

  if (day.conflict)
    taskList.parentNode.classList.add("conflict");
  else
    taskList.parentNode.classList.remove("conflict");
}

// Task Creation
function Task(task, list) {
  var taskItem = document.querySelector('#taskItem').content.cloneNode(true);

  if (task.conflict) taskItem.querySelector('li').classList.add("conflict");

  // Time
  var time = (task.time.getHours() + "").padStart(2, '0') + ":"
    + (task.time.getMinutes() + "").padStart(2, '0');
  var taskTime = taskItem.querySelector('.taskTime');
  var timeSpan = taskTime.querySelector('span');
  timeSpan.hidden = task.editing;
  timeSpan.append(time);
  var timeInput = taskTime.querySelector('input');
  timeInput.value = time;
  timeInput.hidden = !task.editing;

  // Title
  var taskTitle = taskItem.querySelector('.taskTitle');
  var titleSpan = taskTitle.querySelector('span');
  titleSpan.hidden = task.editing;
  titleSpan.append(task.title);
  var titleInput = taskTitle.querySelector('input');
  titleInput.value = task.title;
  titleInput.hidden = !task.editing;

  // Edit
  var taskEdit = taskItem.querySelector('.taskEdit');
  var inputs = taskEdit.querySelectorAll("input");
  var edit = inputs[0], confirm = inputs[1];
  edit.hidden = task.editing;
  confirm.hidden = !task.editing;
  confirm.onclick = () => {
    confirm.task.time = new Date('1970-01-01T' + timeInput.value + ':00');
    confirm.task.title = titleInput.value;
    confirm.task.description = descInput.value;
    notify("confirmTask", confirm.task);
  }

  // Delete
  var taskDelete = taskItem.querySelector('.taskDelete');
  var del = taskDelete.querySelector("input");
  del.hidden = task.editing;

  del.task = edit.task = confirm.task = task;

  // Description
  var descSpan = taskItem.querySelector('div span');
  descSpan.append(task.description);
  descSpan.hidden = task.editing;
  var descInput = taskItem.querySelector('div textarea');
  descInput.textContent = task.description;
  descInput.hidden = !task.editing;

  list.append(taskItem);
}

// Inputs for new task
function TaskInput(list) {
  var taskInputs = document.querySelector('#taskInputs').content.cloneNode(true);
  var add = taskInputs.querySelector('.taskAdd input');
  var task = taskInputs.querySelector('li');
  task.querySelector(".taskTime input").value = "12:00";
  add.onclick = () => {
    var newTask = {
      time: new Date('1970-01-01T' +
        task.querySelector(".taskTime input").value + ':00'),
      title: task.querySelector(".taskTitle input").value,
      description: task.querySelector("textarea").value
    }
    notify("addTask", newTask);
  }

  list.append(taskInputs);
}

// Tab Creation
function DayTab(day) {

  clearChildren(document.querySelector('h1'));
  document.querySelector('h1').append(dayOfWeek(day.date.getDay()));

  UpdateTasks(day.tasks);
}

// Update Tasks
function UpdateTasks(dayTasks) {
  var tasks = document.querySelector('.tasks');

  clearChildren(tasks);
  for (let i = 0; i < dayTasks.length; i++) {
    Task(dayTasks[i], tasks);
  }

  TaskInput(tasks);
}

// Set the initial NavBar
process(NavBar, "getData");

// Set tasks listeners for the task list in the NavBar
observe("confirmTask", UpdateNavBar, "getCurrentDay");
observe("addTask", UpdateNavBar, "getCurrentDay");
observe("deleteTask", UpdateNavBar, "getCurrentDay");

// Set listener for current day change
observe("setCurrentDay", DayTab, "getCurrentDay");
observe("setCurrentDay", NavBar, "getData");

// Set tasks listeners for the task list in the day tab
observe("editingTask", UpdateTasks, "getDayTasks");
observe("confirmTask", UpdateTasks, "getDayTasks");
observe("addTask", UpdateTasks, "getDayTasks");
observe("deleteTask", UpdateTasks, "getDayTasks");
