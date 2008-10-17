/*
 * jQuery CURIE @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *	jquery.uri.js
 *  jquery.xmlns.js
 */
/*global jQuery */
(function ($) {
	
	$.curie = function (curie, options) {
		var 
			opts = $.extend({}, $.curie.defaults, options || {}),
			m = /^(([^:]*):)?(.+)$/.exec(curie),
			prefix = m[2],
			local = m[3],
			ns = opts.namespaces[prefix];
		if (prefix) {
			if (ns === undefined) {
				throw {
					name: "MalformedCURIE",
					message: "No namespace binding for " + prefix
				};
			} else {
				return $.uri(ns + local);
			}
		} else if (opts.reserved.length && $.inArray(curie, opts.reserved) >= 0) {
			// this looks at the curie as a whole; :alternate wouldn't count as a reserved word
			return $.uri(opts.reservedNamespace + curie);
		} else if (opts.defaultNamespace === undefined) {
			// the default namespace is provided by the application; it's not clear whether
			// the default XML namespace should be used if there's a colon but no prefix
			throw {
				name: "MalformedCURIE",
				message: "No prefix, and no default namespace for unprefixed values"
			};
		} else {
			return $.uri(opts.defaultNamespace + local);
		}
	};
	
	$.curie.defaults = {
		namespaces: {},
		reserved: [],
		reservedNamespace: undefined,
		defaultNamespace: undefined
	};
	
	$.safeCurie = function (safeCurie, options) {
		var m = /^\[([^\]]+)\]$/.exec(safeCurie);
		return m ? $.curie(m[1], options) : $.uri(safeCurie);
	};

	$.fn.curie = function (curie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.curie(curie, opts);
	};
	
	$.fn.safeCurie = function (safeCurie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.safeCurie(safeCurie, opts);
	}

	$.fn.curie.defaults = {
		reserved: [
			'alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright', 
			'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
			'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up'
		],
		reservedNamespace: 'http://www.w3.org/1999/xhtml/vocab#',
		defaultNamespace: undefined
	};
	
	$.fn.safeCurie = function (safeCurie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.safeCurie(safeCurie, opts);
	};

})(jQuery);
