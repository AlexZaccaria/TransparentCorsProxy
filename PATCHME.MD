node_modules\cors-anywhere\lib\cors-anywhere.js
===============================================

var modifyResponse = require('http-proxy-response-rewrite');
var bodyModifier = require('./../../../bodyModifier');  
  
  proxy.on('proxyRes', function (proxyRes, req, res) {
    var type = proxyRes.headers['content-type'];

    if (type && (type.search('html') !== -1 || type.search('javascript') !== -1 || type.search('css') !== -1)) {
      var myReq = req.corsAnywhereRequestState;
      var myProxy = myReq.proxyBaseUrl;
      var myUrl = myReq.location.href;
      var myHost = myUrl.substring(0, myUrl.lastIndexOf("/")) + "/";
      var fileName = myUrl.split("/").pop();

      modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
        if (body) {
          return bodyModifier.modify(body, myProxy, myHost, fileName);
        }
        return body;
      });
    }
  });