/*
 * jquery.rdf.turtle.js unit tests
 */
(function($){

var testSuiteBase = 'http://www.w3.org/2001/sw/DataAccess/df1/tests/';

module("N3 Tests");

test("N3 tests", function () {
  var data =
    '# comment lines\n' +
    '  	  	   # comment line after whitespace\n' +
    '# empty blank line, then one with spaces and tabs\n' +
    '\n' +
    '  	  	   \n' +
    '<http://example.org/resource1> <http://example.org/property> <http://example.org/resource2> .\n' +
    '_:anon <http://example.org/property> <http://example.org/resource2> .\n' +
    '<http://example.org/resource2> <http://example.org/property> _:anon .\n' +
    '# spaces and tabs throughout:\n' +
    ' 	 <http://example.org/resource3> 	 <http://example.org/property>	 <http://example.org/resource2> 	.	 \n' +
    '\n' +
    '# line ending with CR NL (ASCII 13, ASCII 10)\n' +
    '<http://example.org/resource4> <http://example.org/property> <http://example.org/resource2> .\r\n' +
    '\n' +
    '# 2 statement lines separated by single CR (ASCII 10)\n' +
    '<http://example.org/resource5> <http://example.org/property> <http://example.org/resource2> .\n' +
    '<http://example.org/resource6> <http://example.org/property> <http://example.org/resource2> .\n' +
    '\n' +
    '# All literal escapes\n' +
    '<http://example.org/resource7> <http://example.org/property> "simple literal" .\n' +
    '<http://example.org/resource8> <http://example.org/property> "backslash:\\\\" .\n' +
    '<http://example.org/resource9> <http://example.org/property> "dquote:\\"" .\n' +
    '<http://example.org/resource10> <http://example.org/property> "newline:\\n" .\n' +
    '<http://example.org/resource11> <http://example.org/property> "return\\r" .\n' +
    '<http://example.org/resource12> <http://example.org/property> "tab:\\t" .\n' +
    '\n' +
    '# Space is optional before final .\n' +
    '<http://example.org/resource13> <http://example.org/property> <http://example.org/resource2>.\n' +
    '<http://example.org/resource14> <http://example.org/property> "x".\n' +
    '<http://example.org/resource15> <http://example.org/property> _:anon.\n' +
    '\n' +
    '# \\u and \\U escapes\n' +
    '# latin small letter e with acute symbol \\u00E9 - 3 UTF-8 bytes #xC3 #A9\n' +
    '<http://example.org/resource16> <http://example.org/property> "\\u00E9" .\n' +
    '# Euro symbol \\u20ac  - 3 UTF-8 bytes #xE2 #x82 #xAC\n' +
    '<http://example.org/resource17> <http://example.org/property> "\\u20AC" .\n' +
    '\n' +
    '# XML Literals as Datatyped Literals\n' +
    '<http://example.org/resource21> <http://example.org/property> ""^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource22> <http://example.org/property> " "^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource23> <http://example.org/property> "x"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource23> <http://example.org/property> "\\""^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource24> <http://example.org/property> "<a></a>"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource25> <http://example.org/property> "a <b></b>"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource26> <http://example.org/property> "a <b></b> c"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource26> <http://example.org/property> "a\\n<b></b>\\nc"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '<http://example.org/resource27> <http://example.org/property> "chat"^^<http://www.w3.org/2000/01/rdf-schema#XMLLiteral> .\n' +
    '\n' +
    '# Plain literals with languages\n' +
    '<http://example.org/resource30> <http://example.org/property> "chat"@fr .\n' +
    '<http://example.org/resource31> <http://example.org/property> "chat"@en .\n' +
    '\n' +
    '# Typed Literals\n' +
    '<http://example.org/resource32> <http://example.org/property> "abc"^^<http://example.org/datatype1> .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'n3.ttl' });
  equals(triples.length, 30);
});

module("Turtle Test Suite");

test("test-00", function () {
  var data =
    '@prefix : <#> .\n' +
    '[] :x :y .\n';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-00.ttl' });
  equals(triples.length, 1);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://www.w3.org/2001/sw/DataAccess/df1/tests/test-00.ttl#x');
  equals(triples[0].object.value, 'http://www.w3.org/2001/sw/DataAccess/df1/tests/test-00.ttl#y');
});

test("test-01", function () {
  var data =
    '# Test @prefix and qnames\n' +
    '@prefix :  <http://example.org/base1#> .\n' +
    '@prefix a: <http://example.org/base2#> .\n' +
    '@prefix b: <http://example.org/base3#> .\n' +
    ':a :b :c .\n' +
    'a:a a:b a:c .\n' +
    ':a a:a b:a .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-01.ttl' });
  equals(triples.length, 3);
  equals(triples[0], $.rdf.triple('<http://example.org/base1#a> <http://example.org/base1#b> <http://example.org/base1#c> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/base2#a> <http://example.org/base2#b> <http://example.org/base2#c> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/base1#a> <http://example.org/base2#a> <http://example.org/base3#a> .'));
});

