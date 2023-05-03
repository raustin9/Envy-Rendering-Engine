// GET CANVAS CONTEXT TO PASS TO THE ENGINE
// THE ENGINE WILL CREATE THE GL CONTEXT AND HENDLE RENDERING
let canvas = document.getElementById("main-canvas");
const engine = new RenderEngine(canvas);
engine.SetLightPosition([300, 2, 5])

let fighterMap = {
  name: 'fighter',
  vertexSource: 'resources/shaders/vertex/texture.vert',
  fragmentSource: 'resources/shaders/fragment/texture.frag',
  objectSource: 'resources/models/fighter.obj',
  textureSource: 'resources/textures/fighter.jpg'
};

let planetMap = {
  name: 'planet',
  vertexSource: 'resources/shaders/vertex/normal.vert',
  fragmentSource: 'resources/shaders/fragment/normal.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/mars2.jpg',  
  normalSource: 'resources/textures/bump5.jpg'
}

let sunMap = {
  name: 'sun',
  vertexSource: 'resources/shaders/vertex/texture.vert',
  fragmentSource: 'resources/shaders/fragment/texture.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/sun.jpg'
}

let normMap = {
  name: 'norm',
  vertexSource: 'resources/shaders/vertex/normal.vert',
  fragmentSource: 'resources/shaders/fragment/normal.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/mars2.jpg',
  normalSource: 'resources/textures/marsbump.jpg'
}

// engine.CreateObject(
//   normMap
// ).then(() => {
//   engine.SetObjectAnimate("norm", () => {
//     engine.Translate("norm", [0, 4, -10]);
//   })
// })

engine.CreateObject(
  fighterMap
).then(() => {
  engine.SetObjectAnimate("fighter", () => {
    engine.Spin("fighter", [0,1,0], 0.5);
    engine.Rotate("fighter", [1, 0, 0], 3 * Math.PI / 2);
  });
});

engine.CreateObject(
  planetMap
).then(() => {
  engine.SetObjectAnimate("planet", () => {
    engine.Translate("planet", [-200, 500, -5000]);
    engine.Scale("planet", [3000, 3000, 3000]);
    engine.Rotate("planet", [1, 0.5, 0], Math.PI / 4);
    engine.Spin("planet", [0, 1, 0], 0.5);
  })
});
// engine.CreateObject(
//   planetMap
// ).then(() => {
//   engine.SetObjectAnimate("planet", () => {
//     engine.Translate("planet", [2, 4, -8]);
//     // engine.Scale("planet", [2, 2, 2]);
//     engine.Rotate("planet", [1, 0.5, 0], Math.PI / 4);
//     engine.Spin("planet", [0, 1, 0], 0.5);
//   })
// });

engine.CreateObject(
  sunMap
).then(() => {
  engine.SetObjectAnimate("sun", () => {
    engine.Translate("sun", [20000, 6000, 0]);
    engine.Scale("sun", [1000, 1000, 1000]);
  })
})