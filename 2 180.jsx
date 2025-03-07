/**
 * Character Animation Script for Adobe Illustrator
 * Creates a sequence of character rotations from front view to profile view
 * Handles both head and body animations separately
 */

function performTranslation() {
    var doc = app.activeDocument.layers[0];

    // === UTILITY FUNCTIONS ===
    
    /**
     * Calculates the bounding box of a layer including all its paths and plugin items
     * Returns [xMin, yMax, xMax, yMin]
     */

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

    /**
     * Resizes a layer from its top anchor point
     * @param {Layer} layer - Layer to resize
     * @param {Number} s - Scale factor in percentage
     */

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

    /**
     * Recursively gets all layers in the document including nested ones
     */

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



    function getLayerPosition(layer) {
        var bounds = getLayerBounds(layer);
        var xMid = (bounds[0] + bounds[2]) / 2; // Milieu en x
        var yMid = (bounds[1] + bounds[3]) / 2; // Milieu en y
        return [xMid, yMid]; // Retourne la position centrale du calque
    }

    /**
     * Gets a layer by its name
     * @param {Document} doc - The document object
     * @param {String} layerName - The name of the layer to find
     * @returns {Layer} The layer object if found, otherwise null
     */

    function getLayerByName(doc, layerName) {
        var layers = getAllLayers(doc);
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].name === layerName) {
                return layers[i]; // Retourne le calque trouvé
            }
        }
        return null; // Si aucun calque ne correspond au nom
    }

    /**
     * Duplicates a layer and its sublayers
     * @param {Layer} originalLayer - The layer to duplicate
     * @param {String} newName - The name of the new layer
     * @returns {Layer} The newly created layer
    */    
    function duplicateLayer(originalLayer, newName) {
        // Déterminer l'emplacement du layer à dupliquer
        var emplacement = originalLayer.parent;

        // Créer un nouveau calque pour accueillir la duplication
        var newLayer = emplacement.layers.add();
        newLayer.name = newName; // Renommer le nouveau calque
    
        // Fonction récursive pour dupliquer les sous-calques et leur contenu
        function duplicateSubLayers(sourceLayer, targetLayer) {
            // Dupliquer les éléments graphiques du calque source vers le calque cible
            var items = sourceLayer.pageItems;
            for (var i = 0; i < items.length; i++) {
                try {
                    var newItem = items[i].duplicate();
                    newItem.move(targetLayer, ElementPlacement.PLACEATEND); // Place l'élément dans le calque cible
                    newItem.name = items[i].name; // Conserve le nom d'origine
                } catch (e) {
                    alert("Erreur lors de la duplication de l'élément : " + items[i].name + "\nErreur : " + e);
                }
            }
    
            // Dupliquer les sous-calques
            var subLayers = sourceLayer.layers;
            for (var j = 0; j < subLayers.length; j++) {
                // Créer un sous-calque dans le calque cible avec le même nom
                var l = subLayers.length - j - 1;
                var newSubLayer = targetLayer.layers.add();
                newSubLayer.name = subLayers[l].name;
    
                // Appel récursif pour dupliquer les sous-calques à l'intérieur de ce sous-calque
                duplicateSubLayers(subLayers[l], newSubLayer);
            }
        }
    
        // Démarrer la duplication à partir du calque original vers le nouveau calque
        duplicateSubLayers(originalLayer, newLayer);
    
        return newLayer; // Retourner le nouveau calque créé
    }

    /**
     * Flips a layer horizontally
     * @param {Layer} layer - The layer to flip
     */
    function flipLayer(layer) {
        var layerBounds = getLayerBounds(layer); // [xMin, yMax, xMax, yMin]
        var layerCenter = (layerBounds[0] + layerBounds[2]) / 2;
        var items = getAllPaths(layer);
        var items2 = getAllPluginItems(layer);
    
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                itemPath = items[i];
                var pathBounds = getLayerBounds(itemPath);
                var pathCenter = (pathBounds[0] + pathBounds[2]) / 2;
                var pathTranslation = 2* (layerCenter - pathCenter);
                itemPath.translate(pathTranslation, 0);
                itemPath.resize(-100, 100);
            }
        }
    
        if (items2.length > 0) {
            for (var i = 0; i < items2.length; i++) {
                itemPlugin = items2[i];
                var pluginBounds = itemPlugin.geometricBounds;
                var pluginCenter = (pluginBounds[0] + pluginBounds[2]) / 2;
                var pluginTranslation = 2 * (layerCenter - pluginCenter);
                itemPlugin.translate(pluginTranslation, 0);
                itemPlugin.resize(-100, 100);
            }
        }
    }

    /**
     * Translates and scales a layer
     * @param {Layer} layer - The layer to translate and scale
     * @param {Array} trSc - Translation and scale values [deltaX, scaleX]
     * @param {Number} j - Current step index
    */
    function translationLayer(layer, trSc, j) { // tr[0] = deltaX ; tr[1] = scaleX
        var deltaX = trSc[0];
        var scaleX = trSc[1];
        var items = getAllPaths(layer);
        var itemsPlugin = getAllPluginItems(layer);
        var newScaleX = 100 - (j * (100 - scaleX)/n);
        if (items.length > 0) {
            for (var m = 0; m < items.length; m++) {
                if (items[m].typename === "PathItem") {
                    items[m].translate(deltaX, 0);
                    items[m].resize(newScaleX, 100);
                }
            }
        }
        if (itemsPlugin.length > 0) {
            for (var m = 0; m < itemsPlugin.length; m++) {
                itemsPlugin[m].translate(deltaX, 0);
                itemsPlugin[m].resize(scaleX, 100);
                
            }
        }
    }

    /**
     * Moves a sublayer to the bottom of its parent layer
     * @param {Layer} parentLayer - The parent layer
     * @param {Layer} subLayer - The sublayer to move
     * @returns {Boolean} True if the sublayer was moved, false otherwise
     */
    function moveSubLayerToBottom(parentLayer, subLayer) {
        // Vérifier si le sous-calque est un sous-calque direct du calque parent
        if (parentLayer.layers.length > 0) {
            for (var i = 0; i < parentLayer.layers.length; i++) {
                if (parentLayer.layers[i] === subLayer) {
                    // Sous-calque trouvé, le déplacer tout en bas
                    subLayer.move(parentLayer, ElementPlacement.PLACEATEND);
                    return true;  // Mouvement effectué avec succès
                }
            }
        }
    }

    /**
     * Gets the turn information for a specific step
     * @param {Number} k - The step index
     * @returns {Object} The turn information for the step
     */
    function getTurnInfo(k) {
        if (k == 1) {
            var transLE = xMinBG + (5/4) * eyeLength;
            var transRE = xMinBG + 1/3 * eyeLength;
            var scaleRE = 50;
            var transM = xMinBG + 1/2 * mouthLength;
            var transN = xMinBG + noseLength;
            var transE = (xMinBG + xMaxBG)/2 + (1/2) * eyeLength;
            var pourcentRE = 0.90; // pN -> 1 => RE -> xMinBG
            var transER = pourcentRE * xMinBG + (1 - pourcentRE) * xMaxBG;
            var transPL = (transLE - (1/4) * eyeLength);
            var transPR = (transRE - (1/8) * eyeLength);
            var dico = {"+Left Eye": [transLE, 100], "+Right Eye": [transRE, scaleRE], "Nose": [transN, 100],
                "Bouches": [transM, 87], "Left Ear": [transE, 100], "Right Ear": [transER, 100], "+Left Eyebrow": [transLE, 100], 
                "+Right Eyebrow": [transRE, scaleRE]};
                return dico;
            }
        if (k == 2) {
            var posLE = xMinBG + eyeLength;
            var posEL = xMinBG + 2 * eyeLength;
            var posN = xMinBG - (1/2) * noseLength+ 6;
            var dico = {"Nose": [posN, 100], "+Left Eye": [posLE, 100],
            "+Left Eyebrow": [posLE, 100], "Left Ear": [posEL, 100]};
            return dico;
        }
        if (k == 3) {
            var posFLE = xMinBG + (1/4) * eyeLength;
            var scaleLE = 25;
            var posFN = xMinBG + noseLength;
            var scaleN = 50;
            var posFEL = xMinBG + (1/2) * eyeLength;
            var dico = {"Nose": [posFN, scaleN], "+Left Eye": [posFLE, scaleLE],
            "+Left Eyebrow": [posFLE, scaleLE], "Left Ear": [posFEL, 100]};
            return dico;
        }
        if (k == 4) {
            var posE = xMinBG + 6;
            var dico = {"Left Ear": [posE, 100]};
            return dico;
        }
        return null;
    }

    /**
     * Gets the turn information for the body
     * @returns {Object} The turn information for the body
     */
    function getTurnBody() {
        var goalRA = leftArmPos;
        var goalLA = rightArmPos;
        var goalRL = leftLegPos;
        var goalLL = rightLegPos;
        var dico = {"+Right Arm": [goalRA], "+Left Arm": [goalLA], "+Left Leg": [goalLL], "+Right Leg": [goalRL]};
        return dico;
    }

    /**
     * Rotates a layer
     * @param {Layer} layer - The layer to rotate
     * @param {Number} degree - The degree to rotate
     * @param {Number} j - Current step index
     */
    function rotateLayer(layer, degree, j) {
        // Convertir le degré en radians pour les calculs trigonométriques
        var newDegree = Math.sin((j*Math.PI)/(2*n)) * degree;
        var radian = newDegree * (Math.PI / 180);
        
        // Obtenir les limites du calque et calculer le centre
        var layerBounds = getLayerBounds(layer); // [xMin, yMax, xMax, yMin]
        var centerX = (layerBounds[0] + layerBounds[2]) / 2;
        var centerY = (layerBounds[1] + layerBounds[3]) / 2;
    
        // Fonction pour appliquer la rotation autour d'un point
        function rotatePoint(x, y, cx, cy, angleRad) {
            var cosTheta = Math.cos(angleRad);
            var sinTheta = Math.sin(angleRad);
            var dx = x - cx;
            var dy = y - cy;
            
            var newX = cx + (dx * cosTheta - dy * sinTheta);
            var newY = cy + (dx * sinTheta + dy * cosTheta);
            
            return [newX, newY];
        }
    
        // Fonction récursive pour tourner les éléments d'un calque
        function rotateItemsRecursively(currentLayer) {
            var items = getAllPaths(currentLayer); // Obtenir tous les chemins dans ce calque
            for (var i = 0; i < items.length; i++) {
                if (items[i].typename === "PathItem") {
                    // Obtenir la position actuelle du PathItem (centre de son rectangle englobant)
                    var itemBounds = items[i].visibleBounds; // [xMin, yMax, xMax, yMin]
                    var itemCenterX = (itemBounds[0] + itemBounds[2]) / 2;
                    var itemCenterY = (itemBounds[1] + itemBounds[3]) / 2;
    
                    // Calculer la nouvelle position après rotation autour du centre du calque
                    var newPosition = rotatePoint(itemCenterX, itemCenterY, centerX, centerY, radian);
    
                    // Calculer la translation nécessaire pour déplacer l'objet à sa nouvelle position
                    var deltaX = newPosition[0] - itemCenterX;
                    var deltaY = newPosition[1] - itemCenterY;
    
                    // Appliquer la translation puis la rotation
                    items[i].translate(deltaX, deltaY);
                    items[i].rotate(newDegree, true, true, true, true, Transformation.CENTER);
                }
            }
    
            // Tourner aussi les sous-calques s'ils existent
            if (currentLayer.layers.length > 0) {
                for (var j = 0; j < currentLayer.layers.length; j++) {
                    rotateItemsRecursively(currentLayer.layers[j]);
                }
            }
        }
    
        // Appel récursif pour faire la rotation sur le calque principal et ses sous-calques
        rotateItemsRecursively(layer);
    }

    /**
     * Gets all paths in a layer
     * @param {Layer} layer - The layer to get paths from
     * @returns {Array} All PathItems in the layer
     */
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

    /**
     * Checks if a layer exists in the document
     * @returns {Layer} The layer object if found, otherwise null
     */
    function headExists() {
        var allLayers = getAllLayers(doc);
        var headLayer = null;
        for (var i = 0; i < allLayers.length; i++) {
            if (allLayers[i].name == "Head") {
                headLayer = allLayers[i];
                break;
            }
        }
    
        // Si le calque "Head" n'existe pas, on arrête le script
        if (!headLayer) {
            alert("Le calque 'Head' n'a pas été trouvé dans le document !");
            exit();
            return;
        }
        return headLayer;
    }

    /**
     * Checks if a layer exists in the document
     * @returns {Layer} The layer object if found, otherwise null
     */
    function bodyExists() {
        var allLayers = getAllLayers(doc);
        var bodyLayer = null;
        for (var i = 0; i < allLayers.length; i++) {
            if (allLayers[i].name == "Body") {
                bodyLayer = allLayers[i];
                break;
            }
        }
    
        // Si le calque "Head" n'existe pas, on arrête le script
        if (!bodyLayer) {
            alert("Le calque 'Body' n'a pas été trouvé dans le document !");
            exit();
            return;
        }
        return bodyLayer;
    }

    /**
     * Checks if a layer exists in the document
     * @param {String} name - The name of the layer to find
     * @returns {Layer} The layer object if found, otherwise null
     */
    function layerExists(name) {
        var allLayers = getAllLayers(doc);
        var layer = null;
        for (var i = 0; i < allLayers.length; i++) {
            if (allLayers[i].name == name) {
                layer = allLayers[i];
                break;
            }
        }
    
        // Si le calque "Head" n'existe pas, on arrête le script
        if (!layer) {
            alert("Le calque '" + name + "' n'a pas été trouvé dans le document !");
            exit();
            return;
        }
        return layer;
    }

    /**
     * Gets all plugin items in a layer
     * @param {Layer} layer - The layer to get plugin items from
     * @returns {Array} All PluginItems in the layer
     */ 
    function f(x) {
        return (Math.sin((x-0.5)*Math.PI)+1)/2;
    }

    /**
     * Gets all plugin items in a layer
     * @param {Layer} layer - The layer to get plugin items from
     * @returns {Array} All PluginItems in the layer
     */     
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

    var headLayer = headExists();
    var bodyLayer = bodyExists();
    
    for (var z = 0; z < 1; z++) {
        // Variables pour récupérer les informations sur le calque BG et +Left Eye
        var bgLayer = null;
        var eyeLayer = null;
        var mouthLayer = null;
        var noseLayer = null;
        var earLayer = null;
        
        // Rechercher les calques BG et +Left Eye sous "Head"
        for (var i = 0; i < headLayer.layers.length; i++) {
            var subLayer = headLayer.layers[i];
            if (subLayer.name == "BG") {
                bgLayer = subLayer;
            } else if (subLayer.name == "+Left Eye") {
                eyeLayer = subLayer;
            } else if (subLayer.name == "Bouches") {
                mouthLayer = subLayer;
            } else if (subLayer.name == "Nose") {
                noseLayer = subLayer;
            } else if (subLayer.name == "Left Ear") {
                earLayer = subLayer;
            }
        }

        // Si les calques nécessaires ne sont pas trouvés, on arrête le script
        if (!bgLayer || !eyeLayer || !noseLayer || !mouthLayer || !earLayer) {
            alert("Les calques 'BG', '+Left Eye', 'Left Ear', 'Nose' ou 'Bouches' ne sont pas trouvés sous 'Head' !");
            exit();
            return;
        }
        
        // Calcul des bounds pour BG et +Left Eye
        var bgBounds = getLayerBounds(bgLayer); // [xMin, yMax, xMax, yMin]
        var eyeBounds = getLayerBounds(eyeLayer); // [xMin, yMax, xMax, yMin]
        var noseBounds = getLayerBounds(noseLayer);
        var mouthBounds = getLayerBounds(mouthLayer);
        var earBounds = getLayerBounds(earLayer);
            
        var xMinBG = bgBounds[0]; // xMin(BG)
        var xMaxBG = bgBounds[2];
        var eyeLength = eyeBounds[2] - eyeBounds[0];
        var noseLength = noseBounds[2] - noseBounds[0];
        var mouthLength = mouthBounds[2] - mouthBounds[0];
    }

    for (var z = 0; z < 1; z++) {
        var hipsLayer = null;
        var torsoLayer = null
        var leftArmLayer = null;
        var rightArmLayer = null
        var leftLegLayer = null;
        var rightLegLayer = null;

        // Rechercher les calques Torso, Hips, +Left Leg, +Right Leg, +Left Arm et +Right Arm sous "Body"
        for (var i = 0; i < bodyLayer.layers.length; i++) {
            var subLayer = bodyLayer.layers[i];
            if (subLayer.name == "Hips") {
                hipsLayer = subLayer;
            } else if (subLayer.name == "Torso") {
                torsoLayer = subLayer;
            } else if (subLayer.name == "+Right Arm") {
                rightArmLayer = subLayer;
            } else if (subLayer.name == "+Left Arm") {
                leftArmLayer = subLayer;
            } else if (subLayer.name == "+Left Leg") {
                leftLegLayer = subLayer;
            } else if (subLayer.name == "+Right Leg") {
                rightLegLayer = subLayer;
            }
        }

        var calques = [hipsLayer, torsoLayer, rightArmLayer, leftArmLayer, leftLegLayer, rightLegLayer];
        var noms = ["Hips", "Torso", "+Right Arm", "+Left Arm", "+Left Leg", "+Right Leg"];
        
        // Si les calques nécessaires ne sont pas trouvés, on arrête le script
        for (var i = 0; i < calques.length ; i++) {
            if (!calques[i]) {
                alert("Le calque " + noms[i] + " n'est pas trouvé sous 'Body' !");
            }
        }

        var torsoBounds = getLayerBounds(torsoLayer); // [xMin, yMax, xMax, yMin]
        var hipsBounds = getLayerBounds(hipsLayer); // [xMin, yMax, xMax, yMin]
        var rightArmBounds = getLayerBounds(rightArmLayer);
        var leftArmBounds = getLayerBounds(leftArmLayer);
        var rightLegBounds = getLayerBounds(rightLegLayer);
        var leftLegBounds = getLayerBounds(leftLegLayer);

        var rightArmPos = (rightArmBounds[0] + rightArmBounds[2])/2;
        var leftArmPos = (leftArmBounds[0] + leftArmBounds[2])/2;
        var rightLegPos = (rightLegBounds[0] + rightLegBounds[2])/2;
        var leftLegPos = (leftLegBounds[0] + leftLegBounds[2])/2;
    }

    var n = prompt("Entrez un nombre (>=2) pour les duplications et translations :", 2);
    n = parseInt(n);
    if (isNaN(n) || n < 2) {
        alert("Le nombre doit être supérieur ou égal à 2 !");
        return;
    }
    var nezG = confirm("Le nez est-il orienté vers la gauche ?");

    /**
     * Turns the head
     */
    function headTurn() {
        for (var k = 1; k < 9; k++) {
            if (k == 1) { 
                var dico = getTurnInfo(k);
                if (!(dico == null)) {
                    for (var j = 1; j < (n+1); j++) {
                        nameLeftQuarter = "Left Quarter " + j.toString();
                        var lQ = duplicateLayer(headLayer, nameLeftQuarter);
                        var layers = getAllLayers(lQ); // Récupère tous les calques
                        for (var i = 0; i < layers.length; i++) {
                            var layer = layers[i]; // Accède au calque courant
                            if (layer.name in dico) { // Rappel : trSc[0] = position finale ; trSc[1] = scale final
                                var trSc = dico[layer.name];
                                var posLayer = getLayerPosition(layer);
                                var trans =  - (j * (posLayer[0] - trSc[0])/n);
                                translationLayer(layer, [trans, trSc[1]], j);
                                if (layer.name == "Bouches" || layer.name == "Bouches") {
                                    rotateLayer(layer, -4.5, j);
                                    var bouches = layer.layers;
                                    for (var y = 0; y < bouches.length; y++) {
                                        translationLayer(bouches[y], [0, trSc[1]], j);
                                    }
                                }
                                if (layer.name == "+Right Eye") {
                                    var layerRightPupil = layer.layers[2];
                                    var pathRightPupil = layerRightPupil.pathItems[0];
                                    pathRightPupil.translate(- Math.sin((Math.PI*j)/(2*n)) * (trSc[1]/100) * (1/8) * eyeLength, 0)
                                }
                                if (layer.name == "+Left Eye") {
                                    var layerLeftPupil = layer.layers[2];
                                    var pathLeftPupil = layerLeftPupil.pathItems[0];
                                    pathLeftPupil.translate(- Math.sin((Math.PI*j)/(2*n)) * (trSc[1]/100) * (1/4) * eyeLength, 0)
                                }
                            }
                        }
                        if (!nezG) {
                            var nose = getLayerByName(lQ, "Nose");
                            flipLayer(nose);
                        }
                        var mTB = getLayerByName(lQ, "Right Ear");
                        moveSubLayerToBottom(lQ, mTB);
                    }
                }
            }
            if (k == 2) {
                var dico = getTurnInfo(k);
                if (!(dico == null)) {
                    nameLP = "Left Profile";
                    var lP = duplicateLayer(headLayer, nameLP);
                    var layers = getAllLayers(lP);
                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i]; // Accède au calque courant
                        if (layer.name in dico) { // Rappel : trSc[0] = position finale ; trSc[1] = scale finale
                            var trSc = dico[layer.name];
                            var posLayer = getLayerPosition(layer);
                            var trans =  (trSc[0] - posLayer[0]);
                            translationLayer(layer, [trans, trSc[1]], n);
                        }
                        if (layer.name == "+Left Eye") {
                            var layerLeftPupil = layer.layers[2];
                            var pathLeftPupil = layerLeftPupil.pathItems[0];
                            pathLeftPupil.translate(-(1/4) * eyeLength, 0)
                        }
                    }
                    var tBD = [getLayerByName(lP, "+Right Eye"), getLayerByName(lP, "+Right Eyebrow"),
                    getLayerByName(lP, "Bouches"), getLayerByName(lP, "Right Ear")];
                    for (var p = 0; p < 4; p++) {
                        tBD[p].remove();
                    }
                    if (!nezG) {
                        var nose = getLayerByName(lQ, "Nose");
                        flipLayer(nose);
                    }
                }
            }
            if (k == 3) {
                var dico = getTurnInfo(k);
                if (!(dico == null)) {
                    for (var j = 1; j <= Math.ceil((n+1)/2); j++) {
                        nameLP = "Left Profile " + j.toString();
                        var lPIni = layerExists("Left Profile");
                        var lP = duplicateLayer(lPIni, nameLP);
                        var layers = getAllLayers(lP);
                        for (var i = 0; i < layers.length; i++) {
                            var layer = layers[i]; // Accède au calque courant
                            if (layer.name in dico) { // Rappel : trSc[0] = position finale ; trSc[1] = scale finale
                                var trSc = dico[layer.name];
                                var posLayer = getLayerPosition(layer);
                                var trans =  - (j * (posLayer[0] - trSc[0])/n);
                                translationLayer(layer, [trans, trSc[1]], j);
                            }
                            if (layer.name == "+Left Eye" && j > Math.ceil((n+1)/2)/2) {
                                var layerLeftPupil = layer.layers[2];
                                var pathLeftPupil = layerLeftPupil.pathItems[0];
                                pathLeftPupil.translate(Math.sin(((Math.PI * (j-1))/(Math.ceil((n+1)/2)))) * (1/8) * eyeLength, 0)
                            }
                        }
                        var mTB = getLayerByName(lP, "Nose");
                        moveSubLayerToBottom(lP, mTB);
                    }
                }
            }
            if (k == 4) {
                var dico = getTurnInfo(k);
                if (!(dico == null)) {
                    for (var j = 1; j < Math.ceil(n/2); j++) {
                        var t = j + Math.ceil((n+1) / 2);
                        var dernierLP = "Left Profile " + Math.ceil((n+1)/2).toString();
                        var nameLP = "Left Profile " + t.toString();
                        var lPIni = layerExists(dernierLP);
                        var lP = duplicateLayer(lPIni, nameLP);
                        var layers = getAllLayers(lP);
                        for (var i = 0; i < layers.length; i++) {
                            var layer = layers[i]; // Accède au calque courant
                            if (layer.name in dico) { // Rappel : trSc[0] = position finale ; trSc[1] = scale finale
                                var trSc = dico[layer.name];
                                var posLayer = getLayerPosition(layer);
                                var trans =  - ((j+1) * (posLayer[0] - trSc[0])/n);
                                translationLayer(layer, [trans, trSc[1]], j);
                                flipLayer(layer);
                            }
                        }
                        var tBD = [getLayerByName(lP, "+Left Eye"), getLayerByName(lP, "+Left Eyebrow"),
                        getLayerByName(lP, "Nose")];
                        for (var p = 0; p < 3; p++) {
                            tBD[p].remove();
                        }
                    }
                }
            }
            if (k == 6) {
                var fD = duplicateLayer(headLayer, "Left Profile Dos");
                var tBD = [getLayerByName(fD, "+Left Eye"), getLayerByName(fD, "+Left Eyebrow"),
                getLayerByName(fD, "+Right Eye"), getLayerByName(fD, "+Right Eyebrow"),
                getLayerByName(fD, "Nose"), getLayerByName(fD, "Bouches")];
                for (var p = 0; p < 6; p++) {
                    tBD[p].remove();
                }
                flipLayer(fD);
            }
            dico = {};
        }
    }

    /**
     * Turns the body
     */
    function bodyTurn() {
        for (var j = 0; j < (2 * n + 2); j++) {
            dico = getTurnBody(1);
            k = j+1;
            if (k == (n + 1)) {
                nameLeftQuarter = "Left Profile";
            } else if (k == (2*n + 2)) {
                nameLeftQuarter = "Left Profile Dos";
            } else if (k > (n + 1)) {
                z = k - n;
                nameLeftQuarter = "Left Profile " + z.toString();
            } else {
                nameLeftQuarter = "Left Quarter " + z.toString();
            }
            var lQ = duplicateLayer(bodyLayer, nameLeftQuarter);
            moveSubLayerToBottom(doc, lQ);
            var layers = getAllLayers(lQ);
            var brasDroit = null;
            var jambeDroite = null;
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (layer.name == "+Right Arm") {
                    brasDroit = layer;
                }
                if (layer.name == "+Right Leg") {
                    jambeDroite = layer;
                }
                if (layer.name in dico) {
                    var trSc = dico[layer.name][0];
                    var layerBounds = getLayerBounds(layer);
                    var posLayer = (layerBounds[2] + layerBounds[0]) / 2;
                    var x = (j+2)/(2*n+3);
                    var trans = - f(x) * (posLayer - trSc);
                    translationLayer(layer, [trans, 100], 0);
                    if (j > (n + 1) && (layer.name == "+Left Arm")) {
                        flipLayer(layer);
                    }
                    if (j > (n + 1) && (layer.name == "+Right Arm")) {
                        flipLayer(layer);
                    }
                }
            }
            var jambeGauche = getLayerByName(lQ, "+Left Leg");
            var brasGauche = getLayerByName(lQ, "+Left Arm");
            flipLayer(jambeGauche);
            moveSubLayerToBottom(lQ, jambeDroite);
            moveSubLayerToBottom(lQ, brasDroit);
            if (nameLeftQuarter == "Left Profile Dos"){
                moveSubLayerToBottom(lQ, brasGauche);
            }
            resizeLayerTop(brasDroit, 90);
            resizeLayerTop(jambeDroite, 90);
        }

    }

    headTurn();
    bodyTurn();

    headLayer.name = "Frontal";
    bodyLayer.name = "Frontal";

    var newBody = doc.layers.add();
    var newHead = doc.layers.add();
    newBody.name = "Body";
    newHead.name = "Head";
    
}

performTranslation();