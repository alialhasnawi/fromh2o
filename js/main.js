import * as V from './v.js';
import * as AniM from './animman.js';

// TESTING BLOCK / DOM
{
    // const inslide = document.querySelector('#test-slide');
    // const outtest = document.querySelector('#test-out');

    // inslide.addEventListener('input', ()=>{
    //     let value = 37 ** inslide.value - 1;
    //     vTool.volume = value;
        
    //     let outs = `${Number.parseFloat(value).toPrecision(3)}gal
    //     Container:\t${vTool.id}
    //     Capacity:\t${Math.round(vTool.capacity * 100)}%
    //     Height:\t${Number.parseFloat(vTool.height).toPrecision(3)}m`;

    //     outtest.innerText = outs;
        
    //     updateWater(vTool.id, vTool.height, vTool.volume);
    // });

    const involumequantity = document.querySelector('#v-in-volume-wrapper');
    const incustomquantity = document.querySelector('#v-in-volume-custom');
    const incustomradio = document.querySelector('#v-in-volume-custom-dummy');

    incustomquantity.addEventListener('input', (e)=>{
        incustomradio.checked = true;
    });
    
    involumequantity.addEventListener('input', (e)=>{
        let value = Number.isNaN(parseFloat(e.target.value)) ? 0.0 : e.target.value; 
        vTool.volume = Math.max(parseFloat(value), 0.0);
        updateWater(vTool.id, vTool.height, vTool.volume);
    });
}


//-------------------------INIT VOLUME-------------------------//

const WATERMATERIAL = new THREE.MeshBasicMaterial({color: 0x34b1eb, opacity: 0.5, transparent: true});
const VOLUMES = [
    new V.Volume('tub', 0.9447, 0.38),
    new V.Volume('shipping', 14.7, 2.59),
    new V.Volume('house', 113.97, 4.4),
    new V.Volume('pool', 1250.0, 2.9),
    new V.Volume('arena', 16084.95, 48),
    new V.Volume('cn', 22500, 528),
    new V.Volume('central', 3200000.0, 800),
    new V.Volume('cube', 3600000000, 60000)
];
const VDESCRIPTION = {
    'tub': 'Bathtub',
    'shipping': "20' Shipping Container",
    'house': 'Average US House',
    'pool': 'Olympic-size Swimming Pool',
    'arena': 'Colosseum',
    'cn': 'CN Tower, Toronto',
    'central': 'Central Park, NY',
    'cube': ''
}
const vTool = new V.VTool(VOLUMES);
const vDisplay = {
    'name': document.querySelector('#v-text-name'),
    'volume': document.querySelector('#v-text-volume')
};


//-------------------------INIT RENDER-------------------------//

const ERRORFUN = e => `Error: ${e}`;
const MODELS = ['tub', 'shipping', 'house', 'pool', 'arena', 'cn', 'central', 'cube'];
const POSITIONS = {
    'tub': 0,
    'shipping': 6,
    'house': 9,
    'pool': 30,
    'arena': 110,
    'cn': 500,
    'central': 1350,
    'cube': 35000
};
let distCounterLoop = 0;
for (const k in POSITIONS) {
    const d = POSITIONS[k] + distCounterLoop;
    distCounterLoop += POSITIONS[k];
    POSITIONS[k] = [d, 0, d];
}
const WATEROFFSETS = {
    'pool': [0, -3, 0],
    'tub': [0, 0.081, 0],
    'house': [0, 0.01, 0],
    'central': [0, 4, 0]
};
const CAMPOSITIONS = {
    'tub': 1.3,
    'shipping': 5,
    'house': 12,
    'pool': 28,
    'arena': 100,
    'cn': 300,
    'central': 2500,
    'cube': 45000
};
const CAMOFFSETS = {
    'pool': [-6, -10, 0],
    'arena': [5, 0, 0],
    'cn': [0, 220, 0]
};
for (const key in CAMPOSITIONS) {
    CAMPOSITIONS[key] = [
        POSITIONS[key][0] + CAMPOSITIONS[key],
        POSITIONS[key][1] + CAMPOSITIONS[key],
        POSITIONS[key][2] - CAMPOSITIONS[key]
    ];

    if (CAMOFFSETS.hasOwnProperty(key)) {
        CAMPOSITIONS[key] = CAMPOSITIONS[key].map((num, index)=>(num + CAMOFFSETS[key][index]));
    }
}
const CONTAINERS = {}; // store model of container
const WATERPRISMS = {};  // store box model of "water"

const halfView = document.querySelector('#three-view');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 130000.0);
const loader = new THREE.GLTFLoader();
const renderer = new THREE.WebGLRenderer({antialias: true});
const animm = new AniM.AnimMan(0.001);

const upLight = new THREE.DirectionalLight(0xffffff, 0.2);
scene.add(upLight);
const camlight = new THREE.PointLight(0xffffff, 0.9);
const amblight = new THREE.AmbientLight(0xebf4fa, 0.4);
scene.add(amblight);
scene.add(camlight);
scene.background = new THREE.Color(0xdfedf5);

renderer.setSize(window.innerHeight, window.innerHeight);
window.addEventListener('resize', ()=>{
    renderer.setSize(window.innerHeight, window.innerHeight);
});
halfView.appendChild(renderer.domElement);

camera.position.set(...CAMPOSITIONS['tub']);
camlight.position.set(...CAMPOSITIONS['tub']);
camera.lookAt(0, 0, 0);

animm.origin('cam', camera.position);
animm.origin('camlight', camlight.position);


//-------------------------LOAD MODELS-------------------------//

for (let i = 0; i < MODELS.length; i++) {
    const id = MODELS[i];
    
    loader.load(`models/${id}.glb`, (glb)=>{
        CONTAINERS[id] = glb.scene;
        scene.add(CONTAINERS[id]);
        CONTAINERS[id].position.set(...POSITIONS[id]);
    }, undefined, ERRORFUN);

    loader.load(`models/w${id}.glb`, (glb)=>{
        WATERPRISMS[id] = glb.scene;
        scene.add(WATERPRISMS[id]);
        if (WATEROFFSETS.hasOwnProperty(id)) {
            let offsetted = POSITIONS[id].map((num, index)=>(num + WATEROFFSETS[id][index]));
            WATERPRISMS[id].position.set(...offsetted);
        } else {
            WATERPRISMS[id].position.set(...POSITIONS[id]);
        }

        WATERPRISMS[id].children[0].material = WATERMATERIAL;

        WATERPRISMS[id].scale.set(1, 0, 1);
        animm.origin(id, WATERPRISMS[id].scale, scalevect3=>{
            if (scalevect3.y == 0) {
                WATERPRISMS[id].visible = false;
            }
        });
    }, undefined, ERRORFUN);
}

function updateWater(name, height, volume=0) {
    for (let i = 0; i < MODELS.length; i++) {
        const id = MODELS[i];
        animm.target(id, {x: 1, y: 0, z: 1});
    }

    WATERPRISMS[name].visible = true;
    animm.target(name, {x: 1, y: height, z: 1});
    animm.target('cam', CAMPOSITIONS[name]);
    animm.target('camlight', CAMPOSITIONS[name]);

    vDisplay['name'].innerText = VDESCRIPTION[name];
    vDisplay['volume'].innerText = V.format(volume);
}

function animate() {
	requestAnimationFrame(animate);
    renderer.render(scene, camera);
    animm.tick();
}

animate();