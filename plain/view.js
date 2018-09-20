import { notify, observe, flush } from './controller.js';

Notify = notify;
Observe = observe;
Flush = flush;

function dayOfWeekShort(num) {
  switch (num) {
    case 1:
      return "MON"
    case 2:
      return "TUE"
    case 3:
      return "WED"
    case 4:
      return "THU"
    case 5:
      return "FRI"
    case 6:
      return "SAT"
    case 0:
      return "SUN"
  }
}

function dayOfWeek(num) {
  switch (num) {
    case 1:
      return "Monday"
    case 2:
      return "Tuesday"
    case 3:
      return "Wednesday"
    case 4:
      return "Thursday"
    case 5:
      return "Friday"
    case 6:
      return "Saturday"
    case 0:
      return "Sunday"
  }
}

// Get Templates
var templates = document.querySelector('#templates').import;

// Nav Bar creation
function NavBar(data) {

  var navBar = templates.querySelector('#weekdaysNavBar').content.cloneNode(true);

  // Populate Nav Bar
  var navHead = navBar.querySelector('thead');
  var navBody = navBar.querySelector('tbody');
  for (let i = 0; i < data.length; i++) {
    const day = data[i];
    // Set day
    var navDay = navBar.querySelector('#dayNavBar').content.cloneNode(true);

    navDay.querySelector('a').append(
      dayOfWeekShort(day.date.getDay()) + " " +
      (day.date.getMonth() + 1) + "/" + (day.date.getDate()));

    navDay.querySelector('a').setAttribute("onclick",
      'Notify("setCurrentDay", ' + i + ');'
    );

    if (day.conflict) navDay.querySelector('td').setAttribute("class", "conflict");

    navHead.append(navDay);

    // Tasks preview
    var taskList = navBar.querySelector('#dayNavTasks').content.cloneNode(true);
    var navDayUL = taskList.querySelector('ul');
    day.tasks.forEach(task => {
      var taskItem = taskList.querySelector('#dayTask').content.cloneNode(true);
      taskItem.querySelector('li').append(task.title);
      navDayUL.append(taskItem);
    });

    if (day.conflict) taskList.querySelector('td').setAttribute("class", "conflict");

    navBody.append(taskList);
  }

  // Append Nav Bar
  var table = document.querySelector('#container').querySelector('table');
  if (table) {
    document.querySelector('#container').replaceChild(navBar, table);
  } else {
    document.querySelector('#container').appendChild(navBar);
  }

}

// Task Creation
function Task(task, index, list) {
  var taskItem = list.querySelector('#taskItem').content.cloneNode(true);
  var taskItemUL = taskItem.querySelector('ul');
  taskItem.querySelector('li').setAttribute("class", "task");

  if (task.conflict) taskItem.querySelector('li').setAttribute("class", "conflict");


  // Time
  var taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  var time = document.createElement('span');
  time.append(task.time);
  taskProp.querySelector('li').append(time);
  taskProp.querySelector('li').setAttribute("class", "taskTime");
  taskProp.querySelector('li').append(document.createElement("input"));
  taskProp.querySelector('input').setAttribute("type", "time");
  taskProp.querySelector('input').value = task.time;
  taskProp.querySelector('input').hidden = true;
  taskItemUL.append(taskProp);

  // Title
  taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  var title = document.createElement('span');
  title.append(task.title);
  taskProp.querySelector('li').append(title);
  taskProp.querySelector('li').setAttribute("class", "taskTitle");
  taskProp.querySelector('li').append(document.createElement("input"));
  taskProp.querySelector('input').setAttribute("type", "input");
  taskProp.querySelector('input').value = task.title;
  taskProp.querySelector('input').hidden = true;
  taskItemUL.append(taskProp);

  // Edit
  taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);

  var edit = document.createElement("input");
  edit.setAttribute("value", "Edit");
  edit.setAttribute("type", "button");
  var confirm = document.createElement("input");
  confirm.setAttribute("value", "Confirm");
  confirm.setAttribute("type", "button");
  confirm.hidden = true;
  edit.onclick = () => {
    taskItemUL.parentNode.querySelectorAll("input, span, textarea").forEach(
      node => node.hidden = !node.hidden
    )
  }
  confirm.onclick = () => {
    taskItemUL.parentNode.querySelectorAll("input, span, textarea").forEach(
      node => node.hidden = !node.hidden
    )
    var newTaskValues = {
      time: taskItemUL.parentNode.querySelector(".taskTime input").value,
      title: taskItemUL.parentNode.querySelector(".taskTitle input").value,
      description: taskItemUL.parentNode.querySelector("textarea").value
    }
    notify("editTask", null/*currentDay*/, index, newTaskValues);
  }
  taskProp.querySelector('li').append(edit);
  taskProp.querySelector('li').append(confirm);
  taskProp.querySelector('li').setAttribute("class", "taskEdit");
  taskItemUL.append(taskProp);

  // Delete
  taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  var del = document.createElement("input");
  del.setAttribute("value", "Delete");
  del.setAttribute("type", "button");
  del.onclick = () => {
    notify("removeTask", null/*currentDay*/, index);
  }
  taskProp.querySelector('li').append(del);
  taskProp.querySelector('li').setAttribute("class", "taskDelete");
  taskItemUL.append(taskProp);

  // Description
  var desc = document.createElement('span');
  desc.append(task.description);
  taskItem.querySelector('div').append(desc);
  taskItem.querySelector('div').append(document.createElement("textarea"));
  taskItem.querySelector('textarea').textContent = task.description;
  taskItem.querySelector('textarea').hidden = true;

  list.append(taskItem);
}

