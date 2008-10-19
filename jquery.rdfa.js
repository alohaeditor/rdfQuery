/*
 * jQuery RDFa @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *	jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/*global jQuery */
(function ($) {

	var 
		ns = {
			rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			xsd: "http://www.w3.org/2001/XMLSchema#"
		},

		rdfXMLLiteral = ns.rdf + 'XMLLiteral';

		hasAttribute = function (elem, attr) {
			if (/rev|rel|lang/.test(attr)) {
				return elem.attr(attr) !== undefined && elem.attr(attr) !== '';
			} else {
				return elem.attr(attr) !== undefined;
			}
		},

		resourceFromUri = function (uri) {
			return $.rdf.resource(uri);
		},
		
		resourceFromCurie = function (curie, elem) {
			if (curie.substring(0, 2) === '_:') {
				return $.rdf.blank(curie);
			} else {
				return resourceFromUri(elem.curie(curie));
			}
		},
		
		resourceFromSafeCurie = function (safeCurie, elem) {
			var m = /^\[([^\]]+)\]$/.exec(safeCurie);
			return m ? resourceFromCurie(m[1], elem) : resourceFromUri($.uri(safeCurie));
		},

		getObjectResource = function (elem) {
			var resource = elem.data('rdfa.objectResource');
			if (resource === undefined) {
				if (hasAttribute(elem, 'resource')) {
					resource = resourceFromSafeCurie(elem.attr('resource'), elem);
				}	else if (hasAttribute(elem, 'href')) {
					resource = resourceFromSafeCurie(elem.attr('href'), elem);
				} else if (hasAttribute(elem, 'rel') || hasAttribute(elem, 'rev')) {
					resource = $.rdf.blank('[]');
				}
				elem.data('rdfa.objectResource', resource);
			}
			return resource;
		},

		getSubject = function (elem) {
			var relation, subject = elem.data('rdfa.subject');
			if (subject === undefined) {
				relation = hasAttribute(elem, 'rel') || hasAttribute(elem, 'rev');
				if (hasAttribute(elem, 'about')) {
					subject = resourceFromSafeCurie(elem.attr('about'), elem);
				} else if (hasAttribute(elem, 'src')) {
					subject = resourceFromSafeCurie(elem.attr('src'), elem);
				} else if (!relation && hasAttribute(elem, 'resource')) {
					subject = resourceFromSafeCurie(elem.attr('resource'), elem);
				} else if (!relation && hasAttribute(elem, 'href')) {
					subject = resourceFromSafeCurie(elem.attr('href'), elem);
				} else if (elem.is('head') || elem.is('body')) {
					subject = $.rdf.resource('<>');
				} else if (hasAttribute(elem, 'typeof')) {
					subject = $.rdf.blank('[]');
				} else if (elem.parent().length > 0) {
					subject = getObjectResource(elem.parent()) || getSubject(elem.parent());
				} else {
					subject = $.rdf.resource('<>');
				}
				elem.data('rdfa.subject', subject);
			}
			return subject;
		},
		
		getLang = function (elem) {
			if (hasAttribute(elem, 'xml:lang')) {
				return elem.attr('xml:lang');
			} else if (hasAttribute(elem, 'lang')) { 
				return elem.attr('lang');
			} else if (elem.parent().length > 0) {
				return getLang(elem.parent());
			} else {
				return undefined;
			}
		},

		entity = function (c) {
			switch (c) {
			case '<': 
				return '&lt;';
			case '"': 
				return '&quot;';
			case '&': 
				return '&amp;';
			}
		},

		serialize = function (elem) {
			var string = '', e, atts, a, name, ns;
			elem.contents().each(function () {
				if ($(this).is('[nodeType=1]')) { // tests whether the node is an element
					e = $(this)[0];
					name = e.nodeName.toLowerCase();
					ns = $(this).xmlns('');
					atts = e.attributes;
					string += '<' + name;
					for (var i = 0; i < e.attributes.length; i += 1) {
						a = atts.item(i);
						string += ' ' + a.nodeName + '="';
						string += a.nodeValue.replace(/[<"&]/g, entity);
						string += '"';
					}
					if (ns !== undefined && $(this).attr('xmlns') === undefined) {
						string += ' xmlns="' + ns + '"';
					}
					string += '>';
					string += $(this).html();
					string += '</' + name + '>';
				} else {
					string += $(this)[0].nodeValue;
				}
			});
			return string;
		},
		
		rdfa = function (forward, backward) {
			var i, subject, value, resource, lang, datatype, types, object, triple, parent,
				properties = [], rels = [], revs = [], triples = [],
				local = this.data('rdfa.triples');
			forward = forward || [];
			backward = backward || [];
			if (forward.length > 0 || backward.length > 0) {
				subject = getSubject(this);
				parent = getSubject(this.parent());
				for (i = 0; i < forward.length; i += 1) {
					triple = $.rdf.triple(parent, forward[i], subject);
					triples.push(triple);
				}
				for (i = 0; i < backward.length; i += 1) {
					triple = $.rdf.triple(subject, backward[i], parent);
					triples.push(triple);
				}
			}
			if (local === undefined) {
				local = [];
				subject = getSubject(this);
				resource = getObjectResource(this);
				if (hasAttribute(this, 'typeof')) {
					types = $.trim(this.attr('typeof')).split(/\s+/);
					for (i = 0; i < types.length; i += 1) {
						triple = $.rdf.triple(subject, $.rdf.type, resourceFromCurie(types[i], this));
						local.push(triple);
					} 
				}
				if (hasAttribute(this, 'property')) {
					lang = getLang(this);
					if (hasAttribute(this, 'datatype') && this.attr('datatype') !== '') {
						datatype = this.curie(this.attr('datatype'));
						if (datatype === rdfXMLLiteral) {
							object = $.rdf.literal(serialize(this), { datatype: rdfXMLLiteral });
						} else if (this.attr('content') !== undefined) {
							object = $.rdf.literal(this.attr('content'), { datatype: datatype });
						} else {
							object = $.rdf.literal(this.text(), { datatype: datatype });
						}
					} else if (hasAttribute(this, 'content')) {
						if (lang === undefined) {
							object = $.rdf.literal('"' + this.attr('content') + '"');
						} else {
							object = $.rdf.literal(this.attr('content'), { lang: lang });
						}
					} else if (this.children('*').length === 0 ||
					           this.attr('datatype') === '') {
						if (lang === undefined) {
							object = $.rdf.literal('"' + this.text() + '"');
						} else {
							object = $.rdf.literal(this.text(), { lang: lang });
						}
					} else {
						object = $.rdf.literal(serialize(this), { datatype: rdfXMLLiteral });
					}
					properties = $.trim(this.attr('property')).split(/\s+/);
					for (i = 0; i < properties.length; i += 1) {
						triple = $.rdf.triple(subject, resourceFromCurie(properties[i], this), object);
						local.push(triple);
					}
				}
				if (hasAttribute(this, 'rel')) {
					rels = $.trim(this.attr('rel')).split(/\s+/);
					for (i = 0; i < rels.length; i += 1) {
						rels[i] = resourceFromCurie(rels[i], this);
					} 
				}
				if (hasAttribute(this, 'rev')) {
					revs = $.trim(this.attr('rev')).split(/\s+/);
					for (i = 0; i < revs.length; i += 1) {
						revs[i] = resourceFromCurie(revs[i], this);
					} 
				}
				if (hasAttribute(this, 'resource') || hasAttribute(this, 'href')) {
					// make the triples immediately
					for (i = 0; i < rels.length; i += 1) {
						triple = $.rdf.triple(subject, rels[i], resource);
						local.push(triple);
					}
					rels = [];
					for (i = 0; i < revs.length; i += 1) {
						triple = $.rdf.triple(resource, revs[i], subject);
						local.push(triple);
					}
					revs = [];
				}
				this.children().each(function () {
					local = local.concat(rdfa.call($(this), rels, revs));
				});
				this.data('rdfa.triples', local);
			}
			return triples.concat(local);
		},
		
		nsCounter = 1,
		
		createCurieAttr = function (elem, attr, uri) {
		  var m, curie;
		  try {
		    curie = elem.createCurie(uri);
		  } catch (e) {
		    if (uri.toString() === rdfXMLLiteral) {
		      elem.attr('xmlns:rdf', ns.rdf);
		      curie = 'rdf:XMLLiteral';
		    } else {
  		    m = /^(.+[\/#])([^#]+)$/.exec(uri);
  		    elem.attr('xmlns:ns' + nsCounter, m[1]);
  		    curie = 'ns' + nsCounter + ':' + m[2];
  		    nsCounter += 1;
		    }
		  }
		  elem.attr(attr, curie);
		},
		
		resetLang = function (elem, lang) {
      elem.wrapInner('<span></span>')
        .children('span')
        .attr('lang', lang);
      return elem;
		},
		
		addRDFa = function (triple) {
		  var content, lang, ns = this.xmlns();
      if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: ns, base: $.uri.base() });
      }
      if (triple.object.resource) {
        // TODO
      } else {
        createCurieAttr(this, 'property', triple.property.uri);
        content = this.text() !== triple.object.value;
        if (content) {
          if (triple.object.datatype && triple.object.datatype.toString() === rdfXMLLiteral) {
            this.html(triple.object.value);
          } else {
            this.attr('content', triple.object.value);
          }
        }
        lang = getLang(this);
        if (triple.object.lang) {
          if (lang !== triple.object.lang) {
            this.attr('lang', triple.object.lang);
            if (content) {
              resetLang(this, lang);
            }
          }
        } else if (triple.object.datatype) {
          createCurieAttr(this, 'datatype', triple.object.datatype);
        } else {
          // the empty datatype ensures that any child elements that might be added won't mess up this triple
          this.attr('datatype', '');
          // the empty lang ensures that a language won't be assigned to the literal
          if (lang !== undefined) {
            this.attr('lang', '');
            if (content) {
              resetLang(this, lang);
            }
          }
        }
      }
      return this;
		};

  $.fn.rdfa = function (triple) {
    if (triple === undefined) {
      var triples = $.map($(this), function (elem) {
        return rdfa.call($(elem));
      });
      return $.rdf(triples);
    } else {
      $(this).each(function () {
        addRDFa.call($(this), triple);
      });
      return this;
    }
  };

	$.rdf.gleaners.push(rdfa);

})(jQuery);
