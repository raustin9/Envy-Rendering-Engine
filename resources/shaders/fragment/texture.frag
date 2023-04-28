#version 100

precision highp float;

varying highp vec2 vFragmentTextureCoord;
varying vec3 normalInterp;
varying vec3 vertPos;

uniform sampler2D sampler;

void main() {
  float shininess = 40.0;
  vec3 lightPos = vec3(-100.0, 10.0, 0.0);
  vec3 N = normalize(normalInterp);
  vec3 L = normalize(lightPos - vertPos);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if (lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-vertPos);
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, shininess);
  }

  vec4 texColor = texture2D(sampler, vFragmentTextureCoord);
  gl_FragColor = texColor +
                 lambertian * texColor +
                 specular * vec4(1.0, 1.0, 1.0, 1.0);
}