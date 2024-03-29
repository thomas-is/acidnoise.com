<?php

require_once('config.php');

/**
 *   autoloader
 **/
spl_autoload_register(
  function ($class) {
    $file = config::DIR_PHP
          . str_replace('\\', DIRECTORY_SEPARATOR, $class)
          . '.php';
    if ( file_exists($file) ) {
      require_once($file);
    } else {
      throw new Exception("[autoloader] file not found: " . $file);
    }
  }
);

?>
