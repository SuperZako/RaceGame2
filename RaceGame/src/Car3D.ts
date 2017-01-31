///<reference path="./Physics/Car.ts" />
///<reference path="./Physics/InputState.ts" />

class Car3D {
    private car: Car;
    private body: THREE.Mesh;
    private tire: THREE.Mesh;
    private collisionCube: THREE.Mesh;
    private stats: Stats;
    public inputs = new InputState();
    public group = new THREE.Object3D();

    public constructor(scene: THREE.Scene) {
        //  Displays useful car physics data
        this.stats = new Stats();
        this.car = new Car({ stats: this.stats });


        //オブジェクト
        let loader = new THREE.JSONLoader();
        loader.load("../models/f1_1_body.json", (geometry, materials) => { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得
            var faceMaterial = new THREE.MultiMaterial(materials);
            this.body = new THREE.Mesh(geometry, faceMaterial);
            this.body.rotation.x = Math.PI / 2;
            this.group.add(this.body);
        });

        loader.load("../models/f1_f_tire.json", (geometry, materials) => { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得
            var faceMaterial = new THREE.MultiMaterial(materials);
            this.tire = new THREE.Mesh(geometry, faceMaterial);
            this.tire.rotation.x = Math.PI / 2;
            this.tire.position.set(-1, 2, 0);
            this.group.add(this.tire);
        });

        let cubeGeometry = new THREE.CubeGeometry(5, 5, 5, 1, 1, 1);
        let wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        this.collisionCube = new THREE.Mesh(cubeGeometry, wireMaterial);
        this.group.add(this.collisionCube);

        scene.add(this.group);

        this.setPosition(-78, -4);
    }

    public setPosition(x: number, y: number) {
        this.car.position.set(y, x);

    }
    //private localToWorld(position: { x: number, y: number }) {
    //    let x = position.y;
    //    let y = position.x;
    //    return { x, y };
    //}

    private applyCollision(world: THREE.Mesh) {
        let geometry = <THREE.Geometry>this.collisionCube.geometry;

        let originLocalPoint = geometry.vertices[0].clone();
        let originWorldPoint = originLocalPoint.applyMatrix4(this.group.matrix);

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
    }

    /**  Update game logic by delta T (millisecs) */
    public update(world: THREE.Mesh, dt: number) {
        this.car.setInputs(this.inputs);
        this.car.update(dt);


        this.group.position.set(this.car.position.y, this.car.position.x, 0);
        this.group.rotation.z = -this.car.heading;

        this.applyCollision(world);



        //let x = this.group.position.x;
        //let y = this.group.position.y;
        //let infoEl = <HTMLDivElement>document.getElementById("info");
        //infoEl.textContent = `Position X:${x}  Y:${y}`;
    }
}