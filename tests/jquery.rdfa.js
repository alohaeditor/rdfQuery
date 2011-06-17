/*
 * jquery.rdfa.js unit tests
 */
(function($){

var ns = { namespaces: {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#",
	ex: "http://example.org/",
	sioc: "http://rdfs.org/sioc/ns#",
	xhv: "http://www.w3.org/1999/xhtml/vocab#",
	prism: "http://prism.talis.com/schema#",
	xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
}};

function setup(rdfa) {
	$('#main').html(rdfa);
};

function testTriples (received, expected) {
	var i, triples = received.databank.triples();
	equals(triples.length, expected.length, 'there should be ' + expected.length + ' triples');
	if (triples.length >= expected.length) {
  	for (i = 0; i < expected.length; i += 1) {
  		equals(triples[i].toString(), expected[i].toString());
  	}
  	for (i; i < triples.length; i += 1) {
  	  ok(false, 'also got ' + triples[i].toString());
  	}
	} else {
  	for (i = 0; i < triples.length; i += 1) {
  		equals(triples[i].toString(), expected[i].toString());
  	}
  	for (i; i < expected.length; i += 1) {
  	  ok(false, 'did not get ' + expected[i].toString());
  	}
	}
};

module("Performance Tests");

test("multiple elements with about and property attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<p about="bPerson' + i + '" property="foaf:name">Person ' + i + '</p>');
  }
  var t1 = new Date();
  main.rdfa();
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
  $('#main').removeData('rdfa.triples');
});

test("multiple elements with about, rel and resource attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<p about="photo' + i + '.jpg" rel="foaf:depicts" resource="aPerson' + i + '">Paragraph ' + i + '</p>');
  }
  var t1 = new Date();
  main.rdfa();
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
  $('#main').removeData('rdfa.triples');
});

module("RDF Gleaner");

