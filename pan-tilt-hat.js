//
// Node Wrapper for Pimoroni Pan-Tilt HAT and Waveshare Pan-Tilt HAT
// Copyright (c) 2017, 2018, 2020 Roger Hardiman
//
// The two Pan-Tilt HAT boards have some similarities and some differences
// Both use standard servos for the Pan and Tilt positions and have 3 pin servo headers on the board
//
// Pimoroni use a PIC16F1503 microcontroller chip on the i2c bus to generate PWM signals for the servos
// Pimoroni has a 3rd PWM output that can be connected to PWM controlled LEDs and Lights
// Pimoroni also use the HAT ID EEPROM so this board can be auto-detected
//
// Waveshare use a standard PCA9685 LED/PWM chip on the i2c bus with PWM channel 0 and PWM channel 1 used for the seros
// Waveshare also has a Light Sensor on the i2c bus
//
//
//
// INITIALISAION
//   The library autodetects Pimoroni by checking i2c address 0x15 and Waveshare/PCA9685 by checking i2c address 0x40

// ABSOLUTE POSITIONING
//   pan(angle),                     // angle between -90 and 90
//   servo_one(angle)                // angle between -90 and 90
//   tilt(angle)                     // angle between -80 and 80
//   servo_two(angle)                // angle between -80 and 80
//
// CONTINUOUS MOVE API (START AND STOP COMMANDS)
//   pan_left(speed)                 // start moving with a speed from 0 to 15. 0 means stop
//   pan_right(speed)                // start moving with a speed from 0 to 15. 0 means stop
//   tilt_up(speed)                  // start moving with a speed from 0 to 15. 0 means stop
//   tilt_down(speed)                // start moving with a speed from 0 to 15. 0 means stop
//   stop()                          // stop the pan and the tilt
//
// SHUTDOWN
//   close()                         // closes the class and frees resources
//
// SERVO SIGNAL
// After 2 seconds the servo PWM drive signal is turned off.

var i2c_bus = require("i2c-bus");
const PIMORONI_I2C_ADDRESS = 0x15;
const PIMORONI_CONFIG_REGISTER = 0x00;
const PIMORONI_PAN_SERVO_REGISTER = 0x01;
const PIMORONI_TILT_SERVO_REGISTER = 0x03;
const SERVO_MIN_PWM = 575;
const SERVO_MAX_PWM = 2325;

const WAVESHARE_I2C_ADDRESS = 0x40; // can be changed with resisters on the PCB


class PanTiltHAT {

  constructor() {
    this.i2c = i2c_bus.openSync(1);

    // Detect make of pan-tilt HAT by reading i2c registers
    this.manufacturer = "unknown";
    try {
      // Try and read from the Pimoroni i2c addresses. If it fails we get an exception from the i2c library.
      var pan_pwm = this.i2c.readWordSync(PIMORONI_I2C_ADDRESS, PIMORONI_PAN_SERVO_REGISTER);
      var tilt_pwm = this.i2c.readWordSync(PIMORONI_I2C_ADDRESS, PIMORONI_TILT_SERVO_REGISTER);
      this.manufacturer = "pimoroni"
    } catch (error) {
      this.manufacturer = "waveshare";
    }

    // current position in degrees and current speed (used for continuous move API)
    this.pan_position = 0;
    this.pan_speed = 0;
    this.pan_servo_enabled = false;

    this.tilt_position = 0;
    this.tilt_speed = 0;
    this.tilt_servo_enabled = false;

    // Timers, used for Continuous Move API and to disable the servos
    this.timer = setInterval(this.continuous_move_callback.bind(this), 100); // 100ms
    this.disablePanTimer = null;
    this.disableTiltTimer = null;

    if (this.manufacturer === "pimoroni") this.pimoroni_update_servo_config();
    if (this.manufacturer === "waveshare") this.waveshare_update_servo_config();

    console.log("Detected " + this.manufacturer + " pan-tilt HAT");
  }


  // Move Servo One to 'angle'
  servo_one(angle) {
    if (this.angle > 90) this.angle = 90;
    if (this.angle < -90) this.angle = -90;

    // Convert angle to a Servo PWM value
    let pan_pwm = this.AngleToPWM(angle);

    // Clear servo timeout, enable the servo and set a timer to disable it after 2 seconds
    clearTimeout(this.disablePanTimer);
    this.pan_servo_enabled = true;

    // update position
    this.pan_position = angle;

    if (this.manufacturer === "pimoroni") {
      this.pimoroni_update_servo_config();
      this.pimoroni_send_pan_pwm(pan_pwm);
    }

    if (this.manufacturer === "waveshare") {
      this.waveshare_update_servo_config();
      this.waveshare_send_pan_pwm(pan_pwm);
    }

    this.disablePanTimer = setTimeout(function () {
      // turn off the PWM output
      this.pan_servo_enabled = false;
      if (this.manufacturer === "pimoroni") this.pimoroni_update_servo_config();
      if (this.manufacturer === "waveshare") this.waveshare_update_servo_config();
    }.bind(this), 2000);
  }


