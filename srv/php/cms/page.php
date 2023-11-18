<?php

namespace cms;

class page {

  public const HTML_LANG     = \config::CMS_HTML_LANG    ;
  public const HTML_CHARSET  = \config::CMS_HTML_CHARSET ;
  public const HTML_TITLE    = \config::CMS_HTML_TITLE   ;
  public const DIR_STATIC    = \config::CMS_DIR_STATIC   ;
  public const DIR_CSS       = \config::CMS_DIR_CSS      ;
  public const DIR_JS        = \config::CMS_DIR_JS       ;
  public const DIR_PAGES     = \config::CMS_DIR_PAGES    ;
  public array $css = [];
  public array $js  = [];
  public string $header;
  public string $nav;
  public string $main;
  public string $aside;
  public string $footer;
  public int $code = 200;

  public function __construct( string $slug = "" ) {

    if( empty($slug) ) {
      $slug = "index";
    }

    if( ! file_exists(self::DIR_PAGES.$slug.".html") ) {
      $slug = "404";
      $this->code = 404;
    }

    $this->css = self::prefix(
      self::DIR_CSS,
      self::getLines(self::DIR_STATIC.'css.cfg')
    );

    $this->js  = self::prefix(
      self::DIR_JS,
      self::getLines(self::DIR_STATIC.'js.cfg')
    );

    $this->header  = self::load(self::DIR_STATIC.'header.html');
    $this->nav     = self::load(self::DIR_STATIC.'nav.html');
    $this->aside   = self::load(self::DIR_STATIC.'aside.html');
    $this->footer  = self::load(self::DIR_STATIC.'footer.html');
    $this->main    = self::load(self::DIR_PAGES.$slug.".html");

  }

  private static function load( string $filename, bool $strip = false ) {
    $data = (string) @file_get_contents($filename);
    return $strip
      ? str_replace( ["\r", "\n"], '', $data)
      : $data;
  }

  private static function getLines( string $filename ) {
    $lines = [];
    if( ! file_exists($filename) ) {
      return [];
    }
    $fn = fopen($filename,"r");
    while( ($line=fgets($fn)) !== false ) { 
      $lines[] = trim($line);
    }
    return $lines;
  }

  private static function prefix( string $prefix, array $arr ) {
    $items = [];
    foreach( $arr as $item ) {
      $items[] = $prefix . (string) $item;
    }
    return $items;
  }

}



?> 
