Changelog
-------

## Nodeshot-renderer
  * 0.3.2 Fixed bug resolving the cache folder
  * 0.3.1 Added a `globaltimeout` to cancel a job if it takes to long.
  * 0.3.0 Complete redesign. Using `kue` as a job queue. Seperated the express app from the `node-webkit` app.

## Nodeshot-server
  * 0.3.1 Remove a pendingJob if it has failed.
  * 0.3.0 Complete redesign. Using `kue` as a job queue. Seperated the express app from the `node-webkit` app.


## Old
  * 0.2.0 Rewrote the `ScrenshotApi.js` and added a `fullpage` flag.
  * 0.1.9 Fix a bug introduced in 0.1.7
  * 0.1.8 Add CORS middleware to enable cors for all routes.
  * 0.1.7 Assume `http` if no protocol is passed in. Add validation of callback url.
  * 0.1.6 Restructured `default.yaml`. Unified reading of options from URL. Added `/options` route.
  * 0.1.5 Quickfix: remove scrollbars works now
  * 0.1.4 Add [winstone](https://github.com/flatiron/winston) as logging system
  * 0.1.3 Add option to remove scrollbars from rendering.
  * 0.1.2 Fixed an issue where a page run into a timout because some iframes blocket rendering
  * 0.1.1 Fixed an issue where you couldn't create screenshots for pages containing iframes
  * 0.1.0 Inital release