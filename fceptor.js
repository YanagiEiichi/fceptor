/**/ void function(scope) {
/**/ 
/**/   // CommonJS
/**/   if (typeof module === 'object' && !!module.exports) return scope(function(name, dependencies, factory) {
/**/     if(factory === void 0) factory = dependencies, dependencies = [];
/**/     var args;
/**/     args = [  ];
/**/     module.exports = factory.apply(module.exports, args) || module.exports;
/**/   });
/**/ 
/**/   // AMD, wrap a 'String' to avoid warn of fucking webpack
/**/   if (String(typeof define) === 'function' && !!define.amd) return scope(define);
/**/ 
/**/   // Global
/**/   scope(function(name, dependencies, factory) {
/**/     if(factory === void 0) factory = dependencies, dependencies = [];
/**/     /**/ try { /* Fuck IE8- */
/**/     /**/   if(typeof execScript === 'object') execScript('var ' + name);
/**/     /**/ } catch(error) {}
/**/     window[name] = {}; 
/**/     var args = [];
/**/     for(var i = 0; i < dependencies.length; i++) args[i] = window[dependencies[i]];
/**/     window[name] = factory.apply(window[name], args) || window[name];
/**/   });
/**/ 
/**/ }(function(define) {

/**/ define('FCeptor', function() { /**/

'use strict';

var fetch = window.fetch || function() {};

// Avoid duplicate runing
if(fetch.FCeptor) return fetch.FCeptor;

// Handlers internal class
var Handlers = function() {};
// To use equivalence Checking
Handlers.check = function(what, value) {
  // Note, use a '==' here, match 'null' or 'undefined'
  if(what == null || what === value) return true;
  // Check 'test' method, match RegExp or RegExp-like
  if(typeof what.test === 'function') return what.test(value);
  if(typeof what === 'function') return what(value);
}
Handlers.prototype = [];
Handlers.prototype.solve = function(ctx) {
  var handlers = this;
  return new Promise(function(resolve, reject) {
    // This is an asynchronous recursion to traverse handlers
    var iterator = function(cursor) {
      // This is an asynchronous recursion to resolve thenable resolve
      var fixResule = function(result) {
        switch(true) {
          case result === true: return resolve();
          case result === false: return reject();
          // Resolve recursively thenable result
          case result && typeof result.then === 'function':
            return result.then(fixResule, function(error) { throw error; });
          default: iterator(cursor + 1);
        }
      };
      if(cursor < handlers.length) {
        fixResule(handlers[cursor](ctx));
      } else {
        resolve();
      }
    };
    iterator(0);
  });
};
Handlers.prototype.add = function(handler, method, route) {
  if(typeof handler !== 'function') return;
  this.push(function(ctx) {
    if(Handlers.check(method, ctx.request.method) && Handlers.check(route, ctx.request.url)) {
      return handler(ctx);
    }
  });
};

// Create two handlers objects
var requestHandlers = new Handlers();
var responseHandlers = new Handlers();

// Save original XMLHttpRequest class
var originalFetch = fetch;

fetch = window.fetch = function(input, init) {
  var request = new Request(input, init);
  var ctx = { request: request, response: null };
  return requestHandlers.solve(ctx).then(function() {
    return originalFetch(ctx.request).then(function(response) {
      ctx.response = response;
    }, function(error) {
      ctx.error = error;
    });
  }, function() {
    if (!ctx.response) ctx.response = new Response();
  }).then(function() {
    return responseHandlers.solve(ctx);
  }).then(function() {
    if (ctx.response) {
      return ctx.response;
    } else {
      throw ctx.error;
    }
  }, function() {
    return new Promise(function() {}); // Ignore
  });
};

var FCeptor = new function() {
  var that = this;
  this.when = function(method, route, requestHandler, responseHandler) {
    requestHandlers.add(requestHandler, method, route);
    responseHandlers.add(responseHandler, method, route);
  };
  void function() {
    var methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD' ];
    for(var i = 0; i < methods.length; i++) void function(method) {
      that[method.toLowerCase()] = function() {
        var args = Array.prototype.slice.call(arguments);
        return that.when.apply(that, [method].concat(args));
      };
    }(methods[i]);
  }();
};

return fetch.FCeptor = FCeptor;

/**/ }); /**/

/**/ });
