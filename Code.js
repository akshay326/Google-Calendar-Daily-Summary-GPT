function getEventsAndSendEmail() {
  var events = getCalendarEvents()
  
  // Construct email message
  var prompt = createPrompt(events)
  var emailBody = callOpenAI(prompt);

  // Email details
  var recipient = 'XXX'; // Replace with your email address
  var wk = getCurrentWeekNumber()
  var dayOfWeek = (new Date()).getDay(); // This returns a number, 0 for Sunday, 1 for Monday, etc.
  dayOfWeek = (dayOfWeek + 1) % 7; // sat as start of the week
  var subject = 'Day ' + dayOfWeek + '/7 Week ' + wk + '/52 Summary'

  // Send email
  MailApp.sendEmail(recipient, subject, emailBody);
}


function createPrompt(events) {
  var prompt = `
  ### Background
  I'm Taze.
  Here's how I spent my day today (a JSON list of events, fetch directly from my work calendar):
  ` + JSON.stringify(events) + `

  ### Goal
  I'm tryna work on a side project XXX, with an aim of YYY.

  ### Task
  Please answer the following questions:
  - How much time did i spend today working?
  - Is my calendar sync with my goal?
  - Your BRUTALLY HONEST FEEDBACK?`

  return prompt
}


function getCalendarEvents() {
  var calendar = CalendarApp.getDefaultCalendar();
  
  // Calculate dates for the last day
  var today = new Date();
  var startDate = new Date();
  startDate.setDate(today.getDate() - 1);

  // Get events from last day
  var events = calendar.getEvents(startDate, today);

  var eventList = []
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle()
    var startTime = event.getStartTime()
    var duration = (event.getEndTime() - event.getStartTime()) / (60 * 60 * 1000);

    var d = {
      'event_title': title,
      'event_start': startTime,
      'event_duration': duration,
    }

    eventList.push(d)
  }

  return eventList
}


function getCurrentWeekNumber() {
  var currentDate = new Date();
  var startDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year
  var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000) + 1); // +1 to include the current day
  var weekNumber = Math.ceil(days / 7);

  return weekNumber;
}


function callOpenAI(prompt) {
  var apiKey = 'XXX'; 
  var url = 'https://api.openai.com/v1/chat/completions';

  var data = {
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are a personal coach with experience in organizational pyschology. You are BRUTALLY HONEST."
      },
      {
        "role": "user",
        "content": prompt
      }
    ]
  }

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Bearer ' + apiKey
    },
    'payload': JSON.stringify(data)
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();
  var jsonResponse = JSON.parse(responseText);
  response = jsonResponse.choices[0].message.content

  Logger.log(response)
  return response
}
