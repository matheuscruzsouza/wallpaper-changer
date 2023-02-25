#!/usr/bin/python3

from PyQt5.QtWidgets import (QMainWindow, QFileDialog, QApplication)
from pathlib import Path

import sys
import websocket
import json
import uuid

app = QApplication(sys.argv)

argsdict = {}

for farg in sys.argv:
    if farg.startswith('--'):
        (arg, val) = farg.split("=")
        arg = arg[2:]
        argsdict[arg] = val

class Layout(QMainWindow):

    def __init__(self, app):
        super().__init__()
        self.app = app

    def initUI(self, title, event):
        home_dir = str(Path.home())
        fname = QFileDialog.getExistingDirectory(self, title, home_dir)
        return build_response({
            "event": event,
            "data": { "folder": fname }
        })

def build_response(data):
    return json.dumps({
        "id": str(uuid.uuid4()),
        "method": "app.broadcast",
        "accessToken": argsdict['nl-token'],
        "data": data
    })

def open_folder(title='Open folder', event="openFolder"):
    func = Layout(app)

    return func.initUI(title, event)

functions = {
    "openFolder":
    lambda x, event: open_folder(x, event),
    "extClientConnect":
    lambda _, event: build_response({
        "event": event,
        "data": None
    })
}

def on_message(websocket, message):
    print(message)

    event = json.loads(message)['event']

    reply = functions[event]("Selecionar pasta", event)

    websocket.send(reply)

def on_close():
    sys.exit(1)

addr = 'ws://localhost:' + argsdict['nl-port'] + '?extensionId=' + argsdict['nl-extension-id']

wsapp = websocket.WebSocketApp(addr, on_message=on_message, on_close=on_close)
wsapp.run_forever()
