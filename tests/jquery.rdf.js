/*
 * jquery.rdf.js unit tests
 */
(function($){

var ns = {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#",
	vcard: "http://www.w3.org/2001/vcard-rdf/3.0#",
	xmlns: "http://www.w3.org/2000/xmlns/",
	xml: "http://www.w3.org/XML/1998/namespace"
};

/* Example adapted from http://www.w3.org/Submission/CBD/ */
var books = $.rdf.databank()
  .prefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#')
  .prefix('foaf', ns.foaf)
  .prefix('dc', ns.dc)
  .prefix('dct', 'http://purl.org/dc/terms/')
  .prefix('xsd', ns.xsd)
  .prefix('ex', 'http://example.com/')
  .add('<http://example.com/aReallyGreatBook> dc:title "A Really Great Book" .')
  .add('<http://example.com/aReallyGreatBook> dc:publisher "Examples-R-Us" .')
  .add('<http://example.com/aReallyGreatBook> dc:creator _:creator .')
  .add('_:creator a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:creator foaf:name "John Doe" .')
  .add('_:creator foaf:mbox "john@example.com" .')
  .add('_:creator foaf:img <http://example.com/john.jpg> .')
  .add('<http://example.com/john.jpg> a <http://xmlns.com/foaf/0.1/Image> .')
  .add('<http://example.com/john.jpg> dc:format "image/jpeg" .')
  .add('<http://example.com/john.jpg> dc:extent "1234" .')
  .add('_:creator foaf:phone <tel:+1-999-555-1234> .')
  .add('<http://example.com/aReallyGreatBook> dc:contributor _:contributor .')
  .add('_:contributor a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:contributor foaf:name "Jane Doe" .')
  .add('<http://example.com/aReallyGreatBook> dc:language "en" .')
  .add('<http://example.com/aReallyGreatBook> dc:format "applicaiton/pdf" .')
  .add('<http://example.com/aReallyGreatBook> dc:rights "Copyright (C) 2004 Examples-R-Us. All rights reserved." .')
  .add('<http://example.com/aReallyGreatBook> dct:issued "2004-01-19"^^xsd:date .')
  .add('<http://example.com/aReallyGreatBook> rdfs:seeAlso <http://example.com/anotherGreatBook> .')
  .add('<http://example.com/anotherGreatBook> dc:title "Another Great Book" .')
  .add('<http://example.com/anotherGreatBook> dc:publisher "Examples-R-Us" .')
  .add('<http://example.com/anotherGreatBook> dc:creator "June Doe (june@example.com)" .')
  .add('<http://example.com/anotherGreatBook> dc:format "application/pdf" .')
  .add('<http://example.com/anotherGreatBook> dc:language "en" .')
  .add('<http://example.com/anotherGreatBook> dc:rights "Copyright (C) 2004 Examples-R-Us. All rights reserved." .')
  .add('<http://example.com/anotherGreatBook> dct:issued "2004-05-03"^^xsd:date .')
  .add('<http://example.com/anotherGreatBook> rdfs:seeAlso <http://example.com/aReallyGreatBook> .')
  .add('<http://example.com/aBookCritic> ex:likes <http://example.com/aReallyGreatBook> .')
  .add('<http://example.com/aBookCritic> ex:dislikes <http://example.com/anotherGreatBook> .');

module("Triplestore Tests");

test("creating an empty triple store", function() {
	var rdf = $.rdf();
	equals(rdf.databank.size(), 0, "the length of the triple store should be zero");
	equals(rdf.length, 0, "the length of the matches should be zero")
	equals(rdf.size(), 0, "the size of the matches should be zero");
});

test("creating a triple store from an array of $.rdf.triple objects", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', { namespaces: namespaces }),
		$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', { namespaces: namespaces })
	];
	var rdf = $.rdf({ triples: triples });
	equals(rdf.databank.size(), 2, "the length of the databank should be two");
	equals(rdf.length, 0, "the length of the matches should be zero");
	equals(rdf.databank.triples()[0], triples[0]);
	equals(rdf.databank.triples()[1], triples[1]);
	var d = rdf.describe(['<photo1.jpg>']);
	equals(d[0], triples[0]);
	equals(d[1], triples[1]);
});

test("creating a triple store from an array of strings", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	equals(rdf.databank.size(), 2, "the length of the triple store should be two");
	equals(rdf.length, 0, "the length of the query should be zero");
	equals(rdf.size(), 0, "the size of the query should be zero");
	var triples = rdf.databank.triples();
	equals(triples[0].subject.type, 'uri', "the subject of the first triple should be a resource");
	equals(triples[0].property.type, 'uri', "the property of the first triple should be a resource");
	equals(triples[0].object.type, 'uri', "the object of the first triple should be a resource");
	equals(triples[1].subject.type, 'uri', "the subject of the first triple should be a resource");
	equals(triples[1].property.type, 'uri', "the property of the first triple should be a resource");
	equals(triples[1].object.type, 'uri', "the object of the first triple should be a resource");
});

test("adding duplicate triples to a triple store", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .add('_:a dc:creator "Jeni" .')
    .add('_:a dc:creator "Jeni" .');
  equals(rdf.databank.size(), 1, "should only result in one triple being added");
});

test("selecting triples using a search pattern", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	equals(rdf.databank.size(), 3, "there should be three triples in the databank");
	equals(rdf.length, 0);
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[0].photo.value, $.uri('photo1.jpg'));
	equals(filtered[1].photo.value, $.uri('photo2.jpg'));
	var selected = filtered.select();
	equals(selected[0].photo.type, 'uri');
	equals(selected[0].photo.value, $.uri('photo1.jpg'));
	equals(selected[1].photo.type, 'uri');
	equals(selected[1].photo.value, $.uri('photo2.jpg'));
	var d = filtered.describe(['?photo']);
	equals(d.length, 3);
});

test("creating triples and specifying options should helpfully bind prefixes", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	try {
		var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
		ok(true, "should not raise an error");
		equals(rdf.prefix('dc'), ns.dc);
		equals(rdf.prefix('foaf'), ns.foaf);
	} catch (e) {
		ok(false, "should not raise the error " + e.message);
	}
});

test("adding another triple that matches the original search pattern", function() {
	var rdf = $.rdf()
	  .prefix('dc', ns.dc)
	  .prefix('foaf', ns.foaf)
	  .add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
	  .add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .');
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.value, $.uri('photo1.jpg'));
	var added = filtered.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .');
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[1].photo.value, $.uri('photo2.jpg'));
});

test("selecting triples using two search patterns", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .'
	];
	var rdf = $.rdf({triples: triples, namespaces: namespaces});
	var filtered = rdf
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.value, $.uri('photo1.jpg'));
	equals(filtered[0].creator.value, $.uri('http://www.blogger.com/profile/1109404'));
	equals(filtered.sources()[0][0], $.rdf.triple(triples[0], {namespaces: namespaces}));
	equals(filtered.sources()[0][1], $.rdf.triple(triples[1], {namespaces: namespaces}));
	var selected = filtered.select();
	equals(selected[0].photo.type, 'uri');
	equals(selected[0].photo.value, $.uri('photo1.jpg'));
	equals(selected[0].creator.type, 'uri');
	equals(selected[0].creator.value, 'http://www.blogger.com/profile/1109404');
	var selected2 = filtered.select(['creator']);
	equals(selected2[0].creator.type, 'uri');
	equals(selected2[0].creator.value, 'http://www.blogger.com/profile/1109404');
	ok(selected2[0].photo === undefined, 'there should not be a photo property');
});

test("selecting triples using two search patterns, then adding a triple", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	var filtered = rdf
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.value, $.uri('photo1.jpg'));
	var added = rdf.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .');
	equals(filtered.length, 2, "number of items after adding a new triple");
	equals(filtered[1].photo.value, $.uri('photo2.jpg'));
});

test("using a callback function on each match", function() {
	var count = 0, photos = [];
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces })
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	rdf.each(function (index, match) {
		count += 1;
		photos.push(match.photo);
	});
	equals(count, 2, "it should iterate twice");
	equals(photos[0].value, $.uri('photo1.jpg'));
	equals(photos[1].value, $.uri('photo2.jpg'));
});

test("using three arguments with each() to get the source triples", function() {
	var sources = [];
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces })
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	rdf.each(function (index, match, source) {
		sources.push(source);
	});
	equals(sources[0][0], $.rdf.triple(triples[0], { namespaces: namespaces }));
	equals(sources[0][1], $.rdf.triple(triples[1], { namespaces: namespaces }));
	equals(sources[1][0], $.rdf.triple(triples[2], { namespaces: namespaces }));
	equals(sources[1][1], $.rdf.triple(triples[3], { namespaces: namespaces }));
});

