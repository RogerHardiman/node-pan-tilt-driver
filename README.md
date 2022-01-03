# node-pan-tilt-driver
NodeJS driver for the Pan-Tilt HAT from _Pimoroni_ and the Pan-Tilt HAT from _Waveshare_.
COMING SOON - support for the Pan-Tilt Platform from _Arducam_
100% Javascript. No need for any external Python libraries.

There are two makes of Pan-Tilt HAT board for the Raspberry Pi that sit on top of the Pi, one made by _Pimoroni_ in the UK and one made by _Waveshare_ in China.
There is also a Pan-Tilt platform designed for the Pi and the Jetson Nano made by Arducam that can sit alongside the Pi with 4 jumper wires back to the Pi. (DRIVER SUPPORT COMING SOON)
All boards have some similarities and some differences

|Feature|Pimoroni|Waveshare|Arducam (Under Development)|
|-------|--------|---------|---------|
|Designed for the Raspberry Pi|Yes|Yes|Yes|
|Servo Type|SG90 analogue servo|WS-SG90 analogue servo|PES GH-S37D digital servo|
|Control Chip|PIC16F1503 with custom firmware on the i2c bus. PIC generates the PWM signals|Standard PCA9685 PWM/LED controller on the i2c bus|Standard PCA9685 PWM/LED controller on the i2c bus|
|I2C address|0x15|0x40 (with ability to be changed)|TBC|
|Extra feature|Has a 3rd output for PWM controlled LEDs and Lights and NeoPixels (this driver does not control the LED/Lights)|Has a Light Sensor on the i2c bus (this driver does not read the light level sensor)|None|
|Extra features|Brings the I2C, UART, Broadcom PWM and SPI signals to the edge of the board|Has tall header pins to allow access to all 40 Pi pins. Has solder pads to allow the i2c address to be changed|Can sit to the side of the Pi (does not need to go on top) Uses jumper wires to connect to a Pi's i2c bus|
|Pi HAT Standard Compliance|Yes, has the HAT EEPROM. The Pi device tree will show the Pimoroni Pan-Tilt HAT is connected|No. Does not implement the HAT identification EEPROM|
|Country of origin|UK|China|N/A. Not a HAT|
|URLs|http://shop.pimoroni.com/products/pan-tilt-hat|http://www.waveshare.com/pan-tilt-hat.htm|https://www.arducam.com/product/arducam-pan-tilt-platform-for-raspberry-pi-camera-2-dof-bracket-kit-with-digital-servos-and-ptz-control-broad-b0283/|

# USAGE
```
var PanTiltHAT = require('pan-tilt-hat');
var pan_tilt = new PanTiltHAT();
console.log('Goto position Pan 0, Tilt 0');
pan_tilt.pan(0);
pan_tilt.tilt(0);
```


# INITIALISAION
  The library autodetects the Pan/Tilt boards by checking the I2C addresses (0x15 and 0x40)

# ABSOLUTE POSITIONING
* Pan=0, Tilt=0 has the camera looking forword.
* Pan of +90 makes the Pi Camera look to the left
* Pan of -90 makes the Pi Camera look to the right
* Tilt of -80 makes the Pi Cammera look up
* Tilt of +80 makes the Pi Cammera look down
* (The positive and negative directions are the same as the Pimoroni Python driver)

```
  pan(angle)                      // angle between -90 and 90
  servo_one(angle)                // angle between -90 and 90
  tilt(angle)                     // angle between -80 and 80
  servo_two(angle)                // angle between -80 and 80
  ```


# CONTINUOUS MOVE API (START AND STOP COMMANDS)
   The camera will start to turn at the specificated speed and continue to turn until told to stop
   ```
   pan_left(speed)                 // start moving with a speed from 0 to 15. 0 means stop
   pan_right(speed)                // start moving with a speed from 0 to 15. 0 means stop
   tilt_up(speed)                  // start moving with a speed from 0 to 15. 0 means stop
   tilt_down(speed)                // start moving with a speed from 0 to 15. 0 means stop
   stop()                          // stop the pan and the tilt
   ```

 # SHUTDOWN
 ```
   close()                         // closes the class and frees resources
```

# SERVO SIGNAL
  After 2 seconds the servo PWM drive signal on the Pimoroni board is turned off to save power.
  This has not been implemented on the Waveshare or Arducam board yet
