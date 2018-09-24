import model from '../res/model.js';

var controller = model; // No controller related stuff to add
export default controller;

// var listeners = [];

// export function observe(change, callback, request, params) {
//   listeners.push({
//     change: model[change], callback: callback, request: request, params: params
//   });
// }

// export function notify(change, ...value) {
//   model[change](value);
//   flush(model[change]);
// }

// export function flush(change) {
//   listeners.filter(l => change? l.change == change : true).map(
//     l => l.callback(model[l.request](l.params))
//   );
// }