class Camera {
    private camera: THREE.PerspectiveCamera;
    private dummyCamera: THREE.PerspectiveCamera;

    private target: Car3D;

    private positionOffset = new THREE.Vector3();
    private targetOffset = new THREE.Vector3();

    constructor(scene: THREE.Scene) {

        this.positionOffset.set(0, -10, 10);
        // this.targetOffset.z = -1000;

        // camera
        const SCREEN_WIDTH = window.innerWidth;
        const SCREEN_HEIGHT = window.innerHeight;
        const VIEW_ANGLE: number = 90;
        const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        const NEAR = 0.1;
        const FAR = 2000000;

        let camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.up.set(0, 0, 1);
        scene.add(camera);
        camera.position.z = SCREEN_HEIGHT / 2;
        camera.lookAt(scene.position);
        this.camera = camera;
        this.dummyCamera = this.camera.clone();
    }

    public getCamera() {
        return this.camera;
    }

    public update() {
        let target = this.target;

        let v1 = this.positionOffset.clone();
        let v2 = this.targetOffset.clone();

        let matrix = target.group.matrixWorld;
        v1.applyMatrix4(matrix);
        //v1.add(target.mesh.position);

        v2.applyMatrix4(matrix);
        //v2.add(target.mesh.position);


        this.dummyCamera.up.set(0, 0, 1);
        this.dummyCamera.position.copy(v1);
        this.dummyCamera.lookAt(v2);

        this.camera.quaternion.slerp(this.dummyCamera.quaternion, 0.5);
        this.camera.position.lerp(this.dummyCamera.position, 0.5);
    }

    public setTarget(target: Car3D) {
        this.target = target;
    }
}