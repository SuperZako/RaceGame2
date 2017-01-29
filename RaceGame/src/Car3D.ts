///<reference path="./Physics/Car.ts" />
///<reference path="./Physics/InputState.ts" />

class Car3D {
    private car: Car;
    private mesh: THREE.Mesh;
    private stats: Stats;
    public inputs = new InputState();
    public group = new THREE.Object3D();
    public constructor(scene: THREE.Scene, url: string) {
        //  Displays useful car physics data
        this.stats = new Stats();
        this.car = new Car({ stats: this.stats });


        //オブジェクト
        let loader = new THREE.JSONLoader();
        loader.load(url, (geometry, materials) => { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得
            var faceMaterial = new THREE.MultiMaterial(materials);
            this.mesh = new THREE.Mesh(geometry, faceMaterial);
            this.mesh.rotation.x = Math.PI / 2;
            this.group.add(this.mesh);
        });

        scene.add(this.group);
    }

    /**  Update game logic by delta T (millisecs) */
    public update(dt: number) {
        this.car.setInputs(this.inputs);
        this.car.update(dt);

        this.group.position.set(this.car.position.y, this.car.position.x, 0);
        this.group.rotation.z = -this.car.heading;
    }
}