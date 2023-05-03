// THIS IS THE BASE CLASS FOR THE ENGINE //
class RenderEngine {
  /* GLOBAL CONTEXT VARIABLES */
  window = null; // browser window
  canvas = null; // canvas element
  GL = null;     // webGL2 context

  Objects = {}; // List of objectst to be rendered

  // MATRICES
  projectionMatrix = glMatrix.mat4.create();
  modelViewMatrix = glMatrix.mat4.create();
  cameraMatrix = glMatrix.mat4.create();
  viewMatrix = glMatrix.mat4.create();
  viewProjectionMatrix = glMatrix.mat4.create();
  normalMatrix = glMatrix.mat4.create();
  matrix = glMatrix.mat4.create();
  worldViewProjection = glMatrix.mat4.create();

  lightPosition = [-6, 5, 2];

  then = 0;       // used for keeping time
  globalTime = 0; // total time passed

  cameraVals = [0,0,6];  // used to move the camera around via translation
  cameraAngle = 0;       // used to change the angle of the camera via rotation
  cameraElevation = 0;   // used to angle the camera up and down
  moveSpeed = 7;        // the speed that the camera can move around
  turnSpeed = 1;       // the speed that the camera can turn
  keysPressed = {};      // keeps track of whick keys have been pressed

  init = null;

  /**
   * 
   * @param {String} canvas_name name of the canvas that will be the webGL context
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.GL = this.canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    this.Main();
  }

  /**
   * 
   * @param {String} canvas_name name of the canvas to get WebGL2 context
   */
  async Main() {
    this.window = window;

    if (!this.GL) {
      console.log("ERROR: BROWSER DOES NOT SUPPORT WEBGL2");
      return;
    }

    this.GL.clearColor(0.3,0.3,0.3,1.0);
    this.GL.clear(this.GL.COLOR_BUFFER_BIT);

    // GET KEY INPUTS
    this.window.addEventListener('keydown', this.KeyDown.bind(this));
    this.window.addEventListener('keyup', this.KeyUp.bind(this));

    // CREATE PROJECTION MATRIX
    const fieldOfView = (45 * Math.PI) / 180;
    const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;
    const nearCull = 0.1;
    const farCull = 100000.0;
    this.projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
      this.projectionMatrix,
      fieldOfView,
      aspectRatio,
      nearCull,
      farCull
    );
    this.modelViewMatrix = glMatrix.mat4.create();
    this.viewProjectionMatrix = glMatrix.mat4.create();

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
   * This function loads a texture and creates a gl texture from it
   * @param {String} src source file to load texture from
   * @returns WebglContext texture2d
   */
  LoadTexture(src) {
    const texture = this.GL.createTexture();
    this.GL.bindTexture(this.GL.TEXTURE_2D, texture);
  
    const level = 0;
    const internalFormat = this.GL.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = this.GL.RGBA;
    const srcType = this.GL.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    this.GL.texImage2D(
      this.GL.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );
  
    const image = new Image();
    console.log(image);
    image.onload = () => {
      this.GL.bindTexture(this.GL.TEXTURE_2D, texture);
      this.GL.texImage2D(
        this.GL.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image
      );
  
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        this.GL.generateMipmap(this.GL.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
        this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
        this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR);
      }
    };
    image.src = src;

    this.GL.bindTexture(this.GL.TEXTURE_2D, null);
  
