/*      ###############################################
        ###         FIRMWARE IMPLEMENTATIONS         ##
        ###############################################

        <04/09/2016> * Implemented the logic to detect the voltage and print the value in the serial port.

        <11/09/2016> * Implemented a simple communication with the Blynk App to show the values calculated by the firmware in the app.

        <18/09/2016> * Implemented the function to activate and deactivate both relays (1 and 2) through debounced pushbuttons.

        <20/09/2016> * Implemented the system to SEMI_AUTOMATIC mode to allow the code to run normally even when not connected to a Wi-Fi connection.

        <05/10/2016> * Implemented Irms current calculation using Emonlib library.

        <08/10/2016> * Calibration of current sensors and uptade of the interface with Blynk App.

        <09/10/2016> * Code cleaning

        <13/10/2016> * Implemented logic for non-states of the system related to undesired behavior of the physical pushbuttons.

        <6/11/2016> * Add support for webhooks and server communication.
*/

/*  WEBHOOK SETUP - START */
/*
    https://community.particle.io/t/using-spark-publish-json-format/12700

     {
         "event": "getServerInformation",
         "url": "http://api.smartpowersocket.xyz/getServerInformation",
         "requestType": "GET",
         "headers": {
             "Content-Type": "application/json"
         },
         "mydevices": true
     }

     {
         "event": "sendSocketInformation",
         "url": "http://api.smartpowersocket.xyz/sendSocketInformation",
         "requestType": "POST",
         "headers": {
             "Content-Type": "application/json"
         },
         "json": {
             "tension": "{{tension}}",
             "current": "{{current}}",
             "socketNum": "{{socketNum}}",
             "apiKey": "{{apiKey}}"
         },
         "mydevices": true
     }
*/
/*  WEBHOOK SETUP - END */

/* INCLUDE LIBRARIES */
#include "blynk.h"        // includes Blynk app library
#include <math.h>               // includes the math library
#include "EmonLib.h"    // includes Energy Monitoring library (Emonlib)

/* SEMI_AUTOMATIC SYSTEM MODE FOR WORKING OFFLINE - START */
SYSTEM_MODE(SEMI_AUTOMATIC)
SYSTEM_THREAD(ENABLED)

/* VARIABLES WiFi CONNECTION*/
const uint32_t msRetryDelay =  60000; // retry every 1min
const uint32_t msRetryTime  =  4*60000; // stop trying after 4min
bool   retryRunning = false;
Timer retryTimer(msRetryDelay, retryConnect);  // timer to retry connecting
Timer stopTimer(msRetryTime, stopConnect);     // timer to stop a long running try

/* SEMI_AUTOMATIC SYSTEM MODE FOR WORKING OFFLINE - END */

/* CREATE INSTANCES OF THE EMONLIB LIBRARY */
EnergyMonitor emon0;                   // Create an instance of Emonlib for reading sensorPin0
EnergyMonitor emon1;                   // Create an instance of Emonlib for reading sensorPin1

/* AUTHENTICATION OF BLYNK APP */
char auth[] = "8f288167bdf746dc9a0b810a81f07567";       //Authentication Token from Blynk App

/* CURRENT SENSORS */
int sensorPin0 = A0; // 20A SENSOR
int sensorPin1 = A1; // 30A SENSOR
double Irms0 = 0;   // Initialization of Irms current variable for 20A sensor
double Irms1 = 0;   // Initialization of Irms current variable for 30A sensor

/* VOLTAGE SENSOR */
int voltage_pin = A2;

/* RELAYS */
int relay1 = D6;
int relay2 = D5;

/* PHYSICAL PUSHBUTTONS */
int pushbutton1 = D3;
int pushbutton2 = D4;

/* INITIALIZE THE RELAYS AS LOW, WHICH FOR THE RELAY BOARD MEANS ON*/
volatile int state_relay1 = LOW;       // Initialize the relay 1
volatile int state_relay2 = LOW;       // Initialize the relay 2

/* PHOTON STATUS */
String statuses[] = {"Inactive", "Inactive"};

