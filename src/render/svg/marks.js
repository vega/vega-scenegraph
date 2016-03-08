var text = require('../../util/text'),
    SVG = require('../../util/svg'),
    parse = require('../../path/parse'),
    textAlign = SVG.textAlign,
    path = SVG.path;

var tan30 = Math.tan(30 * Math.PI / 180);

function translateItem(o) {
  return translate(o.x || 0, o.y || 0);
}

function translate(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

// Replace handlebar equations with evaluated expressions
function evaluateExpressions(shape) {
  var matches = shape.match(/{{.*?}}/g);
  if (matches) {
    for (var i = 0; i < matches.length; i++) {
      shape = shape.replace(matches[i], eval(matches[i]));
    }
  }
  return shape;
}

// Resize custom shapes to be within a square of area = size
function resize(pathString, size) {
  var pathArr = parse(pathString);
  var newPath = '';
  for (var i = 0; i < pathArr.length; i++) {
    var commands = pathArr[i];
    for (var j = 0; j < commands.length; j++) {
      var current;
      if (commands[j] === 'Z') {
        break;
      }
      if ((current = +commands[j]) === current) { // if number, need to resize
        var index = pathString.indexOf(current);
        newPath += pathString.substring(0, index) + (current * Math.sqrt(size));
        pathString = pathString.substring(index + current.toString().length, pathString.length);
      }
    }
  }
  newPath += 'Z';
  return newPath;
}

module.exports = {
  arc: {
    tag:  'path',
    type: 'arc',
    attr: function(emit, o) {
      emit('transform', translateItem(o));
      emit('d', path.arc(o));
    }
  },
  area: {
    tag:  'path',
    type: 'area',
    nest: true,
    attr: function(emit, o) {
      var items = o.mark.items;
      if (items.length) emit('d', path.area(items));
    }
  },
  group: {
    tag:  'g',
    type: 'group',
    attr: function(emit, o, renderer) {
      var id = null, defs, c;
      emit('transform', translateItem(o));
      if (o.clip) {
        defs = renderer._defs;
        id = o.clip_id || (o.clip_id = 'clip' + defs.clip_id++);
        c = defs.clipping[id] || (defs.clipping[id] = {id: id});
        c.width = o.width || 0;
        c.height = o.height || 0;
      }
      emit('clip-path', id ? ('url(#' + id + ')') : null);
    },
    background: function(emit, o) {
      emit('class', 'background');
      emit('width', o.width || 0);
      emit('height', o.height || 0);
    }
  },
  image: {
    tag:  'image',
    type: 'image',
    attr: function(emit, o, renderer) {
      var x = o.x || 0,
          y = o.y || 0,
          w = o.width || 0,
          h = o.height || 0,
          url = renderer.imageURL(o.url);

      x = x - (o.align === 'center' ? w/2 : o.align === 'right' ? w : 0);
      y = y - (o.baseline === 'middle' ? h/2 : o.baseline === 'bottom' ? h : 0);

      emit('href', url, 'http://www.w3.org/1999/xlink', 'xlink:href');
      emit('transform', translate(x, y));
      emit('width', w);
      emit('height', h);
    }
  },
  line: {
    tag:  'path',
    type: 'line',
    nest: true,
    attr: function(emit, o) {
      var items = o.mark.items;
      if (items.length) emit('d', path.line(items));
    }
  },
  path: {
    tag:  'path',
    type: 'path',
    attr: function(emit, o) {
      emit('transform', translateItem(o));
      emit('d', o.path);
    }
  },
  rect: {
    tag:  'rect',
    type: 'rect',
    nest: false,
    attr: function(emit, o) {
      emit('transform', translateItem(o));
      emit('width', o.width || 0);
      emit('height', o.height || 0);
    }
  },
  rule: {
    tag:  'line',
    type: 'rule',
    attr: function(emit, o) {
      emit('transform', translateItem(o));
      emit('x2', o.x2 != null ? o.x2 - (o.x||0) : 0);
      emit('y2', o.y2 != null ? o.y2 - (o.y||0) : 0);
    }
  },
  symbol: {
    tag:  'path',
    type: 'symbol',
    attr: function(emit, o) {
      var pathString;
      if (!o.shape || d3.svg.symbolTypes.indexOf(o.shape) > -1) {
        pathString = path.symbol(o);
      } else { // custom expressions (calculates handlebar equations && resize)
        var evalString = evaluateExpressions(o.shape);
        pathString = resize(evalString, o.size);
      }
      emit('transform', translateItem(o));
      emit('d', pathString);
    }
  },
  text: {
    tag:  'text',
    type: 'text',
    nest: false,
    attr: function(emit, o) {
      var dx = (o.dx || 0),
          dy = (o.dy || 0) + text.offset(o),
          x = (o.x || 0),
          y = (o.y || 0),
          a = o.angle || 0,
          r = o.radius || 0, t;

      if (r) {
        t = (o.theta || 0) - Math.PI/2;
        x += r * Math.cos(t);
        y += r * Math.sin(t);
      }

      emit('text-anchor', textAlign[o.align] || 'start');
      
      if (a) {
        t = translate(x, y) + ' rotate('+a+')';
        if (dx || dy) t += ' ' + translate(dx, dy);
      } else {
        t = translate(x+dx, y+dy);
      }
      emit('transform', t);
    }
  }
};
