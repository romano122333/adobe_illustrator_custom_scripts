/**
 * Creates intermediate shapes between two shapes by interpolating their points
 * @param {PathItem} shape1 - The first shape to morph from
 * @param {PathItem} shape2 - The second shape to morph to 
 * @param {Number} steps - Number of intermediate shapes to create
 * @returns {Array} Array of created intermediate PathItems
 */
function createIntermediateShapes(shape1, shape2, steps) {
    var intermediateShapes = [];

    // Create each intermediate shape
    for (var i = 1; i <= steps; i++) {
        var newPath = shape1.layer.pathItems.add();
        newPath.filled = true;
        newPath.stroked = true;

        // For each point in the shapes
        for (var j = 0; j < shape1.pathPoints.length; j++) {
            // Calculate interpolated position for the new point
            var x = shape1.pathPoints[j].anchor[0] + (shape2.pathPoints[j].anchor[0] - shape1.pathPoints[j].anchor[0]) * (i / (steps + 1));
            var y = shape1.pathPoints[j].anchor[1] + (shape2.pathPoints[j].anchor[1] - shape1.pathPoints[j].anchor[1]) * (i / (steps + 1));

            var newPoint = newPath.pathPoints.add();
            newPoint.anchor = [x, y];

            // Calculate interpolated bezier handle positions
            var leftDirectionX = shape1.pathPoints[j].leftDirection[0] + (shape2.pathPoints[j].leftDirection[0] - shape1.pathPoints[j].leftDirection[0]) * (i / (steps + 1));
            var leftDirectionY = shape1.pathPoints[j].leftDirection[1] + (shape2.pathPoints[j].leftDirection[1] - shape1.pathPoints[j].leftDirection[1]) * (i / (steps + 1));

            var rightDirectionX = shape1.pathPoints[j].rightDirection[0] + (shape2.pathPoints[j].rightDirection[0] - shape1.pathPoints[j].rightDirection[0]) * (i / (steps + 1));
            var rightDirectionY = shape1.pathPoints[j].rightDirection[1] + (shape2.pathPoints[j].rightDirection[1] - shape1.pathPoints[j].rightDirection[1]) * (i / (steps + 1));

            newPoint.leftDirection = [leftDirectionX, leftDirectionY];
            newPoint.rightDirection = [rightDirectionX, rightDirectionY];

            // Handle point type (smooth, corner etc)
            // If point types match, keep it, otherwise switch halfway through
            if (shape1.pathPoints[j].pointType === shape2.pathPoints[j].pointType) {
                newPoint.pointType = shape1.pathPoints[j].pointType;
            } else {
                newPoint.pointType = (i <= steps / 2) ? shape1.pathPoints[j].pointType : shape2.pathPoints[j].pointType;
            }
        }

        newPath.closed = true;
        intermediateShapes.push(newPath);
    }
    return intermediateShapes;
}

/**
 * Main function that handles the shape morphing process
 * Gets user input and validates the shapes before morphing
 */
function morphShapes() {
    var doc = app.activeDocument;
    var shapes = doc.selection;

    // Validate that exactly 2 shapes are selected
    if (shapes.length !== 2) {
        alert("Veuillez sélectionner exactement deux formes.");
        return;
    }

    var shape1 = shapes[0];
    var shape2 = shapes[1];

    // Validate that shapes have same number of points
    if (shape1.pathPoints.length !== shape2.pathPoints.length) {
        alert("Les deux formes doivent avoir le même nombre de points. Forme du haut : " + shape1.pathPoints.length + " Forme du bas : " + shape2.pathPoints.length);
        return;
    }

    // Get number of intermediate steps from user
    var steps = prompt("Entrez le nombre d'images intermédiaires :", "5");
    
    if (steps === null || isNaN(steps) || steps <= 0) {
        alert("Veuillez entrer un nombre valide.");
        return;
    }

    createIntermediateShapes(shapes[0], shapes[1], parseInt(steps));
}

morphShapes();
