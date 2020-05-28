
export class Shape {
    constructor(color='black') { 
        if (this.constructor === Shape) {
            throw new TypeError('Abstract class "Shape" connot be instantiated directly.');
        }

        this.color = color;
    }

    getColor() {
        return this.color;
    }
}

export class Circle extends Shape {
    constructor(radius, color='black') {
        super(color);
        this.radius = radius;
    }

    getRadius() {
        return this.radius;
    }
}

export class Arm extends Shape {
    constructor(offsetVector, sizeVector, connectionAngle = 0, color='black') {
        super(color);
        this.offsetVector = offsetVector;
        this.sizeVector = sizeVector;
        this.connectionAngle = connectionAngle;
    }

    getOffset() {
        return this.offsetVector;
    }

    getSize() {
        return this.sizeVector;
    }

    getConnectionAngle() {
        return this.connectionAngle;
    }
}