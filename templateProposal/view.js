import { notify, observe, process } from './controller.js';
import { dayOfWeekShort, dayOfWeek } from '../res/helper.js';

Notify = notify; // Declared in index.html

// Nav Bar creation
function NavBar(data) {
  let navBar = HTMLTemplateElement_instantiate(
      document.querySelector('#weekdaysNavBar'),
      NavBarPartsProcessor, /*partsProcessor*/
      data);
  let navBarContainer = document.querySelector("#navBarContainer");
  navBarContainer.innerHTML = "";
  navBarContainer.appendChild(navBar.documentFragment);
}

  // Day tab creation
function DayTab(data) {
  let dayTab = HTMLTemplateElement_instantiate(
      document.querySelector('#dayTab'),
      DayTabPartsProcessor, /*partsProcessor*/
      data);
  let dayTabContainer = document.querySelector("#dayTabContainer");
  dayTabContainer.innerHTML = "";
  dayTabContainer.appendChild(dayTab.documentFragment);
}


// nav bar parts processor override
function NavBarPartsProcessor(parts, state) {
  localDefaultPartProcessor(parts, state);

  for (const part of parts) {
    // Hack: format date on nav bar
    if (part.expression == "date?") {
      part.replaceWith( dayOfWeekShort(state.date.getDay()) + " " +
      (state.date.getMonth() + 1) + "/" + (state.date.getDate()))
    }
  }
}

// day tab parts processor override
function DayTabPartsProcessor(parts, state) {
  localDefaultPartProcessor(parts, state);

  for (const part of parts) {
    // Hack: simplify full date to just "Wednesday"
    // (state is a day)
    if (part.expression == "date?") {
      part.replaceWith(dayOfWeek(state.date.getDay()));
    }

    // Hack: parser rejects input with type="time" and value="{{x}}"
    // So we fill in the type after the parser has run
    if (part.expression == "timeType") {
      part.replaceWith("time");
    }

    // Hack: need to format time as HH:MM
    // (state is a task)
    if (part.expression == "time?") {
      let hours = state.time.getHours();
      let minutes = state.time.getMinutes();
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      part.replaceWith(hours + ":" + minutes);
    }
  }
}

// our base parts processor override
function localDefaultPartProcessor(parts, state) {
  TemplateInstance.defaultPartProcessor(parts, state);

  for (const part of parts) {
    // Hack: map (state.conflict == true) to "conflict"
    if (part.expression == "conflict?") {
      if (state.conflict) {
        part.replaceWith("conflict");
      } else {
        part.replaceWith("");
      }
    }
  }
}

onConfirm = function(control, task) {
  let taskContainer = control.parentNode.parentNode.parentNode;
  let timeControl = taskContainer.querySelector('.taskTime').querySelector('input');
  let titleControl = taskContainer.querySelector('.taskTitle').querySelector('input');
  let descriptionControl = taskContainer.querySelector('div textarea');

  task.time = new Date('1970-01-01T' + timeControl.value + ":00");
  task.title = titleControl.value;
  task.description = descriptionControl.value;
  task.editing = false;
  Notify('confirmTask', task);
}

// Set the initial NavBar
process(NavBar, "getData");

// Set tasks listeners for the task list in the NavBar
observe("confirmTask", NavBar, "getData");
observe("addTask", NavBar, "getData");
observe("deleteTask", NavBar, "getData");

// Set listener for current day change
observe("setCurrentDay", DayTab, "getCurrentDay");

// Set tasks listeners for the task list in the day tab
observe("editingTask", DayTab, "getCurrentDay");
observe("confirmTask", DayTab, "getCurrentDay");
observe("addTask", DayTab, "getCurrentDay");
observe("deleteTask", DayTab, "getCurrentDay");

