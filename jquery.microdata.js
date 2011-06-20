/*
 * jQuery Microdata @VERSION
 *
 * Copyright (c) 2011 Sebastian Germesin
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/**
 * @fileOverview jQuery Microdata processing
 * @author <a href="mailto:neogermi@googlemail.com">Sebastian Germesin</a>
 * @copyright (c) 2008,2009 Sebastian Germesin
 * @license MIT license (MIT-LICENSE.txt)
 * @version 1.0
 * @requires jquery.uri.js
 * @requires jquery.xmlns.js
 * @requires jquery.curie.js
 * @requires jquery.datatype.js
 * @requires jquery.rdf.js
 */
(function ($) {

  var
    ns = {
        schema: "http://schema.org/"
    },
    
    getSubjectFromElement = function () {
        if (this.attr('itemid')) {
            return $.rdf.resource('<' + this.attr('itemid') + '>');
        } else {
            return $.rdf.blank('[]');
        }
    },
    
    getTypeFromElement = function () {
        var type = this.attr('itemtype');
        if (type) {
            return $.rdf.resource('<' + type + '>');
        } else {
      //TODO: implement me
            return $.rdf.resource('<' + ns.schema + 'Thing>');
        }
    },
    
    getPropertyFromElement = function () {
        var prop = this.attr('itemprop');
        if (prop) {
      //TODO: implement me
            return $.rdf.resource('<' + ns.schema + prop + '>');
        } 
        return undefined;
    },
    
    resolveURL = function (str) {
      //TODO: implement me
      return '<' + str + '>';  
    },
    
    getValueFromElement = function () {
        var tag = this.get(0).nodeName.toLowerCase();
        var value;
        if (tag === 'meta') {
            return $.rdf.literal(this.attr('content') === undefined ? '""' : this.attr('content'));
        } else if (tag === 'audio' || 
            tag === 'embed' || 
            tag === 'iframe' || 
            tag === 'img' || 
            tag === 'source' || 
            tag === 'track' || 
            tag === 'video') {
                if (this.attr('src')) {
                    return $.rdf.resource(resolveURL(this.attr('src')));
                } else {
                   return $.rdf.resource('<>');
                }
        } else if (tag === 'a' || 
            tag === 'area' || 
            tag === 'link') {
                if (this.attr('href')) {
                    return $.rdf.resource(resolveURL(this.attr('href')));
                } else {
                   return $.rdf.resource('<>');
                }
        } else if (tag === 'object') {
                if (this.attr('data')) {
                    return $.rdf.resource(resolveURL(this.attr('data')));
                } else {
                   return $.rdf.resource('<>');
                }
        } else if (tag === 'time' && this.attr('datetime') !== undefined) {
           if (this.attr('datetime')) {
                return $.rdf.literal('"' + this.attr('datetime') + '"');
            } else {
               return $.rdf.literal('""');
            }
        } else {
            return $.rdf.literal('"' + this.text() + '"');
        }
    },
    
    extractProperties = function (context) {
        var triples = [];
                
        //there are two types of properties
        // (1 - the easy ones): literals
        var property = getPropertyFromElement.call(this);
        if (property !== undefined) {
            if (this.attr('itemscope') === undefined) {
                var value = getValueFromElement.call(this);
                
                var triple = $.rdf.triple(
                    context.subject,
                    property,
                    value, {namespaces: ns});
                
                triples.push(triple);
            }
            else {
                // (2 - the more complex ones): resources
                //recursively call extractResource to parse the triples
                                
                var res = extractResource.call(this, {
                    subject: context.subject,
                    property: property
                });
                triples = triples.concat(res.triples);
                return triples;
            }
        }
        
        //search for children with properties
        var propertyTriples = $.map(this.children(), function (elem) {
            return extractProperties.call($(elem), context);
        });
        triples = triples.concat(propertyTriples);
        return triples;
    },
    
    extractResource = function (context) {
        var triples = [];
        
        if (!context) {
            context =  {};
        }
        
        var subject = getSubjectFromElement.call(this);
        //add possible back-reference
        if (context.subject && context.property) {
            triples.push(
                $.rdf.triple(
                    context.subject, 
                    context.property, 
                    subject, {namespaces: ns}));
        }
       
       
        //get type of element
        var type = getTypeFromElement.call(this);
        triples.push(
                $.rdf.triple(
                    subject, 
                    $.rdf.type, 
                    type, {namespaces: ns}));
       
       //query for referenced items and add triples recursively
        if (this.attr('itemref') !== undefined) {
            var selector = $.map(this.attr('itemref').split(" "), 
            function (n, i) {
                return "#" + n;
            })
            .join(", ");
            var referencedProperties = extractProperties.call($(selector), {
                subject: subject
            });
            triples = triples.concat(referencedProperties);
        }
               
        //parse children for properties (recursively)!
        var propertyTriples = $.map(this.children(), function (elem) {
            return extractProperties.call($(elem), {subject: subject});
        });
        triples = triples.concat(propertyTriples);
        
        return {
            triples: triples
        };
    },
    
    microdata = function (context) {
        //only call .microdata on an element with 'itemscope' attribute
        if (this.attr('itemscope') === undefined) {
            console.log("[DEBUG]", "No itemscope attribute found!");
            return [];
        }
        else {
            var triples = extractResource.call($(this)).triples;
            console.log("[DEBUG]", "Extracted ", triples.length, " triple(s)!", triples);
            return triples;
        }
    },
    
    gleaner = function (options) {
      if (options && options.about !== undefined) {
          if (options.about === null) {
              return this.attr('itemprop') !== undefined ||
                     this.attr('itemref') !== undefined ||
                     this.attr('itemtype') !== undefined;
          } else {
              return getSubjectFromElement.call(this) === options.about;
          }
      } else if (options && options.type !== undefined) {
          var type = getTypeFromElement.call(this);
          if (type !== undefined) {
              return options.type === null ? true : (type === options.type);
          }
          return false;
      } else {
          return microdata.call(this, options);
      }
    },

    addMicrodata = function (triple) {
      //TODO: implement me!
      return this;
    },

    removeMicrodata = function (what) {
      //TODO: implement me!
      return this;
    };

  /**
   * Creates a {@link jQuery.rdf} object containing the RDF triples parsed from the microdata found in the current 
   * jQuery selection or adds the specified triple as microdata markup on each member of the current jQuery selection.
   * To create an {@link jQuery.rdf} object, you will usually want to use {@link jQuery#rdf} instead, as this may 
   * perform other useful processing (such as of microformats used within the page).
   * @methodOf jQuery#
   * @name jQuery#microdata
   * @param {jQuery.rdf.triple} [triple] The RDF triple to be added to each item in the jQuery selection.
   * @returns {jQuery.rdf}
   * @example
   * // Extract microdata markup from all span elements contained inside #main
   * rdf = $('#main > span').microdata();
   * @example
   * // Add microdata markup to a particular element
   *  var span = $('#main > p > span');
   *  span.microdata('&lt;> name "Test Name" .');
   */
  $.fn.microdata = function (triple, ns) {
    if (triple === undefined) {
      var triples = $.map($(this), function (elem) {
        return microdata.call($(elem));
      });
      return $.rdf({ triples: triples });
    } else {
      $(this).each(function () {
        addMicrodata.call($(this), triple, ns);
      });
      return this;
    }
  };

  /**
   * Removes the specified microdata markup from each of the items in the current jQuery selection. The input parameter
   * can be either an object or an array of objects. The objects can either have a <code>type</code> property, in which 
   * case the specified type is removed from the microdata provided on the selected elements, or a <code>property</code> property,
   * in which case the specified property is removed from the microdata provided on the selected elements.
   * @methodOf jQuery#
   * @name jQuery#removeMicrodata
   * @param {Object|Object[]} triple The microdata markup items to be removed
   * from the items in the jQuery selection.
   * @returns {jQuery} The original jQuery object.
   * @example 
   * // To remove a property resource or relation from an element 
   * $('#main > p > a').removeMicrodata({ itemprop: "creator" });
   * @example
   * // To remove a type from an element
   * $('#main >p > a').removeMicrodata({ itemtype: "http://schema.org/Person" });
   * @example
   * // To remove multiple triples from an element
   * $('#main > p > a').removeMicrodata([{ itemprop: "depicts" }, { itemprop: "creator" }]);
   */
  $.fn.removeMicrodata = function (triple) {
    $(this).each(function () {
      removeMicrodata.call($(this), triple);
    });
    return this;
  };

  $.rdf.gleaners.push({
      name: "microdata",
      gleaner: gleaner
  });

})(jQuery);
