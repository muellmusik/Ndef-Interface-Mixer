npm install to setup dependencies

May need to run npm install from node_modules/interface.js/server/

To run

<!-- cd node_modules/interface.js/server/
node interface.simpleserver.js --oscOutPort 57120 --oscInPort 8084 --interfaceDirectory ../../../ // or adjust ports as needed -->

node Ndef-Interface-Mixer.server.js --oscOutPort 57120 --oscInPort 8084 --interfaceDirectory ./

This runs a server on the same machine on port 8080

NB this depends on a particular commit of earlier version of interface.js. This is actually all kind of a mess, as CR moved it to the allosphere group before completely reworking it. Works okay though.
