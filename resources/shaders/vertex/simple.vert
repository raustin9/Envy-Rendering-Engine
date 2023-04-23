attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

varying lowp vec4 vColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = aVertexColor;
}