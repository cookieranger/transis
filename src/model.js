import pluralize from "pluralize";
import IdMap from "./id_map";
import * as attrs from "./attrs";

var registeredClasses = {}, registeredAttrs = {};

const NEW      = 'new';
const EMPTY    = 'empty';
const LOADED   = 'loaded';
const DELETED  = 'deleted';
const NOTFOUND = 'notfound';

// Internal: Checks to make sure the given object is of the type specified in the given association
// descriptor.
//
// Returns nothing.
// Throws `Error` if the given object isn't of the type specified in the association descriptor.
function checkAssociatedType(desc, o) {
  var klass = (typeof desc.klass === 'function') ? desc.klass : registeredClasses[desc.klass];

  if (!klass) {
    throw new Error(`${this.constructor}#checkAssociatedType: could not resolve model class: \`${desc.klass}\``);
  }

  if (!(o instanceof klass)) {
    throw new Error(`${this.constructor}#${desc.name}: expected an object of type \`${desc.klass}\` but received \`${o}\` instead`);
  }
}

// Internal: Called by an inverse association when a model was removed from the inverse side.
// Updates the local side of the association.
//
// name  - The local side name of the association that was modified.
// model - The model that was removed from the inverse side.
//
// Returns nothing.
function inverseRemoved(name, model) {
  var desc = this.associations[name];

  if (!desc) {
    throw new Error(`${this.constructor}#inverseRemoved: unknown association \`${name}\``);
  }

  if (desc.type === 'hasOne') {
    hasOneSet.call(this, desc, undefined, false);
  }
  else if (desc.type === 'hasMany') {
    hasManyRemove.call(this, desc, [model], false);
  }
}

// Internal: Called by an inverse association when a model was added on the inverse side. Updates
// the local side of the association.
//
// name  - The local side name of the association that was modified.
// model - The model that was added on the inverse side.
//
// Returns nothing.
function inverseAdded(name, model) {
  var desc = this.associations[name];

  if (!desc) {
    throw new Error(`${this.constructor}#inverseAdded: unknown association \`${name}\``);
  }

  if (desc.type === 'hasOne') {
    hasOneSet.call(this, desc, model, false);
  }
  else if (desc.type === 'hasMany') {
    hasManyAdd.call(this, desc, [model], false);
  }
}

// Internal: Sets the given object on a `hasOne` property.
//
// desc - An association descriptor.
// v    - The value to set.
// sync - Set to true to notify the inverse side of the association so that it can update itself.
//
// Returns nothing.
// Throws `Error` if the given object isn't of the type specified in the association descriptor.
function hasOneSet(desc, v, sync) {
  var name = desc.name, key = `__${name}__`, prev = this[key], inv = desc.inverse;

  if (v) { checkAssociatedType.call(this, desc, v); }

  this[key] = v;

  if (sync && inv && prev) { inverseRemoved.call(prev, inv, this); }
  if (sync && inv && v) { inverseAdded.call(v, inv, this); }
}

// Internal: Sets the given array on a `hasMany` property.
//
// desc - An association descriptor.
// a    - An array of values to set.
//
// Returns nothing.
// Throws `Error` if the given object isn't of the type specified in the association descriptor.
function hasManySet(desc, a) {
  var name = desc.name, prev = this[name], m;

  for (m of a) { checkAssociatedType.call(this, desc, m); }

  if (desc.inverse) {
    for (m of prev) { inverseRemoved.call(m, desc.inverse, this); }
    for (m of a) { inverseAdded.call(m, desc.inverse, this); }
  }

  this[`__${name}__`] = a;
}

// Internal: Adds the given models to a `hasMany` association.
//
// desc   - An association descriptor.
// models - An array of models to add to the association.
// sync   - Set to true to notify the inverse side of the association so that it can update itself.
// Throws `Error` if the given object isn't of the type specified in the association descriptor.
function hasManyAdd(desc, models, sync) {
  var name = desc.name, prev = this[name].slice();

  for (var m of models) {
    checkAssociatedType.call(this, desc, m);
    if (sync && desc.inverse) {
      inverseAdded.call(m, desc.inverse, this);
    }
    this[name].push(m);
  }
}

// Internal: Removes the given models from a `hasMany` association.
//
// desc   - An association descriptor.
// models - An array of models to remove from the association.
// sync   - Set to true to notify the inverse side of the association so that it can update itself.
//
// Returns nothing.
function hasManyRemove(desc, models, sync) {
  var name = desc.name, prev = this[name].slice(), i;

  for (var m of models) {
    if ((i = this[name].indexOf(m)) >= 0) {
      if (sync && desc.inverse) {
        inverseRemoved.call(m, desc.inverse, this);
      }
      this[name].splice(i, 1);
    }
  }
}

// Internal: Capitalizes the given word.
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

