// The K combinator
export function K(value) {
  return () => value;
}

// Creates a function that accesses the value at a given key on an object
// or an array.
export function prop(name) {
  return (object = {}) => object[name];
}

// A function that does nothing. The return value can also be used as
// a safe reference to the 'undefined' variable.
export function noop() {}
