import RynoArray from "./array";

// Public: The `QueryArray` class is a subclass of `Ryno.Array` that can be used to load a
// collection of model objects from the model class's mapper. An instance of this class is returned
// by `Ryno.Model.buildQuery` and `Ryno.Model.query`.
class QueryArray extends RynoArray {
  constructor(modelClass) {
    super();
    this.__modelClass__ = modelClass;
    this.__isBusy__     = false;
    this.__promise__    = Promise.resolve();
  }

  // Public: Execute a query by invoking the `query` method on the modelClass's mapper. This will
  // but the array into a busy state (indicated by the `isBusy` property) until the mapper has
  // fulfilled its promise. When the promise is successfully resolved, the returned data is loaded
  // via `Ryno.Model.loadAll` and the materialzed models are replaced into the array. When the
  // promise is rejected, the error message returned by the mapper is made available on the `error`
  // property.
  //
  // If this method is called while the array is currently busy, then the call to the mapper is
  // queued until the current query completes.
  //
  // opts - An object to pass along to the mapper (default: `{}`).
  //
  // Returns the receiver.
  query(opts = {}) {
    if (this.isBusy) {
      if (!this.__queued__) {
        this.__promise__ = this.__promise__.then(() => {
          this.query(this.__queued__);
          delete this.__queued__;
          return this.__promise__;
        });
      }

      this.__queued__ = opts;
    }
    else {
      this.__isBusy__ = true;
      this.__promise__ = this.modelClass._callMapper('query', [opts]).then(
        (objects) => {
          this.replace(this.modelClass.loadAll(objects));
          this.__isBusy__ = false;
          delete this.__error__;
        },
        (e) => {
          this.__isBusy__ = false;
          this.__error__ = e;
          throw e;
        }
      );
    }

    return this;
  }

  // Public: Registers fulfillment and rejection handlers on the latest promise object returned by
  // the modelClass's mapper. If the `query` method has yet to be called, then the `onFulfilled`
  // handler is invoked immediately.
  //
  // When resolved, the `onFulfilled` handler is called with no arguments. When rejected, the
  // `onFulfilled` handler is called with the error message from the mapper.
  //
  // onFulfilled - A function to be invoked when the latest promise from the mapper is resolved.
  // onRejected  - A function to be invoked when the latest promise from the mapper is rejected.
  //
  // Returns a new `Promise` that will be resolved with the return value of `onFulfilled`.
  then(f1, f2) { return this.__promise__.then(f1, f2); }

  // Public: Registers a rejection handler on the latest promise object returned by the modelClass's
  // mapper.
  //
  // onRejected - A function to be invoked when the latest promise from the mapper is rejected.
  //
  // Returns a new `Promise` that is resolved to the return value of the callback if it is called.
  catch(f) { return this.__promise__.catch(f); }
}

QueryArray.prop('modelClass', {readonly: true, get: function() { return this.__modelClass__; }});
QueryArray.prop('isBusy', {readonly: true, get: function() { return this.__isBusy__; }});
QueryArray.prop('error', {readonly: true, get: function() { return this.__error__; }});

export default QueryArray;
