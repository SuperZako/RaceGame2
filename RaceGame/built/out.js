var Camera = (function () {
    function Camera(scene) {
        this.positionOffset = new THREE.Vector3();
        this.targetOffset = new THREE.Vector3();
        this.positionOffset.set(0, -5, 5);
        // this.targetOffset.z = -1000;
        // camera
        var SCREEN_WIDTH = window.innerWidth;
        var SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 90;
        var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        var NEAR = 0.1;
        var FAR = 2000000;
        var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.up.set(0, 0, 1);
        scene.add(camera);
        camera.position.z = SCREEN_HEIGHT / 2;
        camera.lookAt(scene.position);
        this.camera = camera;
        this.dummyCamera = this.camera.clone();
    }
    Camera.prototype.getCamera = function () {
        return this.camera;
    };
    Camera.prototype.update = function () {
        var target = this.target;
        var v1 = this.positionOffset.clone();
        var v2 = this.targetOffset.clone();
        var matrix = target.group.matrixWorld;
        v1.applyMatrix4(matrix);
        //v1.add(target.mesh.position);
        v2.applyMatrix4(matrix);
        //v2.add(target.mesh.position);
        this.dummyCamera.up.set(0, 0, 1);
        this.dummyCamera.position.copy(v1);
        this.dummyCamera.lookAt(v2);
        this.camera.quaternion.slerp(this.dummyCamera.quaternion, 0.5);
        this.camera.position.lerp(this.dummyCamera.position, 0.5);
    };
    Camera.prototype.setTarget = function (target) {
        this.target = target;
    };
    return Camera;
}());
"use strict";
/**  Useful Game Math stuff */
var GMath;
(function (GMath) {
    function sign(n) {
        //  Allegedly fastest if we check for number type
        //return typeof n === 'number' ? n ? n < 0 ? -1 : 1 : n === n ? 0 : NaN : NaN;
        return n < 0 ? -1 : 1;
    }
    GMath.sign = sign;
    function clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }
    GMath.clamp = clamp;
    /**  Always positive modulus */
    function pmod(n, m) {
        return (n % m + m) % m;
    }
    GMath.pmod = pmod;
})(GMath || (GMath = {}));
;
"use strict";
/**  Simple 2D Vector class */
var Vec2 = (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        //this.x = x || 0.0;
        //this.y = y || 0.0;
    }
    ;
    //  Static methods
    Vec2.len = function (x, y) {
        return Math.sqrt(x * x + y * y);
    };
    Vec2.angle = function (x, y) {
        return Math.atan2(y, x);
    };
    //  Instance methods
    Vec2.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Vec2.prototype.copy = function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    Vec2.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vec2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vec2.prototype.det = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    Vec2.prototype.rotate = function (r) {
        var x = this.x, y = this.y, c = Math.cos(r), s = Math.sin(r);
        this.x = x * c - y * s;
        this.y = x * s + y * c;
    };
    Vec2.prototype.angle = function () {
        return Math.atan2(this.y, this.x);
    };
    Vec2.prototype.setLen = function (l) {
        var s = this.len();
        if (s > 0.0) {
            s = l / s;
            this.x *= s;
            this.y *= s;
        }
        else {
            this.x = l;
            this.y = 0.0;
        }
    };
    Vec2.prototype.normalize = function () {
        this.setLen(1.0);
    };
    return Vec2;
}());
/*global $e */
"use strict";
/**
 *  Widget to display car state data (name value pairs)
 */
var Stats = (function () {
    function Stats() {
        var _this = this;
        this.visible = false; // starts off hidden
        this.pairs = []; // name/value pairs to display
        // this.visible = false;  // starts off hidden
        // this.pairs = [];  // name/value pairs to display
        // var that = this;  // attach show/hide click handler
        $e('stats_tab').onclick = function () { _this.toggle(); };
    }
    Stats.prototype.toggle = function () {
        if (this.visible)
            this.hide();
        else
            this.show();
    };
    Stats.prototype.show = function () {
        if (!this.visible) {
            $e('stats_table').style.display = 'table';
            this.visible = true;
        }
    };
    Stats.prototype.hide = function () {
        if (this.visible) {
            $e('stats_table').style.display = 'none';
            this.visible = false;
        }
    };
    //  Add a name/value pair.
    //  Be sure to clear every frame otherwise this list will grow fast!
    Stats.prototype.add = function (name, value) {
        this.pairs.push({ name: name, value: value });
    };
    //  Should be cleared every frame
    Stats.prototype.clear = function () {
        this.pairs = [];
    };
    //  Render stats in a table element
    Stats.prototype.render = function () {
        if (!this.visible)
            return;
        // Build rows html of name/value pairs
        var str = '';
        for (var i = 0, l = this.pairs.length; i < l; ++i) {
            var nv = this.pairs[i];
            str += '<tr><td class="property">' + nv.name + '</td><td class="value">';
            if (typeof nv.value === 'number')
                str += nv.value.toFixed(4); // 4 decimal places to keep things tidy
            else
                str += nv.value;
            str += '</td></tr>';
        }
        $e('stats_table').innerHTML = str;
    };
    return Stats;
}());
///<reference path="./GMath.ts" />
///<reference path="./Vec2.ts" />
///<reference path="./Stats.ts" />
"use strict";
/**
 *  Car setup params and magic constants.
 */
