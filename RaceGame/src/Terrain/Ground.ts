
class Ground {
    public mesh: THREE.Mesh;
    public constructor(scene: THREE.Scene, url: string) {
        //オブジェクト
        let loader = new THREE.JSONLoader();
        loader.load(url, (geometry, materials) => { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得
            let faceMaterial = new THREE.MultiMaterial(materials);
            this.mesh = new THREE.Mesh(geometry, faceMaterial);
            this.mesh.rotation.x = Math.PI / 2;
            scene.add(this.mesh);
        });
    }
}