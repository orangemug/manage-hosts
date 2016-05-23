var debug     = require("debug");
var fs        = require("fs-promise");
var spawn     = require("child-process-promise").spawn;
var tempWrite = require("temp-write");
var pify      = require("pify");
var pem       = pify(require("pem"));


function removeCert(commonName, done) {
  var promise = spawn("security", ["delete-certificate", "-c", commonName])
    .catch(function(err) {
      if(promise.childProcess.exitCode === 1) {
        console.log("No key to remove");
      }
      else {
        throw err;
      }
    })

  log(promise.childProcess)

  return promise;
}

function log(emitter) {
  emitter.stdout.on("data", function(data) {
    console.log("stdout: %s", data);
  });

  emitter.stderr.on("data", function(data) {
    console.log("stderr: $%s", data);
  });

  emitter.on("close", function(code) {
    console.log("child process exited with code %s", code);
  });
}

function insertCert(keys) {
  console.log("insertCert");
  return tempWrite(keys.certificate)
    .then(function(filepath) {
      var spawnOpts = [
        "add-trusted-cert",
        "-d",
        "-p",
        "ssl",
        "-k",
        process.env["HOME"]+"/Library/Keychains/login.keychain",
        filepath
      ];
      var promise = spawn("security", spawnOpts)

      console.log(filepath, spawnOpts);

      function removeFn() {
        console.log("cleanup");
        fs.unlinkSync(filepath)
      }

      process.on("exit",              removeFn);
      process.on("SIGINT",            removeFn);
      process.on("uncaughtException", removeFn);


      log(promise.childProcess)

      return promise
        .then(function() {
          if(code < 1) {
            throw "Arrrgh!"
          }
        })
        .catch(function() {})
        .then(function() {
          process.removeListener("exit",              removeFn);
          process.removeListener("SIGINT",            removeFn);
          process.removeListener("uncaughtException", removeFn);

          // Make sure we remove the file again...
          console.log("Remove");
          return fs.unlink(filepath)
            .then(function() {
              console.log("done", keys)
              return keys;
            });
        });
    });
}

function addCert(commonName, opts) {
  opts = Object.assign({
      days:1,
      commonName: commonName,
      altNames: [],
      selfSigned:true
  }, opts);

  console.log(opts);

  return pem
    .createCertificate(opts)
    .then(function(keys) {
      return insertCert(keys)
    });
}

module.exports = {
  add: addCert,
  remove: removeCert,
  replace: function(commonName, opts) {
    return removeCert("manage.hosts.cert")
      .then(function(cert) {
        return addCert(commonName, opts)
      })
      .catch(console.error)
  }
}