var Config = (function () {
    function Config(opts) {
        opts = opts || {};
        //  Defaults approximate a lightweight sports-sedan.
        this.gravity = opts.gravity || 9.81; // m/s^2
        this.mass = opts.mass || 1200.0; // kg
        this.inertiaScale = opts.inertiaScale || 1.0; // Multiply by mass for inertia
        this.halfWidth = opts.halfWidth || 0.8; // Centre to side of chassis (metres)
        this.cgToFront = opts.cgToFront || 2.0; // Centre of gravity to front of chassis (metres)
        this.cgToRear = opts.cgToRear || 2.0; // Centre of gravity to rear of chassis
        this.cgToFrontAxle = opts.cgToFrontAxle || 1.25; // Centre gravity to front axle
        this.cgToRearAxle = opts.cgToRearAxle || 1.25; // Centre gravity to rear axle
        this.cgHeight = opts.cgHeight || 0.55; // Centre gravity height
        this.wheelRadius = opts.wheelRadius || 0.3; // Includes tire (also represents height of axle)
        this.wheelWidth = opts.wheelWidth || 0.2; // Used for render only
        this.tireGrip = opts.tireGrip || 2.0; // How much grip tires have
        this.lockGrip = (typeof opts.lockGrip === 'number') ? GMath.clamp(opts.lockGrip, 0.01, 1.0) : 0.7; // % of grip available when wheel is locked
        this.engineForce = opts.engineForce || 8000.0;
        this.brakeForce = opts.brakeForce || 12000.0;
        this.eBrakeForce = opts.eBrakeForce || this.brakeForce / 2.5;
        this.weightTransfer = (typeof opts.weightTransfer === 'number') ? opts.weightTransfer : 0.2; // How much weight is transferred during acceleration/braking
        this.maxSteer = opts.maxSteer || 0.6; // Maximum steering angle in radians
        this.cornerStiffnessFront = opts.cornerStiffnessFront || 5.0;
        this.cornerStiffnessRear = opts.cornerStiffnessRear || 5.2;
        this.airResist = (typeof opts.airResist === 'number') ? opts.airResist : 2.5; // air resistance (* vel)
        this.rollResist = (typeof opts.rollResist === 'number') ? opts.rollResist : 8.0; // rolling resistance force (* vel)
    }
    Config.prototype.copy = function (c) {
        for (var k in this) {
            if (this.hasOwnProperty(k) && c.hasOwnProperty(k)) {
                this[k] = c[k];
            }
        }
        return this;
    };
    return Config;
}());
/**
 *  Car class

    This is a HTML/Javascript adaptation of Marco Monster's 2D car physics demo.
    Physics Paper here:
    http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
    Windows demo written in C here:
    http://www.gamedev.net/topic/394292-demosource-of-marco-monsters-car-physics-tutorial/
    Additional ideas from here:
    https://github.com/Siorki/js13kgames/tree/master/2013%20-%20staccato

    Adapted by Mike Linkovich
    http://www.spacejack.ca/projects/carphysics2d/
    https://github.com/spacejack/carphysics2d

    License: MIT
    http://opensource.org/licenses/MIT
 */
