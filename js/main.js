// GET CANVAS CONTEXT TO PASS TO THE ENGINE
// THE ENGINE WILL CREATE THE GL CONTEXT AND HENDLE RENDERING
let canvas = document.getElementById("main-canvas");
vertSource = null;
fragSource = null;
oData = null;
let myshader = null;
const engine = new RenderEngine(canvas);

LoadResources().then(() => {
  obj = InitializeObject(vertSource, fragSource, oData);
  engine.AddObject(obj);
});

async function LoadResources() {
  vertSource = await loadNetworkResourceAsText('resources/shaders/vertex/bary300.vert');     // VERTEX SHADER
  fragSource = await loadNetworkResourceAsText('resources/shaders/fragment/bary300.frag');   // FRAGMENT SHADER
  oData = await loadNetworkResourceAsText('resources/models/fighter.obj');
}

function InitializeObject(vertSource, fragSource, oData) {
  let shader = new Shader(
    engine.GL,
    vertSource,
    fragSource
  );
  
  let parsedData = new OBJData(oData);
  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexData(
    engine.GL,
    rawData.vertices,
    engine.GL.FLOAT,
    3
  );
  let vertexNormalBuffer = new VertexData(
    engine.GL,
    rawData.normals,
    engine.GL.FLOAT,
    3
  );
  let vertexTexCoordBuffer = new VertexData (
    engine.GL,
    rawData.uvs,
    engine.GL.FLOAT,
    2
  );
  
  let vertexBarycentricBuffer = new VertexData (
    engine.GL,
    rawData.barycentricCoords,
    engine.GL.FLOAT,
    3
  );

  let attributeBufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aBarycentricCoord': vertexBarycentricBuffer,
    // 'aVertexNormal'    : vertexNormalBuffer,
    // 'aVertexTexCoord'  : vertexTexCoordBuffer
  }

  obj = new DrawableObject(
    engine.GL,
    shader,
    attributeBufferMap,
    null,
    rawData.vertices.length / 3
  );

  obj.uniformLocations = shader.GetUniformLocations([
    'uMatrix'
  ]);
  
  obj.UniformSetup = () => {
    engine.GL.uniformMatrix4fv(
      obj.uniformLocations.uMatrix,
      false,
      engine.matrix
    );
  }

  // engine.AddObject(obj);

  return obj;
}

