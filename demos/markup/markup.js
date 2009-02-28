$(document).ready(function(){
  var 
    ns = {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      dc: "http://purl.org/dc/elements/1.1/",
      foaf: "http://xmlns.com/foaf/0.1/",
      vcard: "http://www.w3.org/2006/vcard/ns#",
      biografr: "http://biografr.com/ontology#"
    },
    
    ontology = {
      '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>': {
        type: 'relation',
        aliases: ['a', 'kind of']
      },
      '<http://www.w3.org/2000/01/rdf-schema#label>': {
        type: 'property',
        aliases: ['aka', 'also known as']
      },
      '<http://xmlns.com/foaf/0.1/Person>': {
        type: 'class',
        aliases: ['person']
      },
      '<http://xmlns.com/foaf/0.1/firstName>': {
        type: 'property',
        aliases: ['first name', 'forename']
      },
      '<http://xmlns.com/foaf/0.1/givenname>': {
        type: 'property',
        aliases: ['middle name']
      },
      '<http://xmlns.com/foaf/0.1/surname>': {
        type: 'property',
        aliases: ['surname', 'last name']
      },
      '<http://www.w3.org/2006/vcard/ns#Address>': {
        type: 'class',
        aliases: ['place', 'address']
      },
      '<http://www.w3.org/2006/vcard/ns#street-address>': {
        type: 'property',
        aliases: ['house', 'street']
      },
      '<http://www.w3.org/2006/vcard/ns#locality>': {
        type: 'property',
        aliases: ['town', 'city']
      },
      '<http://www.w3.org/2006/vcard/ns#region>': {
        type: 'property',
        aliases: ['county', 'area']
      },
      '<http://www.w3.org/2006/vcard/ns#country>': {
        type: 'property',
        aliases: ['country']
      },
      '<http://biografr.com/ontology#hasBirthPlace>': {
        type: 'relation',
        range: '<http://www.w3.org/2006/vcard/ns#Address>',
        aliases: ['born in', 'birth place', 'born']
      },
      '<http://biografr.com/ontology#bornOn>': {
        type: 'property',
        range: '<http://www.w3.org/2001/XMLSchema#date>',
        aliases: ['birth date', 'date of birth', 'born on', 'born']
      },
      '<http://biografr.com/ontology#gender>': {
        type: 'property',
        aliases: ['gender', 'sex']
      },
      '<http://biografr.com/ontology#hasGrandparent>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['grandparent']
      },
      '<http://biografr.com/ontology#hasGrandmother>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['grandmother', 'grandma', 'nan', 'granny']
      },
      '<http://biografr.com/ontology#hasGrandfather>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['grandfather', 'grandpa']
      },
      '<http://biografr.com/ontology#hasGrandchild>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['grandchild']
      },
      '<http://biografr.com/ontology#hasGrandson>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['grandson']
      },
      '<http://biografr.com/ontology#hasGranddaughter>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['granddaughter']
      },
      '<http://biografr.com/ontology#hasParent>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['parent']
      },
      '<http://biografr.com/ontology#hasFather>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['father', 'dad']
      },
      '<http://biografr.com/ontology#hasMother>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['mother', 'mum']
      },
      '<http://biografr.com/ontology#hasChild>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['child']
      },
      '<http://biografr.com/ontology#hasSon>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['son']
      },
      '<http://biografr.com/ontology#hasDaughter>': {
        type: 'relation',
        range: '<http://xmlns.com/foaf/0.1/Person>',
        aliases: ['daughter']
      },
    },
    
    rules = [{
      where: ['?child biografr:hasFather ?father'],
      then: ['?child a foaf:Person',
             '?father a foaf:Person',
             '?child biografr:hasParent ?father', 
             '?father biografr:hasChild ?child',
             '?father biografr:gender "male"']
    }, {
      where: ['?child biografr:hasMother ?mother'],
      then: ['?child a foaf:Person',
             '?mother a foaf:Person',
             '?child biografr:hasParent ?mother',
             '?mother biografr:hasChild ?child',
             '?mother biografr:gender "female"']
    }, {
      where: ['?gchild biografr:hasParent ?parent',
              '?parent biografr:hasParent ?gparent'],
      then: ['?gchild a foaf:Person',
             '?gparent a foaf:Person',
             '?gchild biografr:hasGrandparent ?gparent',
             '?gparent biografr:hasGrandchild ?gchild']
    }, {
      where: ['?parent biografr:hasChild ?child',
              '?child biografr:gender "male"'],
      then: ['?parent a foaf:Person',
             '?child a foaf:Person',
             '?parent biografr:hasSon ?child']
    }, {
      where: ['?parent biografr:hasChild ?child',
              '?child biografr:gender "female"'],
      then: ['?parent a foaf:Person',
             '?child a foaf:Person',
             '?parent biografr:hasDaughter ?child']
    }, {
      where: ['?parent biografr:hasSon ?child'],
      then: ['?parent a foaf:Person',
             '?child a foaf:Person',
             '?parent biografr:hasChild ?child',
             '?child biografr:gender "male"']
    }, {
      where: ['?parent biografr:hasDaughter ?child'],
      then: ['?parent a foaf:Person',
             '?child a foaf:Person',
             '?parent biografr:hasChild ?child',
             '?child biografr:gender "female"']
    }, {
      where: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "male"'],
      then: ['?gparent a foaf:Person',
             '?gchild a foaf:Person',
             '?gparent biografr:hasGrandson ?gchild']
    }, {
      where: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "female"'],
      then: ['?gparent a foaf:Person',
             '?gchild a foaf:Person',
             '?gparent biografr:hasGranddaughter ?gchild']
    }, {
      where: ['?gparent biografr:hasGrandson ?gchild'],
      then: ['?gparent a foaf:Person',
             '?gchild a foaf:Person',
             '?gparent biografr:hasGrandchild ?gchild',
             '?gchild biografr:gender "male"']
    }, {
      where: ['?gparent biografr:hasGranddaughter ?gchild'],
      then: ['?gparent a foaf:Person',
             '?gchild a foaf:Person',
             '?gparent biografr:hasGrandchild ?gchild',
             '?gchild biografr:gender "female"']
    }, {
     where: ['?gchild biografr:hasGrandparent ?gparent',
             '?gparent biografr:gender "male"'],
     then: ['?gparent a foaf:Person',
            '?gchild a foaf:Person',
            '?gchild biografr:hasGrandfather ?gparent']
    }, {
     where: ['?gchild biografr:hasGrandparent ?gparent',
             '?gparent biografr:gender "female"'],
     then: ['?gparent a foaf:Person',
            '?gchild a foaf:Person',
            '?gchild biografr:hasGrandmother ?gparent']
    }, {
     where: ['?gchild biografr:hasGrandfather ?gparent'],
     then: ['?gparent a foaf:Person',
            '?gchild a foaf:Person',
            '?gchild biografr:hasGrandparent ?gparent',
            '?gparent biografr:gender "male"']
    }, {
     where: ['?gchild biografr:hasGrandmother ?gparent'],
     then: ['?gparent a foaf:Person',
            '?gchild a foaf:Person',
            '?gchild biografr:hasGrandparent ?gparent',
            '?gparent biografr:gender "female"']
    }],
  
    /* S is a O */
    isAregex = /^\s*(.*\S)(?:'s|\s+(?:was|is|are|were))\s+an?\s+(\S.*\S)\.?\s*$/,
    /* S is P in O */
    subjPropObjRegex1 = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(?:(?:the|a)\s+)?(\S.*\s+(?:on|in|of|at|as|to|from|for))\s+(\S.*\S)\.?\s*$/,
    /* S's P is O */
    subjPropObjRegex2 = /^\s*(.*\S)'s\s+(\S.*\S)\s+(?:is|was|are|were)\s+(\S.*\S)\.?\s*$/,
    /* O is S's P */
    objSubjPropRegex = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(\S.*\S)'s\s+(\S.*\S)\.?\s*$/,
    
    /* Where was S's P */
    isAQueryRegex = /^\s*What\s+(?:was|is|are|were)\s+(\S(?:[^']|'[^s])*\S)\?$/,
    /* Who were S's Ps */
    queryRegex1 = /^\s*(?:Who|Where|What|When|Which)\s+(?:was|is|are|were)\s+(\S.*\S)'s\s+(?:(\S.*\S)s|(\S.*\S))\?$/,
    /* Which P was S in? */
    queryRegex2 = /^\s*(?:Who|Where|What|When|Which)\s+(\S.*\S)\s+(?:was|is|are|were)\s+(\S.*\S)\s+(?:on|in|of|at|as|to|from|for)\?$/,
  
    aliases = {},
    properties = [];
    // spans = {};
  
    makeID = function (label) {
      var matches = label.match(/[a-z][a-z0-9]*/ig);
      return matches.join('');
    },
  
    locateTextInNode = function (node, text) {
      var i = 0, 
        location = null, 
        children = node.contents(),
        offset = -1;
      if (children.length > 0) {
        while (location === null && i < children.length) {
          location = locateTextInNode($(children[i]), text);
          i += 1;
        }
        return location;
      } else {
        if (node[0].nodeValue !== null) {
          offset = node[0].nodeValue.indexOf(text);
        }
        return offset === -1 ? null : { node: node, offset: offset };
      }
    },
    
    markupText = function (text) {
      var location = null, range, selection, span;
      span = this
        .children('span')
        .filter(function () {
          return $(this).text() === text;
        })
        .get(0);
      if (span === undefined) {
        if (window.getSelection) {
          location = locateTextInNode(this, text);
          if (location !== null) {
            range = document.createRange();
            range.setStart(location.node[0], location.offset);
            range.setEnd(location.node[0], location.offset + text.length);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else if (document.selection) {
          range = document.body.createTextRange();
          range.moveToElementText(this[0]);
          range.findText(text);
          range.select();
        }
        if (range !== undefined) {
          if (range.surroundContents) {
            span = document.createElement('span');
            range.surroundContents(span);
          } else {
            range.pasteHTML('<span id="tempSpan">' + text + '</span>');
            span = $('#tempSpan');
            span.id = undefined;
          }
        }
      }
      if (span === undefined) {
        return (this.is('#content')) ? undefined : markupText.call($('#content'), text);
      } else {
        span = $(span);
        if (span.parent().attr('property') !== undefined) {
          span.parent()
            .attr('datatype', '');
        }
        return span;
      }
    },
    
    reason = function (rdf) {
      var nTriples;
      rdf = rdf || $('#content').rdf();
      nTriples = rdf.databank.size();
      $.each(rules, function (i, rule) {
        var j = 0,
          conditions = rule.where,
          consequents = rule.then;
        rdf = rdf.reset();
        do {
          rdf = rdf.where(conditions[j]);
          j += 1;
        } while (j < conditions.length && rdf.length > 0)
        if (rdf.length > 0) {
          j = 0;
          while (j < consequents.length) {
            rdf = rdf.add(consequents[j]);
            j += 1;
          }
        }
      });
      rdf = rdf.reset();
      if (rdf.databank.size() > nTriples) {
        return reason(rdf);
      } else {
        return rdf;
      }
    },
    
    resourceLabel = function (resource, rdf) {
      rdf = rdf || $('#content').rdf();
      rdf = rdf
        .prefix('rdfs', ns.rdfs)
        .where(resource + ' rdfs:label ?label');
      if (rdf.length > 0) {
        return rdf.get(0).label.value;
      } else {
        return resource.value.fragment;
      }
    },
    
    labelTriple = function (label) {
      var id, resource;
      resource = aliases[label];
      if (resource === undefined) {
        id = makeID(label);
        resource = $.rdf.resource('<#' + id + '>');
      }
      return $.rdf.triple(resource, $.rdf.label, $.rdf.literal('"' + label + '"'));
    },
    
    englishProperty = function (prop) {
      return ontology[prop].aliases[0];
    },
    
    englishObject = function (object) {
      if (object.type === 'uri') {
        if (ontology[object]) {
          return ontology[object].aliases[0];
        } else {
          return resourceLabel(object);
        }
      } else if (object.type === 'bnode') {
        return resourceLabel(object);
      } else {
        return object.value;
      }
    },
    
    statement = {
      field: $('#statement'),
      val: function() {
        return this.field.val();
      },
    
      isQuery: function () {
        return /\?$/.test(this.val());
      },
    
      valid: function() {
        var matches, subj, prop, sResource, pResource, rdf, labels, query;
        if (isAregex.test(this.val())) {
          return true;
        }
        if (this.isQuery()) {
          rdf = $('#content').rdf().prefix('rdfs', ns.rdfs);
          labels = rdf.where('?thing rdfs:label ?label');
          if (isAQueryRegex.test(this.val())) {
            matches = this.val().match(isAQueryRegex);
            subj = matches[1];
            query = labels.filter('label', subj);
            return query.length > 0;
          } else {
            if (queryRegex1.test(this.val())) {
              matches = this.val().match(queryRegex1);
              subj = matches[1];
              prop = matches[2] || matches[3];
            } else if (queryRegex2.test(this.val())) {
              matches = this.val().match(queryRegex2);
              subj = matches[2];
              prop = matches[1];
            }
            if (subj !== undefined) {
              query = labels.filter('label', subj);
              if (query.length > 0) {
                pResource = aliases[prop];
                return pResource === undefined ? false : (ontology[pResource].type === 'property' || ontology[pResource].type === 'relation');
              }
            } else {
              return false;
            }
          }
        } else {
          if (objSubjPropRegex.test(this.val())) {
            matches = this.val().match(objSubjPropRegex);
            prop = matches[3];
          } else {
            matches = this.val().match(subjPropObjRegex1) || this.val().match(subjPropObjRegex2);
            if (matches === null) {
              return false;
            }
            prop = matches[2];
          }
          pResource = aliases[prop];
          return pResource === undefined ? false : (ontology[pResource].type === 'property' || ontology[pResource].type === 'relation');
        }
      },
    
      validate: function() {
        if (this.valid()) {
          this.field.removeClass('error');
        } else {
          this.field.addClass('error');
        }
      },
    
      triples: function() {
        var rdf, labels, sLabel, sResource, pLabel, pResource, oLabel, object, 
          pattern, result,
          matches = [], triple, triples = [];
        if (this.isQuery()) {
          rdf = reason($('#content').rdf());
          labels = rdf.where('?thing rdfs:label ?label');
          if (isAQueryRegex.test(this.val())) {
            matches = this.val().match(isAQueryRegex);
            sLabel = matches[1];
            pResource = $.rdf.type;
          } else {
            if (queryRegex1.test(this.val())) {
              matches = this.val().match(queryRegex1);
              sLabel = matches[1];
              pLabel = matches[2] || matches[3];
            } else if (queryRegex2.test(this.val())) {
              matches = this.val().match(queryRegex2);
              pLabel = matches[1];
              sLabel = matches[2];
            }
            pResource = aliases[pLabel];
          }
          sResource = labels.filter('label', sLabel)[0].thing;
          pattern = $.rdf.pattern(sResource, pResource, '?result');
          result = rdf.where(pattern);
          return result;
        } else {
          if (isAregex.test(this.val())) {
            matches = this.val().match(isAregex);
            sLabel = matches[1];
            oLabel = matches[2];
            pResource = $.rdf.type;
          } else if (this.valid()) {
            if (objSubjPropRegex.test(this.val())) {
              matches = this.val().match(objSubjPropRegex);
              oLabel = matches[1];
              sLabel = matches[2];
              pLabel = matches[3];
            } else {
              matches = this.val().match(subjPropObjRegex1) || this.val().match(subjPropObjRegex2);
              sLabel = matches[1];
              pLabel = matches[2];
              oLabel = matches[3];
            }
            triple = labelTriple(pLabel);
            triples.push(triple);
            pResource = triple.subject;
          }
          triple = labelTriple(sLabel);
          triples.push(triple);
          sResource = triple.subject;
          if (ontology[pResource] && ontology[pResource].type === 'relation') {
            triple = labelTriple(oLabel);
            triples.push(triple);
            object = triple.subject;
          } else {
            object = $.rdf.literal('"' + oLabel + '"');
          }
          triples.push($.rdf.triple(sResource, pResource, object)); 
          return $.rdf({ triples: triples, namespaces: ns });
        }
      }
    },
    
    addIndividual = function (list, resource, label) {
      var li;
      if (label === undefined) {
        label = resourceLabel(resource);
      }
      li = list
        .append("\n")
        .append('<li />')
        .children('li:last')
          .attr('id', resource.value.fragment)
          .append('<h3>' + label + '</h3>')
          .append('<ul class="properties" />')
          .children('h3')
            .bind('click', function () {
              $(this).parent().toggleClass('open');
              addDescription(resource);
            });
    },
    
    addDescription = function (resource) {
      var ind = $('#' + resource.value.fragment),
        label = ind.children('h3').text(),
        list, empty = true, rdf = $('#content').rdf();
      if (ind.hasClass('open')) {
        list = ind.children('ul');
        list.empty();
        rdf = reason(rdf);
        rdf
          .reset()
          .about(resource)
          .each(function (i, data, triples) {
            var p = this.property, pLabel,
              o = this.value, oLabel, li,
              triple = triples[0];
            if (!((p === $.rdf.label && o.type === 'literal' && o.value === label) ||
                  (p === $.rdf.type && ontology[o] !== undefined))) {
              empty = false;
              pLabel = ontology[p] === undefined ? p.value.fragment : ontology[p].aliases[0];
              if (o.type === 'literal') {
                oLabel = o.value;
              } else if (ontology[o] !== undefined) {
                oLabel = ontology[o].aliases[0];
              } else {
                oLabel = resourceLabel(o);
              }
              li = list
                .append('<li />')
                .children('li:last')
                  .attr('class', typeof(triple.source) === 'string' ? 'auto' : 'manual')
                  .html(pLabel + ': ' + oLabel);
              if (o.type === 'uri' && ontology[o] === undefined && o.value.fragment !== undefined) {
                li
                  .bind('click', function () {
                    $(this).parent().parent().removeClass('open');
                    $('#' + o.value.fragment).addClass('open');
                    addDescription(o);
                  });
              }
            }
          });
        if (empty) {
          ind.removeClass('open');
        }
      }
    },
    
    findSpan = function (resource) {
      var span = $(':type').filter(':about(\'' + resource.value + '\')').eq(0);
      return span;
    },
    
    markupTriple = function (triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object,
        sSpan, span;
      if (p === $.rdf.label) {
        aliases[o.value] = s;
      }
      if (typeof(triple.source) !== 'string') {
        if (o.type === 'literal') {
          sSpan = findSpan(s) || $('#content');
          span = markupText.call(sSpan, o.value.toString());
        } else {
          span = findSpan(o);
        } 
        if (span === undefined || span.length === 0) {
          span = findSpan(s);
        }
        if (span === undefined || span.length === 0) {
          span = $('#meta').append('<span></span>').children('span:last');
        }
        span = span.rdfa(triple);
      }
      addDescription(s);
    },
    
    populateLists = function () {
      var rdf = $('#content').rdf();
      people.empty();
      places.empty();
      rdf
        .prefix('rdfs', ns.rdfs)
        .prefix('foaf', ns.foaf)
        .where('?person a foaf:Person')
        .where('?person rdfs:label ?label')
        .each(function () {
          addIndividual(people, this.person, this.label.value);
        })
        .reset()
        .where('?place a vcard:Address')
        .where('?place rdfs:label ?label')
        .each(function () {
          addIndividual(places, this.place, this.label.value);
        });
    },
    
    /*
    resetSource = function () {
      $('#source').val($('#content').html());
    },
    */
  
    people = $('#people ul'),
    places = $('#places ul');
  
  $('#people h2, #places h2')
    .bind('click', function () {
      $(this).parent('li').toggleClass('open');
    });
  
  $.each(ontology, function (resource, description) {
    $.each(description.aliases, function (i, alias) {
      aliases[alias] = resource;
    });
  });

  populateLists();
  //resetSource();

  /*
  $('#content span')
    .each(function (i, span) {
      var rdf = $(this).rdf();
      rdf
        .where('?thing a ?class')
        .each(function () {
          spans[this.thing] = $(span);
        });
    });
  */
  
  /*
  $('#content')
    .bind('rdfChange', resetSource);
  */

  $('#answer').dialog({ autoOpen: false, modal: true, minHeight: 100 });

  $('#statement').bind("keyup", function(event) {
    var val = statement.val(),
      test = function () {
        if (statement.val() === val) {
          statement.validate();
        }
      };
    setTimeout(test, 1000);
    return true;
  });
  
  $('#notes').bind("submit", function (event){
    var rdf, response;
    statement.validate();
    if (statement.valid()) {
      rdf = statement.triples();
      if (statement.isQuery()) {
        response = $('#answer').text('');
        response.dialog('option', 'title', statement.val());
        response.append(rdf.length + ' answers');
        rdf.each(function (i, data, triples) {
          var label;
          response.append('<br>');
          if (this.result.type === 'uri') {
            if (ontology[this.result]) {
              label = ontology[this.result].aliases[0];
              if (ontology[this.result].type === 'class') {
                response.append(/^aeiou/.test(label) ? 'an ' : 'a ');
              }
            } else {
              label = resourceLabel(this.result);
            }
          } else if (this.result.type === 'bnode') {
            label = resourceLabel(this.result);
          } else {
            label = this.result.value;
          }
          response.append(label);
        })
        response.dialog('open');
      } else {
        response = $('#response').text('');
        rdf = reason(rdf);
        response.append('OK, I know:');
        rdf
          .where('?thing a ?class')
          .each(function (i, data, triples) {
            var list, span, label;
            span = findSpan(this.thing);
            if (span.length === 0) {
              label = resourceLabel(this.thing, rdf);
              span = markupText.call($('#content'), label.toString());
              if (span === undefined) {
                span = $('#meta').append('<span />').children('span:last');
              }
              // spans[this.thing] = span;
              span.rdfa(triples);
              if (this.class === $.rdf.resource('<http://xmlns.com/foaf/0.1/Person>')) {
                list = people;
              } else if (this.class === $.rdf.resource('<http://www.w3.org/2006/vcard/ns#Address>')) {
                list = places;
              }
              if (list !== undefined && $('#' + this.thing.value.fragment).length === 0) {
                addIndividual(list, this.thing, label);
              }
            }
          })
          .reset()
          .where('?thing ?prop ?val')
          .filter(function () {
            return ontology[this.thing] === undefined;
          })
          .each(function (i, data, triples) {
            markupTriple(triples[0]);
          })
          .each(function () {
            var sLabel = englishObject(this.thing);
            if (this.prop !== $.rdf.label) {
              response.append('<br>');
              if (this.val.type === 'literal') {
                response.append(sLabel + '\'s ' + englishProperty(this.prop) + ' is ' + englishObject(this.val));
              } else if (this.prop === $.rdf.type) {
                response.append(sLabel + ' is a ' + englishObject(this.val));
              } else {
                response.append(englishObject(this.val) + ' is ' + sLabel + '\'s ' + englishProperty(this.prop));
              }
            } else if (sLabel !== this.val.value) {
              response.append('<br>');
              response.append(sLabel + ' is also known as ' + englishObject(this.val));
            }
          });
      }
      statement.field.val('');
    }
    event.preventDefault();
    return true;
  });

});
