Interface.NdefSlider = function() {
  Interface.extend(this, {
    type : 'Slider',
    isVertical : true,
    serializeMe : ["isVertical"],
    isPlaying : false,
    lastHitIsPlay: false,
    playWidth : null,

    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();

      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );

      this.ctx.fillStyle = this._fill();

      if(this.isVertical) {
        this.ctx.fillRect( x, y + height - this._value * height, width, this._value * height);
      }else{
        this.ctx.fillRect( x, y, width * this._value, height);
      }

      if(this.label) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = this._font();
        this.ctx.fillText(this.label, x + width / 2, y + height / 2);
      }

      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );

      // play button
      if (this.playWidth === null) { this.playWidth = panel.width * 0.05 }

      this.ctx.fillStyle = this.isPlaying ? 'green' : this._background();
      this.ctx.fillRect( x, y, this.playWidth, this.playWidth );

      this.ctx.strokeRect( x, y, this.playWidth, this.playWidth );
      this.ctx.fillStyle = this._stroke();
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.font = 'normal 14px Helvetica'
      this.ctx.fillText("P", x + this.playWidth * 0.5, y + this.playWidth * 0.5);
    },

    hitTest : function(e) {
      if(e.x >= this._x() && e.x <= this._x() + this._width()) {
        if(e.y >= this._y() && e.y <= this._y() + this._height()) {
          if (e.x <= (this._x() + this.playWidth) && e.y <= (this._y() + this.playWidth)) {
            this.lastHitIsPlay = true
          } else {
            this.lastHitIsPlay = false
          }
          return true;
        }
      }

      return false;
    },

    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {

        this._value = this.isVertical ? 1 - (yOffset / this._height()) : xOffset / this._width();

        if(this._value < 0) {
          this._value = 0;
          // this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          // this.hasFocus = false;
        }

        this.value = this.min + (this.max - this.min) * this._value;

        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }
    },

    sendPlayMessage : function() {
      this.isPlaying = !this.isPlaying
      if(this.target && this.key) {
        if(this.target === "OSC") {
          if(Interface.OSC) {
            if(typeof this.values === 'undefined') {
              var tt = typeof this.value === 'string' ? 's' : 'f';
              Interface.OSC.send(this.key + '-play', tt, [ this.isPlaying ] );
            }else{
              if(typeof this.sendValues === 'undefined') {
                var tt = '';
                for(var i = 0; i < this.values.length; i++) {
                  tt += typeof this.value === 'string' ? 's' : 'f';
                }
                Interface.OSC.send( this.key, tt, this.values );
              }else{
                this.sendValues();
              }
            }
          }
        // }else if(this.target === "MIDI") {
        //   if(Interface.MIDI && typeof this.values === 'undefined') {
        //     Interface.MIDI.send( this.key[0],this.key[1],this.key[2], this.value )
        //   }
        }else if( this.target === 'WebSocket' ){
          var msg = {
            type : "socket",
            address: this.key + '-play',
          }
          var values

          if( Interface.Socket ) {
            if(typeof this.values === 'undefined') {
              values = [ this.isPlaying ]
            }else{
              if(typeof this.sendValues === 'undefined') {
                values = [ this.isPlaying ]
              }else{
                this.sendValues()
                return
              }
            }
            msg.parameters = values
            Interface.Socket.send( JSON.stringify( msg ) );
          }

        // }else{
        //   if(typeof this.target[this.key] === 'function') {
        //     this.target[this.key + '-play']( this.values || this.value );
        //   }else{
        //     this.target[this.key+ '-play'] = this.values || this.value;
        //   }
        }
      }
      this.refresh();
    },

    mousedown : function(e, hit) { if(this.lastHitIsPlay) { this.sendPlayMessage() } else {
      if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() );}
    },
    mousemove : function(e, hit) { if(!this.lastHitIsPlay) {
      if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); }
    },
    mouseup   : function(e, hit) { if(!this.lastHitIsPlay) {
      if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); }
    },

    touchstart : function(e, hit) { if(this.lastHitIsPlay) { this.sendPlayMessage() } else {
        if(hit) this.changeValue( e.x - this._x(), e.y - this._y() );}
    },
    touchmove  : function(e, hit) { if(!this.lastHitIsPlay) {
      if(hit) this.changeValue( e.x - this._x(), e.y - this._y() );}
    },
    touchend   : function(e, hit) { if(!this.lastHitIsPlay) {
      if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); }
    },
  })
  .init( arguments[0] );
};
Interface.NdefSlider.prototype = Interface.Widget;
var expr, socketAndIPPort, socketString;

expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/

socketIPAndPort = expr.exec( window.location.toString() )[0];
socketIPAndPort = socketIPAndPort.split(":");

socketString = 'ws://' + socketIPAndPort[0] + ':' + (parseInt(socketIPAndPort[1]) + 1);

