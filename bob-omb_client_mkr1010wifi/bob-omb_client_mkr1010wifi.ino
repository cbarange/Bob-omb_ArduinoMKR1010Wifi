#include <WiFiNINA.h>
#include <Wire.h> // I2C Library
#include <utility/wifi_drv.h> // Integrate RGB LED


int buttonUp_State, buttonLeft_State, buttonDown_State, buttonRight_State, buttonSelect_State = 0;         // variable for reading the pushbutton status
const int buttonUp_Pin = 1;
const int buttonRight_Pin = 2;
const int buttonDown_Pin = 3;
const int buttonLeft_Pin = 4;
const int buttonSelect_Pin = 5;

char ssid[] =  "freebox_mwa"; // "WIFI_LABO"; // "iPhone_mwa";
char pass[] =  "clementbaranger"; //"EpsiWis2018!";// "patate00";
int status = WL_IDLE_STATUS; // the Wifi radio's status

// if you don't want to use DNS (and reduce your sketch size)
// use the numeric IP instead of the name for the server:
//IPAddress server(74,125,232,128);  // numeric IP for Google (no DNS)
char server[] = "arduinomkr1010.free.beeceptor.com";    // name address for Google (using DNS)
// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):
WiFiClient client;


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
  while (!Serial);  
  WiFiDrv::pinMode(25, OUTPUT); // RBG Integrated LED
  WiFiDrv::pinMode(26, OUTPUT);
  WiFiDrv::pinMode(27, OUTPUT);
  
  pinMode(buttonUp_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonRight_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonDown_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonLeft_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  pinMode(buttonSelect_Pin, INPUT_PULLUP);  // initialize the pushbutton pin as an input:
  
  /*
  while (status != WL_CONNECTED) { // attempt to connect to Wifi network:
    Serial.print("Attempting to connect to network: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);

    // wait 10 seconds for connection:
    delay(5000);
  }
  
  Serial.println("You're connected to the network"); // you're connected now, so print out the data:

  Serial.println("----------------------------------------");
  printWifiStatus();
  Serial.println("----------------------------------------");

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
  //delay(10000);
  //printWifiStatus();
  //Serial.println("----------------------------------------");

  //led_rgb_integrate();

  // read the state of the pushbutton value:
  buttonUp_State = digitalRead(buttonUp_Pin);
  buttonRight_State = digitalRead(buttonRight_Pin);
  buttonDown_State = digitalRead(buttonDown_Pin);
  buttonLeft_State = digitalRead(buttonLeft_Pin);
  buttonSelect_State = digitalRead(buttonSelect_Pin);
  

  // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
  if (buttonUp_State == LOW) {
    Serial.println("UP");    
  } 
  else if  (buttonRight_State == LOW) {
    Serial.println("RIGHT");    
  } 
  else if (buttonDown_State == LOW) {
    Serial.println("DOWN");    
  } 
  else if (buttonLeft_State == LOW) {
    Serial.println("LEFT");    
  } 
  else if (buttonSelect_State == LOW) {
    Serial.println("SELECT");    
  }
  
  delay(500);
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
  delay(1000);
  WiFiDrv::analogWrite(25, 255); // FULL GREEN
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 0);
  delay(1000);
  WiFiDrv::analogWrite(25, 0); // FULL RED
  WiFiDrv::analogWrite(26, 255);
  WiFiDrv::analogWrite(27, 0);
  delay(1000);
  WiFiDrv::analogWrite(25, 0); // FULL BLUE
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 255);
  delay(1000);
  WiFiDrv::analogWrite(25, 0); // OFF LED
  WiFiDrv::analogWrite(26, 0);
  WiFiDrv::analogWrite(27, 0);
  delay(1000);
}
