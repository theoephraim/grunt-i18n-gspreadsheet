/*
 * grunt-i18n-gspreadsheet
 * https://github.com/theoephraim/grunt-i18n-gspreadsheet
 *
 * Copyright (c) 2013 Theo Ephraim
 * Licensed under the MIT license.
 */

'use strict';

var GoogleSpreadsheet = require("google-spreadsheet");
var Step = require('step');
var _ = require('underscore');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var prompt = require('prompt');

module.exports = function(grunt) {


  function sortObjectByKeys(map) {
    var keys = _.sortBy(_.keys(map), function(a) { return a.toLowerCase(); });
    var newmap = {};
    _.each(keys, function(k) {
      newmap[k] = map[k];
    });
    return newmap;
  }


  grunt.registerMultiTask('i18n_gspreadsheet', 'Grunt plugin to generate i18n locale files from a google spreadsheet', function() {

    // default options
    var options = this.options({
      output_dir: 'locales',
      ext: '.js',
      default_locale: 'en',
      use_default_on_missing: false,
      write_default_translations: false,
      sort_keys: true,
      use_all_worksheets: false,
      worksheet_id: 1,
      use_worksheet_namespacing: false,
      prevent_conflicts: true
    });

    var regex_filter = grunt.option('regex-filter');
    if (regex_filter) {
      regex_filter = new RegExp(regex_filter);
    }

    // make this task async
    var done = this.async();

    var locales = [];
    var translations = {};
    var worksheets = {};
    var gsheet = new GoogleSpreadsheet( options.document_key );
    var output_dir = path.resolve( process.cwd() + '/' + options.output_dir );

    Step(
      function setAuth(){
        var step = this;
        if ( options.google_account && options.google_password ){
          gsheet.setAuth( options.google_account, options.google_password, this );
        } else if (options.prompt_auth) {
          prompt.start();
          prompt.get({
            properties: {
              account: {
                description: 'Enter your google account name (username)',
                required: true
              },
              password: {
                description: 'Enter your google account password (hidden)',
                required: true,
                hidden: true
              }
            }
          }, function(err, result) {
            if (err) {
              grunt.log.error(err);
              return done(false);
            }

            gsheet.setAuth(result.account, result.password, step);
          });
        } else {
          this();
        }
      },
      function fetchSheetInfo(err){
        if ( err ){
          grunt.log.error('Invalid google credentials for "' + options.google_account + '"');
          return done( false );
        }
        gsheet.getInfo( this );
      },
      function fetchRowData(err, info){
        if ( err ){
          grunt.log.error('Error getting sheet info');
          return done( false );
        }
        worksheets = info.worksheets;
        grunt.log.writeln( 'Found ' + worksheets.length + ' worksheets');
        var group = this.group();
        if ( options.use_all_worksheets ) {
          // Get rows from all worksheets
          for( var i=1; i <= worksheets.length; i++){
            gsheet.getRows( i, group() );
          }
        } else {
          gsheet.getRows( options.worksheet_id, group() );
        }
      },
      function buildTranslationJson(err, sheets){
        if ( err ){
          grunt.log.error( err );
          return done( false );
        }
        sheets.forEach(function(rows, ind, arr){
          var sheetTitle = '';
          if ( options.use_all_worksheets ) {
            sheetTitle = worksheets[ind].title;
          } else {
            sheetTitle = worksheets[options.worksheet_id - 1].title;
          }
          grunt.log.writeln('Processing worksheet: ' + sheetTitle);
          if ( rows.length === 0 ){
            grunt.log.error('ERROR: no translations found in sheet');
            grunt.log.error(rows);
            return done( false );
          }

          // First determine which locales are supported
          var gsheet_keys = _(rows[0]).keys();
          _(gsheet_keys).each(function(locale){
            if ( locale != 'id' && locale.length == 2 ){
              if(locales.indexOf(locale) == -1) {
                locales.push( locale );
                translations[locale] = {};
              }
              if (regex_filter) {
                try {
                  translations[locale] = JSON.parse(fs.readFileSync(output_dir + '/' + locale + options.ext));
                }
                catch (e) {}
              }
            }
          });

          grunt.log.writeln( 'Found '+ rows.length.toString().cyan +' translations in ' + locales.length.toString().cyan + ' languages' );

          // read all translations into an object with the correct keys
          _(rows).each(function(row){
            // if an key override column is set, check that first, then use the default locale

            var use_key_override = options.key_column && row[options.key_column];
            var translation_key = use_key_override ? row[options.key_column] : row[options.default_locale];
            if ( !translation_key ) return;
            if (regex_filter && !regex_filter.test(translation_key)) return;

            if(options.use_worksheet_namespacing){
              translation_key = sheetTitle + '-' + translation_key;
            }

            _(locales).each(function(locale){
              if( options.prevent_conflicts && translations[locale][translation_key]){
                grunt.log.error('ERROR: duplicated / conflicting content found in ' + sheetTitle + ': ' + locale + ' - ' + translation_key);
                return done( false );
              }

              if ( locale == options.default_locale ){
                if ( use_key_override || options.write_default_translations ){
                  translations[locale][translation_key] = row[locale];
                }
              } else if ( row[locale] ) {
                translations[locale][translation_key] = row[locale];
              } else if ( options.use_default_on_missing ){
                translations[locale][translation_key] = row[options.default_locale];
              }
            });
          });
        });

        this();
      },
      function ensureDirectoryExists(err){
        if ( err ) {
          grunt.log.error( err );
          return done( false );
        }

        mkdirp( output_dir, this );
      },
      function writeLocaleFiles(err){
        if ( err ) {
          grunt.log.error( err );
          return done( false );
        }

        var step = this;
        _(locales).each(function(locale){
          var file_path = output_dir + '/' + locale + options.ext;
          if ( options.sort_keys ) translations[locale] = sortObjectByKeys( translations[locale] );
          var translation_json = JSON.stringify( translations[locale], null, ' ' );
          var write_options = {
            flags: 'w+'
          };
          fs.writeFile( file_path, translation_json, write_options, step.parallel() );
        });
      },
      function finish(err){
        if ( err ){
          grunt.log.error( err );
          return done( false );
        }

        grunt.config(['i18n_gspreadsheet','data','locales'], locales);
        grunt.log.writeln( 'Wrote translation files: ' + locales.toString().magenta );
        done();
      }
    );
  });

};