test("test-02", function () {
  var data =
    '# Test , operator\n' +
    '@prefix : <http://example.org/base#> .\n' +
    ':a :b :c,\n' +
    '      :d,\n' +
    '      :e .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-02.ttl' });
  equals(triples.length, 3);
  equals(triples[0], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#b> <http://example.org/base#c> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#b> <http://example.org/base#d> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#b> <http://example.org/base#e> .'));
});

test("test-03", function () {
  var data =
    '# Test ; operator\n' +
    '@prefix : <http://example.org/base#> .\n' +
    ':a :b :c ;\n' +
    '   :d :e ;\n' +
    '   :f :g .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-03.ttl' });
  equals(triples.length, 3);
  equals(triples[0], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#b> <http://example.org/base#c> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#d> <http://example.org/base#e> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/base#a> <http://example.org/base#f> <http://example.org/base#g> .'));
});

test("test-04", function () {
  var data =
    '# Test empty [] operator; not allowed as predicate\n' +
    '@prefix : <http://example.org/base#> .\n' +
    '[] :a :b .\n' +
    ':c :d [] .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-04.ttl' });
  equals(triples.length, 2);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://example.org/base#a');
  equals(triples[0].object.value, 'http://example.org/base#b');
  equals(triples[1].subject.value, 'http://example.org/base#c');
  equals(triples[1].property.value, 'http://example.org/base#d');
  equals(triples[1].object.type, 'bnode');
  ok(triples[0].subject.value !== triples[1].object.value, "the two blank nodes should have different ids");
});

test("test-05", function () {
  var data =
    '# Test non empty [] operator; not allowed as predicate\n' +
    '@prefix : <http://example.org/base#> .\n' +
    '[ :a :b ] :c :d .\n' +
    ':e :f [ :g :h ] .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-05.ttl' });
  equals(triples.length, 4);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://example.org/base#a');
  equals(triples[0].object.value, 'http://example.org/base#b');
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://example.org/base#c');
  equals(triples[1].object.value, 'http://example.org/base#d');
  equals(triples[2].subject.type, 'bnode');
  equals(triples[2].property.value, 'http://example.org/base#g');
  equals(triples[2].object.value, 'http://example.org/base#h');
  equals(triples[3].subject.value, 'http://example.org/base#e');
  equals(triples[3].property.value, 'http://example.org/base#f');
  equals(triples[3].object.type, 'bnode');
  ok(triples[0].subject.value === triples[1].subject.value, "the blank node subjects of the first two triples should be the same");
  ok(triples[2].subject.value === triples[3].object.value, "the blank node subject of the third triple should be the same as the blank node object of the fourth triple");
  ok(triples[0].subject.value !== triples[2].subject.value, "the blank node subjects of the first and third triples should be different");
});

