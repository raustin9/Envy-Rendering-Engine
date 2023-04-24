// THIS IS THE BASE CLASS FOR THE ENGINE //
class RenderEngine {
  /* GLOBAL CONTEXT VARIABLES */
  window = null;
  canvas = null;
  GL = null; 

  Cube = null;

  projectionMatrix = glMatrix.mat4.create();
  modelViewMatrix = glMatrix.mat4.create();
  cameraMatrix = glMatrix.mat4.create();
  viewMatrix = glMatrix.mat4.create();
  viewProjectionMatrix = glMatrix.mat4.create();
  matrix = glMatrix.mat4.create();

  then = 0;
  globalTime = 0;

  cameraVals = [0,0,6]; // used to move the camera around via translation
  cameraAngle = 0;      // used to change the angle of the camera via rotation
  moveSpeed = 10;     // the speed that the camera can move around
  turnSpeed = 1.5;    // the speed that the camera can turn
  keysPressed = {};

  /**
   * 
   * @param {String} canvas_name name of the canvas that will be the webGL context
   */
  constructor(canvas_name) {
    this.Main(canvas_name);
  }

  /**
   * 
   * @param {String} canvas_name name of the canvas to get WebGL2 context
   */
  async Main(canvas_name) {
    this.window = window;
    this.canvas = document.getElementById(canvas_name);
    this.GL = this.canvas.getContext('webgl2');

    if (!this.GL) {
      console.log("ERROR: BROWSER DOES NOT SUPPORT WEBGL2");
      return;
    }

    this.GL.clearColor(0.3,0.3,0.3,1.0);
    this.GL.clear(this.GL.COLOR_BUFFER_BIT);

    // GET THE RESOURCES: SHADERS
    await this.LoadResources();
    // this.InitializeObject();

    // GET KEY INPUTS
    this.window.addEventListener('keydown', this.KeyDown.bind(this));
    this.window.addEventListener('keyup', this.KeyUp.bind(this));

    // RENDER SCENE
    requestAnimationFrame(this.Render.bind(this));
  }

  KeyDown(event) {
    this.keysPressed[event.keyCode] = true;
    event.preventDefault();
  }

  KeyUp(event) {
    this.keysPressed[event.keyCode] = false;
    event.preventDefault();
  }

  InitIndexBuffer() {
    // const indexBuffer = this.GL.createBuffer();
    // this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, indexBuffer);


    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ];

