// Bluetoothデバイス
let targetDevice = null;

// micro:bit 加速度サービス
const ACCELEROMETER_SERVICE = "e95d0753-251d-470a-a062-fa1922dfa9a8";

const ACCELEROMETER_DATA = "e95dca4b-251d-470a-a062-fa1922dfa9a8";

const ACCELEROMETER_PERIOD = "e95dfb24-251d-470a-a062-fa1922dfa9a8";

function onClickStartButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  requestDevice();
}

function onClickStopButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  disconnect();
}

function requestDevice() {
  navigator.bluetooth.requestDevice({
    filters: [
      { services: [ACCELEROMETER_SERVICE] },
      { namePrefix: "BBC micro:bit" }
    ]
  })
    .then(device => {
      targetDevice = device;
      connect(targetDevice);
    })
    .catch(error => {
      showModal(error);
      targetDevice = null;
    });
}

function disconnect() {
  if (targetDevice == null) {
    showModal('The target device is null.');
    return;
  }

  targetDevice.gatt.disconnect();
}

function updateAccelerometerValue(x, y, z) {
var xx;
xx = y;
var yy;
yy = x;
var zz;
// 加速度2軸から傾きをけいさん
if(Math.sign(y)==1){
  zz =  Math.round( Math.atan( x / y)*180/Math.PI);
}else{
  zz =  Math.round( Math.atan( x / y)*180/Math.PI)+180*Math.sign(x);
}
//Math.round 四捨五入
  document.getElementsByName("ValueX")[0].innerHTML = "x : " + xx;
  document.getElementsByName("ValueY")[0].innerHTML = "y : " + yy;
  document.getElementsByName("ValueZ")[0].innerHTML = "theta : " + zz;
}

// 加速度に応じて背景色を変える
function updateBackgroundColor(x, y, z) {
  let r = Math.min(Math.abs(Math.round(256.0 * x)), 255);
  let g = Math.min(Math.abs(Math.round(256.0 * y)), 255);
  let b = Math.min(Math.abs(Math.round(256.0 * z)), 255);

  let strR = r.toString(16);
  let strG = g.toString(16);
  let strB = b.toString(16);

  if (strR.length == 1) {
    strR = "0" + strR;
  }

  if (strG.length == 1) {
    strG = "0" + strG;
  }

  if (strB.length == 1) {
    strB = "0" + strB;
  }

  document.body.style.backgroundColor = "#" + strR + strG + strB;
  document.getElementsByName("ValueRGB")[0].innerHTML = "#" + strR + strG + strB;
}

function connect(device) {
  device.gatt.connect()
    .then(server => {
      findAccelerometerService(server);
    })
    .catch(error => {
      showModal(error);
    });
}

function findAccelerometerService(server) {
  server.getPrimaryService(ACCELEROMETER_SERVICE)
    .then(service => {
      findAccelerometerDataCharacteristic(service);
      findAccelerometerPeriodCharacteristic(service);
    })
    .catch(error => {
      showModal(error);
    });
}

function findAccelerometerDataCharacteristic(service) {
  service.getCharacteristic(ACCELEROMETER_DATA)
    .then(characteristic => {
      startAccelerometerDataNotification(characteristic);
    })
    .catch(error => {
      showModal(error);
    });
}


function startAccelerometerDataNotification(characteristic) {
  characteristic.startNotifications()
    .then(char => {
      characteristic.addEventListener('characteristicvaluechanged',
        onAccelerometerDataChanged);
    });
}

function onAccelerometerDataChanged(event) {
  let x = event.target.value.getInt16(0, true) / 1000;
  let y = event.target.value.getInt16(2, true) / 1000;
  let z = event.target.value.getInt16(4, true) / 1000;
  updateAccelerometerValue(x, y, z)
  updateBackgroundColor(x, y, z);
}

function findAccelerometerPeriodCharacteristic(service) {
  service.getCharacteristic(ACCELEROMETER_PERIOD)
    .then(characteristic => {
      writeAccelerometerPeriodValue(characteristic);
    })
    .catch(error => {
      showModal(error);
    });
}

function writeAccelerometerPeriodValue(characteristic) {
  characteristic.writeValue(new Uint16Array([160]))
    .catch(error => {
      showModal(error);
    });
}

function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
}
