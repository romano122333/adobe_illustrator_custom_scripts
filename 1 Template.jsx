// Get the currently active document in Adobe Photoshop/Illustrator
var doc = app.activeDocument;

// Create the main character container layer named "+Perso"
var base = doc.layers.add();
base.name = "+Perso";

// Create a layer for the character's body parts
var body = base.layers.add();
body.name = "Body";

// Create a layer for the character's head parts
var head = base.layers.add();
head.name = "Head";

// Define an array of head components to create as separate layers
// BG (Background), hair, ears, and nose
dico = ["BG", "Cheveux", "Right Ear", "Left Ear", "Nose"];

// Create layers for each head component
for (var i = 0; i < dico.length; i++) {
    var element = head.layers.add();
    element.name = dico[i];
}

// Define an array of body components to create as separate layers
// Note: "+" prefix typically indicates these are container/group layers
dico = ["+Left Leg", "+Right Leg", "Torso", "+Left Arm", "+Right Arm"];

// Create layers for each body component
for (var i = 0; i < dico.length; i++) {
    var element = body.layers.add();
    element.name = dico[i];
}