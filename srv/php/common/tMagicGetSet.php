<?php
/**
 *
 * @author     thomas@0l.fi
 * @version    20200121-Bday!
 *
 * @abstract
 * 
 * Implements pseudo properties and aliases,
 * both with rw management when called outside a class
 *
 *   class Foo {
 *
 *     use \common\tMagicGetSet;
 *
 *     private $_readonly;
 *     private $_writeonly;
 *
 *     public function get_readonly   ()   { return $this->_readonly;  }
 *     public function set_writeonly  ($n) { $this->_writeonly = (int) $n; }
 *     public function set_b64        ($s) { $this->_writeonly = base64_encode( (string) $s); }
 *
 *   }
 *
 * $foo->readonly   acts as read-only  property (outside the class)
 * $foo->writeonly  acts as write-only property (outside the class)
 * $foo->b64        acts as write-only property (outside the class) 
 *
 *
 **/

namespace common;

trait tMagicGetSet {

  /**
   *   __get()
   *   OUTSIDE THE CLASS, redirects $this->key to $this->get_key()
   */
  public function __get($key) {
    $method ="get_$key";
    if( method_exists($this,$method) )
      return $this->$method(); 
  }

  /**
   *   __set()
   *   OUTSIDE THE CLASS: redirects $this->key=$value to $this->set_key($value)
   */
  public function __set($key,$value) {
    $method = "set_$key";
    if( method_exists($this,$method) )
      return $this->$method($value);
  }

}


?>
