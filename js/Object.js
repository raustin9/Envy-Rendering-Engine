class DrawableObject {
  GL = null;
  shader = null;
  vertexBuffers = {};
  attributeLocations = null;
  uniformLocations = null;
  elementArrayBuffer = null;
  verticesCount = null;

  vertexShader = null;
  fragmentShader = null;
  objectData = null;
  index = null;

  /**
   * uniform setup - this is a function that should be defined per drawable
   * If you are familiar with C++ and not JavaScript, treat this as a member variable
   * that is a function. 
   */
  UniformSetup = (index) => {
    if(!this.uniformSetupWarned) {
      console.warn('A drawable being drawn does not have a uniformSetup function.');
      this.uniformSetupWarned = true;
    }
  };

  constructor(
    GL,
    shader,
    attributeBuffer,
    elementBuffer = null,
    verticesCount = null,
    shaderSourceMap
  ) {
    this.shader = shader;
    this.GL = GL;
    
    if (!elementBuffer && !verticesCount) {
      throw 'You must specify an element Index Buffer or vertices count!';
    }

    const attributeNames = Object.keys(attributeBuffer);
    const attributeLocations = shader.GetAttributeLocations(attributeNames);
    
    for (let attributeName in attributeBuffer) {
      const location = attributeLocations[attributeName];
      
      this.vertexBuffers[location] = attributeBuffer[attributeName];
    }

    if (elementBuffer) {
      this.elementArrayBuffer = elementBuffer;
    } else {
      this.verticesCount = verticesCount;
    }
  }

  async LoadModelData(modelSource) {
    let oData = await loadNetworkResourceAsText(modelSource);
  }

  // DRAWS DRAWABLE TO SCREEN
  Draw() {
    if (this.elementArrayBuffer && !this.verticesCount) {
      this.elementArrayBuffer.BindAndEnable();
    }

    for (let bufferLocation in this.vertexBuffers) {
      this.vertexBuffers[bufferLocation].BindAndEnable(bufferLocation);
    }

    this.GL.useProgram(this.shader.shaderProgram);

    this.UniformSetup(this.index);

    if (this.verticesCount) {
      this.GL.drawArrays(this.GL.TRIANGLES, 0, this.verticesCount);
      return;
    }

    const offset = 0;
    this.GL.drawElements(
      this.GL.TRIANGLES,
      this.elementArrayBuffer.count,
      this.elementArrayBuffer.type,
      offset
    );
  }
}