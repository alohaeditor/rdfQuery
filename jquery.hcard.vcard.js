/*
 * jQuery hCard to vCard for rdfQuery @VERSION
 * http://www.w3.org/2006/vcard/hcard2rdf.xsl
 * http://www.w3.org/2006/vcard/ns#
 * some examples are from http://microformats.org/wiki/hcard-examples
 * 
 * Copyright (c) 2008 Libby Miller
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/*global jQuery */

(function ($) {

	var vcards = $.rdf.databank([], 
		{namespaces: 
			{ 
			v: 'http://www.w3.org/2006/vcard/ns#', 
			foaf: 'http://xmlns.com/foaf/0.1/' 
		} 
		}),
	triples = [],
	v = 'http://www.w3.org/2006/vcard/ns#',

	testForVcardClass = function () {
			var cl = $('*.vcard');
			for (var i = 0; i < cl.length; i++) {
				var c = cl[i],
				ids = $('@id'),
            	root;
            
                if (ids[0]) {
                    root = $.rdf.resource('<' + $.uri.base() + '#' + ids[0] + '>');
                } else {
                    root = $.rdf.blank('[]');
                }

                var triple = $.rdf.triple(root, $.rdf.type, $.rdf.resource('<' + v + 'Vcard>'));
                triples.push(triple);
                vcards.add(triple);
                
                var descendants = c.getElementsByTagName('*');
                for (var k = 0; k < descendants.length; k++) {
                    var x = descendants[k];
                    var cName = x.className;

					var reg = /(?:^|\s)fn(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'fn>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }

//object here would be the name object
                    var nameNode = $.rdf.blank("[]");
					reg = /(?:^|\s)n(?:\s|$)/
					
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));
                        triples.push(triple1);
                        triples.push(triple2);
		                vcards.add(triple1);
        		        vcards.add(triple2);

                    }

//these are all properties of the name object

					reg = /(?:^|\s)given-name(?:\s|$)/
                    if (reg.exec(cName)) {
//check for n; if not there, add it - http://microformats.org/wiki/hcard#Implied_.22n.22_Optimization
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'given-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}

                    }

					reg = /(?:^|\s)family-name(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'family-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}
                    }
					reg = /(?:^|\s)additional-name(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'additonal-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}
                    }
					reg = /(?:^|\s)honorific-prefix(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-prefix>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}
                    }
					reg = /(?:^|\s)honorific-suffix(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-suffix>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}
                    }

//end name object handling

//nickname seems incorrect so adding it twice @@

					reg = /(?:^|\s)nickname(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'nickname>'), $.rdf.literal('"'+fn+'"'));
                        var triple0 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'nickname>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
				    	var q = $.rdf();
						q = q.where('?vcard a <'+v+'Name>');

						if(q.length == 0){
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));							
                        var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        triples.push(triple2);
		                vcards.add(triple2);
                        triples.push(triple3);
		                vcards.add(triple3);
						}
                    }

//url is a resource if it has http:// in it
					reg = /(?:^|\s)url(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.getAttribute("href");
                       if(fn.indexOf('http://')==-1){
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.literal('"'+fn+'"'));
                            triples.push(triple1);
			                vcards.add(triple1);
                       } else {
                           var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.resource('<'+fn+'>'));
                            triples.push(triple1);                           
			                vcards.add(triple1);
                       }
                    }
//email, tel, addr,  are a little trickier
/*
e.g.
  <a class="email" href="mailto:neuroNOSPAM@t37.net">
     <span class="type">pref</span><span>erred email</span>
  </a>
*/  
					reg = /(?:^|\s)email(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.getAttribute("href");
                        var emailDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < emailDescendants.length; j++) {
                            var y=emailDescendants[j];
                            var yName= y.className;
                            if(yName.indexOf('type')!=-1){
                                var type = y.textContent;
                                var prop = "email";
                                if(type.toLowerCase()=="home" || type.toLowerCase()=="personal"){
                                    prop="personalEmail";
                                }
                                if(type.toLowerCase()=="work" || type.toLowerCase()=="office"){
                                    prop="workEmail";
                                }
                                if(type.toLowerCase()=="mobile"){
                                    prop="mobileEmail";
                                }                                    
                                var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+fn+'"'));
                                triples.push(triple1);
				                vcards.add(triple1);

                            }
                        }
                    }

/*

tel
    <div class="tel">
    <dt>Phone (<span class="type">home</span>)</dt>
    <dd><span class="value">+438123418</span></dd>
    </div>

*/

					reg = /(?:^|\s)tel(?:\s|$)/
                    if (reg.exec(cName)) {
                        var emailDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < emailDescendants.length; j++) {
                            var y=emailDescendants[j];
                            var yName = y.className;
                            var prop = "tel";
                            var val;

                            if(yName.indexOf('type')!=-1){
                                var type = y.textContent;
                                if(type.toLowerCase()=="cell"){
                                    prop="mobileTel";
                                }                                      
                                if(type.toLowerCase()=="work" || type.toLowerCase()=="office"){
                                    prop="workTel";
                                }
                                if(type.toLowerCase()=="fax") {
                                    prop="fax";
                                }
                                if(type.toLowerCase()=="home"){
                                    prop="homeTel";
                                }
                                  
                            }
                            if(yName.indexOf('value')!=-1){
                                val = yName;
                            }
//tel needs cleaning up
//do we need to separate with '-'?
							if(val.startsWith("tel:")){
							   val=val.substring(4);
							}

                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.resource('<tel:'+val+'>'));
                                triples.push(triple1);
				                vcards.add(triple1);

                        }
                    }

