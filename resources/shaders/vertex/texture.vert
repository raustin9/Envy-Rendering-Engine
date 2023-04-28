#version 100

precision highp float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aVertexTexCoord;
attribute vec3 aBarycentricCoord;

varying highp vec2 vFragmentTextureCoord;
varying vec3 vertPos;
varying vec3 normalInterp;

uniform mat4 uMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  vec4 vertPos4 = uModelViewMatrix * aVertexPosition;
  vertPos = vec3(vertPos4) / vertPos4.w;
  normalInterp = vec3(uNormalMatrix * vec4(aVertexNormal, 0.0));

  gl_Position = uMatrix * aVertexPosition;

  vec3 temp = aBarycentricCoord * vec3(aVertexColor);
  vFragmentTextureCoord = aVertexTexCoord;
}