test("test-06", function () {
  var data =
    '# \'a\' only allowed as a predicate\n' +
    '@prefix : <http://example.org/base#> .\n' +
    ':a a :b .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-06.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/base#a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/base#b> .'));
});

test("test-07", function () {
  var data =
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a :b ( "apple" "banana" ) .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-07.ttl' });
  equals(triples.length, 5);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
  equals(triples[0].object.value, 'banana');
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');
  equals(triples[1].object.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');
  ok(triples[0].subject.value === triples[1].subject.value);
  equals(triples[2].subject.type, 'bnode');
  equals(triples[2].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
  equals(triples[2].object.value, 'apple');
  equals(triples[3].subject.type, 'bnode');
  equals(triples[3].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');
  equals(triples[3].object.type, 'bnode');
  ok(triples[2].subject.value === triples[3].subject.value);
  ok(triples[3].object.value === triples[1].subject.value);
  equals(triples[4].subject.value, 'http://example.org/stuff/1.0/a');
  equals(triples[4].property.value, 'http://example.org/stuff/1.0/b');
  equals(triples[4].object.type, 'bnode');
  ok(triples[4].object.value === triples[2].subject.value);
});

test("test-08", function () {
  var data =
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a :b ( ) .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-08.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/stuff/1.0/a> <http://example.org/stuff/1.0/b> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil> .'));
});

test("test-09", function () {
  var data =
    '# Test integer datatyped literals using an OWL cardinality constraint\n' +
    '@prefix owl: <http://www.w3.org/2002/07/owl#> .\n' +
    '\n' +
    '# based on examples in the OWL Reference\n' +
    '\n' +
    '_:hasParent a owl:ObjectProperty .\n' +
    '\n' +
    '[] a owl:Restriction ;\n' +
    '  owl:onProperty _:hasParent ;\n' +
    '  owl:maxCardinality 2 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-09.ttl' });
  equals(triples.length, 4);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].subject.value, '_:hasParent');
  equals(triples[0].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[0].object.value, 'http://www.w3.org/2002/07/owl#ObjectProperty');
  equals(triples[1].subject.type, 'bnode');
  equals(triples[1].property.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  equals(triples[1].object.value, 'http://www.w3.org/2002/07/owl#Restriction');
  equals(triples[2].subject.type, 'bnode');
  equals(triples[2].property.value, 'http://www.w3.org/2002/07/owl#onProperty');
  equals(triples[2].object.value, '_:hasParent');
  equals(triples[3].subject.type, 'bnode');
  equals(triples[3].property.value, 'http://www.w3.org/2002/07/owl#maxCardinality');
  equals(triples[3].object.value, '2');
  equals(triples[3].object.datatype, 'http://www.w3.org/2001/XMLSchema#integer');
  ok(triples[1].subject.value === triples[2].subject.value);
  ok(triples[2].subject.value === triples[3].subject.value);
});

test("test-10", function () {
  var data =
    '<http://example.org/res1> <http://example.org/prop1> 000000 .\n' +
    '<http://example.org/res2> <http://example.org/prop2> 0 .\n' +
    '<http://example.org/res3> <http://example.org/prop3> 000001 .\n' +
    '<http://example.org/res4> <http://example.org/prop4> 2 .\n' +
    '<http://example.org/res5> <http://example.org/prop5> 4 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-10.ttl' });
  equals(triples.length, 5);
  equals(triples[0], $.rdf.triple('<http://example.org/res1> <http://example.org/prop1> "000000"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/res2> <http://example.org/prop2> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/res3> <http://example.org/prop3> "000001"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[3], $.rdf.triple('<http://example.org/res4> <http://example.org/prop4> "2"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[4], $.rdf.triple('<http://example.org/res5> <http://example.org/prop5> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
});

