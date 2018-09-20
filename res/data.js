var weekDates = [];
var today = new Date();
var weekdayIndex = today.getDay();

for (let i = 0; i < weekdayIndex; i++) {
  var delta = 86400000 * (i - weekdayIndex);
  weekDates.push(new Date(today.getTime() + delta))
}

weekDates.push(today);

for (let i = weekdayIndex + 1; i < 7; i++) {
  var delta = 86400000 * (i - weekdayIndex);
  weekDates.push(new Date(today.getTime() + delta))
}



export function load() {
  return [
    {
      date: weekDates[0],
      tasks: [
        {
          time: "09:00",
          title: "Morning Hike",
          description: "Family hike to Tiger mountain"
        },
        {
          time: "16:00",
          title: "House Chores",
          description: "Clean the house and other stuff"
        }
      ]
    },
    {
      date: weekDates[1],
      tasks: [
        {
          time: "09:30",
          title: "Call ISP Technitian",
          description: "Call ISP service to replace faulty modem"
        },
        {
          time: "11:30",
          title: "Lunck Meeting",
          description: "Meet the team for a team lunch"
        },
        {
          time: "16:00",
          title: "1on1 w/Manager",
          description: "Go to manager's office for 1on1 meeting"
        }
      ]
    },
    {
      date: weekDates[2],
      tasks: [
        {
          time: "10:00",
          title: "Internal Tech Talk",
          description: "Senior developer is giving a talk on best coding practices"
        },
        {
          time: "15:00",
          title: "Org All Hands",
          description: "Org's All Hands meeting to recap on all accomplishments"
        }
      ]
    },
    {
      date: weekDates[3],
      tasks: [
        {
          time: "11:00",
          title: "Book Club Meeting",
          description: "Discuss this months book"
        },
        {
          time: "11:00",
          title: "Team Meeting",
          description: "Catch up with team's accomplishments"
        },
        {
          time: "20:00",
          title: "Marineers Game",
          description: "Don't miss the playoffs!"
        }
      ]
    },
    {
      date: weekDates[4],
      tasks: [
        {
          time: "09:45",
          title: "Satya's Q&A",
          description: "Satya shares customer momentum and our commitment to security."
        },
        {
          time: "12:00",
          title: "Lunch John",
          description: "Have lunck with John"
        }
      ]
    },
    {
      date: weekDates[5],
      tasks: [
        {
          time: "09:00",
          title: "Dry Cleaning",
          description: "Pick up suit from the dry cleaning"
        },
        {
          time: "11:00",
          title: "Microsoft 5k",
          description: "Sign up for the 5k run at the event"
        }
      ]
    },
    {
      date: weekDates[6],
      tasks: [
        {
          time: "14:00",
          title: "Family Reunion",
          description: "Meet up at folk's house with the rest of the family"
        }
      ]
    }
  ]
}