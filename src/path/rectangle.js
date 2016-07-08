import {path} from 'd3-path';

function rectangleX(d) {
  return d.x;
}

function rectangleY(d) {
  return d.y;
}

function rectangleWidth(d) {
  return d.width;
}

function rectangleHeight(d) {
  return d.height;
}

function constant(_) {
  return function() { return _; };
}

export default function() {
  var x = rectangleX,
      y = rectangleY,
      width = rectangleWidth,
      height = rectangleHeight,
      cornerRadius = constant(0),
      context = null;

  function rectangle() {
    var buffer,
        x1 = +x.apply(this, arguments),
        y1 = +y.apply(this, arguments),
        w  = +width.apply(this, arguments),
        h  = +height.apply(this, arguments),
        cr = +cornerRadius.apply(this, arguments);

    if (!context) context = buffer = path();

    if (cr <= 0) {
      context.rect(x1, y1, w, h);
    } else {
      var x2 = x1 + w,
          y2 = y1 + h;
      context.moveTo(x1 + cr, y1);
      context.lineTo(x2 - cr, y1);
      context.quadraticCurveTo(x2, y1, x2, y1 + cr);
      context.lineTo(x2, y2 - cr);
      context.quadraticCurveTo(x2, y2, x2 - cr, y2);
      context.lineTo(x1 + cr, y2);
      context.quadraticCurveTo(x1, y2, x1, y2 - cr);
      context.lineTo(x1, y1 + cr);
      context.quadraticCurveTo(x1, y1, x1 + cr, y1);
      context.closePath();
    }

    if (buffer) return context = null, buffer + '' || null;
  }

  rectangle.x = function(_) {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_), rectangle) : x;
  };

  rectangle.y = function(_) {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_), rectangle) : y;
  };

  rectangle.width = function(_) {
    return arguments.length ? (width = typeof _ === 'function' ? _ : constant(+_), rectangle) : width;
  };

  rectangle.height = function(_) {
    return arguments.length ? (height = typeof _ === 'function' ? _ : constant(+_), rectangle) : height;
  };

  rectangle.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === 'function' ? _ : constant(+_), rectangle) : cornerRadius;
  };

  rectangle.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, rectangle) : context;
  };

  return rectangle;
}