/*

addr

example:
  <span class="adr">
     <span class="street-address">12 rue Danton</span>
     <span class="locality">Le Kremlin-Bicetre</span>
     <span class="postal-code">94270</span>
     <span class="country-name">France</span>
  </span>

*/

					reg = /(?:^|\s)adr(?:\s|$)/
                    if (reg.exec(cName)) {
                        var adrDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < adrDescendants.length; j++) {
                            var y=adrDescendants[j];
                            var val=y.textContent;
                            var prop= y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);
			                vcards.add(triple1);

                        }
                    }

//label is easy

					reg = /(?:^|\s)label(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'label>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);

                    }

//geo bt more complex

/*

  <span class="geo">
     <abbr class="latitude" title="48.816667">N 48¡ 81.6667</abbr>
     <abbr class="longitude" title="2.366667">E 2¡ 36.6667</abbr>
  </span>

*/

					reg = /(?:^|\s)geo(?:\s|$)/
                    if (reg.exec(cName)) {
                        var geoDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < geoDescendants.length; j++) {
                            var y = geoDescendants[j];
                            var val = y.textContent;
                            var prop = y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);
			                vcards.add(triple1);

                        }
                    }



//tz, photo, logo, sound, are straightforward

					reg = /(?:^|\s)tz(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'tz>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }


					reg = /(?:^|\s)photo(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'photo>'), $.rdf.resource('<'+fn+'>'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }

					reg = /(?:^|\s)logo(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'logo>'), $.rdf.resource('<'+fn+'>'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }

					reg = /(?:^|\s)sound(?:\s|$)/
                    if (reg.exec(cName)) {
                       var fn = x.textContent;
                       var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'sound>'), $.rdf.resource('<'+fn+'>'));
                       triples.push(triple1);
		                vcards.add(triple1);

                    }

//bday is a little odd

/*

    <div class="bday">
    <dt>Birthday</dt>
    <dd>
        <abbr class="value" title="1985-10-27T00:00:00Z">October 27, 1985</abbr>
    </dd>
    </div>

*/

					reg = /(?:^|\s)bday(?:\s|$)/
                    if (reg.exec(cName)) {
                        var bdayDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < bdayDescendants.length; j++) {
                            var y = bdayDescendants[j];
                            var val = y.getAttribute("title");
                            var prop = y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);
			                vcards.add(triple1);

                        }
                    }



//title, role are simple

					reg = /(?:^|\s)title(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'title>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }
                        
					reg = /(?:^|\s)role(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'role>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }
 
//org is trickier

					reg = /(?:^|\s)org(?:\s|$)/
                    if (reg.exec(cName)) {
                        var orgDescendants = x.getElementsByTagName('*');
                        var orgNode = $.rdf.blank("[]");
                        var subnodes = false;
                        for (var j = 0; j < orgDescendants.length; j++) {
                            var y = orgDescendants[j];
                            var val = y.textContent;
                            var prop = y.className;
                            if(val && prop){
                                var triple3 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                                triples.push(triple3);
				                vcards.add(triple3);
                                subnodes=true;
                            }
                        }
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'org>'), orgNode);
                        var triple2 = $.rdf.triple(orgNode, $.rdf.type, $.rdf.resource('<' + v + 'Organization>')); //should check if it has a name
                        triples.push(triple1);
		                vcards.add(triple1);
                        triples.push(triple2);
		                vcards.add(triple2);

                        if(!subnodes){
                            var fn = x.textContent;
                            var triple4 = $.rdf.triple(orgNode, $.rdf.resource('<' + v + 'organization-name>'), $.rdf.literal('"'+fn+'"'));
                            triples.push(triple4);
			                vcards.add(triple4);

                        }
                        
                    }



//category note class are simple

					reg = /(?:^|\s)category(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'category>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);

                    }

					reg = /(?:^|\s)note(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'note>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);

                    }

					reg = /(?:^|\s)class(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'class>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }

//key is a bit odd

					reg = /(?:^|\s)key(?:\s|$)/
                    if (reg.exec(cName)) {
                        var data = x.getAttribute('title');
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'key>'), $.rdf.resource('<'+data+'>'));
                        triples.push(triple1);                            
		                vcards.add(triple1);
                    }

//mailer, uid are normal

					reg = /(?:^|\s)mailer(?:\s|$)/
                    if (reg.exec(cName)) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'mailer>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
		                vcards.add(triple1);
                    }

//rev is odd

					reg = /(?:^|\s)rev(?:\s|$)/
                    if (reg.exec(cName)) {
                        var data = x.getAttribute('title');
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'rev>'), $.rdf.resource('<'+data+'>'));
                        triples.push(triple1);                            
		                vcards.add(triple1);
                    }
                }

            }
       };
    

    
    gleaner = function (options) {
        testForVcardClass();
        alert(triples);
        return triples;        
    },
    
    $.rdf.gleaners.push(gleaner);

})(jQuery);