import { notify, observe, flush } from './controller.js';
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
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    // Hack: format date on nav bar
    if (part.expression == "date?") {
      part.replaceWith( dayOfWeekShort(state.date.getDay()) + " " +
      (state.date.getMonth() + 1) + "/" + (state.date.getDate()))
    }
  }
}

// day tab parts processor override
function DayTabPartsProcessor(parts, day) {
  localDefaultPartProcessor(parts, day);
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    // Hack: simplify full date to just "WED"
    if (part.expression == "date?") {
      part.replaceWith(dayOfWeek(day.date.getDay()));
    }

    // Hack: parser rejects input with type=time and value="{{x}}"
    if (part.expression == "timeType") {
      part.replaceWith("time");
    }

    // Hack: adding or deleting a full attribute ("hidden")
    if (part.expression == "hideifediting?") {
      if (day.editing) {
        part._node.setAttribute("hidden", "");
      } else {
        part._node.removeAttribute("hidden");
      }
      part.replaceWith("");
    }

    // Hack: adding or deleting a full attribute ("hidden")
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

// our base parts processor override
function localDefaultPartProcessor(parts, state) {
  TemplateInstance.defaultPartProcessor(parts, state);

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

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

observe("", NavBar, "getData");
flush()
observe("setCurrentDay", DayTab, "getCurrentDay");
observe("editTask", DayTab, "getCurrentDay");
observe("addTask", DayTab, "getCurrentDay");
observe("removeTask", DayTab, "getCurrentDay");
observe("editTask", NavBar, "getData");
observe("addTask", NavBar, "getData");
observe("removeTask", NavBar, "getData");

