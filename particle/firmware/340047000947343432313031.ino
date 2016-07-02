/* 
https://community.particle.io/t/using-spark-publish-json-format/12700

 {
     "event": "getServerInformation",
     "url": "https://d76a6af1.ngrok.io/getServerInformation",
     "requestType": "GET",
     "headers": {
         "Content-Type": "application/json"
     },
     "mydevices": true
 }

 {
     "event": "sendSocketInformation",
     "url": "https://d76a6af1.ngrok.io/sendSocketInformation",
     "requestType": "POST",
     "headers": {
         "Content-Type": "application/json"
     },
     "json": {
         "tension": "{{tension}}",
         "current": "{{current}}",
         "apiKey": "{{apiKey}}"
     },
     "mydevices": true
 }
 */

String status = "Inactive";

void setup() {
  // Subscribe to the webhook response event
  Particle.subscribe("hook-response/sendSocketInformation", photonRequestReturn , MY_DEVICES);
  Particle.subscribe("hook-response/getServerInformation", serverRequestReturn , MY_DEVICES);
}

void photonRequestReturn(const char *event, const char *data) { }

void serverRequestReturn(const char *event, const char *data)
{
    if (data) {
        if (strstr(data, "Active") != NULL) {
            status = "Active";
        } else if (strstr(data, "Inactive") != NULL) {
            status = "Inactive";
        } else if (strstr(data, "Deleted") != NULL) {
            status = "Deleted";
        }
    }
}

void loop() {
    if (Particle.connected() == false && status != "Deleted") {
         Particle.connect();
    } else if (status == "Deleted") {
         Particle.disconnect();
    }

    if (status == "Active") {

        // Send reading data
        String jsonSendSocketInformation = String( "{ \"current\":" + String(random(300)) + ",\"tension\":" + String(random(300)) + ",\"apiKey\": \"" + String("b9b8d2b70253186ccc1b23510360b5b9730537db2c6a19c7949d07eb6c3111a3376f87f43698025ce039f51b64a3f41fa7f606c04b7b594fb6e56fa7caa26b26") + "\"}");
            
        // Trigger the webhook
        Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
        
        // Wait 5 seconds
        delay(5000);
    }

    if (status != "Deleted") {
        // Send auth data
        String jsonGetServerInformation = String( "{ \"apiKey\": \"" + String("b9b8d2b70253186ccc1b23510360b5b9730537db2c6a19c7949d07eb6c3111a3376f87f43698025ce039f51b64a3f41fa7f606c04b7b594fb6e56fa7caa26b26") + "\"}" );

        Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);
        
        // Wait 5 seconds
        delay(5000);
    }
}
