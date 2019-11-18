
/* eslint-disable  func-names */
/* eslint-disable  no-console */

//Created by Nam Bui on Nov 17th 2019
const Alexa = require('ask-sdk');
const Moment = require('moment-timezone');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const Core = require('ask-sdk-core');

let countryCode = '';
let postalCode = '';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const speechText = 'Welcome to Sleep Time Skill, what time do you want to wake up? or you can say I want to sleep now';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const WakeUpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'wakeUpIntent';
  },
  handle(handlerInput) {
    var speechText = 'can you repeat the sleep time?';
    var timeValue = handlerInput.requestEnvelope.request.intent.slots.time;
    let timeStr;

    if (timeValue && timeValue.value) {
      speechText = calculateTime(timeValue.value, "sleep")
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Wake Up', speechText)
      .getResponse();
  },
};

const WakeUpIntentHandlerTwo = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'wakeUpIntentTwo';
  },
  async handle(handlerInput) {
    console.log('test', 'reach 1')
    const serviceClientFactory = handlerInput.serviceClientFactory;
    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    var speechText = ""
    let userTimeZone;
    try {
        const upsServiceClient = serviceClientFactory.getUpsServiceClient();
        userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId); 
        // getting the current date with the time
        var currentDateTime = new Date(new Date().toLocaleString("en-US", {timeZone: userTimeZone}));
        //We only want hour and minutes not seconds
        var currentTime = currentDateTime.toTimeString().substring(0,5);
        speechText = calculateTime(currentTime, "wakeUp")
          
    } catch (error) {
        if (error.name !== 'ServiceError') {
            return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
        }
    }
    return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Wake Up Two', speechText)
          .getResponse(); 
  },
};

//Calculate all the resonable time to sleep
function calculateTime(timeStr, type) {
    answer = ""
    if (type === "sleep") {
       var wakeTimeZero = minusTime(timeStr, 4.5);
       var wakeTimeOne = minusTime(timeStr, 6);
       var wakeTimeTwo = minusTime(timeStr, 7.5);
       var wakeTimeThree = minusTime(timeStr, 9);
       answer = 'You should sleep at: ' + wakeTimeThree + ", " + wakeTimeTwo + ", " + wakeTimeOne + ", or " + wakeTimeZero +'. Remember to get in bed around 14 minutes before those time, to account for the average time your body needs to fall asleep.';
    } else if (type === "wakeUp") {
       var wakeTimeZero = addTime(timeStr, 4.5);
       var wakeTimeOne = addTime(timeStr, 6);
       var wakeTimeTwo = addTime(timeStr, 7.5);
       var wakeTimeThree = addTime(timeStr, 9);
       answer = 'You should wake up at: ' +  wakeTimeZero  + ", " + wakeTimeOne  + ", " + wakeTimeTwo + ", or " + wakeTimeThree;
    }
   
    return answer
}

function getCurrentTime(location) {

  const currentTime = Moment.utc().tz(location);
  return currentTime;
}

//Calculate time take a time String in 24hour time format (16:00 is 4 p.m) and the additional hours in float.
function addTime(time, timeAdded) {
     var answer = "";
     var timeAddedInt = Math.floor(timeAdded);
     var leftOverTime = timeAdded - timeAddedInt;
     console.log(" Added Hour is: " + timeAddedInt + " and added minutes are: " + leftOverTime);
     var curHour = time.substring(0,2);
     var curMin = time.substring(3,5);
     console.log("Hour is: " + curHour + " and minutes are: " + curMin);
     
     var newHour = parseInt(curHour, 10) + parseInt(timeAddedInt,10);
     var newMin = parseInt(curMin, 10) + parseInt(leftOverTime*60,10) + 14;
     console.log("New Hour is: " + newHour + " and new minutes are: " + newMin);
     
     if (newMin > 60) {
       newHour ++;
       newMin -= 60;
     } else if (newMin === 0) {
       newMin = "";
     }
     
     if (newHour >= 24) {
       var divider = Math.floor(newHour/24);
       newHour = newHour - 24*divider;
     }
     
     if (newHour > 12) {
       newHour = newHour - 12;
       answer = newHour + " " + newMin + " pm"; 
     } else if (newHour === 12) {
       answer = newHour + " " + newMin + " pm";
     } else {
       answer = newHour + " " + newMin + " am"; 
     }
     
    return answer;
     
  }
  
  function minusTime(time, timeAdded) {
     var answer = "";
     var timeAddedInt = Math.floor(timeAdded);
     var leftOverTime = timeAdded - timeAddedInt;
     console.log(" Added Hour is: " + timeAddedInt + " and added minutes are: " + leftOverTime);
     var curHour = time.substring(0,2);
     var curMin = time.substring(3,5);
     console.log("Hour is: " + curHour + " and minutes are: " + curMin);
     
     var newHour = parseInt(curHour, 10) - parseInt(timeAddedInt,10);
     var newMin = parseInt(curMin, 10) - parseInt(leftOverTime*60,10);
     console.log("New Hour is: " + newHour + " and new minutes are: " + newMin);
     
     if (newMin < 0) {
       newHour--;
       newMin += 60;
     } else if (newMin === 0) {
       newMin = "";
     }
     
     if (newHour < 0) {
       var divider = Math.floor(newHour/24);
       
       newHour = newHour - 24*divider;
       console.log(newHour);
     }
     
     if (newHour > 12) {
       newHour = newHour - 12;
       answer = newHour + " " + newMin + " pm"; 
     } else if (newHour === 12) {
       answer = newHour + " " + newMin + " pm";
     } else if (newHour === 0) {
       answer = "12 " + newMin + " am";
     } else {
       answer = newHour + " " + newMin + " am"; 
     }
   
    return answer;
     
  }

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say I want to sleep now, I want to sleep at or I want to wake up at.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    var speechText = "Sorry, I can\'t understand the command. You can say I want to sleep now, I want to sleep at or I want to wake up at."
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        WakeUpIntentHandler,
        WakeUpIntentHandlerTwo,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda(); 