test("test-11", function () {
  var data =
    '# Tests for - and _ in names, qnames\n' +
    '@prefix ex1: <http://example.org/ex1#> .\n' +
    '@prefix ex-2: <http://example.org/ex2#> .\n' +
    '@prefix ex3_: <http://example.org/ex3#> .\n' +
    '@prefix ex4-: <http://example.org/ex4#> .\n' +
    '\n' +
    'ex1:foo-bar ex1:foo_bar "a" .\n' +
    'ex-2:foo-bar ex-2:foo_bar "b" .\n' +
    'ex3_:foo-bar ex3_:foo_bar "c" .\n' +
    'ex4-:foo-bar ex4-:foo_bar "d" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-11.ttl' });
  equals(triples.length, 4);
  equals(triples[0], $.rdf.triple('<http://example.org/ex1#foo-bar> <http://example.org/ex1#foo_bar> "a" .'));
  equals(triples[1], $.rdf.triple('<http://example.org/ex2#foo-bar> <http://example.org/ex2#foo_bar> "b" .'));
  equals(triples[2], $.rdf.triple('<http://example.org/ex3#foo-bar> <http://example.org/ex3#foo_bar> "c" .'));
  equals(triples[3], $.rdf.triple('<http://example.org/ex4#foo-bar> <http://example.org/ex4#foo_bar> "d" .'));
});

test("test-12", function () {
  var data =
    '# Tests for rdf:_<numbers> and other qnames starting with _\n' +
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n' +
    '@prefix ex:  <http://example.org/ex#> .\n' +
    '@prefix :    <http://example.org/myprop#> .\n' +
    '\n' +
    'ex:foo rdf:_1 "1" .\n' +
    'ex:foo rdf:_2 "2" .\n' +
    'ex:foo :_abc "def" .\n' +
    'ex:foo :_345 "678" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-12.ttl' });
  equals(triples.length, 4);
  equals(triples[0], $.rdf.triple('<http://example.org/ex#foo> <http://www.w3.org/1999/02/22-rdf-syntax-ns#_1> "1" .'));
  equals(triples[1], $.rdf.triple('<http://example.org/ex#foo> <http://www.w3.org/1999/02/22-rdf-syntax-ns#_2> "2" .'));
  equals(triples[2], $.rdf.triple('<http://example.org/ex#foo> <http://example.org/myprop#_abc> "def" .'));
  equals(triples[3], $.rdf.triple('<http://example.org/ex#foo> <http://example.org/myprop#_345> "678" .'));
});

test("test-13", function () {
  var data =
    '# Test for : allowed\n' +
    '@prefix :    <http://example.org/ron> .\n' +
    '\n' +
    '[] : [] .\n' +
    '\n' +
    ': : : .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-13.ttl' });
  equals(triples.length, 2);
  equals(triples[0].subject.type, 'bnode');
  equals(triples[0].property.value, 'http://example.org/ron');
  equals(triples[0].object.type, 'bnode');
  ok(triples[0].subject.value !== triples[0].object.value);
  equals(triples[1], $.rdf.triple('<http://example.org/ron> <http://example.org/ron> <http://example.org/ron> .'));
});

test("test-17", function () {
  var data =
    '# Test long literal\n' +
    '@prefix :  <http://example.org/ex#> .\n' +
    ':a :b """a long\n' +
    '	literal\n' +
    'with\n' +
    'newlines""" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-17.ttl' });
  equals(triples.length, 1);
  equals(triples[0].subject.value, 'http://example.org/ex#a');
  equals(triples[0].property.value, 'http://example.org/ex#b');
  equals(triples[0].object.value, 'a long\n\tliteral\nwith\nnewlines');
});

