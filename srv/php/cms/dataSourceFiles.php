<?php


namespace cms;

/**
 *
 * TODO: revamp
 * class not needed
 * could be static
 *
 * */
class dataSourceFiles {

  public function get( $slug ) {

    if( ! $slug )
      $slug = "index";

    $data = array();

    if( ! file_exists(config::DIR_PAGES.$slug.".html") ) {
      $slug = "404";
      $data['error'] = 404;
    }

    $data['css']     = $this->_parseLines(config::DIR_STATIC.'css.cfg');
    $data['js']      = $this->_parseLines(config::DIR_STATIC.'js.cfg');
    $data['header']  = $this->_load(config::DIR_STATIC.'header.html');
    $data['nav']     = $this->_load(config::DIR_STATIC.'nav.html');
    $data['aside']   = $this->_load(config::DIR_STATIC.'aside.html');
    $data['footer']  = $this->_load(config::DIR_STATIC.'footer.html');

    $data['main']    = $this->_load(config::DIR_PAGES.$slug.".html");

    return $data;
  }

  private function _load( $filename, $strip = false ) {
    $data = @file_get_contents($filename);
    if( ! $data )
      return "";
    if ( $strip )
      $data = str_replace(array("\r", "\n"), '', $data);
    return $data;
  }

  private function _parseLines( $filename ) {
    $lines = array();
    if( ! file_exists($filename) )
      return false;
    $fn = fopen($filename,"r");
    while( ($line=fgets($fn)) !== false ) 
      $lines[] = trim($line);  
    return $lines;
  }

}

?>
