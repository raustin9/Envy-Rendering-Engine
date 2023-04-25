// THIS IS THE BASE CLASS FOR THE ENGINE //
class RenderEngine {
  /* GLOBAL CONTEXT VARIABLES */
  window = null; // browser window
  canvas = null; // canvas element
  GL = null;     // webGL2 context

  Objects = []; // List of objectst to be rendered

  // MATRICES
  projectionMatrix = glMatrix.mat4.create();
  modelViewMatrix = glMatrix.mat4.create();
  cameraMatrix = glMatrix.mat4.create();
  viewMatrix = glMatrix.mat4.create();
  viewProjectionMatrix = glMatrix.mat4.create();
  matrix = glMatrix.mat4.create();

  then = 0;       // used for keeping time
  globalTime = 0; // total time passed

  cameraVals = [0,0,6];  // used to move the camera around via translation
  cameraAngle = 0;       // used to change the angle of the camera via rotation
  moveSpeed = 10;        // the speed that the camera can move around
  turnSpeed = 1.5;       // the speed that the camera can turn
  keysPressed = {};      // keeps track of whick keys have been pressed

  init = null;

  /**
   * 
   * @param {String} canvas_name name of the canvas that will be the webGL context
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.GL = this.canvas.getContext('webgl2');
    this.Main();
  }

  /**
   * 
   * @param {String} canvas_name name of the canvas to get WebGL2 context
   */
  async Main() {
    this.window = window;
    // this.canvas = document.getElementById(canvas_name);
    // this.GL = this.canvas.getContext('webgl2');

    if (!this.GL) {
      console.log("ERROR: BROWSER DOES NOT SUPPORT WEBGL2");
      return;
    }

    this.GL.clearColor(0.3,0.3,0.3,1.0);
    this.GL.clear(this.GL.COLOR_BUFFER_BIT);

    // GET THE RESOURCES: SHADERS
    await this.LoadResources();
    // console.log(await this.LoadResources());
    // this.InitializeObject();

    // GET KEY INPUTS
    this.window.addEventListener('keydown', this.KeyDown.bind(this));
    this.window.addEventListener('keyup', this.KeyUp.bind(this));

    // // RENDER SCENE
    requestAnimationFrame(this.Render.bind(this));
  }

  /// LISTENERS FOR KEY INPUTS
  KeyDown(event) {
    this.keysPressed[event.keyCode] = true;
    event.preventDefault();
  }

  KeyUp(event) {
    this.keysPressed[event.keyCode] = false;
    event.preventDefault();
  }

  /**
   * Used to initialize an instance of an object to be rendered and appends it to global list
   * @param {String} vertSource source code of vertex shader for the object
   * @param {String} fragSource source code of fragment shader for object
   * @param {String} objectData source file string for .obj file for object
   */
  InitializeObject(vertSource, fragSource, objectData) {
    let shader = new Shader(
      this.GL, 
      vertSource, 
      fragSource
    );
    
    let parsedData = new OBJData(objectData);
    let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

    let vertexPositionBuffer = new VertexData(
      this.GL,
      rawData.vertices,
      this.GL.FLOAT,
      3
    );
    let vertexNormalBuffer = new VertexData(
      this.GL,
      rawData.normals,
      this.GL.FLOAT,
      3
    );
    let vertexTexCoordBuffer = new VertexData (
      this.GL,
      rawData.uvs,
      this.GL.FLOAT,
      2
    );
    
    let vertexBarycentricBuffer = new VertexData (
      this.GL,
      rawData.barycentricCoords,
      this.GL.FLOAT,
      3
    );

    let attributeBufferMap = {
      'aVertexPosition': vertexPositionBuffer,
      'aBarycentricCoord': vertexBarycentricBuffer,
      // 'aVertexNormal'    : vertexNormalBuffer,
      // 'aVertexTexCoord'  : vertexTexCoordBuffer
    }

    let obj = new DrawableObject(
      this.GL,
      shader,
      attributeBufferMap,
      null,
      rawData.vertices.length / 3
    );

    obj.uniformLocations = shader.GetUniformLocations([
      'uMatrix'
    ]);
    
    obj.UniformSetup = () => {
      this.GL.uniformMatrix4fv(
        obj.uniformLocations.uMatrix,
        false,
        this.matrix
      );
    }

    // Append object to list of objects to be rendered
    this.Objects.push(obj);
  }

  /**
   * Used for animation and keeps rerendeing the scene
   * @param {Number} now current timestamp
   */
  Render(now) {
    now *= 0.001;
    let deltaTime = now - this.then;
    this.then = now;
    this.RenderScene(deltaTime);
    requestAnimationFrame(this.Render.bind(this));
  }

  /**
   * 
   * @param {Number} deltaTime the time differnece between last render and this one
   */
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
    // glMatrix.mat4.rotate(
    //   this.modelViewMatrix,
    //   this.modelViewMatrix,
    //   this.globalTime,
    //   [0,0,1] // rotation axis
    // );
    // glMatrix.mat4.rotate(
    //   this.modelViewMatrix,
    //   this.modelViewMatrix,
    //   this.globalTime * 0.6,
    //   [0,1,0] // rotation axis
    // );
    // glMatrix.mat4.rotate(
    //   this.modelViewMatrix,
    //   this.modelViewMatrix,
    //   this.globalTime * 0.7,
    //   [1,0,0] // rotation axis
    // );

    glMatrix.mat4.multiply(
      this.matrix, 
      this.viewProjectionMatrix, 
      this.modelViewMatrix
    );

    // DRAW OBJECTS
    for (let i = 0; i < this.Objects.length; i++) {
      this.Objects[i].Draw();
    }

    // HANDLE KEY INPUTS
    if (this.keysPressed['87'] || this.keysPressed['83']) {
      // W or S
      const direction = this.keysPressed['87'] ? 1 : -1;
      this.cameraVals[0] -= this.cameraMatrix[ 8] * deltaTime * this.moveSpeed * direction;
      this.cameraVals[1] -= this.cameraMatrix[ 9] * deltaTime * this.moveSpeed * direction;
      this.cameraVals[2] -= this.cameraMatrix[10] * deltaTime * this.moveSpeed * direction;
    }

    if (this.keysPressed['65'] || this.keysPressed['68']) {
      // W or S
      const direction = this.keysPressed['68'] ? 1 : -1;
      this.cameraAngle += deltaTime * this.turnSpeed * direction;
    }

    if (this.keysPressed['16'] || this.keysPressed['32']) {
      // W or S
      const direction = this.keysPressed['16'] ? 1 : -1;
      this.cameraVals[1] -= deltaTime * this.moveSpeed * direction;
    }
  }

  AddObject(object) {
    this.Objects.push(object);
  }

  /**
   * Used to load the resources for objects
   */
  async LoadResources() {
    let vertSource = await loadNetworkResourceAsText('resources/shaders/vertex/bary300.vert');     // VERTEX SHADER
    let fragSource = await loadNetworkResourceAsText('resources/shaders/fragment/bary300.frag');   // FRAGMENT SHADER
    let oData = await loadNetworkResourceAsText('resources/models/DROPSHIP.obj');
    // this.InitializeObject(vertSource, fragSource, oData);
  }
}