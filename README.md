# manage-hosts (WIP)
Manage local apps and bind them to some urls via `/etc/hosts`. Whats neat is that apps can bind themselves via a REST protocol.


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
You can also require this module as a library in _node_. The API is as follows

 * `#started(done)` - Is `manage.hosts` running?
 * `#add(data, done)` - Add one/multiple mappings (same API as `POST`)
 * `#remove(data, done)` - Remove one/multiple mappings (same API as `DELETE`)

For example use in an app see <example/test1.js>


## Examples
To run the examples [install][#install] and then clone this repo and run

    node example/test1.js

On start `test1.js` will communicate with the server and setup its domain routing. You can see the mappings by going to <http://manage.hosts>. On exit of the process `test1.js` cleans up its routing using the `#remove` API method.


## License
MIT
