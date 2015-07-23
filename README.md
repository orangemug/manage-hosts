# manage-hosts
Manage local apps and bind them to some urls via `/etc/hosts`. Whats neat is that apps can bind themselves via a REST protocol.

[![Build Status](https://travis-ci.org/orangemug/manage-hosts.svg?branch=master)](https://travis-ci.org/orangemug/manage-hosts)
[![Code Climate](https://codeclimate.com/github/orangemug/manage-hosts/badges/gpa.svg)](https://codeclimate.com/github/orangemug/manage-hosts) 
[![Dependency Status](https://david-dm.org/orangemug/manage-hosts.svg)](https://david-dm.org/orangemug/manage-hosts)
[![Dev Dependency Status](https://david-dm.org/orangemug/manage-hosts/dev-status.svg)](https://david-dm.org/orangemug/manage-hosts#info=devDependencies)


## Install
To install

    npm i git://github.com/orangemug/manage-hosts.git -g


## Usage
First off start the server

    sudo manage-hosts

This will start a server on your local machine on port `80` which will redirect requests to other servers via [bouncy](https://github.com/substack/bouncy).

### HTTP
The server has the following HTTP endpoints, to see what apps are running

    [GET] http://manage.hosts

To add an app, `POST` to the following where the key of the object is the `domain` and the value is the `ip:port`

    [PUT] http://manage.hosts
    {
      "some-domain.com": "0.0.0.0:4000"
    }

To remove an app `DELETE` with the same http body

    [DELETE] http://manage.hosts
    {
      "some-domain.com": "0.0.0.0:4000"
    }

### node.js
You can also require this module as a library in _node_.

    var manageHosts = require("manageHosts")();

You can also specify and address if it's not the default

    var manageHosts = require("manageHosts")("129.168.1.1:8080");

The API is as follows

 * `manageHosts#started(done)` - Is `manage.hosts` running?
 * `manageHosts#add(data, done)` - Add one/multiple mappings (same API as `POST`)
 * `manageHosts#remove(data, done)` - Remove one/multiple mappings (same API as `DELETE`)

For example use in an app see <example/test1.js>.

If you need to access the server via _node_ (although you shouldn't need to) `require("manage-hosts/server")`, see usage <bin/cli.js>


## Examples
To run the examples [install][#install] and then clone this repo and run

    node example/test1.js

On start `example/test1.js` will communicate with the server and setup its domain routing. You can see the mappings by going to <http://manage.hosts>. On exit of the process `example/test1.js` cleans up its routing using the `#remove` API method.


## License
MIT