    return texture;
  }

  /**
   * This function creates an instance of an object from the values in the parameter, and then adds it to 
   * the list of objects to be rendered
   * @param {JSON.Object} sourceMap map of values that are used to create an object to be rendered
   */
  async CreateObject(sourceMap) {
    if (!sourceMap.name) {
      throw new Error("ENGINE: ERROR -- OBJECT DOES NOT HAVE NAME");
    }
    if (!sourceMap.vertexSource) {
      throw new Error("ENGINE: ERROR -- THIS OBJECT DOES NOT HAVE VERTEX SHADER");
    }
    if (!sourceMap.fragmentSource) {
      throw new Error("ENGINE: ERROR -- THIS OBJECT DOES NOT HAVE FRAGMENT SHADER");
    }
    if (!sourceMap.objectSource) {
      throw new Error("ENGINE: ERROR -- THIS OBJECT DOES NOT HAVE OBJECT DATA");
    }


    let objectName = sourceMap.name;
    let vertexSource = await loadNetworkResourceAsText(sourceMap.vertexSource);     // VERTEX SHADER
    let fragmentSource = await loadNetworkResourceAsText(sourceMap.fragmentSource);   // FRAGMENT SHADER
    let oData = await loadNetworkResourceAsText(sourceMap.objectSource);
    let texture = null;

    let shader = new Shader(this.GL, vertexSource, fragmentSource);

    let parsedData = new OBJData(oData);
    let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

    // CREATE OBJECT BUFFERS
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
      'aVertexNormal'    : vertexNormalBuffer,
      'aVertexTexCoord'  : vertexTexCoordBuffer
    }

    // ADD NEW OBJECT TO GLOBAL LIST
    let object = new DrawableObject(
      this.GL,
      shader,
      attributeBufferMap,
      null,
      rawData.vertices.length / 3,
    );

    // SET THE TYPE OF TEXTURE THE OBJECT SHOULD HAVE
    if (sourceMap.textureSource) {
      // object.texture = this.LoadTexture(sourceMap.textureSource);
      
      if (sourceMap.normalSource) {
        console.log("normal")
        // NORMAL MAP
        
        object.textureBuffer.push(this.LoadTexture(sourceMap.normalSource));
        object.textureBuffer.push(this.LoadTexture(sourceMap.textureSource));

        object.TextureSetup = () => {
          this.GL.activeTexture(this.GL.TEXTURE0);
          this.GL.bindTexture(this.GL.TEXTURE_2D, object.textureBuffer[0]);
        
          this.GL.activeTexture(this.GL.TEXTURE1);
          this.GL.bindTexture(this.GL.TEXTURE_2D, object.textureBuffer[1]);
        }
      } else if (sourceMap.environmentSource) {
        // IS AN ENVIRONMENT MAP
        if (sourceMap.environmentSource.length != 6) {
          throw new Error(`ENGINE: ERROR -- THIS OBJECT'S ENVIRONMENT MAP DOES NOT HAVE EXACTLY 6 IMAGES`);
        }

        return;
      } else {
        object.textureBuffer.push(this.LoadTexture(sourceMap.textureSource));
        object.TextureSetup = () => {
          this.GL.activeTexture(this.GL.TEXTURE0);
          this.GL.bindTexture(this.GL.TEXTURE_2D, object.textureBuffer[0]);
        }
      }

      // IS A NORMAL OBJECT WITH TEXTURE
      this.GL.pixelStorei(this.GL.UNPACK_FLIP_Y_WEBGL, true);
    } 

    object.uniformLocations = shader.GetUniformLocations([
      'uMatrix',
      'uNormalMatrix',
      'uModelViewMatrix',
      'sampler',
      'uWorldViewProjection',
      'uLightPosition',
      'tex_norm',
      'tex_diffuse'
    ]);

    object.UniformSetup = () => {
      // WORLD MATRIX
      this.GL.uniformMatrix4fv(
        object.uniformLocations.uMatrix,
        false,
        this.matrix
      );

      // NORMAL MATRIX
      this.GL.uniformMatrix4fv(
        object.uniformLocations.uNormalMatrix,
        false,
        this.Objects[objectName].normalMatrix
      );

      this.GL.uniformMatrix4fv(
        object.uniformLocations.uModelViewMatrix,
        false,
        this.Objects[objectName].modelViewMatrix
      );

      this.GL.uniformMatrix4fv(
        object.uniformLocations.uWorldViewProjection,
        false,
        this.worldViewProjection
      );

      this.GL.uniform3fv(
        object.uniformLocations.uLightPosition,
        this.lightPosition
      );

      // SAMPLER2D
      this.GL.uniform1i(
        object.uniformLocations.tex_diffuse,
        1
      );
      this.GL.uniform1i(
        object.uniformLocations.tex_norm,
        0
      );
    }

    this.Objects[objectName] = {
      drawableObject: object,
      modelMatrix: glMatrix.mat4.create(),
      texture: texture,
      modelViewMatrix: glMatrix.mat4.create(),
      normalMatrix: glMatrix.mat4.create(),
    }
  }

  /**
   * 
   * @param {String} vSrc source of the vertex shader to load
   * @param {String} fSrc source of the fragment shader to load
   * @param {String} oSrc source of the object file to load
   */
  async LoadResources(vSrc, fSrc, oSrc) {
    vertSource = await loadNetworkResourceAsText(vSrc);     // VERTEX SHADER
    fragSource = await loadNetworkResourceAsText(fSrc);   // FRAGMENT SHADER
    oData = await loadNetworkResourceAsText(oSrc);
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
    const farCull = 100000.0;
    this.projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
      this.projectionMatrix,
      fieldOfView,
      aspectRatio,
      nearCull,
      farCull
    );

    this.cameraMatrix = glMatrix.mat4.create();
    this.viewMatrix = glMatrix.mat4.create();

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
    glMatrix.mat4.rotateX(
      this.cameraMatrix,
      this.cameraMatrix,
      this.cameraElevation
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

    this.matrix = glMatrix.mat4.create();
    glMatrix.mat4.multiply(this.worldViewProjection, this.viewProjectionMatrix, this.matrix);

    // DRAW OBJECTS
    for (let object in this.Objects) {
      // PERFORM OBJECT ANIMATIONS
      this.Objects[object].modelMatrix = glMatrix.mat4.create();
      this.Objects[object].modelViewMatrix = glMatrix.mat4.create();
      this.Objects[object].normalMatrix = glMatrix.mat4.create();
      this.Objects[object].drawableObject.Animate();

      glMatrix.mat4.multiply(this.Objects[object].modelViewMatrix, this.matrix, this.Objects[object].modelMatrix);
      glMatrix.mat4.invert(this.Objects[object].normalMatrix, this.Objects[object].modelViewMatrix);
      glMatrix.mat4.transpose(this.Objects[object].normalMatrix, this.Objects[object].normalMatrix);
      

      // MULTIPLY OBJECT INTO THE VIEW PROJECTION AND PUT INTO THE WORLD
      glMatrix.mat4.multiply(
        this.worldViewProjection,
        this.viewProjectionMatrix,
        this.Objects[object].modelMatrix
      );

      // DRAW THE OBJECT
      this.Objects[object].drawableObject.Draw();

      glMatrix.mat4.invert(this.Objects[object].modelViewMatrix, this.Objects[object].modelViewMatrix,);
      glMatrix.mat4.transpose(this.Objects[object].normalMatrix, this.Objects[object].modelViewMatrix);
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
      // SHIFT OR SPACE
      const direction = this.keysPressed['16'] ? 1 : -1;
      this.cameraVals[1] -= deltaTime * this.moveSpeed * direction;
    }

    if (this.keysPressed['38'] || this.keysPressed['40']) {
      // ARROW_UP OR ARROW_DOWN
      const direction = this.keysPressed['38'] ? 1 : -1;
      this.cameraElevation += deltaTime * this.turnSpeed * direction;
    }
  }

  /**
   * 
   * @param {String} name name of the object to transform
   * @param {Array.FLoat} vector the vector to translate the object by
   */
  Translate(name, vector) {
    glMatrix.mat4.translate(
      this.Objects[name].modelMatrix,
      this.Objects[name].modelMatrix,
      vector
    );
  }

  /**
   * 
   * @param {String} name name of the object to transform
   * @param {Array.Float} axis axis to rotate the object around
   * @param {Float} angle the angle IN RADIANS by which to rotate the object
   */
  Rotate(name, axis, angle) {
    glMatrix.mat4.rotate(
      this.Objects[name].modelMatrix,
      this.Objects[name].modelMatrix,
      angle,
      axis
    );
  }

  /**
   * 
   * @param {String} name name of the object to transform
   * @param {Array.Float} axis axis to spin the object around
   * @param {Number} speed the speed to spin the object at
   */
  Spin(name, axis, speed) {
    glMatrix.mat4.rotate(
      this.Objects[name].modelMatrix,
      this.Objects[name].modelMatrix,
      this.globalTime * speed,
      axis
    );
  }

  /**
   * 
   * @param {String} name name of the object to transform
   * @param {Array.Float} axis axis to revolve object around
   * @param {Number} speed speed to revolve at
   */
  Revolve(name, axis, speed) {
    glMatrix.mat4.translate(
      this.Objects[name].modelMatrix,
      this.Objects[name].modelMatrix,
      [
        Math.sin(this.globalTime * speed) * axis[0],
        Math.sin(this.globalTime * speed) * axis[1],
        Math.sin(this.globalTime * speed) * axis[2],
      ]
    );
  }

  /**
   * 
   * @param {String} name name of the object to transform
   * @param {Array.Flaot} vector vector to scale the object by
   */
  Scale(name, vector) {
    if (vector.length != 3) {
      throw new Error('SCALE: ERROR -- SCALING VECTOR DOES NOT HAVE 3 ELEMENTS');
    }
    glMatrix.mat4.scale(
      this.Objects[name].modelMatrix,
      this.Objects[name].modelMatrix,
      vector
    );
  }

  /**
   * This function will be called every time the screen is rerendered
   * It should contain transformations that you want your object to have done
   * @param {String} name name of the object to set the animation for
   * @param {Function} animation the function that contains all of the animations/transformations
   */
  SetObjectAnimate(name, animation) {
    this.Objects[name].drawableObject.Animate = animation;
  }

  /**
   * This function can set the position of the global light source
   * @param {Array.Float} pos the new position that the light source should be
   */
  SetLightPosition(pos) {
    this.lightPosition = pos;
  }
}