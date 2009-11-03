/*
 * jquery.rules.js unit tests
 */
(function($){

var ns = {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	dc: "http://purl.org/dc/elements/1.1/",
	foaf: "http://xmlns.com/foaf/0.1/",
	cc: "http://creativecommons.org/ns#",
	vcard: "http://www.w3.org/2001/vcard-rdf/3.0#",
	ex: "http://www.example.com/"
}

module("Basic Rule Creation");

test("when creating a rule with strings", function () {
  var rule = $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns });
  equals(rule.lhs.length, 1);
  equals(rule.lhs[0], '?person <' + ns.rdf + 'type> <' + ns.foaf + 'Person>');
  equals(rule.rhs.length, 1);
  equals(rule.rhs[0], '?person <' + ns.rdf + 'type> <' + ns.foaf + 'Agent>');
});

test("when creating a rule with arrays", function () {
  var rule = $.rdf.rule(
      ['?person a vcard:VCard',
       '?person vcard:fn ?name'],
      ['?person a foaf:Person',
       '?person foaf:name ?name'],
      { namespaces: ns }
    );
  equals(rule.lhs.length, 2);
  equals(rule.lhs[0], '?person <' + ns.rdf + 'type> <' + ns.vcard + 'VCard>');
  equals(rule.lhs[1], '?person <' + ns.vcard + 'fn> ?name');
  equals(rule.rhs.length, 2);
  equals(rule.rhs[0], '?person <' + ns.rdf + 'type> <' + ns.foaf + 'Person>');
  equals(rule.rhs[1], '?person <' + ns.foaf + 'name> ?name');
});

test("when creating another rule that contains wildcards in the rhs that don't exist in the left", function () {
  try {
    var rule = $.rdf.rule(
        ['?person a foaf:Person',
         '?person foaf:firstName ?fn'],
        ['?person a vcard:VCard',
         '?person vcard:n ?name',
         '?name a vcard:Name', 
         '?name vcard:given-name ?fn'],
        { namespaces: ns }
      );
    ok(false, "it should generate an error");
  } catch (e) {
    ok(true, "it should generate an error");
  }
});

test("when creating a rule where the rhs contains blank nodes", function () {
  var rule = $.rdf.rule(
      ['?person a foaf:Person',
       '?person foaf:firstName ?fn'],
      ['?person a vcard:VCard',
       '?person vcard:n _:name',
       '_:name a vcard:Name', 
       '_:name vcard:given-name ?fn'],
      { namespaces: ns }
    );
  equals(rule.lhs.length, 2);
  equals(rule.rhs.length, 4);
});

module("Executing individual rules");

test("when executing a simple inheritance-type rule using rule.run()", function () {
  var rule = $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data.add('<#me> a foaf:Person');
  equals(data.size(), 1);
  rule.run(data);
  equals(data.size(), 2);
  equals(data.triples()[0], $.rdf.triple('<#me> a foaf:Person', { namespaces: ns }));
  equals(data.triples()[1], $.rdf.triple('<#me> a foaf:Agent', { namespaces: ns }));
});

test("when executing a more complex mapping rule using rule.run()", function () {
  var rule = $.rdf.rule(
      ['?person a vcard:VCard',
       '?person vcard:fn ?name'],
      ['?person a foaf:Person',
       '?person foaf:name ?name'],
      { namespaces: ns }
    ),
    data = $.rdf.databank().prefix('foaf', ns.foaf).prefix('vcard', ns.vcard),
    query = $.rdf({databank: data});
  data
    .add('<#me> a vcard:VCard')
    .add('<#me> vcard:fn "Jeni Tennison"');
  equals(data.size(), 2);
  rule.run(data);
  equals(data.size(), 4);
  equals(query.where('<#me> a foaf:Person').length, 1);
  equals(query.where('<#me> foaf:name "Jeni Tennison"').length, 1);
});