test("mapping each match to an array", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
		.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
		.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	var photos = rdf.map(function () {
	  return this.photo.value;
	});
	equals(photos[0], $.uri('photo1.jpg'));
	equals(photos[1], $.uri('photo2.jpg'));
});

test("using the result of bindings() as a jQuery objectct", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
		.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
		.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	var photos = rdf.map(function () { return this.photo.value });
	equals(photos[0], $.uri('photo1.jpg'));
	equals(photos[1], $.uri('photo2.jpg'));
});

test("using the result of sources() as a jQuery object", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
		.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
		.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	var triples = rdf.sources().get(0);
	equals(triples.length, 2, "there are two triples in the first match");
	equals(triples[0].subject, $.rdf.resource('<photo1.jpg>'));
	equals(triples[0].property, '<' + ns.dc + 'creator>');
	equals(triples[0].object, '<http://www.blogger.com/profile/1109404>');
	equals(triples[1].subject, '<http://www.blogger.com/profile/1109404>');
	equals(triples[1].property, '<' + ns.foaf + 'img>');
	equals(triples[1].object, $.rdf.resource('<photo1.jpg>'));
});

test("creating a jQuery object from the rdfQuery object", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
		.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
		.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
		.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	var query = rdf.jquery();
	equals(query.jquery, $(document).jquery);
});

test("filtering some results based on a regular expression", function() {
	var namespaces = { dc: 'http://purl.org/dc/elements/1.1/', '': 'http://example.org/book/', ns: 'http://example.org/ns#'};
	var triples = [
		':book1  dc:title  "SPARQL Tutorial" .',
		':book1  ns:price  42 .',
		':book2  dc:title  "The Semantic Web" .',
		':book2  ns:price  23 .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces })
		.where('?x dc:title ?title');
	equals(rdf.length, 2, "should have two items before filtering");
	var filtered = rdf.filter('title', /^SPARQL/);
	equals(filtered.length, 1, "should have one item after filtering");
	equals(filtered[0].title.value, "SPARQL Tutorial");
});

test("filtering some results, then adding a new matching triple", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('', 'http://example.org/book')
    .add(':book1 dc:title "SPARQL Tutorial"')
    .where('?x dc:title ?title')
    .filter('title', /SPARQL/);
  equals(rdf.length, 1, "should have one match before adding another triple");
  rdf.add(':book2 dc:title "Another SPARQL Tutorial"');
  equals(rdf.length, 2, "should have two matches after adding another matching triple");
});

test("filtering some results, then adding a new triple that matches the where clause but not the filter", function() {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('', 'http://example.org/book')
    .add(':book1 dc:title "SPARQL Tutorial"')
    .where('?x dc:title ?title')
    .filter('title', /SPARQL/);
  equals(rdf.length, 1, "should have one match before adding another triple");
  rdf.add(':book2 dc:title "XQuery Tutorial"');
  equals(rdf.length, 1, "should have one match after adding a non-matching triple");
});

test("creating a namespace binding explicitly, not while creating the triples", function() {
	var rdf = $.rdf()
		.prefix('dc', 'http://purl.org/dc/elements/1.1/')
		.prefix('', 'http://example.org/book/');
	try {
		rdf.add(':book1 dc:title "SPARQL Tutorial"');
		ok(true, "should not generate an error");
		equals(rdf.databank.triples()[0].subject, '<http://example.org/book/book1>');
		equals(rdf.databank.triples()[0].property, '<http://purl.org/dc/elements/1.1/title>');
	} catch (e) {
		ok(false, "should not generate the error " + e.message);
	}
});

test("creating a base URI explicitly, not while creating the triples", function() {
	var rdf = $.rdf()
		.prefix('dc', 'http://purl.org/dc/elements/1.1/')
		.base('http://www.example.org/images/')
		.add('<photo1.jpg> dc:creator "Jeni"');
	equals(rdf.databank.triples()[0].subject, '<http://www.example.org/images/photo1.jpg>');
});

test("creating an optional clause", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    .add('_:a  rdf:type        foaf:Person .')
    .add('_:a  foaf:name       "Alice" .')
    .add('_:a  foaf:mbox       <mailto:alice@example.com> .')
    .add('_:a  foaf:mbox       <mailto:alice@work.example> .')
    .add('_:b  rdf:type        foaf:Person .')
    .add('_:b  foaf:name       "Bob" .')
    .where('?x foaf:name ?name')
    .optional('?x foaf:mbox ?mbox');
  equals(rdf.length, 3, "there should be three matches");
  equals(rdf[0].name.value, "Alice");
  equals(rdf[0].mbox.value, 'mailto:alice@example.com');
  equals(rdf[1].name.value, "Alice");
  equals(rdf[1].mbox.value, 'mailto:alice@work.example');
  equals(rdf[2].name.value, "Bob");
  equals(rdf[2].mbox, undefined);
});

test("adding a triple after creating an optional clause", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:name       "Alice" .')
    .add('_:a  foaf:mbox       <mailto:alice@example.com> .')
    .add('_:a  foaf:mbox       <mailto:alice@work.example> .')
    .where('?x foaf:name ?name')
    .optional('?x foaf:mbox ?mbox');
  equals(rdf.length, 2, "there should be two matches");
  rdf.add('_:b foaf:name "Bob"');
  equals(rdf.length, 3, "there should be three matches");
  equals(rdf[2].name.value, "Bob");
  equals(rdf[2].mbox, undefined);
});

test("adding a triple that should cause the creation of two matches", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:mbox       <mailto:alice@example.com> .')
    .add('_:a  foaf:mbox       <mailto:alice@work.example> .')
    .where('?x foaf:name ?name')
    .where('?x foaf:mbox ?mbox');
  equals(rdf.length, 0, "there should be no matches");
  rdf.add('_:a  foaf:name       "Alice" .');
  equals(rdf.length, 2, "there should be two matches");
  equals(rdf[0].name.value, "Alice");
  equals(rdf[0].mbox.value, 'mailto:alice@example.com');
  equals(rdf[1].name.value, "Alice");
  equals(rdf[1].mbox.value, 'mailto:alice@work.example');
});

test("adding a triple that satisfies an optional clause", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a foaf:name "Alice" .')
    .where('?x foaf:name ?name')
  equals(rdf.length, 1, "there should be one match");
  rdf = rdf.optional('?x foaf:mbox ?mbox');
  equals(rdf.length, 1, "there should be one match");
  rdf = rdf.add('_:a foaf:mbox <mailto:alice@example.com> .')
  equals(rdf.length, 1, "there should be one match");
  equals(rdf[0].name.value, "Alice");
  equals(rdf[0].mbox.value, 'mailto:alice@example.com');
});

test("multiple optional clauses", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:name       "Alice" .')
    .add('_:a  foaf:homepage   <http://work.example.org/alice/> .')
    .add('_:b  foaf:name       "Bob" .')
    .add('_:b  foaf:mbox       <mailto:bob@work.example> .')
    .where('?x foaf:name ?name')
    .optional('?x foaf:mbox ?mbox')
    .optional('?x foaf:homepage ?hpage');
  equals(rdf.length, 2, "there should be two matches");
  equals(rdf[0].name.value, "Alice");
  equals(rdf[0].mbox, undefined);
  equals(rdf[0].hpage.value, 'http://work.example.org/alice/');
  equals(rdf[1].name.value, "Bob");
  equals(rdf[1].mbox.value, 'mailto:bob@work.example');
  equals(rdf[1].hpage, undefined);
});

test("creating a union from two sets of triples", function() {
  var rdfA = $.rdf()
    .prefix('dc', ns.dc)
    .add('<photo1.jpg> dc:creator "Jane"');
  var rdfB = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('<photo1.jpg> foaf:depicts "Jane"');
  var rdf = rdfA.add(rdfB);
  equals(rdf.union, undefined, "it shouldn't create a query union");
  equals(rdf.databank.union.length, 2, "the databank should be a union");
  equals(rdf.prefix('dc'), ns.dc);
  equals(rdf.prefix('foaf'), ns.foaf);
  rdf = rdf
    .where('?photo dc:creator ?person');
  equals(rdf.length, 1, "it should contain one match");
  equals(rdf.get(0).photo.value, $.uri('photo1.jpg'));
  equals(rdf.get(0).person.value, "Jane");
  rdf = rdf
    .where('?photo foaf:depicts ?person');
  equals(rdf.length, 1, "it should contain one match");
  equals(rdf.get(0).photo.value, $.uri('photo1.jpg'));
  equals(rdf.get(0).person.value, "Jane");
});

test("creating a union from two differently filtered sets of triples", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:c  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?title');
  equals(rdfA.length, 2, "there should be two matches in the first group");
  var rdfB = rdf.where('?book dc11:title ?title');
  equals(rdfB.length, 2, "there should be two matches in the second group");
  var union = rdfA.add(rdfB);
  equals(union.length, 4, "there should be four matches in the union");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(union.get(1).title.value, "SPARQL");
  equals(union.get(2).title.value, "SPARQL Protocol Tutorial");
  equals(union.get(3).title.value, "SPARQL (updated)")
});