function TaskInput(tabUL) {
  // Inputs for new task
  var taskItem = tabUL.querySelector('#taskItem').content.cloneNode(true);
  var taskItemUL = taskItem.querySelector('ul');
  taskItem.querySelector('li').setAttribute("class", "task");
  // Time
  var taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  taskProp.querySelector('li').append(document.createElement("input"));
  taskProp.querySelector('li').setAttribute("class", "taskTime");
  taskProp.querySelector('input').setAttribute("type", "time");
  taskItemUL.append(taskProp);
  // Title
  taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  taskProp.querySelector('li').append(document.createElement("input"));
  taskProp.querySelector('li').setAttribute("class", "taskTitle");
  taskProp.querySelector('input').setAttribute("type", "input");
  taskProp.querySelector('input').setAttribute("placeholder", "Add a new task");
  taskItemUL.append(taskProp);
  // Add
  taskProp = taskItem.querySelector('#taskProp').content.cloneNode(true);
  taskProp.querySelector('li').append(document.createElement("input"));
  taskProp.querySelector('li').setAttribute("class", "taskAdd");
  taskProp.querySelector('input').setAttribute("type", "button");
  taskProp.querySelector('input').setAttribute("value", "Add");
  taskProp.querySelector('input').onclick = () => {
    var newTaskValues = {
      time: taskItemUL.parentNode.querySelector(".taskTime input").value,
      title: taskItemUL.parentNode.querySelector(".taskTitle input").value,
      description: taskItemUL.parentNode.querySelector("textarea").value
    }
    notify("addTask", null/*currentDay*/, newTaskValues);
  }

  taskItemUL.append(taskProp);

  // Description
  taskItem.querySelector('div').append(document.createElement("textarea"));
  taskItem.querySelector('textarea').setAttribute("placeholder", "Add a description to your task");

  tabUL.append(taskItem);
}

// Tab Creation
function DayTab(day) {

  if (!day) return;

  var tab = templates.querySelector('#dayTab').content.cloneNode(true);

  tab.querySelector('h1').append(dayOfWeek(day.date.getDay()));

  var tabUL = tab.querySelector('ul');
  for (let i = 0; i < day.tasks.length; i++) {
    const task = day.tasks[i];
    Task(task, i, tabUL);
  }

  TaskInput(tabUL);

  var container = document.querySelector('#container');
  for (let i = container.children.length - 1; i >= 0; i--) {
    const node = container.children[i];
    if (node.tagName != "TABLE") node.parentElement.removeChild(node)
  }
  container.appendChild(tab);
}

// Update Tasks
function UpdateTasks(dayTasks) {
  var tasks = document.querySelector('.tasks');
  for (let i = tasks.children.length - 1; i >= 0; i--) {
    const node = tasks.children[i];
    if (node.tagName != "TEMPLATE") node.parentElement.removeChild(node)
  }
  for (let i = 0; i < dayTasks.length; i++) {
    const task = dayTasks[i];
    Task(task, i, tasks);
  }

  TaskInput(tasks);
}

observe("", NavBar, "getData");
flush()
observe("setCurrentDay", DayTab, "getCurrentDay");
observe("editTask", UpdateTasks, "getDayTasks");
observe("addTask", UpdateTasks, "getDayTasks");
observe("removeTask", UpdateTasks, "getDayTasks");
observe("editTask", NavBar, "getData");
observe("addTask", NavBar, "getData");
observe("removeTask", NavBar, "getData");

// observe("", NavBar, "getData");
// observe("", NavBar, "getData");