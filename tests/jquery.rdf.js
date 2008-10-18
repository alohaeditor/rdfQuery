/*
 * jquery.rdf.js unit tests
 */
(function($){

var ns = {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#"
}

module("Triplestore Tests");

test("creating an empty triple store", function() {
	var rdf = $.rdf();
	equals(rdf.tripleStore.length, 0, "the length of the triple store should be zero");
	equals(rdf.length, 0, "the length of the matches should be zero")
	equals(rdf.size(), 0, "the size of the matches should be zero");
});

test("creating a triple store from an array of $.rdf.triple objects", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', { namespaces: namespaces }),
		$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', { namespaces: namespaces })
	];
	var rdf = $.rdf(triples);
	equals(rdf.tripleStore.length, 2, "the length of the tripleStore should be two");
	equals(rdf.length, 0, "the length of the matches should be zero");
	equals(rdf.tripleStore[0], triples[0]);
	equals(rdf.tripleStore[1], triples[1]);
});

test("creating a triple store from an array of strings", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .'
	];
	var rdf = $.rdf(triples, { namespaces: namespaces });
	equals(rdf.tripleStore.length, 2, "the length of the triple store should be two");
	equals(rdf.length, 0, "the length should be two");
	equals(rdf.size(), 0, "the size should be two");
	ok(rdf.tripleStore[0].subject.resource, "the subject of the first triple should be a resource");
	ok(rdf.tripleStore[0].property.resource, "the property of the first triple should be a resource");
	ok(rdf.tripleStore[0].object.resource, "the object of the first triple should be a resource");
	ok(rdf.tripleStore[1].subject.resource, "the subject of the first triple should be a resource");
	ok(rdf.tripleStore[1].property.resource, "the property of the first triple should be a resource");
	ok(rdf.tripleStore[1].object.resource, "the object of the first triple should be a resource");
});

test("selecting triples using a search pattern", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf(triples, { namespaces: namespaces });
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>', { namespaces: namespaces });
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[0].bindings.photo.uri, $.uri('photo1.jpg'));
	equals(filtered[1].bindings.photo.uri, $.uri('photo2.jpg'));
});

test("creating triples and specifying options should helpfully bind prefixes", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf(triples, { namespaces: namespaces });
	try {
		var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
		ok(true, "should not raise an error");
		equals(rdf.prefix('dc'), ns.dc);
		equals(rdf.prefix('foaf'), ns.foaf);
	} catch (e) {
		ok(false, "should not raise the error " + e.message);
	}
});

test("selecting triples using a search pattern, then adding another triple that matches the search pattern", function() {
	var namespaces = { namespaces: { dc: ns.dc, foaf: ns.foaf } };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .'
	];
	var rdf = $.rdf(triples, namespaces);
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>', namespaces);
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].bindings.photo.uri, $.uri('photo1.jpg'));
	var added = rdf.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', namespaces);
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[1].bindings.photo.uri, $.uri('photo2.jpg'));
});

test("selecting triples using two search patterns", function() {
	var namespaces = { namespaces: { dc: ns.dc, foaf: ns.foaf } };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf(triples, namespaces);
	var filtered = rdf
		.where('?photo dc:creator ?creator', namespaces)
		.where('?creator foaf:img ?photo', namespaces);
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].bindings.photo.uri, $.uri('photo1.jpg'));
	equals(filtered[0].bindings.creator.uri, $.uri('http://www.blogger.com/profile/1109404'));
	equals(filtered[0].triples[0], $.rdf.triple(triples[0], namespaces));
	equals(filtered[0].triples[1], $.rdf.triple(triples[1], namespaces));
	equals(filtered.bindings()[0].photo.uri, $.uri('photo1.jpg'));
	equals(filtered.bindings()[0].creator.uri, $.uri('http://www.blogger.com/profile/1109404'))
});

test("selecting triples using two search patterns, then adding a triple", function() {
	var namespaces = { namespaces: { dc: ns.dc, foaf: ns.foaf } };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf(triples, namespaces);
	var filtered = rdf
		.where('?photo dc:creator ?creator', namespaces)
		.where('?creator foaf:img ?photo', namespaces);
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].bindings.photo.uri, $.uri('photo1.jpg'));
	var added = rdf.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .', namespaces);
	equals(filtered.length, 2, "number of items after adding a new triple");
	equals(filtered[1].bindings.photo.uri, $.uri('photo2.jpg'));
});

