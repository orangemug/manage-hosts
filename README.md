# manage-hosts
![stability-experimental](https://img.shields.io/badge/stability-experimental-orange.svg)

Manage local apps and bind them to some urls via `/etc/hosts`. Whats neat is that apps can bind themselves via a REST protocol. The main use case for this is the sharing of cookies across individual apps using a top level domain. For example say you had the following domains

 * `api.example.local`
 * `admin.example.local`
 * `app.example.local`

You can share a session cookie across these domains by setting `Domain=.example.local`, but setting nginx/apache on each devleopers machine to route these seems overly complicated. This libraries aim is to make it simple to set this up in a development environment.

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

This will start a server on your local machine on port `80` which will redirect requests to other servers via [node-http-proxy](https://github.com/nodejitsu/node-http-proxy).


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

You'll also probably have some services running inside VMs such as vagrant. They won't route via `/etc/hosts` so you won't be able to use the domain directly, however you can hit a special route

    [METHOD] http://[manage-hosts-ip]/goto/http://api.example.local/path

Where `api.example.local/path` is where you want the request routed to and `[manage-hosts-ip]` is the ip of the host machine where _manage-hosts_ is running.


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


## How do access my apps with an mobile device?
You've probably realised that because we're using `etc/hosts` this is only accessible on the host machine, which means you can't access on a mobile device. However if you use <http://www.charlesproxy.com/> you can... yay! The details on how to do this are [here](http://www.charlesproxy.com/documentation/faqs/using-charles-from-an-iphone/)


## License
[MIT](LICENSE)
