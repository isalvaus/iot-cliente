enum Device {
    Luz,
    Temp
}


let port = 38;

let device = Device.Luz

let temp = 22
let valorPot = 0

//Serial
serial.redirectToUSB()

//radio
radio.setGroup(port);


let data = {
    command: "",
    value: 0
};


input.onLogoEvent(TouchButtonEvent.Touched, () => {
    if (device == Device.Luz) {
        serial.writeValue("Device", device)
        device = Device.Temp;
    }
    else {
        serial.writeValue("Device", device)
        device = Device.Luz;
    }
})


input.onButtonPressed(Button.A, function () {
    data.command = "DOOR";
    data.value = 1;
    radio.sendString(JSON.stringify(data));
    serial.writeString(JSON.stringify(data))
})



loops.everyInterval(500, () => {
    let _valorPot = pins.analogReadPin(AnalogPin.P1)

if (_valorPot != valorPot )
  {  data.command = (device == Device.Luz) ? "LUZ" : "TEMP";
    data.value = pins.analogReadPin(AnalogPin.P1)
    radio.sendString(JSON.stringify(data));
    serial.writeString("Sending value" + JSON.stringify(data))
    pins.P2.analogWrite(data.value);

    valorPot = _valorPot
}
    let sensorTemp = input.temperature();
    serial.writeValue("Sensor Temp", sensorTemp);
    if (sensorTemp < temp) {
        pins.P0.digitalWrite(true);
        serial.writeValue("Radiador", 1)
    }

    else if (sensorTemp > temp) {
        pins.P0.digitalWrite(false);
        serial.writeValue("Radiador", 0)
    }
});


// Server




radio.onReceivedString((dataReceived) => {
    port = 38
    
    basic.showIcon(IconNames.Heart)

    let data = JSON.parse(dataReceived);
    pins.P1.analogWrite(data.value);
    serial.writeString("Data received" + dataReceived);

    switch (data.command) {
        case "LUZ":

            //	Serial.println("LUZ");

            pins.P2.analogWrite(data.value);
            break;



        case "TEMP":
            temp = Math.map(data.value, 0, 1023, -100, 100);
            serial.writeValue("Setting Temp:", temp);
            break;
    }
});