test("creating a union with different bindings", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:c  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?x');
  var rdfB = rdf.where('?book dc11:title ?y');
  var union = rdfA.add(rdfB);
  equals(union.length, 4, "there should be four matches in the union");
  equals(union.get(0).x.value, "SPARQL Query Language Tutorial");
  equals(union.get(1).x.value, "SPARQL");
  equals(union.get(2).y.value, "SPARQL Protocol Tutorial");
  equals(union.get(3).y.value, "SPARQL (updated)")
});

test("creating a union where several filters have been applied", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:c  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?title').where('?book dc10:creator ?author');
  var rdfB = rdf.where('?book dc11:title ?title').where('?book dc11:creator ?author');
  var union = rdfA.add(rdfB);
  equals(union.length, 2, "there should be two matches in the union");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(union.get(0).author.value, "Alice");
  equals(union.get(1).title.value, "SPARQL Protocol Tutorial");
  equals(union.get(1).author.value, "Bob");
});

test("adding a triple to a union", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:c  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?title').where('?book dc10:creator ?author');
  var rdfB = rdf.where('?book dc11:title ?title').where('?book dc11:creator ?author');
  var union = rdfA.add(rdfB);
  equals(union.length, 2, "there should be two matches in the union");
  union = union.add('_:c dc10:creator "Claire"');
  equals(union.length, 3, "there should be three matches in the union");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(union.get(0).author.value, "Alice");
  equals(union.get(1).title.value, "SPARQL Protocol Tutorial");
  equals(union.get(1).author.value, "Bob");
  equals(union.get(2).title.value, "SPARQL");
  equals(union.get(2).author.value, "Claire");
});

test("filtering a union with a where clause", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:d  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?title');
  var rdfB = rdf.where('?book dc11:title ?title');
  var union = rdfA.add(rdfB);
  equals(union.length, 4, "there should be four matches in the union");
  union = union.where('?book dc10:creator ?author');
  equals(union.length, 1, "there should be one match in the union");
  equals(union.get(0).author.value, "Alice");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  union = union.add('_:c dc10:creator "Alex"');
  equals(union.length, 2, "there should be two matches in the union");
  equals(union.get(1).title.value, "SPARQL");
  equals(union.get(1).author.value, "Alex");
});

test("adding a binding after filtering with two where clauses", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:d  dc11:title     "SPARQL (updated)" .')
    .where('?book dc11:title ?title')
    .where('?book dc10:creator ?author');
  equals(rdf.length, 0, "there should be no matches");
  rdf = rdf.add('_:c dc10:creator "Claire"');
  equals(rdf.length, 0, "there should still be no matches");
});

