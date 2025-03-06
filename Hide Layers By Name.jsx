function getAllLayers(doc) {
    var allLayers = [];
    function exploreLayers(layerCollection) {
        for (var i = 0; i < layerCollection.length; i++) {
            var layer = layerCollection[i];
            allLayers.push(layer); // Ajouter le calque à la liste

            // Si le calque contient des sous-calques, les explorer aussi
            if (layer.layers.length > 0) {
                exploreLayers(layer.layers);
            }
        }
    }

    // Commence avec les calques principaux du document
    exploreLayers(doc.layers);

    return allLayers;
}

var nom = prompt("Quels noms de claque voulez-vous rendre invisible ?");

var doc = app.activeDocument.layers[0];

var docLayers = getAllLayers(doc);

for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name == nom) {
        docLayers[i].visible = false;
    }
}
