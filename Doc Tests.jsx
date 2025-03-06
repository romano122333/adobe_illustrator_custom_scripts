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

var doc = app.activeDocument.layers[0];
var aCacher = ["L", "M", "W-Oo", "S", "D", "Right Blink", "Left Blink", "Ennuyé", "Right Low Lids", "Right Low Lid", "Left Low Lids",
    "Left Low Lid", "Smile", "Surprised", "Uh", "Oh", "F", "R", "Ee", "Aa", "1", "Bouches Normales", "A", "O", "L 1", "L 2", "Normales"
]

var docLayers = getAllLayers(doc);

for (var i = 0; i < docLayers.length; i++) {
    var layer = docLayers[i];
    for (var j = 0; j < aCacher.length; j++) {
        if (layer.name == aCacher[j]) {
            layer.visible = false;
        }
    }
}

function resizeLayer(layer, s) { // s = newScale
    var items = getAllPaths(layer);
    var itemsPlugin = getAllPluginItems(layer);
    var bounds = getLayerBounds(layer);
    
    var centerX = (bounds[0] + bounds[2]) / 2;
    var centerY = (bounds[1] + bounds[3]) / 2;

    if (items.length > 0) {
        for (var m = 0; m < items.length; m++) {
            if (items[m].typename === "PathItem") {
                var deltaX = items[m].position[0] - centerX;
                var deltaY = items[m].position[1] - centerY;
                items[m].resize(s, s);
                items[m].position = [
                    centerX + deltaX * s / 100,
                    centerY + deltaY * s / 100
                ];
            }
        }
    }

    if (itemsPlugin.length > 0) {
        for (var m = 0; m < itemsPlugin.length; m++) {
            var deltaX = itemsPlugin[m].position[0] - centerX;
            var deltaY = itemsPlugin[m].position[1] - centerY;
            itemsPlugin[m].resize(s, s);
            itemsPlugin[m].position = [
                centerX + deltaX * s / 100,
                centerY + deltaY * s / 100
            ];
        }
    }
}

function resizeLayerTop(layer, s) { // s = newScale
    var items = getAllPaths(layer);
    var itemsPlugin = getAllPluginItems(layer);
    var bounds = getLayerBounds(layer); // Récupère les limites du layer

    // Calcul du point de référence pour le redimensionnement
    var refX = (bounds[0] + bounds[2]) / 2; // (xMin + xMax) / 2
    var refY = bounds[1]; // yMax

    if (items.length > 0) {
        for (var m = 0; m < items.length; m++) {
            if (items[m].typename === "PathItem") {
                // Calcul de la position avant redimensionnement
                var deltaX = items[m].position[0] - refX;
                var deltaY = items[m].position[1] - refY;

                // Redimensionnement
                items[m].resize(s, s);

                // Ajustement de la position après redimensionnement
                items[m].position = [
                    refX + deltaX * s / 100,
                    refY + deltaY * s / 100
                ];
            }
        }
    }

    if (itemsPlugin.length > 0) {
        for (var m = 0; m < itemsPlugin.length; m++) {
            // Calcul de la position avant redimensionnement
            var deltaX = itemsPlugin[m].position[0] - refX;
            var deltaY = itemsPlugin[m].position[1] - refY;

            // Redimensionnement
            itemsPlugin[m].resize(s, s);

            // Ajustement de la position après redimensionnement
            itemsPlugin[m].position = [
                refX + deltaX * s / 100,
                refY + deltaY * s / 100
            ];
        }
    }
}

// Backup :
function renameLayersOld(layer, replacements) {
    if (layer.typename === "Layer") {
        var layers = getAllLayers(layer);
        for (var t = 0; t < layers.length; t++) {
            var originalName = layer.name;
            var newName = originalName.replace(new RegExp(replacements[0], "gi"), replacements[1]);
            layer.name = newName;
        }
    }
}

function renameLayers(layer, replacements) {
    // Vérifie que l'élément est bien un calque
    if (layer.typename === "Layer") {
        var originalName = layer.name;
        // Remplace la partie du nom en fonction des remplacements donnés (insensible à la casse)
        var newName = originalName.replace(replacements[0], replacements[1]);
        layer.name = newName;
    }

    // Si l'élément a un parent, continue à remonter dans la hiérarchie
    if (layer.parent) {
        renameLayers(layer.parent, replacements);
    }
}

