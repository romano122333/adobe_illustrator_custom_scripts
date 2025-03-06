// Fonction pour créer des formes intermédiaires
function createIntermediateShapes(shape1, shape2, steps) {
    var intermediateShapes = [];
    
    // Vérifiez que les deux formes ont le même nombre de points

    for (var i = 1; i <= steps; i++) {
        // Créer une nouvelle forme vide pour chaque étape intermédiaire
        var newPath = shape1.layer.pathItems.add(); // Ajouter un nouveau chemin
        newPath.filled = true; // Si vous voulez les contours uniquement
        newPath.stroked = true; // On laisse activé le contour

        // Pour chaque point des deux formes, on crée une interpolation
        for (var j = 0; j < shape1.pathPoints.length; j++) {
            // Interpolation linéaire pour chaque point (entre shape1 et shape2)
            var x = shape1.pathPoints[j].anchor[0] + (shape2.pathPoints[j].anchor[0] - shape1.pathPoints[j].anchor[0]) * (i / (steps + 1));
            var y = shape1.pathPoints[j].anchor[1] + (shape2.pathPoints[j].anchor[1] - shape1.pathPoints[j].anchor[1]) * (i / (steps + 1));

            // Ajouter le point interpolé à la nouvelle forme
            var newPoint = newPath.pathPoints.add();
            newPoint.anchor = [x, y];

            // Interpolation des poignées de direction (leftDirection et rightDirection)
            var leftDirectionX = shape1.pathPoints[j].leftDirection[0] + (shape2.pathPoints[j].leftDirection[0] - shape1.pathPoints[j].leftDirection[0]) * (i / (steps + 1));
            var leftDirectionY = shape1.pathPoints[j].leftDirection[1] + (shape2.pathPoints[j].leftDirection[1] - shape1.pathPoints[j].leftDirection[1]) * (i / (steps + 1));

            var rightDirectionX = shape1.pathPoints[j].rightDirection[0] + (shape2.pathPoints[j].rightDirection[0] - shape1.pathPoints[j].rightDirection[0]) * (i / (steps + 1));
            var rightDirectionY = shape1.pathPoints[j].rightDirection[1] + (shape2.pathPoints[j].rightDirection[1] - shape1.pathPoints[j].rightDirection[1]) * (i / (steps + 1));

            newPoint.leftDirection = [leftDirectionX, leftDirectionY];
            newPoint.rightDirection = [rightDirectionX, rightDirectionY];

            // Interpolation du type de point (pointu ou arrondi)
            if (shape1.pathPoints[j].pointType === shape2.pathPoints[j].pointType) {
                // Si les deux points ont le même type, le type reste constant
                newPoint.pointType = shape1.pathPoints[j].pointType;
            } else {
                // Si les types de points diffèrent, interpoler en fonction de la progression
                newPoint.pointType = (i <= steps / 2) ? shape1.pathPoints[j].pointType : shape2.pathPoints[j].pointType;
            }
        }

        // Fermer la forme en reliant le dernier point au premier
        newPath.closed = true; // Cela assure que la forme est fermée

        intermediateShapes.push(newPath);
    }
    return intermediateShapes;
}

// Fonction principale
function morphShapes() {
    var doc = app.activeDocument;
    var shapes = doc.selection;

    // Vérifiez que l'utilisateur a sélectionné exactement deux formes
    if (shapes.length !== 2) {
        alert("Veuillez sélectionner exactement deux formes.");
        return;
    }

    var shape1 = shapes[0];
    var shape2 = shapes[1];

    if (shape1.pathPoints.length !== shape2.pathPoints.length) {
        alert("Les deux formes doivent avoir le même nombre de points. Forme du haut : " + shape1.pathPoints.length + " Forme du bas : " + shape2.pathPoints.length);
        return;
    }

    // Demande à l'utilisateur le nombre d'images intermédiaires
    var steps = prompt("Entrez le nombre d'images intermédiaires :", "5");
    
    // Vérifiez que l'entrée est un nombre valide
    if (steps === null || isNaN(steps) || steps <= 0) {
        alert("Veuillez entrer un nombre valide.");
        return;
    }

    // Crée les formes intermédiaires
    createIntermediateShapes(shapes[0], shapes[1], parseInt(steps));
}

// Lancer le script


morphShapes();
