attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

varying lowp vec4 vColor;
varying vec4 vPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uMatrix;

void main() {
  gl_Position = aVertexPosition;
  vPosition = aVertexPosition;
  vColor = vec4(0.3, 0.68, 0.25, 1.0);
}