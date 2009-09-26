/*
 * jquery.xmlns.js unit tests
 */
(function($){

var ns = {
	html: "http://www.w3.org/1999/xhtml",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#",
	ex: "http://example.org/",
	sioc: "http://rdfs.org/sioc/ns#",
	xhv: "http://www.w3.org/1999/xhtml/vocab#",
	prism: "http://prism.talis.com/schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
}

module("When getting all namespaces");

test("on an element with three namespaces declared on it, including an empty one", function() {
	var namespaces = $('html').xmlns();
	equals(namespaces.dc, ns.dc);
	equals(namespaces.foaf, 'http://www.example.org/foaf');
	equals(namespaces[''], ns.html);
	equals(namespaces.rdf, ns.rdf);
	equals(namespaces.cc, ns.cc);
	equals(namespaces.ex, ns.ex);
	equals(namespaces.sioc, ns.sioc);
	
	for (n in namespaces) {
		if (n !== 'dc' && n !== 'foaf' && n !== '' && n !== 'rdf' && n !== 'cc' && n !== 'ex'  && n !== 'sioc' && n !== 'xsd' && n !== 'xml' && n !== 'xmlns') {
			ok(false, 'unexpected namespace: ' + n + '=' + namespaces[n]);
		}
	}
});

test("on an element that inherits namespaces", function() {
	var namespaces = $('body').xmlns();
	equals(namespaces.dc, ns.dc);
	equals(namespaces.foaf, ns.foaf);
	equals(namespaces[''], ns.html);
	for (n in namespaces) {
		if (n !== 'dc' && n !== 'foaf' && n !== '' && n !== 'rdf' && n !== 'cc' && n !== 'ex'  && n !== 'sioc' && n !== 'xsd' && n !== 'xml' && n !== 'xmlns') {
			ok(false, 'unexpected namespace: ' + n + '=' + namespaces[n]);
		}
	}
});

test("on a sequence of two elements", function() {
  var elems = $('body, html');
	var namespaces = elems.xmlns();
	equals(namespaces.dc, ns.dc);
	// This changed with jQuery 1.3.2
	equals(namespaces.foaf, 'http://www.example.org/foaf'); 
	equals(namespaces[''], ns.html);
	for (n in namespaces) {
		if (n !== 'dc' && n !== 'foaf' && n !== '' && n !== 'rdf' && n !== 'cc' && n !== 'ex'  && n !== 'sioc' && n !== 'xsd' && n !== 'xml' && n !== 'xmlns') {
			ok(false, 'unexpected namespace: ' + n + '=' + namespaces[n]);
		}
	}
});

module("When getting a known namespace");

test("on an element that has the namespace declared", function() {
	equals($('html').xmlns('dc'), ns.dc);
});

test("on an element that inherits the namespace", function() {
	equals($('body').xmlns('dc'), ns.dc);
});

test("on an element that redeclares the namespace", function() {
	equals($('body').xmlns('foaf'), ns.foaf);
});

test("when the namespace is a relative URI", function() {
	equals('' + $('#relativeUri').xmlns('non'), '' + $.uri('foo'));
});

test("when the context is more than one element", function() {
  // This changed in jQuery 1.3.2 to return the elements in the order they appear on the page
	equals($('body, html').xmlns('foaf'), 'http://www.example.org/foaf', "it should return the namespace from the first of the elements");
});

test("when the namespace hasn't been declared", function() {
	equals($('body').xmlns('lic'), undefined);
});

/*
test("when the namespace is the xml namespace", function () {
  equals($('body').xmlns('xml'), 'http://www.w3.org/XML/1998/namespace');
});
*/

test("when the namespace is the xmlns namespace", function () {
  equals($('body').xmlns('xmlns'), undefined);
});

module("When setting a namespace");

test("on an element that doesn't have the default namespace declared", function() {
	var namespace = 'http://www.example.org/foo';
	equals($('h1').attr('xmlns'), undefined, "when it doesn't have a declaration itself");
	$('h1').xmlns('', namespace);
	equals($('h1').attr('xmlns'), namespace);
	$('h1').removeAttr('xmlns');
});

test("on an element that already has a namespace with that prefix", function() {
	var namespace = 'http://www.example.org/foo';
	equals($('body').attr('xmlns:foaf'), ns.foaf);
	$('body').xmlns('foaf', namespace);
	equals($('body').attr('xmlns:foaf'), namespace);
	$('body').attr('xmlns:foaf', ns.foaf);
});

test("on multiple elements at the same time", function() {
	var namespace = 'http://www.example.org/foo';
	$('h2').xmlns('foo', namespace);
	ok($('h2').length > 1, "there's more than one element");
	for (var i = 0; i < $('h2').length; i += 1) {
		equals($('h2').eq(i).attr('xmlns:foo'), namespace);
	}
	$('h2').removeAttr('xmlns:foo');
});

test("with an object containing the namespace mappings", function() {
	var namespaces = { foo: 'http://www.example.org/foo', bar: 'http://www.example.org/bar' };
	try {
		$('h1').xmlns(namespaces);
		equals($('h1').attr('xmlns:foo'), namespaces.foo);
		equals($('h1').attr('xmlns:bar'), namespaces.bar);
	} catch (e) {
		ok(false, "it should not cause an error");
	}
	$('h1').removeAttr('xmlns:foo');
	$('h1').removeAttr('xmlns:bar');
});

module("When removing a namespace declaration");

test("from an element that has it", function() {
	$('body').removeXmlns('foaf');
	equals($('body').attr('xmlns:foaf'), undefined);
	equals($('body').xmlns('foaf'), 'http://www.example.org/foaf', "should inherit namespace as usual");
	$('body').xmlns('foaf', ns.foaf);
});

test("from a set of elements", function() {
	var namespace = 'http://www.example.org/foo';
	$('h2').attr('xmlns:foo', namespace);
	$('h2').removeXmlns('foo');
	for (var i = 0; i < $('h2').length; i += 1) {
		equals($('h2').eq(i).attr('xmlns:foo'), undefined);
	}
	$('h2').removeAttr('xmlns:foo'); // just in case the removeNamespaces didn't work
});

test("when the namespace doesn't exist", function() {
	equals($('h2').xmlns('foo'), undefined);
	try {
		$('h2').removeXmlns('foo');
		ok(true, "it should not cause an error");
	} catch (e) {
		ok(false, "it should not cause an error");
	}
});

test("en-masse using an object", function() {
	var namespaces = { foo: 'http://www.example.org/foo', bar: 'http://www.example.org/bar' };
	$('#main').attr('xmlns:foo', namespaces.foo);
	$('#main').attr('xmlns:bar', namespaces.bar);
	$('#main').removeXmlns(namespaces);
	equals($('#main').attr('xmlns:foo'), undefined);
	equals($('#main').attr('xmlns:bar'), undefined);
});

test("en-masse using an array", function() {
	var namespaces = { foo: 'http://www.example.org/foo', bar: 'http://www.example.org/bar' };
	$('#main').attr('xmlns:foo', namespaces.foo);
	$('#main').attr('xmlns:bar', namespaces.bar);
	$('#main').removeXmlns(['foo', 'bar']);
	equals($('#main').attr('xmlns:foo'), undefined);
	equals($('#main').attr('xmlns:bar'), undefined);
});

module("When resolving QNames");

test("of an element in the default namespace with the default namespace declaration on it", function() {
	var qname = $('html').qname();
	equals(qname.namespace, ns.html);
	equals(qname.localPart, 'html');
	equals(qname.prefix, '');
	equals(qname.name, 'html');
});

test("of an element in the default namespace that inherits its namespace", function() {
	var qname = $('body').qname();
	equals(qname.namespace, ns.html);
	equals(qname.localPart, 'body');
	equals(qname.prefix, '');
	equals(qname.name, 'body');
});

test("of an element with a prefix", function() {
	var qname;
	$('#main').append('<s:svg xmlns:s="http://www.w3.org/2000/svg">...</s:svg>');
	try {
  	qname = $('#main *').qname();
  	equals(qname.namespace, 'http://www.w3.org/2000/svg');
  	equals(qname.localPart, 'svg');
  	equals(qname.prefix, 's');
  	equals(qname.name, 's:svg');
	} catch (e) {
	  if ($.browser.msie) {
	    ok(true, "should raise an error");
	  } else {
	    ok(false, "should not raise the error " + e);
	  }
	}
	$('#main *').remove();
});

test("of a specified QName with a prefix", function() {
	var qname = $('body').qname('foaf:img');
	equals(qname.namespace, ns.foaf);
	equals(qname.localPart, 'img');
	equals(qname.prefix, 'foaf');
	equals(qname.name, 'foaf:img');
});

test("of a QName whose prefix hasn't been declared", function() {
	try {
		var qname = $('body').qname('foo:bar');
		ok(false, "it should raise an error");
	} catch (e) {
		ok(true, "it should raise an error");
	}
});

test("of a QName that has no prefix and there's no in-scope default namespace declaration", function() {
	var qname;
	$('html').removeXmlns('');
	try {
		qname = $('body').qname('bar');
		equals(qname.namespace, undefined);
		equals(qname.prefix, '');
		equals(qname.localPart, 'bar');
		equals(qname.name, 'bar');
	} catch (e) {
		ok(false, "it should not raise an error");
	}
	$('html').xmlns('', ns.html);
});

})(jQuery);