function layersPaupieres() {
    var doc = app.activeDocument;

    var base = doc.layers.add();
    base.name = "Right Lid";

    dico = ["Ennuyé", "Normal", "1"];

    for (var i = 0; i < dico.length; i++) {
        var layerr = base.layers.add();
        layerr.name = dico[i];
        if (dico[i] == "Ennuyé") {
            layerrr = layerr.layers.add();
            layerrr.name = "2";
            layerrr = layerr.layers.add();
            layerrr.name = "1";
        }
    }
    var base = doc.layers.add();
    base.name = "Left Lid";

    dico = ["Ennuyé", "Normal", "1"];

    for (var i = 0; i < dico.length; i++) {
        var layerr = base.layers.add();
        layerr.name = dico[i];
        if (dico[i] == "Ennuyé") {
            layerrr = layerr.layers.add();
            layerrr.name = "2";
            layerrr = layerr.layers.add();
            layerrr.name = "1";
        }
    }
}

function getAllPaths(layer) {
    var allPaths = [];

    // Fonction pour explorer les sous-calques et les groupes
    function exploreLayer(item) {
        // Vérifie si c'est un PathItem et l'ajoute à la liste
        if (item.typename === "PathItem") {
            allPaths.push(item);
        }

        // Si c'est un groupe, on explore ses éléments
        if (item.typename === "GroupItem") {
            for (var j = 0; j < item.pageItems.length; j++) {
                exploreLayer(item.pageItems[j]); // Explore les éléments du groupe
            }
        }

        // Si c'est un calque, on explore ses éléments et sous-calques
        if (item.typename === "Layer") {
            // Parcourir les éléments du calque actuel
            for (var i = 0; i < item.pageItems.length; i++) {
                exploreLayer(item.pageItems[i]); // Explore les items du calque
            }

            // Parcourir les sous-calques du calque
            for (var k = 0; k < item.layers.length; k++) {
                exploreLayer(item.layers[k]); // Explore les sous-calques
            }
        }
    }

    // Commence l'exploration à partir du calque donné
    exploreLayer(layer);

    return allPaths; // Retourne tous les PathItems trouvés
}

function getAllPluginItems(layer) { // Nouvelle fonction
    var allPages = [];

    // Fonction pour explorer les sous-calques et les groupes
    function exploreLayer(item) {
        // Vérifie si c'est un PuglinItem et l'ajoute à la liste
        if (item.typename === "PluginItem") {
            allPages.push(item);
        }

        // Si c'est un groupe, on explore ses éléments
        if (item.typename === "GroupItem") {
            for (var j = 0; j < item.pageItems.length; j++) {
                exploreLayer(item.pageItems[j]); // Explore les éléments du groupe
            }
        }

        // Si c'est un calque, on explore ses éléments et sous-calques
        if (item.typename === "Layer") {
            // Parcourir les éléments du calque actuel
            for (var i = 0; i < item.pageItems.length; i++) {
                exploreLayer(item.pageItems[i]); // Explore les items du calque
            }

            // Parcourir les sous-calques du calque
            for (var k = 0; k < item.layers.length; k++) {
                exploreLayer(item.layers[k]); // Explore les sous-calques
            }
        }
        if (item.typename === "PageItems") {
            // Parcourir les éléments du calque actuel
            for (var i = 0; i < item.length; i++) {
                exploreLayer(item.pageItems[i]); // Explore les items du calque
            }
        }

    }

    // Commence l'exploration à partir du calque donné
    exploreLayer(layer);

    return allPages; // Retourne tous les PathItems trouvés

}

function getLayerBounds(layer) {
    var objects = getAllPaths(layer);
    var pluginObjects = getAllPluginItems(layer);
    var bounds = [Infinity, -Infinity, -Infinity, Infinity]; // [xMin, yMax, xMax, yMin]
    for (var i = 0; i < objects.length; i++) {
        var itemBounds = objects[i].visibleBounds; // [xMin, yMax, xMax, yMin]
        bounds[0] = Math.min(bounds[0], itemBounds[0]); // xMin
        bounds[1] = Math.max(bounds[1], itemBounds[1]); // yMax
        bounds[2] = Math.max(bounds[2], itemBounds[2]); // xMax
        bounds[3] = Math.min(bounds[3], itemBounds[3]); // yMin
    }
    for (var i = 0; i < pluginObjects.length; i++) {
        var pluginBounds = pluginObjects[i].geometricBounds; // [xMin, yMax, xMax, yMin]
        bounds[0] = Math.min(bounds[0], pluginBounds[0]); // xMin
        bounds[1] = Math.max(bounds[1], pluginBounds[1]); // yMax
        bounds[2] = Math.max(bounds[2], pluginBounds[2]); // xMax
        bounds[3] = Math.min(bounds[3], pluginBounds[3]); // yMin
    }
    return bounds;
}
