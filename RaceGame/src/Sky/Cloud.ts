
class Cloud {
    public constructor(scene: THREE.Scene) {
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
}