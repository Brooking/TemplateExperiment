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
          description: "Family hike to Tiger mountain",
          editing: false
        },
        {
          time: new Date('1970-01-01T16:00:00'),
          title: "House Chores",
          description: "Clean the house and other stuff",
          editing: false
        }
      ]
    },
    {
      date: weekDates[1],
      tasks: [
        {
          time: new Date('1970-01-01T09:30:00'),
          title: "Call ISP Technician",
          description: "Call ISP service to replace faulty modem",
          editing: false
        },
        {
          time: new Date('1970-01-01T11:30:00'),
          title: "Lunch Meeting",
          description: "Meet the team for a team lunch",
          editing: false
        },
        {
          time: new Date('1970-01-01T16:00:00'),
          title: "1on1 w/Manager",
          description: "Go to manager's office for 1on1 meeting",
          editing: false
        }
      ]
    },
    {
      date: weekDates[2],
      tasks: [
        {
          time: new Date('1970-01-01T10:00:00'),
          title: "Internal Tech Talk",
          description: "Senior developer is giving a talk on best coding practices",
          editing: false
        },
        {
          time: new Date('1970-01-01T15:00:00'),
          title: "Org All Hands",
          description: "Org's All Hands meeting to recap on all accomplishments",
          editing: false
        }
      ]
    },
    {
      date: weekDates[3],
      tasks: [
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Book Club Meeting",
          description: "Discuss this month's book",
          editing: false
        },
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Team Meeting",
          description: "Catch up with team's accomplishments",
          editing: false
        },
        {
          time: new Date('1970-01-01T20:00:00'),
          title: "Mariners Game",
          description: "Don't miss the playoffs!",
          editing: false
        }
      ]
    },
    {
      date: weekDates[4],
      tasks: [
        {
          time: new Date('1970-01-01T09:45:00'),
          title: "Satya's Q&A",
          description: "Satya shares customer momentum and our commitment to security.",
          editing: false
        },
        {
          time: new Date('1970-01-01T12:00:00'),
          title: "Lunch John",
          description: "Have lunch with John",
          editing: false
        }
      ]
    },
    {
      date: weekDates[5],
      tasks: [
        {
          time: new Date('1970-01-01T09:00:00'),
          title: "Dry Cleaning",
          description: "Pick up suit from the dry cleaning",
          editing: false
        },
        {
          time: new Date('1970-01-01T11:00:00'),
          title: "Microsoft 5k",
          description: "Sign up for the 5k run at the event",
          editing: false
        }
      ]
    },
    {
      date: weekDates[6],
      tasks: [
        {
          time: new Date('1970-01-01T14:00:00'),
          title: "Family Reunion",
          description: "Meet up at folks' house with the rest of the family",
          editing: false
        }
      ]
    }
  ]
}