/*
 * jquery.microdata.js unit tests
 */
(function($){



function setup(microdata) {
	$('#main').html(microdata);
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



module("Parsing Tests");

test("Simple parsing test!", function () {
var main = $('<div itemscope>' +
 '  <p itemprop="a">1</p>' +
 '  <p itemprop="a">2</p>' +
 '  <p itemprop="a">2</p>' +
 '  <p itemprop="b">test</p>' +
 '</div>');
  var rdf = main.microdata();
  equals(rdf.databank.size(), 4);
});

test("Complex parsing test, based on http://schema.org", function () {
  var main = $('<div itemscope itemtype="http://schema.org/Person">' + 
  '<span itemprop="name">Jane Doe</span>' + 
  '<img src="http://www.example.com/janedoe.jpg" itemprop="image" />' + 
  '<span itemprop="jobTitle">Professor</span>' + 
  '<span>This here is a dummy that should <b>not</b> get processed!</span>' +
  '<span>This here is a <span itemprop="name">dummy</span> that should get processed!</span>' +
  '<div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">' + 
  '  <span itemprop="streetAddress">' + 
  '    20341 Whitworth Institute' + 
  '    405 N. Whitworth' + 
  '  </span>' + 
  '  <span itemprop="addressLocality">Seattle</span>,' + 
  '  <span itemprop="addressRegion">WA</span>' + 
  '  <span itemprop="postalCode">98052</span>' + 
  '</div>' + 
  '<span itemprop="telephone">(425) 123-4567</span>' + 
  '<a href="mailto:jane-doe@xyz.edu" itemprop="email">' + 
  '  jane-doe@xyz.edu</a>' + 
  'Jane\'s home page:' + 
  '<a href="www.janedoe.com" itemprop="url">janedoe.com</a>' + 
  'Graduate students:' + 
  '<a href="www.xyz.edu/students/alicejones.html" itemprop="colleagues">' + 
  '  Alice Jones</a>' + 
  '<a href="www.xyz.edu/students/bobsmith.html" itemprop="colleagues">' + 
  '  Bob Smith</a>' + 
  '</div>');
  var rdf = main.microdata();
  equals(rdf.databank.size(), 16);
});

test("Most-Complex parsing test", function () {
  var main = $('<div itemscope itemtype="http://example.org/Thing">' + 
  '<span itemprop="name">Jane Doe</span>' + 
  '<span itemprop="name">Jane Doe2</span>' + 
  '<a href="http://example2.org/sample.html" itemprop="link">Jane Doe</a>' + 
  '<img src="http://www.example.com/janedoe.jpg" itemprop="image" />' + 
  '<div itemprop="something" itemscope itemtype="http://example.org/Thing2" itemid="http://example.org/#test">' +
  '<figure itemprop="work" itemscope itemtype="http://n.whatwg.org/work" itemref="licenses">' +
  ' <img itemprop="work" src="images/mailbox.jpeg" alt="Outside the house is a mailbox. It has a leaflet inside.">' +
  ' <figcaption itemprop="title">The mailbox.</figcaption>' +
  '</figure>' +
  '</div>' +
  '<p id="licenses">All images licensed under the ' +
  '<a itemprop="license" href="http://www.opensource.org/licenses/mit-license.php">MIT license</a>' +
  '.</p>' +
  '</div>');
  var rdf = main.microdata();
  equals(rdf.databank.size(), 12);
});

module("Performance Tests");

test("multiple elements with about and property attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<div itemscope itemtype="http://schema.org/Person">'+
				'<p itemid="bPerson' + i + '" itemprop="name">Person ' + i + '</p></div>');
  }
  var t1 = new Date();
  main.microdata();//????
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
  $('#main').removeData('microdata.triples');//????????????
});

test("multiple elements with about, rel and resource attributes", function () {
  var i, main = $('#main');
  for (i = 0; i < 100; i += 1) {
    main.append('<div itemscope itemtype="http://schema.org/ImageObject">'+
					'<p itemid="photo' + i + '.jpg" </p>'+
					'<div itemprop="about" itemscope itemtype="http://schema.org/Person" '+
					'itemref="aPerson' + i + '">Paragraph ' + i + '</div>'+
				'</div>');
  }
  var t1 = new Date();
  main.microdata();//?????
  var t2 = new Date();
  var d = t2 - t1;
  ok(d < 1000, "it should parse in less than a second: " + d);
  $('#main > *').remove();
  $('#main').removeData('micordata.triples');//????????
});

module("RDF Gleaner");

test("Test 0001", function() {
	setup('<div itemscope itemtype="http://schema.org/ImageObject" itemref="photo1.jpg">'+
			'<p>This photo was taken by '+
			'<div  itemprop="author"  itemscope itemtype="http://schema.org/Person" itemprop="name">Mark Birbeck.</p></div>'+
		'</div>');
	testTriples($('#main > p > span').rdf(), 
	            [$.rdf.triple('<photo1.jpg> dc:creator "Mark Birbeck" .', ns)]);//??????
	$('#main > p').remove();
});


test("With a callback", function() {
	setup('<div itemscope itemtype="http://schema.org/ImageObject">'+
			'<p>This photo was taken by <a about="photo1.jpg" rel="dc:creator" rev="foaf:img" href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.</p></div>');
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

})(jQuery);