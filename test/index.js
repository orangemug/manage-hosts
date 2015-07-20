var lastAction;

var assert = require("assert");
var proxyquire = require("proxyquire");
var manageHostsServer = proxyquire("../server", {
  'etchosts': {
    add: function(id, obj, done) {
      lastAction = {
        type: "add",
        id: id,
        obj: obj
      };
      done();
    }
  }
});


describe('manage-hosts', function() {
  var manageHosts;
  var server;

  beforeEach(function(done) {
    server = manageHostsServer.start(0, function() {
      var addr = server.address();
      var addrStr = addr.address+":"+addr.port;
      manageHosts = require("../")(addrStr);
      done();
    });
  });

  afterEach(function(done) {
    server.close(done);
  })

  it('should add', function (done) {
    manageHosts.add({
      "test1.local": "12.34.56.78:3000"
    }, function() {
      try {
        assert.deepEqual(lastAction, {
          type: "add",
          id: "manage.hosts",
          obj: [
            {
              "domains": [
                "manage.hosts"
              ],
              "ip": "127.0.0.1"
            },
            {
              "domains": [
                "test1.local"
              ],
              "ip": "12.34.56.78"
            }
          ]
        });
      } catch(err) {
        done(err)
        return;
      }
      done();
    });
  });

  it('should remove', function (done) {
    manageHosts.add({
      "test1.local": "12.34.56.78:3000"
    }, function() {
      manageHosts.remove({
        "test1.local": "12.34.56.78:3000"
      }, function() {
        try {
          assert.deepEqual(lastAction, {
            type: "add",
            id: "manage.hosts",
            obj: [
              {
                "domains": [
                  "manage.hosts"
                ],
                "ip": "127.0.0.1"
              }
            ]
          });
        } catch(err) {
          done(err)
          return;
        }
        done();
      });
    });
  });

});

