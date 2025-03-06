var doc = app.activeDocument;

var base = doc.layers.add();
base.name = "+Perso";

var body = base.layers.add();
body.name = "Body";

var head = base.layers.add();
head.name = "Head";

dico = ["BG", "Cheveux", "Right Ear", "Left Ear", "Nose"];

for (var i = 0; i < dico.length; i++) {
    var element = head.layers.add();
    element.name = dico[i];
}

dico = ["+Left Leg", "+Right Leg", "Torso", "+Left Arm", "+Right Arm"];

for (var i = 0; i < dico.length; i++) {
    var element = body.layers.add();
    element.name = dico[i];
}