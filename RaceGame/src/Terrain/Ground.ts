
class Ground {

    public constructor(scene: THREE.Scene, url: string) {
        //オブジェクト
        let loader = new THREE.JSONLoader();
        loader.load(url, (geometry, materials) => { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得
            var faceMaterial = new THREE.MultiMaterial(materials);
            let mesh = new THREE.Mesh(geometry, faceMaterial);
            mesh.scale.set(100, 100, 100);
            mesh.rotation.x = Math.PI / 2;
            scene.add(mesh);
        });
    }
}