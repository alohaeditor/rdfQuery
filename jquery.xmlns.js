/*
 * jQuery CURIE @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 */
/*global jQuery */
(function ($) {

  $.fn.xmlns = function (prefix, uri) {
    var 
      elem = this.eq(0),
      ns = elem.data('xmlns'),
      e = elem[0], a, p, i,
      decl = prefix ? 'xmlns:' + prefix : 'xmlns';
    if (uri === undefined) {
      if (prefix === undefined) { // get the in-scope declarations on the first element
        if (ns === undefined) {
          ns = {};
          for (i = 0; i < e.attributes.length; i += 1) {
            a = e.attributes.item(i);
            if (/^xmlns/.test(a.nodeName)) {
              prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
              ns[prefix] = $.uri(a.nodeValue);
            }
          }
          ns = $.extend({}, elem.parents().length > 0 ? elem.parent().xmlns() : {}, ns);
          elem.data('xmlns', ns);
        }
        return ns;
      } else if (typeof prefix === 'object') { // set the prefix mappings defined in the object
        for (p in prefix) {
          this.xmlns(p, prefix[p]);
        }
        this.find('*').andSelf().removeData('xmlns');
        return this;
      } else { // get the in-scope declaration associated with this prefix on the first element
        if (ns === undefined) {
          while (elem.parent().length > 0 && uri === undefined) {
            a = elem.attr(decl);
            if (a !== undefined) {
              uri = $.uri(a);
            }
            elem = elem.parent();
          }
          return uri;
        } else {
          return ns[prefix];
        }
      }
    } else { // set
      this.find('*').andSelf().removeData('xmlns');
      return this.attr(decl, uri);
    }
  };
  
  $.fn.removeXmlns = function (prefix) {
    var decl, p, i;
    if (typeof prefix === 'object') {
      if (prefix.length === undefined) { // assume an object representing namespaces
        for (p in prefix) {
          this.removeXmlns(p);
        }
      } else { // it's an array
        for (i = 0; i < prefix.length; i += 1) {
          this.removeXmlns(prefix[i]);
        }
      }
      return this;
    } else {
      decl = prefix ? 'xmlns:' + prefix : 'xmlns';
      return this.removeAttr(decl);
    }
  };

  $.fn.qname = function (name) {
    var 
      name = name || this[0].nodeName.toLowerCase(),
      m = /^(([^:]+):)?([^:]+)$/.exec(name),
      prefix = m[2] || '',
      namespace = this.xmlns(prefix);
    if (namespace === undefined && prefix !== '') {
      throw {
        name: "MalformedQName",
        message: "The prefix " + prefix + " is not declared"
      };
    }
    return {
      namespace: namespace,
      localPart: m[3],
      prefix: prefix,
      name: name
    };
  };

})(jQuery);
