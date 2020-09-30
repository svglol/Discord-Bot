class Tools {
  generateTable (rows) {
    var tableString = '```';
    const spacing = 2;

    var colLength = new Map();
    // get longest word in each column
    rows.forEach(row => {
      row.forEach((line, i) => {
        if (line != null) {
          if (!colLength.get(i)) {
            colLength.set(i, line.length);
          }
          if (line.length > colLength.get(i)) {
            colLength.set(i, line.length);
          }
        }
      });
    });

    // add spacing to max length of each column
    for (const [key, value] of colLength.entries()) {
      colLength.set(key, value + spacing);
    }

    // generate the tableString
    rows.forEach(row => {
      row.forEach((line, i) => {
        if (line != null) {
          var text = line;
          var space = '';
          for (var j = 0; j < colLength.get(i) - text.length; j++) {
            space += ' ';
          }
          tableString += text;
          tableString += space;
        }
      });
      tableString += '\n';
    });

    tableString += '```';
    return tableString;
  }

  getMonthName (monthNumber) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.slice(monthNumber)[0];
  }

  parseMillisecondsIntoReadableTime (millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = '';
    if (minutes > 59) {
      hours = Math.floor(minutes / 60);
      hours = hours >= 10 ? hours : '0' + hours;
      minutes = minutes - hours * 60;
      minutes = minutes >= 10 ? minutes : '0' + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    if (hours !== '') {
      return hours + ':' + minutes + ':' + seconds;
    }
    return minutes + ':' + seconds;
  }

  calculateExecutionTime (startTime) {
    var date = new Date();
    return date.getTime() - startTime;
  }

  createCommand (file) {
    return /[^.]*/.exec(file)[0];
  }
}

module.exports = Tools;
