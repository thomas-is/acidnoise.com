'use strict'

/**
* _control_ links a node property value with an object property value
* node property value must be in [0;1]
* node must have a data-property="foo" to be linked with object.foo
* object value boundaries [min;max] are defined inside a bijection object
**/



class control {

  constructor( object, property ) {
    this.object       = object;
    this.property     = property;
    this.node         = this.object.node.querySelector('[data-property="'+this.property+'"]');
    if( ! this.node ) {
      console.log(this.object);
      console.log(this.node);
      console.log("[WARN] missing property : "+this.property);
    }
    this.bijection = new bijection;

    if( this.node.classList.contains("knob") )
      this.interaction = new interactionKnob(this);

    if( this.node.classList.contains("slider") )
      this.interaction = new interactionSlider(this);

    if( this.node.classList.contains("toggle") )
      this.interaction = new interactionToggle(this);

  }

  // x in [0;1]
  get style()    {
    if( this.node.style.getPropertyValue("--value") == "" )
      this.style = 0;
    return parseFloat(this.node.style.getPropertyValue("--value"));
  }
  set style( x ) { this.node.style.setProperty("--value",x); }

  // y in [min;max] as defined in this.bijection
  get value()    { return this.bijection.y(this.style); }
  set value( y ) {
    this.style = this.bijection.x(y);
    this.object[this.property] = y;
  }

  // update with current object value
  update() { this.value = this.object[this.property]; }

}

class controlBoolean extends control {
  constructor( object, property ) {
    super( object, property );
    this.bijection = new bijectionBoolean;
  }
}
class controlFloat extends control {
  constructor( object, property, min = 0, max = 1, type = 'linear' ) {
    super( object, property );
    switch( type ) {
      case 'invlinear':
        this.bijection = new bijectionLinear(max,min);
        break;
      case 'exp':
        this.bijection = new bijectionExponential(min,max);
        break;
      case 'log':
        this.bijection = new bijectionLogarithmic(min,max);
        break;
      default:
        this.bijection = new bijectionLinear(min,max);
    }
  }
}


class interactionToggle {
  constructor( control ) {
    this.control = control;
    this.control.node.addEventListener( 'click', (ev) => this.click(ev));
  } 
  click(ev) {
    this.control.value =  ! this.control.value;
  }
}

class interactionSlider {
  constructor( control ) {
    this.control = control;
    this.isVertical = this.control.node.classList.contains("vertical");

    this.isActive = false;

    this.control.node.addEventListener('mousedown', (ev) => this.mousedown(ev)  );
    this.control.node.addEventListener('mouseup',   (ev) => this.mouseup(ev)    );
    this.control.node.addEventListener('mousemove', (ev) => this.mouse(ev)      );
    this.control.node.addEventListener('touchstart',(ev) => this.touchstart(ev) );
    this.control.node.addEventListener('touchend',  (ev) => this.touchend(ev)   );
    this.control.node.addEventListener('touchmove', (ev) => this.touch(ev)      );
  }

  get value() {
    return this.control.style;
  }
  set value( x ) {
    // FIXME: default graduation is 8 steps
    x = 8/7 * ( x-0.5) + 0.5;
    // FIXME hard coded precision is 10
    x = Math.round( x*100 )/100;
    if( x < 0    ) x = 0;
    if( x > 1    ) x = 1;
    if( isNaN(x) ) x = 0;
    this.control.value = this.control.bijection.y(x);
  }
  touchstart(ev) {
    this.isActive = true;
  }
  touchend(ev) {
    this.isActive = false;
  }
  touch(ev) {
    if( ! this.isActive )
      return;
    this.value = ( ev.touches[0].pageX - ev.target.offsetLeft ) / ev.target.clientWidth;
  }
  mousedown(ev) {
    this.isActive = true;
    this.mouse(ev);
  }
  mouseup(ev) {
    this.isActive = false;
  }
  mouse(ev) {
    if( ! this.isActive )
      return;
    // prevent touch as mousedown
    if( ev.buttons == 0 )
      return;
    // TODO : if(this.isVertical) ...
    this.value = ( ev.pageX - ev.target.offsetLeft ) / ev.target.clientWidth;
  }
}

