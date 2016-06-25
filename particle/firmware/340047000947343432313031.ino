/* 
https://community.particle.io/t/using-spark-publish-json-format/12700

 {
     "event": "getServerInformation",
     "url": "https://70587cf9.ngrok.io/getServerInformation",
     "requestType": "GET",
     "headers": {
         "Content-Type": "application/json"
     },
     "mydevices": true
 }

 {
     "event": "sendSocketInformation",
     "url": "https://70587cf9.ngrok.io/sendSocketInformation",
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

void setup() {
  // Subscribe to the webhook response event
  Particle.subscribe("hook-response/sendSocketInformation", photonRequestReturn , MY_DEVICES);
  Particle.subscribe("hook-response/getServerInformation", serverRequestReturn , MY_DEVICES);
}

void photonRequestReturn(const char *event, const char *data)
{
    Serial.print(event);
    Serial.print(", data: ");
    if (data) {
        Serial.println(data);
    } else {
        Serial.println("NULL");   
    }
}

void serverRequestReturn(const char *event, const char *data)
{
    Serial.print(event);
    Serial.print(", data: ");
    if (data) {
        Serial.println(data);
    } else {
        Serial.println("NULL");   
    }
}

void loop() {
    if (Particle.connected() == false) {
        Particle.connect();
    }
    // Get some data
    String jsonSendSocketInformation = String( "{ \"current\":" + String(random(300)) + ",\"tension\":" + String(random(300)) + ",\"apiKey\": \"" + String("72bcfb8d95bfc0a30c8715492ad96c3ced61de89810344a1c0ab4f5d37d586f2440ebec999e75ae57ae76ce5bc9e17f58e2e13a9f7cd91116aa9ae241eb08f73") + "\"}");
    String jsonGetServerInformation = String( "{ \"apiKey\": \"" + String("72bcfb8d95bfc0a30c8715492ad96c3ced61de89810344a1c0ab4f5d37d586f2440ebec999e75ae57ae76ce5bc9e17f58e2e13a9f7cd91116aa9ae241eb08f73") + "\"}" );
    
    // Trigger the webhook
    Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
    
    // Wait 5 seconds
    delay(5000);
    
    Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);
    
    // Wait 5 seconds
    delay(5000);
}