var Car = (function () {
    function Car(opts) {
        //opts = opts || {};
        if (opts === void 0) { opts = {}; }
        this.absVel = 0.0; // absolute velocity m/s
        this.yawRate = 0.0; // angular velocity in radians
        this.steer = 0.0; // amount of steering input (-1.0..1.0)
        this.steerAngle = 0.0; // actual front wheel steer angle (-maxSteer..maxSteer)
        this.inputs = new InputState(); //  State of inputs
        //  Other static values to be computed from config
        this.inertia = 0.0; // will be = mass
        this.wheelBase = 0.0; // set from axle to CG lengths
        this.axleWeightRatioFront = 0.0; // % car weight on the front axle
        this.axleWeightRatioRear = 0.0; // % car weight on the rear axle
        //  Car state variables
        this.heading = opts.heading || 0.0; // angle car is pointed at (radians)
        this.position = new Vec2(opts.x, opts.y); // metres in world coords
        this.velocity = new Vec2(); // m/s in world coords
        this.velocity_c = new Vec2(); // m/s in local car coords (x is forward y is sideways)
        this.accel = new Vec2(); // acceleration in world coords
        this.accel_c = new Vec2(); // accleration in local car coords
        this.absVel = 0.0; // absolute velocity m/s
        this.yawRate = 0.0; // angular velocity in radians
        this.steer = 0.0; // amount of steering input (-1.0..1.0)
        this.steerAngle = 0.0; // actual front wheel steer angle (-maxSteer..maxSteer)
        //  State of inputs
        this.inputs = new InputState();
        //  Use input smoothing (on by default)
        this.smoothSteer = (opts.smoothSteer === undefined) ? true : !!opts.smoothSteer;
        //  Use safe steering (angle limited by speed)
        this.safeSteer = (opts.safeSteer === undefined) ? true : !!opts.safeSteer;
        //  Stats object we can use to ouptut info
        this.stats = opts.stats;
        //  Other static values to be computed from config
        this.inertia = 0.0; // will be = mass
        this.wheelBase = 0.0; // set from axle to CG lengths
        this.axleWeightRatioFront = 0.0; // % car weight on the front axle
        this.axleWeightRatioRear = 0.0; // % car weight on the rear axle
        //  Setup car configuration
        this.config = new Config(opts.config);
        this.setConfig();
    }
    /**
     *  App sets inputs via this function
     */
    Car.prototype.setInputs = function (inputs) {
        this.inputs.copy(inputs);
    };
    Car.prototype.setConfig = function (config) {
        if (config) {
            this.config.copy(this);
        }
        // Re-calculate these
        this.inertia = this.config.mass * this.config.inertiaScale;
        this.wheelBase = this.config.cgToFrontAxle + this.config.cgToRearAxle;
        this.axleWeightRatioFront = this.config.cgToRearAxle / this.wheelBase; // % car weight on the front axle
        this.axleWeightRatioRear = this.config.cgToFrontAxle / this.wheelBase; // % car weight on the rear axle
    };
    /**
     *  @param dt Floating-point Delta Time in seconds
     */
    Car.prototype.doPhysics = function (dt) {
        // Shorthand
        var cfg = this.config;
        // Pre-calc heading vector
        var sn = Math.sin(this.heading);
        var cs = Math.cos(this.heading);
        // Get velocity in local car coordinates
        this.velocity_c.x = cs * this.velocity.x + sn * this.velocity.y;
        this.velocity_c.y = cs * this.velocity.y - sn * this.velocity.x;
        // Weight on axles based on centre of gravity and weight shift due to forward/reverse acceleration
        var axleWeightFront = cfg.mass * (this.axleWeightRatioFront * cfg.gravity - cfg.weightTransfer * this.accel_c.x * cfg.cgHeight / this.wheelBase);
        var axleWeightRear = cfg.mass * (this.axleWeightRatioRear * cfg.gravity + cfg.weightTransfer * this.accel_c.x * cfg.cgHeight / this.wheelBase);
        // Resulting velocity of the wheels as result of the yaw rate of the car body.
        // v = yawrate * r where r is distance from axle to CG and yawRate (angular velocity) in rad/s.
        var yawSpeedFront = cfg.cgToFrontAxle * this.yawRate;
        var yawSpeedRear = -cfg.cgToRearAxle * this.yawRate;
        // Calculate slip angles for front and rear wheels (a.k.a. alpha)
        var slipAngleFront = Math.atan2(this.velocity_c.y + yawSpeedFront, Math.abs(this.velocity_c.x)) - GMath.sign(this.velocity_c.x) * this.steerAngle;
        var slipAngleRear = Math.atan2(this.velocity_c.y + yawSpeedRear, Math.abs(this.velocity_c.x));
        var tireGripFront = cfg.tireGrip;
        var tireGripRear = cfg.tireGrip * (1.0 - this.inputs.ebrake * (1.0 - cfg.lockGrip)); // reduce rear grip when ebrake is on
        var frictionForceFront_cy = GMath.clamp(-cfg.cornerStiffnessFront * slipAngleFront, -tireGripFront, tireGripFront) * axleWeightFront;
        var frictionForceRear_cy = GMath.clamp(-cfg.cornerStiffnessRear * slipAngleRear, -tireGripRear, tireGripRear) * axleWeightRear;
        //  Get amount of brake/throttle from our inputs
        var brake = Math.min(this.inputs.brake * cfg.brakeForce + this.inputs.ebrake * cfg.eBrakeForce, cfg.brakeForce);
        var throttle = this.inputs.throttle * cfg.engineForce;
        //  Resulting force in local car coordinates.
        //  This is implemented as a RWD car only.
        var tractionForce_cx = throttle - brake * GMath.sign(this.velocity_c.x);
        var tractionForce_cy = 0;
        var dragForce_cx = -cfg.rollResist * this.velocity_c.x - cfg.airResist * this.velocity_c.x * Math.abs(this.velocity_c.x);
        var dragForce_cy = -cfg.rollResist * this.velocity_c.y - cfg.airResist * this.velocity_c.y * Math.abs(this.velocity_c.y);
        // total force in car coordinates
        var totalForce_cx = dragForce_cx + tractionForce_cx;
        var totalForce_cy = dragForce_cy + tractionForce_cy + Math.cos(this.steerAngle) * frictionForceFront_cy + frictionForceRear_cy;
        // acceleration along car axes
        this.accel_c.x = totalForce_cx / cfg.mass; // forward/reverse accel
        this.accel_c.y = totalForce_cy / cfg.mass; // sideways accel
        // acceleration in world coordinates
        this.accel.x = cs * this.accel_c.x - sn * this.accel_c.y;
        this.accel.y = sn * this.accel_c.x + cs * this.accel_c.y;
        // update velocity
        this.velocity.x += this.accel.x * dt;
        this.velocity.y += this.accel.y * dt;
        this.absVel = this.velocity.len();
        // calculate rotational forces
        var angularTorque = (frictionForceFront_cy + tractionForce_cy) * cfg.cgToFrontAxle - frictionForceRear_cy * cfg.cgToRearAxle;
        //  Sim gets unstable at very slow speeds, so just stop the car
        if (Math.abs(this.absVel) < 0.5 && !throttle) {
            this.velocity.x = this.velocity.y = this.absVel = 0;
            angularTorque = this.yawRate = 0;
        }
        var angularAccel = angularTorque / this.inertia;
        this.yawRate += angularAccel * dt;
        this.heading += this.yawRate * dt;
        //  finally we can update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        //  Display some data
        this.stats.clear(); // clear this every tick otherwise it'll fill up fast
        this.stats.add('speed', this.velocity_c.x * 3600 / 1000); // km/h
        this.stats.add('accleration', this.accel_c.x);
        this.stats.add('yawRate', this.yawRate);
        this.stats.add('weightFront', axleWeightFront);
        this.stats.add('weightRear', axleWeightRear);
        this.stats.add('slipAngleFront', slipAngleFront);
        this.stats.add('slipAngleRear', slipAngleRear);
        this.stats.add('frictionFront', frictionForceFront_cy);
        this.stats.add('frictionRear', frictionForceRear_cy);
    };
    /**
     *  Smooth Steering
     *  Apply maximum steering angle change velocity.
     */
    Car.prototype.applySmoothSteer = function (steerInput, dt) {
        var steer = 0;
        if (Math.abs(steerInput) > 0.001) {
            //  Move toward steering input
            steer = GMath.clamp(this.steer + steerInput * dt * 2.0, -1.0, 1.0); // -inp.right, inp.left);
        }
        else {
            //  No steer input - move toward centre (0)
            if (this.steer > 0) {
                steer = Math.max(this.steer - dt * 1.0, 0);
            }
            else if (this.steer < 0) {
                steer = Math.min(this.steer + dt * 1.0, 0);
            }
        }
        return steer;
    };
    /**
    *  Safe Steering
    *  Limit the steering angle by the speed of the car.
    *  Prevents oversteer at expense of more understeer.
    */
    Car.prototype.applySafeSteer = function (steerInput) {
        var avel = Math.min(this.absVel, 250.0); // m/s
        var steer = steerInput * (1.0 - (avel / 280.0));
        return steer;
    };
    /**
     *  @param dtms Delta Time in milliseconds
     */
    Car.prototype.update = function (dtms) {
        var dt = dtms / 1000.0; // delta T in seconds
        this.throttle = this.inputs.throttle;
        this.brake = this.inputs.brake;
        var steerInput = this.inputs.left - this.inputs.right;
        //  Perform filtering on steering...
        if (this.smoothSteer) {
            this.steer = this.applySmoothSteer(steerInput, dt);
        }
        else {
            this.steer = steerInput;
        }
        if (this.safeSteer)
            this.steer = this.applySafeSteer(this.steer);
        //  Now set the actual steering angle
        this.steerAngle = this.steer * this.config.maxSteer;
        //
        //  Now that the inputs have been filtered and we have our throttle,
        //  brake and steering values, perform the car physics update...
        //
        this.doPhysics(dt);
    };
    /**
     *  @param ctx 2D rendering context (from canvas)
     */
    Car.prototype.render = function (ctx) {
        var cfg = this.config; // shorthand reference
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.heading);
        // Draw car body
        ctx.beginPath();
        ctx.rect(-cfg.cgToRear, -cfg.halfWidth, cfg.cgToFront + cfg.cgToRear, cfg.halfWidth * 2.0);
        ctx.fillStyle = '#1166BB';
        ctx.fill();
        ctx.lineWidth = 0.05; // use thin lines because everything is scaled up 25x
        ctx.strokeStyle = '#222222';
        ctx.stroke();
        ctx.closePath();
        // Draw rear wheel
        ctx.translate(-cfg.cgToRearAxle, 0);
        ctx.beginPath();
        ctx.rect(-cfg.wheelRadius, -cfg.wheelWidth / 2.0, cfg.wheelRadius * 2, cfg.wheelWidth);
        ctx.fillStyle = '#444444';
        ctx.fill();
        ctx.lineWidth = 0.05;
        ctx.strokeStyle = '111111';
        ctx.stroke();
        ctx.closePath();
        // Draw front wheel
        ctx.translate(cfg.cgToRearAxle + cfg.cgToFrontAxle, 0);
        ctx.rotate(this.steerAngle);
        ctx.beginPath();
        ctx.rect(-cfg.wheelRadius, -cfg.wheelWidth / 2.0, cfg.wheelRadius * 2, cfg.wheelWidth);
        ctx.fillStyle = '#444444';
        ctx.fill();
        ctx.lineWidth = 0.05;
        ctx.strokeStyle = '111111';
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };
    return Car;
}());
"use strict";
/**
 *  Input state values
 *  Range from 0.0-1.0
 */
