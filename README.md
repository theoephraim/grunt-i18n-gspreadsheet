# grunt-i18n-spreadsheet

> Grunt plugin to generate i18n locale files from a google spreadsheet

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-i18n-spreadsheet --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-i18n-spreadsheet');
```

## The "i18n_spreadsheet" task

### Overview
In your project's Gruntfile, add a section named `i18n_spreadsheet` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  i18n_spreadsheet: {
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
Type: `String` (required if doc is private)

The google account (email) to use for authentication. This account must have read access to the spreadsheet you want to pull the translations from.

#### options.google_password
Type: `String` (required if doc is private)

The password for the above google account.

**NOTE:** You should never commit your password into your git repo. Rather you should use an ENV variable. You can also make your spreadsheet publicly accessible (read-only) so no auth is required.

#### options.document_key
Type: `String` (required)

The spreadsheet key. You can get this from the URL while viewing your spreadsheet  
*Example: `https://docs.google.com/spreadsheet/ccc?key=<THE-KEY-IS-THIS-THING>#gid=0`*

#### options.key_column
Type: `String`

The column header for special translation keys. Some explanation:

When using i18n plugins, usually one writes `__('Thing to translate')`. The key in this case is the thing to be translated in the default language. But sometimes for longer items of text, you may want to use a special string. For example, `__('!ABOUT.BIO')`. In your spreadsheet, you can have one column that is used to hold these special keys. This option allows you to enable this feature and set the name the column to use.

**NOTE** Google spreadsheets API alters column headers slightly. It will force all lower case and remove all spaces/special characters. For example "My Column Header!" would become "mycolumnheader". It is recommended to just use a column name in this format already, but if you cannot, you may need to debug a little to figure out the column name that the api is using.

#### options.default_locale
Type: `String` -- Default: `'en'`

A string value to signify which locale is the default - useful in conjunction with the `write_default_translations` option (below).

#### options.write_default_translations
Type: `Boolean` -- Default: `false`

Whether to include default translations or not. Normally the default language translations are used as the translation keys, and most i18n plugins will display this translation key if no translation is found - making it unnecessary to have a file full of redundant pairs like `"About us": "About us"`. This option tells the plugin to write these redundant pairs to the default language file anyway. Might be useful for someone.

#### options.sort_keys
Type: `Boolean` -- Default: `true`

Enable/disable sorting of the translation keys before writing to the file. If false, translations will appear in the same order as they do in the spreadsheet.



### Usage Examples

Most likely, you will just be writing a single set of locale files from a single google spreadsheet, and don't need to set the defaults. For example:

```js
grunt.initConfig({
  i18n_spreadsheet: {
    my_config: {
      options: {
        google_docs: {
          google_account: 'my-username@google.com',
          google_password: 'MySuperSecretPassword',
          document_key: '0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c'
        }
      }
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