test("using a callback function on each match", function() {
	var count = 0, photos = [];
	var namespaces = { namespaces: { dc: ns.dc, foaf: ns.foaf } };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .',
	];
	var rdf = $.rdf(triples, namespaces)
		.where('?photo dc:creator ?creator', namespaces)
		.where('?creator foaf:img ?photo', namespaces);
	rdf.each(function (index, match) {
		count += 1;
		photos.push(match.bindings.photo);
	});
	equals(count, 2, "it should iterate twice");
	equals(photos[0].uri, $.uri('photo1.jpg'));
	equals(photos[1].uri, $.uri('photo2.jpg'));
});

test("filtering some results based on a regular expression", function() {
	var namespaces = { namespaces: { dc: 'http://purl.org/dc/elements/1.1/', '': 'http://example.org/book/', ns: 'http://example.org/ns#'}};
	var triples = [
		':book1  dc:title  "SPARQL Tutorial" .',
		':book1  ns:price  42 .',
		':book2  dc:title  "The Semantic Web" .',
		':book2  ns:price  23 .'
	];
	var rdf = $.rdf(triples, namespaces)
		.where('?x dc:title ?title', namespaces);
	equals(rdf.length, 2, "should have two items before filtering");
	rdf.filter('title', /^SPARQL/);
	equals(rdf.length, 1, "should have one item after filtering");
	equals(rdf.bindings()[0].title.value, "SPARQL Tutorial");
});

test("creating a namespace binding explicitly, not while creating the triples", function() {
	var rdf = $.rdf()
		.prefix('dc', 'http://purl.org/dc/elements/1.1/')
		.prefix('', 'http://example.org/book/');
	try {
		rdf.add(':book1 dc:title "SPARQL Tutorial"');
		ok(true, "should not generate an error");
		equals(rdf.tripleStore[0].subject, '<http://example.org/book/book1>');
		equals(rdf.tripleStore[0].property, '<http://purl.org/dc/elements/1.1/title>');
	} catch (e) {
		ok(false, "should not generate the error " + e.message);
	}
});

test("creating a base URI explicitly, not while creating the triples", function() {
	var rdf = $.rdf()
		.prefix('dc', 'http://purl.org/dc/elements/1.1/')
		.base('http://www.example.org/images/')
		.add('<photo1.jpg> dc:creator "Jeni"');
	equals(rdf.tripleStore[0].subject, '<http://www.example.org/images/photo1.jpg>');
});

module("Creating Triples");

test("two identical triples", function() {
	var t1 = $.rdf.triple('<a> <b> <c>');
	var t2 = $.rdf.triple('<a> <b> <c>');
	ok(t1 === t2, "should be equal");
});

test("creating a triple with explicit subject, predicate and object", function() {
	var subject = 'http://www.example.com/foo/';
	var object = 'mailto:someone@example.com';
	var triple = $.rdf.triple('<' + subject + '>', 'dc:creator', '<' + object + '>', { namespaces: { dc: ns.dc }});
  ok(triple.subject.resource, "the subject should be a resource");
	equals(triple.subject.uri, subject);
	ok(triple.property.resource, "the property should be a resource");
	equals(triple.property.uri, ns.dc + 'creator');
	ok(triple.object.resource, "the object should be a resource");
	equals(triple.object.uri, object);
	equals(triple, '<' + subject + '> <' + ns.dc + 'creator> <' + object + '> .');
});

test("creating an rdf:type triple", function() {
	var subject = 'http://example.org/path';
	var object = 'doc:Document';
	var doc = 'http://example.org/#ns';
	var triple = $.rdf.triple('<' + subject + '>', 'a', object, { namespaces: { doc: doc }});
	equals(triple.subject.uri, subject);
	equals(triple.property.uri, ns.rdf + 'type');
	equals(triple.object.uri, doc + 'Document');
	equals(triple, '<' + subject + '> <' + ns.rdf + 'type> <' + doc + 'Document> .');
});

test("creating a triple using a string", function() {
	var subject = 'http://www.example.com/foo/';
	var object = 'mailto:someone@example.com';
	var tstr = '<' + subject + '> dc:creator <' + object + '> .';
	var triple = $.rdf.triple(tstr, { namespaces: { dc: ns.dc }});
	equals(triple.subject.uri, subject);
	equals(triple.property.uri, ns.dc + 'creator');
	equals(triple.object.uri, object);
});

test("creating a triple using a string with a literal value", function() {
	var subject = 'http://www.example.com/foo/';
	var value = '"foo"';
	var triple = $.rdf.triple('<' + subject + '> dc:subject ' + value, { namespaces: { dc: ns.dc }});
	equals(triple.subject.uri, subject);
	equals(triple.property.uri, ns.dc + 'subject');
	ok(!triple.object.resource, "the object isn't a resource");
	equals(triple.object.value, 'foo');
});

