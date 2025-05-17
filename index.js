// ==== Galactic Center Calculation Functions ====

//To run, use python3 -m http.server 8080
 
// Constants
const RA_GALACTIC_CENTER = 266.4167; // degrees
const DEC_GALACTIC_CENTER = -29.0078; // degrees
let blackPixelCounts = []; // array of black pixel counts per column of graph
let imageLoaded = false;

function decimalHoursToHMS(decimalHours) {
    const h = Math.floor(decimalHours);
    const m = Math.floor((decimalHours - h) * 60);
    const s = (((decimalHours - h) * 60 - m) * 60);
    return { hours: h, minutes: m, seconds: s };
}

function calculateJulianDate(year, month, day, utcDecimalHours) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    const dayFraction = utcDecimalHours / 24;
    const JD = Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + B - 1524.5 + dayFraction;
    return JD;
}

function calculateGMST(JD) {
    const D = JD - 2451545.0;
    const GMST = 280.46061837 + 360.98564736629 * D;
    return normalizeDegrees(GMST) / 15; // degrees to hours
}

function getLocalSiderealTime(year, month, day, localTimeDecimal, longitude) {
    const timezoneOffsetHours = new Date().getTimezoneOffset() / 60; 
    const utcTimeDecimal = (localTimeDecimal + timezoneOffsetHours + 24) % 24;
    const JD = calculateJulianDate(year, month, day, utcTimeDecimal);
    const GMST = calculateGMST(JD);
    let LST = (GMST + longitude / 15) % 24;
    if (LST < 0) LST += 24;
    return LST;
}

function getGalacticCenterPosition(latitude, LST_decimal) {
    const latRad = degToRad(latitude);
    const decRad = degToRad(DEC_GALACTIC_CENTER);

    let HA = LST_decimal * 15 - RA_GALACTIC_CENTER;
    HA = ((HA + 540) % 360) - 180;
    const HARad = degToRad(HA);

    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(HARad);
    const altitude = radToDeg(Math.asin(sinAlt));

    const cosAlt = Math.cos(Math.asin(sinAlt));
    const sinAz = (-Math.cos(decRad) * Math.sin(HARad)) / cosAlt;
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * cosAlt);
    let azimuth = radToDeg(Math.atan2(sinAz, cosAz));
    azimuth = (azimuth + 360) % 360;

    return {
        altitude: altitude,
        azimuth: azimuth
    };
}

// ==== Application Logic ====

let latitude = 29.7604;
let longitude = -95.3698;

function updateDisplay() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const localDecimalTime = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;

    const LST_decimal = getLocalSiderealTime(year, month, day, localDecimalTime, longitude);
    const lstHMS = decimalHoursToHMS(LST_decimal);

    const position = getGalacticCenterPosition(latitude, LST_decimal);

    const effectPercent = getEffectPercentAtLST(LST_decimal);

    // Determine color
    let color = 'aqua';
    if (effectPercent < 0) {
        color = 'orange';
    } else if (effectPercent >= 120) {
        color = 'limegreen';
    }
    
    // Build formatted HTML
    document.getElementById('lst').innerHTML = `LST: ${lstHMS.hours.toString().padStart(2, '0')}:${lstHMS.minutes.toString().padStart(2, '0')}:${lstHMS.seconds.toFixed(0).padStart(2, '0')} <span style="color:${color}">(${effectPercent.toFixed(0)}%)</span>`;
    document.getElementById('position').innerText = `Altitude: ${position.altitude.toFixed(2)}°, Azimuth: ${position.azimuth.toFixed(2)}°`;
}

document.getElementById('updateBtn').addEventListener('click', () => {
    latitude = parseFloat(document.getElementById('latitude').value);
    longitude = parseFloat(document.getElementById('longitude').value);
});

document.getElementById('gpsBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        document.getElementById('latitude').value = latitude.toFixed(6);
        document.getElementById('longitude').value = longitude.toFixed(6);
    });
});

function loadEffectImage(callback) {
    effectImage = new Image();
    effectImage.src = 'images/RV Effect_binary.png'; // Assuming it's in same directory
    effectImage.crossOrigin = "Anonymous"; // Allow pixel reading

    effectImage.onload = () => {
        canvas = document.createElement('canvas');
        canvas.width = effectImage.width;
        canvas.height = effectImage.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(effectImage, 0, 0);
        imageLoaded = true;

        // Precompute black pixel counts for each column
        precomputeBlackPixelCounts();

        if (callback) callback();
    };
}

function precomputeBlackPixelCounts() {
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    blackPixelCounts = new Array(imgWidth).fill(0);

    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

    for (let x = 0; x < imgWidth; x++) {
        let count = 0;
        for (let y = 0; y < imgHeight; y++) {
            const index = (y * imgWidth + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const a = imageData[index + 3];

            if (r === 0 && g === 0 && b === 0 && a !== 0) {
                count++;
            }
        }
        blackPixelCounts[x] = count;
    }
}

function getEffectPercentAtLST(LST_decimal) {
    if (!imageLoaded) {
        loadEffectImage(true);
    }

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const x = Math.floor((LST_decimal / 24) * imgWidth);
    const clampedX = Math.min(Math.max(x, 0), imgWidth - 1);

    const blackPixelCount = blackPixelCounts[clampedX];
    const fractionBlack = blackPixelCount / imgHeight;

    const effect = -2 + 8 * fractionBlack;
    const percent = effect * 100;

    return percent;
}

// Update every second
setInterval(updateDisplay, 1000);

// Initial update
updateDisplay();
