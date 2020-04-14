# TMT FITS Key Browser Web App (prototype)

This projects implements a web app for browsing FITS keywords.

The list of available keywords and related data is currently stored in 
[src/data/categories.json](src/data/categories.json). 

The available attributes for the detailed display are described in
[src/data/attributes.json](src/data/attributes.json).

To start the web app during development, make run:

    yarn start

then go to the URL displayed in the output (http://$hostname:3000).

You may need to install yarn first: See https://classic.yarnpkg.com/en/docs/install/#mac-stable.
