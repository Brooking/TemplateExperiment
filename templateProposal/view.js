import { notify, observe, flush } from './controller.js';
import { dayOfWeekShort, dayOfWeek } from '../res/helper.js';

Notify = notify; // Declared in index.html

// Nav Bar creation
function NavBar(data) {
  let navBar = HTMLTemplateElement_instantiate(
      document.querySelector('#weekdaysNavBar'),
      null, /*partsProcessor*/
      data);
  let navBarContainer = document.querySelector("#navBarContainer");
  navBarContainer.innerHTML = "";
  navBarContainer.appendChild(navBar.documentFragment);
}

// Day tab creation
function DayTab(data) {
  let dayTab = HTMLTemplateElement_instantiate(
      document.querySelector('#dayTab'),
      null, /*partsProcessor*/
      data);
  let dayTabContainer = document.querySelector("#dayTabContainer");
  dayTabContainer.innerHTML = "";
  dayTabContainer.appendChild(dayTab.documentFragment);
}

observe("", NavBar, "getData");
flush()
observe("setCurrentDay", DayTab, "getCurrentDay");
observe("editTask", DayTab, "getCurrentDay");
observe("addTask", DayTab, "getCurrentDay");
observe("removeTask", DayTab, "getCurrentDay");
observe("editTask", NavBar, "getData");
observe("addTask", NavBar, "getData");
observe("removeTask", NavBar, "getData");

