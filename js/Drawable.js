class Drawable {
  shader = null;
  vertexBuffers = {};
  attributeLocations = null;
  uniformLocations = null;
  elementArrayBuffer = null;
  verticesCount = null;

    /**
     * uniform setup - this is a function that should be defined per drawable
     * If you are familiar with C++ and not JavaScript, treat this as a member variable
     * that is a function. 
     */
    UniformSetup = () => {
      if(!this.uniformSetupWarned) {
        console.warn('A drawable being drawn does not have a uniformSetup function.');
        this.uniformSetupWarned = true;
      }
    };

    constructor(
      GL,
      shader,
      bufferMap,
      elementBuffer = null,
      verticesCount = null
    ) {
      this.shader = shader;
      this.GL = GL;

      if (!elementBuffer && !verticesCount) {
        throw 'You must specify an element Index Buffer or vertices count!';
      }

      const attributeNames = Object.keys(bufferMap);
      const attributeLocations = Shader.GetAttributeLocations(attributeNames);

      for (const attributeName in bufferMap) {
        const location = attributeLocations[attributeName];
        this.vertexBuffers[location] = bufferMap[attributeName];
      }

      if (elementBuffer) {
        this.elementArrayBuffer = elementBuffer;
      } else {
        this.verticesCount = verticesCount;
      }
    }

    // DRAWS DRAWABLE TO SCREEN
    Draw() {
      if (this.elementArrayBuffer && !this.verticesCount) {
        this.elementArrayBuffer.BindAndEnable();
      }

      for (const bufferLocation in this.vertexBuffers) {
        this.vertexBuffers[bufferLocation].BindAndEnable(bufferLocation);
      }
    }
}