function createSocket() {
  Interface.Socket = new WebSocket( socketString );

  Interface.Socket.onmessage = function (event) {
    var data = JSON.parse( event.data )
    if( data.type === 'osc' ) {
      Interface.OSC._receive( event.data );
    }else {
      if( Interface.Socket.receive ) {
        Interface.Socket.receive( data.address, data.parameters  )
      }
    }
  };

  Interface.Socket.onclose = function(){
    console.log("closed");
    setTimeout(createSocket, 1000);
    setTimeout(function sync(){Interface.OSC.send('/sync', '', [])}, 1500); // hacky way of waiting for socket to be ready
  }


  Interface.OSC = {
    socket : Interface.Socket,
    send : function(_address, _typetags, _parameters) {
      if( this.socket.readyState === 1) {
        if(typeof _address === 'string' && typeof _typetags === 'string') {
          var obj = {
            type : "osc",
            address: _address,
            typetags: _typetags,
            parameters: Array.isArray(_parameters) ? _parameters : [ _parameters ],
          }
          this.socket.send(JSON.stringify(obj));
        }else{
          console.log( 'socket is not yet connected...' )
        }
      }else{
        console.log("INVALID OSC MESSAGE FORMATION", arguments);
      }
    },
    _receive : function( data ) {
      var msg = JSON.parse( data );

      if( msg.address in this.callbacks ) {
        this.callbacks[ msg.address ]( msg.parameters );
      }else{
        for(var i = 0; i < Interface.panels.length; i++) {
          for( var j = 0; j < Interface.panels[i].children.length; j++) {
            var child = Interface.panels[i].children[j];

            //console.log( "CHECK", child.key, msg.address )
            if( child.key === msg.address ) {
              //console.log( child.key, msg.parameters )
              child.setValue.apply( child, msg.parameters );
              return;
            }
          }
        }
        this.receive( msg.address, msg.typetags, msg.parameters );
      }
    },
    callbacks : { // "panel" is the Interface.Panel object created in the livecode.html interface
      "/interface/runScript": function(args) {
        eval(args[0]);
      },
      "/interface/addWidget": function(args) {
        // console.log( args )
        var w = {};

        var json2 = args[0].replace(/\'/gi, "\""); // replace any single quotes in json string

        try {
          eval("w = " + json2);
          // TODO: use JSON.parse? It's really annoying to format strings for JSON in Max/MSP...
          //w  = JSON.parse( json2 ); // since this might be an 'important' string, don't fail on json parsing error
        }catch (e) {
          console.log("ERROR PARSING JSON");
          return;
        }

        var isImportant = false;
      	var hasBounds = (typeof w.bounds !== "undefined") || (typeof w.x !== "undefined");

        var _w = new Interface[w.type](w);

        if( w.type !== 'Accelerometer' && w.type !== 'Orientation' ) {

          panel.add( _w );

          if( !hasBounds ) {
            // TODO: IMPLEMENT
            //if(!Interface.isWidgetSensor(w) ) {
            Interface.autogui.placeWidget(_w, isImportant);
            //}
          }
        }else{
          console.log("STARTING UP ACC")
          _w.start()
        }

        // var widgetPage = (typeof w.page !== "undefined") ? w.page : Interface.currentPage;
        // Interface.addingPage = widgetPage;
        // Interface.addWidget(window[w.name], Interface.addingPage);
      },
      "/interface/addWidgetKV" : function(args) {
        var w = {};
        for (var i = 2; i < args.length; i+=2) {
          w[args[i]]=args[i+1];
        }

        var isImportant = false;

        if(typeof w.page === "undefined") {
          w.page = Interface.currentPage;
        }

        var _w = Interface.makeWidget(w);
        _w.page = w.page;

        if(typeof _w.bounds == "undefined") {
          if(!Interface.isWidgetSensor(w) ) {
            Interface.autogui.placeWidget(_w, isImportant);
          }
        }

        var widgetPage = (typeof w.page !== "undefined") ? w.page : Interface.currentPage;
        Interface.addWidget(window[w.name], widgetPage);
      },
      "/interface/autogui/redoLayout" : function(args) {
        Interface.autogui.redoLayout();
      },
      "/interface/removeWidget": function(args) {
        var w = panel.getWidgetWithName( args[0] );
        if(typeof Interface.autogui !== "undefined") {
          Interface.autogui.removeWidget( w );
        }
        panel.remove( w );
      },
      "/interface/setBounds": function(args) {
        var w = panel.getWidgetWithName( args[0] );
        w.bounds = [ args[1], args[2], args[3], args[4] ];
      },
      "/interface/setColors": function(args) {
        var w = panel.getWidgetWithName( args[0] );
        w.background = args[1];
        w.fill = args[2];
        w.stroke = args[3];
        w.refresh();
      },
      "/interface/setRange": function(args) {
        var w = panel.getWidgetWithName( args[0] );
        w.min = args[1];
        w.max = args[2];
      },
      "/interface/setAddress": function(args) {
        var w = panel.getWidgetWithName(args[0]);
        w.key = args[1];
      },
      "/interface/clear" : function(args) {
        //Interface.autogui.reset();
        panel.clear();
      },
    },
    receive : function(address, typetags, parameters) { },
  };

  Interface.MIDI = {
    socket: Interface.Socket,
    send : function(messageType, channel, number, value) {
      var obj = null;
      if(Array.isArray( arguments[0] )) {
        // fill in to allow stuff like [145,1,127]
      }else{
        obj = {
          type    : 'midi',
          midiType  : messageType,
          channel   : channel,
          number    : number,
        }
        if(typeof value !== 'undefined') {
          obj.value = value;
        }
        console.log( obj );
        this.socket.send( JSON.stringify( obj ) );
      }
    }
  };

}

createSocket();