test("test-18", function () {
  var data =
    '@prefix : <http://example.org/foo#> .\n' +
    '\n' +
    ':a :b """\\nthis \\ris a \\U00015678long\\t\n' +
    'literal\\uABCD\n' +
    '""" .\n' +
    '\n' +
    ':d :e """\\tThis \\uABCDis\\r \\U00015678another\\n\n' +
    'one\n' +
    '""" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-18.ttl' });
  equals(triples.length, 2);
  equals(triples[0].subject.value, 'http://example.org/foo#a');
  equals(triples[0].property.value, 'http://example.org/foo#b');
  equals(triples[0].object.value, '\nthis \ris a \u0001\u5678long\t\nliteral\uABCD\n');
  equals(triples[1].subject.value, 'http://example.org/foo#d');
  equals(triples[1].property.value, 'http://example.org/foo#e');
  equals(triples[1].object.value, '\tThis \uABCDis\r \u0001\u5678another\n\none\n');
});

test("test-19", function () {
  var data =
    '@prefix : <http://example.org/#> .\n' +
    '\n' +
    ':a :b  1.0 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-19.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/#a> <http://example.org/#b> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
});

test("test-20", function () {
  var data =
    '@prefix : <http://example.org/#> .\n' +
    '\n' +
    ':a :b "" .\n' +
    '\n' +
    ':c :d """""" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-20.ttl' });
  equals(triples.length, 2);
  equals(triples[0], $.rdf.triple('<http://example.org/#a> <http://example.org/#b> "" .'));
  equals(triples[1], $.rdf.triple('<http://example.org/#c> <http://example.org/#d> "" .'));
});

test("test-21", function () {
  var data =
    '@prefix : <http://example.org#> .\n' +
    ':a :b 1.0 .\n' +
    ':c :d 1 .\n' +
    ':e :f 1.0e0 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-21.ttl' });
  equals(triples.length, 3);
  equals(triples[0], $.rdf.triple('<http://example.org#a> <http://example.org#b> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[1], $.rdf.triple('<http://example.org#c> <http://example.org#d> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[2], $.rdf.triple('<http://example.org#e> <http://example.org#f> "1.0e0"^^<http://www.w3.org/2001/XMLSchema#double> .'));
});

test("test-22", function () {
  var data =
    '@prefix : <http://example.org#> .\n' +
    ':a :b -1.0 .\n' +
    ':c :d -1 .\n' +
    ':e :f -1.0e0 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-22.ttl' });
  equals(triples.length, 3);
  equals(triples[0], $.rdf.triple('<http://example.org#a> <http://example.org#b> "-1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[1], $.rdf.triple('<http://example.org#c> <http://example.org#d> "-1"^^<http://www.w3.org/2001/XMLSchema#integer> .'));
  equals(triples[2], $.rdf.triple('<http://example.org#e> <http://example.org#f> "-1.0e0"^^<http://www.w3.org/2001/XMLSchema#double> .'));
});

test("test-23", function () {
  var data =
    '# Test long literal\n' +
    '@prefix :  <http://example.org/ex#> .\n' +
    ':a :b """John said: "Hello World!\\"""" .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-23.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/ex#a> <http://example.org/ex#b> "John said: \\"Hello World!\\"" .'));
});

test("test-24", function () {
  var data =
    '@prefix : <http://example.org#> .\n' +
    ':a :b true .\n' +
    ':c :d false .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-24.ttl' });
  equals(triples.length, 2);
  equals(triples[0], $.rdf.triple('<http://example.org#a> <http://example.org#b> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .'));
  equals(triples[1], $.rdf.triple('<http://example.org#c> <http://example.org#d> "false"^^<http://www.w3.org/2001/XMLSchema#boolean> .'));
});

