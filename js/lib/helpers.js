function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

async function loadNetworkResourceAsText(resource){
  const response = await fetch(resource);
  const asText = await response.text();
  return asText;
}