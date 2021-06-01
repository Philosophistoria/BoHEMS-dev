'use strict';

const serialcom = {}
const SerialPort = require('serialport');
serialcom.port = new SerialPort('/dev/ttyS4', {
    baudRate: 921600
});

serialcom.port.on('open', function () {
    console.log('Serial open.');
});

serialcom.port.on('data', function (data) {
    //console.log(data.toString());
    process.stdout.write(data.toString());
});

serialcom.write = (data) => {
    console.log('Write: \n' + data);
    serialcom.port.write(data, function (err, results) {
        if (err) {
            console.log('Err: ' + err);
            console.log('Results: ' + results);
        }
    });
};

process.stdin.setRawMode(true);
process.stdin.on("data", (data) => {
    if (data == '\x03') {
        process.exit();
    }
    serialcom.write(data);
    //console.log(data);
});

const wsclient = {};
const websocket = require("ws");
wsclient.sock = new websocket("ws://54.168.9.34:5001", {
//wsclient.sock = new websocket("ws://127.0.0.1:5001", {
    perMessageDeflate: false
});

wsclient.sock.on("open", () => {
    console.log("event as connected");
    //console.log(wsclient.sock.ping()); 
});

wsclient.sock.on("message", payload => {
    let message_type = undefined;
    let message = {};
    // parse payload
    // A json type message is supposed to contain
    // - request: {"Can I try?", "disconnect", "start", "stop"},
    // - option : {1,2,3,4}; these are opted when "start" is requested,
    // - name : name who requests
    try {
        message_type = 'JSON';
        message = JSON.parse(payload);
    } catch (e) {
        if (typeof (payload) === String) {
            message_type = 'String';
            message = payload;
        }
    }
    finally {
        console.log(payload);
    }
    // response
    if (message_type == "String") {
        console.log(message);
    }
    else if (message_type == "JSON") {
        console.log("json: " + message);
        if (message.response == "start") {
            serialcom.write(message.option.finger + 'S');
        }
        else if (message.response == "stop") {
            serialcom.write(message.option.finger + 'P');
        }
    }
});

wsclient.sock.on("close", () => {
    console.log("event as closed");
});

wsclient.sock.on("error", () => {
    console.log("event as some error occurs");
});
