/**
 * Gets all layers in the document recursively, including sublayers
 * @param {Document} doc - The document to get layers from
 * @returns {Array} Array of all layers found
 */
function getAllLayers(doc) {
    var allLayers = [];
    
    // Helper function to recursively explore layers
    function exploreLayers(layerCollection) {
        for (var i = 0; i < layerCollection.length; i++) {
            var layer = layerCollection[i];
            allLayers.push(layer);

            // Recursively explore any sublayers
            if (layer.layers.length > 0) {
                exploreLayers(layer.layers);
            }
        }
    }

    exploreLayers(doc.layers);
    return allLayers;
}

/**
 * Main class to handle removing "copy" text from layer names
 */
var RemoveCopies = (function() {

    function RemoveCopies() {
        // Get max number to search for from user (e.g. "copy 1" up to "copy 20")
        this.maxNumber = parseInt(prompt("Up to what number would you like to search for?", "20"));
        
        if (!isNaN(this.maxNumber) && this.maxNumber > 0) {
            this.removeCopies();
        } else {
            alert("Please enter a valid number greater than 0.");
        }
    }

    /**
     * Main function to remove copy text from all layer names
     */
    RemoveCopies.prototype.removeCopies = function() {
        var doc = app.activeDocument;
        
        if (!doc) {
            alert("No document open.");
            return;
        }

        var allLayers = getAllLayers(doc);

        // Check for both English "copy" and French "copie" variations
        for (var i = 1; i <= this.maxNumber; i++) {
            var copyFrench = "- copie " + i.toString();
            var copyEnglish = "copy " + i.toString();
            
            // Special case for first copy which may not have a number
            if (i === 1) {
                copyFrench = "- copie";
                copyEnglish = "copy"; 
            }
            
            this.renameLayers(allLayers, copyFrench, copyEnglish);
        }
    };

    /**
     * Processes all layers to remove copy text
     * @param {Array} layers - Array of layers to process
     * @param {String} frenchText - French copy text to remove
     * @param {String} englishText - English copy text to remove
     */
    RemoveCopies.prototype.renameLayers = function(layers, frenchText, englishText) {
        for (var i = 0; i < layers.length; i++) {
            this.renameLayer(layers[i], frenchText, englishText);
        }
    };

    /**
     * Renames a single layer by removing copy text
     * @param {Layer} layer - Layer to rename
     * @param {String} frenchText - French copy text to remove
     * @param {String} englishText - English copy text to remove
     */
    RemoveCopies.prototype.renameLayer = function(layer, frenchText, englishText) {
        if (layer.typename !== "Layer") return;

        var originalName = layer.name;
        var newName = originalName;

        // Remove numbered copy text
        newName = newName.replace(new RegExp(frenchText + "$", "g"), "");
        newName = newName.replace(new RegExp(englishText + "$", "g"), "");

        // Remove unnumbered copy text
        newName = newName.replace(/- copie$/, "");
        newName = newName.replace(/copy$/, "");

        // Update layer name if changed
        if (newName !== originalName) {
            layer.name = newName;
        }
    };

    return RemoveCopies;
})();

// Run the script
new RemoveCopies();