void setup() {

    /* SERIAL COMMUNICATION */
    Serial.begin(9600);

    // Subscribe to the webhook response event
    Particle.subscribe("hook-response/sendSocketInformation", photonRequestReturn , MY_DEVICES);
    Particle.subscribe("hook-response/getServerInformation", serverRequestReturn , MY_DEVICES);

    /* VOLTAGE SENSOR PIN */
    pinMode(voltage_pin, INPUT);     // Input Pin for the voltage sensor

    /* CURRENT SENSORS PINS */
    pinMode(sensorPin0, INPUT);
    pinMode(sensorPin1, INPUT);

    /* CREATE AND CALIBRATE AN INSTANCE OF EAMON LIBRARY FOR CURRENT READING ONLY */
    emon0.current(sensorPin0, 1);             // Current: input pin, calibration (No calibration necessary, ACS712 current sensor 20A)
    emon1.current(sensorPin1, 1.3333333);             // Current: input pin, calibration (30A Sensor ACS712, which is 1 1/3 of the 20A sensor, then we have 1.3333...)

    /* BLYNK APP AUTHENTICATION */
    Blynk.begin(auth);               // All the Blynk magic happens here

    /* SET RELAY PINS AND INTERRUPTIONS - START */
    pinMode(relay1, OUTPUT);                                  //setup of relay1 as output on Photon
    pinMode(pushbutton1, INPUT_PULLUP);                      //setup pushbutton1 as an input with the Pullup resistor enabled (nomally high or 3V3)
    attachInterrupt(pushbutton1, toggle_relay1, FALLING);   //attach the interruption to toggle the state_relay1 and happen when the negative edge of the signal from pushbutton1

    pinMode(relay2, OUTPUT);                                 //setup of relay2 as output on Photon
    pinMode(pushbutton2, INPUT_PULLUP);                     //setup pushbutton2 as an input with the Pullup resistor enabled (nomally high or 3V3)
    attachInterrupt(pushbutton2, toggle_relay2, FALLING);  //attach the interruption to toggle the state_relay2 and happen when the negative edge of the signal from pushbutton2
    /* SET RELAY PINS AND INTERRUPTIONS - END */

    /* TURN OFF WiFi IF NO LUCK CONNECTING - START */
    Particle.connect();
    if (!waitFor(Particle.connected, msRetryTime)) {
        WiFi.off();                // no luck, no need for WiFi
    }
    /* TURN OFF WiFi IF NO LUCK CONNECTING - END */
}

