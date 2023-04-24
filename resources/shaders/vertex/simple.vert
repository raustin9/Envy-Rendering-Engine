attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

varying lowp vec4 vColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uMatrix;

void main() {
  gl_Position = uMatrix * aVertexPosition;
  vColor = aVertexColor;
}