(
16.do({|i|
	~labels = ~labels.add(NxComment(Rect(0, 1/16 * 100 * i, 10, 1/16 * 100)));

	~sliders = ~sliders.add(NxSlider(Rect(10, 1/16 * 100 * i, 90, 1/16 * 100)));

})
)


NxSlider(Rect(10, 1/16 * 10 * 0, 90, 1/16 * 10))

NetAddr.localAddr


NetAddr("127.0.0.1", 8084).sendMsg("/setLabel", 1, "fish")


NetAddr("127.0.0.1", 8084).sendMsg("/interface/autogui/redoLayout")

NetAddr("127.0.0.1", 8084).sendMsg("/interface/reset")

NetAddr("127.0.0.1", 8084).sendMsg("/interface/clear")


NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{\"type\":\"Knob\"}");

NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Knob'}");

NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Knob', 'usesRotation':false}");


NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Slider'}");

NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Knob', 'key':'Knob1', 'name':'Knob1'}");

NetAddr("127.0.0.1", 8084).sendMsg( "/interface/removeWidget", "Knob1");

NetAddr("127.0.0.1", 8084).sendMsg( "/interface/removeWidget", Ndef(\foo).key);

Ndef.all['localhost'].envir.keys

Ndef(\foo, {SinOsc.ar})

Ndef(\foo).vol = 0.5

NdefMixer(s);
~ndefs = nil; ~vols = IdentityDictionary();
~clearFunc = {|ndef, what, fadeTime| if(what === \clear, {SystemClock.sched(fadeTime[0], { NetAddr("127.0.0.1", 8084).sendMsg( "/interface/removeWidget", ndef.key); })}) };
SkipJack({
	var nonNeutralNdefs;
	try {
		nonNeutralNdefs = Ndef.all['localhost'].envir.keys.select({|key| Ndef(key).isNeutral.not });
		// create new if needed
		if(~ndefs != nonNeutralNdefs, {
			//NetAddr("127.0.0.1", 8084).sendMsg("/interface/clear");
			nonNeutralNdefs.difference(~ndefs).do({|key|
				/*NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Knob', 'usesRotation':false, 'target':'OSC', 'key':'/%', 'label':'%', 'sacrosanct':true}".format(key, key));*/

				NetAddr("127.0.0.1", 8084).sendMsg( "/interface/addWidget", "{'type':'Slider', 'target':'OSC', 'key':'/%', 'label':'%', 'name':'%', 'sacrosanct':true, 'value':'%'}".format(key, key, key, Ndef(key).vol));
				~vols[key] = Ndef(key).vol;
				OSCdef(key, {|msg| Ndef(key).vol = msg[1]; }, "/" ++ key);
				Ndef(key).addDependant(~clearFunc);
			});
			~ndefs = nonNeutralNdefs.copy;

		});

		~vols.keysValuesDo({|key, vol| if(vol != Ndef(key).vol, { NetAddr("127.0.0.1", 8084).sendMsg(key, vol = Ndef(key).vol); ~vols[key] = vol}); // modify collection while iterating? okay as dict?
		})
	}
}, 0.1);

(
OSCdef(\sync, {
	NetAddr("127.0.0.1", 8084).sendMsg("/interface/runScript", "Interface.autogui.reset();panel.clear();");
	~ndefs = nil;
	~vols = IdentityDictionary();
	'/sync'.postln;

}, '/sync');
)

Ndef(\bar, {SinOsc.ar})

Ndef(\foobar, {WhiteNoise.ar})

Ndef(\foobar2, {})

SkipJack.stopAll

OSCFunc.trace(hideStatusMsg: true);




var key = "ffdfd";
NetAddr("127.0.0.1", 8084).sendMsg( "/interface/runScript",
	"var hbox = new Interface.HBox({bounds: [0, .8, 1, .2]});
var vbox = new Interface.VBox();
var playButt = new Interface.Button({bounds: [0, 0, .5, 1]});
var edButt = new Interface.Button({bounds: [.5, 0, .5, 1]});
var slid = new Interface.Slider({
bounds: [0, 0, 1, .8],
isVertical:true,
target:'OSC', key:'/%',
label: '%',
value: %,
});
panel.add(vbox, slid, hbox, playButt, edButt);

vbox.add(slid, hbox);
hbox.add(playButt, edButt);
Interface.autogui.placeWidget(vbox, true);
".format(key, key, Ndef(key).vol));