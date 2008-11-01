/*
 * jQuery RDF @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 */
/*global jQuery */
(function ($) {

  var 
    memResource = {},
    memBlank = {},
    memLiteral = {},
    memTriple = {},
    xsdNs = "http://www.w3.org/2001/XMLSchema#",
    rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    uriRegex = /^<(([^>]|\\>)*)>$/,
    literalRegex = /^("""((\\"|[^"])*)"""|"((\\"|[^"])*)")(@([a-z]+(-[a-z0-9]+)*)|\^\^(.+))?$/,
    tripleRegex = /(("""((\\"|[^"])*)""")|("(\\"|[^"]|)*")|(<(\\>|[^>])*>)|\S)+/g,
    
    blankNodeSeed = new Date().getTime() % 1000,
    blankNodeID = function () {
      blankNodeSeed += 1;
      return 'b' + blankNodeSeed.toString(16);
    },
    
    subject = function (subject, opts) {
      if (typeof subject === 'string') {
        try {
          return $.rdf.resource(subject, opts);
        } catch (e) {
          try {
            return $.rdf.blank(subject, opts);
          } catch (f) {
            throw "Bad Triple: Subject " + subject + " is not a resource: " + f;
          }
        }
      } else {
        return subject;
      }
    },
    
    property = function (property, opts) {
      if (property === 'a') {
        return $.rdf.type;
      } else if (typeof property === 'string') {
        try {
          return $.rdf.resource(property, opts);
        } catch (e) {
          throw "Bad Triple: Property " + property + " is not a resource: " + e;
        }
      } else {
        return property;
      }
    },
    
    object = function (object, opts) {
      if (typeof object === 'string') {
        try {
          return $.rdf.resource(object, opts);
        } catch (e) {
          try {
            return $.rdf.blank(object, opts);
          } catch (f) {
            try {
              return $.rdf.literal(object, opts);
            } catch (g) {
              throw "Bad Triple: Object " + object + " is not a resource or a literal " + g;
            }
          }
        }
      } else {
        return object;
      }
    },
    
    parseFilter = function (filter, options) {
      var
         s, p, o,
         optional = options.optional || false,
        m = filter.match(tripleRegex);
      if (m.length === 3 || (m.length === 4) && m[3] === '.') {
        s = m[0];
        p = m[1];
        o = m[2];
        s = s.substring(0, 1) === '?' ? s.substring(1) : subject(s, options);
        p = p.substring(0, 1) === '?' ? p.substring(1) : property(p, options);
        o = o.substring(0, 1) === '?' ? o.substring(1) : object(o, options);
        return { subject: s, property: p, object: o, optional: optional };
      } else {
        throw "Malformed Filter: The filter " + filter + " is not legal";
      }
    },
    
    fillFilter = function (filter, bindings) {
      var f = $.extend({}, filter);
      if (typeof f.subject === 'string' &&
          bindings[f.subject]) {
        f.subject = bindings[f.subject];
      }
      if (typeof f.property === 'string' &&
          bindings[f.property]) {
        f.property = bindings[f.property];
      }
      if (typeof f.object === 'string' &&
          bindings[f.object]) {
        f.object = bindings[f.object];
      }
      return f;
    },
    
    testResource = function (resource, filter, existing) {
      if (typeof filter === 'string') {
        if (existing[filter] && existing[filter] !== resource) {
          return null;
        } else {
          existing[filter] = resource;
          return existing;
        }
      } else if (filter === resource) {
        return existing;
      } else {
        return null;
      }
    },
    
    testTriple = function (triple, filter) {
      var binding = {};
      binding = testResource(triple.subject, filter.subject, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.property, filter.property, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.object, filter.object, binding);
      return binding;
    },
    
    findTriples = function (triples, filter) {
      return $.map(triples, function (triple) {
        var bindings = testTriple(triple, filter);
        return bindings === null ? null : { bindings: bindings, triples: [triple] };
      });
    },
    
    mergeMatches = function (existingMs, newMs, optional) {
      return $.map(existingMs, function (existingM) {
        var compatibleMs = $.map(newMs, function (newM) {
          // For newM to be compatible with existingM, all the bindings
          // in newM must either be the same as in existingM, or not
          // exist in existingM
          var isCompatible = true;
          $.each(newM.bindings, function (k, b) {
            if (!(existingM.bindings[k] === undefined ||
                  existingM.bindings[k] === b)) {
              isCompatible = false;
              return false;
            }
          });
          return isCompatible ? newM : null;
        });
        if (compatibleMs.length > 0) {
          return $.map(compatibleMs, function (compatibleM) {
            return {
              bindings: $.extend({}, existingM.bindings, compatibleM.bindings), 
              triples: $.unique(existingM.triples.concat(compatibleM.triples))
            };
          });
        } else {
          return optional ? existingM : null;
        }
      });
    };
    
  $.typedValue.types['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'] = {
    regex: /^.*$/,
    strip: false,
    value: function (v) {
      return v;
    }
  };

  // Trying to follow jQuery's general pattern, to get the same effect
  $.rdf = function (triples, options) {
    return new $.rdf.fn.init(triples, options);
  };

  $.rdf.fn = $.rdf.prototype = {
    rdfquery: '0.1',
    
    init: function (triples, options) {
      var i;
      this.length = 0;
      this.tripleStore = [];
      this.baseURI = (options && options.base) || $.uri.base();
      this.namespaces = $.extend({}, (options && options.namespaces) || {});
      this.filters = [];
      this.previousMatches = [];
      this.outOfSync = false;
      this.union = [];
      triples = triples || [];
      for (i = 0; i < triples.length; i += 1) {
        this.add(triples[i]);
      }
      return this;
    },

    clone: function () {
      var clone = new $.rdf();
      clone.tripleStore = $.makeArray(this.tripleStore);
      clone.baseURI = this.baseURI;
      clone.namespaces = $.extend({}, this.namespaces);
      clone.filters = $.makeArray(this.filters);
      clone.union = $.makeArray(this.union);
      clone.length = 0;
      Array.prototype.push.apply(clone, $.makeArray(this));
      return clone;
    },

    base: function (base) {
      if (base === undefined) {
        return this.baseURI;
      } else {
        this.baseURI = base;
        return this;
      }
    },
  
    prefix: function (prefix, uri) {
      if (uri === undefined) {
        return this.namespaces[prefix];
      } else {
        this.namespaces[prefix] = uri;
        return this;
      }
    },
    
    add: function (triple, options) {
      var 
        rdf = this,
        template,
        includesOptionalFilter = false;
        base = (options && options.base) || this.baseURI,
        namespaces = $.extend({}, this.namespaces, (options && options.namespaces) || {}),
        replacement = [],
        matches = [];
       if (triple.rdfquery !== undefined) {
        // create a union
        if (this.filters.length > 0) {
          return $.rdf([this, triple]);
        } else {
          if (triple.filters.length > 0) {
            this.union.push(triple);
            Array.prototype.push.apply(this, $.makeArray(triple));
          } else {
            this.tripleStore = $.unique(this.tripleStore.concat(triple.tripleStore));
            $.extend(this.namespaces, triple.namespaces);
            $.extend(this.union, triple.union);
          }
          return this;
        }
      } else if (this.union.length > 0) {
        matches = $.map(this.union, function (rdf) {
          rdf.add(triple);
          return $.makeArray(rdf);
        });
        this.length = 0;
        Array.prototype.push.apply(this, matches);
        return this;
      } else {
        if (typeof triple === 'string') {
          template = parseFilter(triple, { namespaces: namespaces, base: base });
          if (typeof template.subject === 'string' ||
              typeof template.property === 'string' ||
              typeof template.object === 'string') {
            $.each(this, function (i, match) {
              var t, f = fillFilter(template, match.bindings);
              if (typeof f.subject === 'string' ||
                  typeof f.property === 'string' ||
                  typeof f.object === 'string') {
                throw "Malformed Template: Couldn't complete the template: " + f;
              } else {
                t = $.rdf.triple(f.subject, f.property, f.object, { source: triple });
                rdf.add(t);
              }
            });
            return this;
          } else {
            triple = $.rdf.triple(template.subject, template.property, template.object, { source: triple });
          }
        }
        if ($.inArray(triple, this.tripleStore) !== -1) {
          return this;
        }
        this.tripleStore.push(triple);
        if (this.previousMatches.length > 0) {
          this.outOfSync = true;
        }
        $.each(this.filters, function (i, filter) {
          var bindings, matchesA, matchesB, otherFilters, foundMatch, f, m, k;
          if (filter.optional) {
            includesOptionalFilter = true;
          }
          bindings = testTriple(triple, filter);
          if (bindings !== null) {
            matchesA = [{ bindings: bindings, triples: [triple] }];
            matchesB = [];
            otherFilters = rdf.filters.slice();
            otherFilters.splice(i, 1); // remove the matching filter from the set of filters
            while (otherFilters.length > 0) {
              foundMatch = true;
              $.each(matchesA, function (j, match) {
                matchesB = [];
                if ($.isFunction(otherFilters[0])) {
                  f = otherFilters[0];
                  if (f(match.bindings)) {
                    matchesB.push(match);
                  }
                  matchesA = matchesB;
                } else {
                  f = fillFilter(otherFilters[0], match.bindings);
                  m = findTriples(rdf.tripleStore, f);
                  if (m.length === 0) {
                    if (!f.optional) {
                      foundMatch = false;
                      return false; // break out of the $.each
                    }
                  } else {
                    for (k = 0; k < m.length; k += 1) {
                      matchesB.push({ 
                        bindings: $.extend({}, match.bindings, m[k].bindings), 
                        triples: match.triples.concat(m[k].triples)
                      });
                    }
                    matchesA = matchesB;
                  }
                }
              });
              if (foundMatch === false) {
                break; // break out of the while loop, not having added anything
              }
              otherFilters.splice(0, 1);
            }
            if (otherFilters.length === 0) {
              matches = matches.concat(matchesA);
            }
          }
        });
        if (includesOptionalFilter) {
          // Have to worry about the possibility of an existing match being "completed" by the new triple.
          // The new match will have been found by the above code, so it's a matter of removing any
          // existing matches that have been completed
          replacement = $.map(this, function (match) {
            var isCompleted = false;
            $.each(matches, function (j, newMatch) {
              var supersets = true;
              for (b in newMatch.bindings) {
                if (match.bindings[b] !== newMatch.bindings[b] && match.bindings[b] !== undefined) {
                  supersets = false;
                  break;
                }
              }
              if (supersets) {
                isCompleted = true;
                return false; // break out of the $.each()
              }
            });
            return isCompleted ? null : match;
          });
          replacement = replacement.concat(matches);
          this.length = 0;
          Array.prototype.push.apply(this, replacement);
        } else {
          Array.prototype.push.apply(this, matches);
        }
        return this;
      }
    },
    
    bindings: function () {
      return $($.map(this, function (match) {
        return match.bindings;
      }));
    },
    
    triples: function () {
      return $($.map(this, function (match) {
        return [match.triples]; // effectively returning an array of the array because otherwise arrays get flattened
      }));
    },
    
    where: function (filter, options) {
      var 
        base = (options && options.base) || this.baseURI,
        namespaces = $.extend({}, this.namespaces, (options && options.namespaces) || {}),
        optional = (options && options.optional) || false,
        matches = [];
      if (this.union.length > 0) {
        matches = $.map(this.union, function (rdf) {
          rdf.where(filter, { namespaces: namespaces, base: base, optional: optional } );
          return $.makeArray(rdf);
        });
      } else {
        filter = parseFilter(filter, { namespaces: namespaces, base: base, optional: optional } );
        this.filters.push(filter);
        matches = findTriples(this.tripleStore, filter);
        if (this.filters.length > 1) {
          matches = mergeMatches(this, matches, optional);
        }
      }
      this.previousMatches.push($.makeArray(this));
      this.length = 0;
      Array.prototype.push.apply(this, matches);
      return this;
    },
    
    optional: function (filter, options) {
      return this.where(filter, $.extend({}, options || {}, { optional: true }));
    },
    
    filter: function (binding, condition) {
      var func, matches = [];
      if (typeof binding === 'string') {
        if (condition.constructor === RegExp) {
          func = function (bindings) {
            return condition.test(bindings[binding].value);
          };
        } else {
          func = function (bindings) {
            return bindings[binding].literal ? bindings[binding].value === condition : bindings[binding] === condition;
          };
        }
      } else {
        func = binding;
      }
      if (this.union.length > 0) {
        matches = $.map(this.union, function (rdf) {
          rdf.filter(func);
          return $.makeArray(rdf);
        });
      } else {
        this.filters.push(func);
        matches = $.map(this, function (match) {
          return func(match.bindings) ? match : null;
        });
      }
      this.previousMatches.push($.makeArray(this));
      this.length = 0;
      Array.prototype.push.apply(this, matches);
      return this;
    },

    reset: function () {
      // retains the tripleStore, the baseURI and the namespace bindings only
      this.union = [];
      this.filters = [];
      this.previousMatches = [];
      this.outOfSync = false;
      this.length = 0;
      return this;
    },

    end: function () {
      var rdf = this, matches = [];
      if (this.union.length > 0) {
        matches = $.map(this.union, function (rdf) {
          rdf.end();
          return $.makeArray(rdf);
        });
      } else {
        this.filters.pop();
        if (this.outOfSync) {
          if (this.filters.length === 0) {
            this.outOfSync = false;
          } else {
            $.each(this.filters, function (i, filter) {
              var matchesFilter;
              if ($.isFunction(filter)) {
                matches = $.map(matches, function (match) {
                  return filter(match.bindings) ? match : null;
                });
              } else {
                matchesFilter = findTriples(rdf.tripleStore, filter);
                matches = i > 1 ? mergeMatches(matches, matchesFilter) : matchesFilter;
              }
            });
          }
        } else {
          matches = this.previousMatches.pop();
        }
      }
      this.length = 0;
      Array.prototype.push.apply(this, matches);
      return this;
    },

    size: function () {
      return this.length;
    },
    
    get: function (num) {
      return (num === undefined) ? $.makeArray(this) : this[num];
    },
    
    each: function (callback, args) {
      $.each(this, callback, args);
      return this;
    },
    
    map: function (callback) {
      return $($.map(this, function (match, i) {
  			return callback.call( match, i, match ); // in the callback, this is the match, and the arguments are swapped
  		}));
    },
    
    jquery: function () {
      return $(this);
    }
  };

  $.rdf.fn.init.prototype = $.rdf.fn;

  $.rdf.gleaners = [];

  $.fn.rdf = function () {
    var i, j, match, triples = [];
    for (i = 0; i < $(this).length; i += 1) {
      match = $(this).eq(i);
      for (j = 0; j < $.rdf.gleaners.length; j += 1) {
        triples = triples.concat($.rdf.gleaners[j].call(match));
      }
    }
    return $.rdf(triples, { namespaces: $(this).xmlns() });
  };

/*
 * Triples
 */

  $.rdf.triple = function (subject, property, object, options) {
    var triple, m;
    // using a two-argument version; first argument is a Turtle statement string
    if (object === undefined) { 
      options = property;
      m = $.trim(subject).match(tripleRegex);
      if (m.length === 3 || (m.length === 4 && m[3] === '.')) {
        subject = m[0];
        property = m[1];
        object = m[2];
      } else {
        throw "Bad Triple: Couldn't parse string " + subject;
      }
    }
    if (memTriple[subject] && memTriple[subject][property] && memTriple[subject][property][object]) {
      return memTriple[subject][property][object];
    }
    triple = new $.rdf.triple.fn.init(subject, property, object, options);
    if (memTriple[triple.subject] && 
        memTriple[triple.subject][triple.property] && 
        memTriple[triple.subject][triple.property][triple.object]) {
      return memTriple[triple.subject][triple.property][triple.object];
    } else {
      if (memTriple[triple.subject] === undefined) {
        memTriple[triple.subject] = {};
      }
      if (memTriple[triple.subject][triple.property] === undefined) {
        memTriple[triple.subject][triple.property] = {};
      }
      memTriple[triple.subject][triple.property][triple.object] = triple;
      return triple;
    }
  };

  $.rdf.triple.fn = $.rdf.triple.prototype = {
    init: function (s, p, o, options) {
      var opts, m;
      opts = $.extend({}, $.rdf.triple.defaults, options);
      this.subject = subject(s, opts);
      this.property = property(p, opts);
      this.object = object(o, opts);
      this.source = opts.source;
      return this;
    },
    
    toString: function () {
      return this.subject + ' ' + this.property + ' ' + this.object + ' .';
    }
  };

  $.rdf.triple.fn.init.prototype = $.rdf.triple.fn;
  
  $.rdf.triple.defaults = {
    base: $.uri.base(),
    source: [document],
    namespaces: {}
  };

/*
 * Resources
 */ 

  $.rdf.resource = function (value, options) {
    var resource;
    if (memResource[value]) {
      return memResource[value];
    }
    resource = new $.rdf.resource.fn.init(value, options);
    if (memResource[resource]) {
      return memResource[resource];
    } else {
      memResource[resource] = resource;
      return resource;
    }
  };

  $.rdf.resource.fn = $.rdf.resource.prototype = {
    resource: true,
    literal: false,
    uri: undefined,
    blank: false,
    
    init: function (value, options) {
      var m, prefix, uri, opts;
      if (typeof value === 'string') {
        m = uriRegex.exec(value);
        opts = $.extend({}, $.rdf.resource.defaults, options);
        if (m !== null) {
          this.uri = $.uri.resolve(m[1].replace(/\\>/g, '>'), opts.base);
        } else if (value.substring(0, 1) === ':') {
          uri = opts.namespaces[''];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for default namespace in " + value;
          } else {
            this.uri = $.uri.resolve(uri + value.substring(1));
          }
        } else if (value.substring(value.length - 1) === ':') {
          prefix = value.substring(0, value.length - 1);
          uri = opts.namespaces[prefix];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for prefix " + prefix + " in " + value;
          } else {
            this.uri = $.uri.resolve(uri);
          }
        } else {
          try {
            this.uri = $.curie(value, { namespaces: opts.namespaces });
          } catch (e) {
            throw "Malformed Resource: Bad format for resource " + e;
          }
        }
      } else {
        this.uri = value;
      }
      return this;
    }, // end init
    
    toString: function () {
      return '<' + this.uri + '>';
    }
  };

  $.rdf.resource.fn.init.prototype = $.rdf.resource.fn;
  
  $.rdf.resource.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  $.rdf.type = $.rdf.resource('<' + rdfNs + 'type>');
  $.rdf.label = $.rdf.resource('<' + rdfNs + 'label>');

  $.rdf.blank = function (value, options) {
    var blank;
    if (memBlank[value]) {
      return memBlank[value];
    }
    blank = new $.rdf.blank.fn.init(value, options);
    if (memBlank[blank]) {
      return memBlank[blank];
    } else {
      memBlank[blank] = blank;
      return blank;
    }
  };
  
  $.rdf.blank.fn = $.rdf.blank.prototype = {
    resource: true,
    literal: false,
    blank: true,
    id: undefined,
    
    init: function (value, options) {
      if (value === '[]') {
        this.id = blankNodeID();
      } else if (value.substring(0, 2) === '_:') {
        this.id = value.substring(2);
      } else {
        throw "Malformed Blank Node: " + value + " is not a legal format for a blank node";
      }
      return this;
    },
    
    toString: function () {
      return '_:' + this.id;
    }
  };

  $.rdf.blank.fn.init.prototype = $.rdf.blank.fn;

  $.rdf.literal = function (value, options) {
    var literal;
    if (memLiteral[value]) {
      return memLiteral[value];
    }
    literal = new $.rdf.literal.fn.init(value, options);
    if (memLiteral[literal]) {
      return memLiteral[literal];
    } else {
      memLiteral[literal] = literal;
      return literal;
    }
  };

  $.rdf.literal.fn = $.rdf.literal.prototype = {
    resource: false,
    literal: true,
    blank: false,
    value: undefined,
    lang: undefined,
    datatype: undefined,
    
    init: function (value, options) {
      var 
        m, datatype,
        opts = $.extend({}, $.rdf.literal.defaults, options);
      if (opts.lang !== undefined && opts.datatype !== undefined) {
        throw "Malformed Literal: Cannot define both a language and a datatype for a literal (" + value + ")";
      }
      if (opts.datatype !== undefined) {
        datatype = $.safeCurie(opts.datatype, { namespaces: opts.namespaces });
        $.extend(this, $.typedValue(value.toString(), datatype));
      } else if (opts.lang !== undefined) {
        this.value = value.toString();
        this.lang = opts.lang;
      } else if (typeof value === 'boolean') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'boolean'));
      } else if (typeof value === 'number') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'double'));
      } else if (value === 'true' || value === 'false') {
        $.extend(this, $.typedValue(value, xsdNs + 'boolean'));
      } else if ($.typedValue.valid(value, xsdNs + 'integer')) {
        $.extend(this, $.typedValue(value, xsdNs + 'integer'));
      } else if ($.typedValue.valid(value, xsdNs + 'decimal')) {
        $.extend(this, $.typedValue(value, xsdNs + 'decimal'));
      } else if ($.typedValue.valid(value, xsdNs + 'double') &&
                 !/^\s*([\-\+]?INF|NaN)\s*$/.test(value)) {  // INF, -INF and NaN aren't valid literals in Turtle
        $.extend(this, $.typedValue(value, xsdNs + 'double'));
      } else {
        m = literalRegex.exec(value);
        if (m !== null) {
          this.value = (m[2] || m[4]).replace(/\\"/g, '"');
          if (m[9]) {
            datatype = $.rdf.resource(m[9], opts);
            $.extend(this, $.typedValue(this.value, datatype.uri));
          } else if (m[7]) {
            this.lang = m[7];
          }
        } else {
          throw "Malformed Literal: Couldn't recognise the value " + value;
        }
      }
      return this;
    }, // end init
    
    toString: function () {
      var val = '"' + this.value + '"';
      if (this.lang !== undefined) {
        val += '@' + this.lang;
      } else if (this.datatype !== undefined) {
        val += '^^<' + this.datatype + '>';
      }
      return val;
    }
  };

  $.rdf.literal.fn.init.prototype = $.rdf.literal.fn;
  
  $.rdf.literal.defaults = {
    base: $.uri.base(),
    namespaces: {},
    datatype: undefined,
    lang: undefined
  };

})(jQuery);
