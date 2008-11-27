/*
 * jquery.xfn.js unit tests
 */
(function ($){

	var ns = { namespaces: { foaf: "http://xmlns.com/foaf/0.1/" }}, 
    foaf = $.uri("http://xmlns.com/foaf/0.1/"),
    foafPersonClass = $.rdf.resource('<' + foaf + 'Person>'),
    foafKnowsProp = $.rdf.resource('<' + foaf + 'knows>'),
    foafWeblogProp = $.rdf.resource('<' + foaf + 'weblog>');


	function setup(content) {
		$('#main').html(content);
	}

	function teardown() {
		$('#main > *').remove();
	}

	function testTriples(received, expected) {
		var i, triples = received.databank.triples();
		equals(triples.length, expected.length, 'there should be ' + expected.length + ' triples');
		for (i = 0; i < expected.length; i += 1) {
			equals(triples[i], expected[i]);
		}
	}


	module("Gleaning RDF triples with $.fn.rdf()");

	test("from an element without any xfn", function () {
		setup('<p>This is just a paragraph</p>');
		testTriples($('#main > p').rdf(), []);
		teardown();
	});

	test("from an element with a rel='me'", function () {
		setup('<p>Me: <a href="http://example.com/" rel="me">Test Person1</a></p>');
		testTriples($('#main > p > a').rdf(), []);
		teardown();
	});

	test("from an element with a rel='friend'", function () {
		setup('<p>Friend: <a href="http://example.com/" rel="friend">Test Person2</a></p>');
		var work = '<' + $.uri.base() + '>';

		testTriples($('#main > p > a').rdf(), [
			$.rdf.triple('_:person1', $.rdf.type, foafPersonClass),
			$.rdf.triple('_:person1', foafWeblogProp, work),
			$.rdf.triple('_:person1', foafKnowsProp, '_:person2'),
			$.rdf.triple('_:person2', foafWeblogProp, '<http://example.com/>'),
			$.rdf.triple('_:person2', $.rdf.type, foafPersonClass)
		]);
		teardown();
	});


	test("from an element with a rel='friend met'", function () {
		setup('<p>Friend and met: <a href="http://example.com/" rel="friend met">Test Person3</a></p>');
		var work = '<' + $.uri.base() + '>';
		testTriples($('#main > p > a').rdf(), [
			$.rdf.triple('_:person1', $.rdf.type, foafPersonClass),
			$.rdf.triple('_:person1', foafWeblogProp, work),
			$.rdf.triple('_:person1', foafKnowsProp, '_:person2'),
			$.rdf.triple('_:person2', foafWeblogProp, '<http://example.com/>'),
			$.rdf.triple('_:person2', $.rdf.type, foafPersonClass)
		]);
		teardown();
	});

	module("Gleaning RDF triples with $.fn.xfn()");

	test("from an element without an xfn", function () {
		setup('<p>This is just a paragraph</p>');
		testTriples($('#main > p').xfn(), []);
		teardown();
	});

	test("from an element with a rel='me'", function () {
		setup('<p>Me: <a href="http://example.com/" rel="me">Test Person1</a></p>');
		testTriples($('#main > p > a').xfn(), []);
		teardown();
	});


	test("from an element with a rel='friend'", function () {
		setup('<p>Friend: <a href="http://example.com/" rel="friend">Test Person2</a></p>');
		var work = '<' + $.uri.base() + '>';
		testTriples($('#main > p > a').xfn(), [
			$.rdf.triple('_:person1', $.rdf.type, foafPersonClass),
			$.rdf.triple('_:person1', foafWeblogProp, work),
			$.rdf.triple('_:person1', foafKnowsProp, '_:person2'),
			$.rdf.triple('_:person2', foafWeblogProp, '<http://example.com/>'),
			$.rdf.triple('_:person2', $.rdf.type, foafPersonClass)

		]);
		teardown();
	});

	test("from an element with a rel='friend met'", function () {
		setup('<p>Friend and met: <a href="http://example.com/" rel="friend met">Test Person3</a></p>');
		var work = '<' + $.uri.base() + '>';
		testTriples($('#main > p > a').xfn(), [
			$.rdf.triple('_:person1', $.rdf.type, foafPersonClass),
			$.rdf.triple('_:person1', foafWeblogProp, work),
			$.rdf.triple('_:person1', foafKnowsProp, '_:person2'),
			$.rdf.triple('_:person2', foafWeblogProp, '<http://example.com/>'),
			$.rdf.triple('_:person2', $.rdf.type, foafPersonClass)

		]);
		teardown();
	});


	module("Adding xfn information with $.fn.xfn()");

	test("to an element without a href attribute", function () {
		setup('<p>This is just a paragraph</p>');
		var p = $('#main > p');
		p.xfn('met');
		equals(p.attr('rel'), undefined, "it shouldn't add anything");
		teardown();
	});


	test("to an element with a href attribute", function () {
		setup('<p>Met: <a href="http://example.com/">Mr Foo</a></p>');
		var a = $('#main > p > a');
		a.xfn('met');
		equals(a.attr('rel'), 'met');
		teardown();
	});


	test("to an element that already has a rel attribute", function () {
		setup('<p>Met: <a href="http://example.com/" rel="friend">Mr Foo</a></p>');
		var a = $('#main > p > a');
		a.xfn('met');
		equals(a.attr('rel'), 'friend met');
		teardown();
	});


	module("Using type() selector");

	test("from an element without an xfn using type()", function () {
		setup('<p>This is just a paragraph</p>');
		var jquery = $('#main *:type()');
		equals(jquery.length, 0);
		teardown();
	});


	test("finding all elements with a rel for xfn using type()", function () {
		setup('<p>Met: <a href="http://example.com/">Mr Foo</a></p>');
		var jquery = $('#main *:type()');
		equals(jquery.length, 1);
		ok(jquery.is('a'), "it should locate the <a> element");
		teardown();
	});


	test("from an element without a rel using type(foaf:Person)", function () {
		setup('<p>This is just a paragraph</p>');
		var jquery = $('#main *:type("foaf:Person")');
		equals(jquery.length, 0);
		teardown();
	});


	test("finding all elements with a rel using type(foaf:Person)", function () {
		setup('<p>Met: <a href="http://example.com/">Mr Foo</a></p>');
		var jquery = $("#main *:type('foaf:Person')");
		equals(jquery.length, 1);
		ok(jquery.is('a'), "it should locate the <a> element");
		teardown();
	});


	module("Using about() selector");

	test("from an element without a xfn using about()", function () {
		setup('<p>This is just a paragraph</p>');
		var jquery = $('#main *:about()');
		equals(jquery.length, 0);
		teardown();
	});

	test("finding all elements with a rel='license' using about()", function () {
		setup('<p>Met: <a href="http://example.com/">Mr Foo</a></p>');
		var jquery = $('#main *:about()');
		equals(jquery.length, 1);
		ok(jquery.is('a'), "it should locate the <a> element");
		teardown();
	});

})(jQuery);