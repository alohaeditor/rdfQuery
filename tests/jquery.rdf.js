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
	vcard: "http://www.w3.org/2001/vcard-rdf/3.0#"
}

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
});

test("creating a triple store from an array of strings", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .'
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	equals(rdf.databank.size(), 2, "the length of the triple store should be two");
	equals(rdf.length, 0, "the length should be two");
	equals(rdf.size(), 0, "the size should be two");
	var triples = rdf.databank.triples();
	ok(triples[0].subject.resource, "the subject of the first triple should be a resource");
	ok(triples[0].property.resource, "the property of the first triple should be a resource");
	ok(triples[0].object.resource, "the object of the first triple should be a resource");
	ok(triples[1].subject.resource, "the subject of the first triple should be a resource");
	ok(triples[1].property.resource, "the property of the first triple should be a resource");
	ok(triples[1].object.resource, "the object of the first triple should be a resource");
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
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[0].photo.uri, $.uri('photo1.jpg'));
	equals(filtered[1].photo.uri, $.uri('photo2.jpg'));
});

test("creating triples and specifying options should helpfully bind prefixes", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
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

test("selecting triples using a search pattern, then adding another triple that matches the search pattern", function() {
	var rdf = $.rdf()
	  .prefix('dc', ns.dc)
	  .prefix('foaf', ns.foaf)
	  .add('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .')
	  .add('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .');
	var filtered = rdf.where('?photo dc:creator <http://www.blogger.com/profile/1109404>');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.uri, $.uri('photo1.jpg'));
	var added = filtered.add('<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .');
	equals(filtered.length, 2, "number of items after filtering");
	equals(filtered[1].photo.uri, $.uri('photo2.jpg'));
});

test("selecting triples using two search patterns", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf({triples: triples, namespaces: namespaces});
	var filtered = rdf
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.uri, $.uri('photo1.jpg'));
	equals(filtered[0].creator.uri, $.uri('http://www.blogger.com/profile/1109404'));
	equals(filtered.sources()[0][0], $.rdf.triple(triples[0], {namespaces: namespaces}));
	equals(filtered.sources()[0][1], $.rdf.triple(triples[1], {namespaces: namespaces}));
	equals(filtered[0].photo.uri, $.uri('photo1.jpg'));
	equals(filtered[0].creator.uri, $.uri('http://www.blogger.com/profile/1109404'))
});

test("selecting triples using two search patterns, then adding a triple", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces });
	var filtered = rdf
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	equals(filtered.length, 1, "number of items after filtering");
	equals(filtered[0].photo.uri, $.uri('photo1.jpg'));
	var added = rdf.add('<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .');
	equals(filtered.length, 2, "number of items after adding a new triple");
	equals(filtered[1].photo.uri, $.uri('photo2.jpg'));
});

test("using a callback function on each match", function() {
	var count = 0, photos = [];
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .',
	];
	var rdf = $.rdf({ triples: triples, namespaces: namespaces })
		.where('?photo dc:creator ?creator')
		.where('?creator foaf:img ?photo');
	rdf.each(function (index, match) {
		count += 1;
		photos.push(match.photo);
	});
	equals(count, 2, "it should iterate twice");
	equals(photos[0].uri, $.uri('photo1.jpg'));
	equals(photos[1].uri, $.uri('photo2.jpg'));
});

test("using three arguments with each() to get the source triples", function() {
	var sources = [];
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		'<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .',
		'<photo2.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
		'<http://www.blogger.com/profile/1109404> foaf:img <photo2.jpg> .',
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
	  return this.photo.uri;
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
	var photos = rdf.map(function () { return this.photo.uri });
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
  equals(rdf[0].mbox.uri, 'mailto:alice@example.com');
  equals(rdf[1].name.value, "Alice");
  equals(rdf[1].mbox.uri, 'mailto:alice@work.example');
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
  equals(rdf[0].mbox.uri, 'mailto:alice@example.com');
  equals(rdf[1].name.value, "Alice");
  equals(rdf[1].mbox.uri, 'mailto:alice@work.example');
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
  equals(rdf[0].mbox.uri, 'mailto:alice@example.com');
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
  equals(rdf[0].hpage.uri, 'http://work.example.org/alice/');
  equals(rdf[1].name.value, "Bob");
  equals(rdf[1].mbox.uri, 'mailto:bob@work.example');
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
  equals(rdf.get(0).photo.uri, $.uri('photo1.jpg'));
  equals(rdf.get(0).person.value, "Jane");
  rdf = rdf
    .where('?photo foaf:depicts ?person');
  equals(rdf.length, 1, "it should contain one match");
  equals(rdf.get(0).photo.uri, $.uri('photo1.jpg'));
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
  equals(rdf[0].property.uri, ns.foaf + 'img');
  equals(rdf[0].value.uri, $.uri('photo1.jpg'));
  equals(rdf[1].property.uri, ns.foaf + 'img');
  equals(rdf[1].value.uri, $.uri('photo2.jpg'));
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

module("Creating Databanks");

test("creating a new databank", function() {
	var namespaces = { dc: ns.dc, foaf: ns.foaf };
	var triples = [
		$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', { namespaces: namespaces }),
		$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', { namespaces: namespaces })
	];
	var data = $.rdf.databank(triples);
	equals(data.tripleStore[triples[0].subject].length, 1);
	equals(data.tripleStore[triples[0].subject][0], triples[0]);
	equals(data.tripleStore[triples[1].subject].length, 1);
	equals(data.tripleStore[triples[1].subject][0], triples[1]);
	equals(data.size(), 2);
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
		ok(true, "should throw an error");
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
	  ok(true, "should raise an error");
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
	  ok(true, "should raise an error");
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