void loop() {

/* Get and calculate the AC voltage */
    double voltage = get_voltage();

/* CALCULATE IRMS CURRENT AND APPARENT POWER FOR BOTH SENSORS - START */
    Irms0 = get_Irms0_current();
    double potencia1 = voltage * Irms0;     // Calculate the apparent power

    Irms1 = get_Irms1_current();
    double potencia2 = voltage * Irms1;     // Calculate the apparent power
 /* CALCULATE IRMS CURRENT FOR BOTH SENSORS - END */

/* BLYNK FUNCTIONS  - START */
    Blynk.run();        //Starts blynk's app functions
    Blynk.virtualWrite(V0, voltage);        //Send information the voltage (in Volts) to V2 of Blynk App
    Blynk.virtualWrite(V1, Irms0);        //Send information the voltage (in Volts) to V2 of Blynk App
    Blynk.virtualWrite(V2, potencia1);        //Send information the voltage (in Volts) to V2 of Blynk App
    Blynk.virtualWrite(V3, Irms1);        //Send information the voltage (in Volts) to V2 of Blynk App
    Blynk.virtualWrite(V4, potencia2);        //Send information the voltage (in Volts) to V2 of Blynk App

    // Send state of the relays 1 and 2 to Blynk App through virtual LEDs
    if(state_relay1 == HIGH){
        Blynk.virtualWrite(V5, 0);          // OFF
    }
    else{
        Blynk.virtualWrite(V5, 1023);       // ON
    }
    if(state_relay2 == HIGH){
        Blynk.virtualWrite(V6, 0);
    }
    else{
        Blynk.virtualWrite(V6, 1023);
    }
/* BLYNK FUNCTIONS  - END */

/* SERIAL PRINTS - START */
    Serial.print("Voltage (V): ");
    Serial.print(voltage);              // Voltage
    Serial.print("      ");
    Serial.print("Corrente1 (A): ");
    Serial.print(Irms0);		            // Irms
    Serial.print("      ");
    Serial.print("Potencia (W): ");
    Serial.print(Irms0*voltage);	       // Apparent power
    Serial.print("      ");
    Serial.print("Socket 1 Status: ");
    Serial.print(statuses[0]);         // Socket 1 status
    Serial.print("      ");
    Serial.print("Socket 2 Status: ");
    Serial.print(statuses[1]);         // Socket 2 status
    Serial.print("      ");
    Serial.println("");
/* SERIAL PRINTS - END */

/* RETRY CONNECTION WITH Wi-Fi - START */
    if (!retryRunning &&
         !Particle.connected() &&
         strstr(statuses[0], "Deleted") == NULL &&
         strstr(statuses[1], "Deleted") == NULL) {
         // if we have not already scheduled a retry and are not connected
         Serial.println("schedule");
         stopTimer.start();         // set timeout for auto-retry by system

          retryRunning = true;
          retryTimer.start();        // schedula a retry
     } else if (strstr(statuses[0], "Deleted") != NULL &&
                strstr(statuses[1], "Deleted") != NULL) {
          Particle.disconnect();
     }
    // Wait 5 seconds
    delay(5000);
/* RETRY CONNECTION WITH Wi-Fi - END */


/* SEND AND GET INFORMATION FROM SERVER - START */
    if (statuses[0] == String("Active")) {
        // Send reading data
        String jsonSendSocketInformation = String(
            "{ \"current\":" + String(random(300)) + // String(Irms0)
             ",\"tension\":" + String(random(300)) + // String(voltage)
             ",\"socketNum\":" + String(1) +
             ",\"apiKey\": \"" + String("{{{apiKey}}}") + "\"}");

        // Trigger the webhook
        Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
    }

    // Wait 5 seconds
    delay(5000);

    if (statuses[1] == String("Active")) {
        // Send reading data
        String jsonSendSocketInformation = String(
            "{ \"current\":" + String(random(300)) + // String(Irms1)
             ",\"tension\":" + String(random(300)) + // String(voltage)
             ",\"socketNum\":" + String(2) +
             ",\"apiKey\": \"" + String("{{{apiKey}}}") + "\"}");

        // Trigger the webhook
        Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
    }

    // Wait 5 seconds
    delay(5000);

    if (statuses[0] != String("Deleted")) {
        // Send auth data
        String jsonGetServerInformation = String(
          "{ \"apiKey\": \"" + String("{{{apiKey}}}") + "\"" +
           ",\"socketNum\": \"" + String(1) +  "\"}" );

        Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);
    }

    // Wait 5 seconds
    delay(5000);

    if (statuses[1] != String("Deleted")) {
        // Send auth data
        String jsonGetServerInformation = String(
          "{ \"apiKey\": \"" + String("{{{apiKey}}}") + "\"" +
           ",\"socketNum\": \"" + String(2) +  "\"}" );

        Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);

    }

    // Wait 5 seconds
    delay(5000);

/* SEND AND GET INFORMATION FROM SERVER - END */
}

//############################
//###   HELPER FUNCTIONS   ###
//############################

/* CALLBACKS FOR BOTH PHOTON REQUESTS (SEND DATA, GET DATA)  - START  */
void photonRequestReturn(const char *event, const char *data) { }

void serverRequestReturn(const char *event, const char *data)
{

    if (data) {
        if (strstr(data, "Socket1") != NULL) {
            if (strstr(data, "Active") != NULL) {
                statuses[0] = String("Active");
            } else if (strstr(data, "Inactive") != NULL) {
                statuses[0] = String("Inactive");
            } else if (strstr(data, "Deleted") != NULL) {
                statuses[0] = String("Deleted");
            }
        } else if (strstr(data, "Socket2") != NULL) {
            if (strstr(data, "Active") != NULL) {
                statuses[1] = String("Active");
            } else if (strstr(data, "Inactive") != NULL) {
                statuses[1] = String("Inactive");
            } else if (strstr(data, "Deleted") != NULL) {
                statuses[1] = String("Deleted");
            }
        } else {
            statuses[0] = String("Deleted");
            statuses[1] = String("Deleted");
        }
    }
}
/* CALLBACKS FOR BOTH PHOTON REQUESTS (SEND DATA, GET DATA)  - END  */


