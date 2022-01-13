#include <WiFiNINA.h>
#include <ArduinoMqttClient.h>
#include <Wire.h> // I2C Library
#include <utility/wifi_drv.h> // Integrate RGB LED

int buttonUp_State, buttonLeft_State, buttonDown_State, buttonRight_State, buttonSelect_State = 0;         // variable for reading the pushbutton status
const int buttonUp_Pin = 1;
const int buttonRight_Pin = 2;
const int buttonDown_Pin = 3;
const int buttonLeft_Pin = 4;
const int buttonSelect_Pin = 5;

char ssid[] =  "iPhone_mwa"; // "freebox_mwa"; // "WIFI_LABO"; // 
char pass[] =  "patate00"; // "clementbaranger"; //"EpsiWis2018!";// 
byte mac[6];
int status = WL_IDLE_STATUS; // the Wifi radio's status

// if you don't want to use DNS (and reduce your sketch size)
// use the numeric IP instead of the name for the server:
//IPAddress server(74,125,232,128);  // numeric IP for Google (no DNS)
char server[] = "arduinomkr1010.free.beeceptor.com";    // name address for Google (using DNS)
// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):
WiFiClient client;

MqttClient mqttClient(client);

const char broker[] = "172.20.10.3";
int port = 1883;

//set interval for sending messages (milliseconds)
const long interval = 150;
unsigned long previousMillis = 0;

int count = 0;

String player_id;

String mac2String(byte ar[]) {
  String s;
  for (byte i = 0; i < 6; ++i)
  {
    char buf[3];
    sprintf(buf, "%02X", ar[i]); // J-M-L: slight modification, added the 0 in the format for padding 
    s += buf;
    if (i < 5) s += ':';
  }
  return s;
}

void printWifiStatus() {
  Serial.println("Board Information:");// print your board's IP address:  
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  Serial.println(); // print SSID :
  Serial.println("Network Information:");
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  long rssi = WiFi.RSSI(); // print the received signal strength:
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void setup() {  
  Serial.begin(9600); //Initialize serial and wait for port to open:
  //while (!Serial); 
  
  WiFiDrv::pinMode(25, OUTPUT); // RBG Integrated LED
  WiFiDrv::pinMode(26, OUTPUT);
  WiFiDrv::pinMode(27, OUTPUT);
  
  pinMode(buttonUp_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonRight_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonDown_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonLeft_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonSelect_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  
  Serial.println("MKR1010Wifi Started !");
  WiFi.macAddress(mac);
  player_id = mac2String((byte*) &mac);
  Serial.println("Player Id = "+player_id);
  
  // Wifi
  while (status != WL_CONNECTED) { // attempt to connect to Wifi network:
    Serial.print("Attempting to connect to network: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
    // wait 8 seconds for connection:
    delay(8000);
  }
  Serial.println("You're connected to the network"); // you're connected now, so print out the data:
  Serial.println("----------------------------------------");
  printWifiStatus();
  Serial.println("----------------------------------------");

  // MQTT
  Serial.print("Attempting to connect to the MQTT broker: ");
  Serial.println(broker);
  if (!mqttClient.connect(broker, port)) {
    Serial.print("MQTT connection failed! Error code = ");
    Serial.println(mqttClient.connectError());
    while (1);
  }
  Serial.println("You're connected to the MQTT broker!");
  Serial.println();
  mqttClient.beginMessage("register");
  mqttClient.print(player_id);
  mqttClient.endMessage();
  /*
  Serial.println("\nStarting connection to server...");
 // if you get a connection, report back via serial:
 if (client.connect(server, 80)) {
    Serial.println("connected to server");
    // Make a HTTP request:
    client.println("GET /search?q=arduino HTTP/1.1");    
    client.println("Host: "+String(server));
    client.println("Connection: close");
    client.println();
  }
  */
}

void loop() {
  // check the network connection once every 10 seconds:
  mqttClient.poll();

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // save the last time a message was sent
    previousMillis = currentMillis;
    // read the state of the pushbutton value:
    buttonUp_State = digitalRead(buttonUp_Pin);
    buttonRight_State = digitalRead(buttonRight_Pin);
    buttonDown_State = digitalRead(buttonDown_Pin);
    buttonLeft_State = digitalRead(buttonLeft_Pin);
    buttonSelect_State = digitalRead(buttonSelect_Pin);
      
    // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
    if (buttonUp_State == LOW) {
      Serial.println("UP");   
      mqttClient.beginMessage(player_id+"/move");
      mqttClient.print("UP");
      mqttClient.endMessage();
 
    } 
    else if  (buttonRight_State == LOW) {
      Serial.println("RIGHT");    
      mqttClient.beginMessage(player_id+"/move");
      mqttClient.print("RIGHT");
      mqttClient.endMessage();
    } 
    else if (buttonDown_State == LOW) {
      Serial.println("DOWN");    
      mqttClient.beginMessage(player_id+"/move");
      mqttClient.print("DOWN");
      mqttClient.endMessage();
    } 
    else if (buttonLeft_State == LOW) {
      Serial.println("LEFT");    
      mqttClient.beginMessage(player_id+"/move");
      mqttClient.print("LEFT");
      mqttClient.endMessage();
    } 
    else if (buttonSelect_State == LOW) {
      Serial.println("SELECT");    
      mqttClient.beginMessage(player_id+"/move");
      mqttClient.print("SELECT");
      mqttClient.endMessage();
    }
  }
  
  //led_rgb_integrate();

  
  //delay(500);
  /*while (client.available()) { // if there are incoming bytes available // from the server, read them and print them:  
    char c = client.read();
    Serial.write(c);
  }

  
  if (!client.connected()) { // if the server's disconnected, stop the client:
    Serial.println();
    Serial.println("disconnecting from server.");
    client.stop();
    // do nothing forevermore:
    while (true);
  }*/
}


void led_rgb_integrate(){
  // Integrate RGB LED
  WiFiDrv::analogWrite(25, 135); //GREEN  
  WiFiDrv::analogWrite(26, 50);   //RED  
  WiFiDrv::analogWrite(27, 198);   //BLUE
  delay(200);
  WiFiDrv::analogWrite(25, 255); // FULL GREEN
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 0);
  delay(200);
  WiFiDrv::analogWrite(25, 0); // FULL RED
  WiFiDrv::analogWrite(26, 255);
  WiFiDrv::analogWrite(27, 0);
  delay(200);
  WiFiDrv::analogWrite(25, 0); // FULL BLUE
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 255);
  delay(50);
  WiFiDrv::analogWrite(25, 0); // OFF LED
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 0);
  delay(0);
}
