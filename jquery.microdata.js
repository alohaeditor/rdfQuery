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
    
    /*
    <div itemscope itemtype="http://schema.org/Person">
  <span itemprop="name">Jane Doe</span>
  <img src="janedoe.jpg" itemprop="image" />

  <span itemprop="jobTitle">Professor</span>
  <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
    <span itemprop="streetAddress">
      20341 Whitworth Institute
      405 N. Whitworth
    </span>
    <span itemprop="addressLocality">Seattle</span>,
    <span itemprop="addressRegion">WA</span>
    <span itemprop="postalCode">98052</span>
  </div>
  <span itemprop="telephone">(425) 123-4567</span>
  <a href="mailto:jane-doe@xyz.edu" itemprop="email">
    jane-doe@xyz.edu</a>

  Jane's home page:
  <a href="www.janedoe.com" itemprop="url">janedoe.com</a>

  Graduate students:
  <a href="www.xyz.edu/students/alicejones.html" itemprop="colleagues">
    Alice Jones</a>
  <a href="www.xyz.edu/students/bobsmith.html" itemprop="colleagues">
    Bob Smith</a>
</div>
*/

    getSubjectElem = function (elem) {
        var par = elem.parent();
        if (par.length) {
            if (par.attr('itemscope')) {
                return par;
            }
            else {
                return getSubjectElem(par);
            }
        }
        return undefined;
    },
    
    microdata = function (context) {
        var triples = [];
        
        var subjElem;
        if ($(this).attr('itemscope')) {
            //elem is a subject itself
            subjElem = this;
        } else {
            subjElem = getSubjectElem($(this));
        }
        
        var subjResource;
        if (subjElem) {
            if (subjElem.attr('itemid')) {
                subjResource = $.rdf.resource(subjElem.attr('itemid'));
            } else {
                subjResource = $.rdf.resource('<>');
            }
        }
        
        if (!subjResource) {
            return [];
        }
        
        //TODO: implement me!
        
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
      return this;
    },

    removeMicrodata = function (what) {
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
