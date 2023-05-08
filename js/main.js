// GET CANVAS CONTEXT TO PASS TO THE ENGINE
// THE ENGINE WILL CREATE THE GL CONTEXT AND HENDLE RENDERING
let canvas = document.getElementById("main-canvas");
const engine = new RenderEngine(canvas);
engine.SetLightPosition([20, 2, 5])

let fighterMap = {
  name: 'fighter',
  vertexSource: 'resources/shaders/vertex/texture.vert',
  fragmentSource: 'resources/shaders/fragment/texture.frag',
  objectSource: 'resources/models/fighter.obj',
  textureSource: 'resources/textures/fighter.jpg'
};

let cruiserMap = {
  name: 'cruiser',
  vertexSource: 'resources/shaders/vertex/normal.vert',
  fragmentSource: 'resources/shaders/fragment/normal.frag',
  objectSource: 'resources/models/USSEnterprise.obj',
  textureSource: 'resources/textures/enterprise.png',
  normalSource: 'resources/textures/bump6.jpg'
};

let planetMap = {
  name: 'planet',
  vertexSource: 'resources/shaders/vertex/normal.vert',
  fragmentSource: 'resources/shaders/fragment/normal.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/Terrestrial1.png',  
  normalSource: 'resources/textures/bump5.jpg'
}

let sunMap = {
  name: 'sun',
  vertexSource: 'resources/shaders/vertex/sun.vert',
  fragmentSource: 'resources/shaders/fragment/sun.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/sun.jpg',
}

let portalMap = {
  name: "portal",
  vertexSource: 'resources/shaders/vertex/env.vert',
  fragmentSource: 'resources/shaders/fragment/env.frag',
  objectSource: 'resources/models/Crystal.obj',
  environmentSource: [
    'resources/textures/cubemap/portal.jpg',
    'resources/textures/cubemap/portal.jpg',
    'resources/textures/cubemap/portal.jpg',
    'resources/textures/cubemap/portal.jpg',
    'resources/textures/cubemap/portal.jpg',
    'resources/textures/cubemap/portal.jpg',
  ]
};

engine.CreateObject(
  fighterMap
).then(() => {
  engine.SetObjectAnimate("fighter", () => {
    engine.Translate("fighter", [0, 0, -25]);
    engine.Spin("fighter", [0,1,0], 0.5);
    engine.Rotate("fighter", [1, 0, 0], 3 * Math.PI / 2);
  });
});

engine.CreateObject(
  cruiserMap
).then(() => {
  engine.SetObjectAnimate("cruiser", () => {
    engine.Translate("cruiser", [5, 0, -30]);
    engine.Scale("cruiser", [10, 10, 10]);
    engine.Rotate("cruiser", [0, 0, 1], Math.PI / 6);
    engine.Rotate("cruiser", [0, 1, 0], -Math.PI / 8);
    engine.Rotate("cruiser", [1, 0, 0], Math.PI / 16);
    // engine.Spin("cruiser", [0,0,1], 0.5);
  })
})

// CREATE THE GIANT PLANET IN THE BACKGROUND
engine.CreateObject(
  planetMap
).then(() => {
  engine.SetObjectAnimate("planet", () => {
    engine.Translate("planet", [-200, 500, -5000]);
    engine.Scale("planet", [3000, 3000, 3000]);
    engine.Rotate("planet", [1, 0.5, 0], Math.PI / 4);
    engine.Spin("planet", [0, 1, 0], 0.1);
  })
});

engine.CreateObject(
  sunMap
).then(() => {
  engine.SetObjectAnimate("sun", () => {
    engine.Translate("sun", [20000, 6000, 0]);
    engine.Scale("sun", [1000, 1000, 1000]);
  })
})

engine.CreateObject(
  portalMap
).then(() => {
  engine.SetObjectAnimate("portal", () => {
    engine.Translate("portal", [40, 20, -40]);
    engine.Rotate("portal", [0, 1, 0], Math.PI / 2)
    // engine.Spin("portal", [1, 0, 1], 0.6);
    engine.Scale("portal", [15, 30, 15]);
    engine.Spin("portal", [0, 1, 0], 0.2);
   
  })
})