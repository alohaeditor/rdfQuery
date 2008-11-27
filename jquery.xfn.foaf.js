/*
 * jQuery XFN for rdfQuery @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison, Libby Miller
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/*global jQuery */
(function ($) {

    var 
    foaf = $.uri("http://xmlns.com/foaf/0.1/"),
    work = $.rdf.resource('<' + $.uri.base() + '>'),
    foafPersonClass = $.rdf.resource('<' + foaf + 'Person>'),
    foafKnowsProp = $.rdf.resource('<' + foaf + 'knows>'),
    foafWeblogProp = $.rdf.resource('<' + foaf + 'weblog>'),
    meRegex = /(?:^|\s)(?:(\S+):)?me(?:\s|$)/,

    gleaner = function (options) {

        var rel = this.attr('rel'),
        href = this.attr('href'),
        m = meRegex.exec(rel);

        if (href !== undefined && m === null) {

            if (options && options.about !== undefined) {
                if (options.about === null) {
                    return true;
                } else {
                    return options.about === $.uri.base()  || options.about === href;
                }
            } else if (options && options.type !== undefined) {
                if (options.type === null) {
                    return true;
                } else {
                    return options.type === foafPersonClass.uri;
                }
            } else if (m === null) {
                return [
                    $.rdf.triple('_:person1', $.rdf.type, foafPersonClass),
                    $.rdf.triple('_:person1', foafWeblogProp, work),
                    $.rdf.triple('_:person1', foafKnowsProp, '_:person2'),
                    $.rdf.triple('_:person2', foafWeblogProp, '<' + href + '>'),
                    $.rdf.triple('_:person2', $.rdf.type, foafPersonClass)

                ];
            }
        }
        return options === undefined ? [] : false;
    };



    $.fn.xfn = function (triple) { 
    //triple e.g. 'friend' 'met' etc
        if (triple === undefined) {
            var triples = $.map($(this), function (elem) {
                return gleaner.call($(elem));
            });
            return $.rdf({ triples: triples });
        } else {
            $(this)
            .filter('[href]') // only add to elements with href attributes
            .each(function () {
                var elem = $(this),
                rel = elem.attr('rel');
                if (rel === undefined || rel === '') {
                    elem.attr('rel', triple);
                } else if (!rel.toLowerCase().match(triple.toLowerCase())) {
                    elem.attr('rel', rel + ' ' + triple);
                }
            });
            return this;
        }
    };

    $.rdf.gleaners.push(gleaner);

})(jQuery);