test("filtering a union with a filter clause", function() {
  var rdf = $.rdf()
    .prefix('dc10', 'http://purl.org/dc/elements/1.0/')
    .prefix('dc11', 'http://purl.org/dc/elements/1.1/>')
    .add('_:a  dc10:title     "SPARQL Query Language Tutorial" .')
    .add('_:a  dc10:creator   "Alice" .')
    .add('_:b  dc11:title     "SPARQL Protocol Tutorial" .')
    .add('_:b  dc11:creator   "Bob" .')
    .add('_:c  dc10:title     "SPARQL" .')
    .add('_:c  dc11:title     "SPARQL (updated)" .');
  var rdfA = rdf.where('?book dc10:title ?title').where('?book dc10:creator ?author');
  equals(rdfA.length, 1, "there should be one match in the first query");
  equals(rdfA.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(rdfA.get(0).author.value, "Alice");
  var rdfB = rdf.where('?book dc11:title ?title').where('?book dc11:creator ?author');
  equals(rdfB.length, 1, "there should be one match in the second query");
  equals(rdfB.get(0).title.value, "SPARQL Protocol Tutorial");
  equals(rdfB.get(0).author.value, "Bob");
  var union = rdfA.add(rdfB);
  equals(union.length, 2, "there should be two matches in the union");
  union = union.filter('author', /^A/);
  ok(true, "...after filtering...")
  equals(union.length, 1, "there should be one match in the union");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(union.get(0).author.value, "Alice");
  union = union.add('_:c dc10:creator "Alex"');
  ok(true, "...after adding a triple...")
  equals(union.length, 2, "there should be two matches in the union");
  equals(union.get(0).title.value, "SPARQL Query Language Tutorial");
  equals(union.get(0).author.value, "Alice");
  equals(union.get(1).title.value, "SPARQL");
  equals(union.get(1).author.value, "Alex");
});

test("grouping based on a binding", function () {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:name   "Alice" .')
    .add('_:a  foaf:mbox   <mailto:alice@work.example> .')
    .add('_:a  foaf:mbox   <mailto:alice@home.example> .')
    .add('_:b  foaf:name   "Bob" .')
    .add('_:b  foaf:mbox   <mailto:bob@work.example> .')
    .where('?person foaf:name ?name')
    .where('?person foaf:mbox ?email');
  equals(rdf.length, 3, "there should be three matches");
  rdf = rdf.group('person');
  equals(rdf.length, 2, "there should be two matches");
  equals(rdf[0].person.value, "_:a");
  equals(rdf[0].name[0].value, "Alice");
  equals(rdf[0].email[0].value, "mailto:alice@work.example");
  equals(rdf[0].email[1].value, "mailto:alice@home.example");
  equals(rdf[1].person.value, "_:b");
  equals(rdf[1].name[0].value, "Bob");
  equals(rdf[1].email[0].value, "mailto:bob@work.example");
});

test("grouping based on two bindings", function () {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:givenname   "Alice" .')
    .add('_:a foaf:family_name "Hacker" .')
    .add('_:c  foaf:givenname   "Alice" .')
    .add('_:c foaf:family_name "Hacker" .')
    .add('_:b  foaf:givenname   "Bob" .')
    .add('_:b foaf:family_name "Hacker" .')
    .where('?person foaf:givenname ?forename')
    .where('?person foaf:family_name ?surname');
  equals(rdf.length, 3, "there should be three matches");
  group1 = rdf.group('surname');
  equals(group1.length, 1, "there should be one group");
  group2 = rdf.group(['surname', 'forename']);
  equals(group2.length, 2, "there should be two groups");
  equals(group2[0].forename.value, "Alice");
  equals(group2[0].surname.value, "Hacker");
  equals(group2[0].person[0].value, "_:a");
  equals(group2[0].person[1].value, "_:c");
  equals(group2[1].forename.value, "Bob");
  equals(group2[1].surname.value, "Hacker");
  equals(group2[1].person[0].value, "_:b");
});

test("getting just the first match", function() {
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a  foaf:name       "Alice" .')
    .add('_:a  foaf:homepage   <http://work.example.org/alice/> .')
    .add('_:b  foaf:name       "Bob" .')
    .add('_:b  foaf:mbox       <mailto:bob@work.example> .')
    .where('?x foaf:name ?name');
  equals(rdf.length, 2, "there should be two matches");
  rdf = rdf.eq(1);
  equals(rdf.length, 1, "there should be one match");
  equals(rdf[0].name.value, "Bob");
});

test("creating new triples based on a template", function() {
  var rdf = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a    foaf:givenname   "Alice" .')
    .add('_:a    foaf:family_name "Hacker" .')
    .add('_:b    foaf:givenname   "Bob" .')
    .add('_:b    foaf:family_name "Hacker" .')
    .where('?person foaf:givenname ?gname')
    .where('?person foaf:family_name ?fname');
  equals(rdf.databank.size(), 4, "should contain four triples");
  equals(rdf.length, 2, "should have two matches");
  rdf = rdf.prefix('vcard', ns.vcard)
    .add('?person vcard:N []');
  equals(rdf.databank.size(), 6, "should contain six triples");
  equals(rdf.length, 2, "should have two matches");
  /*
  rdf.where('?person vcard:N ?v')
    .add('?v vcard:givenname ?gname')
    .add('?v vcard:familyName ?fname');
  equals(rdf.databank.length, 10, "should contain ten triples");
  */
});

test("deleting triples based on a template", function () {
  var rdf = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a    foaf:givenname   "Alice" .')
    .add('_:a    foaf:family_name "Hacker" .')
    .add('_:b    foaf:givenname   "Bob" .')
    .add('_:b    foaf:family_name "Hacker" .')
    .where('?person foaf:givenname ?gname')
    .where('?person foaf:family_name ?fname');
  equals(rdf.databank.size(), 4, "should contain four triples");
  equals(rdf.length, 2, "should have two matches");
  rdf = rdf.remove('?person foaf:family_name ?fname');
  equals(rdf.databank.size(), 2, "should contain two triples");
  equals(rdf.length, 0, "should have no matches");
  rdf = rdf.end();
  equals(rdf.length, 2, "should have two matches");
});

test("using end() to reset a filter", function() {
  var rdf = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a    foaf:givenname   "Alice" .')
    .add('_:a    foaf:family_name "Hacker" .')
    .add('_:b    foaf:givenname   "Bob" .')
    .add('_:b    foaf:family_name "Hacker" .')
    .where('?person foaf:family_name "Hacker"');
  equals(rdf.length, 2, "should have two matches");
  rdf = rdf.where('?person foaf:givenname "Alice"');
  equals(rdf.length, 1, "should have one match");
  rdf = rdf.end();
  equals(rdf.length, 2, "should have two matches again");
  rdf = rdf.end();
  equals(rdf.length, 0, "should have no matches");
});

test("using end() to reset a filter after adding something that matches the previous set of filters", function() {
  var rdf = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a    foaf:givenname   "Alice" .')
    .add('_:a    foaf:family_name "Hacker" .')
    .add('_:b    foaf:givenname   "Bob" .')
    .add('_:b    foaf:family_name "Hacker" .')
    .where('?person foaf:family_name "Hacker"');
  equals(rdf.length, 2, "should have two matches");
  rdf = rdf.where('?person foaf:givenname "Alice"');
  equals(rdf.length, 1, "should have one match");
  rdf = rdf.add('_:c foaf:family_name "Hacker"');
  equals(rdf.length, 1, "should have one match")
  rdf = rdf.end();
  equals(rdf.length, 3, "should have three matches now");
  rdf = rdf.end();
  equals(rdf.length, 0, "should have no matches");
});

test("using reset() to reset all filters completely", function() {
  var rdf = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a    foaf:givenname   "Alice" .')
    .add('_:a    foaf:family_name "Hacker" .')
    .add('_:b    foaf:givenname   "Bob" .')
    .add('_:b    foaf:family_name "Hacker" .')
    .where('?person foaf:family_name "Hacker"')
    .where('?person foaf:givenname "Alice"');
  equals(rdf.length, 1, "should have one match");
  rdf = rdf.reset();
  equals(rdf.length, 0, "should have no matches");
});

test("using end with subsequent filters", function () {
  var scottish = [];
  var irish = [];
  var rdf = $.rdf()
    .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
    .add('_:a foaf:surname "Jones" .')
    .add('_:b foaf:surname "Macnamara" .')
    .add('_:c foaf:surname "O\'Malley"')
    .add('_:d foaf:surname "MacFee"')
    .where('?person foaf:surname ?surname')
      .filter('surname', /^Ma?c/)
        .each(function () { scottish.push(this.surname.value); })
      .end()
      .filter('surname', /^O'/)
        .each(function () { irish.push(this.surname.value); })
      .end();
  equals(scottish.length, 2, "there should be two scottish surnames");
  equals(irish.length, 1, "there should be one irish surname");
});

test("getting all the data about a particular resource", function () {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
  	.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
  	.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
  	.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
  	.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
    .about('<http://www.blogger.com/profile/1109404>');
  equals(rdf.length, 2, "there are two triples about <http://www.blogger.com/profile/1109404>");
  equals(rdf[0].property.value, ns.foaf + 'img');
  equals(rdf[0].value.value, $.uri('photo1.jpg'));
  equals(rdf[1].property.value, ns.foaf + 'img');
  equals(rdf[1].value.value, $.uri('photo2.jpg'));
});

test("getting the difference between two top-level queries", function () {
  var r1 = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:a foaf:surname "Smith"');
  var r2 = $.rdf()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:b foaf:surname "Jones"');
  var diff1 = r1.except(r2);
  equals(diff1.databank.size(), 1);
  equals(diff1.databank.triples()[0], $.rdf.triple('_:a foaf:surname "Smith"', { namespaces: { foaf: ns.foaf }}));
  var diff2 = r2.except(r1);
  equals(diff2.databank.size(), 1);
  equals(diff2.databank.triples()[0], $.rdf.triple('_:b foaf:surname "Jones"', { namespaces: { foaf: ns.foaf }}));
});

test("dumping the result of a query", function () {
  var rdf = $.rdf()
    .prefix('dc', ns.dc)
    .prefix('foaf', ns.foaf)
  	.add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
  	.add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .')
  	.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
  	.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .')
    .about('<http://www.blogger.com/profile/1109404>');
  equals(rdf.length, 2, "there are two triples about <http://www.blogger.com/profile/1109404>");
  var dump = rdf.dump();
  ok(dump['http://www.blogger.com/profile/1109404'] !== undefined, 'there should be a property for the subject');
  equals(dump['http://www.blogger.com/profile/1109404'][ns.foaf + 'img'].length, 2);
});

module("Dumping Databanks");

test("dumping in RDF/XML a triple whose subject is a blank node", function() {
  var namespaces = { foaf: ns.foaf };
  var triple = $.rdf.triple('_:someone foaf:name "Jeni"', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:nodeID');
	ok(a !== undefined && a !== null, 'it should have an rdf:nodeID attribute');
	equals(a.nodeValue, 'someone');
});

test("dumping a serialised version of RDF/XML", function() {
  var namespaces = { foaf: ns.foaf };
  var triple = $.rdf.triple('_:someone foaf:name "Jeni"', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', serialize: true, namespaces: namespaces });
  equals(dump, 
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
    'xmlns:foaf="http://xmlns.com/foaf/0.1/">' +
    '<rdf:Description rdf:nodeID="someone">' +
    '<foaf:name>Jeni</foaf:name>' +
    '</rdf:Description>' +
    '</rdf:RDF>');
});

test("dumping in RDF/XML a triple whose property is rdf:type", function() {
  var namespaces = { foaf: ns.foaf };
  var triple = $.rdf.triple('_:someone a foaf:Person', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	equals(d.namespaceURI, ns.foaf);
	equals(d.nodeName, 'foaf:Person');
	var a = d.attributes.getNamedItem('rdf:nodeID');
	ok(a !== undefined && a !== null, 'it should have an rdf:nodeID attribute');
	equals(a.nodeValue, 'someone');
	equals(d.childNodes.length, 0, 'the rdf:type element shouldn\'t appear');
});

test("dumping in RDF/XML a triple whose object is a blank node", function() {
  var namespaces = { dc: ns.dc };
  var triple = $.rdf.triple('<photo1.jpg> dc:creator _:someone', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triple.subject.value);
	equals(d.childNodes.length, 1);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc);
	equals(p.nodeName, 'dc:creator');
	var a = p.attributes.getNamedItem('rdf:nodeID');
	ok(a !== undefined && a !== null, 'it should have an rdf:nodeID attribute');
	equals(a.nodeValue, 'someone');
});

test("dumping in RDF/XML a triple whose object is a untyped literal", function() {
  var namespaces = { dc: ns.dc };
  var triple = $.rdf.triple('<photo1.jpg> dc:creator "Jeni"', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triple.subject.value);
	equals(d.childNodes.length, 1);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc);
	equals(p.nodeName, 'dc:creator');
	equals(p.childNodes.length, 1);
	equals(p.childNodes[0].nodeValue, 'Jeni');
});

test("dumping in RDF/XML a triple whose object is a typed literal", function() {
  var namespaces = { dc: ns.dc, xsd: ns.xsd };
  var triple = $.rdf.triple('<photo1.jpg> dc:created "2009-01-01"^^xsd:date', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triple.subject.value);
	equals(d.childNodes.length, 1);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc);
	equals(p.nodeName, 'dc:created');
	equals(p.childNodes.length, 1);
	equals(p.childNodes[0].nodeValue, '2009-01-01');
	var a = p.attributes.getNamedItem('rdf:datatype');
	ok(a !== undefined && a !== null, 'it should have an rdf:datatype attribute');
	equals(a.nodeValue, ns.xsd + 'date');
});

test("dumping in RDF/XML a triple whose object is a literal with a language", function() {
  var namespaces = { dc: ns.dc, xsd: ns.xsd };
  var triple = $.rdf.triple('<photo1.jpg> dc:creator "Jeni"@en', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1);
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triple.subject.value);
	equals(d.childNodes.length, 1);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc);
	equals(p.nodeName, 'dc:creator');
	equals(p.childNodes.length, 1);
	equals(p.childNodes[0].nodeValue, 'Jeni');
	var a = p.attributes.getNamedItem('xml:lang');
	ok(a !== undefined && a !== null, 'it should have an xml:lang attribute');
	equals(a.nodeValue, 'en');
});

