<?php
    include 'vendor/autoload.php';
    $left = explode("\n", preg_replace('/\r\n|\r/', "\n", file_get_contents('a.txt')));
    $right = explode("\n", preg_replace('/\r\n|\r/', "\n", file_get_contents('b.txt')));
    $options = array(
        //'ignoreWhitespace' => true,
        //'ignoreCase' => true,
    );
    $Diff = new \Diff($left, $right, $options);
    /* Initiate the SideBySide or Inline Html renderer */
    $Renderer = new \Diff_Renderer_Html_SideBySide;
    // $Renderer = new \Diff_Renderer_Html_Inline;
?>
<!DOCTYPE HTML>
<html lang="en">
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible" />
        <title>Example - jQuery Merge for php-diff</title>
        <link href="style.css" media="all" rel="stylesheet" type="text/css" />
        <link href="../jquery.phpdiffmerge.min.css" media="all" rel="stylesheet" type="text/css" />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" type="text/javascript"></script>
        <script src="../jquery.phpdiffmerge.min.js" type="text/javascript"></script>
        <script type="text/javascript">
            jQuery(document).ready(function($) {
                $('.Differences').phpdiffmerge({
                    left: left,
                    right: right,
                    pupupResult: true,
                    debug: true,
                    merged: function(a,b,c) {
                        console.log('Merge completed.');
                    }
                });
            });
        </script>
    </head>
    <body>
        <div id="wrap">
            <h2>Hi!</h2>
            <p>This is an example of Xiphes <a href="https://github.com/Xiphe/jQuery-Merge-for-php-diff">jQuery-Merge-for-php-diff</a>, a client side merge tool for Chris Boultons <a href="https://github.com/chrisboulton/php-diff">PHP DIFF</a>.</p>
            <p>You can choose which version of the conflicts you would like to use by clicking on them.<br /> Once the conflicts are resolved you can click "Merge" to see a pup-up of the result.</p>
        </div>
        <?php echo $Diff->render($Renderer); ?>
        <script type="text/javascript">
            var left=<?php echo json_encode($left); ?>;
            var right=<?php echo json_encode($right); ?>;
        </script>
    </body>
</html>