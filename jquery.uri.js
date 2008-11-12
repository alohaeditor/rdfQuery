/*
 * jQuery URIs @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 */
/*global jQuery */
(function ($) {

	var
		mem = {},
		uriRegex = /^(?:([a-z][\-a-z0-9+\.]*):)?(?:\/\/([^\/?#]+))?([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i,
		schemeRegex = /^([a-z][\-a-z0-9+\.]*):(.+)$/i,
		authorityRegex = /^\/\/([^\/?#]+)(.*)$/,
		pathRegex = /^([^?#]*)(.*)$/,
		queryRegex = /^\?([^#]*)(.*)$/,
		fragmentRegex = /^#(.*)$/,
		docURI,

    parseURI = function (u) {
      var m = u.match(uriRegex);
      if (m === null) {
        throw "Malformed URI: " + u;
      }
      return {
        scheme: m[1] ? m[1].toLowerCase() : undefined,
        authority: m[2],
        path: m[3] || '',
        query: m[4],
        fragment: m[5]
      };
    },

		scheme = function (u) {
			var m = schemeRegex.exec(u);
			if (m === null) {
				throw {
					name: 'MalformedURI',
					message: 'Bad scheme in "' + u + '"'
				};
			}
			return {
				scheme: m[1].toLowerCase(),
				rest: m[2]
			};
		},

		authority = function (u) {
			var m = authorityRegex.exec(u);
			if (m === null) {
				return {
					rest: u
				};
			}
			return {
				authority: m[1],
				rest: m[2]
			};
		},

		path = function (u) {
		  if (typeof u === 'string') {
  			var m = u.match(pathRegex);
  			return {
  				path: m[1],
  				rest: m[2]
  			};
		  } else {
		    throw {
		      name: 'MalformedURI',
		      message: 'Could not parse "' + '"'
		    };
		  }
		},

		query = function (u) {
			var m = queryRegex.exec(u);
			if (m === null) {
				return {
					rest: u
				};
			}
			return {
				query: m[1],
				rest: m[2]
			};
		},

		fragment = function (u) {
			var m = fragmentRegex.exec(u);
			return m === null ? undefined : m[1];
		},

		removeDotSegments = function (u) {
			var r = '', m = [];
			if (/\./.test(u)) {
  			while (u !== undefined && u !== '') {
  				if (u === '.' || u === '..') {
  					u = '';
  				} else if (/^\.\.\//.test(u)) { // starts with ../
  					u = u.substring(3);
  				} else if (/^\.\//.test(u)) { // starts with ./
  					u = u.substring(2);
  				} else if (/^\/\.(\/|$)/.test(u)) { // starts with /./ or consists of /.
  					u = '/' + u.substring(3);
  				} else if (/^\/\.\.(\/|$)/.test(u)) { // starts with /../ or consists of /..
  					u = '/' + u.substring(4);
  					r = r.replace(/\/?[^\/]+$/, '');
  				} else {
  					m = u.match(/^(\/?[^\/]*)(\/.*)?$/);
  					u = m[2];
  					r = r + m[1];
  				}
  			}
  			return r;
			} else {
			  return u;
			}
		},

		merge = function (b, r) {
			if (b.authority !== '' && (b.path === undefined || b.path === '')) {
				return '/' + r;
			} else {
				return b.path.replace(/[^\/]+$/, '') + r;
			}
		};

	$.uri = function (relative, base) {
	  var uri;
		relative = relative || '';
		if (mem[relative]) {
			return mem[relative];
		}
		base = base || $.uri.base();
		if (typeof base === 'string') {
			base = $.uri.absolute(base);
		}
		uri = new $.uri.fn.init(relative, base);
		if (mem[uri]) {
			return mem[uri];
		} else {
			mem[uri] = uri;
			return uri;
		}
	};

	$.uri.fn = $.uri.prototype = {
		init: function (relative, base) {
			var r = {};
			base = base || {};
			$.extend(this, parseURI(relative));
			if (this.scheme === undefined) {
				this.scheme = base.scheme;
				if (this.authority !== undefined) {
					this.path = removeDotSegments(this.path);
				} else {
					this.authority = base.authority;
					if (this.path === '') {
						this.path = base.path;
						if (this.query === undefined) {
							this.query = base.query;
						}
					} else {
						if (!/^\//.test(this.path)) {
							this.path = merge(base, this.path);
						}
						this.path = removeDotSegments(this.path);
					}
				}
			}
			if (this.scheme === undefined) {
				throw "Malformed URI: URI is not an absolute URI and no base supplied: " + relative;
			}
			return this;
		},
	
		resolve: function (relative) {
			return $.uri(relative, this);
		},
		
		relative: function (absolute) {
		  var aPath, bPath, i = 0, j, resultPath = [], result = '';
		  if (typeof absolute === 'string') {
		    absolute = $.uri(absolute, {});
		  }
		  if (absolute.scheme !== this.scheme || 
		      absolute.authority !== this.authority) {
		    return absolute.toString();
		  }
		  if (absolute.path !== this.path) {
		    aPath = absolute.path.split('/');
		    bPath = this.path.split('/');
		    if (aPath[1] !== bPath[1]) {
		      result = absolute.path;
		    } else {
		      while (aPath[i] === bPath[i]) {
		        i += 1;
		      }
		      j = i;
		      for (; i < bPath.length - 1; i += 1) {
		        resultPath.push('..');
		      }
		      for (; j < aPath.length; j += 1) {
		        resultPath.push(aPath[j]);
		      }
		      result = resultPath.join('/');
		    }
		    result = absolute.query === undefined ? result : result + '?' + absolute.query;
		    result = absolute.fragment === undefined ? result : result + '#' + absolute.fragment;
		    return result;
		  }
		  if (absolute.query !== undefined && absolute.query !== this.query) {
		    return '?' + absolute.query + (absolute.fragment === undefined ? '' : '#' + absolute.fragment);
		  }
		  if (absolute.fragment !== undefined && absolute.fragment !== this.fragment) {
		    return '#' + absolute.fragment;
		  }
		  return '';
		},
	
		toString: function () {
			var result = '';
			result = this.scheme === undefined ? result : result + this.scheme + ':';
			result = this.authority === undefined ? result : result + '//' + this.authority;
			result = result + this.path;
			result = this.query === undefined ? result : result + '?' + this.query;
			result = this.fragment === undefined ? result : result + '#' + this.fragment;
			return result;
		}
	
	};

	$.uri.fn.init.prototype = $.uri.fn;

	$.uri.absolute = function (uri) {
		return $.uri(uri, {});
	};

	$.uri.resolve = function (relative, base) {
		return $.uri(relative, base);
	};
	
	$.uri.relative = function (absolute, base) {
	  return $.uri(base, {}).relative(absolute);
	};
	
	docURI = $.uri.absolute(document.URL);
	
	$.uri.base = function () {
	  var base = $('head > base').attr('href');
  	return base === undefined ? docURI : $.uri(base, docURI);
	};

})(jQuery);
