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
          time: new Date('1970-01-01T09:00:00'),
          title: "Morning Hike",
          description: "Family hike to Tiger mountain"
        },
        {
          time: new Date('1970-01-01T16:00:00'),
          title: "House Chores",
          description: "Clean the house and other stuff"
        }
      ]
    },
    {
      date: weekDates[1],
      tasks: [
        {
          time: new Date('1970-01-01T09:30:00'),
          title: "Call ISP Technitian",
          description: "Call ISP service to replace faulty modem"
        },
        {
          time: new Date('1970-01-01T11:30:00'),
          title: "Lunck Meeting",
          description: "Meet the team for a team lunch"
        },
        {
          time: new Date('1970-01-01T16:00:00'),
          title: "1on1 w/Manager",
          description: "Go to manager's office for 1on1 meeting"
        }
      ]
    },
    {
      date: weekDates[2],
      tasks: [
        {
          time: new Date('1970-01-01T10:00:00'),
          title: "Internal Tech Talk",
          description: "Senior developer is giving a talk on best coding practices"
        },
        {
          time: new Date('1970-01-01T15:00:00'),
          title: "Org All Hands",
          description: "Org's All Hands meeting to recap on all accomplishments"
        }
      ]
    },
    {
      date: weekDates[3],
      tasks: [
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Book Club Meeting",
          description: "Discuss this months book"
        },
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Team Meeting",
          description: "Catch up with team's accomplishments"
        },
        {
          time: new Date('1970-01-01T20:00:00'),
          title: "Marineers Game",
          description: "Don't miss the playoffs!"
        }
      ]
    },
    {
      date: weekDates[4],
      tasks: [
        {
          time: new Date('1970-01-01T09:45:00'),
          title: "Satya's Q&A",
          description: "Satya shares customer momentum and our commitment to security."
        },
        {
          time: new Date('1970-01-01T12:00:00'),
          title: "Lunch John",
          description: "Have lunck with John"
        }
      ]
    },
    {
      date: weekDates[5],
      tasks: [
        {
          time: new Date('1970-01-01T09:00:00'),
          title: "Dry Cleaning",
          description: "Pick up suit from the dry cleaning"
        },
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Microsoft 5k",
          description: "Sign up for the 5k run at the event"
        }
      ]
    },
    {
      date: weekDates[6],
      tasks: [
        {
          time: new Date('1970-01-01T14:00:00'),
          title: "Family Reunion",
          description: "Meet up at folk's house with the rest of the family"
        }
      ]
    }
  ]
}