test("Test 0001", function() {
	setup('<p>This photo was taken by <span class="author" about="photo1.jpg" property="dc:creator">Mark Birbeck</span>.</p>');
	testTriples($('#main > p > span').rdf(), 
	            [$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("With a callback", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
	testTriples(
	  $('#main > p > a').rdf(function () {
  	  if (this.subject.value.toString() === 'http://www.blogger.com/profile/1109404') {
  	    return this;
  	  }
  	}), 
    [$.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg>', ns)]
  );
	$('#main > p').remove();
});

module("Ignore illegal CURIEs");

test("In property attribute", function() {
	setup('<p>This photo was taken by <span class="author" about="photo1.jpg" property="creator">Mark Birbeck</span>.</p>');
	testTriples($('#main > p > span').rdfa(), 
	            []);
	$('#main > p').remove();
});

test("In rel attribute", function () {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="creator" href="#mark">Mark Birbeck</a>.</p>');
	testTriples($('#main > p > span').rdfa(), 
	            []);
	$('#main > p').remove();
});

module("Reported bugs");

test("Structured XML Literal", function () {
  setup('<div property="sioc:note"><p>This <strong>is</strong> something</p><p>And <em>something</em> else</p></div>');
  testTriples($('#main > p').rdf(), []);
  testTriples($('#main > div').rdf(),
              [$.rdf.triple('<> sioc:note "<p xmlns=\\"http://www.w3.org/1999/xhtml\\">This <strong>is</strong> something</p><p xmlns=\\"http://www.w3.org/1999/xhtml\\">And <em>something</em> else</p>"^^rdf:XMLLiteral .', ns)]);
  $('#main > div').remove();
});

test("RDFa from html element", function () {
  testTriples($('html').rdf(), 
              [$.rdf.triple('<> <http://www.w3.org/1999/xhtml/vocab#stylesheet> <../jquery/tests/qunit/qunit.css>')]);
});

test("XMLLiteral including comments", function () {
  setup('<p property="sioc:note"><!-- ///// --><em>TODO</em></p>');
  testTriples($('#main > p').rdf(), 
              [$.rdf.triple('<> sioc:note "<!-- ///// --><em xmlns=\\"http://www.w3.org/1999/xhtml\\">TODO</em>"^^rdf:XMLLiteral .', ns)]);
  $('#main > p').remove();
});

test("Improper whitespace in rel attribute", function () {
  setup('<a rel="next&#x0b;prev" href="http://example.org/test.css">Test</a>');
  testTriples($('#main > a').rdf(), []);
  $('#main > a').remove();
});

test("Uppercase relationship name", function () {
  setup('<a rel="NEXT" href="http://example.org/test.css">Test</a>');
  testTriples($('#main > a').rdf(), [
    $.rdf.triple('<> xhv:next <http://example.org/test.css> .', ns)]);
  $('#main > a').remove();
});

test("Bogus relationship name", function () {
  setup('<a rel="next bogus prev" href="http://example.org/test.css">Test</a>');
  testTriples($('#main > a').rdf(), [
    $.rdf.triple('<> xhv:next <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:prev <http://example.org/test.css> .', ns)
  ]);
  $('#main > a').remove();
});

test("Newline in rel attribute", function () {
  setup('<a rel="next&#x20;prev&#x09;first&#x0a;last&#x0c;section&#x0d;subsection" href="http://example.org/test.css" />');
  testTriples($('#main > a').rdf(), [
    $.rdf.triple('<> xhv:next <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:prev <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:first <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:last <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:section <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:subsection <http://example.org/test.css> .', ns)
  ]);
  $('#main > a').remove();
});

test("URI included in relationship", function () {
  setup('<a rel="next http://example.org/test prev" href="http://example.org/test.css">Test</a>');
  testTriples($('#main > a').rdf(), [
    $.rdf.triple('<> xhv:next <http://example.org/test.css> .', ns),
    $.rdf.triple('<> xhv:prev <http://example.org/test.css> .', ns)
  ]);
  $('#main > a').remove();
});

test("Uppercase prefix in CURIE", function () {
  setup('<p XMLNS:EX="http://example.org/" property="EX:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("Empty xmlns prefix", function () {
  setup('<p xmlns:="http://example.org/" property=":test">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> xhv:test "Test" .', ns)
  ]);
  $('#main > p').remove();
});

test("Empty inherited xmlns value", function () {
  setup('<p xmlns:ex="" property="ex:test">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> ex:test "Test" .', ns)
  ]);
  $('#main > p').remove();
});

test("Empty xmlns value", function () {
  setup('<p xmlns:ex2="" property="ex2:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("Non-NCName prefix", function () {
  setup('<p xmlns:0="http://example.org/" property="0:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("Underscore prefix", function () {
  setup('<p xmlns:_="http://example.org/" property="_:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("xml prefix with wrong namespace", function () {
  setup('<p xmlns:xml="http://example.org/" property="xml:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("xmlns declaration", function () {
  setup('<p xmlns:xmlns="http://www.w3.org/2000/xmlns/" property="xmlns:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("xmlns declaration with wrong namespace", function () {
  setup('<p xmlns:xmlns="http://example.org/" property="xmlns:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("bad namespace declaration (xml namespace)", function () {
  setup('<p xmlns:ex2="http://www.w3.org/XML/1998/namespace" property="ex2:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("bad namespace declaration (xmlns namespace)", function () {
  setup('<p xmlns:ex2="http://www.w3.org/2000/xmlns/" property="ex2:test">Test</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("ignoring about with invalid prefix", function () {
  setup('<p xmlns:ex="http://example.org/" xmlns:0="http://example.org/error/">' +
    '<span src="http://example.com/">' +
    '  <span property="ex:test1">Test</span>' +
    '</span>' +
    '<span about="[0:bogus]" src="http://example.com/">' +
    '  <span property="ex:test">Test</span>' +
    '</span>' +
    '</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<http://example.com/> <http://example.org/test1> "Test" .'),
    $.rdf.triple('<http://example.com/> <http://example.org/test> "Test" .')
  ]);
  $('#main > p').remove();
});

test("count rel attribute that contains invalid CURIEs", function () {
  setup('<p xmlns:ex="http://example.org/" xmlns:0="http://example.org/error/">' +
    '<span property="ex:test1" href="http://example.org/href">Test</span>' +
    '<span rel="ex:test2" property="ex:test3" href="http://example.org/href">Test</span>' +
    '<span rel="0:test4" property="ex:test5" href="http://example.org/href">Test</span>' +
  '</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<http://example.org/href> <http://example.org/test1> "Test" .'),
    $.rdf.triple('<> <http://example.org/test3> "Test" .'),
    $.rdf.triple('<> <http://example.org/test2> <http://example.org/href> .'),
    $.rdf.triple('<> <http://example.org/test5> "Test" .')
  ]);
  $('#main > p').remove();
});

test("count rel attribute that is empty", function () {
  setup('<p xmlns:ex="http://example.org/">' +
    '<span property="ex:test1" href="http://example.org/href">Test</span>' +
    '<span rel="ex:test2" property="ex:test3" href="http://example.org/href">Test</span>' +
    '<span rel="" property="ex:test5" href="http://example.org/href">Test</span>' +
  '</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<http://example.org/href> <http://example.org/test1> "Test" .'),
    $.rdf.triple('<> <http://example.org/test3> "Test" .'),
    $.rdf.triple('<> <http://example.org/test2> <http://example.org/href> .'),
    $.rdf.triple('<> <http://example.org/test5> "Test" .')
  ]);
  $('#main > p').remove();
});

test("count property attribute that contains invalid CURIEs", function () {
  setup('<div>' +
  '<p xmlns:ex="http://example.org/" about="http://example.com/" rel="ex:rel1">' +
  '  <span content="Content 1"><span about="http://example.net/">Test 1</span></span>' +
  '</p>' +
  '<p xmlns:ex="http://example.org/" about="http://example.com/" rel="ex:rel2">' +
  '  <span property="ex:prop" content="Content 2"><span about="http://example.net/">Test 2</span></span>' +
  '</p>' +
  '<p xmlns:ex="http://example.org/" about="http://example.com/" rel="ex:rel3">' +
  '  <span property="bogus:bogus" content="Content 3"><span about="http://example.net/">Test 3</span></span>' +
  '</p>' +
  '</div>');
  var data = $('#main > div').rdf().databank.triples();
  equals(data[0].toString(), $.rdf.triple('<http://example.com/> <http://example.org/rel1> <http://example.net/> .').toString());
  equals(data[1].subject.value.toString(), 'http://example.com/');
  equals(data[1].property.value.toString(), 'http://example.org/rel2');
  equals(data[1].object.type, 'bnode');
  equals(data[2].subject.type, 'bnode');
  equals(data[2].property.value.toString(), 'http://example.org/prop');
  equals(data[2].object.value, 'Content 2');
  equals(data[3].subject.value.toString(), 'http://example.com/');
  equals(data[3].property.value.toString(), 'http://example.org/rel3');
  equals(data[3].object.type, 'bnode');
  $('#main > p').remove();
});

test("Digit in curie", function () {
  setup('<p xmlns:ex="http://example.org/" property="ex:one2three4">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> <http://example.org/one2three4> "Test" .', ns)
  ]);
  equals($('#main > p').rdf().databank.triples()[0].property.value, 'http://example.org/one2three4');
  $('#main > p').remove();
});

test("Square brackets in CURIE", function () {
  setup('<p xmlns:ex="http://example.org/1/" xmlns:[ex="http://example.org/2/" about="[[ex:test]]" property="ex:test">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> <http://example.org/1/test> "Test" .', ns)
  ]);
  $('#main > p').remove();
});

test("ignore about attribute that contains invalid CURIE", function () {
  setup('<p about="http://example.net/" xmlns:ex="http://example.org/1/" xmlns:[ex="http://example.org/2/"><span about="[[ex:test]]" property="ex:test">Test</span></p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<http://example.net/> <http://example.org/1/test> "Test" .', ns)
  ]);
  $('#main > p').remove();
});

test("ignore about attribute that contains invalid CURIE when setting subject", function () {
  setup('<p xmlns:ex="http://example.org/1/" xmlns:[ex="http://example.org/2/" about="[[ex:test]]" resource="http://example.net/" property="ex:test">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<http://example.net/> <http://example.org/1/test> "Test" .', ns)
  ]);
  $('#main > p').remove();
});

test("With both lang and xml:lang defined", function () {
  setup('<p xmlns:ex="http://example.org/" property="ex:test" lang="aa" xml:lang="bb">Test</p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> ex:test "Test"@aa .', ns)
  ]);
  $('#main > p').remove();
});

