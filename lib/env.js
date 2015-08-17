function check(_env) {
  return _env === get();
}

function get() {
  // Just default to 'development'
  return process.env || "development";
}

function isBrowser() {
  return (
    typeof(window) !== "undefined"
  );
}

module.exports = {
  check: check.
  get: get,
  isBrowser: isBrowser
};
