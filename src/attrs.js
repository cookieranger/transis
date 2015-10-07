import * as parsers from "./parsers";

export var IdentityAttr = {
  coerce(v) { return v; },
  serialize(v) { return v; }
};

export class StringAttr {
  constructor(opts = {}) { this.opts = Object.assign({trim: true}, opts); }

  coerce(v) {
    v = v != null ? String(v) : v;
    if (typeof v === 'string' && this.opts.trim) { v = v.trim(); }
    return v;
  }

  serialize(s) { return s; }
}

export var IntegerAttr = {
  coerce(v) {
    if (typeof v === 'number') { return Math.round(v); }
    else if (typeof v === 'string') {
      var parsed = parsers.parseNumber(v);
      return parsed ? Math.round(parsed) : parsed;
    }
    else if (v === undefined) { return undefined; }
    else { return null; }
  },

  serialize(n) { return n; }
};

export var NumberAttr = {
  coerce(v) {
    if (typeof v === 'number') { return v; }
    else if (typeof v === 'string') { return parsers.parseNumber(v); }
    else if (v === undefined) { return undefined; }
    else { return null; }
  },

  serialize(n) { return n; }
};

export var BooleanAttr = {
  coerce(v) { return v === undefined ? v : !!v; },
  serialize(b) { return b; }
};

export var DateAttr = {
  coerce(v) {
    if (v == null || v instanceof Date) { return v; }
    if (typeof v === 'number') { return new Date(v); }

    if (typeof v !== 'string') {
      throw new Error(`Transis.DateAttr#coerce: don't know how to coerce \`${v}\` to a Date`);
    }

    return parsers.parseDate(v);
  },

  serialize(date) {
    return date instanceof Date ? date.toJSON().replace(/T.*$/, '') : date;
  }
};

export var DateTimeAttr = {
  coerce(v) {
    if (v == null || v instanceof Date) { return v; }
    if (typeof v === 'number') { return new Date(v); }

    if (typeof v !== 'string') {
      throw new Error(`Transis.DateTimeAttr#coerce: don't know how to coerce \`${v}\` to a Date`);
    }

    return parsers.parseDateTime(v);
  },

  serialize(date) {
    return date instanceof Date ? date.toJSON() : date;
  }
};