test("dumping in RDF/XML a triple whose object is an XML Literal", function() {
  var namespaces = { dc: ns.dc, rdf: ns.rdf };
  var triple = $.rdf.triple('<> dc:title "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^rdf:XMLLiteral .', { namespaces: namespaces });
  var dump = $.rdf.dump([triple], { format: 'application/rdf+xml', namespaces: namespaces });
  equals(dump.documentElement.nodeName, 'rdf:RDF');
	var r = dump.documentElement;
	equals(r.childNodes.length, 1, 'the rdf:RDF element should have one child node');
	var d = r.childNodes[0];
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triple.subject.value, 'the about attribute should hold the subject');
	equals(d.childNodes.length, 1, 'the description element should have one child node');
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc, 'the property element should be in the dublin core namespace');
	equals(p.nodeName, 'dc:title', 'the property element should be called title');
	var a = p.attributes.getNamedItem('rdf:parseType');
	ok(a !== undefined && a !== null, 'it should have an rdf:parseType attribute');
	equals(a.nodeValue, 'Literal');
	equals(p.childNodes.length, 3, 'the property element should have three child nodes');
	equals(p.childNodes[0].nodeValue, 'E = mc', 'the first child node should be a text node with the value E = mc');
	var s = p.childNodes[1];
	equals(s.namespaceURI, 'http://www.w3.org/1999/xhtml', 'the second child should be in the XHTML namespace');
	equals(s.nodeName, 'sup', 'the second child should be a sup element');
	var a = s.attributes.getNamedItem('xmlns');
	ok(a !== undefined && a !== null, 'it should have an xmlns attribute');
	equals(a.nodeValue, 'http://www.w3.org/1999/xhtml', 'the xmlns attribute should have an XHTML namespace declaration on it');
	equals(s.childNodes.length, 1, 'the sup element should have a child node');
	equals(s.childNodes[0].nodeValue, '2', 'the text of the sup element should be 2');
	equals(p.childNodes[2].nodeValue, ': The Most Urgent Problem of Our Time', 'the third child node should be a text node with the value : The Most Urgent Problem of Our Time');
});


module("Creating Databanks");

test("creating a new databank", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', { namespaces: namespaces }),
		$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', { namespaces: namespaces })
	];
	var data = $.rdf.databank(triples);
	equals(data.subjectIndex[triples[0].subject].length, 1);
	equals(data.subjectIndex[triples[0].subject][0], triples[0]);
	equals(data.subjectIndex[triples[1].subject].length, 1);
	equals(data.subjectIndex[triples[1].subject][0], triples[1]);
	equals(data.size(), 2);

	var e = data.dump();
	ok(e[triples[0].subject.value] !== undefined, 'the dump should have a property equal to the subject of the first triple');
	ok(e[triples[1].subject.value] !== undefined, 'the dump should have a property equals to the subject of the second triple');
	ok(e[triples[0].subject.value][triples[0].property.value], 'expecting { subject: { property: { value }}}');
	ok(e[triples[1].subject.value][triples[1].property.value], 'expecting { subject: { property: { value }}}');
	equals(e[triples[0].subject.value][triples[0].property.value][0].type, 'uri');
	equals(e[triples[0].subject.value][triples[0].property.value][0].value, 'http://www.blogger.com/profile/1109404');

  var j = data.dump({ serialize: true });
  equals(j, '{"' + triples[0].subject.value + '": {"http://purl.org/dc/elements/1.1/creator": [{"type": "uri", "value": "http://www.blogger.com/profile/1109404"}]}, "http://www.blogger.com/profile/1109404": {"http://xmlns.com/foaf/0.1/img": [{"type": "uri", "value": "' + triples[0].subject.value + '"}]}}');

	var x = data.dump({ format: 'application/rdf+xml', namespaces: namespaces });
	equals(x.documentElement.nodeName, 'rdf:RDF');
	var r = x.documentElement;

	var xmlnsRdf = r.attributes.getNamedItem('xmlns:rdf');
	ok(xmlnsRdf !== undefined && xmlnsRdf !== null, 'it should have an xmlns:rdf declaration');
	equals(xmlnsRdf.nodeValue, ns.rdf);
       var xmlnsDc = r.attributes.getNamedItem('xmlns:dc');
	ok(xmlnsDc !== undefined && xmlnsDc !== null, 'it should have an xmlns:dc declaration');
	equals(xmlnsDc.nodeValue, ns.dc);
	var xmlnsFoaf = r.attributes.getNamedItem('xmlns:foaf');
	ok(xmlnsFoaf !== undefined && xmlnsFoaf !== null, 'it should have an xmlns:foaf declaration');
	equals(xmlnsFoaf.nodeValue, ns.foaf);

	equals(r.childNodes.length, 2);
	var d = r.childNodes[0];
	equals(d.namespaceURI, ns.rdf);
	equals(d.nodeName, 'rdf:Description');
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triples[0].subject.value);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.dc);
	equals(p.nodeName, 'dc:creator');
	var a = p.attributes.getNamedItem('rdf:resource');
	ok(a !== undefined && a !== null, 'it should have an rdf:resource attribute');
	equals(a.nodeValue, triples[0].object.value);

	var d = r.childNodes[1];
	equals(d.namespaceURI, ns.rdf);
	equals(d.nodeName, 'rdf:Description');
	var a = d.attributes.getNamedItem('rdf:about');
	ok(a !== undefined && a !== null, 'it should have an rdf:about attribute');
	equals(a.nodeValue, triples[1].subject.value);
	var p = d.childNodes[0];
	equals(p.namespaceURI, ns.foaf);
	equals(p.nodeName, 'foaf:img');
	var a = p.attributes.getNamedItem('rdf:resource');
	ok(a !== undefined && a !== null, 'it should have an rdf:resource attribute');
	equals(a.nodeValue, triples[1].object.value);
});

test("loading JSON/RDF into a databank", function() {
  var json = {
    'http://example.com/aReallyGreatBook': {
      'http://purl.org/dc/elements/1.1/title': [ { type: 'literal', value: 'A Really Great Book' } ],
      'http://purl.org/dc/elements/1.1/creator': [ { type: 'bnode', value: '_:creator' } ],
      'http://purl.org/dc/terms/issued': [ { type: 'literal', value: '2004-01-19',
                                             datatype: 'http://www.w3.org/2001/XMLSchema#date' } ]
    },
    '_:creator': {
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [ { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' } ],
      'http://xmlns.com/foaf/0.1/name': [ { type: 'literal', value: 'John Doe' } ]
    }
  };
  var databank = $.rdf.databank();
  databank.load(json);
  equals(databank.size(), 5);
});

/*
test("loading remote RDF/XML into a databank", function () {
  var url = 'http://xmlns.com/foaf/0.1/';
  var databank = $.rdf.databank();
  databank.load(url);
  ok(databank.size() > 5, "it should get the triples from the remote RDF/XML");
});
*/

function parseFromString(xml){
  var doc;
  try {
    doc = new ActiveXObject("Microsoft.XMLDOM");
    doc.async = "false";
    doc.loadXML(xml);
  } catch(e) {
    var parser = new DOMParser();
    doc = parser.parseFromString(xml, 'text/xml');
  }
  return doc;
};

test("loading RDF/XML into a databank", function() {
  var xml =
    '<rdf:Description xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '    xmlns:dc="http://purl.org/dc/elements/1.1/"                         ' +
    '    rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">                ' +
    '  <dc:title>RDF/XML Syntax Specification (Revised)</dc:title>           ' +
    '</rdf:Description>                                                      ';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 1);
  var triple = databank.triples()[0];
  equals(triple.subject.value.toString(), 'http://www.w3.org/TR/rdf-syntax-grammar');
  equals(triple.property.value.toString(), ns.dc + 'title');
  equals(triple.object.value.toString(), 'RDF/XML Syntax Specification (Revised)');
});

test("loading RDF/XML with (anonymous) blank nodes into a databank", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:ex="http://www.example.org/">' +
    '  <ex:editor>' +
    '    <rdf:Description>' +
    '      <ex:homePage>' +
    '        <rdf:Description rdf:about="http://purl.org/net/dajobe/">' +
    '        </rdf:Description>' +
    '      </ex:homePage>' +
    '    </rdf:Description>' +
    '  </ex:editor>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 2);
  var triple1 = databank.triples()[0];
  var triple2 = databank.triples()[1];
  equals(triple2.subject.value, 'http://www.w3.org/TR/rdf-syntax-grammar');
  equals(triple2.property.value, 'http://www.example.org/editor');
  equals(triple2.object, triple1.subject);
  equals(triple1.property.value, 'http://www.example.org/homePage');
  equals(triple1.object.value, 'http://purl.org/net/dajobe/');
});

test("loading RDF/XML with multiple property elements", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  xmlns:ex="http://www.example.org/">' +
    '  <ex:editor>' +
    '    <rdf:Description>' +
    '      <ex:homePage>' +
    '        <rdf:Description rdf:about="http://purl.org/net/dajobe/">' +
    '        </rdf:Description>' +
    '      </ex:homePage>' +
    '      <ex:fullName>Dave Beckett</ex:fullName>' +
    '    </rdf:Description>' +
    '  </ex:editor>' +
    '  <dc:title>RDF/XML Syntax Specification (Revised)</dc:title>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
});

