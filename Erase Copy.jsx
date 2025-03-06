// Fonction pour récupérer tous les calques du document, y compris les sous-calques
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

// Fonction principale pour supprimer les occurrences de "copy" ou "- copie"
var RemoveCopies = (function() {
function RemoveCopies() {
  this.maxNumber = parseInt(prompt("Jusqu'à quel nombre voulez-vous rechercher ?", "20"));
  if (!isNaN(this.maxNumber) && this.maxNumber > 0) {
    this.removeCopies();
  } else {
    alert("Veuillez entrer un nombre valide supérieur à 0.");
  }
}

RemoveCopies.prototype.removeCopies = function() {
  var doc = app.activeDocument;
  if (doc) {
    var allLayers = getAllLayers(doc); // Récupérer tous les calques
    
    for (var i = 1; i <= this.maxNumber; i++) {
      var copyNameFR = "- copie " + i.toString();
      var copyNameEN = "copy " + i.toString();
      if (i === 1) {
        copyNameFR = "- copie"; // Pour "- copie" sans nombre derrière (cas du premier calque)
        copyNameEN = "copy"; // Pour "copy" sans nombre derrière
      }
      
      this.renameLayers(allLayers, copyNameFR, copyNameEN);
    }
  } else {
    alert("Aucun document ouvert.");
  }
};

// Parcourir et renommer tous les calques
RemoveCopies.prototype.renameLayers = function(allLayers, copyNameFR, copyNameEN) {
  for (var i = 0; i < allLayers.length; i++) {
    var currentLayer = allLayers[i];
    // Renommer le calque s'il contient le nom à supprimer
    this.renameLayer(currentLayer, copyNameFR, copyNameEN);
  }
};

// Fonction pour renommer un calque donné
RemoveCopies.prototype.renameLayer = function(layer, copyNameFR, copyNameEN) {
  if (layer.typename === "Layer") {
    var originalName = layer.name;
    var newName = originalName;
    
    // Remplacer les occurrences de "- copie n" ou "copy n" à la fin
    newName = newName.replace(new RegExp(copyNameFR + "$", "g"), "");
    newName = newName.replace(new RegExp(copyNameEN + "$", "g"), "");
    
    // Si c'est le cas du "- copie" ou "copy" sans nombre derrière
    if (originalName.match(new RegExp("- copie$", "g"))) {
      newName = newName.replace(new RegExp("- copie$", "g"), "");
    }
    if (originalName.match(new RegExp("copy$", "g"))) {
      newName = newName.replace(new RegExp("copy$", "g"), "");
    }
        
    // Mise à jour du nom du calque si changement
    if (newName !== originalName) {
      layer.name = newName;
    }
  }
};

return RemoveCopies;
})();

// Lancer le processus
var removeCopies = new RemoveCopies();
