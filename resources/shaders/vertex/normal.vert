precision highp float;

attribute vec3 aVertexPosition;
// attribute vec3 vert_tang;
// attribute vec3 vert_bitang;
attribute vec2 aVertexTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 u_light_position;

varying vec2 frag_uv;
varying vec3 ts_light_pos; // Tangent space values
varying vec3 ts_view_pos;  //
varying vec3 ts_frag_pos;  //

void main(void)
{
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    ts_frag_pos = vec3(uModelViewMatrix * vec4(aVertexPosition, 1.0));

    ts_light_pos = vec3(3, 2, 1);
 
    frag_uv = aVertexTexCoord;
}