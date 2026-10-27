let interval;
const eventDay = new Date('01/06/2022');

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

const countDownFn = () => {
    // All logic goes in
    let now = new Date();
    let timeSpan = eventDay - now;

    if (timeSpan <= -today) {
        console.log("Unfortunately we have past the event day");
        clearInterval(interval);
    }
    else {
        const days = Math.floor(timeSpan / day)
        const hours = Math.floor((timeSpan % day) / hour)
        const minutes = Math.floor((timeSpan % hour) / minute)
        const seconds = Math.floor((timeSpan % minute) / second)
      
        let dayField = document.getElementById('day');
        let hourField = document.getElementById('hour');
        let minuteField = document.getElementById('minute');
        let secondField = document.getElementById('second');

        // Set results
        dayField.innerHTML = days;
        hourField.innerHTML = hours;
        minuteField.innerHTML = minutes;
        secondField.innerHTML = seconds;

        console.log(days + ":" + hours + ":" + minutes + ":" + seconds);
    }
}

everySecond = setInterval(countDownFn, second)
everyMinute = setInterval(countDownFn, minute)
everyHour = setInterval(countDownFn, hour)