var InputState = (function () {
    function InputState() {
        this.left = 0;
        this.right = 0;
        this.throttle = 0;
        this.brake = 0;
        this.ebrake = 0;
    }
    /**  Copy values from i to this */
    InputState.prototype.copy = function (i) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                this[k] = i[k];
            }
        }
        return this;
    };
    /**  Set all to v (0.0-1.0) */
    InputState.prototype.set = function (v) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                this[k] = v;
            }
        }
    };
    return InputState;
}());
///<reference path="./Physics/Car.ts" />
///<reference path="./Physics/InputState.ts" />
var Car3D = (function () {
    function Car3D(scene) {
        var _this = this;
        this.inputs = new InputState();
        this.group = new THREE.Object3D();
        //  Displays useful car physics data
        this.stats = new Stats();
        this.car = new Car({ stats: this.stats });
        //オブジェクト
        var loader = new THREE.JSONLoader();
        loader.load("../models/f1_1_body.json", function (geometry, materials) {
            var faceMaterial = new THREE.MultiMaterial(materials);
            _this.body = new THREE.Mesh(geometry, faceMaterial);
            _this.body.rotation.x = Math.PI / 2;
            _this.group.add(_this.body);
        });
        loader.load("../models/f1_f_tire.json", function (geometry, materials) {
            var faceMaterial = new THREE.MultiMaterial(materials);
            _this.tire = new THREE.Mesh(geometry, faceMaterial);
            _this.tire.rotation.x = Math.PI / 2;
            _this.tire.position.set(-1, 2, 0);
            _this.group.add(_this.tire);
        });
        var cubeGeometry = new THREE.CubeGeometry(5, 5, 5, 1, 1, 1);
        var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        this.collisionCube = new THREE.Mesh(cubeGeometry, wireMaterial);
        this.group.add(this.collisionCube);
        scene.add(this.group);
        this.setPosition(-78, -4);
    }
    Car3D.prototype.setPosition = function (x, y) {
        this.car.position.set(y, x);
    };
    //private localToWorld(position: { x: number, y: number }) {
    //    let x = position.y;
    //    let y = position.x;
    //    return { x, y };
    //}
    Car3D.prototype.applyCollision = function (world) {
        var geometry = this.collisionCube.geometry;
        var originLocalPoint = geometry.vertices[0].clone();
        var originWorldPoint = originLocalPoint.applyMatrix4(this.group.matrix);
        var localVertex = geometry.vertices[1].clone();
        var globalVertex = localVertex.applyMatrix4(this.group.matrix);
        var directionVector = globalVertex.sub(originWorldPoint);
        var ray = new THREE.Raycaster(originWorldPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects([world]);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            this.group.position.z = collisionResults[0].point.z;
        }
        //for (var vertexIndex = 1; vertexIndex < geometry.vertices.length; vertexIndex++) {
        //    let originPoint = geometry.vertices[vertexIndex - 1].clone();
        //    var localVertex = geometry.vertices[vertexIndex].clone();
        //    var globalVertex = localVertex.applyMatrix4(this.collisionCube.matrix);
        //    var directionVector = globalVertex.sub(this.collisionCube.position);
        //    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        //    var collisionResults = ray.intersectObjects(collidableMeshList);
        //    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        //        // appendText(" Hit ");
        //    }
        //}
    };
    /**  Update game logic by delta T (millisecs) */
    Car3D.prototype.update = function (world, dt) {
        this.car.setInputs(this.inputs);
        this.car.update(dt);
        this.group.position.set(this.car.position.y, this.car.position.x, 0);
        this.group.rotation.z = -this.car.heading;
        this.applyCollision(world);
        //let x = this.group.position.x;
        //let y = this.group.position.y;
        //let infoEl = <HTMLDivElement>document.getElementById("info");
        //infoEl.textContent = `Position X:${x}  Y:${y}`;
    };
    return Car3D;
}());
// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//
/** @namespace */
var THREEx;
(function (THREEx) {
    /**
     * - NOTE: it would be quite easy to push event-driven too
     *   - microevent.js for events handling
     *   - in this._onkeyChange, generate a string from the DOM event
     *   - use this as event name
    */
    var KeyboardState = (function () {
        function KeyboardState(domElement) {
            //this.domElement = domElement || document;
            // to store the current state
            //this.keyCodes = {};
            //this.modifiers = {};
            if (domElement === void 0) { domElement = document; }
            var _this = this;
            this.domElement = domElement;
            this.keyCodes = {};
            this.modifiers = {};
            this._onBlur = function () {
                for (var prop in _this.keyCodes) {
                    _this.keyCodes[prop] = false;
                }
                for (var prop in _this.modifiers) {
                    _this.modifiers[prop] = false;
                }
            };
            /**
             * to process the keyboard dom event
            */
            this._onKeyChange = function (event) {
                // log to debug
                //console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
                // update this.keyCodes
                var keyCode = event.keyCode;
                var pressed = event.type === "keydown" ? true : false;
                _this.keyCodes[keyCode] = pressed;
                // update this.modifiers
                _this.modifiers["shift"] = event.shiftKey;
                _this.modifiers["ctrl"] = event.ctrlKey;
                _this.modifiers["alt"] = event.altKey;
                _this.modifiers["meta"] = event.metaKey;
            };
            // create callback to bind/unbind keyboard events
            //var _this = this;
            //this._onKeyDown = function (event) { _this._onKeyChange(event) }
            //this._onKeyUp = function (event) { _this._onKeyChange(event) }
            // bind keyEvents
            this.domElement.addEventListener("keydown", this._onKeyChange, false);
            this.domElement.addEventListener("keyup", this._onKeyChange, false);
            // create callback to bind/unbind window blur event
            //this._onBlur = () => {
            //    for (var prop in this.keyCodes)
            //        this.keyCodes[prop] = false;
            //    for (var prop in this.modifiers)
            //        this.modifiers[prop] = false;
            //}
            // bind window blur
            window.addEventListener("blur", this._onBlur, false);
        }
        /**
         * To stop listening of the keyboard events
        */
        KeyboardState.prototype.destroy = function () {
            // unbind keyEvents
            this.domElement.removeEventListener("keydown", this._onKeyChange, false);
            this.domElement.removeEventListener("keyup", this._onKeyChange, false);
            // unbind window blur event
            window.removeEventListener("blur", this._onBlur, false);
        };
        /**
         * query keyboard state to know if a key is pressed of not
         *
         * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
         * @returns {Boolean} true if the key is pressed, false otherwise
        */
        KeyboardState.prototype.pressed = function (keyDesc) {
            var keys = keyDesc.split("+");
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var pressed = false;
                if (KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                    pressed = this.modifiers[key];
                }
                else if (Object.keys(KeyboardState.ALIAS).indexOf(key) !== -1) {
                    pressed = this.keyCodes[KeyboardState.ALIAS[key]];
                }
                else {
                    pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)];
                }
                if (!pressed) {
                    return false;
                }
            }
            ;
            return true;
        };
        /**
         * return true if an event match a keyDesc
         * @param  {KeyboardEvent} event   keyboard event
         * @param  {String} keyDesc string description of the key
         * @return {Boolean}         true if the event match keyDesc, false otherwise
         */
        KeyboardState.prototype.eventMatches = function (event, keyDesc) {
            var aliases = KeyboardState.ALIAS;
            var aliasKeys = Object.keys(aliases);
            var keys = keyDesc.split("+");
            // log to debug
            // console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var pressed = false;
                if (key === "shift") {
                    pressed = (event.shiftKey ? true : false);
                }
                else if (key === "ctrl") {
                    pressed = (event.ctrlKey ? true : false);
                }
                else if (key === "alt") {
                    pressed = (event.altKey ? true : false);
                }
                else if (key === "meta") {
                    pressed = (event.metaKey ? true : false);
                }
                else if (aliasKeys.indexOf(key) !== -1) {
                    pressed = (event.keyCode === aliases[key] ? true : false);
                }
                else if (event.keyCode === key.toUpperCase().charCodeAt(0)) {
                    pressed = true;
                }
                if (!pressed) {
                    return false;
                }
            }
            return true;
        };
        return KeyboardState;
    }());
    KeyboardState.MODIFIERS = ["shift", "ctrl", "alt", "meta"];
    KeyboardState.ALIAS = {
        "left": 37, "up": 38, "right": 39, "down": 40,
        "space": 32, "pageup": 33, "pagedown": 34, "tab": 9, "escape": 27,
    };
    THREEx.KeyboardState = KeyboardState;
})(THREEx || (THREEx = {}));
// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```var windowResize = THREEx.WindowResize(aRenderer, aCamera)```
//    
// **Step 2**: Start updating renderer and camera
//
// ```windowResize.stop()```
// # Code
//
/** @namespace */
var THREEx;
(function (THREEx) {
    /**
     * Update renderer and camera when the window is resized
     *
     * @param {Object} renderer the renderer to update
     * @param {Object} Camera the camera to update
    */
    function WindowResize(renderer, camera) {
        var callback = function () {
            // notify the renderer of the size change
            renderer.setSize(window.innerWidth, window.innerHeight);
            // update the camera
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        // bind the resize event
        window.addEventListener('resize', callback, false);
        // return .stop() the function to stop watching window resize
        return {
            /**
             * Stop watching window resize
            */
            stop: function () {
                window.removeEventListener('resize', callback);
            }
        };
    }
    THREEx.WindowResize = WindowResize;
})(THREEx || (THREEx = {}));
/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/
THREE.ShaderLib['sky'] = {
    uniforms: {
        luminance: { value: 1 },
        turbidity: { value: 2 },
        rayleigh: { value: 1 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new THREE.Vector3() }
    },
    vertexShader: "\n        uniform vec3 sunPosition;\n        uniform float rayleigh;\n        uniform float turbidity;\n        uniform float mieCoefficient;\n\n        varying vec3 vWorldPosition;\n        varying vec3 vSunDirection;\n        varying float vSunfade;\n        varying vec3 vBetaR;\n        varying vec3 vBetaM;\n        varying float vSunE;\n\n        const vec3 up = vec3(0.0, 0.0, 1.0);\n\n        // constants for atmospheric scattering\n        const float e = 2.71828182845904523536028747135266249775724709369995957;\n        const float pi = 3.141592653589793238462643383279502884197169;\n\n        // mie stuff\n        // K coefficient for the primaries\n        const float v = 4.0;\n        const vec3 K = vec3(0.686, 0.678, 0.666);\n\n        // see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness\n        // A simplied version of the total Reayleigh scattering to works on browsers that use ANGLE\n        const vec3 simplifiedRayleigh = 0.0005 / vec3(94, 40, 18);\n\n        // wavelength of used primaries, according to preetham\n        const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);\n\n        // earth shadow hack\n        const float cutoffAngle = pi/1.95;\n        const float steepness = 1.5;\n        const float EE = 1000.0;\n\n        float sunIntensity(float zenithAngleCos)\n        {\n            zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);\n            return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));\n        }\n\n        vec3 totalMie(vec3 lambda, float T)\n        {\n            float c = (0.2 * T ) * 10E-18;\n            return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;\n        }\n\n        void main() {\n\n            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n            vWorldPosition = worldPosition.xyz;\n\n            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n            vSunDirection = normalize(sunPosition);\n\n            vSunE = sunIntensity(dot(vSunDirection, up));\n\n            vSunfade = 1.0-clamp(1.0-exp((sunPosition.z/450000.0)),0.0,1.0);\n\n            float rayleighCoefficient = rayleigh - (1.0 * (1.0-vSunfade));\n\n            // extinction (absorbtion + out scattering)\n            // rayleigh coefficients\n            vBetaR = simplifiedRayleigh * rayleighCoefficient;\n\n            // mie coefficients\n            vBetaM = totalMie(lambda, turbidity) * mieCoefficient;\n        }\n    ",
    fragmentShader: "\n        varying vec3 vWorldPosition;\n        varying vec3 vSunDirection;\n        varying float vSunfade;\n        varying vec3 vBetaR;\n        varying vec3 vBetaM;\n        varying float vSunE;\n\n        uniform float luminance;\n        uniform float mieDirectionalG;\n\n        const vec3 cameraPos = vec3(0., 0., 0.);\n\n        // constants for atmospheric scattering\n        const float pi = 3.141592653589793238462643383279502884197169;\n\n        const float n = 1.0003; // refractive index of air\n        const float N = 2.545E25; // number of molecules per unit volume for air at\n        // 288.15K and 1013mb (sea level -45 celsius)\n\n        // optical length at zenith for molecules\n        const float rayleighZenithLength = 8.4E3;\n        const float mieZenithLength = 1.25E3;\n        const vec3 up = vec3(0.0, 0.0, 1.0);\n\n        const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;\n        // 66 arc seconds -> degrees, and the cosine of that\n\n        float rayleighPhase(float cosTheta)\n        {\n            return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));\n        }\n\n        float hgPhase(float cosTheta, float g)\n        {\n            return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));\n        }\n\n        // Filmic ToneMapping http://filmicgames.com/archives/75\n        const float A = 0.15;\n        const float B = 0.50;\n        const float C = 0.10;\n        const float D = 0.20;\n        const float E = 0.02;\n        const float F = 0.30;\n\n        const float whiteScale = 1.0748724675633854; // 1.0 / Uncharted2Tonemap(1000.0)\n\n        vec3 Uncharted2Tonemap(vec3 x)\n        {\n            return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;\n        }\n\n\n        void main()\n        {\n            // optical length\n            // cutoff angle at 90 to avoid singularity in next formula.\n            float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));\n            float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\n            float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\n\n            // combined extinction factor\n            vec3 Fex = exp(-(vBetaR * sR + vBetaM * sM));\n\n            // in scattering\n            float cosTheta = dot(normalize(vWorldPosition - cameraPos), vSunDirection);\n\n            float rPhase = rayleighPhase(cosTheta*0.5+0.5);\n            vec3 betaRTheta = vBetaR * rPhase;\n\n            float mPhase = hgPhase(cosTheta, mieDirectionalG);\n            vec3 betaMTheta = vBetaM * mPhase;\n\n            vec3 Lin = pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * (1.0 - Fex),vec3(1.5));\n            Lin *= mix(vec3(1.0),pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, vSunDirection),5.0),0.0,1.0));\n\n            //nightsky\n            vec3 direction = normalize(vWorldPosition - cameraPos);\n            float theta = acos(direction.z); // elevation --> y-axis, [-pi/2, pi/2]\n            float phi = atan(-direction.y, direction.x); // azimuth --> x-axis [-pi/2, pi/2]\n            vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);\n            vec3 L0 = vec3(0.1) * Fex;\n\n            // composition + solar disc\n            float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);\n            L0 += (vSunE * 19000.0 * Fex)*sundisk;\n\n            vec3 texColor = (Lin+L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);\n\n            vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);\n            vec3 color = curr*whiteScale;\n\n            vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*vSunfade))));\n\n            gl_FragColor.rgb = retColor;\n\n            gl_FragColor.a = 1.0;\n        }\n    "
};
var Sky = (function () {
    function Sky() {
        var skyShader = THREE.ShaderLib["sky"];
        var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);
        var skyMat = new THREE.ShaderMaterial({
            fragmentShader: skyShader.fragmentShader,
            vertexShader: skyShader.vertexShader,
            uniforms: skyUniforms,
            side: THREE.BackSide
        });
        var skyGeo = new THREE.SphereBufferGeometry(450000, 32, 15);
        var skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.rotateX(Math.PI / 2);
        // Expose variables
        this.mesh = skyMesh;
        this.uniforms = skyUniforms;
    }
    return Sky;
}());
var Ground = (function () {
    function Ground(scene, url) {
        var _this = this;
        //オブジェクト
        var loader = new THREE.JSONLoader();
        loader.load(url, function (geometry, materials) {
            var faceMaterial = new THREE.MultiMaterial(materials);
            _this.mesh = new THREE.Mesh(geometry, faceMaterial);
            _this.mesh.rotation.x = Math.PI / 2;
            scene.add(_this.mesh);
        });
    }
    return Ground;
}());
///<reference path="THREEx.KeyboardState.ts" />
///<reference path="THREEx.WindowResize.ts" />
///<reference path="./Sky/SkyShader.ts" />
///<reference path="./Terrain/Ground.ts" />
///<reference path="Car3D.ts" />
// Main
var Main;
(function (Main) {
    "use strict";
    /* canvas要素のノードオブジェクト */
    var canvas;
    var context; // = canvas.getContext("2d");
    // standard global variables
    var container;
    var scene;
    // var stats: Stats;
    var clock = new THREE.Clock();
    // let controls: THREE.OrbitControls;
    var directionalLight;
    Main.keyboard = new THREEx.KeyboardState();
    var car;
    var ground;
    function createLights() {
        // ambientLight = new THREE.AmbientLight(0xffffff);
        /// scene.add(ambientLight);
        // skyColorHex : 0xffffff, groundColorHex : 0xffffff, intensity : 0.6
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        //シーンオブジェクトに追加            
        scene.add(hemiLight);
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        scene.add(directionalLight);
    }
    // functions
    function init() {
        canvas = document.getElementById("hud");
        var _context = canvas.getContext("2d");
        if (_context) {
            context = _context;
        }
        // scene
        scene = new THREE.Scene();
        // camera
        var SCREEN_WIDTH = window.innerWidth;
        var SCREEN_HEIGHT = window.innerHeight;
        //const VIEW_ANGLE: number = 90;
        //const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        //const NEAR = 0.1;
        //const FAR = 2000000;
        Main.camera = new Camera(scene); //new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        //scene.add(camera);
        //camera.position.y = SCREEN_HEIGHT / 2;
        //camera.lookAt(scene.position);
        //camera.up.set(0, 0, 1);
        // RENDERER
        Main.renderer = new THREE.WebGLRenderer({ antialias: true });
        Main.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container = document.getElementById("view3d");
        container.appendChild(Main.renderer.domElement);
        // EVENTS
        THREEx.WindowResize(Main.renderer, Main.camera.getCamera());
        // THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });
        // CONTROLS
        //controls = new THREE.OrbitControls(camera, renderer.domElement);
        // STATS
        // stats = new Stats();
        // stats.dom.style.position = 'absolute';
        // stats.dom.style.bottom = '0px';
        // stats.dom.style.zIndex = '100';
        // container.appendChild(stats.dom);
        // LIGHT
        // var light = new THREE.PointLight(0xffffff);
        // light.position.set(0, 250, 0);
        // scene.add(light);
        // var directionalLight = new THREE.DirectionalLight(0xffffff);
        // directionalLight.position.set(0, 0.7, 0.7);
        // scene.add(directionalLight);
        // FLOOR
        // let pitch = new _SoccerPitch(scene);
        // SKYBOX/FOG
        // var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
        // var skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.BackSide });
        // var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        // scene.add(skyBox);
        // scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
        ////////////
        // CUSTOM //
        ////////////
        // GridHelper(大きさ, １マスの大きさ)
        var grid = new THREE.GridHelper(100000, 100);
        grid.rotateX(Math.PI / 2);
        //シーンオブジェクトに追加
        scene.add(grid);
        //// 軸の長さ10000
        //var axis = new THREE.AxisHelper(10000);
        //// sceneに追加
        //scene.add(axis);
        // MESHES WITH ANIMATED TEXTURES!
        // man = new Billboard(scene);
        // Add Sky Mesh
        var sky = new Sky();
        scene.add(sky.mesh);
        car = new Car3D(scene);
        Main.camera.setTarget(car);
        //var cloud = new Cloud(scene);
        //sea = new Sea(scene);
        ground = new Ground(scene, "../models/crs_1_land.json");
        //if (sea) { }
        // Add Sun Helper
        var sunSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(20000, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        //sunSphere.position.y = - 700000;
        sunSphere.position.z = -700000;
        sunSphere.visible = false;
        scene.add(sunSphere);
        createLights();
        /// GUI
        var effectController = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: /*0.49*/ 1,
            azimuth: /*0.25*/ 0.7,
            sun: !true
        };
        var distance = 400000;
        function guiChanged() {
            var uniforms = sky.uniforms;
            uniforms.turbidity.value = effectController.turbidity;
            uniforms.rayleigh.value = effectController.rayleigh;
            uniforms.luminance.value = effectController.luminance;
            uniforms.mieCoefficient.value = effectController.mieCoefficient;
            uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
            var theta = Math.PI * (effectController.inclination - 0.5);
            var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
            sunSphere.position.x = distance * Math.cos(phi);
            sunSphere.position.z = distance * Math.sin(phi) * Math.sin(theta);
            sunSphere.position.y = -distance * Math.sin(phi) * Math.cos(theta);
            directionalLight.position.copy(sunSphere.position);
            sunSphere.visible = effectController.sun;
            sky.uniforms.sunPosition.value.copy(sunSphere.position);
            Main.renderer.render(scene, Main.camera.getCamera());
        }
        var gui = new dat.GUI({ autoPlace: false });
        var customContainer = document.getElementById('gui-container');
        if (customContainer) {
            customContainer.appendChild(gui.domElement);
        }
        var skyFolder = gui.addFolder('Sky');
        skyFolder.add(effectController, "turbidity", 1.0, 20.0 /*, 0.1*/).onChange(guiChanged);
        skyFolder.add(effectController, "rayleigh", 0.0, 4 /*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "mieCoefficient", 0.0, 0.1 /*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "mieDirectionalG", 0.0, 1 /*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "luminance", 0.0, 2).onChange(guiChanged);
        skyFolder.add(effectController, "inclination", 0, 1 /*, 0.0001*/).onChange(guiChanged);
        skyFolder.add(effectController, "azimuth", 0, 1 /*, 0.0001*/).onChange(guiChanged);
        skyFolder.add(effectController, "sun").onChange(guiChanged);
        guiChanged();
        //  Set up key listeners
        document.addEventListener('keydown', function (e) { onKeyDown(e); }, true);
        document.addEventListener('keyup', function (e) { onKeyUp(e); }, true);
    }
    Main.init = init;
    function setInputKeyState(k, s) {
        var i = car.inputs;
        if (k === 39)
            i.left = s;
        else if (k === 37)
            i.right = s;
        else if (k === 38)
            i.throttle = s;
        else if (k === 40)
            i.brake = s;
        else if (k === 32)
            i.ebrake = s;
    }
    function onKeyDown(k) {
        setInputKeyState(k.keyCode, 1.0);
    }
    function onKeyUp(k) {
        setInputKeyState(k.keyCode, 0.0);
    }
    function animate() {
        requestAnimationFrame(animate);
        // 
        update();
        render();
    }
    Main.animate = animate;
    function update() {
        var delta = clock.getDelta();
        // controls.update();
        Main.camera.update();
        car.update(ground.mesh, delta * 1000);
        // Jflight.DT = delta;
        /* 2Dコンテキスト */
        //let context = canvas.getContext("2d");
        //flight.run();
        // boomer.update(1000 * delta);
        // man.update(1000 * delta);
        // if (keyboard.pressed("z")) {
        // do something
        // }
        // controls.update();
        // stats.update();
        // man.quaternion(camera.quaternion);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //flight.setWidth(window.innerWidth);
        //flight.setHeight(window.innerHeight);
    }
    function render() {
        Main.renderer.render(scene, Main.camera.getCamera());
    }
})(Main || (Main = {}));
Main.init();
Main.animate();
"use strict";
/**
 *  DOM Utils
 */
/**  Shorthand for document.getElementById */
function $e(id) {
    return document.getElementById(id);
}
//# sourceMappingURL=domutil.js.map 
var Cloud = (function () {
    function Cloud(scene) {
        var geometry = new THREE.DodecahedronGeometry(100, 1);
        var material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            wireframe: false,
            side: THREE.DoubleSide
        });
        var cube = new THREE.Mesh(geometry, material);
        cube.scale.x = 2;
        cube.scale.y = 2;
        cube.position.set(0, 0, 3000);
        scene.add(cube);
    }
    return Cloud;
}());
//# sourceMappingURL=out.js.map