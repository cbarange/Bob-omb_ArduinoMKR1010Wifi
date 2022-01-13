#!/bin/env python3

from pynput import keyboard

from paho.mqtt import client as mqtt_client
import time
import random

broker = '172.20.10.3'#'10.0.3.99'
port = 1883
topic="test"
# generate client ID with pub prefix randomly
client_id = f'python-mqtt'
# username = 'emqx'
# password = 'public'

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)
    client = mqtt_client.Client()
    client.on_connect = on_connect
    client.connect(broker, port)
    return client


def publish(client, message, topic):
  result = client.publish(topic, message)
    

client = connect_mqtt()
client.loop_start()

player_id = f'PYTHON_ID_{random.randint(10000,99999)}'

publish(client, player_id,'register')

def on_release(key):
  if '{0}'.format(key) == "Key.up":    
    print('{0}'.format(key))
    publish(client, 'UP',f'{player_id}/move')

  if '{0}'.format(key) == "Key.right":
    print('{0}'.format(key))
    publish(client, 'RIGHT',f'{player_id}/move')

  if '{0}'.format(key) == "Key.down":
    print('{0}'.format(key))
    publish(client, 'DOWN',f'{player_id}/move')

  if '{0}'.format(key) == "Key.left":
    print('{0}'.format(key))
    publish(client, 'LEFT',f'{player_id}/move')

  if '{0}'.format(key) == "Key.space":    
    print('{0}'.format(key))
    publish(client, 'SELECT',f'{player_id}/move')

  if key == keyboard.Key.esc:
    # Stop listener
    return False

# Collect events until released
with keyboard.Listener( on_release=on_release) as listener:
  listener.join()
