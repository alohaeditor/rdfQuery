/*
 * jquery.microdata.js unit tests
 */
(function($){

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


})(jQuery);