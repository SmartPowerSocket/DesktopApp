// https://community.particle.io/t/using-spark-publish-json-format/12700

/*
{
    "event": "getServerInformation",
    "url": "https://492e0481.ngrok.io/getServerInformation",
    "requestType": "GET",
    "headers": {
        "Content-Type": "application/json"
  },
    "json": {
        "apiKey": "{{apiKey}}"
    },
    "mydevices": true
}

{
    "event": "sendSocketInformation",
    "url": "https://492e0481.ngrok.io/sendSocketInformation",
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
    String jsonSendSocketInformation = String( "{ \"current\":" + String(10) + ",\"tension\":" + String(10) + ",\"apiKey\":" + String(20) +"}");
    String jsonGetServerInformation = String( "{ \"apiKey\":" + String(20) + "}" );
    
    // Trigger the webhook
    Particle.publish("sendSocketInformation", jsonSendSocketInformation, PRIVATE);
    
    // Wait 5 seconds
    delay(5000);
    
    Particle.publish("getServerInformation", jsonGetServerInformation, PRIVATE);
    
    // Wait 5 seconds
    delay(5000);
}

