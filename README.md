# bouncy-manager (WIP)
Manager for bouncy to host local apps.


## Install
To install

    npm i git://github.com/orangemug/bouncy-manager.git -g


## Usage
To use as a server

    sudo bouncy-manager

To use in an app

    var bouncyMgr = require("bouncy-manager");
    bouncyMgr.add({
      "testapp.dev": "127.0.0.1"
    });

Then on app close

    bouncyMgr.remove(["testapp.dev"])

Or

    bouncyMgr.remove({
      "testapp.dev": "127.0.0.1"
    });

To see any apps currently running just hit <http://bouncy.api>


