// Define a class to handle renaming of layers
var LayerRenamer = (function() {

  // Constructor function for LayerRenamer
  function LayerRenamer() {
    // Check if there are any selected items in the active document
    if (app.activeDocument.selection.length > 0) {
      // Prompt the user for the text to replace and the replacement text
      this.replacements = [
        prompt("Enter the text you want to replace:", "Eg: source"),
        prompt("Enter the replacement text:", "Eg: replacement")
      ];
      // Start renaming the selected layers
      this.renameSelectedLayers(app.activeDocument.selection);
    } else {
      // Alert the user if no layers are selected
      alert("Please select the layers you want to rename.");
    }
  }

  // Method to rename all layers in the given selection
  LayerRenamer.prototype.renameSelectedLayers = function(selection) {
    for (var i = 0; i < selection.length; i++) {
      var currentItem = selection[i];
      this.renameLayerAndParents(currentItem);
    }
  };

  // Method to rename a layer and its parent layers recursively
  LayerRenamer.prototype.renameLayerAndParents = function(item) {
    var currentItem = item;
    while (currentItem) {
      // Check if the current item is a layer
      if (currentItem.typename === "Layer") {
        var originalName = currentItem.name;
        // Replace the specified text in the layer's name
        var newName = originalName.replace(this.replacements[0], this.replacements[1]);
        currentItem.name = newName;
      }
      // Move to the parent item
      currentItem = currentItem.parent;
    }
  };

  return LayerRenamer;

})();

// Create an instance of LayerRenamer to execute the renaming process
var layerRenamer = new LayerRenamer();
