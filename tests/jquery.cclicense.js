/*
 * jquery.rdfa.js unit tests
 */
(function($){

var ns = { namespaces: { cc: "http://creativecommons.org/ns#" }};

function setup(content) {
	$('#main').html(content);
};

function teardown() {
  $('#main > *').remove();
};

function testTriples (received, expected) {
	var i, triples = received.databank.triples();
	equals(triples.length, expected.length, 'there should be ' + expected.length + ' triples');
	for (i = 0; i < expected.length; i += 1) {
		equals(triples[i], expected[i]);
	}
};

module("Gleaning RDF triples with $.fn.rdf()");

test("from an element without a cc:license", function () {
  setup('<p>This is just a paragraph</p>');
  testTriples($('#main > p').rdf(), []);
  teardown();
});

test("from an element with a rel='license'", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  testTriples($('#main > p > a').rdf(), [
    $.rdf.triple('<> a cc:Work', ns),
    $.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by/2.0/>', ns),
    $.rdf.triple('<http://creativecommons.org/licenses/by/2.0/> a cc:License', ns)
  ]);
  teardown();
});

test("from an element with a rel='cc:license'", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  testTriples($('#main > p > a').rdf(), [
    $.rdf.triple('<> a cc:Work', ns),
    $.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by/2.0/>', ns),
    $.rdf.triple('<http://creativecommons.org/licenses/by/2.0/> a cc:License', ns)
  ]);
  teardown();
});

module("Gleaning RDF triples with $.fn.cclicense()");

test("from an element without a cc:license", function () {
  setup('<p>This is just a paragraph</p>');
  testTriples($('#main > p').cclicense(), []);
  teardown();
});

test("from an element with a rel='license'", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  testTriples($('#main > p > a').cclicense(), [
    $.rdf.triple('<> a cc:Work', ns),
    $.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by/2.0/>', ns),
    $.rdf.triple('<http://creativecommons.org/licenses/by/2.0/> a cc:License', ns)
  ]);
  teardown();
});

test("from an element with a rel='cc:license'", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  testTriples($('#main > p > a').cclicense(), [
    $.rdf.triple('<> a cc:Work', ns),
    $.rdf.triple('<> cc:license <http://creativecommons.org/licenses/by/2.0/>', ns),
    $.rdf.triple('<http://creativecommons.org/licenses/by/2.0/> a cc:License', ns)
  ]);
  teardown();
});

module("Adding license information with $.fn.cclicense()");

test("to an element without a href attribute", function () {
  setup('<p>This is just a paragraph</p>');
  var p = $('#main > p');
  p.cclicense('http://creativecommons.org/licenses/by/2.0/');
  equals(p.attr('rel'), undefined, "it shouldn't add anything");
  teardown();
})

test("to an element with a href attribute", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/">cc by 2.0</a></p>');
  var a = $('#main > p > a');
  a.cclicense('http://creativecommons.org/licenses/by/2.0/');
  equals(a.attr('rel'), 'license');
  teardown();
});

test("to an element that already has a rel attribute", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="alternate">cc by 2.0</a></p>');
  var a = $('#main > p > a');
  a.cclicense('http://creativecommons.org/licenses/by/2.0/');
  equals(a.attr('rel'), 'alternate license');
  teardown();
});

module("Using type() selector");

test("from an element without a cc:license using type()", function () {
  setup('<p>This is just a paragraph</p>');
  var jquery = $('#main *:type()');
  equals(jquery.length, 0);
  teardown();
});

test("finding all elements with a rel='license' using type()", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  var jquery = $('#main *:type()');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("finding all elements with a rel='cc:license' using type()", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  var jquery = $('#main *:type()');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("from an element without a cc:license using type(cc:License)", function () {
  setup('<p>This is just a paragraph</p>');
  var jquery = $('#main *:type("cc:License")');
  equals(jquery.length, 0);
  teardown();
});

test("finding all elements with a rel='license' using type(cc:License)", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  var jquery = $('#main *:type("cc:License")');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("finding all elements with a rel='cc:license' using type(cc:License)", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  var jquery = $('#main *:type("cc:License")');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("from an element without a cc:license using type(cc:Work)", function () {
  setup('<p>This is just a paragraph</p>');
  var jquery = $('#main *:type("cc:Work")');
  equals(jquery.length, 0);
  teardown();
});

test("finding all elements with a rel='license' using type(cc:Work)", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  var jquery = $('#main *:type("cc:Work")');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("finding all elements with a rel='cc:license' using type(cc:Work)", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  var jquery = $('#main *:type("cc:Work")');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

module("Using about() selector");

test("from an element without a cc:license using about()", function () {
  setup('<p>This is just a paragraph</p>');
  var jquery = $('#main *:about()');
  equals(jquery.length, 0);
  teardown();
});

test("finding all elements with a rel='license' using about()", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="license">cc by 2.0</a></p>');
  var jquery = $('#main *:about()');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

test("finding all elements with a rel='cc:license' using about()", function () {
  setup('<p>License: <a href="http://creativecommons.org/licenses/by/2.0/" rel="cc:license">cc by 2.0</a></p>');
  var jquery = $('#main *:about()');
  equals(jquery.length, 1);
  ok(jquery.is('a'), "it should locate the <a> element");
  teardown();
});

})(jQuery);