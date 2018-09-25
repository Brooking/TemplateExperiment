import Model from '../res/model.js';

var model = new Model();

var listeners = [];

export function observe(change, callback, request) {
  listeners.push({
    change: model[change], callback: callback, request: request
  });
}

export function notify(change, value) {
  model[change](value);
  flush(model[change]);
}

function flush(change) {
  listeners.filter(l => change ? l.change == change : true).map(
    l => l.callback(model[l.request]())
  );
}

export function process(callback, request) {
  callback(model[request]());
}
