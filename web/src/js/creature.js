import Victor from 'victor';
import SceneObject from './object';

export class Creature extends SceneObject { 
    constructor(
        id, posVector, shape, isDead = false,
        velocityVector = new Victor(0, 0), angle = 0, angleVelocity = 0
    ) {
        super(id);
        this.posVector = posVector;
        this.velocityVector = velocityVector;
        this.angle = angle;
        this.angleVelocity = angleVelocity;
        this.shape = shape;
        this.isDead = isDead;
        this.rotationDiff = 0;  // Производная вращения по времени
    }

    isDead() {
        return this.isDead;
    }

    setPos(posVector) {
        this.posVector = posVector;
    }

    setVelocity(velocityVector) {
        this.velocityVector = velocityVector;
    }

    setAngleVelocity(angleVelocity) {
        this.angleVelocity = angleVelocity;
    }

    getPos() {
        return this.posVector;
    }

    getVelocity() {
        return this.velocityVector;
    }

    getShape() {
        return this.shape;
    }

    getAngle() {
        return this.angle;
    }

    move(timeDelta) {
        let frameVelocityVector = this.velocityVector.clone();

        frameVelocityVector.multiplyScalar(timeDelta);
        this.posVector.add(frameVelocityVector);
        this.rotationDiff = timeDelta * this.angleVelocity;
        this.angle = (this.angle + this.rotationDiff) % 360;
    }
}

export class ComposedCreature extends Creature {
    constructor(
        id, posVector, shape, components = new Array(), isDead = false,
        velocityVector = new Victor(0, 0), angle = 0, angleVelocity = 0
    ) {
        super(id, posVector, shape, isDead, velocityVector, angle, angleVelocity);
        this._childComponents = components;
    }

    addChildObject(component) {
        this._childComponents.push(component);
    }

    setChildObjects(components) {
        this._childComponents = components;
    }

    getChildObjects() {
        return this._childComponents;
    }
}