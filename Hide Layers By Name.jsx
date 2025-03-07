/**
 * Script to hide layers by name in Adobe Illustrator
 * This script allows users to hide all layers with a specific name
 */

/**
 * Gets all layers in the document recursively, including sublayers
 * @param {Layer} parentLayer - The parent layer to get all layers from
 * @returns {Array} Array of all layers found
 */
function getAllLayers(parentLayer) {
    var allLayers = [];
    
    function exploreLayers(layerCollection) {
        for (var i = 0; i < layerCollection.length; i++) {
            var currentLayer = layerCollection[i];
            allLayers.push(currentLayer);

            // Recursively explore any sublayers
            if (currentLayer.layers && currentLayer.layers.length > 0) {
                exploreLayers(currentLayer.layers);
            }
        }
    }

    exploreLayers(parentLayer.layers);
    return allLayers;
}

// Get the layer name to hide from user
var layerNameToHide = prompt("Enter the name of layers you want to hide:");

// Get the root layer of active document
var rootLayer = app.activeDocument.layers[0];

// Get all layers in document
var allDocumentLayers = getAllLayers(rootLayer);

// Hide all layers matching the specified name
for (var i = 0; i < allDocumentLayers.length; i++) {
    var currentLayer = allDocumentLayers[i];
    if (currentLayer.name === layerNameToHide) {
        currentLayer.visible = false;
    }
}
