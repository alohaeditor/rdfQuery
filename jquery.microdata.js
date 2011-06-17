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
    
    getSubjectElem = function (elem) {
        var par = elem.parent();
        if (par.length) {
            if (par.attr('itemscope') !== undefined) {
                return par;
            }
            else {
                return getSubjectElem(par);
            }
        }
        return undefined;
    },
    
    getSubjectFromElement = function () {
        if (this.attr('itemid')) {
            return $.rdf.resource(this.attr('itemid'));
        } else {
            return $.rdf.blank('[]');
        }
    },
    
    getTypeFromElement = function () {
        var type = this.attr('itemtype');
        if (type) {
            return $.rdf.resource('<' + type + '>');
        } else {
            return $.rdf.resource('<http://www.w3.org/2002/07/owl#Thing>');
        }
    },
    
   
    
    extractReferences = function (context) {
        
    },
    
    extractProps = function (context) {
        var triples = [];
        
        if (!context) {
            context =  {};
        }
        //there are two types of properties
        // (1 - the easy ones): literals
        if ($(this).attr('itemprop') !== undefined) {
            if ($(this).attr('itemscope') === undefined) {
                //TODO: implement me
                
                //traverse deeper in the hierarchy
                var propertyTriples = $.map($(this).children(), function(elem) {
                    return extractProps.call(elem);
                });
                triples = triples.concat(propertyTriples);
            }
            // (2 - the complex ones): resources
            else {
                //recursively call microdata to parse the triples
                var resTriples = microdata.call(this);
                triples = triples.concat(resTriples);
            }
        } else {
            return [];
        }
        return triples;
    },
    
    extractResource = function (context) {
        var triples = [];
        
        if (!context) {
            context =  {};
        }
        
        var subjResource;
        if (this.attr('itemscope') !== undefined) {
            subjResource = getSubjectFromElement.call(this);
        }
        
        //get type of element
        triples.push(
                $.rdf.triple(
                    subjResource, 
                    $.rdf.type, 
                    getTypeFromElement.call(this), {namespaces: ns})
                );
        
        //query for referenced items and add triples recursively
        if ($(this).attr('itemref')) {
            var selector = $.map($(this).attr('itemref').split(" "), 
            function (n, i) {
                return "#" + n;
            })
            .join(", ");
            var referencedResources = extractResource.call($(selector), {
                subject: subjResource
            });
            triples = triples.concat(referencedTriples);
        }
        
        //parse children for properties (recursively)!
        var propertyTriples = $.map($(this).children(), function (elem) {
            return extractProps.call(elem, {subject: subjResource});
        });
        triples = triples.concat(propertyTriples);
        
        return {
            subject: subjResource,
            triples: triples
        };
    },
    
    microdata = function (context) {
        var triples = extractResource.call($(this)).triples;
        
        console.log("[DEBUG]", "Extracted ", triples.length, " triple(s)!");
        return triples;
    },
    
    gleaner = function (options) {
      
      if (options && options.about !== undefined) {
          //TODO: implement me!
          return false;
      } else if (options && options.type !== undefined) {
          //TODO: implement me!
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
