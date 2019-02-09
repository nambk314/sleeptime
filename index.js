
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const Moment = require('moment-timezone');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const speechText = 'Welcome to Sleep Time Skill, what time do you want to wake up?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello world';

    return handlerInput.responseBuilder
      .speak(speechText)
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
    console.log('this is the time value: ' + timeValue.value);


    if (timeValue && timeValue.value) {
      timeStr = timeValue.value;
      
      var wakeTimeOne = minusTime(timeStr, 6);
      var wakeTimeTwo = minusTime(timeStr, 7.5);
      var wakeTimeThree = minusTime(timeStr, 9);
      speechText = 'You should sleep at: ' + wakeTimeThree + ", or " + wakeTimeTwo + ", or " + wakeTimeOne;
      console.log('new time is: ' + wakeTimeOne);
      console.log('new time is: ' + wakeTimeTwo);
      console.log('new time is: ' + wakeTimeThree);
      
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

//This might be helpful to get the time. 
//We need to get the location => Either zipcode or through timezone

//https://github.com/alexa/skill-sample-nodejs-the-foodie/blob/master/lambda/custom/index.js
//This might work but we somehow need requestEvelope.context.System.device

// function getCurrentTime(location) {

//   const deviceId = requestEnvelope.context.System.device.deviceId;

//   const upsServiceClient = serviceClientFactory.getUpsServiceClient();
//   const timezone = await upsServiceClient.getSystemTimeZone(deviceId);

//   const currentTime = Moment.utc().tz(location);
//   return currentTime;
// }

var realTime = "";

function getCurrentTime(location) {

  const currentTime = Moment.utc().tz(location);
  return currentTime;
}

const SetTimeOfDayInterceptor = {
  async process(handlerInput) {

    const { requestEnvelope, serviceClientFactory, attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    // look up the time of day if we don't know it already.
    if (realTime === "") {
      const deviceId = requestEnvelope.context.System.device.deviceId;
      console.log("DEvice ID: ", deviceId);
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();
      const timezone = await upsServiceClient.getSystemTimeZone(deviceId);    

      const currentTime = getCurrentTime(timezone);
      //const timeOfDay = getTimeOfDay(currentTime);
      realTime = currentTime;
      // sessionAttributes.timeOfDay = timeOfDay;
      // sessionAttributes.profile.location.timezone = timezone;
      // attributesManager.setSessionAttributes(sessionAttributes);
      
      console.log("SetTimeOfDayInterceptor - currentTime:", realTime);
      //console.log("SetTimeOfDayInterceptor - timezone:", timezone);
      //console.log('SetTimeOfDayInterceptor - time of day:', timeOfDay);
      //console.log('SetTimeOfDayInterceptor - sessionAttributes', JSON.stringify(sessionAttributes));
    }
  }
};

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
     var newMin = parseInt(curMin, 10) + parseInt(leftOverTime*60,10);
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
    const speechText = 'You can say hello to me!';

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

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    WakeUpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(
    SetTimeOfDayInterceptor
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
