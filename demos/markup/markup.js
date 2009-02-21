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
        aliases: ['born in', 'birth place']
      },
      '<http://biografr.com/ontology#bornOn>': {
        type: 'property',
        aliases: ['birth date', 'born on']
      },
      '<http://biografr.com/ontology#gender>': {
        type: 'property',
        aliases: ['gender', 'sex']
      },
      '<http://biografr.com/ontology#hasGrandparent>': {
        type: 'relation',
        aliases: ['grandparent']
      },
      '<http://biografr.com/ontology#hasGrandmother>': {
        type: 'relation',
        aliases: ['grandmother', 'grandma', 'nan', 'granny']
      },
      '<http://biografr.com/ontology#hasGrandfather>': {
        type: 'relation',
        aliases: ['grandfather', 'grandpa']
      },
      '<http://biografr.com/ontology#hasGrandchild>': {
        type: 'relation',
        aliases: ['grandchild']
      },
      '<http://biografr.com/ontology#hasGrandson>': {
        type: 'relation',
        aliases: ['grandson']
      },
      '<http://biografr.com/ontology#hasGranddaughter>': {
        type: 'relation',
        aliases: ['granddaughter']
      },
      '<http://biografr.com/ontology#hasParent>': {
        type: 'relation',
        aliases: ['parent']
      },
      '<http://biografr.com/ontology#hasFather>': {
        type: 'relation',
        aliases: ['father', 'dad']
      },
      '<http://biografr.com/ontology#hasMother>': {
        type: 'relation',
        aliases: ['mother', 'mum']
      },
      '<http://biografr.com/ontology#hasChild>': {
        type: 'relation',
        aliases: ['child']
      },
      '<http://biografr.com/ontology#hasSon>': {
        type: 'relation',
        aliases: ['son']
      },
      '<http://biografr.com/ontology#hasDaughter>': {
        type: 'relation',
        aliases: ['daughter']
      },
    },
    
    rules = [{
      where: ['?child biografr:hasFather ?father'],
      then: ['?child biografr:hasParent ?father', 
             '?father biografr:hasChild ?child',
             '?father biografr:gender "male"']
    }, {
      where: ['?child biografr:hasMother ?mother'],
      then: ['?child biografr:hasParent ?mother',
             '?mother biografr:hasChild ?child',
             '?mother biografr:gender "female"']
    }, {
      where: ['?gchild biografr:hasParent ?parent',
              '?parent biografr:hasParent ?gparent'],
      then: ['?gchild biografr:hasGrandparent ?gparent',
             '?gparent biografr:hasGrandchild ?gchild']
    }, {
      where: ['?parent biografr:hasChild ?child',
              '?child biografr:gender "male"'],
      then: ['?parent biografr:hasSon ?child']
    }, {
      where: ['?parent biografr:hasChild ?child',
              '?child biografr:gender "female"'],
      then: ['?parent biografr:hasDaughter ?child']
    }, {
      where: ['?parent biografr:hasSon ?child'],
      then: ['?parent biografr:hasChild ?child',
             '?child biografr:gender "male"']
    }, {
      where: ['?parent biografr:hasDaughter ?child'],
      then: ['?parent biografr:hasChild ?child',
             '?child biografr:gender "female"']
    }, {
      where: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "male"'],
      then: ['?gparent biografr:hasGrandson ?gchild']
    }, {
      where: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "female"'],
      then: ['?gparent biografr:hasGranddaughter ?gchild']
    }, {
      where: ['?gparent biografr:hasGrandson ?gchild'],
      then: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "male"']
    }, {
      where: ['?gparent biografr:hasGranddaughter ?gchild'],
      then: ['?gparent biografr:hasGrandchild ?gchild',
              '?gchild biografr:gender "female"']
    }],
  
    isAregex = /^\s*(.*\S)(?:'s|\s+(?:was|is|are|were))\s+an?\s+(\S.*)\s*$/,
    subjPropObjRegex1 = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(?:(?:the|a)\s+)?(\S.*\s+(?:on|in|of|at|as|to|from|for))\s+(\S.*)\s*$/,
    subjPropObjRegex2 = /^\s*(.*\S)'s\s+(\S.*\S)\s+(?:is|was|are|were)\s+(\S.*)\s*$/,
    objSubjPropRegex = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(\S.*)'s\s+(\S.*)\s*$/,
  
    aliases = {},
    properties = [],
    spans = {};
  
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
    
    statement = {
      field: $('#statement'),
      val: function() {
        return this.field.val();
      },
    
      valid: function() {
        var matches, prop, pResource;
        if (isAregex.test(this.val())) {
          return true;
        }
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
      },
    
      validate: function() {
        if (this.valid()) {
          this.field.removeClass('error');
        } else {
          this.field.addClass('error');
        }
      },
    
      triples: function() {
        var sLabel, sResource, pLabel, pResource, oLabel, object, 
          matches = [], triple, triples = [];
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
    
    markupTriple = function (triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object,
        sSpan = spans[s] || $('#content'),
        label, span;
      if (p === $.rdf.label) {
        aliases[o.value] = s;
      }
      if (typeof(triple.source) !== 'string') {
        if (o.type === 'literal') {
          span = markupText.call(sSpan, o.value.toString());
        } else {
          span = spans[o];
        } 
        if (span === undefined) {
          span = spans[s];
        }
        if (span === undefined) {
          span = $('#meta').append('<span></span>').children('span:last');
        }
        span.rdfa(triple);
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
    
    resetSource = function () {
      $('#source').val($('#content').html());
    },
  
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
  resetSource();

  $('#content span')
    .each(function (i, span) {
      var rdf = $(this).rdf();
      rdf
        .where('?thing a ?class')
        .each(function () {
          spans[this.thing] = $(span);
        });
    });
  
  $('#content')
    .bind('rdfChange', resetSource);

  $('#statement').bind("keyup", function(event){
    statement.validate();
    return true;
  });
  
  $('#notes').bind("submit", function (event){
    var rdf;
    statement.validate();
    if (statement.valid()) {
      rdf = statement.triples();
      rdf = reason(rdf);
      rdf
        .where('?thing a ?class')
        .each(function (i, data, triples) {
          var list, span, label;
          label = resourceLabel(this.thing, rdf);
          span = markupText.call($('#content'), label.toString());
          if (span === undefined) {
            span = $('#meta').append('<span />').children('span:last');
          }
          spans[this.thing] = span;
          span.rdfa(triples);
          if (this.class === $.rdf.resource('<http://xmlns.com/foaf/0.1/Person>')) {
            list = people;
          } else if (this.class === $.rdf.resource('<http://www.w3.org/2006/vcard/ns#Address>')) {
            list = places;
          }
          if (list !== undefined) {
            addIndividual(list, this.thing, label);
          }
        })
        .reset()
        .where('?thing ?prop ?val')
        .filter(function () {
          return ontology[this.thing] === undefined;
        })
        .each(function (i, data, triples) {
          markupTriple(triples[0]);
        });
      statement.field.val('');
    }
    event.preventDefault();
    return true;
  });

});
