import "es6-shim";
import BasisArray from "../array";
import BasisObject from "../object";

var A = BasisArray.A;

describe('Array', function() {
  describe('.A', function() {
    it('returns a Basis.Array containing all of the given arguments', function() {
      var a1 = A(1,2,3), a2 = A(9);

      expect(a1 instanceof BasisArray).toBe(true);
      expect(a1.length).toBe(3);
      expect(a1.at(0)).toBe(1);
      expect(a1.at(1)).toBe(2);
      expect(a1.at(2)).toBe(3);
      expect(a2 instanceof BasisArray).toBe(true);
      expect(a2.length).toBe(1);
      expect(a2.at(0)).toBe(9);
    });

    it('returns an empty Basis.Array when given no arguments', function() {
      var a = A();

      expect(a instanceof BasisArray).toBe(true);
      expect(a.length).toBe(0);
    });
  });

  describe('.from', function() {
    it('creates a new Basis.Array with the contents of the given native array', function() {
      var a = [1, 2];

      expect(BasisArray.from(a) instanceof BasisArray).toBe(true);
      expect(BasisArray.from(a)).toEqual(a);
    });

    it('creates a new BasisArray with the contents of the given Arguments object', function() {
      var args = (function() { return arguments; })('a', 'b', 'c');

      expect(BasisArray.from(args) instanceof BasisArray).toBe(true);
      expect(BasisArray.from(args)).toEqual(A('a', 'b', 'c'));
    });

    it('creates a new Basis.Array with the contents of the given Basis.Array', function() {
      var a = A(1, 2);

      expect(BasisArray.from(a) instanceof BasisArray).toBe(true);
      expect(BasisArray.from(a)).not.toBe(a);
      expect(BasisArray.from(a)).toEqual(a);
    });
  });

  describe('.wrap', function() {
    it('creates a new Basis.Array with the given array as the backing __elements__', function() {
      var a = [1,2,3];

      expect(BasisArray.wrap(a).__elements__).toBe(a);
    });

    it('throws a TypeError exception when given a non-array', function() {
      expect(function() {
        BasisArray.wrap({});
      }).toThrow(new TypeError(`Basis.Array.wrap: expected a native array but received \`${{}}\` instead`));

      expect(function() {
        BasisArray.wrap(4);
      }).toThrow(new TypeError(`Basis.Array.wrap: expected a native array but received \`${4}\` instead`));
    });
  });

  describe('constructor', function() {
    it('creates an array of the given size when passed a single number', function() {
      var a = new BasisArray(3);

      expect(a.length).toBe(3);
      expect(a.at(0)).toBeUndefined();
      expect(a.at(1)).toBeUndefined();
      expect(a.at(2)).toBeUndefined();
    });

    it('creates an array whose contents are the given arguments', function() {
      var a1 = new BasisArray(1, 2), a2 = new BasisArray('a', 'b', 'c');

      expect(a1.length).toBe(2);
      expect(a1.at(0)).toBe(1);
      expect(a1.at(1)).toBe(2);
      expect(a2.length).toBe(3);
      expect(a2.at(0)).toBe('a');
      expect(a2.at(1)).toBe('b');
      expect(a2.at(2)).toBe('c');
    });

    it('creates an empty array when no arguments are given', function() {
      var a = new BasisArray;

      expect(a.length).toBe(0);
    });
  });

  describe('#at', function() {
    var a;

    beforeEach(function() { a = new BasisArray('the', 'quick', 'brown', 'fox'); });

    describe('given just an index', function() {
      it('returns the value at the given index when given a positive index in range', function() {
        expect(a.at(0)).toBe('the');
        expect(a.at(1)).toBe('quick');
        expect(a.at(2)).toBe('brown');
        expect(a.at(3)).toBe('fox');
      });

      it('returns the value at the index starting from the end when given a negative index in range', function() {
        expect(a.at(-1)).toBe('fox');
        expect(a.at(-2)).toBe('brown');
        expect(a.at(-3)).toBe('quick');
        expect(a.at(-4)).toBe('the');
      });

      it('returns undefined when given a positive index that is out of range', function() {
        expect(a.at(4)).toBeUndefined();
        expect(a.at(112)).toBeUndefined();
      });

      it('returns undefined when given a negative index that is out of range', function() {
        expect(a.at(-5)).toBeUndefined();
        expect(a.at(-1743)).toBeUndefined();
      });
    });

    describe('given an index and a value', function() {
      it('sets the value at the given index', function() {
        expect(a.at(0)).toBe('the');
        a.at(0, 'THE');
        expect(a.at(0)).toBe('THE');
        expect(a.at(-1)).toBe('fox');
        a.at(-1, 'dog');
        expect(a.at(-1)).toBe('dog');
        a.at(2, 'two');
        expect(a.at(2)).toBe('two');
        a.at(2, undefined);
        expect(a.at(2)).toBeUndefined();
      });

      it('returns the value', function() {
        expect(a.at(1, 'slow')).toBe('slow');
      });
    });
  });

  describe('#eq', function() {
    it('returns `false` if any corresponding items are not equal', function() {
      expect(A('a', 'b', 'c').eq(A('a', 'b', 'd'))).toBe(false);
      expect(A(NaN).eq(A(NaN))).toBe(false);
    });

    it('returns `true` if all corresponding items are equal', function() {
      expect(A().eq(A())).toBe(true);
      expect(A(1,2,3).eq(A(1,2,3))).toBe(true);
    });

    it('works with native arrays', function() {
      expect(A(1,2,3).eq([1,2,3])).toBe(true);
      expect(A().eq([])).toBe(true);
      expect(A(1,2,3).eq([1,2,3,4])).toBe(false);
      expect(A(1,2,3,4).eq([1,2,3])).toBe(false);
    });

    it('handles recursive arrays', function() {
      var a1 = A(A(1)), a2 = A(A(1));

      a1.at(1, a1);
      a2.at(1, a2);

      expect(a1.eq(a2)).toBe(true);
      expect(a2.eq(a1)).toBe(true);
    });

    it("returns `false` when given an argument that is not a regular array or Basis.Array", function() {
      expect((A()).eq("foo")).toBe(false);
      expect((A()).eq({})).toBe(false);
      expect((A()).eq(new BasisObject)).toBe(false);
    });
  });

  describe('#splice', function() {
    var a;

    describe('with 1 argument', function() {
      it('removes all remaining items starting at the given index', function() {
        a = A(0, 1, 2);
        a.splice(0);
        expect(a).toEqual(A());

        a = A(0, 1, 2);
        a.splice(1);
        expect(a).toEqual(A(0));

        a = A(0, 1, 2);
        a.splice(2);
        expect(a).toEqual(A(0, 1));

        a = A(0, 1, 2);
        a.splice(3);
        expect(a).toEqual(A(0, 1, 2));
      });
    });

    describe('with a positive index in range', function() {
      it('replaces the given number of items starting at the given index with the given objects', function() {
        a = A(0, 1, 2);
        a.splice(0, 0);
        expect(a).toEqual(A(0, 1, 2));

        a = A(0, 1, 2);
        a.splice(0, 1);
        expect(a).toEqual(A(1, 2));

        a = A(0, 1, 2);
        a.splice(1, 1);
        expect(a).toEqual(A(0, 2));

        a = A(0, 1, 2);
        a.splice(1, 2);
        expect(a).toEqual(A(0));

        a = A(0, 1, 2);
        a.splice(1, 20);
        expect(a).toEqual(A(0));

        a = A(0, 1, 2);
        a.splice(0, 1, 100);
        expect(a).toEqual(A(100, 1, 2));

        a = A(0, 1, 2);
        a.splice(1, 2, 'a', 'b');
        expect(a).toEqual(A(0, 'a', 'b'));

        a = A(0, 1, 2);
        a.splice(1, 2, 'a', 'b', 'c', 'd');
        expect(a).toEqual(A(0, 'a', 'b', 'c', 'd'));
      });
    });

    describe('with a positive index out of range', function() {
      it('appends the added values to the end of the array', function() {
        a = A(0, 1, 2);
        a.splice(4, 0, 'x');
        expect(a).toEqual(A(0, 1, 2, 'x'));

        a = A(0, 1, 2);
        a.splice(4, 0, 'x', 'y', 'z');
        expect(a).toEqual(A(0, 1, 2, 'x', 'y', 'z'));

        a = A(0, 1, 2);
        a.splice(4, 2, 'x', 'y', 'z');
        expect(a).toEqual(A(0, 1, 2, 'x', 'y', 'z'));
      });
    });

    describe('with a negative index in range', function() {
      it('replaces the given number of items starting at the index from the right with the given objects', function() {
        a = A(0, 1, 2);
        a.splice(-3, 0);
        expect(a).toEqual(A(0, 1, 2));

        a = A(0, 1, 2);
        a.splice(-3, 1);
        expect(a).toEqual(A(1, 2));

        a = A(0, 1, 2);
        a.splice(-2, 1);
        expect(a).toEqual(A(0, 2));

        a = A(0, 1, 2);
        a.splice(-2, 2);
        expect(a).toEqual(A(0));

        a = A(0, 1, 2);
        a.splice(-2, 20);
        expect(a).toEqual(A(0));

        a = A(0, 1, 2);
        a.splice(-3, 1, 100);
        expect(a).toEqual(A(100, 1, 2));

        a = A(0, 1, 2);
        a.splice(-2, 2, 'a', 'b');
        expect(a).toEqual(A(0, 'a', 'b'));

        a = A(0, 1, 2);
        a.splice(-2, 2, 'a', 'b', 'c', 'd');
        expect(a).toEqual(A(0, 'a', 'b', 'c', 'd'));
      });
    });

    describe('with a negative index out of range', function() {
      it('throws an exception', function() {
        var a = A(0, 1, 2);

        expect(function() {
          a.splice(-12);
        }).toThrow(new Error('Basis.Array#splice: index -12 is too small for ' + a));
      });
    });

    it('returns an array containing the items removed', function() {
      expect(A(0, 1, 2).splice(0)).toEqual(A(0, 1, 2));
      expect(A(0, 1, 2).splice(1)).toEqual(A(1, 2));
      expect(A(0, 1, 2).splice(2)).toEqual(A(2));
      expect(A(0, 1, 2).splice(3)).toEqual(A());
      expect(A(0, 1, 2).splice(1, 1, 10)).toEqual(A(1));
      expect(A(0, 1, 2).splice(0, 3, 10)).toEqual(A(0, 1, 2));
      expect(A(0, 1, 2).splice(10, 3, 10)).toEqual(A());
    });

    it('returns an instance of Basis.Array', function() {
      expect(A(0, 1, 2).splice(0) instanceof BasisArray).toBe(true);
    });

    it('emits a splice event with the array, index, num removed, added, and removed elements', function() {
      var a = A('a', 'b', 'c', 'd', 'e'), spy = jasmine.createSpy();

      a.on('splice', spy);
      a.splice(2, 2, 'C', 'D');
      expect(spy).toHaveBeenCalledWith('splice', {
        array: a, i: 2, n: 2, removed: ['c', 'd'], added: ['C', 'D']
      });
    });
  });

  describe('change events', function() {
    var a, spy;

    var Test = BasisObject.extend('Test', function() {
      this.prop('x');
      this.prop('y');
    });

    beforeEach(function() {
      a = A(new Test({x: 1, y: 'a'}), new Test({x: 2, y: 'b'}), new Test({x: 3, y: 'c'}));
      spy = jasmine.createSpy();

      a.on('change:*', spy);
    });

    it('emits an `change:<prop name>` event when a property on an element of the array changes', function() {
      a.at(0).x = 10;
      expect(spy).toHaveBeenCalledWith('change:x', {array: a, object: a.at(0), old: 1});
      a.at(1).y = 'foo';
      expect(spy).toHaveBeenCalledWith('change:y', {array: a, object: a.at(1), old: 'b'});
    });

    it('emits an `change:<prop name>` event when an added element changes', function() {
      var t = new Test({x: 4, y: 'd'});
      a.push(t);
      t.y = 'e';
      expect(spy).toHaveBeenCalledWith('change:y', {array: a, object: t, old: 'd'});
    });

    it('does not emit an `change:<prop name>` event when a removed element changes', function() {
      var t = a.pop();
      t.y = 'e';
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('#push', function() {
    it('appends the given object(s) to the end of the array', function() {
      var a = A(1,2,3);
      a.push(4);
      expect(a).toEqual([1,2,3,4]);
      a.push(10,11,12);
      expect(a).toEqual([1,2,3,4,10,11,12]);
    });

    it('returns the new length of the array', function() {
      var a = A(1,2,3);
      expect(a.push(4)).toBe(4);
      expect(a.push(5,6,7)).toBe(7);
    });
  });

  describe('#pop', function() {
    it('returns the object at the end of the array', function() {
      expect(A(1,2,3).pop()).toBe(3);
      expect(A('a', 'b', 'c').pop()).toBe('c');
    });

    it('removes the object at the end of the array from the array', function() {
      var a = A(1,2,3,4,5);
      expect(a.pop()).toBe(5);
      expect(a).toEqual([1,2,3,4]);
      expect(a.pop()).toBe(4);
      expect(a).toEqual([1,2,3]);
    });

    it('returns undefined when called on an empty array', function() {
      expect(A().pop()).toBeUndefined();
    });
  });

  describe('#unshift', function() {
    it('prepends the given object(s) to the beginning of the array', function() {
      var a = A(1,2,3);
      a.unshift(4);
      expect(a).toEqual([4,1,2,3]);
      a.unshift(10,11,12);
      expect(a).toEqual([10,11,12,4,1,2,3]);
    });

    it('returns the new length of the array', function() {
      var a = A(1,2,3);
      expect(a.unshift(4)).toBe(4);
      expect(a.unshift(5,6,7)).toBe(7);
    });
  });

  describe('#shift', function() {
    it('returns the object at the beginning of the array', function() {
      expect(A(1,2,3).shift()).toBe(1);
      expect(A('a', 'b', 'c').shift()).toBe('a');
    });

    it('removes the object at the beginning of the array from the array', function() {
      var a = A(1,2,3,4,5);
      expect(a.shift()).toBe(1);
      expect(a).toEqual([2,3,4,5]);
      expect(a.shift()).toBe(2);
      expect(a).toEqual([3,4,5]);
    });

    it('returns undefined when called on an empty array', function() {
      expect(A().shift()).toBeUndefined();
    });
  });

  describe('#concat', function() {
    var a;

    beforeEach(function() { a = A(1,2,3); });

    it('returns a new array containing the receiver and the given arguments', function() {
      expect(A(1,2,3).concat(4,5,6)).toEqual(A(1,2,3,4,5,6));
    });

    it('returns a new array comprising the receiver joined with the given Basis.Array', function() {
      expect(A(1,2,3).concat(A(4,5,6))).toEqual(A(1,2,3,4,5,6));
    });

    it('returns a new array comprising the receiver joined with the given native array', function() {
      expect(A(1,2,3).concat([4,5,6])).toEqual(A(1,2,3,4,5,6));
    });

    it('works with multiple arguments of different types', function() {
      expect(A(1,2,3).concat([4,5], 6, A(7,8), 9)).toEqual(A(1,2,3,4,5,6,7,8,9));
    });

    it('returns an instance of Basis.Array', function() {
      expect(A(1,2,3).concat(4,5,6) instanceof BasisArray).toBe(true);
    });
  });

  describe('#slice', function() {
    it('returns a shallow copy of the portion of the array indicated by the given beginning and end index', function() {
      expect(A(0,1,2,3,4,5).slice()).toEqual(A(0,1,2,3,4,5));
      expect(A(0,1,2,3,4,5).slice(0,1)).toEqual(A(0));
      expect(A(0,1,2,3,4,5).slice(0,3)).toEqual(A(0,1,2));
      expect(A(0,1,2,3,4,5).slice(1,2)).toEqual(A(1));
      expect(A(0,1,2,3,4,5).slice(2,3)).toEqual(A(2));
      expect(A(0,1,2,3,4,5).slice(2,4)).toEqual(A(2,3));
      expect(A(0,1,2,3,4,5).slice(1,4)).toEqual(A(1,2,3));
    });

    it('returns an instance of Basis.Array', function() {
      expect(A(1,2,3,4,5).slice() instanceof BasisArray).toBe(true);
    });
  });

  describe('#map', function() {
    it('returns a new array with the results of calling the given function on each element of the receiver', function() {
      expect(A(1,2,3).map(function(x) { return x * 2; })).toEqual(A(2,4,6));
    });

    it('returns an instance of Basis.Array', function() {
      expect(A(1,2,3).map(function(x) { return x * 2; }) instanceof BasisArray).toBe(true);
    });

    it('executes the given function in the context of the second argument', function() {
      var spy = jasmine.createSpy(), o = {};
      A(1,2,3).map(spy, o); 
      expect(spy.calls.mostRecent().object).toBe(o);
    });
  });

  describe('#filter', function() {
    it('returns a new array with all elements that pass the given test function', function() {
      expect(A(1,2,3,4,5).filter(function(x) { return x % 2 === 0; })).toEqual(A(2,4));
    });

    it('returns an instance of Basis.Array', function() {
      expect(A(1,2,3,4,5).filter(function(x) { return x % 2 === 0; }) instanceof BasisArray).toBe(true);
    });

    it('executes the given function in the context of the second argument', function() {
      var spy = jasmine.createSpy(), o = {};
      A(1,2,3).filter(spy, o); 
      expect(spy.calls.mostRecent().object).toBe(o);
    });
  });

  describe('#indexOf', function() {
    it('returns the index of the given search element in the array', function() {
      expect(A('a', 'b', 'c', 'd').indexOf('b')).toBe(1);
      expect(A('a', 'b', 'c', 'd').indexOf('c')).toBe(2);
    });

    it('returns -1 if the given search element is not in the array', function() {
      expect(A('a', 'b', 'c', 'd').indexOf('e')).toBe(-1);
    });

    it('starts the search from the given start index', function() {
      expect(A('foo', 'bar', 'baz', 'foo', 'quux').indexOf('foo', 1)).toBe(3);
    });

    it('works with a negative start index', function() {
      expect(A('foo', 'bar', 'baz', 'foo', 'quux', 'foo').indexOf('foo', -2)).toBe(5);
    });
  });

  describe('#findIndex', function() {
    it('returns the index of the first item in the array for which the given function returns true', function() {
      expect(A(0,1,2,3).findIndex(function(x) { return x === 0; })).toBe(0);
      expect(A(0,1,2,3).findIndex(function(x) { return x === 2; })).toBe(2);
      expect(A(0,1,2,1).findIndex(function(x) { return x === 1; })).toBe(1);
    });

    it('returns `-1` if function never returns true', function() {
      expect(A(0,1,2,3).findIndex(function(x) { return x === 4; })).toBe(-1);
    });

    it('invokes the function in the context of the second argument', function() {
      var a = A(0,1,2), spy = jasmine.createSpy(), o = {};
      a.findIndex(spy, o);
      expect(spy.calls.mostRecent().object).toBe(o);
    });

    it('passes the item, index, and array to the given function', function() {
      var a = A('a', 'b', 'c'), spy = jasmine.createSpy();
      a.findIndex(spy);
      expect(spy.calls.argsFor(0)).toEqual(['a', 0, a]);
      expect(spy.calls.argsFor(1)).toEqual(['b', 1, a]);
      expect(spy.calls.argsFor(2)).toEqual(['c', 2, a]);
    });
  });

  describe('#find', function() {
    it('returns the the first item in the array for which the given function returns true', function() {
      expect(A('a', 'b', 'c', 'd').find(function(x) { return x === 'a'; })).toBe('a');
      expect(A('a', 'b', 'c', 'd').find(function(x) { return x === 'c'; })).toBe('c');
      expect(A('a', 'b', 'c', 'd').find(function(x) { return x === 'b'; })).toBe('b');
    });

    it('returns `undefined` if function never returns true', function() {
      expect(A('a', 'b', 'c', 'd').find(function(x) { return x === 'e'; })).toBeUndefined();
    });

    it('invokes the function in the context of the second argument', function() {
      var a = A(0,1,2), spy = jasmine.createSpy(), o = {};
      a.find(spy, o);
      expect(spy.calls.mostRecent().object).toBe(o);
    });

    it('passes the item, index, and array to the given function', function() {
      var a = A('a', 'b', 'c'), spy = jasmine.createSpy();
      a.find(spy);
      expect(spy.calls.argsFor(0)).toEqual(['a', 0, a]);
      expect(spy.calls.argsFor(1)).toEqual(['b', 1, a]);
      expect(spy.calls.argsFor(2)).toEqual(['c', 2, a]);
    });
  });

  describe('#some', function() {
    it('returns true when some element of the array passes the test function', function() {
      expect(A(1,2,3,4,5).some(function(x) { return x === 3; })).toBe(true);
    });

    it('returns false when no elements of the array pass the test function', function() {
      expect(A(1,2,3,4,5).some(function(x) { return x === 6; })).toBe(false);
    });

    it('stops processing the array as soon as an element is found that passes the test', function() {
      var spy = jasmine.createSpy().and.callFake(function(x) { return x === 3; });

      expect(A(1,2,3,4,5,6,7,8,9).some(spy)).toBe(true);
      expect(spy.calls.count()).toBe(3);
    });

    it('passes the current element, index, and array to the test function', function() {
      var a = A('a', 'b', 'c'),
          spy = jasmine.createSpy().and.callFake(function(x) { return false; });

      expect(a.some(spy)).toBe(false);
      expect(spy).toHaveBeenCalledWith('a', 0, a);
      expect(spy).toHaveBeenCalledWith('b', 1, a);
      expect(spy).toHaveBeenCalledWith('c', 2, a);
    });
  });

  describe('#every', function() {
    it('returns true when every element of the array passes the test function', function() {
      expect(A(2,4,6,8).every(function(x) { return x % 2 === 0; })).toBe(true);
    });

    it('returns false when some element of the array does not pass the test function', function() {
      expect(A(2,4,5,6,8).every(function(x) { return x % 2 === 0; })).toBe(false);
    });

    it('stops processing the array as soon as an element is found that does not pass the test', function() {
      var spy = jasmine.createSpy().and.callFake(function(x) { return x % 2 === 0; });

      expect(A(2,4,6,7,8,10,12).every(spy)).toBe(false);
      expect(spy.calls.count()).toBe(4);
    });

    it('passes the current element, index, and array to the test function', function() {
      var a = A('a', 'b', 'c'),
          spy = jasmine.createSpy().and.callFake(function(x) { return true; });

      expect(a.every(spy)).toBe(true);
      expect(spy).toHaveBeenCalledWith('a', 0, a);
      expect(spy).toHaveBeenCalledWith('b', 1, a);
      expect(spy).toHaveBeenCalledWith('c', 2, a);
    });
  });

  describe('#reduce', function() {
    it('applies the given function to each element in the array', function() {
      expect(A(1,2,3,4,5).reduce(function(acc, x) { return acc + x; }), 0).toBe(15);
    });

    it('uses the first element of the array as the initial value when one is not provided', function() {
      expect(A(1,2,3,4,5).reduce(function(acc, x) { return acc + x; })).toBe(15);
    });

    it('passes the accumulator, current value, index, and array to the function', function() {
      var a = A('a', 'b', 'c'), spy = jasmine.createSpy().and.returnValue('x');
      a.reduce(spy, 'x');
      expect(spy).toHaveBeenCalledWith('x', 'a', 0, a);
      expect(spy).toHaveBeenCalledWith('x', 'b', 1, a);
      expect(spy).toHaveBeenCalledWith('x', 'c', 2, a);
    });

    it('returns the inital value when the array is empty', function() {
      expect(A().reduce(function() {}, 9)).toBe(9);
    });

    it('throws a TypeError when the array is empty and no initial value is provided', function() {
      expect(function() {
        A().reduce(function() {});
      }).toThrow(new TypeError(`Basis.Array#reduce: reduce of an empty array with no initial value`));
    });
  });

  describe('#forEach', function() {
    it('executes the given function once for each element in the array', function() {
      var a = A('a', 'b', 'c'), spy = jasmine.createSpy();

      a.forEach(spy);
      expect(spy).toHaveBeenCalledWith('a', 0, a);
      expect(spy).toHaveBeenCalledWith('b', 1, a);
      expect(spy).toHaveBeenCalledWith('c', 2, a);
    });

    it('executes the function in the context of the second argument', function() {
      var a = A('a', 'b', 'c'), spy = jasmine.createSpy(), o = {};

      a.forEach(spy, o);
      expect(spy.calls.mostRecent().object).toBe(o);
    });
  });

  describe('#join', function() {
    it('joins the elements of the array into a string using the given separator', function() {
      expect(A(1,2,3).join(' + ')).toBe('1 + 2 + 3');
    });

    it('defaults to using "," as the separator', function() {
      expect(A(1,2,3).join()).toBe('1,2,3');
    });
  });

  describe('#replace', function() {
    it('replaces the contents of the receiver with the given `Basis.Array` contents', function() {
      var a = A(1,2,3);
      a.replace(A('foo', 'bar'));
      expect(a).toEqual(A('foo', 'bar'));
    });

    it('replaces the contents of the receiver with the given native array contents', function() {
      var a = A(1,2,3);
      a.replace([10, 11, 12, 13]);
      expect(a).toEqual(A(10, 11, 12, 13));
    });
  });

  describe('#clear', function() {
    it('removes all elements from the array', function() {
      var a = A(1,2,3);

      expect(a.clear()).toBe(a);
      expect(a).toEqual(A());
    });
  });

  describe('#flatten', function() {
    it('returns a new array that removes all levels of nested arrays', function() {
      var a = A(1, 2, [3, 4], A([5, 6, 7]), 8, [9], [[10, 11], 12], [[[[13]]]]);

      expect(a.flatten()).toEqual(A(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13));
    });
  });

  describe('#compact', function() {
    it('returns a new array without `null` or `undefined` items', function() {
      expect(A(1,2,null,3,undefined,4,5).compact()).toEqual(A(1,2,3,4,5));
      expect(A(1,2,3).compact()).toEqual(A(1,2,3));
    });
  });

  describe('#uniq', function() {
    it('returns a new array without duplicate items', function() {
      var a = {}, b = {}, c = {}, d = {};
      expect(A(1,2,2,3,3,3,4,4,4,4,5,5,5,5,5).uniq()).toEqual(A(1,2,3,4,5));
      expect(A('foo', 'bar', 'foo', 'baz', 'bar', 'quux').uniq()).toEqual(A('foo', 'bar', 'baz', 'quux'));
      expect(A(a,b,c,b,a,d).uniq()).toEqual(A(a,b,c,d));
    });
  });

  describe('#sort', function() {
    describe('with no argument', function() {
      it('sorts the array by converting each element to a string and comparing them in Unicode point order', function() {
        expect(A('apples', 'bananas', 'Cherries').sort()).toEqual(A('Cherries', 'apples', 'bananas'));
        expect(A(1,2,10,21).sort()).toEqual(A(1,10,2,21));
        expect(A('word', 'Word', '1 Word', '2 Words').sort()).toEqual(A('1 Word', '2 Words', 'Word', 'word'));
      });
    });

    describe('with a compare function argument', function() {
      it('sorts the array according to the function', function() {
        var compareNumbers = function(a, b) { return a - b; };

        expect(A(4, 2, 11, 5, 1, 3).sort(compareNumbers)).toEqual(A(1, 2, 3, 4, 5, 11));
      });
    });

    it('sorts the array in place', function() {
      var a = A('the', 'quick', 'brown', 'fox');

      expect(a.sort()).toBe(a);
      expect(a).toEqual(A('brown', 'fox', 'quick', 'the'));
    });
  });
});
