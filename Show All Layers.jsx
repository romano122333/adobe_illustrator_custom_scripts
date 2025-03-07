// Get the active document in Adobe Illustrator
var doc = app.activeDocument;

/**
 * Function to get all layers in the document, including sublayers
 * @param {Document} doc - The document to get layers from
 * @returns {Array} Array of all layers found
 */
function getAllLayers(doc) {
  var allLayers = []; // Initialize an array to hold all layers

  /**
   * Helper function to recursively explore layers
   * @param {LayerCollection} layerCollection - Collection of layers to explore
   */
  function exploreLayers(layerCollection) {
      for (var i = 0; i < layerCollection.length; i++) {
          var layer = layerCollection[i];
          allLayers.push(layer); // Add the layer to the list

          // If the layer contains sublayers, explore them as well
          if (layer.layers.length > 0) {
              exploreLayers(layer.layers);
          }
      }
  }

  // Start with the main layers of the document
  exploreLayers(doc.layers);

  return allLayers; // Return the array of all layers
}

// Get all layers in the active document
var layers = getAllLayers(doc);

// Loop through all layers and make them visible
for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    layer.visible = true;
}