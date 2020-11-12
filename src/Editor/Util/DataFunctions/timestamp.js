// Found on https://gist.github.com/hurjas/2660489 by GitHub user hurjas
/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */
function timeStamp() {
// Create a date object with the current time
    var now = new Date();

// Create an array with the current month, day and time
    var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
            time[i] = "0" + time[i];
        }
    }

// Return the formatted string
    return date.join("-") + "_" + time.join("-");
}

export default timeStamp