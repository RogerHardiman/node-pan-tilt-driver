// Test Node-Pan-Tilt-HAT library
// Tests Absolution Position API
// and the Continual Move API
// Copyright (c) Roger Hardiman 2017, 2020

var PanTiltHAT = require('../pan-tilt-hat.js');
var flow = require('nimble');

var pan_tilt = new PanTiltHAT();
//pan_tilt.set_hardware("waveshare");

// Use Nimble's Series pattern to run one function after another
// Delays between commands are implemented with a setTimeout

flow.series([
    // TEST - Goto Position
    function (completion_callback) {
        console.log('Goto position Pan Left +50, Tilt Up -50');
        pan_tilt.pan(+50);
        pan_tilt.tilt(-50);
        completion_callback();
    },

    // TEST - Wait 3 seconds to check the Servo is disabled
    function (completion_callback) {
        console.log('Wait 3 seconds to see the Servo Disable');
        setTimeout(function () { completion_callback(); }, 3000);
    },

    // TEST - Start Continual Move - slow speed
    function (completion_callback) {
        console.log('Start continual move (down, left)');
        pan_tilt.pan_right(5);
        pan_tilt.tilt_down(2);
        completion_callback();
    },

    // TEST - Wait 10 seconds	
    function (completion_callback) {
        console.log('Wait 10 seconds while the camera turns');
        setTimeout(function () { completion_callback(); }, 10*1000);
    },

    // TEST - Stop
    function (completion_callback) {
        console.log('Stop');
        pan_tilt.stop();
        completion_callback();
    },

    // TEST - Wait 3 seconds to check servo is disabled
    function (completion_callback) {
        console.log('Wait 3 seconds while the servo is disabled');
        setTimeout(function () { completion_callback(); }, 3000);
    },

    // TEST - Goto Position
    function (completion_callback) {
        console.log('Goto position Pan Left +50, Tilt Up -50');
        pan_tilt.pan(+50);
        pan_tilt.tilt(-50);
        completion_callback();
    },

    // TEST - Start Continual Move - fast speed
    function (completion_callback) {
        console.log('Start continual move (down, left)');
        pan_tilt.pan_right(15);
        pan_tilt.tilt_down(15);
        completion_callback();
    },

    // TEST - Wait 5 seconds while the camera turns
    function (completion_callback) {
        console.log('Wait 5 seconds');
        setTimeout(function () { completion_callback(); }, 5*1000);
    },

    // TEST - Stop
    function (completion_callback) {
        console.log('Stop');
        pan_tilt.stop();
        completion_callback();
    },

    // TEST - Wait 3 seconds to check the servo is disabled
    function (completion_callback) {
        console.log('Wait 3 seconds so we see the Servo Disable message');
        setTimeout(function () { completion_callback(); }, 3000);
    },

    // TEST - Exit 
    function (completion_callback) {
        console.log('Close PanTiltHat class');
        pan_tilt.close();
        completion_callback();
    },

]);