test("creating a triple using a string with a literal value with a space in it", function() {
	var subject = 'http://www.example.com/foo/';
	var value = '"foo bar"';
	var triple = $.rdf.triple('<' + subject + '> dc:subject ' + value, { namespaces: { dc: ns.dc }});
	equals(triple.subject.uri, subject);
	equals(triple.property.uri, ns.dc + 'subject');
	ok(!triple.object.resource, "the object isn't a resource");
	equals(triple.object.value, 'foo bar');
});

test("creating a triple with an unprefixed name and a value with a space in it", function() {
	var triple = $.rdf.triple(':book1  dc:title  "SPARQL Tutorial" .', { namespaces: { '': 'http://example.org/book/', dc: ns.dc }});
	equals(triple.subject.uri, 'http://example.org/book/book1');
	equals(triple.property.uri, ns.dc + 'title');
	equals(triple.object.value, 'SPARQL Tutorial');
});

test("creating a triple with a literal value with quotes in it", function() {
	var triple = $.rdf.triple('<> dc:title "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^rdf:XMLLiteral .', { namespaces: { dc: ns.dc, rdf: ns.rdf }});
	equals(triple.subject.uri, $.uri.base());
	equals(triple.property.uri, ns.dc + 'title');
	equals(triple.object.value, 'E = mc<sup xmlns="http://www.w3.org/1999/xhtml">2</sup>: The Most Urgent Problem of Our Time');
	equals(triple.object.datatype, ns.rdf + 'XMLLiteral');
});

module("Creating Resources");

test("two identical resources", function() {
	var u = 'http://www.example.org/subject';
	var r1 = $.rdf.resource('<' + u + '>');
	var r2 = $.rdf.resource('<' + u + '>');
	ok(r1 === r2, "should equal each other");
});

test("creating a resource with strings in angle brackets (URIs)", function() {
	var u = 'http://www.example.org/subject';
	var r = $.rdf.resource('<' + u + '>');
	equals(r.uri, u);
});

test("creating a resource with a relative uri", function() {
	var u = 'subject';
	var r = $.rdf.resource('<' + u + '>');
	equals('' + r.uri, '' + $.uri(u));
});

test("creating a resource with a relative uri and supplying a base uri", function() {
	var u = 'subject';
	var base = 'http://www.example.org/';
	var r = $.rdf.resource('<' + u + '>', { base: base });
	equals('' + r.uri, '' + $.uri.resolve(u, base));
});

test("creating a resource with a uri that contains a greater-than sign", function() {
	var u = 'http://www.example.org/a>b';
	var r = $.rdf.resource('<' + u.replace(/>/g, '\\>') + '>');
	equals(r.uri, u);
});

test("creating a resource using a string that looks like an absolute uri", function() {
	var u = 'http://www.example.org/subject';
	try {
		var r = $.rdf.resource(u);
		ok(false, "should throw an error");
	} catch (e) {
		equals(e.name, 'MalformedResource');
	}
});

test("creating a resource from a curie", function() {
	var dc = "http://purl.org/dc/elements/1.1/";
	var c = 'dc:creator';
	var r = $.rdf.resource(c, { namespaces: { dc: dc } });
	equals(r.uri, dc + 'creator');
});

test("creating a resource from a qname starting with ':'", function() {
	var d = 'http://www.example.com/foo/';
	var r = $.rdf.resource(':bar', { namespaces: { '': d }});
	equals(r.uri, d + 'bar');
});

test("creating a resource from a qname starting with ':' with no default namespace binding", function() {
	try {
		var r = $.rdf.resource(':bar');
		ok(false, "should raise an error");
	} catch (e) {
		equals(e.name, "MalformedResource");
	}
});

test("creating a resource from a qname ending with ':'", function() {
	var foo = 'http://www.example.com/foo/'
	var r = $.rdf.resource('foo:', { namespaces: { foo: foo }});
	equals(r.uri, foo);
});

test("creating a resource from a qname ending with ':' with no binding for the prefix", function() {
	try {
		var r = $.rdf.resource('foo:');
		ok(false, "should raise an error");
	} catch (e) {
		equals(e.name, "MalformedResource");
	}
});

module("Creating literals");

test("two identical literals", function() {
	var l1 = $.rdf.literal('"foo"');
	var l2 = $.rdf.literal('"foo"');
	ok(l1 === l2, "should be equal");
});

test("creating a literal with a datatype", function() {
	var r = $.rdf.literal('2008-10-04', { datatype: ns.xsd + 'date' });
	equals(r.value, '2008-10-04');
	equals(r.datatype, ns.xsd + 'date');
});

test("creating a literal with a datatype represented by a safe CURIE", function() {
	var r = $.rdf.literal('2008-10-04', { datatype: '[xsd:date]', namespaces: { xsd: ns.xsd } });
	equals(r.value, '2008-10-04');
	equals(r.datatype, ns.xsd + 'date');
});