test("loading RDF/XML with an rdf:resource attribute", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  xmlns:ex="http://www.example.org/">' +
    '  <ex:editor>' +
    '    <rdf:Description>' +
    '      <ex:homePage rdf:resource="http://purl.org/net/dajobe/" />' +
    '      <ex:fullName>Dave Beckett</ex:fullName>' +
    '    </rdf:Description>' +
    '  </ex:editor>' +
    '  <dc:title>RDF/XML Syntax Specification (Revised)</dc:title>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
});

test("loading RDF/XML with property attributes", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  dc:title="RDF/XML Syntax Specification (Revised)"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  xmlns:ex="http://www.example.org/">' +
    '  <ex:editor>' +
    '    <rdf:Description ex:fullName="Dave Beckett">' +
    '      <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>' +
    '    </rdf:Description>' +
    '  </ex:editor>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
});

test("loading RDF/XML whose document element is an rdf:RDF element", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '         xmlns:ex="http://example.org/stuff/1.0/">' +
    '  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '		   dc:title="RDF/XML Syntax Specification (Revised)">' +
    '    <ex:editor>' +
    '      <rdf:Description ex:fullName="Dave Beckett">' +
    '	<ex:homePage rdf:resource="http://purl.org/net/dajobe/" />' +
    '      </rdf:Description>' +
    '    </ex:editor>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
});

test("loading RDF/XML with xml:lang attributes in it", function () {
  var xml =
    '<rdf:Description xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  rdf:about="http://example.org/buecher/baum" xml:lang="de">' +
    '  <dc:title>Der Baum</dc:title>' +
    '  <dc:description>Das Buch ist außergewöhnlich</dc:description>' +
    '  <dc:title xml:lang="en">The Tree</dc:title>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 3);
  var triples = databank.triples();
  equals(triples[0].object.value, 'Der Baum');
  equals(triples[0].object.lang, 'de');
  equals(triples[1].object.lang, 'de');
  equals(triples[2].object.lang, 'en');
});

test("loading RDF/XML containing XML literals", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:ex="http://example.org/stuff/1.0/">' +
    '  <rdf:Description rdf:about="http://example.org/item01">' +
    '    <ex:prop rdf:parseType="Literal"' +
    '             xmlns:a="http://example.org/a#">' +
    '      <a:Box required="true"><a:widget size="10" /><a:grommit id="23" /></a:Box>' +
    '    </ex:prop>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 1);
  equals(databank.triples()[0].object.value, '<a:Box xmlns:a="http://example.org/a#" required="true"><a:widget size="10"/><a:grommit id="23"/></a:Box>');
  equals(databank.triples()[0].object.datatype, ns.rdf + 'XMLLiteral');
});

test("loading RDF/XML with a property whose value has a datatype", function () {
  var xml =
    '<rdf:Description rdf:about="http://example.org/item01"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:ex="http://www.example.org/">' +
    '  <ex:size rdf:datatype="http://www.w3.org/2001/XMLSchema#int">123</ex:size>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 1);
  equals(databank.triples()[0].object.value, '123');
  equals(databank.triples()[0].object.datatype, ns.xsd + 'int');
});

test("loading RDF/XML with identified blank nodes", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '         xmlns:ex="http://example.org/stuff/1.0/">' +
    '  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '		   dc:title="RDF/XML Syntax Specification (Revised)">' +
    '    <ex:editor rdf:nodeID="abc"/>' +
    '  </rdf:Description>' +
    '  <rdf:Description rdf:nodeID="abc"' +
    '                   ex:fullName="Dave Beckett">' +
    '    <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
  equals(databank.triples()[1].object.type, 'bnode');
  equals(databank.triples()[1].object.value, '_:abc');
  equals(databank.triples()[2].subject.type, 'bnode');
  equals(databank.triples()[2].subject.value, '_:abc');
});

test("loading RDF/XML with rdf:parseType='Resource'", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  xmlns:ex="http://example.org/stuff/1.0/"' +
  	'	 dc:title="RDF/XML Syntax Specification (Revised)">' +
    '  <ex:editor rdf:parseType="Resource">' +
    '    <ex:fullName>Dave Beckett</ex:fullName>' +
    '    <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>' +
    '  </ex:editor>' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 4);
  var triples = databank.triples();
  equals(triples[3].object, triples[1].subject);
});

test("loading RDF/XML with a property element having property attributes", function () {
  var xml =
    '<rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"' +
    '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '  xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '  xmlns:ex="http://example.org/stuff/1.0/"' +
  	'	   dc:title="RDF/XML Syntax Specification (Revised)">' +
    '  <ex:editor ex:fullName="Dave Beckett" />' +
    '</rdf:Description>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 3);
});

test("loading RDF/XML with typed node elements", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    '         xmlns:ex="http://example.org/stuff/1.0/">' +
    '  <ex:Document rdf:about="http://example.org/thing">' +
    '    <dc:title>A marvelous thing</dc:title>' +
    '  </ex:Document>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  equals(databank.size(), 2);
  equals(databank.triples()[0].property.value, ns.rdf + 'type');
  equals(databank.triples()[0].object.value, 'http://example.org/stuff/1.0/Document');
});

test("loading RDF/XML with xml:base and rdf:ID attributes", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:ex="http://example.org/stuff/1.0/"' +
    '         xml:base="http://example.org/here/">' +
    '  <rdf:Description rdf:ID="snack">' +
    '    <ex:prop rdf:resource="fruit/apple"/>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  var triples = databank.triples();
  equals(triples[0].subject.value, 'http://example.org/here/#snack');
  equals(triples[0].object.value, 'http://example.org/here/fruit/apple');
});

test("loading RDF/XML with rdf:li elements", function () {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
    '  <rdf:Seq rdf:about="http://example.org/favourite-fruit">' +
    '    <rdf:li rdf:resource="http://example.org/banana"/>' +
    '    <rdf:li rdf:resource="http://example.org/apple"/>' +
    '    <rdf:li rdf:resource="http://example.org/pear"/>' +
    '  </rdf:Seq>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  var triples = databank.triples();
  equals(triples.length, 4);
  equals(triples[1].property.value, ns.rdf + '_1');
  equals(triples[2].property.value, ns.rdf + '_2');
  equals(triples[3].property.value, ns.rdf + '_3');
});

test("loading RDF/XML with parseType='Collection'", function() {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:ex="http://example.org/stuff/1.0/">' +
    '  <rdf:Description rdf:about="http://example.org/basket">' +
    '    <ex:hasFruit rdf:parseType="Collection">' +
    '      <rdf:Description rdf:about="http://example.org/banana"/>' +
    '      <rdf:Description rdf:about="http://example.org/apple"/>' +
    '      <rdf:Description rdf:about="http://example.org/pear"/>' +
    '    </ex:hasFruit>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  var triples = databank.triples();
  // 0: _:b1 rdf:first <http://example.org/banana>
  // 1: _:b1 rdf:rest _:b2
  // 2: _:b2 rdf:first <http://example.org/apple>
  // 3: _:b2 rdf:rest _:b3
  // 4: _:b3 rdf:first <http://example.org/pear>
  // 5: _:b3 rdf:rest rdf:nil
  // 6: <http://example.org/basket> ex:hasFruit _:b1
  equals(triples[0].property.value, ns.rdf + 'first');
  equals(triples[0].object.value, 'http://example.org/banana');
  equals(triples[6].object, triples[1].subject);
  equals(triples[1].property.value, ns.rdf + 'rest');
  equals(triples[1].object, triples[2].subject);
  equals(triples[2].property.value, ns.rdf + 'first');
  equals(triples[2].object.value, 'http://example.org/apple');
  equals(triples[1].object, triples[3].subject);
  equals(triples[3].property.value, ns.rdf + 'rest');
  equals(triples[3].object, triples[4].subject);
  equals(triples[4].property.value, ns.rdf + 'first');
  equals(triples[4].object.value, 'http://example.org/pear');
  equals(triples[3].object, triples[5].subject);
  equals(triples[5].property.value, ns.rdf + 'rest');
  equals(triples[5].object.value, ns.rdf + 'nil');
  equals(triples[6].subject.value, 'http://example.org/basket');
  equals(triples[6].property.value, 'http://example.org/stuff/1.0/hasFruit');
  equals(triples[6].object.type, 'bnode');
  equals(triples[6].object, triples[0].subject);
});

