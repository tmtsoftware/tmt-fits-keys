# TMT FITS Key Browser Web App (prototype)

This projects implements a web app for browsing FITS keywords.

The list of available keywords and related data is currently stored in 
[src/data/dictionary.json](src/data/dictionary.json). 

The available attributes for the detailed display are described in
[src/data/attributes.json](src/data/attributes.json).

For each supported TMT instrument, there is also a JSON file under src/data.
These files only contain a reference to the keys in the dictionary that should be included in a FITS header.

To start the web app during development, make run:

    yarn start

which opens a browser window with the web app (http://$hostname:3000).

You may need to install [nodejs](https://nodejs.org/en/) 
and/or [yarn](https://classic.yarnpkg.com/en/) first: 
See [here](https://classic.yarnpkg.com/en/docs/install/) for instructions on installing yarn.

Here are the versions used during development:

* yarn: 1.22.4
* node: v12.16.2

