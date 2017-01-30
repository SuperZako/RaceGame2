
///<reference path="THREEx.KeyboardState.ts" />
///<reference path="THREEx.WindowResize.ts" />
///<reference path="./Sky/SkyShader.ts" />
///<reference path="./Terrain/Ground.ts" />
///<reference path="Car3D.ts" />





// グローバル変数
declare interface Promise<T> {
    finally<U>(onFinally?: () => U | Promise<U>): Promise<U>;
}

// Main
namespace Main {
    "use strict";


    /* canvas要素のノードオブジェクト */

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;// = canvas.getContext("2d");


    // standard global variables
    let container: HTMLDivElement;
    let scene: THREE.Scene;
    export var camera: Camera;//THREE.PerspectiveCamera;

    export var renderer: THREE.WebGLRenderer;

    // var stats: Stats;
    let clock = new THREE.Clock();

    // let controls: THREE.OrbitControls;
    let directionalLight: THREE.DirectionalLight;

    export var keyboard = new THREEx.KeyboardState();

    let car: Car3D;


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
    export function init(): void {
        canvas = <HTMLCanvasElement>document.getElementById("hud");
        let _context = canvas.getContext("2d");
        if (_context) {
            context = _context;
        }
        // scene
        scene = new THREE.Scene();

        // camera
        const SCREEN_WIDTH = window.innerWidth;
        const SCREEN_HEIGHT = window.innerHeight;
        //const VIEW_ANGLE: number = 90;
        //const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        //const NEAR = 0.1;
        //const FAR = 2000000;

        camera = new Camera(scene);//new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        //scene.add(camera);
        //camera.position.y = SCREEN_HEIGHT / 2;
        //camera.lookAt(scene.position);
        //camera.up.set(0, 0, 1);

        // RENDERER
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        container = <HTMLDivElement>document.getElementById("view3d");

        container.appendChild(renderer.domElement);

        // EVENTS
        THREEx.WindowResize(renderer, camera.getCamera());
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

        car = new Car3D(scene, "../models/f1_1_body.json");
        camera.setTarget(car);
        //var cloud = new Cloud(scene);

        //sea = new Sea(scene);

        let ground = new Ground(scene, "../models/crs_1_land.json");
        if (ground) { }
        //if (sea) { }
        // Add Sun Helper
        var sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry(20000, 16, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        //sunSphere.position.y = - 700000;
        sunSphere.position.z = - 700000;
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
            inclination: /*0.49*/1, // elevation / inclination
            azimuth: /*0.25*/0.7, // Facing front,
            sun: ! true
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
            sunSphere.position./*y*/z = distance * Math.sin(phi) * Math.sin(theta);
            sunSphere.position./*z*/y = -distance * Math.sin(phi) * Math.cos(theta);

            directionalLight.position.copy(sunSphere.position);

            sunSphere.visible = effectController.sun;

            sky.uniforms.sunPosition.value.copy(sunSphere.position);

            renderer.render(scene, camera.getCamera());

        }


        var gui = new dat.GUI({ autoPlace: false });
        let customContainer = document.getElementById('gui-container');
        if (customContainer) {
            customContainer.appendChild(gui.domElement);
        }

        let skyFolder = gui.addFolder('Sky');
        skyFolder.add(effectController, "turbidity", 1.0, 20.0/*, 0.1*/).onChange(guiChanged);
        skyFolder.add(effectController, "rayleigh", 0.0, 4/*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "mieCoefficient", 0.0, 0.1/*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "mieDirectionalG", 0.0, 1/*, 0.001*/).onChange(guiChanged);
        skyFolder.add(effectController, "luminance", 0.0, 2).onChange(guiChanged);
        skyFolder.add(effectController, "inclination", 0, 1/*, 0.0001*/).onChange(guiChanged);
        skyFolder.add(effectController, "azimuth", 0, 1/*, 0.0001*/).onChange(guiChanged);
        skyFolder.add(effectController, "sun").onChange(guiChanged);

        guiChanged();

        //  Set up key listeners
        document.addEventListener('keydown', (e) => { onKeyDown(e); }, true);
        document.addEventListener('keyup', (e) => { onKeyUp(e); }, true);
    }

    function setInputKeyState(k: number, s: number) {
        var i = car.inputs;
        if (k === /*37*/39)       // arrow left
            i.left = s;
        else if (k === /*39*/37)  // arrow right
            i.right = s;
        else if (k === 38)  // arrow up
            i.throttle = s;
        else if (k === 40)  // arrow down
            i.brake = s;
        else if (k === 32)  // space
            i.ebrake = s;
    }

    function onKeyDown(k: KeyboardEvent) {
        setInputKeyState(k.keyCode, 1.0);
    }

    function onKeyUp(k: KeyboardEvent) {
        setInputKeyState(k.keyCode, 0.0);
    }

    export function animate() {
        requestAnimationFrame(animate);

        // 
        update();
        render();
    }

    function update() {
        var delta = clock.getDelta();
        // controls.update();

        camera.update();
        car.update(delta * 1000);


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
        renderer.render(scene, camera.getCamera());
    }
}

Main.init();
Main.animate();