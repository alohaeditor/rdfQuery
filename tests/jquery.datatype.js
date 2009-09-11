/*
 * jquery.datatypes.js unit tests
 */
(function($){

var xsdNs = "http://www.w3.org/2001/XMLSchema#";

module("Errors");

test("an unrecognised datatype", function() {
  try {
    var v = $.typedValue(' true ', 'http://www.w3.org/2001/XMLSchemaboolean'); // note missing #
    ok(true, 'it should not throw an error');
    equals(v.representation, ' true ');
    equals(v.datatype, 'http://www.w3.org/2001/XMLSchemaboolean');
    equals(v.value, 'true');
  } catch (e) {
    ok(false, 'it should not throw an error');
  }  
});

module("XML Schema datatypes");

test("a boolean value", function() {
  var v = $.typedValue('true', xsdNs + 'boolean');
  equals(v.value, true);
  equals(v.representation, 'true');
  equals(v.datatype, xsdNs + 'boolean');
});

test("a double value", function() {
  var v = $.typedValue('1.0e0', xsdNs + 'double');
  equals(v.value, 1.0);
  equals(v.representation, '1.0e0');
  equals(v.datatype, xsdNs + 'double');
});

test("an invalid duration", function() {
  try {
    var v = $.typedValue('P', xsdNs + 'duration');
    ok(false, "should raise an error");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(true, "should raise an error");
    } else {
      throw e;
    }
  }
});

test("a standard dateTime", function() {
  var v = $.typedValue('2008-10-05T21:02:00Z', xsdNs + 'dateTime');
  equals(v.value, '2008-10-05T21:02:00Z');
  equals(v.representation, '2008-10-05T21:02:00Z');
  equals(v.datatype, xsdNs + 'dateTime');
});

test("a dateTime with a timezone", function() {
  var v = $.typedValue('2008-10-05T21:02:00-05:00', xsdNs + 'dateTime');
  equals(v.value, '2008-10-05T21:02:00-05:00');
  equals(v.representation, '2008-10-05T21:02:00-05:00');
  equals(v.datatype, xsdNs + 'dateTime');
});

test("a dateTime with an invalid timezone", function() {
  try {
    $.typedValue('2008-10-05T21:02:00-15:00', xsdNs + 'dateTime');
    ok(false, "should throw an error");
  } catch (e) {
    equals(e.name, 'InvalidValue');
  }
});

test("a dateTime with a bad number of days in a month", function() {
  try {
    $.typedValue('2009-02-29T21:02:00', xsdNs + 'dateTime');
    ok(false, "should be an error");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(true, "should raise an error");
    } else {
      throw e;
    }
  }
});

test("a valid dateTime on a leap year", function() {
  try {
    $.typedValue('2008-02-29T21:02:00', xsdNs + 'dateTime');
    ok(true, "should not be an error");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(false, "should not raise an error");
    } else {
      throw e;
    }
  }
});

test("an invalid dateTime on a year divisible by 100", function() {
  try {
    $.typedValue('1990-02-29T21:02:00', xsdNs + 'dateTime');
    ok(false, "should be an error");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(true, "should raise an error");
    } else {
      throw e;
    }
  }
});

test("a valid dateTime on a leap year divisible by 400", function() {
  try {
    $.typedValue('2008-02-29T21:02:00', xsdNs + 'dateTime');
    ok(true, "should not be an error");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(false, "should not raise an error");
    } else {
      throw e;
    }
  }
});

test("a valid date with whitespace around it", function() {
  try {
    var date = $.typedValue(' 2009-07-13 ', xsdNs + 'date');
    ok(true, "should not be an error");
    equals(date.value, "2009-07-13");
  } catch (e) {
    if (e.name === 'InvalidValue') {
      ok(false, "should not raise an error");
    } else {
      throw e;
    }
  }
});

})(jQuery);