test("creating a literal with a language", function() {
	var r = $.rdf.literal('chat', { lang: 'fr' });
	equals(r.value, 'chat');
	equals(r.lang, 'fr');
});

test("creating a literal using quotes around the value", function() {
	var r = $.rdf.literal('"cat"');
	equals(r.value, 'cat');
});

test("creating a literal using quotes, with quotes in the literal", function() {
	var r = $.rdf.literal('"She said, \\"hello!\\""');
	equals(r.value, 'She said, "hello!"');
});

test("creating literal true", function() {
	var r = $.rdf.literal('true');
	equals(r.value, true);
	equals(r.datatype, ns.xsd + 'boolean');
});

test("creating literal false", function() {
	var r = $.rdf.literal('false');
	equals(r.value, false);
	equals(r.datatype, ns.xsd + 'boolean');
});

test("creating the literal true from the value true", function() {
	var r = $.rdf.literal(true);
	equals(r.value, true);
	equals(r.datatype, ns.xsd + 'boolean');
});

test("creating a boolean by passing the appropriate datatype", function() {
	var r = $.rdf.literal('true', { datatype: ns.xsd + 'boolean' });
	equals(r.value, true);
	equals(r.datatype, ns.xsd + 'boolean');
});

test("trying to create a boolean with an invalid literal", function() {
	try {
		var r = $.rdf.literal('foo', { datatype: ns.xsd + 'boolean' });
		ok(false, "should throw an error");
	} catch (e) {
		equals(e.name, "InvalidValue");
	}
});

test("creating literal integers", function() {
	var r = $.rdf.literal('17');
	equals(r.value, 17);
	equals(r.datatype, ns.xsd + 'integer');
});

test("creating a negative literal integer", function () {
	var r = $.rdf.literal('-5');
	equals(r.value, -5);
	equals(r.datatype, ns.xsd + 'integer');
});

test("creating the integer zero", function() {
	var r = $.rdf.literal('0');
	equals(r.value, 0);
	equals(r.datatype, ns.xsd + 'integer');
});

test("creating the decimal zero", function() {
	var r = $.rdf.literal('0.0');
	equals(r.value, '0.0');
	equals(r.datatype, ns.xsd + 'decimal');
});

test("creating a decimal with decimal points", function() {
	var r = $.rdf.literal('1.234567890123456789');
	equals(r.value, '1.234567890123456789');
	equals('' + r.value, '1.234567890123456789', "string representation should be preserved");
	equals(r.datatype, ns.xsd + 'decimal');
});

test("creating floating point zero", function() {
	var r = $.rdf.literal('0.0e0');
	equals(r.value, 0.0);
	equals(r.datatype, ns.xsd + 'double');
});

test("creating floating point -12.5e10", function() {
	var r = $.rdf.literal('-12.5e10');
	equals(r.value, -12.5e10);
	equals(r.datatype, ns.xsd + 'double');
});

test("creating an double from an Javascript number", function() {
	var r = $.rdf.literal(5.0);
	equals(r.value, 5.0);
	equals(r.datatype, ns.xsd + 'double');
});

test("creating a number by passing an appropriate datatype", function() {
	var r = $.rdf.literal('5', { datatype: ns.xsd + 'integer' });
	equals(r.value, 5);
	ok(typeof r.value === 'number', "value should be a number");
	equals(r.datatype, ns.xsd + 'integer');
});

test("creating a date by specifying the datatype in the value", function() {
	var r = $.rdf.literal('"2008-10-05"^^<http://www.w3.org/2001/XMLSchema#date>');
	equals(r.value, '2008-10-05');
	equals(r.datatype, 'http://www.w3.org/2001/XMLSchema#date');
	equals(r, '"2008-10-05"^^<http://www.w3.org/2001/XMLSchema#date>')
});

test("creating a literal with a language by specifying the language in the value", function() {
	var r = $.rdf.literal('"chat"@fr');
	equals(r.value, 'chat');
	equals(r.lang, 'fr');
	equals(r, '"chat"@fr');
});

module("Creating blank nodes");

test("two blank nodes with the same id", function() {
	var r1 = $.rdf.blank('_:foo');
	var r2 = $.rdf.blank('_:foo');
	ok(r1 === r2, "should be identical");
});

test("creating a blank node", function() {
	var r = $.rdf.blank('_:foo');
	equals(r.resource, true);
	equals(r.blank, true);
	equals(r.id, 'foo');
});

test("creating two blank nodes", function() {
	var r1 = $.rdf.blank('[]');
	var r2 = $.rdf.blank('[]');
	ok(r1.id !== r2.id, "they should have distinct ids " + r1.id + ' != ' + r2.id);
});


})(jQuery);