    // this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.GL.STATIC_DRAW);
    let indexBuffer = new ElementData(
      this.GL,
      indices
    );
    return indexBuffer;
  }

  InitColorBuffer() {
    // const colorBuffer = this.GL.createBuffer();
    // const colorData = [
    //   1.0,
    //   1.0,
    //   1.0,
    //   1.0, // white
    //   1.0,
    //   0.0,
    //   0.0,
    //   1.0, // red
    //   0.0,
    //   1.0,
    //   0.0,
    //   1.0, // green
    //   0.0,
    //   0.0,
    //   1.0,
    //   1.0, // blue
    // ];
    const faceColors = [
      [1.0, 1.0, 1.0, 1.0], // Front face: white
      [1.0, 0.0, 0.0, 1.0], // Back face: red
      [0.0, 1.0, 0.0, 1.0], // Top face: green
      [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
      [1.0, 1.0, 0.0, 1.0], // Right face: yellow
      [1.0, 0.0, 1.0, 1.0], // Left face: purple
    ];

    let colors = [];
    for (let i = 0; i < faceColors.length; i++) {
      const c = faceColors[i];
      colors = colors.concat(c,c,c,c);
    }

    let vertexColorBuffer = new VertexData(
      this.GL,
      colors,
      this.GL.FLOAT,
      4
    );

    // this.GL.bindBuffer(this.GL.ARRAY_BUFFER, colorBuffer);
    // this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(colors), this.GL.STATIC_DRAW);

    // return colorBuffer;
    // console.log(vertexColorBuffer);
    return vertexColorBuffer;
  }

  InitPositionBuffer() {
    // const positionBuffer = this.GL.createBuffer();

    // this.GL.bindBuffer(this.GL.ARRAY_BUFFER, positionBuffer);

    // const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const positions = [
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    
      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    
      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    
      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    
      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    
      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];    

    let vertexPositionBuffer = new VertexData(
      this.GL,
      positions,
      this.GL.FLOAT,
      3
    );

    // this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(positions), this.GL.STATIC_DRAW);

    // return positionBuffer;
    // console.log(vertexPositionBuffer);
    return vertexPositionBuffer;
  }

  InitializeObject(vertSource, fragSource, objectData) {
    let vertexPositionBuffer = this.InitPositionBuffer();
    let vertexColorBuffer = this.InitColorBuffer();
    let indexBuffer = this.InitIndexBuffer();

    let shader = new Shader(
      this.GL, 
      vertSource, 
      fragSource
    );
    // console.log(objectData);
    let parsedData = new OBJData(objectData);
    let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

    // let vertexPositionBuffer = new VertexData(
    //   this.GL,
    //   rawData.vertices,
    //   this.GL.float,
    //   3
    // );

    let attributeBufferMap = {
      'aVertexPosition': vertexPositionBuffer,
      'aVertexColor'   : vertexColorBuffer
    };

    // this.Cube = new DrawableObject(
    //   this.GL,
    //   shader,
    //   attributeBufferMap,
    //   null,
    //   rawData.vertices / 3
    // );

    this.Cube = new DrawableObject(
      this.GL,
      shader,
      attributeBufferMap,
      indexBuffer,
      null
    );

    this.Cube.uniformLocations = shader.GetUniformLocations([
      'uMatrix'
    ]);
    
    this.Cube.UniformSetup = () => {
      this.GL.uniformMatrix4fv(
        this.Cube.uniformLocations.uMatrix,
        false,
        this.matrix
      );
    }
  }

  Render(now) {
    now *= 0.001;
    let deltaTime = now - this.then;
    this.then = now;
    this.RenderScene(deltaTime);
    requestAnimationFrame(this.Render.bind(this));
  }

  RenderScene(deltaTime) {
    this.globalTime += deltaTime;
    this.GL.viewport(0, 0, this.GL.canvas.width, this.GL.canvas.height);
    this.GL.clearColor(0.1,0.1,0.1,1.0);
    this.GL.clearDepth(1.0);
    this.GL.enable(this.GL.DEPTH_TEST);
    this.GL.depthFunc(this.GL.LEQUAL);
    this.GL.enable(this.GL.CULL_FACE);

    this.GL.clear(this.GL.COLOR_BUFFER_BIT | this.GL.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
    const nearCull = 0.1;
    const farCull = 100.0;
    this.projectionMatrix = glMatrix.mat4.create();
    this.modelViewMatrix = glMatrix.mat4.create();
    this.cameraMatrix = glMatrix.mat4.create();
    this.viewMatrix = glMatrix.mat4.create();
    this.viewProjectionMatrix = glMatrix.mat4.create();

    // CREATE PROJECTION MATRIX
    glMatrix.mat4.perspective(
      this.projectionMatrix,
      fieldOfView,
      aspectRatio,
      nearCull,
      farCull
    );

    // POSITION THE CAMERA MATRIX
    glMatrix.mat4.translate(
      this.cameraMatrix,
      this.cameraMatrix,
      this.cameraVals
    );
    glMatrix.mat4.rotateY(
      this.cameraMatrix,
      this.cameraMatrix,
      -this.cameraAngle
    );

    // CREATE THE VIEW MATRIX FROM THE CAMERA MATRIX
    glMatrix.mat4.invert(
      this.viewMatrix,
      this.cameraMatrix
    );

    // CREATE THE VIEW PROJECTION MATRIX FROM THE PROJECTION AND VIEW MATRICES
    glMatrix.mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );

    // POSITION THE MODEL VIEW MATRIX
    glMatrix.mat4.translate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      [0.0, 0.0, 0.0]
    );

    /// ROTATE CUBE
    glMatrix.mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.globalTime,
      [0,0,1] // rotation axis
    );
    glMatrix.mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.globalTime * 0.3,
      [0,1,0] // rotation axis
    );
    glMatrix.mat4.rotate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      this.globalTime * 0.7,
      [1,0,0] // rotation axis
    );

    glMatrix.mat4.multiply(
      this.matrix, 
      this.viewProjectionMatrix, 
      this.modelViewMatrix
    );

    // DRAW OBJECTS
    this.Cube.Draw();

    // HANDLE KEY INPUTS
    if (this.keysPressed['87'] || this.keysPressed['83']) {
      // W or S
      const direction = this.keysPressed['87'] ? 1 : -1;
      // this.cameraVals[2] -= deltaTime * this.moveSpeed * direction;
      this.cameraVals[0] -= this.cameraMatrix[ 8] * deltaTime * this.moveSpeed * direction;
      this.cameraVals[1] -= this.cameraMatrix[ 9] * deltaTime * this.moveSpeed * direction;
      this.cameraVals[2] -= this.cameraMatrix[10] * deltaTime * this.moveSpeed * direction;
    }

    if (this.keysPressed['65'] || this.keysPressed['68']) {
      // W or S
      const direction = this.keysPressed['68'] ? 1 : -1;
      // this.cameraVals[0] -= deltaTime * this.moveSpeed * direction;
      this.cameraAngle += deltaTime * this.turnSpeed * direction;
    }

    if (this.keysPressed['16'] || this.keysPressed['32']) {
      // W or S
      const direction = this.keysPressed['16'] ? 1 : -1;
      this.cameraVals[1] -= deltaTime * this.moveSpeed * direction;
      // this.cameraAngle += deltaTime * this.turnSpeed * direction;
    }
  }

  async LoadResources() {
    let vertSource = await loadNetworkResourceAsText('resources/shaders/vertex/simple.vert');     // VERTEX SHADER
    let fragSource = await loadNetworkResourceAsText('resources/shaders/fragment/simple.frag');   // FRAGMENT SHADER
    let oData = await loadNetworkResourceAsText('resources/models/sphere.obj');
    this.InitializeObject(vertSource, fragSource, oData);
  }
}