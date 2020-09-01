<?php

namespace cms;

class page {

  use \common\tMagicGetSet;

  private $_css = array();
  private $_js  = array();
  private $_header;
  private $_nav;
  private $_main;
  private $_aside;
  private $_footer;
  private $_error;

  private $_source;

  public function __construct( $slug = false ) {
    $this->_source = new dataSourceFiles();
    $data = $this->_source->get( $slug );

    $this->_css = $this->_prefix(config::DIR_CSS,@$data['css']);
    $this->_js  = $this->_prefix(config::DIR_JS,@$data['js']);
    $this->_header = @$data['header'];
    $this->_nav    = @$data['nav'];
    $this->_aside  = @$data['aside'];
    $this->_footer = @$data['footer'];
    $this->_main   = @$data['main'];

    $this->_error  = @$data['error'];

  }

  public function get_css()     { return $this->_css;    }
  public function get_js()      { return $this->_js;     }
  public function get_header()  { return $this->_header; }
  public function get_nav()     { return $this->_nav;    }
  public function get_main()    { return $this->_main;   }
  public function get_aside()   { return $this->_aside;  }
  public function get_footer()  { return $this->_footer; }
  public function get_error()   { return $this->_error;  }

  private function _prefix( $prefix, $arr = array() ) {
    if( empty($arr) ) return array();
    $items = array();
    foreach( $arr as $item )
      $items[] = $prefix.$item;
    return $items;
  }

}



?> 
