<?php
include('bootloader.php');
$page = new \cms\page(@$_REQUEST['page']);
if( @$page->error == 404 ) 
  header("HTTP/1.1 404");
?>
<!DOCTYPE html>
<html lang="<?php echo \cms\config::HTML_LANG;?>">
<head>
<meta charset="<?php echo \cms\config::HTML_CHARSET;?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo \cms\config::HTML_TITLE;?></title>
<?php foreach( $page->css as $css): ?><link rel="stylesheet" type="text/css" href="<?php echo $css;?>"><?php endforeach; ?>
<?php foreach( $page->js  as $js ): ?><script src="<?php echo $js; ?>"></script><?php endforeach; ?>
</head>
<body>
<header><?php echo $page->header; ?></header>
<nav>   <?php echo $page->nav;    ?></nav>
<main>  <?php echo $page->main;   ?></main>
<aside> <?php echo $page->aside;  ?></aside>
<footer><?php echo $page->footer; ?></footer>
</body>
</html>
