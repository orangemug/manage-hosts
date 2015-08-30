var IS_BROWSER = (
  typeof(window) !== "undefined" && this === window
);

function is(_env) {
  return _env === get();
}

function get() {
  // Just default to 'development'
  return process.env || "development";
}

function isBrowser() {
  return IS_BROWSER;
}

module.exports = {
  is: is,
  get: get,
  isBrowser: isBrowser
};
