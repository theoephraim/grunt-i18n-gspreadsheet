# grunt-i18n-gspreadsheet

> Grunt plugin to generate i18n locale files from a google spreadsheet

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-i18n-gspreadsheet --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-i18n-gspreadsheet');
```

## The "i18n_gspreadsheet" task

### Overview
In your project's Gruntfile, add a section named `i18n_gspreadsheet` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  i18n_gspreadsheet: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.google_account
Type: `String`
Default value: null

The google account (email) to use for authentication. This account must have read access to the spreadsheet you want to pull the translations from.

#### options.google_password
Type: `String`
Default value: null

The password for the above google account.

**NOTE:** You should never commit your password into your git repo. Rather you should use an ENV variable. You can also make your spreadsheet publicly accessible (read-only) so no auth is required.

#### options.document_key
Type: `String`
Default value: null

The spreadsheet key. You can get this from the URL while viewing your spreadsheet  
*Example: `https://docs.google.com/spreadsheet/ccc?key=<THE-KEY-IS-THIS-THING>#gid=0`*

#### options.key_column
Type: `String`
Default value: `'key'`

The column header for the translation keys.

When using i18n plugins, usually one writes `__('Thing to translate')`. In your spreadsheet, one of your columns will hold all of these translation keys. This option allows you to override the name of this column.

**NOTE** Google spreadsheets API alters column headers slightly. It will force all lower case and remove all spaces. It is recommended to just use a column name in this format already, but if you cannot, you may need to debug a little to figure out the column name that the api is using.

#### options.default_locale
Type: `String`
Default value: `'en'`

A string value to signify which locale is the default - useful in conjunction with the `write_default_translations` option (below).

#### options.write_default_translations
Type: `Boolean`
Default value: `true`

Whether to write default translations or not. This is useful because most of the time, the default language translation is used as the translation key. But occasionally for some longer text items, you may wish to keep the key as key instead of text. This option lets you leave the default locale column (`en` by default) blank, but the translations will still end up in your `en.js` translation file. Most i18n plugins will default to use the translation key if no translation is found, but this may be useful in some cases.

### Usage Examples

Most likely, you will just be writing a single set of locale files from a single google spreadsheet, and don't need to set the defaults. For example:

```js
grunt.initConfig({
  i18n_gspreadsheet: {
    options: {
      google_account: 'my-username@google.com',
      google_password: 'MySuperSecretPassword',
      document_key: '0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c'
    }
  },
})
```

### Spreadsheet Format

Each locale must have a column name that is 2 letters long (for example: 'en', 'es', 'fr'). The main key column should by default have a title of `key`, but this can be overridden using the `key_column` option. You may include other columns in your spreadsheet if you wish -- they will be ignored. This can be useful for notes and grouping things together by where they are being used in your site.

See [the testing example](https://docs.google.com/spreadsheet/ccc?key=0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c#gid=0) for a clear example.

**NOTE** This plugin will have problems if you need to use indonesian translations because its locale code is `id` and google spreadsheets API returns a column called `id` by default. This has not been tested or verified...


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.0.1 -- Initial release
