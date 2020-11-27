import { iconDict } from './icon-dictionary-0.6.6.js';
import { log } from './helper.js';

Hooks.on("ready", function() {
	// This code runs once core initialization is ready and game data is available.
	UpdateAllActors();
	//setTimeout(() => {  UpdateAllActors(); }, 2000); // Used in initial testing, does not appear needed.
});

Hooks.on("updateOwnedItem", function(actor) {
	UpdateActor(actor);
});

Hooks.on("createOwnedItem", function(actor) {
	UpdateActor(actor);
});

Hooks.on("createActor", function(actor) {
	UpdateActor(actor);
});

function UpdateAllActors() {
	log("Update All Actors triggered.");
	// There's probably a cleaner way to iterate through actors in the game.
	let actorCount;
	for (actorCount = 0; actorCount < game.data.actors.length; actorCount++) {
		const actor = game.actors.get(game.data.actors[actorCount]._id);
		UpdateActor(actor);
	}
	log("Completed updating item icons.")
}

function UpdateActor(actor) {
    let updates = [];
	  
	for (let key of actor.items.keys()) {
	    let item = actor.items.get(key);
		// Splitting on parentheses and trimming white space handles cases such as "(Hybrid Form Only)" as well as D&D Beyond additions such as "(Costs 2 Actions)".
		let itemName = item.name.split("(")[0].trim(); 

		let imageArr = item.img.split("/");
		let imageName = imageArr[imageArr.length-1];
		  
		if (imageName == "mystery-man.svg") {
		    if (itemName in iconDict) {
				//log([actor.name, itemName, key].join());
				updates.push({_id: item._id, img: iconDict[itemName]});
			}
		}
	}
	if (updates.length > 0) {
		if(actor.can(game.user, 'update')){
			actor.updateEmbeddedEntity("OwnedItem", updates);
			log(actor.name + ": " + updates.length + " updates.");
		}
		else {
			log("User lacks permission to update " + actor.name);
		}
	};
}
