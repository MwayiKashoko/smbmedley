const random = (min, max) => {
        return Math.floor(Math.random()*(max-min+1))+min;
}

const dtr = (angle) => {
        return angle*Math.PI/180;
}

const rtd = (angle) => {
        return angle*180/Math.PI;
}
