/**
 * Test suite for automatic testing with Rhino. For launching 
 * the test suite in a browser, open index.html instead.
*/

// init simulated browser environment
load("lib/env-js/env.rhino.js");

window.onload = function(){

    // Load jquery, juice and the test runner
    load("jquery/jquery-1.3.2.js");
    load("jquery.uri.js");
    load("jquery.xmlns.js");
    load("jquery.datatype.js");
    load("jquery.curie.js");
    load("jquery.rdf.js");
    load("jquery.rdfa.js");

    load("lib/env-js/testrunner.js");

    //var start = new Date().getTime();

    // Load the tests
	load("tests/jquery.curie.js")


    //var end = new Date().getTime();

    // Display the results
    results();

    //print("\n\nTOTAL TIME : " + (end - start)/1000 + " SECONDS");
};


// load HTML page
window.location = "tests/jquery.alltests.html";
