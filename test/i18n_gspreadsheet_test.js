'use strict';

var grunt = require('grunt');
var _ = require('underscore');


/*

These tests use the test spreadsheet accessible at https://docs.google.com/spreadsheet/ccc?key=0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c#gid=0
It is read-only to the public.

If you need to add something to it in order to test new features, please contact theozero@gmail.com to get write access to the doc.

*/

exports.i18n_gspreadsheet = {
  test_files: function(test) {
    // the "test" row of the google doc has the key of each locale (en.test = "en")
    var test_locales = ['en','es','fr'];
    test.expect( test_locales.length );
    _(test_locales).each(function(locale){
      var translations = JSON.parse( grunt.file.read('tmp/'+locale+'.js') );
      test.equal( translations.test, locale, locale+'.js file should have correct translation from google doc');
    });
    test.done();
  },
  test_default_translations: function(test){
    // the google doc has en.hello as empty, but the default translation option should fill it anyway
    test.expect(1);
    var translations = JSON.parse( grunt.file.read('tmp/en.js') );
    test.equal( translations.hello, 'hello', 'default translation should get filled from key column');
    test.done();
  }
};
