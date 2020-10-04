# node-pan-tilt-hat-2
NodeJS driver for the Pan-Tilt HAT from Pimoroni and from Waveshare


The two Pan-Tilt HAT boards have some similarities and some differences
Both use standard servos for the Pan and Tilt positions and have 3 pin servo headers on the board

Pimoroni use a PIC16F1503 microcontroller chip on the i2c bus to generate PWM signals for the servos
Pimoroni has a 3rd PWM output that can be connected to PWM controlled LEDs and Lights
Pimoroni also use the HAT ID EEPROM so this board can be auto-detected

Waveshare use a standard PCA9685 LED/PWM chip on the i2c bus with PWM channel 0 and PWM channel 1 used for the seros
Waveshare also has a Light Sensor on the i2c bus


INITIALISAION
  The library autodetects Pimoroni by checking i2c address 0x15 and Waveshare/PCA9685 by checking i2c address 0x40

ABSOLUTE POSITIONING
Pan=0, Tilt=0 has the camera looking forword.
Pan of +90 makes the Pi Camera look to the left
Pan of -90 makes the Pi Camera look to the right
Tilt of -80 makes the Pi Cammera look up
Tilt of +80 makes the Pi Cammera look down
(The positive and negative directions are the same as the Pimoroni Python driver)

   pan(angle),                     // angle between -90 and 90
   servo_one(angle)                // angle between -90 and 90
   tilt(angle)                     // angle between -80 and 80
   servo_two(angle)                // angle between -80 and 80


CONTINUOUS MOVE API (START AND STOP COMMANDS)
   pan_left(speed)                 // start moving with a speed from 0 to 15. 0 means stop
   pan_right(speed)                // start moving with a speed from 0 to 15. 0 means stop
   tilt_up(speed)                  // start moving with a speed from 0 to 15. 0 means stop
   tilt_down(speed)                // start moving with a speed from 0 to 15. 0 means stop
   stop()                          // stop the pan and the tilt

 SHUTDOWN
   close()                         // closes the class and frees resources

SERVO SIGNAL
After 2 seconds the servo PWM drive signal on the Pimoroni board is turned off.
