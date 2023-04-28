// GET CANVAS CONTEXT TO PASS TO THE ENGINE
// THE ENGINE WILL CREATE THE GL CONTEXT AND HENDLE RENDERING
let canvas = document.getElementById("main-canvas");
const engine = new RenderEngine(canvas);

let fighterMap = {
  name: 'fighter',
  vertexSource: 'resources/shaders/vertex/texture.vert',
  fragmentSource: 'resources/shaders/fragment/texture.frag',
  objectSource: 'resources/models/fighter.obj',
  textureSource: 'resources/textures/spaceshiptex.jpg'
};

let planetMap = {
  name: 'planet',
  vertexSource: 'resources/shaders/vertex/texture.vert',
  fragmentSource: 'resources/shaders/fragment/texture.frag',
  objectSource: 'resources/models/sphereT.obj',
  textureSource: 'resources/textures/planet.jpg'
}

engine.CreateObject(
  fighterMap
).then(() => {
  engine.SetObjectAnimate("fighter", () => {
    // engine.Translate("fighter", [0, 0, 0]);
    
    engine.Spin("fighter", [0,1,0], 2);
    engine.Rotate("fighter", [0, 0, 0], 3 * Math.PI / 2);
  });
});

engine.CreateObject(
  planetMap
).then(() => {
  engine.SetObjectAnimate("planet", () => {
    engine.Translate("planet", [-200, 500, -5000]);
    engine.Scale("planet", [3000, 3000, 3000]);
    engine.Spin("planet", [0, 1, 0], 2);
  })
});