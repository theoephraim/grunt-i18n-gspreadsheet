/*
 * grunt-i18n-spreadsheet
 * https://github.com/theoephraim/grunt-i18n-spreadsheet
 *
 * Copyright (c) 2013 Theo Ephraim
 * Licensed under the MIT license.
 */

'use strict';

var Step = require('step');
var _ = require('underscore');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var csv = require("csv");

module.exports = function(grunt) {

  function loadGoogleSpreadSheet(options, parentStep) {
    var GoogleSpreadsheet = require("google-spreadsheet");
    var gsheet = new GoogleSpreadsheet( options.document_key );
    Step(
      function setAuth(){
          if ( options.google_account && options.google_password ){
            gsheet.setAuth( options.google_account, options.google_password, this );
          } else {
            this();
          }
        },
        function fetchSheetInfo(err){
          if ( err ){
            grunt.log.error('Invalid google credentials for "' + options.google_account + '"');
            parentStep(err);
          }
          gsheet.getRows( 1, parentStep );
        }
      );
  }

  function loadHttpCSVSpreadSheet(options, parentStep){
    Step(
      function fetchSheetInfo() {
        var request = require('request');
        request(options, this);
      },
      function parseSheet(err, response, body) {
        if ( err ) {
          grunt.log.error('Error fetch ' + options.url + '"');
          parentStep (err);
        }
        csv().from.string(body).to.array(function(rows){
          parentStep (false, normalizeCSV(rows));
        });
      }
    );
  }

  function loadLocalCSVSpreadsheet(options, parentStep){
    csv().from.path(options.src).to.array(function(rows){
      parentStep (false, normalizeCSV(rows));
    });
  }

  function normalizeCSV(csv){
    var out = [];
    var keys = [];

    for (var k = 0; k < csv[0].length; k++){
      keys.push(csv[0][k]);
    }
    for (var r = 1; r < csv.length; r++){
      var row = csv[r];
      var o = {};
      for (var c = 0; c < row.length; c++){
        o[c < keys.length ? keys[c] : "col" + c] = row[c];
      }
      out.push(o);
    }
    return out;
  }
  
  function sortObjectByKeys(map) {
    var keys = _.sortBy(_.keys(map), function(a) { return a.toLowerCase(); });
    var newmap = {};
    _.each(keys, function(k) {
        newmap[k] = map[k];
    });
    return newmap;
  }


  grunt.registerMultiTask('i18n_spreadsheet', 'Grunt plugin to generate i18n locale files from a google spreadsheet', function() {

    // default options
    var options = this.options({
      output_dir: 'locales',
      default_locale: 'en',
      write_default_translations: false,
      sort_keys: true
    });

    // make this task async
    var done = this.async();
    
    var locales = [];
    var translations = {};
    var output_dir = path.resolve( process.cwd() + '/' + options.output_dir );

    Step(
      function loadSpreadSheet(){
        if (options.google_docs !== undefined){
          loadGoogleSpreadSheet(options.google_docs, this);
        } else if (options.http !== undefined){
          loadHttpCSVSpreadSheet(options.http, this);
        }else {
          loadLocalCSVSpreadsheet(options.local, this);
        }
      },
      function buildTranslationJson(err, rows){
        if ( err ){
          grunt.log.error( err );
          return done( false );
        }
        if ( rows.length === 0 ){
          grunt.log.error('ERROR: no translations found in sheet');
          return done( false );
        }
              
        // First determine which locales are supported
        var gsheet_keys = _(rows[0]).keys();
        _(gsheet_keys).each(function(locale){
          if ( locale != 'id' && locale.length == 2 ){
            locales.push( locale );
            translations[locale] = {};
          }
        });

        grunt.log.writeln( 'Found '+ rows.length.toString().cyan +' translations in ' + locales.length.toString().cyan + ' languages' );

        // read all translations into an object with the correct keys
        _(rows).each(function(row){
          // if an key override column is set, check that first, then use the default locale
          
          var use_key_override = options.key_column && row[options.key_column];
          var translation_key = use_key_override ? row[options.key_column] : row[options.default_locale];
          if ( !translation_key ) return;
          _(locales).each(function(locale){

            if ( locale == options.default_locale ){
              if ( use_key_override || options.write_default_translations ){
                translations[locale][translation_key] = row[locale];
              }
            } else if ( row[locale] ) {
              translations[locale][translation_key] = row[locale];
            }
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
          var file_path = output_dir + '/' + locale + '.js';
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

        grunt.log.writeln( 'Wrote translation files: ' + locales.toString().magenta );
        done();
      }
    );
  });

};