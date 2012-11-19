jQuery Merge for php-diff
=========================

A jQuery plugin for handling the conflicts between two documents.
Requires [php-diff](https://github.com/chrisboulton/php-diff) on the server side.


Version
-------

0.1

THIS IS A BETA RELEASE!  
I had not the time to test this very much so if you rely on this script blindly
you may get some unexpected results.  
You may help me write some tests to be able to check things better.


Usage
-----

This tool requires a side-by-side or inline diff from [php-diff](https://github.com/chrisboulton/php-diff)
and the full content of the compared files as a line-by-line array.

I use something like this on the server side.
Also have a look at [the php-diff examples](https://github.com/chrisboulton/php-diff/tree/master/example).
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
echo '<script type="text/javascript">var left='.json_encode($left).', left='.json_encode($right).';'</script>
```

And this as initiation on the client side.
Also have a look at [the examples](https://github.com/Xiphe/jQuery-Merge-for-php-diff/tree/master/example).
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
    },
    /* Use your own "Merge now" button */
    // ,button: '#myButtonId'
    /* uncomment to see the complete merge in a pop-up window */
    // ,pupupResult: true
    /* uncomment to pass additional infos to the console. */
    // ,debug: true
});
```


Configuration
-------------

A javascript object can be passed as a user configuration. Here are the possible keys
explained.

**left** | _string_: ""  
The full content of the left file as an javascript line-by-line array.

**right** | _string_: ""  
The full content of the right file as an javascript line-by-line array.

**merged** | _function_: function(merge, left, right) {}  
A callback function that is called after the merge has completed.

**button** | _mixed_ {optional}  
A Selector or element that will be used as trigger for the final merge.
If not set or invalid a button will be generated.

**debug** | _boolean_: false  
If true additional infos will be passed to the console.

**pupupResult** | _boolean_: false  
If true a pop-up window with the new merged content will be presented after merge.

**pupupSources** | _boolean_: false  
If true two pup-up windows with the full left and right content will be presented after merge.


Methods
-------

**useRight()**  
Selects the right side of all conflicts.

**useLeft()**  
Selects the left side of all conflicts.


Support
-------

I've written this project for my own needs so i am not willing to give
full support. Anyway, i am very interested in any bugs, hints, requests
or whatever. Please use the [github issue system](https://github.com/Xiphe/jQuery-Merge-for-php-diff/issues)
and i will try to answer.


Props
-----

The example shows a side-by-side diff from php-diff so the ´a.txt´, ´b.txt´ and ´style.css´ in the 
example folder are from that project.
Thank you Chris Boulton for this beautiful tool.


Changelog
---------

### 0.1
+ initial release


Todo
----

+	build tests.
+ spellcheck please, im not native english as you may have noticed ;)


License
-------

Copyright (C) 2012 Hannes Diercks

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.