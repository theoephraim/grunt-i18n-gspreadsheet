'use strict';

var grunt = require('grunt');
var _ = require('underscore');


/*

These tests use the test spreadsheet accessible at https://docs.google.com/spreadsheet/ccc?key=0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c#gid=0
It is read-only to the public.

If you need to add something to it in order to test new features, please contact theozero@gmail.com to get write access to the doc.

*/

exports.i18n_spreadsheet = {
  test_files: function(test) {
    // the "test" row of each spreadsheet has the key of each locale (en.test = "en")
    var test_locales = ['en','es','fr'];
    var types = ['gdocs', 'http', 'local'];
    test.expect( types.length * test_locales.length );
    _(types).each(function(type){
        _(test_locales).each(function(locale){
          var translations = JSON.parse( grunt.file.read('tmp_' + type + '/'+locale+'.js') );
          test.equal( translations['!test'], locale, locale+'.js file should have correct translation from google doc');
        });
    });
    test.done();
  },
  test_default_translations: function(test){
    // the spreasheet has en.hello as empty, but the default translation option should fill it anyway
    var types = ['gdocs', 'http', 'local'];
    test.expect(types.length);
    _(types).each(function(type){
      var translations = JSON.parse( grunt.file.read('tmp_' + type + '/en.js') );
      test.equal( translations.hello, 'hello', 'default translation should get filled from key column');
    });
    test.done();
  }
};
