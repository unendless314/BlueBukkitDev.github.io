function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

function normalizeDegrees(degrees) {
    return (degrees % 360 + 360) % 360;
}

if (typeof module !== 'undefined') {
    module.exports = { degToRad, radToDeg, normalizeDegrees };
}
