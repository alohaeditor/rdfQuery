/*
 * jquery.hcard.vcard.js unit tests
 */
(function ($){

	var ns = { namespaces: { v: "http://www.w3.org/2006/vcard/ns#" }}, 
    v = $.uri("http://www.w3.org/2006/vcard/ns#"),
    vCardClass = $.rdf.resource('<' + v + 'Vcard>');

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


	test("from an element without any hcard", function () {
		setup('<p>This is just a paragraph</p>');
		testTriples($('#main > p').rdf(), []);
		teardown();
	});


	test("from the simplest element with a class='vcard'", function () {
		setup('<span class="vcard"></span>');
    	var x = $.rdf.triple($.rdf.blank('[]'), $.rdf.type, vCardClass)
    	var q = $('#main > span').rdf();
    	q = q.where('?vcard a '+vCardClass);
		equals(q.length, 1, "there should one vcard");
		teardown();
	});


	test("from the simplest element with a class='vcard'", function () {
		setup('<span class="vcard"><a class="fn" href="http://irs.gov/">Internal Revenue Service</a></span>');

		var blank = $.rdf.blank('[]');
    	var x = $.rdf.triple(blank, $.rdf.type, vCardClass);
    	var y = $.rdf.triple(blank, $.rdf.resource('<'+v+'n>'), $.rdf.literal('"Internal Revenue Service"'));
    	var q = $('#main > span').rdf();
    	q = q.where('?vcard a '+vCardClass);
		equals(q.length, 1, "there should one vcard");
		q = q.where('?vcard v:fn "Internal Revenue Service"');
		equals(q.length, 1, "there should be one literal with a specific value");
		teardown();
	});



	test("from fn with another class second", function () {
		setup('<span class="vcard"><a class="fn foo" href="http://irs.gov/">Internal Revenue Service</a></span>');

		var blank = $.rdf.blank('[]');
    	var x = $.rdf.triple(blank, $.rdf.type, vCardClass);
    	var y = $.rdf.triple(blank, $.rdf.resource('<'+v+'n>'), $.rdf.literal('"Internal Revenue Service"'));
    	var q = $('#main > span').rdf();
    	q = q.where('?vcard a '+vCardClass);
		equals(q.length, 1, "there should one vcard");
		q = q.where('?vcard v:fn "Internal Revenue Service"');
		equals(q.length, 1, "there should be one literal with a specific value");
		teardown();
	});



	test("from fn with another class first", function () {
		setup('<span class="vcard"><a class="foo fn" href="http://irs.gov/">Internal Revenue Service</a></span>');

		var blank = $.rdf.blank('[]');
    	var x = $.rdf.triple(blank, $.rdf.type, vCardClass);
    	var y = $.rdf.triple(blank, $.rdf.resource('<'+v+'n>'), $.rdf.literal('"Internal Revenue Service"'));
    	var q = $('#main > span').rdf();

    	q = q.where('?vcard a '+vCardClass);

		equals(q.length, 1, "there should one vcard");
		q = q.where('?vcard v:fn "Internal Revenue Service"');
		equals(q.length, 1, "there should be one literal with a specific value");
		teardown();
	});


	test("from fn with another class first and last", function () {
		setup('<span class="vcard"><a class="foo fn bar" href="http://irs.gov/">Internal Revenue Service</a></span>');

		var blank = $.rdf.blank('[]');
    	var x = $.rdf.triple(blank, $.rdf.type, vCardClass);
    	var y = $.rdf.triple(blank, $.rdf.resource('<'+v+'n>'), $.rdf.literal('"Internal Revenue Service"'));
    	var q = $('#main > span').rdf();
    	q = q.where('?vcard a '+vCardClass);
		equals(q.length, 1, "there should one vcard");
		q = q.where('?vcard v:fn "Internal Revenue Service"');
		equals(q.length, 1, "there should be one literal with a specific value");
		teardown();
	});


	test("from implied name node with given-name", function () {
		setup('<span class="vcard"><a class="fn given-name">John</a></span>');

		var blankVC = $.rdf.blank('[]');
		var blankN = $.rdf.blank('[]');

    	var x = $.rdf.triple(blankVC, $.rdf.type, vCardClass);
    	var z = $.rdf.triple(blankN, $.rdf.type, '<' + v + 'Name>');
    	var y = $.rdf.triple(blankN, $.rdf.resource('<'+v+'given-name>'), $.rdf.literal('"John"'));
    	var q = $('#main > span').rdf();
    	q = q.where('?vcard a '+vCardClass);
		equals(q.length, 1, 'there should be one Vcard');
    	q = q.where('?name a v:Name');
		equals(q.length, 1, 'there should be one Name');
		q = q.where('?vcard v:fn "John"');
		equals(q.length, 1, 'there should be one literal with fn and a specific value');

		q = q.where('?name v:given-name "John"');
		equals(q.length, 1, 'there should be one literal with given-name and a specific value');		
		teardown();
	});


/*

testcases: http://microformats.org/tests/hcard/

*/


	test("from url and fn with org: 01-tantek-basic", function () {
		setup('<div class="vcard"><a class="url fn" href="http://tantek.com/">Tantek Çelik</a><div class="org">Technorati</div></div>');

    	var q = $('#main > div').rdf();
    	q = q.where('?vcard a v:Vcard');
		equals(q.length, 1, 'there should be one Vcard');
    	q = q.where('?vcard v:url <http://tantek.com/>');
		equals(q.length, 1, 'there should be one url');
    	q = q.where('?vcard v:fn "Tantek Çelik"');
		equals(q.length, 1, 'there should be one fn');
    	q = q.where('?vcard v:org ?org');
		equals(q.length, 1, 'there should be one org');
    	q = q.where('?org a v:Organization');
		equals(q.length, 1, 'there should be one type v:Organization');		
    	q = q.where('?org v:organization-name "Technorati"');
		equals(q.length, 1, 'there should be one org name');	
    	q = q.databank.triples();
		equals(q.length, 6, 'Six triples all together');
		teardown();
	});


	test("multiple vcards: 02-multiple-class-names-on-vcard", function () {
		setup('<div class="vcard"><span class="fn n"><span class="given-name">Ryan</span> <span class="family-name">King</span></span></div><p><span class="attendee vcard"><span class="fn n"><span class="given-name">Ryan</span> <span class="family-name">King</span></span></span></p><address class="vcard author"><span class="fn n"><span class="given-name">Ryan</span><span class="family-name">King</span></span></address><ul><li class="reviewer vcard first"><span class="fn n"><span class="given-name">Ryan</span><span class="family-name">King</span></span></li></ul>');

    	var q = $('#main > div').rdf();
    	q = q.where('?vcard a v:Vcard');
		equals(q.length, 4, 'there should be four Vcards');
		teardown();
	});

	test("multiple vcards and implied n 03-implied-n", function () {
		setup('<p class="vcard"><span class="fn">Ryan King</span></p><p class="vcard"><abbr class="fn" title="Ryan King">me</abbr></p><p class="vcard"><img src="/me.jpg" title="Brian Suda" alt="Ryan King" class="fn" /></p><p class="vcard"><a class="fn" href="http://suda.co.uk/">Brian Suda</a></p><p class="vcard"><span class="fn">King, Ryan</span></p><p class="vcard"><span class="fn">King, R</span></p><p class="vcard"><span class="fn">King R</span></p><p class="vcard"><span class="fn">King R.</span></p><p class="vcard"><span class="fn">Jesse James Garrett</span></p><p class="vcard"><span class="fn">Thomas Vander Wal</span></p>');

    	var q = $('#main').rdf();
    	q = q.where('?vcard a v:Vcard');
		equals(q.length, 10, 'there should be ten Vcards');
		teardown();
	});


	test("text that should be ignored 04-ignore-unknowns", function () {
		setup('<p class="vcard"><span class="ignore-me">Some text that shouldn\'t be in the vCard.</span><span class="fn n"><span class="given-name">Ryan</span> <span class="family-name">King</span></span></p><p class="ignore-me-too">Some more text that shouldn\'t be in the vCard.</p>');

    	var q = $('#main').rdf();
    	q = q.where('?vcard a v:Vcard');
		equals(q.length, 1, 'there should be one Vcard');
		teardown();
	});



	test("fn should be the text node (with implied-n-optimization) and 'email' should be the href, sans scheme: 05-mailto-1", function () {
	
	setup('<p class="vcard"><a class="fn email" href="mailto:ryan@technorati.com">Ryan King</a></p>');

    	var q = $('#main').rdf();
    	q = q.where('?vcard a v:Vcard');
		equals(q.length, 1, 'there should be one Vcard');
		teardown();
	});

/* more tests to come */


})(jQuery);
