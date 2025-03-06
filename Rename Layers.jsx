var LayerRenamer, layerRenamer;

LayerRenamer = (function() {
  function LayerRenamer() {
    if (app.activeDocument.selection.length > 0) {
      this.replacements = [prompt("What would you like to replace?", "Eg: source"), prompt("What would you like to replace it with?", "Eg: replacement")];
      this.renameLayers(app.activeDocument.selection);
    } else {
      alert("Select the layers you would like to be renamed.");
    }
  }

  LayerRenamer.prototype.renameLayers = function(selection) {
    for (var i = 0; i < selection.length; i++) {
      var currentItem = selection[i];
      this.renameItemRecursive(currentItem);
    }
  };

  LayerRenamer.prototype.renameItemRecursive = function(item) {
    var currentItem = item;
    while (currentItem) {
      if (currentItem.typename === "Layer") {
        var originalName = currentItem.name;
        var newName = originalName.replace(this.replacements[0], this.replacements[1]);
        currentItem.name = newName;
      }
      currentItem = currentItem.parent;
    }
  };

  return LayerRenamer;

})();

layerRenamer = new LayerRenamer();
