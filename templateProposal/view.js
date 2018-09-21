import { notify, observe, flush } from './controller.js';
import { dayOfWeekShort, dayOfWeek } from '../res/helper.js';

Notify = notify; // Declared in index.html

// Nav Bar creation
function NavBar(data) {
  let navBar = HTMLTemplateElement_instantiate(
      document.querySelector('#weekdaysNavBar'),
<<<<<<< HEAD
      null, /*partsProcessor*/
=======
      NavBarPartsProcessor, /*partsProcessor*/
>>>>>>> first working template proposal
      data);
  let navBarContainer = document.querySelector("#navBarContainer");
  navBarContainer.innerHTML = "";
  navBarContainer.appendChild(navBar.documentFragment);
}

<<<<<<< HEAD
// Day tab creation
function DayTab(data) {
  let dayTab = HTMLTemplateElement_instantiate(
      document.querySelector('#dayTab'),
      null, /*partsProcessor*/
=======
function NavBarPartsProcessor(parts, state) {
  TemplateInstance.defaultPartProcessor(parts, state);
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    if (part.expression == "date?") {
      part.replaceWith( dayOfWeekShort(state.date.getDay()) + " " +
      (state.date.getMonth() + 1) + "/" + (state.date.getDate()))
    }

    if (part.expression == "conflict?") {
      if (state.conflict) {
        part.replaceWith("conflict");
      } else {
        part.replaceWith("");
      }
    }
  }
}

  // Day tab creation
function DayTab(data) {
  let dayTab = HTMLTemplateElement_instantiate(
      document.querySelector('#dayTab'),
      DayTabPartsProcessor, /*partsProcessor*/
>>>>>>> first working template proposal
      data);
  let dayTabContainer = document.querySelector("#dayTabContainer");
  dayTabContainer.innerHTML = "";
  dayTabContainer.appendChild(dayTab.documentFragment);
}

<<<<<<< HEAD
=======
function DayTabPartsProcessor(parts, day) {
  TemplateInstance.defaultPartProcessor(parts, day);
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    if (part.expression == "date?") {
      part.replaceWith(dayOfWeek(day.date.getDay()));
    }

    if (part.expression == "timeType") {
      part.replaceWith("time");
    }

    if (part.expression == "hideifediting?") {
      if (day.editing) {
        part._node.setAttribute("hidden", "");
      } else {
        part._node.removeAttribute("hidden");
      }
      part.replaceWith("");
    }

    if (part.expression == "showifediting?") {
      if (day.editing) {
        part._node.removeAttribute("hidden");
      } else {
        part._node.setAttribute("hidden", "");
      }
      part.replaceWith("");
    }
  }
}

>>>>>>> first working template proposal
observe("", NavBar, "getData");
flush()
observe("setCurrentDay", DayTab, "getCurrentDay");
observe("editTask", DayTab, "getCurrentDay");
observe("addTask", DayTab, "getCurrentDay");
observe("removeTask", DayTab, "getCurrentDay");
observe("editTask", NavBar, "getData");
observe("addTask", NavBar, "getData");
observe("removeTask", NavBar, "getData");