test("loading RDF/XML with rdf:IDs to reify triples", function() {
  var xml =
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
    '         xmlns:ex="http://example.org/stuff/1.0/"' +
    '         xml:base="http://example.org/triples/">' +
    '  <rdf:Description rdf:about="http://example.org/">' +
    '    <ex:prop rdf:ID="triple1">blah</ex:prop>' +
    '  </rdf:Description>' +
    '</rdf:RDF>';
  var doc = parseFromString(xml);
  var databank = $.rdf.databank();
  databank.load(doc);
  var triples = databank.triples();
  equals(triples.length, 4);
  equals(triples[0].subject.value, 'http://example.org/');
  equals(triples[0].property.value, 'http://example.org/stuff/1.0/prop');
  equals(triples[0].object.value, 'blah');
  equals(triples[1].subject.value, 'http://example.org/triples/#triple1');
  equals(triples[1].property.value, ns.rdf + 'subject');
  equals(triples[1].object.value, 'http://example.org/');
  equals(triples[2].subject.value, 'http://example.org/triples/#triple1');
  equals(triples[2].property.value, ns.rdf + 'property');
  equals(triples[2].object.value, 'http://example.org/stuff/1.0/prop');
  equals(triples[3].subject.value, 'http://example.org/triples/#triple1');
  equals(triples[3].property.value, ns.rdf + 'object');
  equals(triples[3].object.value, 'blah');
});

test("getting the triples from a databank", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', { namespaces: namespaces }),
		$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', { namespaces: namespaces })
	];
	var data = $.rdf.databank(triples);
	equals(data.triples()[0], triples[0]);
	equals(data.triples()[1], triples[1]);
});

test("getting the difference between two databanks", function () {
  var d1 = $.rdf.databank()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:a foaf:surname "Smith"');
  var d2 = $.rdf.databank()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:b foaf:surname "Jones"');
  var diff1 = d1.except(d2);
  equals(diff1.size(), 1);
  equals(diff1.triples()[0], $.rdf.triple('_:a foaf:surname "Smith"', { namespaces: { foaf: ns.foaf }}));
  var diff2 = d2.except(d1);
  equals(diff2.size(), 1);
  equals(diff2.triples()[0], $.rdf.triple('_:b foaf:surname "Jones"', { namespaces: { foaf: ns.foaf }}));
});

test("describing a resource that is not the object of any triples, and the subject of two", function () {
  equals(books.size(), 29);
  var d1 = books.describe(['<http://example.com/aBookCritic>']);
  equals(d1.length, 2);
  equals(d1[0], $.rdf.triple('<http://example.com/aBookCritic> <http://example.com/likes> <http://example.com/aReallyGreatBook> .'));
  equals(d1[1], $.rdf.triple('<http://example.com/aBookCritic> <http://example.com/dislikes> <http://example.com/anotherGreatBook> .'));
});

test("describing a resource that is also the object of two triples", function () {
  equals(books.size(), 29);
  var d1 = books.describe(['<http://example.com/anotherGreatBook>']);
  equals(d1.length, 10);
  /*
  .add('<http://example.com/anotherGreatBook> dc:title "Another Great Book" .')
  .add('<http://example.com/anotherGreatBook> dc:publisher "Examples-R-Us" .')
  .add('<http://example.com/anotherGreatBook> dc:creator "June Doe (june@example.com)" .')
  .add('<http://example.com/anotherGreatBook> dc:format "application/pdf" .')
  .add('<http://example.com/anotherGreatBook> dc:language "en" .')
  .add('<http://example.com/anotherGreatBook> dc:rights "Copyright (C) 2004 Examples-R-Us. All rights reserved." .')
  .add('<http://example.com/anotherGreatBook> dct:issued "2004-05-03"^^xsd:date .')
  .add('<http://example.com/anotherGreatBook> rdfs:seeAlso <http://example.com/aReallyGreatBook> .')
  .add('<http://example.com/aReallyGreatBook> rdfs:seeAlso <http://example.com/anotherGreatBook> .')
  .add('<http://example.com/aBookCritic> ex:dislikes <http://example.com/anotherGreatBook> .');
  */
});

test("describing a resource with a property that holds a blank node", function () {
  equals(books.size(), 29);
  var d1 = books.describe(['<http://example.com/aReallyGreatBook>']);
  equals(d1.length, 18);
  /*
  .add('<http://example.com/aReallyGreatBook> dc:title "A Really Great Book" .')
  .add('<http://example.com/aReallyGreatBook> dc:publisher "Examples-R-Us" .')
  .add('<http://example.com/aReallyGreatBook> dc:creator _:creator .')
  .add('_:creator a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:creator foaf:name "John Doe" .')
  .add('_:creator foaf:mbox "john@example.com" .')
  .add('_:creator foaf:img <http://example.com/john.jpg> .')
  .add('_:creator foaf:phone <tel:+1-999-555-1234> .')
  .add('<http://example.com/aReallyGreatBook> dc:contributor _:contributor .')
  .add('_:contributor a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:contributor foaf:name "Jane Doe" .')
  .add('<http://example.com/aReallyGreatBook> dc:language "en" .')
  .add('<http://example.com/aReallyGreatBook> dc:format "applicaiton/pdf" .')
  .add('<http://example.com/aReallyGreatBook> dc:rights "Copyright (C) 2004 Examples-R-Us. All rights reserved." .')
  .add('<http://example.com/aReallyGreatBook> dct:issued "2004-01-19"^^xsd:date .')
  .add('<http://example.com/aReallyGreatBook> rdfs:seeAlso <http://example.com/anotherGreatBook> .')
  .add('<http://example.com/anotherGreatBook> rdfs:seeAlso <http://example.com/aReallyGreatBook> .')
  .add('<http://example.com/aBookCritic> ex:likes <http://example.com/aReallyGreatBook> .')
  */
});

test("describing a resource where there's a statement with this as an object, and a blank node as the subject", function () {
  equals(books.size(), 29);
  var d1 = books.describe(['<http://example.com/john.jpg>']);
  equals(d1.length, 9);
  /*
  .add('<http://example.com/aReallyGreatBook> dc:creator _:creator .')
  .add('_:creator a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:creator foaf:name "John Doe" .')
  .add('_:creator foaf:mbox "john@example.com" .')
  .add('_:creator foaf:img <http://example.com/john.jpg> .')
  .add('<http://example.com/john.jpg> a <http://xmlns.com/foaf/0.1/Image> .')
  .add('<http://example.com/john.jpg> dc:format "image/jpeg" .')
  .add('<http://example.com/john.jpg> dc:extent "1234" .')
  .add('_:creator foaf:phone <tel:+1-999-555-1234> .')
  */
});

test("describing two resources with overlapping triples", function () {
  equals(books.size(), 29);
  var d1 = books.describe(['_:creator', '<http://example.com/john.jpg>']);
  equals(d1.length, 9);
  /*
  .add('<http://example.com/aReallyGreatBook> dc:creator _:creator .')
  .add('_:creator a <http://xmlns.com/foaf/0.1/Person> .')
  .add('_:creator foaf:name "John Doe" .')
  .add('_:creator foaf:mbox "john@example.com" .')
  .add('_:creator foaf:img <http://example.com/john.jpg> .')
  .add('<http://example.com/john.jpg> a <http://xmlns.com/foaf/0.1/Image> .')
  .add('<http://example.com/john.jpg> dc:format "image/jpeg" .')
  .add('<http://example.com/john.jpg> dc:extent "1234" .')
  .add('_:creator foaf:phone <tel:+1-999-555-1234> .')
  */
});

test("removing a triple from a databank", function () {
  var d = $.rdf.databank()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:a foaf:surname "Smith"');
  var r = $.rdf({ databank: d })
    .where('?a foaf:knows ?b');
  equals(d.size(), 2);
  equals(r.size(), 1);
  d.remove('_:a foaf:knows _:b');
  equals(d.size(), 1);
  equals(r.size(), 0);
});

test("updating queries when triples are removed from a databank", function () {
  var d = $.rdf.databank()
    .prefix('foaf', ns.foaf)
    .add('_:a foaf:knows _:b')
    .add('_:a foaf:surname "Smith"');
  var root = $.rdf({ databank: d });
  var r1 = root.where('?a foaf:knows ?b');
  var r2 = r1.where('?a foaf:surname ?s');
  equals(root.size(), 0);
  equals(r1.size(), 1);
  equals(r2.size(), 1);
  d.remove('_:a foaf:knows _:b');
  equals(root.size(), 0);
  equals(r1.size(), 0);
  equals(r2.size(), 0);
});

module("Creating Patterns");

test("two identical patterns", function() {
  var p1 = $.rdf.pattern('<a> <b> ?c');
  var p2 = $.rdf.pattern('<a> <b> ?c');
  ok(p1 === p2, "should be identical");
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
  equals(triple.subject.type, 'uri', "the subject should be a resource");
	equals(triple.subject.value, subject);
	equals(triple.property.type, 'uri', "the property should be a resource");
	equals(triple.property.value, ns.dc + 'creator');
	equals(triple.object.type, 'uri', "the object should be a resource");
	equals(triple.object.value, object);
	equals(triple, '<' + subject + '> <' + ns.dc + 'creator> <' + object + '> .');
});

