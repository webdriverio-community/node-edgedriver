# I haven't personally tested this WebDriver at all. This is pre-emptive.

EdgeDriver
=======

An NPM wrapper for Microsofts' Selenium [EdgeDriver](https://www.microsoft.com/en-us/download/details.aspx?id=48740).

[EdgeDriver changelog](https://dev.windows.com/en-us/microsoft-edge/platform/status/webdriver/details/)

Building and Installing
-----------------------

```shell
npm install edgedriver
```

Or grab the source and

```shell
node ./install.js
```

What this is really doing is just grabbing a particular "blessed" (by
this module) version of EdgeDriver. As new versions are released
and vetted, this module will be updated accordingly.

The package has been set up to fetch and run EdgeDriver for Windows.

Versioning
----------

The NPM package version tracks the version of edgedriver that will be installed,
with an additional build number that is used for revisions to the installer.

A Note on edgedriver
-------------------

EdgeDriver is not a library for NodeJS.

This is an _NPM wrapper_ and can be used to conveniently make EdgeDriver available
It is not a Node JS wrapper.

Contributing
------------

Questions, comments, bug reports, and pull requests are all welcome.  Submit them at
[the project on GitHub](https://github.com/barretts/node-edgedriver/).

Bug reports that include steps-to-reproduce (including code) are the
best. Even better, make them in the form of pull requests.

Author
------
[Barrett Sonntag](https://github.com/barretts)


Thanks to [Giovanni Bassi](https://github.com/giggio) for making the [ChromeDriver](https://github.com/giggio/node-chromedriver/) module this was based on.

License
-------

Licensed under the Apache License, Version 2.0.
