$(document).ready(function () {
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
    
    ontology = $.rdf.ontology({ namespaces: ns })
      .property('rdf:type', { labels: ['a', 'kind of'], range: $.rdfs.Class })
      .property('rdfs:label', { labels: ['aka', 'also known as'] })
      .type('foaf:Person', { labels: ['person'] })
      .property('foaf:firstName', { labels: ['first name', 'forename'], domain: 'foaf:Person' })
      .property('foaf:givenname', { labels: ['middle name'], domain: 'foaf:Person' })
      .property('foaf:surname', { labels: ['surname', 'last name'], domain: 'foaf:Person' })
      .type('vcard:Address', { labels: ['place', 'address'] })
      .property('vcard:street-address', { labels: ['house', 'street'], domain: 'vcard:Address' })
      .property('vcard:locality', { labels: ['town', 'city'], domain: 'vcard:Address' })
      .property('vcard:region', { labels: ['county', 'area'], domain: 'vcard:Address' })
      .property('vcard:country', { domain: 'vcard:Address' })
      .property('biografr:hasBirthPlace', { labels: ['born in', 'birth place', 'born'], domain: 'foaf:Person', range: 'vcard:Address' })
      .property('biografr:bornOn', { labels: ['birth date', 'date of birth', 'born on', 'born'], domain: 'foaf:Person', datatype: 'xsd:date' })
      .property('biografr:gender', { labels: ['gender', 'sex'], domain: 'foaf:Person' })
      .property('biografr:hasGrandparent', { 
        labels: ['grandparent'], 
        domain: 'foaf:Person', 
        range: 'foaf:Person',
        inverse: 'biografr:hasGrandchild' })
      .property('biografr:hasGrandmother', { 
        labels: ['grandmother', 'grandma', 'nan', 'granny'], 
        superproperty: 'biografr:hasGrandparent' })
      .property('biografr:hasGrandfather', { labels: ['grandfather', 'grandpa'], superproperty: 'biografr:hasGrandparent' })
      .property('biografr:hasGrandchild', { labels: ['grandchild'], domain: 'foaf:Person', range: 'foaf:Person' })
      .property('biografr:hasGrandson', { labels: ['grandson'], superproperty: 'biografr:hasGrandchild' })
      .property('biografr:hasGranddaughter', { labels: ['granddaughter'], superproperty: 'biografr:hasGranddaughter' })
      .property('biografr:hasParent', { labels: ['parent'], domain: 'foaf:Person', range: 'foaf:Person' })
      .property('biografr:hasFather', { labels: ['father', 'dad'], superproperty: 'biografr:hasParent' })
      .property('biografr:hasMother', { labels: ['mother', 'mum'], superproperty: 'biografr:hasParent' })
      .property('biografr:hasChild', { labels: ['child'], domain: 'foaf:Person', range: 'foaf:Person' })
      .property('biografr:hasSon', { labels: ['son'], superproperty: 'biografr:hasChild' })
      .property('biografr:hasDaughter', { labels: ['daughter'], superproperty: 'biografr:hasChild' });
    
    rules = $.rdf.ruleset()
      .prefix('biografr', ns.biografr)
      .add('?child biografr:hasFather ?father',
           ['?father biografr:hasChild ?child',
            '?father biografr:gender "male"'])
      .add('?child biografr:hasMother ?mother',
           ['?mother biografr:hasChild ?child',
            '?mother biografr:gender "female"'])
      .add(['?gchild biografr:hasParent ?parent',
            '?parent biografr:hasParent ?gparent'],
           ['?gchild biografr:hasGrandparent ?gparent',
            '?gparent biografr:hasGrandchild ?gchild'])
      .add(['?parent biografr:hasChild ?child',
            '?child biografr:gender "male"'],
           '?parent biografr:hasSon ?child')
      .add(['?parent biografr:hasChild ?child',
            '?child biografr:gender "female"'],
           '?parent biografr:hasDaughter ?child')
      .add('?parent biografr:hasSon ?child',
           ['?parent biografr:hasChild ?child',
            '?child biografr:gender "male"'])
      .add('?parent biografr:hasDaughter ?child',
           ['?parent biografr:hasChild ?child',
            '?child biografr:gender "female"'])
      .add(['?gparent biografr:hasGrandchild ?gchild',
            '?gchild biografr:gender "male"'],
           '?gparent biografr:hasGrandson ?gchild')
      .add(['?gparent biografr:hasGrandchild ?gchild',
            '?gchild biografr:gender "female"'],
           '?gparent biografr:hasGranddaughter ?gchild')
      .add('?gparent biografr:hasGrandson ?gchild',
           '?gchild biografr:gender "male"')
      .add('?gparent biografr:hasGranddaughter ?gchild',
           '?gchild biografr:gender "female"')
      .add(['?gchild biografr:hasGrandparent ?gparent',
            '?gparent biografr:gender "male"'],
           '?gchild biografr:hasGrandfather ?gparent')
      .add(['?gchild biografr:hasGrandparent ?gparent',
            '?gparent biografr:gender "female"'],
           '?gchild biografr:hasGrandmother ?gparent')
      .add('?gchild biografr:hasGrandfather ?gparent',
           '?gparent biografr:gender "male"')
      .add('?gchild biografr:hasGrandmother ?gparent',
           '?gparent biografr:gender "female"'),
  
    rdf = $('#content').rdf().reason(ontology, { rules: rules }),
  
    /* S is a O */
    isAregex = /^\s*(.*\S)(?:'s|\s+(?:was|is|are|were))\s+an?\s+(\S.*\S)\.?\s*$/,
    /* S is P in O */
    subjPropObjRegex1 = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(?:(?:the|a)\s+)?(\S.*\s+(?:on|in|of|at|as|to|from|for))\s+(\S.*\S)\.?\s*$/,
    /* S's P is O */
    subjPropObjRegex2 = /^\s*(.*\S)'s\s+(\S.*\S)\s+(?:is|was|are|were)\s+(\S.*\S)\.?\s*$/,
    /* O is S's P */
    objSubjPropRegex = /^\s*(.*\S)\s+(?:is|was|are|were)\s+(\S.*\S)'s\s+(\S.*\S)\.?\s*$/,
    
    /* Where was S's P */
    isAQueryRegex = /^\s*What\s+(?:was|is|are|were)\s+(\S(?:[^'?]|'[^s])*)\??$/,
    /* Who were S's Ps */
    queryRegex1 = /^\s*(?:Who|Where|What|When|Which)\s+(?:was|is|are|were)\s+(\S.*\S)'s\s+(?:(\S.*\S)s|(\S.*[^\s?]))\??$/,
    /* Which P was S in? */
    queryRegex2 = /^\s*(?:Who|Where|What|When|Which)\s+(\S.*\S)\s+(?:was|is|are|were)\s+(\S.*\S)\s+(?:on|in|of|at|as|to|from|for)\??$/,
    /* Where was S P */
    queryRegex3 = /^\s*(?:Who|Where|When)\s+(?:was|is|are|were)\s+(\S.*\S)\s+([^\s?]+)\??$/,
  
    aliases = {},
  
    people = $('#people ul'),
    places = $('#places ul'),
  
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
    
    resourceLabel = function (resource, scope) {
      var scope = scope || rdf,
        q = scope
          .prefix('rdfs', ns.rdfs)
          .where(resource + ' rdfs:label ?label');
      if (q.length > 0) {
        return q.get(0).label.value;
      } else {
        return resource.value.fragment;
      }
    },
    
    labelTriple = function (label) {
      var id, resource;
      resource = aliases[label] && aliases[label][0];
      if (resource === undefined) {
        id = makeID(label);
        resource = $.rdf.resource('<#' + id + '>');
      }
      return $.rdf.triple(resource, $.rdf.label, $.rdf.literal('"' + label + '"'));
    },
    
    englishProperty = function (prop) {
      return ontology.property(prop).label();
    },
    
    englishObject = function (object, scope) {
      if (object.type === 'uri') {
        if (ontology.type(object)) {
          return ontology.type(object).label();
        } else if (ontology.property(object)) {
          return ontology.property(object).label();
        } else {
          return resourceLabel(object, scope);
        }
      } else if (object.type === 'bnode') {
        return resourceLabel(object, scope);
      } else {
        return object.value;
      }
    },
    
    statement = {
      field: $('#statement'),
      error: $('#error'),
      val: function () {
        return this.field.val();
      },
    
      isQuery: function () {
        return (/\?$/).test(this.val()) || (/^(What|Where|When|Who|Which)\s/).test(this.val());
      },
    
      validate: function () {
        var triples;
        if (this.val() === '') {
          this.field.removeClass('error');
          this.error.text('');
        } else {
          triples = this.triples();
          if (typeof(this.triples()) === 'string') {
            this.field.addClass('error');
            this.error.text(triples);
          } else {
            this.field.removeClass('error');
            this.error.text('');
          }
        }
      },
    
      triples: function () {
        var labels, sLabel, sResource, 
          pLabel, pResource, pResources, pDef, range,
          oLabel, object, 
          pattern, result, i,
          matches = [], triple, triples = [];
        if (this.isQuery()) {
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
            } else if (queryRegex3.test(this.val())) {
              matches = this.val().match(queryRegex3);
              sLabel = matches[1];
              pLabel = matches[2];
            } else {
              return 'I don\'t recognise the format of the question.';
            }
            pResources = aliases[pLabel];
            if (pResources === undefined) {
              return 'I don\'t recognise "' + pLabel + '".';
            } else if (pResources.length === 1) {
              pResource = pResources[0];
              if (ontology.type(pResource)) {
                return '"' + pLabel + '" is a class and I was expecting a property.';
              }
            } else {
              if (/^\s*Where/.test(this.val())) {
                range = '<http://www.w3.org/2006/vcard/ns#Address>';
              } else if (/^\s*Who/.test(this.val())) {
                range = '<http://xmlns.com/foaf/0.1/Person>';
              } else if (/^\s*When/.test(this.val())) {
                range = '<http://www.w3.org/2001/XMLSchema#date>';
              }
              pResources = [];
              for (i = 0; i < aliases[pLabel].length; i += 1) {
                pResource = aliases[pLabel][i];
                pDef = ontology.property(pResource);
                if (pDef !== undefined) {
                  if (range === undefined || pDef.range === range) {
                    pResources.push(pResource);
                  }
                }
              }
              if (pResources.length === 0) {
                pResources = aliases[pLabel];
              }
              if (pResources.length > 1) {
                result = 'I don\'t know if you mean ';
                for (i = 0; i < pResources.length; i += 1) {
                  result += englishProperty(pResources[i]);
                  if (i !== pResources.length - 1) {
                    result += ' or ';
                  }
                }
                result += '. Can you rephrase, please?';
                return result;
              }
              pResource = pResources[0];
            }
          }
          labels = rdf.where('?thing rdfs:label ?label');
          labels = labels.filter('label', sLabel);
          if (labels.length > 0) {
            sResource = labels[0].thing;
            pattern = $.rdf.pattern(sResource, pResource, '?result');
            result = rdf.where(pattern);
            return result;
          } else {
            return 'I don\'t recognise "' + sLabel + '".';
          }
        } else {
          if (isAregex.test(this.val())) {
            matches = this.val().match(isAregex);
            sLabel = matches[1];
            oLabel = matches[2];
            pResource = $.rdf.type;
          } else {
            if (objSubjPropRegex.test(this.val())) {
              matches = this.val().match(objSubjPropRegex);
              oLabel = matches[1];
              sLabel = matches[2];
              pLabel = matches[3];
            } else if (subjPropObjRegex1.test(this.val()) || subjPropObjRegex2.test(this.val())) {
              matches = this.val().match(subjPropObjRegex1) || this.val().match(subjPropObjRegex2);
              sLabel = matches[1];
              pLabel = matches[2];
              oLabel = matches[3];
            } else {
              return 'I don\'t recognise the format of the statement. Can you rephrase please?';
            }
            pResources = aliases[pLabel];
            if (pResources === undefined) {
              return 'I don\'t recognise "' + pLabel + '".';
            } else if (pResources.length === 1) {
              pResource = pResources[0];
              if (pResource.type === 'class') {
                return '"' + pLabel + '" is a class and I was expecting a property.';
              }
            } else {
              pResources = [];
              for (i = 0; i < aliases[pLabel].length; i += 1) {
                pResource = aliases[pLabel][i];
                if (ontology.property(pResource) !== undefined) {
                  pResources.push(pResource);
                }
              }
              if (pResources.length === 0) {
                pResources = aliases[pLabel];
              }
              if (pResources.length > 1) {
                result = 'I don\'t know if you mean ';
                for (i = 0; i < pResources.length; i += 1) {
                  result += englishProperty(pResources[i]);
                  if (i !== pResources.length - 1) {
                    result += ' or ';
                  }
                }
                result += '. Can you rephrase, please?';
                return result;
              }
            }
            triple = labelTriple(pLabel);
            triples.push(triple);
          }
          triple = labelTriple(sLabel);
          triples.push(triple);
          sResource = triple.subject;
          if (ontology.property(pResource) && ontology.property(pResource).range !== undefined) {
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
    
    addDescription = function (resource) {
      var ind = $('#' + resource.value.fragment),
        label = ind.children('h3').text(),
        list, empty = true;
      if (ind.hasClass('open')) {
        list = ind.children('ul');
        list.empty();
        rdf
          .reset()
          .about(resource)
          .each(function (i, data, triples) {
            var p = this.property, pLabel,
              o = this.value, oLabel, 
              li, hLabel, del,
              triple = triples[0];
            if (!((p === $.rdf.label && o.type === 'literal' && o.value === label) ||
                  (p === $.rdf.type && ontology.type(o) !== undefined))) {
              empty = false;
              pLabel = ontology.property(p) === undefined ? p.value.fragment : ontology.property(p).label();
              if (o.type === 'literal') {
                oLabel = o.value;
              } else if (ontology.type(o) !== undefined) {
                oLabel = ontology.type(o).label();
              } else {
                oLabel = resourceLabel(o);
              }
              li = list
                .append('<li />')
                .children('li:last')
                  .attr('class', typeof(triple.source) === 'string' ? 'auto' : 'manual');
              if (typeof(triple.source) !== 'string') {
                del = li
                  .append(' <abbr title="delete">x</abbr>')
                  .children('abbr')
                  .bind('click', function () {
                    $(triple.source).removeRdfa({ property: triple.property });
                    rdf = $('#content').rdf().reason(rules);
                    addDescription(resource);
                  });
              }
              hLabel = li
                .append('<span />')
                .children('span')
                  .html(pLabel + ': ' + oLabel);
              if (o.type === 'uri' && ontology.type(o) === undefined && o.value.fragment !== undefined) {
                hLabel
                  .attr('class', 'link')
                  .bind('click', function () {
                    $(this).parent().parent().parent().removeClass('open');
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
        if (aliases[o.value] === undefined) {
          aliases[o.value] = [s];
        } else {
          aliases[o.value].push(s);
        }
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
    };
  
  $('#people h2, #places h2')
    .bind('click', function () {
      $(this).parent('li').toggleClass('open');
    });
  
  ontology.type().each(function () {
    var c = this;
    $.each(this.labels, function (i, alias) {
      if (aliases[alias] === undefined) {
        aliases[alias] = [c];
      } else {
        aliases[alias].push(c);
      }
    });
  });
  
  ontology.property().each(function () {
    var p = this;
    $.each(this.labels, function (i, alias) {
      if (aliases[alias] === undefined) {
        aliases[alias] = [p];
      } else {
        aliases[alias].push(p);
      }
    });
  });

  populateLists();

  $('#answer').dialog({ 
    autoOpen: false, 
    modal: true, 
    minHeight: 100,
    close: function () {
      $('#statement').select();
      return true;
    }
  });

  $('#statement').bind("keyup", function (event) {
    var val = statement.val(),
      test = function () {
        if (statement.val() === val) {
          statement.validate();
        }
      };
    $('#error').text('');
    setTimeout(test, 1000);
    return true;
  });
  
  $('#notes').bind("submit", function (event) {
    var newRdf, response;
    try {
      newRdf = statement.triples();
      if (typeof(newRdf) !== 'string') {
        if (statement.isQuery()) {
          response = $('#response').text('');
          response.append('Answering "' + statement.val() + '"');
          response = $('#answer').text('');
          response.dialog('option', 'title', statement.val());
          response.dialog('option', 'width', '33%');
          if (newRdf.length > 0) {
            newRdf.each(function (i, data, triples) {
              var label;
              if (i > 0) {
                response.append('<br>');
              }
              if (this.result.type === 'uri') {
                if (ontology.type(this.result)) {
                  label = ontology.type(this.result).label();
                  response.append(/^aeiou/.test(label) ? 'an ' : 'a ');
                } else if (ontology.property(this.result)) {
                  label = ontology.property(this.result).label();
                } else {
                  label = resourceLabel(this.result);
                }
              } else if (this.result.type === 'bnode') {
                label = resourceLabel(this.result);
              } else {
                label = this.result.value;
              }
              response.append(label);
            });
          } else {
            response.append('I don\'t know');
          }
          response.dialog('open');
        } else {
          response = $('#response').text('');
          newRdf.reason(rules);
          response.append('OK, I know:');
          newRdf
            .where('?thing a ?class')
            .each(function (i, data, triples) {
              var list, span, label;
              span = findSpan(this.thing);
              if (span.length === 0) {
                label = resourceLabel(this.thing, newRdf);
                span = markupText.call($('#content'), label.toString());
                if (span === undefined) {
                  span = $('#meta').append('<span />').children('span:last');
                }
                // spans[this.thing] = span;
                span.rdfa(triples);
                if (this['class'] === $.rdf.resource('<http://xmlns.com/foaf/0.1/Person>')) {
                  list = people;
                } else if (this['class'] === $.rdf.resource('<http://www.w3.org/2006/vcard/ns#Address>')) {
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
              return ontology.type(this.thing) === undefined && ontology.property(this.thing) === undefined;
            })
            .each(function (i, data, triples) {
              markupTriple(triples[0]);
            })
            .each(function () {
              var sLabel = englishObject(this.thing, newRdf);
              if (this.prop !== $.rdf.label) {
                response.append('<br>');
                if (this.val.type === 'literal') {
                  response.append(sLabel + '\'s ' + englishProperty(this.prop) + ' is ' + englishObject(this.val, newRdf));
                } else if (this.prop === $.rdf.type) {
                  response.append(sLabel + ' is a ' + englishObject(this.val, newRdf));
                } else {
                  response.append(englishObject(this.val, newRdf) + ' is ' + sLabel + '\'s ' + englishProperty(this.prop));
                }
              } else if (sLabel !== this.val.value) {
                response.append('<br>');
                response.append(sLabel + ' is also known as ' + englishObject(this.val));
              }
            });
        }
        statement.field.val('');
        rdf = $('#content').rdf().reason(rules);
      }
    } catch (e) {
      console.log(e);
      alert('Sorry, you discovered a bug! Please let Jeni know what you did to expose it. (jeni@jenitennison.com)');
    }
    event.preventDefault();
    return true;
  });

  $('#json').bind("click", function () {
      var json = $('#content').rdf().databank.dump(),
        answer = $('#answer');
      answer.dialog('option', 'title', 'JSON');
      answer.dialog('option', 'width', '75%');
      answer.text($.toJSON(json));
      answer.dialog('open');
    });

  $('#rdfxml').bind("click", function () {
    var xml = $('#content').rdf().databank.dump({ format: 'application/rdf+xml' }),
      answer = $('#answer'),
      serializer;
    answer.dialog('option', 'title', 'RDF/XML');
    answer.dialog('option', 'width', '75%');
    serializer = new XMLSerializer();
    answer.text(serializer.serializeToString(xml));
    answer.dialog('open');
  });

  $('#statement').select();

});
