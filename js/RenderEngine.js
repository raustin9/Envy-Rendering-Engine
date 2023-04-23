// THIS IS THE BASE CLASS FOR THE ENGINE //
class RenderEngine {
  /* GLOBAL CONTEXT VARIABLES */
  canvas = null;
  GL = null; 
  program = null;
  shaderBuffer = [];
  shaderProgram = null;
  programInfo = {};
  buffers = null;

  then = 0;
  cubeRotation = 0;

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
    this.canvas = document.getElementById(canvas_name);
    this.GL = this.canvas.getContext('webgl2');

    if (!this.GL) {
      console.log("ERROR: BROWSER DOES NOT SUPPORT WEBGL2");
      return;
    }

    this.GL.clearColor(0.3,0.3,0.3,1.0);
    this.GL.clear(this.GL.COLOR_BUFFER_BIT);

    await this.LoadResources();

    this.SetProgramInfo();

    this.buffers = this.InitBuffers();

    requestAnimationFrame(this.Render.bind(this));
  }

  Render(now) {
    now *= 0.001;
    let deltaTime = now - this.then;
    this.then = now;
    this.cubeRotation += deltaTime;
    this.RenderScene(this.cubeRotation);
    requestAnimationFrame(this.Render.bind(this));
  }

  SetProgramInfo() {
    this.programInfo = {
      program: this.shaderProgram,
      attributeLocations: {
        vertexPosition: this.GL.getAttribLocation(this.shaderProgram, "aVertexPosition"),
        vertexColor: this.GL.getAttribLocation(this.shaderProgram, "aVertexColor"),
      },
      uniformLocations: {
        projectionMatrix: this.GL.getUniformLocation(this.shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: this.GL.getUniformLocation(this.shaderProgram, "uModelViewMatrix"),
        uMatrix: this.GL.getUniformLocation(this.shaderProgram, "uMatrix"),
      },
    };
  }

  InitBuffers() {
    const positionBuffer = this.InitPositionBuffer();
    const colorBuffer = this.InitColorBuffer();
    const indexBuffer = this.InitIndexBuffer();

    return{
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }

  InitIndexBuffer() {
    const indexBuffer = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, indexBuffer);


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

    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.GL.STATIC_DRAW);

    return indexBuffer;
  }

  InitColorBuffer() {
    const colorBuffer = this.GL.createBuffer();
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

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, colorBuffer);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(colors), this.GL.STATIC_DRAW);

    return colorBuffer;
  }

  InitPositionBuffer() {
    const positionBuffer = this.GL.createBuffer();

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, positionBuffer);

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

    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(positions), this.GL.STATIC_DRAW);

    return positionBuffer;
  }

  RenderScene(cubeRotation) {
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
    const projectionMatrix = glMatrix.mat4.create();
    const modelViewMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(
      projectionMatrix,
      fieldOfView,
      aspectRatio,
      nearCull,
      farCull
    );

    glMatrix.mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -6.0]
    );

    /// ROTATE CUBE
    glMatrix.mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      cubeRotation,
      [0,0,1] // rotation axis
    );
    glMatrix.mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      cubeRotation * .3,
      [0,1,0] // rotation axis
    );
    glMatrix.mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      cubeRotation * 0.7,
      [1,0,0] // rotation axis
    );

    this.SetPositionAttribute(this.programInfo);
    this.SetColorAttribute();

    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    this.GL.useProgram(this.programInfo.program);

    let matrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(matrix, projectionMatrix, modelViewMatrix);

    this.GL.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    this.GL.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    this.GL.uniformMatrix4fv(
      this.programInfo.uniformLocations.uMatrix,
      false,
      matrix
    );

    {
      const vertexCount = 36;
      const type = this.GL.UNSIGNED_SHORT;
      const offset = 0;
      this.GL.drawElements(this.GL.TRIANGLES, vertexCount, type, offset);
    }    
  }

  SetPositionAttribute(programInfo) {
    const numComponents = 3;
    const type = this.GL.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.buffers.position);
    this.GL.vertexAttribPointer(
      programInfo.attributeLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );

    this.GL.enableVertexAttribArray(programInfo.attributeLocations.vertexPosition);
  }
  
  SetColorAttribute() {
    const numComponents = 4;
    const type = this.GL.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.buffers.color);
    this.GL.vertexAttribPointer(
      this.programInfo.attributeLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );

    this.GL.enableVertexAttribArray(this.programInfo.attributeLocations.vertexColor);
  }

  async LoadResources() {
    this.shaderBuffer[0] = await loadNetworkResourceAsText('resources/shaders/vertex/simple.vert');   // VERTEX SHADER
    this.shaderBuffer[1] = await loadNetworkResourceAsText('resources/shaders/fragment/simple.frag'); // FRAGMENT SHADER
    this.shaderProgram = new Shader(this.GL, this.shaderBuffer[0], this.shaderBuffer[1]).shaderProgram;
    console.log(this.shaderProgram);
  }
}

class Shader {
  shaderProgram = null;

  constructor(GL, vsrc, fsrc) {
    const vertexShader   = this.LoadShader(GL, GL.VERTEX_SHADER, vsrc);
    const fragmentShader = this.LoadShader(GL, GL.FRAGMENT_SHADER, fsrc);

    this.shaderProgram = GL.createProgram();
    GL.attachShader(this.shaderProgram, vertexShader);
    GL.attachShader(this.shaderProgram, fragmentShader);
    GL.linkProgram(this.shaderProgram);

    if (!GL.getProgramParameter(this.shaderProgram, GL.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${GL.getProgramInfoLog(
          this.shaderProgram
        )}`
      );
      return null;
    }
  }

  LoadShader(GL, type, src) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert(`
        ERROR IN SHADER: ${GL.getShaderInfoLog(shader)}
      `);
      GL.deleteShader(shader);
      return null;
    }

    return shader;
  }
}