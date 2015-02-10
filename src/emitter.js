var regs = new Map;

function trigger(reg, event, data) {
  var handler = typeof reg.handler === 'string' ? reg.observer[reg.handler] : reg.handler;

  if (reg.context) {
    handler.call(reg.observer, event, data, reg.context);
  }
  else {
    handler.call(reg.observer, event, data);
  }
}

function Emitter() {}

Emitter.prototype = {
  on: function(event, handler, opts = {}) {
    var reg, events;

    regs.set(this, events = (regs.get(this) || {}));
    events[event] = events[event] || [];

    opts = Object.assign({
      observer: this,
      context: null,
      fire: false,
      once: false
    }, opts);

    reg = {
      handler: handler,
      observer: opts.observer,
      context: opts.context,
      once: opts.once
    };

    events[event].push(reg);

    if (opts.fire) { trigger(reg, event); }

    return this;
  },

  off: function(event, handler, opts = {}) {
    var keys, rs, i, j, n;

    if (!regs.get(this)) { return this; }

    keys = event ? [event] : Object.keys(regs.get(this));

    for (i = 0, n = keys.length; i < n; i++) {
      if (!(rs = regs.get(this)[keys[i]])) { continue; }

      for (j = rs.length - 1; j >= 0; j--) {
        if (handler && handler !== rs[j].handler) { continue; }
        if (opts.observer && opts.observer !== rs[j].observer) { continue; }
        if (opts.context && opts.context !== rs[j].context) { continue; }
        rs.splice(j, 1);
      }

      if (rs.length === 0) { delete regs.get(this)[keys[i]]; }
    }

    return this;
  },

  emit: function(event, data) {
    var keys, parts, rs, n, i, j;

    if (!regs.get(this)) { return this; }

    keys = [event, '*'];

    if (event.indexOf(':') >= 0) {
      parts = event.split(':');
      keys.push(parts[0] + ':*');
      keys.push('*:' + parts[1]);
      keys.push('*:*');
    }

    for (i = 0, n = keys.length; i < n; i++) {
      if (!(rs = regs.get(this)[keys[i]])) { continue; }

      for (j = rs.length - 1; j >= 0; j--) {
        trigger(rs[j], event, data);
        if (rs[j].once) {
          this.off(keys[i], rs[j].handler, {
            observer: rs[j].observer,
            context: rs[j].context
          });
        }
      }
    }

    return this;
  }
};

export default Emitter;