test("creating an rdf:type triple", function() {
	var subject = 'http://example.org/path';
	var object = 'doc:Document';
	var doc = 'http://example.org/#ns';
	var triple = $.rdf.triple('<' + subject + '>', 'a', object, { namespaces: { doc: doc }});
	equals(triple.subject.value, subject);
	equals(triple.property.value, ns.rdf + 'type');
	equals(triple.object.value, doc + 'Document');
	equals(triple, '<' + subject + '> <' + ns.rdf + 'type> <' + doc + 'Document> .');
});

test("creating a triple using a string", function() {
	var subject = 'http://www.example.com/foo/';
	var object = 'mailto:someone@example.com';
	var tstr = '<' + subject + '> dc:creator <' + object + '> .';
	var triple = $.rdf.triple(tstr, { namespaces: { dc: ns.dc }});
	equals(triple.subject.value, subject);
	equals(triple.property.value, ns.dc + 'creator');
	equals(triple.object.value, object);
	var e = triple.dump();
	ok(e[subject] !== undefined, 'the dumped triple should have a property equal to the subject');
	ok(e[subject][triple.property.value] !== undefined, 'the dumped triple\'s subject property should have a property whose name is the property name');
	equals(e[subject][triple.property.value].type, 'uri');
	equals(e[subject][triple.property.value].value, object);
});

test("creating a triple using a string with a literal value", function() {
	var subject = 'http://www.example.com/foo/';
	var value = '"foo"';
	var triple = $.rdf.triple('<' + subject + '> dc:subject ' + value, { namespaces: { dc: ns.dc }});
	equals(triple.subject.value, subject);
	equals(triple.property.value, ns.dc + 'subject');
	ok(!triple.object.resource, "the object isn't a resource");
	equals(triple.object.value, 'foo');
});

test("creating a triple using a string with a literal value with a space in it", function() {
	var subject = 'http://www.example.com/foo/';
	var value = '"foo bar"';
	var triple = $.rdf.triple('<' + subject + '> dc:subject ' + value, { namespaces: { dc: ns.dc }});
	equals(triple.subject.value, subject);
	equals(triple.property.value, ns.dc + 'subject');
	ok(!triple.object.resource, "the object isn't a resource");
	equals(triple.object.value, 'foo bar');
});

test("creating a triple with an unprefixed name and a value with a space in it", function() {
	var triple = $.rdf.triple(':book1  dc:title  "SPARQL Tutorial" .', { namespaces: { '': 'http://example.org/book/', dc: ns.dc }});
	equals(triple.subject.value, 'http://example.org/book/book1');
	equals(triple.property.value, ns.dc + 'title');
	equals(triple.object.value, 'SPARQL Tutorial');
});

test("creating a triple with a literal value with quotes in it", function() {
	var triple = $.rdf.triple('<> dc:title "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^rdf:XMLLiteral .', { namespaces: { dc: ns.dc, rdf: ns.rdf }});
	equals(triple.subject.value, $.uri.base());
	equals(triple.property.value, ns.dc + 'title');
	equals(triple.object.value, 'E = mc<sup xmlns="http://www.w3.org/1999/xhtml">2</sup>: The Most Urgent Problem of Our Time');
	equals(triple.object.datatype, ns.rdf + 'XMLLiteral');
});

test("creating a triple that belongs to a graph", function() {
  var triple = $.rdf.triple('<d> <e> <f>', { graph: '<>' });
  equals(triple.subject.value, $.uri('d'));
  equals(triple.property.value, $.uri('e'));
  equals(triple.object.value, $.uri('f'));
  equals(triple.graph.value, $.uri.base());
});

test("two triples that belong to different graphs", function() {
	var t1 = $.rdf.triple('<a> <b> <c>');
	var t2 = $.rdf.triple('<a> <b> <c>', { graph: '<>' });
	ok(t1 !== t2, "should not be equal");
});

module("Creating Resources");

test("two identical resources", function() {
	var u = 'http://www.example.org/subject';
	var r1 = $.rdf.resource('<' + u + '>');
	var r2 = $.rdf.resource('<' + u + '>');
	ok(r1 === r2, "should equal each other");
});

test("a resource", function() {
  var r = $.rdf.resource('<http://www.example.org/subject>');
  equals(r.value, 'http://www.example.org/subject', 'should have a value property containing the uri');
  equals(r.type, 'uri', 'should have a type of "uri"');
  var e = r.dump();
  equals(e.type, 'uri');
  equals(e.value, 'http://www.example.org/subject');
});

test("creating a resource with strings in angle brackets (URIs)", function() {
	var u = 'http://www.example.org/subject';
	var r = $.rdf.resource('<' + u + '>');
	equals(r.value, u);
});

test("creating a resource with a relative uri", function() {
	var u = 'subject';
	var r = $.rdf.resource('<' + u + '>');
	equals('' + r.value, '' + $.uri(u));
});

test("creating a resource with a relative uri and supplying a base uri", function() {
	var u = 'subject';
	var base = 'http://www.example.org/';
	var r = $.rdf.resource('<' + u + '>', { base: base });
	equals('' + r.value, '' + $.uri.resolve(u, base));
});

test("creating a resource with a uri that contains a greater-than sign", function() {
	var u = 'http://www.example.org/a>b';
	var r = $.rdf.resource('<' + u.replace(/>/g, '\\>') + '>');
	equals(r.value, u);
});

test("creating a resource using a string that looks like an absolute uri", function() {
	var u = 'http://www.example.org/subject';
	try {
		var r = $.rdf.resource(u);
		ok(false, "should throw an error");
	} catch (e) {
		ok(true, "should throw an error");
	}
});

test("creating a resource from a curie", function() {
	var dc = "http://purl.org/dc/elements/1.1/";
	var c = 'dc:creator';
	var r = $.rdf.resource(c, { namespaces: { dc: dc } });
	equals(r.value, dc + 'creator');
});

test("creating a resource from a qname starting with ':'", function() {
	var d = 'http://www.example.com/foo/';
	var r = $.rdf.resource(':bar', { namespaces: { '': d }});
	equals(r.value, d + 'bar');
});

test("creating a resource from a qname starting with ':' with no default namespace binding", function() {
	try {
		var r = $.rdf.resource(':bar');
		ok(false, "should raise an error");
	} catch (e) {
	  ok(true, "should raise an error");
	}
});

test("creating a resource from a qname ending with ':'", function() {
	var foo = 'http://www.example.com/foo/'
	var r = $.rdf.resource('foo:', { namespaces: { foo: foo }});
	equals(r.value, foo);
});

test("creating a resource from a qname ending with ':' with no binding for the prefix", function() {
	try {
		var r = $.rdf.resource('foo:');
		ok(false, "should raise an error");
	} catch (e) {
	  ok(true, "should raise an error");
	}
});

module("Creating literals");

test("two identical literals", function() {
	var l1 = $.rdf.literal('"foo"');
	var l2 = $.rdf.literal('"foo"');
	ok(l1 === l2, "should be equal");
});

test("a literal", function() {
  var l = $.rdf.literal('"foo"');
  equals(l.value, 'foo', 'should have a value property');
  equals(l.type, 'literal', 'should have a type of "literal"');
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
	var e = r.dump();
	equals(r.type, 'literal');
	equals(r.value, '2008-10-05');
	equals(r.datatype, 'http://www.w3.org/2001/XMLSchema#date');
});

test("creating a literal with a language by specifying the language in the value", function() {
	var r = $.rdf.literal('"chat"@fr');
	equals(r.value, 'chat');
	equals(r.lang, 'fr');
	equals(r, '"chat"@fr');
	var e = r.dump();
	equals(r.type, 'literal')
	equals(r.value, 'chat');
	equals(r.lang, 'fr');
});

module("Creating blank nodes");

test("two blank nodes with the same id", function() {
	var r1 = $.rdf.blank('_:foo');
	var r2 = $.rdf.blank('_:foo');
	ok(r1 === r2, "should be identical");
});

test("creating a blank node", function() {
	var r = $.rdf.blank('_:foo');
	equals(r.type, 'bnode');
	equals(r.value, '_:foo');
	equals(r.id, 'foo');
	var e = r.dump();
	equals(e.type, 'bnode');
	equals(e.value, '_:foo');
	ok(e.id === undefined, 'the dumped version of a blank node should not have an id');
});

test("creating two blank nodes", function() {
	var r1 = $.rdf.blank('[]');
	var r2 = $.rdf.blank('[]');
	ok(r1.id !== r2.id, "they should have distinct ids " + r1.id + ' != ' + r2.id);
});


})(jQuery);