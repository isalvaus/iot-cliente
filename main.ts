enum Device {
    Luz,
    Temp
}


let port = 38;

let device = Device.Luz

let temp = 22
let sensorTemp = input.temperature()
let valorPot = 0

//Serial
serial.redirectToUSB()

//radio
radio.setGroup(port);



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
    radio.sendValue("DOOR", 1);
    serial.writeValue("DOOR", 1)
})



loops.everyInterval(500, () => {
    let _valorPot = pins.analogReadPin(AnalogPin.P1)

    if (_valorPot != valorPot ){ 
        radio.sendValue((device == Device.Luz) ? "LUZ" : "TEMP", pins.analogReadPin(AnalogPin.P1));
        serial.writeValue((device == Device.Luz) ? "LUZ" : "TEMP", pins.analogReadPin(AnalogPin.P1))

        valorPot = _valorPot
    }

    if (sensorTemp != input.temperature()){
        serial.writeValue("Sensor Temp", sensorTemp);
        if (sensorTemp < temp) {
            pins.P0.digitalWrite(true);
            serial.writeValue("Radiador:", 1)
        }

        else if (sensorTemp > temp) {
            pins.P0.digitalWrite(false);
            serial.writeValue("Radiador:", 0)
        }

        sensorTemp = input.temperature()
    }

});


// Server




radio.onReceivedValue((command, value) => {
    
    pins.P1.analogWrite(value);
    serial.writeValue(command, value);

    switch (command) {
        case "LUZ":

            serial.writeString("LUZ");
            pins.P2.analogWrite(value);
            break;



        case "TEMP":
            temp = Math.map(value, 0, 1023, -100, 100);
            serial.writeValue("Setting Temp:", temp);
            break;
    }
});





