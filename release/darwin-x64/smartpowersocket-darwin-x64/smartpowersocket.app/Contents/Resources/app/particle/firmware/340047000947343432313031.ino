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
        String jsonSendSocketInformation = String( "{ \"current\":" + String(random(300)) + ",\"tension\":" + String(random(300)) + ",\"apiKey\": \"" + String("2fbecc6396f9c15da22152c13dddf7f9c227b05a7b23fd0f25582dc3e92afac25408f2b17b9fef01ab09f82054fb073ffedf6c79ba3f65b7bf02945aedc1b671") + "\"}");
            
        // Trigger the webhook
        Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
        
        // Wait 5 seconds
        delay(5000);
    }

    if (status != "Deleted") {
        // Send auth data
        String jsonGetServerInformation = String( "{ \"apiKey\": \"" + String("2fbecc6396f9c15da22152c13dddf7f9c227b05a7b23fd0f25582dc3e92afac25408f2b17b9fef01ab09f82054fb073ffedf6c79ba3f65b7bf02945aedc1b671") + "\"}" );

        Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);
        
        // Wait 5 seconds
        delay(5000);
    }
}
