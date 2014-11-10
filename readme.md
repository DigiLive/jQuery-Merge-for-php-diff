jQuery Merge for php-diff
=========================

A client side merge tool for Chris Boultons [PHP DIFF](https://github.com/chrisboulton/php-diff).
[Example](http://xiphe.github.com/jQuery-Merge-for-php-diff/)


Version
-------

THIS IS A BETA RELEASE!  
I had not the time to test this very much so if you rely on this script blindly
you may get some unexpected results.  
You may help me write some tests to be able to check things better.


Usage
-----

This tool requires a side-by-side or inline diff from [php-diff](https://github.com/chrisboulton/php-diff)
and the full content of the compared files as a line-by-line array.

I use something like this on the server side.
Also have a look at the [the php-diff examples](https://github.com/chrisboulton/php-diff/tree/master/example).
```php
$left = explode("\n", preg_replace('/\r\n|\r/', "\n", $THECONTENTOFFILE_A));
$right = explode("\n", preg_replace('/\r\n|\r/', "\n", $THECONTENTOFFILE_B));

$options = array(
    //'ignoreWhitespace' => true,
    //'ignoreCase' => true,
);

/* Initialize the diff class */
$Diff = new \Diff($left, $right, $options);

/* Initiate the SideBySide or Inline Html renderer */
$Renderer = new \Diff_Renderer_Html_SideBySide;
// $Renderer = new \Diff_Renderer_Html_Inline;

/* Render the Diff-table. */
echo $Diff->render($Renderer);

/* Pass $a and $b to javascript */
echo '<script type="text/javascript">var left='.json_encode($left).', right='.json_encode($right).';'</script>
```

And this as initiation on the client side.
Have a look at [this example](http://xiphe.github.com/jQuery-Merge-for-php-diff/).
```javascript
$('.Differences').phpdiffmerge({
    left: left,
    right: right,
    merged: function(merge, left, right) {
    	/* Do something with the merge */
        $.post(
        	'ajax.php',
        	{
        		action: 'merge_completed',
        		merge: merge
        	},
        	function() {
        		console.log('done');
        	}
        );
    }
    /* Use your own "Merge now" button */
    // ,button: '#myButtonId'
    /* uncomment to see the complete merge in a pop-up window */
    // ,pupupResult: true
    /* uncomment to pass additional infos to the console. */
    // ,debug: true
});
```

Playground
----------

In the project folder:
  * Run `npm install`
  * Open a php server `php -S localhost:8080`
  * And open the example page in a browser [localhost:8080/example](http://localhost:8080/example)

In the example folder you can find `a.txt` and `b.txt` where you can change the compared files.  
Inside the `index.php` you can change the DIFF Style from side-by-side to inline and play with the plugin-options.


Options
-------

Can be set by passing an object into the initiation `$('.Differences').phpdiffmerge({option: 'foo'});`.  
Or by passing an options object to an instance of PHPDiffMerge `$('.Differences').phpdiffmerge('option', {option: 'bar'});`.

**left** | _string_: ""  
The full content of the left file as an JavaScript line-by-line array.

**right** | _string_: ""  
The full content of the right file as an JavaScript line-by-line array.

**merged** | _function_: function(result, left, right) {}  
A callback function that is called after the merge has completed.  
all parameters (same as the left and right inputs) are line-by-line arrays
remember to `.join('/n')` them if you want to use them as strings.

**button** | _mixed_ {optional}  
A Selector or element that will be used as trigger for the final merge.
If not set or invalid a button will be generated.

**debug** | _boolean_: false  
Set true to log the steps made while merging into the console.

**pupupResult** | _boolean_: false  
If true a pop-up window with the new merged content will be presented after merge.

**pupupSources** | _boolean_: false  
If true two pup-up windows with the full left and right content will be presented after merge.


Methods
-------

Called as string option on an instance: `$('.Differences').phpdiffmerge('method', <arguments>);`

**useRight**  
Selects the right side of all conflicts.

**useLeft**  
Selects the left side of all conflicts.

**option**
Accepts an object, that will be extended into the current options.

**merge**
The action called by the "Merge" Button 


Special Thanks
--------------

To Chris Boulton for PHP-DIFF and mentioning this project in it's readme.  
To Robert and Martin from jimdo.com for reviewing this plugin and giving me some verry useful hints.


Changelog
---------

### 0.2.2
+ Add _id to PHPDiffMerge instances to make them comparable by QUnits deepEqual

### 0.2.1
+ bugfixes for multiline and inline issues
+ new example/sandbox

### 0.2
+ complete refactoring of the plugin structure.

### 0.1
+ initial release


Todo
----

+ write tests.
+ spellcheck please, im not native english as you may have noticed ;)


License
-------

[MIT](https://raw.github.com/Xiphe/jQuery-Merge-for-php-diff/master/LICENSE)