class interactionKnob {
  constructor( control ) {
    this.control = control;

    this.isActive = false;

    this.control.node.addEventListener('mousedown', (ev) => this.mousedown(ev)  );
    this.control.node.addEventListener('mouseup',   (ev) => this.mouseup(ev)    );
    this.control.node.addEventListener('mousemove', (ev) => this.mouse(ev)      );
    this.control.node.addEventListener('touchstart',(ev) => this.touchstart(ev) );
    this.control.node.addEventListener('touchend',  (ev) => this.touchend(ev)   );
    this.control.node.addEventListener('touchmove', (ev) => this.touch(ev)      );
  }
  mousedown(ev) {
    this.isActive = true;
    this.mouse(ev);
  }
  mouseup(ev) {
    this.isActive = false;
  }
  mouse(ev) {
    if( ! this.isActive )
      return;
    var pointer = { x: ev.pageX, y: ev.pageY  };
    var center  = { x: ev.target.offsetLeft + ev.target.clientWidth / 2, y: ev.target.offsetTop  + ev.target.clientHeight/ 2 };
    var angle   = Math.atan2(center.y - pointer.y, center.x - pointer.x) * 180 / Math.PI;
    angle = ( angle + 45 + 360 )%360;
    if ( angle > 315)
      angle= 0;
    var x = angle / 270;
    // FIXME hard coded precision is 10
    x = Math.round( x*10 )/10;
    if( x < 0)
      x = 0;
    if( x > 1)
      x = 1;
    this.control.value = this.control.bijection.y(x);
  }
  touchstart(ev) {
    this.isActive = true;
  }
  touchend(ev) {
    this.isActive = false;
  }
  touch(ev) {
    if( ! this.isActive )
      return;
    var pointer = { x: ev.touches[0].pageX, y: ev.touches[0].pageY };
    var center  = { x: ev.target.offsetLeft + ev.target.clientWidth / 2, y: ev.target.offsetTop  + ev.target.clientHeight/ 2 };
    var angle   = Math.atan2(center.y - pointer.y, center.x - pointer.x) * 180 / Math.PI;
    angle = ( angle + 45 + 360 )%360;
    if ( angle > 315)
      angle= 0;
    var x = angle / 270;
    // FIXME hard coded precision is 10
    x = Math.round( x*10 )/10;
    if( x < 0)
      x = 0;
    if( x > 1)
      x = 1;
    this.control.value = this.control.bijection.y(x);
  }
  follow(ev) {
    if( ev.buttons != 1 )
      return;
    var pointer = { x: ev.clientX, y: ev.clientY };
    var center  = { x: ev.target.offsetLeft +ev.target.clientWidth / 2, y: ev.target.offsetTop + ev.target.clientHeight/ 2 };
    var angle   = Math.atan2(center.y - pointer.y, center.x - pointer.x) * 180 / Math.PI;
    angle = ( angle + 45 + 360 )%360;
    if ( angle > 315)
      angle= 0;
    var x = angle / 270;
    // FIXME hard coded precision is 10
    x = Math.round( x*10 )/10;
    if( x < 0)
      x = 0;
    if( x > 1)
      x = 1;
    this.control.value = this.control.bijection.y(x);
  }
}




class bijection {
  constructor( min = 0, max = 1 ) {
    this.min  = min;
    this.max  = max;
  }
  /* default bijection is identity */ 
  y( x ) { return x; }  
  x( y ) { return y; }
  /* scale : [0;1] -> [min;max]  */
  /* unit  : [min;max] -> [0;1]  */
  /* unit o scale = scale o unit = id  */
  scale( x ) { return (this.max - this.min) * x + this.min; }  
  unit( x )  { return ( x - this.min ) / (this.max - this.min); }
  /* exp:  [0;1] <-> [0;1]      */
  /* log:  [0;1] <-> [0;1]      */
  /* log o exp = exp o log = id */
  exp( x ) { return (Math.pow(10,x) - 1) / 9; }  
  log( x ) { return Math.log10( 9*x + 1 );    }
  /* truth: {0,1} -> {false,true} */
  /* gate: {false,true} -> {0,1} */
  /* truth o gate = gate o truth = id */
  truth( x ) { x = Math.round(x); return x == 1; }
  gate( b )  { b ? b=1 : b=0; return b }
}
class bijectionBoolean extends bijection {
  y( x ) { return this.truth(x); }  
  x( y ) { return this.gate(y); }
}
class bijectionLinear extends bijection {
  y( x ) { return this.scale(x); }  
  x( y ) { return this.unit(y);  }
}
class bijectionExponential extends bijection {
  y( x ) { return this.scale(this.exp(x)); }  
  x( y ) { return this.log(this.unit(y));  }
}
class bijectionLogarithmic extends bijection {
  y( x ) { return this.scale(this.log(x)); }  
  x( y ) { return this.exp(this.unit(y));  }
}



