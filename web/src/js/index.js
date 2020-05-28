import '../css/style.css';
import * as paper from 'paper';
import {encode, decode} from 'messagepack';
import Victor from 'victor';
import { ComposedCreature, Creature } from './creature';
import { Circle, Arm } from './geometry';

class ViewTreeNode {
	constructor(item = null, parent = null, childs = new Array()) {
		this._item = item;
		this._parent = parent;
		this.setChilds(childs);
	}

	addChild(child) {
		this._childs.push(child);
	}

	setChilds(childs) {
		this._childs = childs;
		childs.forEach(ch => {
			ch.setParent(this);
		});
	}

	setParent(treeNode) {
		this._parent = treeNode;
	}

	getItem() {
		return this._item;
	}

	hasChilds() {
		return this._childs.lenght > 0;
	}

	getChilds() {
		return this._childs;
	}
}

class SceneManager {
	constructor() {
		this.sceneObjects = new Map();
		this.objectsViews = new Map();
	}

	addObject(obj) {
		this.sceneObjects.set(obj.getId(), obj);

		if (obj instanceof Creature) {
			let shape = obj.getShape();

			if (shape instanceof Circle) {
				this.objectsViews.set(obj.getId(),
					new ViewTreeNode(
						new Path.Circle({
							center: obj.getPos().toArray(),
							radius: shape.getRadius(),
							fillColor: shape.getColor()
						})
					)
				);
			}
		}

		if (obj instanceof ComposedCreature) {
			let objectViewIt = this.objectsViews.get(obj.getId());
			if (objectViewIt !== undefined) {
				obj.getChildObjects().forEach(ch => { 
					if (ch instanceof Arm) {
						let armPosition = obj.getPos().clone();
						armPosition.add(ch.getOffset());
						let rect = new Path.Rectangle({
							point: armPosition.toArray(),
							size: ch.getSize().toArray(),
							fillColor: ch.getColor()
						})

						rect.adjustSelfPos = () => { 
							let armPosition = obj.getPos().clone();
							let offset = ch.getOffset()
								.clone()
								.rotateDeg(obj.getAngle());
							armPosition.add(offset);

							rect.position = armPosition.toArray();
							rect.rotate(obj.rotationDiff);
						};

						objectViewIt.addChild(new ViewTreeNode(rect));
						rect.rotate(ch.getConnectionAngle() + obj.getAngle());
					}
				});
			}
		}
		return obj.getId();
	}

	getObject(objectId) {
		return this.sceneObjects.get(objectId);
	}

	step(delta) {
		/* 
			Updating of model positions and views. 
			Delta - passed time in seconds from last step.
		*/

		this.sceneObjects.forEach(obj => {
			let objViewIt = this.objectsViews.get(obj.getId());
			obj.move(delta);
			objViewIt.getItem().position = obj.getPos().toArray();
			objViewIt.getItem().rotate(obj.rotationDiff);

			if (obj instanceof ComposedCreature) {
				objViewIt.getChilds().forEach(chViewIt => { 
					chViewIt.getItem().adjustSelfPos();
				});
			}
		});
	}
}


class ObjectBuilder {
	constructor() {}

	buildShape(shapeSpec) {
		return Circle(20);
	}

	buildComponent(componentSpec) {
	}

	buildObject(objectSpec) {
		let id = objectSpec['objId'];
		let posVector = Victor.fromArray(objectSpec['posVector']);

		if (objectSpec['objectType'] === 'Creature') {
			let velVector = Victor.fromArray(objectSpec['velVector']);

			let creature = new ComposedCreature({
				id: id,
				posVector: posVector,
				shape: this.buildShape(objectSpec['shape']),
				velocityVector: velVector,
				angle: objectSpec['angle'],
				angle: objectSpec['angleVelocity']
			});

			(objectSpec['childs'] || Array()).forEach(componentSpec => {
				creature.addChildObject(this.buildComponent(componentSpec));
			});

			return creature;
		}
	}
}


paper.install(window);
window.onload = function() {
	paper.setup('tenyx_canvas');

	let path = new Path.Rectangle([75, 75], [100, 100]);
	path.strokeColor = 'black';

	let sceneManager = new SceneManager();
	let objectBuilder = new ObjectBuilder();

	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		path.rotate(3);

		sceneManager.step(event.delta);
	}
	view.draw();

	var wsClient = new this.WebSocket('ws://localhost:9090');
	wsClient.bufferType = 'arraybuffer';
	wsClient.onmessage = msg => {
		let arrayBuffer = msg.data.arrayBuffer().then(arrBuf => { 
			let dm = decode(arrBuf);

			if (dm['method'] === 'addSceneObject') {
				sceneManager.addObject(objectBuilder.buildObject(dm['params']));
			}
		});
	};
}
