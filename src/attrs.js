import * as parsers from "./parsers";

export var IdentityAttr = {
  coerce(v) { return v; },
  serialize(v) { return v; }
};

export var StringAttr = {
  coerce(v) { return v != null ? String(v) : v; },
  serialize(s) { return s; }
};

export var NumberAttr = {
  coerce(v) {
    if (typeof v === 'number') { return v; }
    else if (typeof v === 'string') { return parsers.parseNumber(v); }
    else { return null; }
  },

  serialize(n) { return n; }
};

export var BooleanAttr = {
  coerce(v) { return !!v; },
  serialize(b) { return b; }
};

export var DateAttr = {
  coerce(v) {
    if (v == null || v instanceof Date) { return v; }
    if (typeof v === 'number') { return new Date(v); }

    if (typeof v !== 'string') {
      throw new Error(`Ryno.DateAttr#coerce: don't know how to coerce \`${v}\` to a Date`);
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
      throw new Error(`Ryno.DateTimeAttr#coerce: don't know how to coerce \`${v}\` to a Date`);
    }

    return parsers.parseDateTime(v);
  },

  serialize(date) {
    return date instanceof Date ? date.toJSON() : date;
  }
};