/*
test("With conflicting lang inheritance", function () {
  setup('<p lang="aa"><span xmlns:ex="http://example.org/" property="ex:test" xml:lang="bb">Test</span></p>');
  testTriples($('#main > p').rdf(), [
    $.rdf.triple('<> ex:test "Test"@aa .', ns)
  ]);
  $('#main > p').remove();
});
*/

test("div with no attributes", function () {
  setup('<div id="collections">' +
        '<ol xmlns:prism="http://prism.talis.com/schema#"' +
        'typeof="rdf:Seq" about="http://example.com/tenancies/abahhagagabdjfyegegbsh/collections">' +
				'<li rel="rdf:_1" id="tenancies-abahhagagabdjfyegegbsh-collections-1"' +      
				'  resource="http://example.com/tenancies/abahhagagabdjfyegegbsh/collections/1">' +
				'  <div>' +
				'    <input type="checkbox" id="tenancies-abahhagagabdjfyegegbsh-collections-1-hidden" property="prism:hidden"' + 
				'datatype="xsd:boolean" content="true" checked="checked" />' +
				'  </div>' +
				'</li>' +
				'</ol>' +
				'</div>');
	testTriples($('#collections').rdf(), [
	  $.rdf.triple('<http://example.com/tenancies/abahhagagabdjfyegegbsh/collections> a rdf:Seq .', ns),
	  $.rdf.triple('<http://example.com/tenancies/abahhagagabdjfyegegbsh/collections> rdf:_1 <http://example.com/tenancies/abahhagagabdjfyegegbsh/collections/1> .', ns),
	  $.rdf.triple('<http://example.com/tenancies/abahhagagabdjfyegegbsh/collections/1> prism:hidden "true"^^xsd:boolean .', ns)
	]);
	$('#collections').remove();
});

test("table with RDFa around", function () {
  setup('<div about="http://example.com/"  xmlns:ex="http://example.org/" id="table">' +
        '<table>' +
        '<tr>' +
        '<td property="ex:test">Test</td>' +
        '</tr>' +
        '</table>' +
        '</div>');
  testTriples($('#table').rdf(), [
    $.rdf.triple('<http://example.com/> <http://example.org/test> "Test"')
  ]);
  $('#table').remove();
});

test("reserved name used within a property", function () {
  setup('<p property="next">Next Page</p>');
  testTriples($('#main > p').rdf(), []);
  $('#main > p').remove();
});

test("double quotes in literal", function() {
	setup('<p>This photo was taken by <span about="photo1.jpg" property="dc:creator">Mark "foo" Birbeck</span>.</p>');
	rdf = $('#main > p > span').rdfa();
	testTriples(rdf,
    [$.rdf.triple('<photo1.jpg> dc:creator "Mark \\"foo\\" Birbeck" .', ns)]
  );
  equals(rdf.databank.triples()[0].object.value, 'Mark "foo" Birbeck');
	$('#main > p').remove();
});

module("RDFa Test Suite");