test("test-25", function () {
  var data =
    '# comment test\n' +
    '@prefix : <http://example.org/#> .\n' +
    ':a :b :c . # end of line comment\n' +
    ':d # ignore me\n' +
    '  :e # and me\n' +
    '      :f # and me\n' +
    '        .\n' +
    ':g :h #ignore me\n' +
    '     :i,  # and me\n' +
    '     :j . # and me\n' +
    '     \n' +
    ':k :l :m ; #ignore me\n' +
    '   :n :o ; # and me\n' +
    '   :p :q . # and me';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-25.ttl' });
  equals(triples.length, 7);
  equals(triples[0], $.rdf.triple('<http://example.org/#a> <http://example.org/#b> <http://example.org/#c> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/#d> <http://example.org/#e> <http://example.org/#f> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/#g> <http://example.org/#h> <http://example.org/#i> .'));
  equals(triples[3], $.rdf.triple('<http://example.org/#g> <http://example.org/#h> <http://example.org/#j> .'));
  equals(triples[4], $.rdf.triple('<http://example.org/#k> <http://example.org/#l> <http://example.org/#m> .'));
  equals(triples[5], $.rdf.triple('<http://example.org/#k> <http://example.org/#n> <http://example.org/#o> .'));
  equals(triples[6], $.rdf.triple('<http://example.org/#k> <http://example.org/#p> <http://example.org/#q> .'));
});

test("test-26", function () {
  var data =
    '# comment line with no final newline test\n' +
    '@prefix : <http://example.org/#> .\n' +
    ':a :b :c .\n' +
    '#foo';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-26.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/#a> <http://example.org/#b> <http://example.org/#c> .'));
});

test("test-27", function () {
  var data =
    '@prefix foo: <http://example.org/foo#>  .\n' +
    '@prefix foo: <http://example.org/bar#>  .\n' +
    '\n' +
    'foo:blah foo:blah foo:blah .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-27.ttl' });
  equals(triples.length, 1);
  equals(triples[0], $.rdf.triple('<http://example.org/bar#blah> <http://example.org/bar#blah> <http://example.org/bar#blah> .'));
});

test("test-28", function () {
  var data =
    '<http://example.org/foo> <http://example.org/bar> "2.345"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "1"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "1."^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "1.000000000"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.3"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.234000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.2340000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.23400000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.234000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.2340000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.23400000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.234000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.2340000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.23400000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.234000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.2340000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.23400000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.234000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.2340000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "2.23400000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .\n' +
    '<http://example.org/foo> <http://example.org/bar> "1.2345678901234567890123457890"^^<http://www.w3.org/2001/XMLSchema#decimal> .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-28.ttl' });
  equals(triples.length, 22);
  equals(triples[0], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.345"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[3], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[4], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "1.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[5], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.30"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[6], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.234000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[7], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.2340000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[8], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.23400000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[9], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.234000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[10], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.2340000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[11], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.23400000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[12], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.234000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[13], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.2340000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[14], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.23400000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[15], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.234000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[16], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.2340000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[17], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.23400000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[18], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.234000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[19], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.2340000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[20], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "2.23400000000000000000005"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
  equals(triples[21], $.rdf.triple('<http://example.org/foo> <http://example.org/bar> "1.234567890123456789012345789"^^<http://www.w3.org/2001/XMLSchema#decimal> .'));
});

/*
test("test-29", function () {
  var data =
    '<http://example.org/node> <http://example.org/prop> <scheme:\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007\\u0008\\t\\n\\u000B\\u000C\\r\\u000E\\u000F\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017\\u0018\\u0019\\u001A\\u001B\\u001C\\u001D\\u001E\\u001F !"#$%&\'()*+,-./0123456789:/<=\\u003E?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\\u007F> .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-29.ttl' });
  equals(triples.length, 1);
  equals(triples[0].object.value, 'scheme:\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\t\n\u000B\u000C\r\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F !"#$%&\'()*+,-./0123456789:/<=\u003E?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u007F');
});
*/