class Model {
  // Public: Registers the given `Model` subclass using the given name. Model subclasses must be
  // registered when they are referenced as a string in either a `hasOne` or `hasMany` association.
  //
  // klass - A subclass of `Model`.
  // name  - A string. This string can be used to reference the model class in associations.
  //
  // Returns the receiver.
  static registerClass(klass, name = klass.name) {
    if (typeof klass !== 'function' || !(klass.prototype instanceof Model)) {
      throw new Error(`Ryno.Model.registerClass: \`${klass}\` is not a subclass of Ryno.Model`);
    }

    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(`Ryno.Model.registerClass: no name given for class: \`${klass}\``);
    }

    if (name in registeredClasses) {
      throw new Error(`Ryno.Model.registerClass: a class with name \`${name}\` has already been registered`);
    }

    registeredClasses[name] = klass;
    klass.displayName = name;

    return this;
  }

  // Public: Returns a string containing the class's name.
  static toString() {
    if (this.hasOwnProperty('displayName')) { return this.displayName; }
    if (this.hasOwnProperty('name')) { return this.name; }
    else { return '(Unknown)'; }
  }

  // Public: Returns an empty instance of the model class. An empty instance contains only an id
  // and must be retrieved from the mapper before any of its attributes will be available. Since the
  // model's data mapper will likely need to perform an async action to retrieve data, this method
  // is used to construct an object that is suitable for returning from `Model.get` immediately.
  // Once the data mapper has finished loading the actual model data, the empty model will have its
  // attributes filled in.
  //
  // id - The id of the model.
  //
  // Returns a new instance of the class.
  static empty(id) {
    var model = new this({id: id});
    model.__sourceState__ = EMPTY;
    return model;
  }

  // Public: Registers a new attribute type available to be used on `Model` subclasses.
  //
  // name      - A string representing the name of the attribute type.
  // converter - A converter object or constructor function. Converter objects must implement two
  //             methods: `coerce` and `serialize`. The `coerce` method should take the given value
  //             and do its best to convert it to attribute's actual type. The `serialize` method
  //             should take the coerced value and return something suitable for JSON serialization.
  //             If a constructor function is given here, it will be instantiated once for each
  //             declared attribute of this type and will be passed the options object given to the
  //             `.attr` method.
  //
  // Returns the receiver.
  static registerAttr(name, converter) {
    if (registeredAttrs[name]) {
      throw new Error(`${this}.registerAttr: an attribute with the name \`${name}\` has already been defined`);
    }

    registeredAttrs[name] = converter;

    return this;
  }

  // Public: Defines an attribute on the model class. Attributes are typed properties that can
  // parse/coerce raw values (say from a JSON object) into objects of the property type. Calling
  // this method will define a property on the class's `prototype` so that it is available to all
  // instances.
  //
  // Attribute values are automatically coerced to their proper type when set. The original value is
  // available in the property named "<name>BeforeCoercion".
  //
  // name - A string representing the name of the attribute.
  // type - A string representing the type of the attribute (this must have been previously
  //        registered with `Model.registerAttr`).
  // opts - An object containing properties to pass to the attribute's converter object (default:
  //        `{}`).
  //   default - Used as the value of the attribute when undefined.
  //
  // Returns the receiver.
  static attr(name, type, opts = {}) {
    var converter = registeredAttrs[type], key = `__${name}__`, def = undefined;

    if (!converter) {
      throw new Error(`${this}.attr: unknown attribute type: \`${type}\``);
    }

    if (typeof converter === 'function') { converter = new converter(opts); }
    if ('default' in opts) { def = opts.default; }

    Object.defineProperty(this.prototype, name, {
      get: function() {
        return this[key] === undefined ? def : this[key];
      },
      set: function(v) {
        this[key] = converter.coerce(v);
        this[`${name}BeforeCoercion`] = v;
      }
    });

    return this;
  }

  // Public: Defines a `hasOne` association on the receiver class. This method will generate a
  // property with the given name that can be used to get or set the associated model.
  //
  // name  - A string representing the name of the association.
  // klass - Either the constructor function of the associated model or a string containing the name
  //         of the associated constructor function. Passing a string here is useful for the case
  //         where you are defining an association where the associated constructor function has yet
  //         to be defined. In order for this to work, the associated model class must be registered
  //         with the given name using `Model.registerClass`.
  // opts  - An object containing zero or more of the following keys (default: `{}`):
  //   inverse - Used for establishing two way associations, this is the name of the property on the
  //             associated object that points back to the receiver class.
  //
  // Returns the receiver.
  static hasOne(name, klass, opts = {}) {
    var desc;

    if (!this.prototype.hasOwnProperty('associations')) {
      this.prototype.associations = Object.create(this.prototype.associations);
    }

    this.prototype.associations[name] = desc = Object.assign({}, opts, {
      type: 'hasOne', name, klass
    });

    Object.defineProperty(this.prototype, name, {
      get: function() { return this[`__${name}__`]; },
      set: function(v) { hasOneSet.call(this, desc, v, true); }
    });

    return this;
  }

  // Public: Defines a `hasMany` association on the receiver class. This method will generate a
  // property with the given name that can be used to get or set an array of associated model
  // objects. It will also generate methods that can be used to manipulate the array. A `hasMany`
  // association with the name `widgets` would generate the following methods:
  //
  // addWidgets    - Adds one or more `Widget` models to the association array.
  // removeWidgets - Removes one ore more `Widget` models from the association array.
  // clearWidgets  - Empties the association array.
  //
  // Its important to use these generated methods to manipulate the array instead of manipulating it
  // directly since they take care of syncing changes to the inverse side of the association when
  // the association is two way.
  //
  // name  - A string representing the name of the association.
  // klass - Either the constructor function of the associated model or a string containing the name
  //         of the associated constructor function. Passing a string here is useful for the case
  //         where you are defining an association where the associated constructor function has yet
  //         to be defined. In order for this to work, the associated model class must be registered
  //         with the given name using `Model.registerClass`.
  // opts  - (see hasOne description)
  //
  // Returns the receiver.
  static hasMany(name, klass, opts = {}) {
    var cap = capitalize(name), desc;

    if (!this.prototype.hasOwnProperty('associations')) {
      this.prototype.associations = Object.create(this.prototype.associations);
    }

    this.prototype.associations[name] = desc = Object.assign({}, opts, {
      type: 'hasMany', name, klass, singular: pluralize(name, 1)
    });

    Object.defineProperty(this.prototype, name, {
      get: function() { return this[`__${name}__`] = this[`__${name}__`] || []; },
      set: function(v) { hasManySet.call(this, desc, v); }
    });

    this.prototype[`add${cap}`] = function() {
      return hasManyAdd.call(this, desc, Array.from(arguments), true);
    };

    this.prototype[`remove${cap}`] = function() {
      return hasManyRemove.call(this, desc, Array.from(arguments), true);
    };

    this.prototype[`clear${cap}`] = function() {
      return hasManySet.call(this, desc, []);
    };
  }

  // Public: Loads the given model attributes into the identity map. This method should be called by
  // your data mapper(s) when new data is successfully retrieved.
  //
  // attrs - An object containing the attributes for a single model. If the attributes contain
  //         references to defined associations, those associated objects will be loaded as well.
  //
  // Returns the loaded model instance.
  // Throws `Error` if the given attributes do not contain an `id` attribute.
  static load(attrs) {
    var id = attrs.id, model;

    if (!id) {
      throw new Error(`${this}.load: an \`id\` attribute is required`);
    }

    attrs = Object.assign({}, attrs);
    model = IdMap.get(this, id) || new this;
    delete attrs.id;

    // set non-association attributes
    for (let k in attrs) {
      if (k in model) { model[k] = attrs[k]; }
    }

    // set id if necessary
    if (model.id === undefined) { model.id = id; }

    model.__sourceState__ = LOADED;
    model.__isBusy__      = false;

    return model;
  }

  // Public: Retrieves a model from the identity map or creates a new empty model instance. If you
  // want to get the model from the mapper, then use the `Model.get` method.
  //
  // id - The id of the model to get.
  //
  // Returns an instance of the receiver.
  static local(id) { return IdMap.get(this, id) || this.empty(id); }

  // Public: Gets a model instance, either from the identity map or from the mapper. If the model
  // has already been loaded into the identity map, then it is simply returned, otherwise the data
  // mapper's `get` method will be invoked and an empty model will be returned.
  //
  // id   - The id of the model to get.
  // opts - An object containing zero or more of the following keys (default: `{}`):
  //   refresh - When true, the mapper's get method will be called regardless of whether the model
  //             exists in the identity map.
  //
  // Returns an instance of the receiver.
  static get(id, opts = {}) {
    var model = this.local(id), getOpts = Object.assign({}, opts);
    delete getOpts.refresh;
    // FIXME
    //if (model.isEmpty || opts.refresh) {
    //  mapperGet(model, getOpts)
    //}
    return model;
  }

  constructor(attrs) {
    for (let k in attrs) {
      if (k in this) { this[k] = attrs[k]; }
    }
  }

  get id() { return this.__id__; }
  set id(id) {
    if (this.__id__) {
      throw new Error(`${this.constructor}#id=: overwriting a model's identity is not allowed: ${this}`);
    }

    this.__id__ = id;

    IdMap.insert(this);
  }

  get sourceState() { return this.__sourceState__; }
  get isBusy() { return this.__isBusy__; }

  toString() {
    return `#<${this.constructor}:${this.id}>`;
  }
}

Model.prototype.associations = {};

Model.displayName = 'Ryno.Model';

Model.NEW      = NEW;
Model.EMPTY    = EMPTY;
Model.LOADED   = LOADED;
Model.DELETED  = DELETED;
Model.NOTFOUND = NOTFOUND;

Model.registerAttr('identity', attrs.IdentityAttr);
Model.registerAttr('string', attrs.StringAttr);
Model.registerAttr('number', attrs.NumberAttr);
Model.registerAttr('boolean', attrs.BooleanAttr);
Model.registerAttr('date', attrs.DateAttr);
Model.registerAttr('datetime', attrs.DateTimeAttr);

export default Model;
