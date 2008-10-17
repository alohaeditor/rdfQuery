/*
 * jquery.curie.js unit tests
 */
(function($){

var ns = {
	xhv: "http://www.w3.org/1999/xhtml/vocab#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#"
}

module("CURIE resolution");

test("Two identical CURIEs", function() {
	var curie1 = $('html').curie('dc:creator');
	var curie2 = $('html').curie('dc:creator');
	ok(curie1 === curie2, "should equal each other");
});

test("CURIE on element with declaration", function() {
	equals($('html').curie('dc:creator'), ns.dc + 'creator');
});

test("CURIE on child element of declaration", function() {
	equals($('body').curie('dc:creator'), ns.dc + 'creator');
});

test("CURIE on descendant element of declaration", function() {
	equals($('#main').curie('dc:creator'), ns.dc + 'creator');
});

test("CURIE on element with other ancestor declaration", function() {
	equals($('body').curie('foaf:img'), ns.foaf + 'img');
});

test("CURIE on element without declaration for the prefix", function() {
	try {
		$('body').curie('cc:license');
		ok(false, 'should give an error');
	} catch (e) {
		equals(e.name, 'MalformedCURIE');
	}
});

test("CURIE with no prefix that is in the default set of prefix-less CURIEs for XHTML", function() {
	equals($('html').curie('alternate'), ns.xhv + 'alternate');
});

test("CURIE with no prefix that is not in the default set of prefix-less CURIEs for XHTML", function() {
	try {
		$('html').curie('foobar');
		ok(false, 'should give an error');
	} catch (e) {
		equals(e.name, 'MalformedCURIE');
	}
});

test("CURIE with no prefix and no colon when there is a default namespace", function() {
	var namespace = 'http://www.example.org/';
	var opts = {reserved: [], reservedNamespace: undefined, defaultNamespace: namespace};
	try {
		equals($('html').curie('foobar', opts), namespace + 'foobar');
	} catch (e) {
		ok(false, 'should not give an error');
	}
});

test("CURIE with no prefix (but with a colon) when there is a default namespace", function() {
	var namespace = 'http://www.example.org/';
	var opts = {reserved: [], reservedNamespace: undefined, defaultNamespace: namespace};
	try {
		equals($('html').curie(':foobar', opts), namespace + 'foobar');
	} catch (e) {
		ok(false, 'should not give an error');
	}
});

module("Safe CURIE resolution");

test("CURIE in square brackets", function() {
	equals($('body').safeCurie('[dc:creator]'), ns.dc + 'creator');
});

test("absolute URI", function() {
	equals($('body').safeCurie(ns.dc + 'creator'), ns.dc + 'creator');
});

})(jQuery);