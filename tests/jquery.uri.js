/*
 * jquery.rdfa.js unit tests
 */
(function($){

module("URI parsing");

test("identical URIs should give identical objects", function() {
	var uri1 = $.uri('http://www.example.org/foo');
	var uri2 = $.uri('http://www.example.org/foo');
	ok(uri1 === uri1, "a uri is equal to itself");
	ok(uri1 === uri2, "a uri is equal to the same uri");
});

test("resolving a URI should give identical objects", function() {
	var uri1 = $.uri('http://www.example.org/foo');
	var uri2 = $.uri.resolve('../foo', 'http://www.example.org/bar');
	ok(uri1 === uri2, "a uri is equal to the same uri");
});

test("foo URI with all parts", function() {
	var result = $.uri('foo://example.com:8042/over/there?name=ferret#nose');
	equals(result.scheme, 'foo');
	equals(result.authority, 'example.com:8042');
	equals(result.path, '/over/there');
	equals(result.query, 'name=ferret');
	equals(result.fragment, 'nose');
});

test("foo URI without a fragment", function() {
	var result = $.uri('foo://example.com:8042/over/there?name=ferret');
	equals(result.scheme, 'foo');
	equals(result.authority, 'example.com:8042');
	equals(result.path, '/over/there');
	equals(result.query, 'name=ferret');
	equals(result.fragment, undefined);
});

test("foo URI without a query", function() {
	var result = $.uri('foo://example.com:8042/over/there#nose');
	equals(result.scheme, 'foo');
	equals(result.authority, 'example.com:8042');
	equals(result.path, '/over/there');
	equals(result.query, undefined);
	equals(result.fragment, 'nose');
});

test("foo URI without a path", function() {
	var result = $.uri('foo://example.com:8042?name=ferret#nose');
	equals(result.scheme, 'foo');
	equals(result.authority, 'example.com:8042');
	equals(result.path, '');
	equals(result.query, 'name=ferret');
	equals(result.fragment, 'nose');
});

test("foo URI without an authority", function() {
	var result = $.uri('foo:/over/there?name=ferret#nose');
	equals(result.scheme, 'foo');
	equals(result.authority, undefined);
	equals(result.path, '/over/there');
	equals(result.query, 'name=ferret');
	equals(result.fragment, 'nose');
});

/*
test("URI without a scheme", function() {
	try {
		$.uri.parse('/over/there?name=ferret#nose');
		ok(false, "parse should fail with an error")
	} catch (e) {
		equals(e.name, 'MalformedURI');
		equals(e.message, 'Bad scheme in "/over/there?name=ferret#nose"')
	}
});
*/

test("URI with a capitalised scheme", function() {
	var result = $.uri('FOO:/over/there?name=ferret#nose');
	equals(result.scheme, 'foo');
});

test("URI without an authority", function() {
	var result = $.uri('urn:example:animal:ferret:nose');
	equals(result.scheme, 'urn');
	equals(result.authority, undefined);
	equals(result.path, 'example:animal:ferret:nose');
	equals(result.query, undefined);
	equals(result.fragment, undefined);
});

module("URI Building");

test("A URI with all parts", function() {
	var u = 'foo://example.com:8042/over/there?name=ferret#nose';
	equals($.uri(u), u);
});

module("URI Reference Resolution Examples: Normal Examples");

var base = $.uri('http://a/b/c/d;p?q');

test("g:h", function() {
	equals(base.resolve('g:h'), 'g:h');
});

test("g", function() {
	equals(base.resolve('g'), 'http://a/b/c/g');
});

test("./g", function() {
	equals(base.resolve('./g'), 'http://a/b/c/g');
});

test("g/", function() {
	equals(base.resolve('g/'), 'http://a/b/c/g/');
});

test("/g", function() {
	equals(base.resolve('/g'), 'http://a/g');
});

test("//g", function() {
	equals(base.resolve('//g'), 'http://g');
});

test("?y", function() {
	equals(base.resolve('?y'), 'http://a/b/c/d;p?y');
});

test("g?y", function() {
	equals(base.resolve('g?y'), 'http://a/b/c/g?y');
});

test("#s", function() {
	equals(base.resolve('#s'), 'http://a/b/c/d;p?q#s');
});

test("g#s", function() {
	equals(base.resolve('g#s'), 'http://a/b/c/g#s');
});

test("g?y#s", function() {
	equals(base.resolve('g?y#s'), 'http://a/b/c/g?y#s');
});

test(";x", function() {
	equals(base.resolve(';x'), 'http://a/b/c/;x');
});

test("g;x", function() {
	equals(base.resolve('g;x'), 'http://a/b/c/g;x');
});

test("g;x?y#s", function() {
	equals(base.resolve('g;x?y#s'), 'http://a/b/c/g;x?y#s');
});

test("empty relative URI", function() {
	equals(base.resolve(''), 'http://a/b/c/d;p?q');
});

test(".", function() {
	equals(base.resolve('.'), 'http://a/b/c/');
});

test("./", function() {
	equals(base.resolve('./'), 'http://a/b/c/');
});

test("..", function() {
	equals(base.resolve('..'), 'http://a/b/');
});

test("../", function() {
	equals(base.resolve('../'), 'http://a/b/');
});

test("../g", function() {
	equals(base.resolve('../g'), 'http://a/b/g');
});

test("../..", function() {
	equals(base.resolve('../..'), 'http://a/');
});

test("../../", function() {
	equals(base.resolve('../../'), 'http://a/');
});

test("../../g", function() {
	equals(base.resolve('../../g'), 'http://a/g');
});

module("URI Reference Resolution Examples: Abnormal Examples");

test("../../../g", function() {
	equals(base.resolve('../../../g'), 'http://a/g');
});

test("../../../../g", function() {
	equals(base.resolve('../../../../g'), 'http://a/g');
});

test("/./g", function() {
	equals(base.resolve('/./g'), 'http://a/g');
});

test("/../g", function() {
	equals(base.resolve('/../g'), 'http://a/g');
});

test("g.", function() {
	equals(base.resolve('g.'), 'http://a/b/c/g.');
});

test(".g", function() {
	equals(base.resolve('.g'), 'http://a/b/c/.g');
});

test("g..", function() {
	equals(base.resolve('g..'), 'http://a/b/c/g..');
});

test("..g", function() {
	equals(base.resolve('..g'), 'http://a/b/c/..g');
});

test("./../g", function() {
	equals(base.resolve('./../g'), 'http://a/b/g');
});

test("./g/.", function() {
	equals(base.resolve('./g/.'), 'http://a/b/c/g/');
});

test("g/./h", function() {
	equals(base.resolve('g/./h'), 'http://a/b/c/g/h');
});

test("g/../h", function() {
	equals(base.resolve('g/../h'), 'http://a/b/c/h');
});

test("g;x=1/./y", function() {
	equals(base.resolve('g;x=1/./y'), 'http://a/b/c/g;x=1/y');
});

test("g;x=1/../y", function() {
	equals(base.resolve('g;x=1/../y'), 'http://a/b/c/y');
});

test("g?y/./x", function() {
	equals(base.resolve('g?y/./x'), 'http://a/b/c/g?y/./x');
});

test("g?y/../x", function() {
	equals(base.resolve('g?y/../x'), 'http://a/b/c/g?y/../x');
});

test("g#s/./x", function() {
	equals(base.resolve('g#s/./x'), 'http://a/b/c/g#s/./x');
});

test("g#s/../x", function() {
	equals(base.resolve('g#s/../x'), 'http://a/b/c/g#s/../x');
});

module("Additional tests");

test("resolving a URN against a URI", function() {
	equals(base.resolve('urn:isbn:0140449132'), 'urn:isbn:0140449132');
});

test("resolving a URI whose base is not absolute", function() {
	try {
		var u = $.uri.resolve('foo', 'bar');
		ok(false, 'should raise an error: ' + u);
	} catch (e) {
		equals(e.name, 'MalformedURI');
	}
});

test("resolving an absolute URI with no base provided", function() {
	try {
		var u = $.uri.resolve('http://www.example.org/foo');
		ok(true, "should not throw an error");
	} catch (e) {
		ok(false, "should not throw an error");
	}
});

test("URI without a scheme", function() {
	var result = $.uri('/foo');
	equals(result, $.uri.base().resolve('/foo'));
});

module("Base URI");

test("with no base specified", function() {
	equals($.uri.base(), document.URL);
});

test("with a base specified", function() {
	$('head').append('<base href="http://www.example.org/foo" />');
	equals($.uri.base(), 'http://www.example.org/foo');
	$('head > base').remove();
});

module("Creating relative URIs");

var base = $.uri('http://a/b/c/d;p?q');

test("g:h", function() {
	equals(base.relative('g:h'), 'g:h');
});

test("http://a/b/c/g", function() {
	equals(base.relative('http://a/b/c/g'), 'g');
});

test("http://a/b/c/g/", function() {
	equals(base.relative('http://a/b/c/g/'), 'g/');
});

test("http://a/g", function() {
	equals(base.relative('http://a/g'), '/g');
});

test("http://g", function() {
	equals(base.relative('http://g'), 'http://g');
});

test("http://a/b/c/d;p?y", function() {
	equals(base.relative('http://a/b/c/d;p?y'), '?y');
});

test("http://a/b/c/g?y", function() {
	equals(base.relative('http://a/b/c/g?y'), 'g?y');
});

test("http://a/b/c/d;p?q#s", function() {
	equals(base.relative('http://a/b/c/d;p?q#s'), '#s');
});

test("http://a/b/c/g#s", function() {
	equals(base.relative('http://a/b/c/g#s'), 'g#s');
});

test("http://a/b/c/g?y#s", function() {
	equals(base.relative('http://a/b/c/g?y#s'), 'g?y#s');
});

test("http://a/b/c/;x", function() {
	equals(base.relative('http://a/b/c/;x'), ';x');
});

test("http://a/b/c/g;x", function() {
	equals(base.relative('http://a/b/c/g;x'), 'g;x');
});

test("http://a/b/c/g;x?y#s", function() {
	equals(base.relative('http://a/b/c/g;x?y#s'), 'g;x?y#s');
});

test("http://a/b/c/d;p?q", function() {
	equals(base.relative('http://a/b/c/d;p?q'), '');
});

test("http://a/b/", function() {
	equals(base.relative('http://a/b/'), '../');
});

test("http://a/b/g", function() {
	equals(base.relative('http://a/b/g'), '../g');
});

test("http://a/", function() {
	equals(base.relative('http://a/'), '/');
});

test("http://a/g", function() {
	equals(base.relative('http://a/g'), '/g');
});

})(jQuery);