/* RETRY CONNECTION WITH Wi-Fi FUNCTION - START  */
void retryConnect()
{
  if (!Particle.connected())   // if not connected to cloud
  {
    Serial.println("Reconnect");
    stopTimer.start();         // set of the timout time
    WiFi.on();
    Particle.connect();        // start a reconnectino attempt
  }
  else                         // if already connected
  {
    Serial.println("Connected");
    retryTimer.stop();         // no further attempts required
    retryRunning = false;
  }
}

void stopConnect()
{
    Serial.println("Stopped");
    if (!Particle.connected()) { // if after retryTime no connection
        WiFi.off();              // stop trying and swith off WiFi
    }
    stopTimer.stop();
}
/* RETRY CONNECTION WITH Wi-Fi FUNCTION - END  */


/* GET AND CALCULATE VOLTAGE FROM SENSOR - START */
double get_voltage(){

    /*  Helper function to convert the signal from the Photon ADC and convert it to its
    equivalent in AC Voltage. It takes no input parameters and returns a double with
    the output voltage value. */

    double voltage_in;      //variable declaration for returning the converted output signal.

    int adc_value = get_ADC_value(voltage_pin);     //Uses the helper function to

    /*  Conversion formula extracted from lab experiments:

                                                            0.468588284975
                    voltage_in  = 8.05039328055 . (adc_value              )

    */

    voltage_in = 8.05039328055 * (pow(float (adc_value), 0.468588284975) ); /*Conversion formula that takes the adc_value
                                                                            as input and map the voltage it to the result
                                                                            of the equation*/

    return voltage_in;      //return the converted value from ADC to AC voltage.
}
/* GET AND CALCULATE VOLTAGE FROM SENSOR - END */


/* GET ADC VALUE FROM ANALOG PIN - START */
int get_ADC_value(int pin){

    /*  Helper function to read the signal from the analog pin of the ADC.
    It takes an integer as an input parameter 'pin' and returns the value from
    the ADC as another integer. */

    int measurement = analogRead(pin);      //Get the measurement coming into the AD converter pin

    return measurement;     //return the ADC value as an integer.
}
/* GET ADC VALUE FROM ANALOG PIN - END */


/* TOGGLE RELAY FUNCTIONS - START */
void toggle_relay1()
{
    /* Function to toggle_relay1 when the interruption from the falling edge signal from pushbutton1 happens */
    if(digitalRead(pushbutton1) == LOW && digitalRead(pushbutton2) == HIGH){
        state_relay1 = !state_relay1;
        digitalWrite(relay1, state_relay1);       //Writes the state_relay1 to relay 1
    }
}


void toggle_relay2()
{
    /* Function to toggle_relay2 when the interruption from the falling edge signal from pushbutton2 happens */
    if(digitalRead(pushbutton2) == LOW && digitalRead(pushbutton1) == HIGH){
        state_relay2 = !state_relay2;
        digitalWrite(relay2, state_relay2);       //Writes the state_relay2 to relay 2
    }
}

double get_Irms0_current(){

    double Irms0 = emon0.calcIrms(1480);    // Calculate Irms current only |  calcIrms(number_of_Samples)
    Irms0 = ((Irms0 * 10)*1.1145)-0.08;     // Correction: y = ax + b  based on calibration tests.
    if((Irms0 < 0) | (Irms0 < 0.074)){          //Remove residual noise from current sensor
        Irms0 = 0;
    }

    return Irms0;
}

double get_Irms1_current(){
    double Irms1 = emon1.calcIrms(1480);    // Calculate Irms current only |  calcIrms(number_of_Samples)
    Irms1 = ((Irms1 * 10)*1.277);           // Correction: y = ax + b  based on calibration tests.
    if ((Irms1 < 0) | (Irms1 < 0.074)){         //Remove residual noise from current sensor
        Irms1 = 0;
    }

    return Irms1;
}
/* TOGGLE RELAY FUNCTIONS - END */