test("Test 0001", function() {
	setup('<p>This photo was taken by <span class="author" about="photo1.jpg" property="dc:creator">Mark Birbeck</span>.</p>');
	testTriples($('#main > p > span').rdfa(), 
	            [$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0006", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
	testTriples($('#main > p > a').rdfa(), 
	            [$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404>', ns), 
	             $.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg>', ns)]);
	$('#main > p').remove();
});

test("Test 0007", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" property="dc:title" content="Portrait of Mark" rel="dc:creator" rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
	testTriples($('#main > p > a').rdfa(), 
	            [$.rdf.triple('<photo1.jpg> dc:title "Portrait of Mark" .', ns),
	             $.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns),
	             $.rdf.triple('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .', ns)]);
	$('#main > p').remove();
});

test("Test 0008", function() {
	setup('<p>This document is licensed under a <a about="" rel="cc:license" href="http://creativecommons.org/licenses/by-nc-nd/2.5/">Creative Commons</a>.</p>');
	testTriples($('#main > p > a').rdfa(), 
	            [$.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by-nc-nd/2.5/> .', ns)]);
	$('#main > p').remove();
});

test("Test 0009", function() {
	$('head').append('<link about="http://example.org/people#Person1" rev="dc:knows" href="http://example.org/people#Person2" />');
	testTriples($('link[about]').rdfa(), 
	            [$.rdf.triple('<http://example.org/people#Person2> dc:knows <http://example.org/people#Person1> .', ns)]);
	$('link[about]').remove();
});

test("Test 0010", function() {
	$('head').append('<link about="http://example.org/people#Person1" rel="dc:knows" rev="dc:knows" href="http://example.org/people#Person2" />');
	testTriples($('link[about]').rdfa(), 
  	[$.rdf.triple('<http://example.org/people#Person1> dc:knows <http://example.org/people#Person2> .', ns),
  	 $.rdf.triple('<http://example.org/people#Person2> dc:knows <http://example.org/people#Person1> .', ns)]);
	$('link[about]').remove();
});

test("Test 0011", function() {
	setup('<div about="">Author: <span property="dc:creator">Albert Einstein</span><h2 property="dc:title">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	testTriples($('#main > div > span').rdfa(),
		[$.rdf.triple('<> dc:creator "Albert Einstein" .', ns)]);
	testTriples($('#main > div > h2').rdfa(), 
		[$.rdf.triple('<> dc:title "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^rdf:XMLLiteral .', ns)]);
	testTriples($('#main > div').rdfa(), 
		[$.rdf.triple('<> dc:creator "Albert Einstein" .', ns),
		 $.rdf.triple('<> dc:title "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^rdf:XMLLiteral .', ns)]);
	$('#main > div').remove();
});

test("Test 0012", function() {
	$('head').append('<meta about="http://example.org/node" property="ex:property" xml:lang="fr" content="chat" />');
	testTriples($('meta').rdfa(), 
		[$.rdf.triple('<http://example.org/node> <http://example.org/property> "chat"@fr .')]);
	$('meta').remove();
})

/* This test has been amended because replacing the head is difficult in the QUnit test runner. The logic is the same. */
test("Test 0013", function() {
	setup('<div about="" xml:lang="fr"><h1 xml:lang="en">Test 0013</h1><span about="http://example.org/node" property="ex:property" content="chat"></span></div>');
	testTriples($('#main > div > span').rdfa(), 
		[$.rdf.triple('<http://example.org/node> <http://example.org/property> "chat"@fr .')]);
	$('#main > div').remove();
});

test("Test 0014", function() {
	setup('<p><span	about="http://example.org/foo" property="ex:bar" content="10" datatype="xsd:integer">ten</span></p>');
	testTriples($('#main > p').rdfa(), 
		[$.rdf.triple('<http://example.org/foo> <http://example.org/bar> 10 .')]);
	testTriples($('#main > p > span').rdfa(), 
		[$.rdf.triple('<http://example.org/foo> <http://example.org/bar> 10 .')]);
	$('#main > p').remove();
});

test("Test 0015", function() {
	$('head').append('<link rel="dc:source" href="urn:isbn:0140449132" /><meta property="dc:creator" content="Fyodor Dostoevsky" />');
	testTriples($('link[rel="dc:source"]').rdfa(), 
		[$.rdf.triple('<> dc:source <urn:isbn:0140449132> .', ns)]);
	testTriples($('meta').rdfa(), 
		[$.rdf.triple('<> dc:creator "Fyodor Dostoevsky"  .', ns)]);
	$('link[rel="dc:source"]').remove();
	$('meta').remove();
})

test("Test 0017", function() {
	setup('<p><span about="[_:a]" property="foaf:name">Manu Sporny</span> <span about="[_:a]" rel="foaf:knows" resource="[_:b]">knows</span> <span about="[_:b]" property="foaf:name">Ralph Swick</span>.</p>');
	testTriples($('#main > p > span').eq(0).rdfa(),
		[$.rdf.triple('_:a foaf:name "Manu Sporny" .', ns)]);
	testTriples($('#main > p > span').eq(1).rdfa(),
		[$.rdf.triple('_:a foaf:knows _:b .', ns)]);
	testTriples($('#main > p > span').eq(2).rdfa(),
		[$.rdf.triple('_:b foaf:name "Ralph Swick" .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('_:a foaf:name "Manu Sporny" .', ns),
		 $.rdf.triple('_:a foaf:knows _:b .', ns),
	   $.rdf.triple('_:b foaf:name "Ralph Swick" .', ns)]);
	$('#main > p').remove();
});

test("Test 0018", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
	testTriples($('#main > p > a').rdfa(),
		[$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .', ns)]);
	$('#main > p').remove();
});

test("Test 0019", function() {
	setup('<div about="mailto:manu.sporny@digitalbazaar.com" rel="foaf:knows" href="mailto:michael.hausenblas@joanneum.at"></div>');
	testTriples($('#main > div').rdfa(),
		[$.rdf.triple('<mailto:manu.sporny@digitalbazaar.com> foaf:knows <mailto:michael.hausenblas@joanneum.at> .', ns)]);
	$('#main > div').remove();
});

test("Test 0020", function() {
	setup('<div about="photo1.jpg"><span class="attribution-line">this photo was taken by <span property="dc:creator">Mark Birbeck</span></span></div>');
	testTriples($('#main > div > span > span').rdfa(),
		[$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > div > span').rdfa(),
		[$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > div').rdfa(),
		[$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > div').remove();
});

test("Test 0021", function() {
	setup('<div><span class="attribution-line">this photo was taken by <span property="dc:creator">Mark Birbeck</span></span></div>');
	testTriples($('#main > div > span > span').rdfa(),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > div > span').rdfa(),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > div').rdfa(),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > div').remove();
});

test("Test 0023", function() {
	setup('<div id="photo1">This photo was taken by <span property="dc:creator">Mark Birbeck</span></div>');
	testTriples($('#main > div > span').rdfa(),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > div').rdfa(),
		[$.rdf.triple('<> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > div').remove();
});

test("Test 0025", function() {
	setup('<p>This paper was written by <span rel="dc:creator" resource="#me"><span property="foaf:name">Ben Adida</span>.</span></p>');
	testTriples($('#main > p > span > span').rdfa(),
		[$.rdf.triple('<#me> foaf:name "Ben Adida" .', ns)]);
	testTriples($('#main > p > span').rdfa(),
		[$.rdf.triple('<> dc:creator <#me> .', ns),
		 $.rdf.triple('<#me> foaf:name "Ben Adida" .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<> dc:creator <#me> .', ns),
		 $.rdf.triple('<#me> foaf:name "Ben Adida" .', ns)]);
	$('#main > p').remove();
});

test("Test 0026", function() {
	setup('<p><span about="http://internet-apps.blogspot.com/" property="dc:creator" content="Mark Birbeck" /></p>');
	testTriples($('#main > p > span').rdfa(),
		[$.rdf.triple('<http://internet-apps.blogspot.com/> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<http://internet-apps.blogspot.com/> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0027", function() {
	setup('<p><span about="http://internet-apps.blogspot.com/" property="dc:creator" content="Mark Birbeck">Mark B.</span></p>');
	testTriples($('#main > p > span').rdfa(),
		[$.rdf.triple('<http://internet-apps.blogspot.com/> dc:creator "Mark Birbeck" .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<http://internet-apps.blogspot.com/> dc:creator "Mark Birbeck" .', ns)]);
	$('#main > p').remove();
});

test("Test 0029", function() {
	setup('<p><span about="http://example.org/foo" property="dc:creator" datatype="xsd:string"><b>M</b>ark <b>B</b>irbeck</span>.</p>');
	testTriples($('#main > p > span > b').rdfa(), []);
	testTriples($('#main > p > span').rdfa(),
		[$.rdf.triple('<http://example.org/foo> dc:creator "Mark Birbeck"^^xsd:string .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<http://example.org/foo> dc:creator "Mark Birbeck"^^xsd:string .', ns)]);
	$('#main > p').remove();
});

test("Test 0030", function() {
	setup('<p>This document is licensed under a <a rel="cc:license" href="http://creativecommons.org/licenses/by-nc-nd/2.5/">Creative Commons License</a>.</p>');
	testTriples($('#main > p > a').rdfa(),
		[$.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by-nc-nd/2.5/> .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by-nc-nd/2.5/> .', ns)]);
	$('#main > p').remove();
});

test("Test 0031", function() {
	setup('<p about="#wtw">The book <b>Weaving the Web</b> (hardcover) has the ISBN <span rel="dc:identifier" resource="urn:ISBN:0752820907">0752820907</span>.</p>');
	testTriples($('#main > p > b').rdfa(), []);
	testTriples($('#main > p > span').rdfa(),
		[$.rdf.triple('<#wtw> dc:identifier <urn:ISBN:0752820907> .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<#wtw> dc:identifier <urn:ISBN:0752820907> .', ns)]);
	$('#main > p').remove();
});

test("Test 0032", function() {
	setup('<p about="#wtw">The book <b>Weaving the Web</b> (hardcover) has the ISBN <a rel="dc:identifier" resource="urn:ISBN:0752820907" href="http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907">0752820907</a>.</p>');
	testTriples($('#main > p > b').rdfa(), []);
	testTriples($('#main > p > a').rdfa(),
		[$.rdf.triple('<#wtw> dc:identifier <urn:ISBN:0752820907> .', ns)]);
	testTriples($('#main > p').rdfa(),
		[$.rdf.triple('<#wtw> dc:identifier <urn:ISBN:0752820907> .', ns)]);
	$('#main > p').remove();
});

test("Test 0033", function() {
	var rdf, triple, triples;
	setup('<p>This paper was written by <span rel="dc:creator"><span property="foaf:name">Ben Adida</span>.</span></p>');
	rdf = $('#main > p > span > span').rdfa();
	triple = rdf.databank.triples()[0];
	equals(triple.subject.type, 'bnode', "the subject of the foaf:name triple should be blank");
	equals(triple.property, $.rdf.resource('foaf:name', ns));
	equals(triple.object, $.rdf.literal('"Ben Adida"'));
	
	rdf = $('#main > p > span').rdfa();
	equals(rdf.databank.size(), 2, 'the span should return two triples');
	triples = rdf.databank.triples();
	triple = triples[0];
	if (triple !== undefined) {
		equals(triple.subject, $.rdf.resource('<>'));
		equals(triple.property, $.rdf.resource('dc:creator', ns));
		equals(triple.object.type, 'bnode', "the object of the dc:creator triple should be blank");
	}
	triple = triples[1];
	if (triple !== undefined) {
		equals(triple.subject.type, 'bnode', "the subject of the foaf:name triple should be blank");
		equals(triple.property, $.rdf.resource('foaf:name', ns));
		equals(triple.object, $.rdf.literal('"Ben Adida"'));
		ok(triples[0].object === triples[1].subject, "the object of the first triple should be the same as the subject of the second triple");
	}
	
	$('#main > p').remove();
});

test("Test 0034", function() {
	setup('<div about="http://sw-app.org/mic.xhtml#i" rel="foaf:img"><img src="http://sw-app.org/img/mic_2007_01.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div > img').rdfa(), []);
	testTriples($('#main > div').rdfa(),
		[$.rdf.triple('<http://sw-app.org/mic.xhtml#i> foaf:img <http://sw-app.org/img/mic_2007_01.jpg> .', ns)]);
	$('#main > div').remove();
});

test("Test 0035", function () {
  setup('<div><img 	about="http://sw-app.org/mic.xhtml#i" rel="foaf:img" src="http://sw-app.org/img/mic_2007_01.jpg" href="http://sw-app.org/img/mic_2006_03.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/img/mic_2006_03.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0036", function () {
  setup('<div><img 	about="http://sw-app.org/mic.xhtml#i" rel="foaf:img" src="http://sw-app.org/img/mic_2007_01.jpg" resource="http://sw-app.org/img/mic_2006_03.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/img/mic_2006_03.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0037", function () {
  setup('<div><img 	about="http://sw-app.org/mic.xhtml#i" rel="foaf:img" src="http://sw-app.org/img/mic_2007_01.jpg"  href="http://sw-app.org/img/mic_2006_03.jpg" resource="http://sw-app.org/mic.xhtml#photo"  alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#i> <http://xmlns.com/foaf/0.1/img> <http://sw-app.org/mic.xhtml#photo> .')
	]);
	$('#main > div').remove();
});

test("Test 0038", function () {
  setup('<div about="http://sw-app.org/mic.xhtml#i" rev="foaf:depicts"><img src="http://sw-app.org/img/mic_2007_01.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/img/mic_2007_01.jpg> <http://xmlns.com/foaf/0.1/depicts> <http://sw-app.org/mic.xhtml#i> .')
	]);
	$('#main > div').remove();
});

test("Test 0039", function () {
  setup('<div><img 	about="http://sw-app.org/mic.xhtml#i" rev="foaf:depicts" src="http://sw-app.org/img/mic_2007_01.jpg"  href="http://sw-app.org/img/mic_2006_03.jpg"  alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/img/mic_2006_03.jpg> <http://xmlns.com/foaf/0.1/depicts> <http://sw-app.org/mic.xhtml#i> .')
	]);
	$('#main > div').remove();
});

test("Test 0040", function () {
  setup('<div><img src="http://sw-app.org/img/mic_2007_01.jpg" rev="alternate" resource="http://sw-app.org/img/mic_2006_03.jpg" alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/img/mic_2006_03.jpg>  <http://www.w3.org/1999/xhtml/vocab#alternate> <http://sw-app.org/img/mic_2007_01.jpg> .')
	]);
	$('#main > div').remove();
});

test("Test 0041", function () {
  setup('<div><img 	about="http://sw-app.org/mic.xhtml#i" rev="foaf:depicts" src="http://sw-app.org/img/mic_2007_01.jpg" href="http://sw-app.org/img/mic_2006_03.jpg" resource="http://sw-app.org/mic.xhtml#photo"  alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<http://sw-app.org/mic.xhtml#photo> <http://xmlns.com/foaf/0.1/depicts> <http://sw-app.org/mic.xhtml#i> .')
	]);
	$('#main > div').remove();
});

test("Test 0042", function () {
  setup('<div><img 	rel="foaf:img" src="http://sw-app.org/img/mic_2007_01.jpg"  alt="A photo depicting Michael" /></div>');
	testTriples($('#main > div').rdfa(), []);
	$('#main > div').remove();
});

test("Test 0046", function () {
  setup('<div rel="foaf:maker" typeof="foaf:Document"><p property="foaf:name">John Doe</p></div>');
  var triples = $('#main > div').rdf().databank.triples();
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Document');
  equals(triples[0].subject, triples[1].subject);
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/maker');
  equals(triples[1].object.type, 'bnode');
  equals(triples[1].object, triples[2].subject);
  equals(triples[2].subject.type, 'bnode');
  equals(triples[2].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[2].object.value, 'John Doe');
	$('#main > div').remove();
});

test("Test 0047", function () {
  setup('<div rel="foaf:maker" typeof="foaf:Document" resource="http://www.example.org/#me"><p property="foaf:name">John Doe</p></div>');
  var triples = $('#main > div').rdf().databank.triples();
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Document');
  equals(triples[0].subject, triples[1].subject);
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/maker');
  equals(triples[1].object.value, 'http://www.example.org/#me');
  equals(triples[2], $.rdf.triple('<http://www.example.org/#me> <http://xmlns.com/foaf/0.1/name> "John Doe" .'));
	$('#main > div').remove();
});

test("Test 0048", function () {
  setup('<div about="http://www.example.org/#me" rel="foaf:knows" typeof="foaf:Person"><p property="foaf:name">John Doe</p></div>');
  var triples = $('#main > div').rdf().databank.triples();
  equals(triples[0], $.rdf.triple('<http://www.example.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .'));
  equals(triples[1].subject.value, 'http://www.example.org/#me');
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/knows');
  equals(triples[1].object.type, 'bnode');
  equals(triples[1].object, triples[2].subject);
  equals(triples[2].subject.type, 'bnode');
  equals(triples[2].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[2].object.value, 'John Doe');
	$('#main > div').remove();
});

test("Test 0049", function () {
  setup('<div about="http://www.example.org/#me" typeof="foaf:Person"><p property="foaf:name">John Doe</p></div>');
	testTriples($('#main > div').rdfa(), [
  $.rdf.triple('<http://www.example.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .'),
	  $.rdf.triple('<http://www.example.org/#me> <http://xmlns.com/foaf/0.1/name> "John Doe" .')
	]);
	$('#main > div').remove();
});

test("Test 0050", function () {
  setup('<div typeof="foaf:Person"><p property="foaf:name">John Doe</p></div>');
  var triples = $('#main > div').rdf().databank.triples();
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://xmlns.com/foaf/0.1/Person');
  equals(triples[0].subject, triples[1].subject);
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://xmlns.com/foaf/0.1/name');
  equals(triples[1].object.value, 'John Doe');
	$('#main > div').remove();
});

/* TODO Fill in the missing tests: 0051-0085 */

test("Test 0086", function () {
  setup('<div about="http://www.example.org/#somebody" rel="foobar"><p resource="mailto:ivan@w3.org">mailto:ivan@w3.org</p></div>');
	testTriples($('#main > div').rdfa(), []);
	$('#main > div').remove();
});

/* TODO Fill in the missing tests: 0087-0091 */


test("Test 0092", function () {
  setup('<div about="">Author: <span property="dc:creator">Albert Einstein</span><h2 property="dc:title" datatype="rdf:XMLLiteral">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	testTriples($('#main > div').rdfa(), [
	  $.rdf.triple('<> <http://purl.org/dc/elements/1.1/creator> "Albert Einstein" .'),
	  $.rdf.triple('<> <http://purl.org/dc/elements/1.1/title>  "E = mc<sup xmlns=\\"http://www.w3.org/1999/xhtml\\">2</sup>: The Most Urgent Problem of Our Time"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .')
	]);
	$('#main > div').remove();
});

test("Test 0093", function () {
  setup('<div xmlns:ex="http://www.example.org/" about="">Author: <span property="dc:creator">Albert Einstein</span><h2 property="dc:title" datatype="ex:XMLLiteral">E = mc<sup>2</sup>: The Most Urgent Problem of Our Time</h2></div>');
	testTriples($('#main > div').rdfa(), [
    $.rdf.triple('<> <http://purl.org/dc/elements/1.1/creator> "Albert Einstein" .'),
    $.rdf.triple('<> <http://purl.org/dc/elements/1.1/title>  "E = mc2: The Most Urgent Problem of Our Time"^^<http://www.example.org/XMLLiteral> .')
	]);
	$('#main > div').remove();
});


module("Adding RDFa to elements");

test("adding RDFa to an element", function() {
  var eventFired = false;
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.bind("rdfChange", function () {
    eventFired = true;
  });
  span.rdfa('<> dc:creator "Jeni Tennison" .');
  ok(eventFired, "should trigger any functions bound to the changeRDF event");
  $('#main > p').remove();
});

test("adding RDFa to an element whose text matches the literal value of the RDFa", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> dc:creator "Jeni Tennison" .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'dc:creator');
  equals(span.attr('content'), undefined);
  equals(span.attr('datatype'), '');
  $('#main > p').remove();
});

test("adding RDFa to an element whose text does not match the literal value of the RDFa", function() {
  setup('<p>This document is by <span>me</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> dc:creator "Jeni Tennison" .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'dc:creator');
  equals(span.attr('content'), 'Jeni Tennison');
  equals(span.attr('datatype'), undefined);
  $('#main > p').remove();
});

test("adding RDFa to an element whose value has a datatype", function() {
  setup('<p>Last updated <span>today</span></p>');
  var span = $('#main > p > span');
  span.rdfa('<> dc:date "2008-10-19"^^xsd:date .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'dc:date');
  equals(span.attr('content'), '2008-10-19');
  equals(span.attr('datatype'), 'xsd:date');
  $('#main > p').remove();
});

test("adding RDFa without the namespaces already having been declared", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> <http://www.example.org/ns/my#author> "Jeni Tennison" .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'ns1:author');
  equals(span.attr('content'), undefined);
  equals(span.attr('datatype'), '');
  equals(span.attr('xmlns:ns1'), 'http://www.example.org/ns/my#');
  $('#main > p').remove();
});

test("adding RDFa to an element where the literal value has a language", function() {
  setup('<p>This document is about my <span>chat</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> ex:topic "chat"@fr .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'ex:topic');
  equals(span.attr('content'), undefined);
  equals(span.attr('datatype'), undefined);
  equals(span.attr('lang'), 'fr');
  $('#main > p').remove();
});

test("adding RDFa to an element where the literal value has a language different from the context and its contents", function() {
  setup('<p lang="en">This document is about my <span>cat</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> ex:topic "chat"@fr .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'ex:topic');
  equals(span.attr('content'), 'chat');
  equals(span.attr('datatype'), undefined);
  equals(span.attr('lang'), 'fr');
  equals(span.children('span').length, 1, "it should have a nested span added");
  equals(span.children('span').attr('lang'), 'en', "with the context language added");
  $('#main > p').remove();
});

test("adding RDFa where the object is an XMLLiteral", function() {
  setup('<p>This document is by <span>Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<> dc:creator "Jeni <em>Tennison</em>"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'dc:creator');
  equals(span.attr('content'), undefined);
  equals(span.attr('datatype'), 'rdf:XMLLiteral');
  equals(span.children('em').length, 1, "it should have a nested em added");
  equals(span.children('em').text(), "Tennison");
  $('#main > p').remove();
});

test("adding RDFa where the subject is a resource and the object is an XMLLiteral", function() {
	setup('<p>This photo was taken by <span class="author">Mark Birbeck</span>.</p>');
  var span = $('#main > p > span');
  span.rdfa('<photo1.jpg> dc:creator "Mark Birbeck" .');
  equals(span.attr('about'), 'photo1.jpg');
  equals(span.attr('property'), 'dc:creator');
  equals(span.attr('content'), undefined);
  equals(span.attr('datatype'), '');
  $('#main > p').remove();
});

test("adding RDFa where the object is a resource which is already referenced", function() {
	setup('<p>This photo was taken by <a href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  a.rdfa('<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .');
  equals(a.attr('about'), 'photo1.jpg');
  equals(a.attr('rel'), 'dc:creator');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  equals(a.attr('resource'), undefined);
  $('#main > p').remove();
});

test("adding RDFa where the subject is a resource which is already referenced", function() {
	setup('<p>This photo was taken by <a href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  a.rdfa('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .');
  equals(a.attr('about'), 'photo1.jpg');
  equals(a.attr('rel'), undefined);
  equals(a.attr('rev'), 'foaf:img');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  equals(a.attr('resource'), undefined);
  $('#main > p').remove();
});

test("adding RDFa where the subject and object are resource which are already referenced", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
  var a = $('#main > p > a');
  a.rdfa('<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .');
  equals(a.attr('about'), 'photo1.jpg');
  equals(a.attr('rel'), 'dc:creator');
  equals(a.attr('rev'), 'foaf:img');
  equals(a.attr('href'), 'http://www.blogger.com/profile/1109404');
  equals(a.attr('resource'), undefined);
  $('#main > p').remove();
});

test("adding a triple with a literal, where the subject is already present", function() {
	setup('<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p>');
	var a = $('#main > p > a');
	a.rdfa('<photo1.jpg> dc:title "Portrait of Mark" .');
	equals(a.attr('about'), 'photo1.jpg');
	equals(a.attr('property'), 'dc:title');
	equals(a.attr('content'), 'Portrait of Mark');
	equals(a.attr('datatype'), undefined);
	$('#main > p').remove();
});

test("adding a triple whose subject is a blank node", function() {
	setup('<p><span>Manu Sporny</span> <span>knows</span> <span about="[_:b]" property="foaf:name">Ralph Swick</span>.</p>');
	var span1 = $('#main > p > span:eq(0)');
	span1.rdfa('_:a foaf:name "Manu Sporny" .');
	equals(span1.attr('about'), '[_:a]');
	equals(span1.attr('property'), 'foaf:name');
	var span2 = $('#main > p > span:eq(1)');
	span2.rdfa('_:a foaf:knows _:b .');
	equals(span2.attr('about'), '[_:a]');
	equals(span2.attr('rel'), 'foaf:knows');
	equals(span2.attr('resource'), '[_:b]');
	$('#main > p').remove();
});

test("adding a triple whose object is a resource, when the element has a different href", function() {
	setup('<p about="#wtw">The book <b>Weaving the Web</b> (hardcover) has the ISBN <a href="http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907">0752820907</a>.</p>');
	var a = $('#main > p > a');
	a.rdfa('<#wtw> dc:identifier <urn:ISBN:0752820907> .');
	equals(a.attr('about'), undefined);
	equals(a.attr('rel'), 'dc:identifier');
	equals(a.attr('resource'), 'urn:ISBN:0752820907');
	equals(a.attr('href'), 'http://www.amazon.com/Weaving-Web-Tim-Berners-Lee/dp/0752820907');
	$('#main > p').remove();
});

test('adding a triple whose object is a literal, when the element\'s object is the triple\'s subject', function() {
  setup('<p>This is <a rel="dc:creator" href="http://www.jenitennison.com/">Jeni\'s Home Page</a></p>');
  var a = $('#main > p > a');
  a.rdfa('<http://www.jenitennison.com/> dc:title "Jeni\'s XSLT Pages" .');
  equals(a.attr('about'), undefined);
  equals(a.attr('rel'), 'dc:creator');
  equals(a.attr('href'), 'http://www.jenitennison.com/');
  equals(a.attr('property'), undefined);
  var span = a.children('span');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'dc:title');
  equals(span.attr('content'), 'Jeni\'s XSLT Pages');
  equals(span.attr('datatype'), undefined);
  $('#main > p').remove();
});

test('adding a triple where the element already has the triple with a different value', function() {
  setup('<p>This is about <span about="#SusannahDarwin" property="rdf:label">Susannah Darwin</span></p>');
  var span = $('#main > p > span');
  span.rdfa('<#SusannahDarwin> rdf:label "Susannah" .');
  equals(span.attr('about'), '#SusannahDarwin');
  equals(span.attr('property'), 'rdf:label');
  equals(span.attr('content'), undefined);
  span = span.children('span');
  equals(span.attr('about'), undefined);
  equals(span.attr('property'), 'rdf:label');
  equals(span.attr('content'), 'Susannah');
  equals(span.text(), 'Susannah Darwin');
  $('#main > p').remove();
});

test('adding a triple where the element already has a triple with the same literal value', function() {
  setup('<p>This is about <span about="#SusannahDarwin" property="rdf:label">Susannah Darwin</span></p>');
  var span = $('#main > p > span');
  span.rdfa('<#SusannahDarwin> foaf:name "Susannah Darwin" .');
  equals(span.attr('about'), '#SusannahDarwin');
  equals(span.attr('property'), 'rdf:label foaf:name');
  equals(span.text(), 'Susannah Darwin');
  ok(span.children('*').length === 0, 'the span doesn\'t have any child elements');
  $('#main > p').remove();
});

test('adding a triple where the element already has the triple with a different object', function() {
  setup('<p>This is about <span about="#SusannahDarwin" rel="foaf:son" resource="#CharlesDarwin">Susannah Darwin</span></p>');
  var span = $('#main > p > span');
  span.rdfa('<#SusannahDarwin> foaf:son <#ErasmusDarwin> .');
  equals(span.attr('about'), '#SusannahDarwin');
  equals(span.attr('rel'), 'foaf:son');
  equals(span.attr('resource'), '#CharlesDarwin');
  span = span.parent();
  equals(span.attr('about'), '#ErasmusDarwin');
  equals(span.attr('rev'), 'foaf:son');
  equals(span.attr('resource'), undefined);
  $('#main > p').remove();
});

test('adding a repeat of a triple', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="#CharlesRobertDarwin"><span property="foaf:firstName">Charles</span> Robert <span property="foaf:surname">Darwin</span></span></p>');
  var span = $('#main > p > span');
  span.rdfa('<#CharlesRobertDarwin> rdf:label "Charles Robert Darwin" .');
  equals(span.attr('about'), '#CharlesRobertDarwin');
  equals(span.attr('typeof'), 'foaf:Person');
  equals(span.attr('property'), 'rdf:label');
  equals(span.attr('datatype'), '');
  $('#main > p').remove();
});

module("removing RDFa from elements");

test("removing RDFa from an element", function() {
  var eventFired = false;
  setup('<p>This document is by <span property="dc:creator">Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.bind("rdfChange", function () {
    eventFired = true;
  });
  span.removeRdfa({ property: "dc:creator" });
  ok(eventFired, "should trigger any functions bound to the changeRDF event");
  $('#main > p').remove();
});

test("removing a property from an element", function() {
  setup('<p>This document is by <span property="dc:creator">Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.removeRdfa({ property: "dc:creator" });
  equals(span.attr('property'), undefined, "the property attribute should be removed");
  $('#main > p').remove();
});

test("attempting to remove a property from an element when the property doesn't match", function() {
  setup('<p>This document is by <span property="dc:creator">Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.removeRdfa({ property: "dc:modified" });
  equals(span.attr('property'), "dc:creator", "the property attribute should not be removed");
  $('#main > p').remove();
});

test("removing a property from an element when the property contains multiple values", function() {
  setup('<p>This document is by <span property="dc:creator dc:contributor">Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.removeRdfa({ property: "dc:creator" });
  equals(span.attr('property'), "dc:contributor", "only the relevant value should be removed");
  $('#main > p').remove();
});

test("removing a property resource from an element", function () {
  setup('<p>This document is by <span property="dc:creator dc:contributor">Jeni Tennison</span>.</p>');
  var span = $('#main > p > span');
  span.removeRdfa({ property: $.rdf.resource('<' + ns.namespaces.dc + 'creator>') });
  equals(span.attr('property'), "dc:contributor", "only the relevant value should be removed");
  $('#main > p').remove();
});

test("removing a relation from an element", function () {
  setup('<p>This document is by <a rel="dc:creator" href="http://www.jenitennison.com/">Jeni Tennison</span>.</p>');
  var span = $('#main > p > a');
  span.removeRdfa({ property: "dc:creator" });
  ok(span.attr('rel') === '' || span.attr('rel') === undefined, "The rel attribute should be removed");
  $('#main > p').remove();
});

test("removing a type from an element", function () {
  setup('<p>This document is by <a about="http://www.jenitennison.com/" typeof="foaf:Person">Jeni Tennison</span>.</p>');
  var span = $('#main > p > a');
  span.removeRdfa({ type: "foaf:Person" });
  equals(span.attr('typeof'), undefined, "The typeof attribute should be removed");
  $('#main > p').remove();
});

module("Testing Selectors");

test('selecting nodes with a particular subject', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="#CharlesRobertDarwin"><span property="foaf:firstName">Charles</span> Robert <span property="foaf:surname">Darwin</span></span> and his mother <span about="#SusannahDarwin" property="rdf:label">Susannah Darwin</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:about('#CharlesRobertDarwin')");
  equals(darwin.length, 3, "there should be three spans about #CharlesRobertDarwin");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[1]);
  equals(darwin[2], spans[2]);
  $('#main > p').remove();
});

test('selecting nodes with any subject', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="#CharlesRobertDarwin"><span property="foaf:firstName">Charles</span> Robert <span property="foaf:surname">Darwin</span></span> and his mother <span about="#SusannahDarwin" property="rdf:label">Susannah Darwin</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:about");
  equals(darwin.length, 4, "there should be four spans that are about something or other");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[1]);
  equals(darwin[2], spans[2]);
  equals(darwin[3], spans[3]);
  $('#main > p').remove();
});

test('selecting nodes with a CURIE subject', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="[ex:Someone]">someone</span> and <span about="[ex:SomeoneElse]">someone else</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:about('[ex:Someone]')");
  equals(darwin.length, 1, "there should be one span about [ex:Someone]");
  equals(darwin[0], spans[0]);
  $('#main > p').remove();
});

test('selecting nodes that represent a particular type of thing', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="#CharlesRobertDarwin"><span property="foaf:firstName">Charles</span> Robert <span property="foaf:surname">Darwin</span></span> and his mother <span about="#SusannahDarwin" typeof="foaf:Person" property="rdf:label">Susannah Darwin</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:type('foaf:Person')");
  equals(darwin.length, 2, "there should be two spans whose type is a person");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[3]);
  $('#main > p').remove();
});

test('selecting nodes that represent any thing', function () {
  setup('<p><span datatype="" property="rdf:label" typeof="foaf:Person" about="#CharlesRobertDarwin"><span property="foaf:firstName">Charles</span> Robert <span property="foaf:surname">Darwin</span></span> and his mother <span about="#SusannahDarwin" typeof="foaf:Person" property="rdf:label">Susannah Darwin</span></p>');
  var spans = $('#main > p span');
  var darwin = $("#main span:type");
  equals(darwin.length, 2, "there should be two spans with a type");
  equals(darwin[0], spans[0]);
  equals(darwin[1], spans[3]);
  $('#main > p').remove();
});

})(jQuery);