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
                
                var descendants = c.getElementsByTagName('*');
                for (var k = 0; k < descendants.length; k++) {
                    var x = descendants[k];
                    var cName = x.className;
                    if (cName.indexOf('fn')!=-1) {
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'fn>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

//object here would be the name object
                    var nameNode;


                    if (cName.indexOf('n')!=-1) {
                        var fn = x.textContent;
                        nameNode = $.rdf.blank("[]");
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
                        var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));
                        triples.push(triple1);
                        triples.push(triple2);

                    }

//these are all properties of the name object

                    if(cName.indexOf('given-name')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'given-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
                    if(cName.indexOf('family-name')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'family-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
                    if(cName.indexOf('additional-name')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'additonal-name>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
                    if(cName.indexOf('honorific-prefix')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-prefix>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
                    if(cName.indexOf('honorific-suffix')!=-1){
                       var fn = x.textContent;
                       var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-suffix>'), $.rdf.literal('"'+fn+'"'));
                       triples.push(triple1);
                    }

//end name object

                    if(cName.indexOf('nickname')!=-1){
                       var fn = x.textContent;
                       var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'nickname>'), $.rdf.literal('"'+fn+'"'));
                       triples.push(triple1);
                    }

//url is a resource if it has http:// in it

                    if(cName.indexOf('url')!=-1){
                       var fn = x.textContent;
                       if(fn.indexOf('http://')==-1){
                           var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'nickname>'), $.rdf.literal('"'+fn+'"'));
                           triples.push(triple1);
                       } else {
                           var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'nickname>'), $.rdf.resource('<'+fn+'>'));
                           triples.push(triple1);                           
                       }
                    }
//email, tel, addr,  are trickier
/*
e.g.
  <a class="email" href="mailto:neuroNOSPAM@t37.net">
     <span class="type">pref</span><span>erred email</span>
  </a>
*/  
                    if(cName.indexOf('email')!=-1){
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

                    if(cName.indexOf('tel')!=-1){
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
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.resource('<tel:'+val+'>'));
                                triples.push(triple1);

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


                    if(cName.indexOf('adr')!=-1){
                        var adrDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < adrDescendants.length; j++) {
                            var y=adrDescendants[j];
                            var val=y.textContent;
                            var prop= y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);

                        }
                    }

//label is easy

                    if(cName.indexOf('label')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'label>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

//geo bt more complex

/*

  <span class="geo">
     <abbr class="latitude" title="48.816667">N 48¡ 81.6667</abbr>
     <abbr class="longitude" title="2.366667">E 2¡ 36.6667</abbr>
  </span>

*/

                    if(cName.indexOf('geo')!=-1){
                        var geoDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < geoDescendants.length; j++) {
                            var y = geoDescendants[j];
                            var val = y.textContent;
                            var prop = y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);

                        }
                    }



//tz, photo, logo, sound, are straightforward

                    if(cName.indexOf('tz')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'tz>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }


                    if(cName.indexOf('photo')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'photo>'), $.rdf.resource('<'+fn+'>'));
                        triples.push(triple1);
                    }

                    if(cName.indexOf('logo')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'logo>'), $.rdf.resource('<'+fn+'>'));
                        triples.push(triple1);
                    }

                    if(cName.indexOf('sound')!=-1){
                       var fn = x.textContent;
                       var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'sound>'), $.rdf.resource('<'+fn+'>'));
                       triples.push(triple1);
                    }

//bday is odd

/*

    <div class="bday">
    <dt>Birthday</dt>
    <dd>
        <abbr class="value" title="1985-10-27T00:00:00Z">October 27, 1985</abbr>
    </dd>
    </div>

*/


                    if(cName.indexOf('bday')!=-1){
                        var bdayDescendants = x.getElementsByTagName('*');
                        for (var j = 0; j < bdayDescendants.length; j++) {
                            var y = bdayDescendants[j];
                            var val = y.getAttribute("title");
                            var prop = y.className;
                            var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
                            triples.push(triple1);

                        }
                    }



//title, role are ok

                    if(cName.indexOf('title')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'title>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
                        
                    if(cName.indexOf('role')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'role>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }
 
//org is trickier


                    if(cName.indexOf('geo')!=-1){
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
                                subnodes=true;
                            }
                        }
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'org>'), orgNode);
                        var triple2 = $.rdf.triple(orgNode, $.rdf.type, $.rdf.resource('<' + v + 'Organization>')); //should check if it has a name
                        triples.push(triple1);
                        triples.push(triple2);
                        if(!subnodes){
                            var fn = x.textContent;
                            var triple4 = $.rdf.triple(orgNode, $.rdf.resource('<' + v + 'role>'), $.rdf.literal('"'+fn+'"'));
                            triples.push(triple4);
                        }
                        
                    }



//category note class are ok

                    if(cName.indexOf('category')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'category>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

                    if(cName.indexOf('note')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'note>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

                    if(cName.indexOf('class')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'class>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

//key is funny

                    if(cName.indexOf('key')!=-1){
                        var data = x.getAttribute('title');
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'key>'), $.rdf.resource('<'+data+'>'));
                        triples.push(triple1);                            
                    }

//mailer, uid are normal

                    if(cName.indexOf('mailer')!=-1){
                        var fn = x.textContent;
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'mailer>'), $.rdf.literal('"'+fn+'"'));
                        triples.push(triple1);
                    }

//rev is funny

                    if(cName.indexOf('rev')!=-1){
                        var data = x.getAttribute('title');
                        var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'rev>'), $.rdf.resource('<'+data+'>'));
                        triples.push(triple1);                            
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