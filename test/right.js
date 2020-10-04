// Test Node-Pan-Tilt-HAT library
// Tests Absolution Position API
// Copyright (c) Roger Hardiman 2017, 2020

var PanTiltHAT = require('../pan-tilt-hat.js');
var flow = require('nimble');

var pan_tilt = new PanTiltHAT();

// Use Nimble's Series pattern to run one function after another
// Delays between commands are implemented with a setTimeout

flow.series([
    // TEST - Goto Position
    function (completion_callback) {
        console.log('Goto position Pan Right(+80), Tilt 0');
        pan_tilt.pan(80);
        pan_tilt.tilt(0);
        completion_callback();
    },

    // TEST - Wait 3 seconds to check the Servo drive output is disabled
    function (completion_callback) {
        console.log('Wait 3 seconds to see the Servo drive output disabled');
        setTimeout(function () { completion_callback(); }, 3000);
    }

]);

