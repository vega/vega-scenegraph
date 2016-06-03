// Path parsing and rendering code adapted from fabric.js -- Thanks!
var cmdlen = { m:2, l:2, h:1, v:1, c:6, s:4, q:4, t:2, a:7 },
    regexp = [/([MLHVCSQTAZmlhvcsqtaz])/g, /###/, /(\d)([-+])/g, /({{.*?}})|\s|,|###/];

module.exports = function(pathstr, size) {
  var result = [],
      path,
      curr,
      chunks,
      parsed, param,
      cmd, len, i, j, n, m,
      handlebarCounter = 0;

  // Replace handle bars first to prevent alphabets within handles 
  // to be mistaken as commands
  var handlebarMatches = pathstr.match(/{{.*?}}/g);
  pathstr = pathstr.replace(/{{.*?}}/g, '{{}}');

  // First, break path into command sequence
  path = pathstr
    .slice()
    .replace(regexp[0], '###$1')
    .split(regexp[1])
    .slice(1);

  // Next, parse each command in turn
  for (i=0, n=path.length; i<n; ++i) {
    curr = path[i];
    chunks = curr
      .slice(1)
      .trim()
      .replace(regexp[2],'$1###$2')
      .split(regexp[3])
      .filter(function(n){ return n != undefined && n !== ''});
    cmd = curr.charAt(0);

    parsed = [cmd];

    // If single command (for example 'Z' for close path), push in 0 to represent empty command
    if (curr.length == 1) {
      parsed.push(0);
    } else  {
      for (j=0, m=chunks.length; j<m; ++j) {
        if ((param = +chunks[j]) === param) { // not NaN
          parsed.push(param);
        } else if (chunks[j] && chunks[j].startsWith('{{') && chunks[j].endsWith('}}')) { // for handlebars
          // Add original string in handlebars back in
          parsed.push(handlebarMatches[handlebarCounter]);
          handlebarCounter++;
        }
      }
    }

    len = cmdlen[cmd.toLowerCase()];
    if (parsed.length-1 > len) {
      for (j=1, m=parsed.length; j<m; j+=len) {
        result.push([cmd].concat(parsed.slice(j, j+len)));
      }
    }
    else {
      result.push(parsed);
    }
  }

  return result;
};
