var JSON_HEAD = (function() {
  if (typeof window !== 'undefined' && window.JSON_HEAD) return window.JSON_HEAD;
  var obj = { "Content-Type": "application/json" };
  if (typeof window !== 'undefined') window.JSON_HEAD = obj;
  return obj;
})();

export default JSON_HEAD;