test("test-30", function () {
  var data =
    '# In-scope base URI is http://www.w3.org/2001/sw/DataAccess/df1/tests/ at this point\n' +
    '<a1> <b1> <c1> .\n' +
    '@base <http://example.org/ns/> .\n' +
    '# In-scope base URI is http://example.org/ns/ at this point\n' +
    '<a2> <http://example.org/ns/b2> <c2> .\n' +
    '@base <foo/> .\n' +
    '# In-scope base URI is http://example.org/ns/foo/ at this point\n' +
    '<a3> <b3> <c3> .\n' +
    '@prefix : <bar#> .\n' +
    ':a4 :b4 :c4 .\n' +
    '@prefix : <http://example.org/ns2#> .\n' +
    ':a5 :b5 :c5 .';
  var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'test-30.ttl' });
  equals(triples.length, 5);
  equals(triples[0], $.rdf.triple('<http://www.w3.org/2001/sw/DataAccess/df1/tests/a1> <http://www.w3.org/2001/sw/DataAccess/df1/tests/b1> <http://www.w3.org/2001/sw/DataAccess/df1/tests/c1> .'));
  equals(triples[1], $.rdf.triple('<http://example.org/ns/a2> <http://example.org/ns/b2> <http://example.org/ns/c2> .'));
  equals(triples[2], $.rdf.triple('<http://example.org/ns/foo/a3> <http://example.org/ns/foo/b3> <http://example.org/ns/foo/c3> .'));
  equals(triples[3], $.rdf.triple('<http://example.org/ns/foo/bar#a4> <http://example.org/ns/foo/bar#b4> <http://example.org/ns/foo/bar#c4> .'));
  equals(triples[4], $.rdf.triple('<http://example.org/ns2#a5> <http://example.org/ns2#b5> <http://example.org/ns2#c5> .'));
});

test("bad-00", function () {
  var data = 
    '# prefix name must end in a :\n' +
    '@prefix a <#> .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-00.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-01", function () {
  var data = 
    '# Forbidden by RDF - predicate cannot be blank\n' +
    '@prefix : <http://example.org/base#> .\n' +
    ':a [ :b :c ] :d .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-01.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-02", function () {
  var data = 
    '# Forbidden by RDF - predicate cannot be blank\n' +
    '@prefix : <http://example.org/base#> .\n' +
    ':a [] :b .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-02.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-03", function () {
  var data = 
    '# \'a\' only allowed as a predicate\n' +
    '@prefix : <http://example.org/base#> .\n' +
    'a :a :b .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-03.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-04", function () {
  var data = 
    '# No comma is allowed in collections\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a :b ( "apple", "banana" ) .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-04.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-05", function () {
  var data = 
    '# N3 {}s are not in Turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    '{ :a :b :c . } :d :e .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-05.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-06", function () {
  var data = 
    '# is and of are not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a is :b of :c .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-06.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-07", function () {
  var data = 
    '# paths are not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a.:b.:c .\n' +
    ':a^:b^:c .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-06.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-08", function () {
  var data = 
    '@keywords something.\n' +
    '# @keywords is not in turtle';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-08.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-09", function () {
  var data = 
    '# implies is not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a => :b .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-09.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-10", function () {
  var data = 
    '# equivalence is not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a = :b .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-10.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-11", function () {
  var data = 
    '# @forAll is not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    '@forAll :x .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-11.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-12", function () {
  var data = 
    '# @forSome is not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    '@forSome :x .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-12.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-13", function () {
  var data = 
    '# <= is not in turtle\n' +
    '@prefix : <http://example.org/stuff/1.0/> .\n' +
    ':a <= :b .';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-13.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

test("bad-14", function () {
  var data = 
    '# Test long literals with missing end\n' +
    '@prefix :  <http://example.org/ex#> .\n' +
    ':a :b """a long\n' +
    '	literal\n' +
    'with\n' +
    'newlines';
  try {
    var triples = $.rdf.parsers['text/turtle'].triples(data, { base: testSuiteBase + 'bad-14.ttl' });
    ok(false, 'should give an error');
  } catch (e) {
    ok(true, 'should give an error');
  }
});

})(jQuery);