  // Move Servo Two to 'angle'
  servo_two(angle) {
    if (this.angle > 80) this.angle = 80;
    if (this.angle < -80) this.angle = -80;

    // Convert angle to a Servo PWM value
    let tilt_pwm = this.AngleToPWM(angle);

    // Clear servo timeout
    clearTimeout(this.disableTiltTimer);
    this.tilt_servo_enabled = true;

    // update position
    this.tilt_position = angle;

    if (this.manufacturer === "pimoroni") {
      this.pimoroni_update_servo_config();
      this.pimoroni_send_tilt_pwm(tilt_pwm);
    }

    if (this.manufacturer === "waveshare") {
      this.waveshare_update_servo_config();
      this.waveshare_send_tilt_pwm(tilt_pwm);
    }

    this.disableTiltTimer = setTimeout(function () {
      // turn off the PWM output
      this.tilt_servo_enabled = false;
      if (this.manufacturer === "pimoroni") this.pimoroni_update_servo_config();
      if (this.manufacturer === "waveshare") this.waveshare_update_servo_config();
    }.bind(this), 2000);
  }


  // Alias for Servo One and Servo Two
  pan(angle) { this.servo_one(angle); };
  tilt(angle) { this.servo_two(angle); };
  goto_home() { this.pan(0); this.tilt(0); };


  // Convert the angle into a PWM value
  AngleToPWM(angle) {
    return Math.round(SERVO_MIN_PWM + ((SERVO_MAX_PWM - SERVO_MIN_PWM) / 180) * (angle + 90));
  }

  // Every time the Continouous Move API callback is fired, we calculate the new angle for the servos
  // using the current angle and current speed
  continuous_move_callback() {
    console.log("inside callback " + this.pan_speed);
    if (this.pan_speed === 0 && this.tilt_speed === 0) return;
    console.log("inside callback 2");
    let new_pan_position = this.pan_position + (this.pan_speed / 10);
    let new_tilt_position = this.tilt_position + (this.tilt_speed / 10);
    // range check
    if (new_pan_position > 90) {
      this.pan_speed = 0;
      new_pan_position = 90;
    }
    if (new_pan_position < -90) {
      new_pan_position = -90;
      this.pan_speed = 0;
    }
    if (new_tilt_position > 80) {
      new_tilt_position = 80;
      this.tilt_speed = 0;
    }
    if (new_tilt_position < -80) {
      new_tilt_position = -80;
      this.tilt_speed = 0;
    }

    if (new_pan_position != this.pan_position) {
      console.log("aaa")
      this.pan(new_pan_position);
    }
    if (new_tilt_position != this.tilt_position) {
      this.tilt(new_tilt_position);
    }
  }

  pan_left(speed) {
    if (speed > 15) speed = 15;
    if (speed < 0) speed = 0;
    this.pan_speed = speed;
    console.log(">>>>>>" + this.pan_speed);
  }

  pan_right(speed) {
    if (speed > 15) speed = 15;
    if (speed < 0) speed = 0;
    this.pan_speed = -speed;
    console.log(">>>>>>" + this.pan_speed);
  }

  tilt_up(speed) {
    if (speed > 15) speed = 15;
    if (speed < 0) speed = 0;
    this.tilt_speed = -speed;
  }

  tilt_down(speed) {
    if (speed > 15) speed = 15;
    if (speed < 0) speed = 0;
    this.tilt_speed = speed;
  }

  stop() {
    this.pan_speed = 0;
    this.tilt_speed = 0;
  }

  close() {
    this.stop();
    clearTimeout(this.timer);
    clearTimeout(this.disablePanTimer);
    clearTimeout(this.disableTiltTimer);
    this.timer = null;
    this.disablePanTimer = null;
    this.disableTiltTimer = null;
  }



  //////////////////////////////////////////////////
  //
  // Hardware Specific Functions
  //
  //////////////////////////////////////////////////
  pimoroni_update_servo_config() {
    console.log("pimoroni update servo config pan=" + this.pan_servo_enabled + " tilt=" + this.tilt_servo_enabled);
    let config_byte = 0;
    if (this.pan_servo_enabled) config_byte = config_byte | 0x01;
    if (this.tilt_servo_enabled) config_byte = config_byte | 0x02;
    this.i2c.writeByteSync(PIMORONI_I2C_ADDRESS, PIMORONI_CONFIG_REGISTER, config_byte);
  }

  pimoroni_send_pan_pwm(pwm) {
    console.log("pimoroni set pan pwm to " + pwm);
    this.i2c.writeWordSync(PIMORONI_I2C_ADDRESS, PIMORONI_PAN_SERVO_REGISTER, pwm);
  }

  pimoroni_send_tilt_pwm(pwm) {
    console.log("pimoroni set tilt pwm to " + pwm);
    this.i2c.writeWordSync(PIMORONI_I2C_ADDRESS, PIMORONI_TILT_SERVO_REGISTER, pwm);
  }



  waveshare_update_servo_config() {
    console.log("pimoroni update servo config pan=" + this.pan_servo_enabled + " tilt=" + this.tilt_servo_enabled);
  }

  waveshare_send_pan_pwm(pwm) {
    console.log("waveshare set pan pwm to " + pwm);
  }

  waveshare_send_tilt_pwm(pwm) {
    console.log("waveshare set tilt pwm to " + pwm);
  }

}

module.exports = PanTiltHAT;
