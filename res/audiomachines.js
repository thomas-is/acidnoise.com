/**
 * The bufferNoise function comes from noisehack.com
 * https://noisehack.com/generate-noise-web-audio-api/
 **/
function bufferNoise ( type, duration = 10 ) {
  var size      = audioContext.sampleRate * duration;
  var nChannels = 2;
  var buffer    = audioContext.createBuffer(nChannels, size, audioContext.sampleRate);
  switch( type ) {
    case "pink":
      var white;
      var b0, b1, b2, b3, b4, b5, b6;
      for( var channel = 0; channel < nChannels; channel++) {
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (var i = 0; i < size; i++) {
          white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          buffer.getChannelData(channel)[i]= b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          buffer.getChannelData(channel)[i]*= 0.11; 
          b6 = white * 0.115926;
        }
      }
      break;
    case "brown":
      var white;
      var lastOut;
      for( var channel = 0; channel < nChannels; channel++) {
        lastOut = 0.0;
        for (var i = 0; i < size; i++) {
          white = Math.random() * 2 - 1;
          buffer.getChannelData(channel)[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = buffer.getChannelData(channel)[i];
          buffer.getChannelData(channel)[i] *= 3.5;
        }
      }
      break;
    case "white":
    default:
      for( var channel = 0; channel < nChannels; channel++) {
        for (var i = 0; i < size; i++) 
          buffer.getChannelData(channel)[i] = ( Math.random() * 2 - 1 ) * .5; // reduce gain
      }
      break;
  }
  return buffer;
}


/**
 *
 * MIT License
 * 
 * Copyright (c) 2020 Thomas Issa-Sayegh (thomas@0l.fi)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 **/

'use strict'

document.addEventListener( "DOMContentLoaded", () => boot() );

var audioContext;
var master;
var rack = [];

function boot() {

  audioContext = new( window.AudioContext || window.webkitAudioContext )();
  master = new masterControl;

  var nodes = document.querySelectorAll("[data-machine]");
  var n = 0;
  while( nodes[n] ) {
    switch(nodes[n].dataset.machine) {
      case 'wip':
        rack.push(new boxWIP(nodes[n]));
        break;
      case 'lpf-noise':
        rack.push(new boxLPFNoise(nodes[n]));
        break;
      case 'white-noise':
        rack.push(new boxWhiteNoise(nodes[n]));
        break;
      case 'pink-noise':
        rack.push(new boxPinkNoise(nodes[n]));
        break;
      case 'brown-noise':
        rack.push(new boxBrownNoise(nodes[n]));
        break;
      case 'binaural-harmonics':
        rack.push(new boxBinauralHarmonics(nodes[n]));
        break;
      case 'binaural-modulation':
        rack.push(new boxBinauralModulation(nodes[n]));
        break;
      case 'noise-harmonics':
        rack.push(new boxNoiseHarmonics(nodes[n]));
        break;
      default:
        console.log("unknown machine : "+nodes[n].dataset.machine);
    }
    n++;
  }
}



class masterControl {

  constructor() {
    this.node = document.querySelector('#master');
    if( ! this.node )
      return;
    audioContext.onstatechange = () => this.update();
    this.stateCtrl  = new controlBoolean(this,'state');
    this.powerCtrl  = new controlBoolean(this,'power');
  }

  get state()  { return audioContext.state == "running"; }
  set state(b) { }
  get power()  { return this.state; }
  set power(b) { b ? audioContext.resume() : audioContext.suspend(); }

  update() {
    this.stateCtrl.update();
    this.powerCtrl.update();
    var n = 0;
    while( rack[n] ) {
      rack[n].stateCtrl.update();
      n++;
    }
  }

}



class box {

  constructor( node ) {
    this.node = node;

    this.master = audioContext.createGain();
    this.master.gain.value = 0;

    this.isStarted = false;

    this.stateCtrl  = new controlBoolean(this,'state');
    this.powerCtrl  = new controlBoolean(this,'power');
    this.masterCtrl = new controlFloat(this,'level',0,1,'exp');

    this.masterCtrl.value = 0.1;
    this.powerCtrl.value = false;

  }
  start() { audioContext.resume().then( this.isStarted = true ); }

  get level() {
    if( this.isMuted )
      return 0;
    return this.master.gain.value;
  }
  set level( x ) {
    if( ! this.isMuted )
      this.master.gain.linearRampToValueAtTime(x,audioContext.currentTime + 0.5);
  }
  get state()  { return (! this.isMuted) && (audioContext.state == "running"); }
  set state(x) { } 
  get power()  { return ! this.isMuted; }
  set power(x) {
    if( ! this.isStarted )
      this.start();
    if( x ) {
      this.isMuted = false;
      this.level = this.masterCtrl.value;
    } else {
      this.level = 0;
      this.isMuted = true;
    }
    this.stateCtrl.update();
  }

}

class boxLPFNoise extends box {

  constructor( node ) {
    super(node);

    this.noise  = audioContext.createBufferSource();
    this.filter = audioContext.createBiquadFilter();
    this.tremolo = new effectTremolo;

    this.noise.buffer = bufferNoise("white",10);
    this.noise.loop   = true;

    this.noise.connect(  this.filter );
    this.filter.connect( this.tremolo.input );
    this.tremolo.output.connect( this.master );
    this.master.connect( audioContext.destination );

    this.noise.start();
    this.isStarted = false;

    this.fCtrl     = new controlFloat(this,'f',128,1024);
    this.qCtrl     = new controlFloat(this,'q',0,1.8);
    this.rateCtrl  = new controlFloat(this,'rate',0,12);

    this.fCtrl.value = 256;
    this.qCtrl.value = 0.9;
    this.rateCtrl.value = 0;

  }

  get f()  { return this.filter.frequency.value; }
  set f(x) { return this.filter.frequency.linearRampToValueAtTime( x, audioContext.currentTime + 0.5); }
  get q()  { return this.filter.Q.value; }
  set q(x) { return this.filter.Q.linearRampToValueAtTime( x * 10.0, audioContext.currentTime + 0.5);  }

  get rate()  { return this.tremolo.rate; }
  set rate(x) { return this.tremolo.rate = x; }

}

class boxWhiteNoise extends box {
  constructor( node ) {
    super(node);
    this.noise        = audioContext.createBufferSource();
    this.noise.buffer = bufferNoise("white",10);
    this.noise.loop   = true;
    this.noise.connect( this.master );
    this.master.connect( audioContext.destination );

    this.masterCtrl.bijection.max = 0.05;
    this.masterCtrl.value = 0.005;

    this.noise.start();
    this.isStarted = false;
  }
}
class boxPinkNoise extends box {
  constructor( node ) {
    super(node);
    this.noise  = audioContext.createBufferSource();
    this.noise.buffer = bufferNoise("pink",10);
    this.noise.loop   = true;
    this.noise.connect(  this.master );
    this.master.connect( audioContext.destination );

    this.masterCtrl.bijection.max = 0.05;
    this.masterCtrl.value = 0.005;

    this.noise.start();
    this.isStarted = false;
  }
}
class boxBrownNoise extends box {
  constructor( node ) {
    super(node);
    this.noise  = audioContext.createBufferSource();
    this.noise.buffer = bufferNoise("brown",10);
    this.noise.loop   = true;
    this.noise.connect(  this.master );
    this.master.connect( audioContext.destination );

    this.masterCtrl.bijection.max = 0.05;
    this.masterCtrl.value = 0.005;

    this.noise.start();
    this.isStarted = false;
  }
}


class boxNoiseHarmonics extends box {

  constructor( node ) {
    super(node);

    this.master.connect( audioContext.destination );

    this.noises   = new Array();
    this.filters  = new Array();
    this.levels   = new Array();
    this.controls = new Array();

    var base = 55; // A1@55Hz
    for(var i=0; i<9; i++) {

      this.noises.push( audioContext.createBufferSource() );
      this.noises[i].buffer = bufferNoise("pink",10);
      this.noises[i].loop   = true;
      this.noises[i].start();

      this.filters.push(  audioContext.createBiquadFilter() );
      this.filters[i].type = "bandpass";
      this.filters[i].frequency.value = base*(i+1);

      this.levels.push(  audioContext.createGain() );

      this.noises[i].connect(   this.filters[i] );
      this.filters[i].connect(  this.levels[i]  );
      this.levels[i].connect(   this.master     );

    }

    for(var i=0; i<9; i++) {
      this.controls.push( new controlFloat(this,"b"+i, 0, 1, "exp") );
      this.controls[i].value = 0.2;
    }

    this.qCtrl = new controlFloat(this,"q", 20, 100, "invlinear");
    this.qCtrl.value = 60;

  }

  set b0( value ) { this.levels[0].gain.value = value * 4;   }
  set b1( value ) { this.levels[1].gain.value = value * 3; }
  set b2( value ) { this.levels[2].gain.value = value * 2; }
  set b3( value ) { this.levels[3].gain.value = value * 2; }
  set b4( value ) { this.levels[4].gain.value = value * 2; }
  set b5( value ) { this.levels[5].gain.value = value * 2; }
  set b6( value ) { this.levels[6].gain.value = value * 2; }
  set b7( value ) { this.levels[7].gain.value = value * 2; }
  set b8( value ) { this.levels[8].gain.value = value * 2; }
  set  q( value ) {
    for(var i=0; i<9; i++) {
      this.filters[i].Q.value = value;
    }
  }

}




class boxBinauralHarmonics extends box {

  constructor( node ) {
    super(node);

    this.master.connect( audioContext.destination );

    this.binaurals = new Array();
    this.controls  = new Array();

    /* don't let any harmonic go past 1500 Hz to keep binaural effect */
    var base = 55; // A1@55Hz
    for(var i=0; i<8; i++) {
      this.binaurals.push( new audioBinauralSine() );
      this.binaurals[i].output.gain.value = 0;
      this.binaurals[i].frequency = base * (i+1);
      this.binaurals[i].output.connect(this.master);
      this.controls.push( new controlFloat(this,"h"+i, 0, 1, "exp") );
    }

    this.binaurals[0].delta = 0.5;  // brainwave (Hz) Delta f = 0.5 to 4
    this.binaurals[1].delta = 1;
    this.binaurals[2].delta = 3;    // brainwave (Hz) Theta f = 4 to 7
    this.binaurals[3].delta = 6;
    this.binaurals[4].delta = 8;    // brainwave (Hz) Alpha f = 7.5 to 12.5
    this.binaurals[5].delta = 12;
    this.binaurals[6].delta = 16;   // brainwave (Hz) Beta  f = 12.5 to 30
    this.binaurals[7].delta = 32;

    for(var i=0; i<8; i++) this.controls[i].value = 0.2;

  }

  set h0( value ) { this.binaurals[0].level = value / 8 * 1.5;   }
  set h1( value ) { this.binaurals[1].level = value / 8; }
  set h2( value ) { this.binaurals[2].level = value / 8; }
  set h3( value ) { this.binaurals[3].level = value / 8; }
  set h4( value ) { this.binaurals[4].level = value / 8; }
  set h5( value ) { this.binaurals[5].level = value / 8; }
  set h6( value ) { this.binaurals[6].level = value / 8; }
  set h7( value ) { this.binaurals[7].level = value / 8; }

}



class effectTremolo {

  /**
  *
  * a simple gain node driven by an oscillator
  *
  **/

  constructor() {

    this.audioGain                  = audioContext.createGain();
    this.audioGain.gain.value       = 0;

    this.oscillator                 = audioContext.createOscillator();
    this.oscillator.type            = "sine";
    this.oscillator.frequency.value = 0;
    this.oscillator.start()
    
    console.log(this);

  }

  get input()     { return this.audioGain; }
  get output()    { return this.audioGain; }
  get state()     { return ( this.rate != 0 ); }

  get rate()      { return this.oscillator.frequency.value; } 
  set rate(x)     {
    if( x == 0 ) {
      this.oscillator.disconnect();
      this.audioGain.gain.value = 1;
    } else {
      this.audioGain.gain.value = 0;
      this.oscillator.connect( this.audioGain.gain );
    }
    this.oscillator.frequency.value = x;
  } 
  get waveform()  { return this.oscillator.type; } 
  set waveform(x) { return this.oscillator.type = x; } 

}



// TODO name : audioStereoMixer
class audioStereoPanner {
  /*
   * 2x mono -> stereo
   */
  constructor() {

    this.left                       = audioContext.createPanner();
    this.right                      = audioContext.createPanner();
    this.left.panningModel          = "equalpower";
    this.right.panningModel         = "equalpower";
    this.left.setPosition(-1,0,0);
    this.right.setPosition(1,0,0);

    this.audioGain                  = audioContext.createGain();
    this.audioGain.value            = 1;

    this.left.connect(this.audioGain);
    this.right.connect(this.audioGain);

  }

  get input()  { return { 'left': this.left, 'right': this.right }; }
  get output() { return this.audioGain; }

  get level()  { return this.audioGain.gain.value; }
  set level( value ) {
    this.audioGain.gain.linearRampToValueAtTime(value,audioContext.currentTime + 0.5);
  }

}

class audioBinauralSine {

  constructor() {

    this.oscillatorLeft         = audioContext.createOscillator();
    this.oscillatorRight        = audioContext.createOscillator();
    this.oscillatorLeft.type    = "sine";
    this.oscillatorRight.type   = "sine";

    this.stereoPanner           = new audioStereoPanner;
    this.oscillatorLeft.connect(this.stereoPanner.input.left);
    this.oscillatorRight.connect(this.stereoPanner.input.right);

    this.oscillatorLeft.start();
    this.oscillatorRight.start();

  }

  get output() { return this.stereoPanner.output; }

  get level()  { return this.output.gain.value;   }
  set level(x) { this.output.gain.value = x; } 

  get frequency()  { return this.oscillatorLeft.frequency.value; }
  set frequency(f) {
    var delta = this.delta;
    this.oscillatorLeft.frequency.value = f;
    this.oscillatorRight.frequency.value = f + delta;
  }
  get delta() {
    return this.oscillatorRight.frequency.value  - this.oscillatorLeft.frequency.value;
  }
  set delta( delta ) {
    var f = this.frequency;
    this.oscillatorLeft.frequency.value = f;
    this.oscillatorRight.frequency.value = f + delta;
  }
}


/**
 * _control_ links a node property value to an object property value
 * node property value must be in [0;1]
 * node must have a data-property="foo" to be linked to object.foo
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



