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
varying vec3 vLighting;
varying vec4 transformedNormal;

uniform mat4 uMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uWorldViewProjection;
uniform mat4 uWorldInverseTranspose;
uniform vec3 uLightPosition;


void main() {
  vec4 vertPos4 = uWorldViewProjection * aVertexPosition;
  vertPos = vec3(vertPos4) / vertPos4.w;

  transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

  gl_Position = uWorldViewProjection * aVertexPosition;

  vec3 temp = aBarycentricCoord * vec3(aVertexColor);
  vFragmentTextureCoord = aVertexTexCoord;
}