test("when executing a rule where one of the conditions is a regular expression", function () {
  var name,
    rule = $.rdf.rule(['?person foaf:name ?name', ['name', /^J.+/]], 
      function () { name = this.name }, 
      { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data.add('<#me> foaf:name "Jeni"');
  rule.run(data);
  equals(name.value, 'Jeni');
});

test("when executing a rule where one of the conditions is a function", function () {
  var hits = 0, name,
    rule = $.rdf.rule(['?person foaf:name ?name', function () { return this.name.value.length === 4}], 
      function () { hits += 1; name = this.name; }, 
      { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data.add('<#me> foaf:name "Jeni"')
    .add('<#you> foaf:name "Someone"');
  rule.run(data);
  equals(hits, 1);
  equals(name.value, 'Jeni');
});

test("when executing a rule where one of the conditions is a function on a resource", function () {
  var hits = 0, person = $.rdf.resource('<#me>'),
    rule = $.rdf.rule(['?person foaf:name ?name', function () { return this.person === person; }], 
      function () { hits += 1; }, 
      { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data.add('<#me> foaf:name "Jeni"')
    .add('<#you> foaf:name "Someone"');
  rule.run(data);
  equals(hits, 1);
});

test("when executing a rule where one of the conditions is a function comparing two resources", function () {
  var hits = 0, person = $.rdf.resource('<#me>'),
    rule = $.rdf.rule(['?vintage ex:hasVintageYear ?vintageYear1', '?vintage ex:hasVintageYear ?vintageYear2', function () { return this.vintageYear1.type === 'uri' && this.vintageYear2.type === 'uri'; }], 
      function () { hits += 1; }, 
      { namespaces: ns }),
    data = $.rdf.databank();
  data.prefix('ex', ns.ex)
    .add('ex:SomeVintage ex:hasVintageYear ex:2007')
    .add('ex:SomeVintage ex:hasVintageYear ex:TwoThousandSeven');
  rule.run(data);
  equals(hits, 3);
});



test("when executing a rule where the rhs contains blank nodes", function () {
  var rule = $.rdf.rule(
      ['?person a foaf:Person',
       '?person foaf:firstName ?fn'],
      ['?person a vcard:VCard',
       '?person vcard:n _:name',
       '_:name a vcard:Name', 
       '_:name vcard:given-name ?fn'],
      { namespaces: ns }
    ),
    data = $.rdf.databank().prefix('foaf', ns.foaf).prefix('vcard', ns.vcard),
    query = $.rdf({databank: data});
  ok(rule.rhsBlanks, "the rule should be recognised as containing blank nodes");
  data
    .add('<#me> a foaf:Person')
    .add('<#me> foaf:firstName "Jeni"')
    .add('<#fred> a foaf:Person')
    .add('<#fred> foaf:firstName "Fred"');
  equals(data.size(), 4);
  rule.run(data);
  equals(data.size(), 12);
  equals(query.where('<#me> a vcard:VCard').length, 1);
  equals(query.where('<#me> vcard:n ?name').where('?name a vcard:Name').length, 1);
  equals(query.where('<#me> vcard:n ?name').where('?name vcard:given-name "Jeni"').length, 1);
  equals(query.where('<#fred> vcard:n ?name').where('?name a vcard:Name').length, 1);
  equals(query.where('<#fred> vcard:n ?name').where('?name vcard:given-name "Fred"').length, 1);
  equals(query.where('<#me> vcard:n ?name').where('<#fred> vcard:n ?name').length, 0, "my name and fred's name shouldn't be the same node");
});

test("when executing a rule where the rhs is a function", function () {
  var called = false,
    rule = $.rdf.rule('?person a foaf:Person', function () { called = true; }, { namespaces: ns }),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(data.size(), 1);
  rule.run(data);
  equals(data.size(), 1);
  ok(called, "the function on the rhs should be called");
});

test("when executing a rule where the rhs is a function executed a number of times", function () {
  var called = 0,
    rule = $.rdf.rule('?person a foaf:Person', function () { called += 1; }, { namespaces: ns }),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person')
      .add('<#you> a foaf:Person');
  rule.run(data);
  equals(called, 2, "the function on the rhs should be called twice");
});

test("when executing a rule where the rhs is a function with arguments", function () {
  var person, i, triple,
    rule = $.rdf.rule('?person a foaf:Person', 
      function (j, bindings, triples) { 
        person = this.person;
        i = j;
        triple = triples[0];
      }, 
      { namespaces: ns }),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(data.size(), 1);
  rule.run(data);
  equals(person, $.rdf.resource('<#me>'));
  equals(i, 0);
  equals(triple, $.rdf.triple('<#me> a foaf:Person', { namespaces: ns }));
});

test("when executing a rule that could lead to an infinite recursion", function () {
  var rule = $.rdf.rule('?person a foaf:Person',
                        ['?person ex:mother _:mother', '_:mother a foaf:Person'],
                        { namespaces: ns }),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(data.size(), 1);
  rule.run(data);
  equals(data.size(), 101);
})

module("Rulesets");

test("when creating an empty ruleset", function () {
  var ruleset = $.rdf.ruleset();
  equals(ruleset.size(), 0);
  equals(ruleset.base(), $.uri.base());
});

test("when adding rules to a ruleset", function () {
  var ruleset = $.rdf.ruleset();
  ruleset.add($.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns }));
  equals(ruleset.size(), 1);
});

test("when adding the same rule to a ruleset twice", function () {
  var ruleset = $.rdf.ruleset();
  var rule = $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns });
  ruleset.add(rule).add(rule);
  equals(ruleset.size(), 1);
});

test("when adding something that isn't a rule object to a ruleset", function () {
  var ruleset = 
    $.rdf.ruleset()
      .prefix('foaf', ns.foaf)
      .add('?person a foaf:Person', '?person a foaf:Agent'),
    data = $.rdf.databank().prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(ruleset.size(), 1);
  equals(data.size(), 1);
  data.reason(ruleset);
  equals(data.size(), 2);
});

test("when creating a ruleset with some rules ready-added", function () {
  var ruleset = 
    $.rdf.ruleset([
        ['?person a foaf:Person', '?person a foaf:Agent']
      ],
      { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(ruleset.size(), 1);
  equals(data.size(), 1);
  data.reason(ruleset);
  equals(data.size(), 2);
});

test("when running rules where the result of one rule makes the other's conditions satisfied", function () {
  var ruleset = 
    $.rdf.ruleset()
      .prefix('foaf', ns.foaf)
      .prefix('rdf', ns.rdf)
      .add(['?person a foaf:Agent', '?person foaf:name ?name'], '?person rdf:label ?name')
      .add('?person a foaf:Person', '?person a foaf:Agent'),
    data = $.rdf.databank().prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person')
      .add('<#me> foaf:name "Jeni"');
  equals(ruleset.size(), 2);
  equals(data.size(), 2);
  data.reason(ruleset);
  equals(data.size(), 4);
});

test("when running rules which could result in an infinite loop", function () {
  var ruleset = 
    $.rdf.ruleset()
      .prefix('foaf', ns.foaf)
      .prefix('rdf', ns.rdf)
      .prefix('ex', ns.ex)
      .add('?person a foaf:Person', '?person ex:mother _:mother')
      .add('?person ex:mother ?mother', '?mother a foaf:Person'),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(ruleset.size(), 2);
  equals(data.size(), 1);
  data.reason(ruleset);
  ok(true, 'it should not cause infinite recursion');
  equals(data.size(), 101);
});

test("when providing a recursion limit", function () {
  var ruleset = 
    $.rdf.ruleset()
      .prefix('foaf', ns.foaf)
      .prefix('rdf', ns.rdf)
      .prefix('ex', ns.ex)
      .add('?person a foaf:Person', '?person ex:mother _:mother')
      .add('?person ex:mother ?mother', '?mother a foaf:Person'),
    data = $.rdf.databank()
      .prefix('foaf', ns.foaf)
      .add('<#me> a foaf:Person');
  equals(ruleset.size(), 2);
  equals(data.size(), 1);
  data.reason(ruleset, { limit: 20 });
  equals(data.size(), 41);
});

module("Extensions to $.rdf.databank");

test("when executing a simple inheritance-type rule using data.reason()", function () {
  var rule = $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns }),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data.add('<#me> a foaf:Person');
  equals(data.size(), 1);
  data.reason(rule);
  equals(data.size(), 2);
  equals(data.triples()[0], $.rdf.triple('<#me> a foaf:Person', { namespaces: ns }));
  equals(data.triples()[1], $.rdf.triple('<#me> a foaf:Agent', { namespaces: ns }));
});

test("when executing a ruleset using data.reason()", function () {
  var rule = $.rdf.rule('?person a foaf:Person', '?person a foaf:Agent', { namespaces: ns }),
    ruleset = $.rdf.ruleset().add(rule),
    data = $.rdf.databank().prefix('foaf', ns.foaf);
  data
    .add('<#me> a foaf:Person')
    .add('<#you> a foaf:Person');
  equals(data.size(), 2);
  data.reason(ruleset);
  equals(data.size(), 4);
  equals(data.triples()[0], $.rdf.triple('<#me> a foaf:Person', { namespaces: ns }));
  equals(data.triples()[1], $.rdf.triple('<#you> a foaf:Person', { namespaces: ns }));
  equals(data.triples()[2], $.rdf.triple('<#me> a foaf:Agent', { namespaces: ns }));
  equals(data.triples()[3], $.rdf.triple('<#you> a foaf:Agent', { namespaces: ns }));
});

module("RDFS rules");

test("when running RDFS rules on a single statement", function () {
  var data = $.rdf.databank()
    .prefix('foaf', ns.foaf)
    .prefix('rdfs', ns.rdfs)
    .add('<#me> foaf:surname "Tennison" .')
    .add('foaf:surname rdfs:domain foaf:Person .')
    .add('foaf:Person rdfs:subClassOf foaf:Agent .');
  equals(data.size(), 3);
  data.reason($.rdf.ruleset.rdfs);
  equals(data.size(), 13);
  console.log(data.dump({format: 'text/turtle', indent: true }))
});

})(jQuery);