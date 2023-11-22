<?php
require_once('../autoloader.php');
$page = new \cms\page( (string) @$_REQUEST['page']);
header("HTTP/1.1 {$page->code}");
?>
<!DOCTYPE html>
<html lang="<?php echo \config::CMS_HTML_LANG;?>">
<head>
  <meta charset="<?php echo \config::CMS_HTML_CHARSET;?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo \config::CMS_HTML_TITLE;?></title>
  <?php foreach( $page->css as $css): ?>
    <link rel="stylesheet" type="text/css" href="<?php echo $css;?>">
  <?php endforeach; ?>
</head>
<body>
  <header><?php echo $page->header; ?></header>
  <nav>   <?php echo $page->nav;    ?></nav>
  <main>  <?php echo $page->main;   ?></main>
  <aside> <?php echo $page->aside;  ?></aside>
  <footer><?php echo $page->footer; ?></footer>
</body>
<?php foreach( $page->js as $js ): ?>
<script src="<?php echo $js; ?>"></script>
<?php endforeach; ?>
</html>
