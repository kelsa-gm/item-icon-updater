import { iconDict } from './icon-dictionary-0.6.6.js';
import { log } from './helper.js';

Hooks.on("ready", function() {
	// This code runs once core initialization is ready and game data is available.
	UpdateAllActors();
	//setTimeout(() => {  UpdateAllActors(); }, 2000); // Used in initial testing, does not appear needed.
});

Hooks.on("updateOwnedItem", function(actor, item, updateData, options, userId) {
	if (updateData.name) {
//		log("Update Item triggered.");
		UpdateItem(actor, item);
	}
});

Hooks.on("createOwnedItem", function(actor, item) {
//	log("Create Item triggered.");
	UpdateItem(actor, item);
});

Hooks.on("createActor", function(actor) {
//	log("Create Actor triggered.");
	UpdateActor(actor);
});

function UpdateAllActors() {
//	log("Update All Actors triggered.");
	for (let actorCount = 0; actorCount < game.data.actors.length; actorCount++) {
		const actor = game.actors.get(game.data.actors[actorCount]._id);
		UpdateActor(actor);
	}
//	log("Completed updating all actors.")
}

function UpdateActor(actor) {
	log("Updating " + actor.name);
    let updates = [];
	  
	for (let key of actor.items.keys()) {
	    let item = actor.items.get(key);
		
		let update = GetImageUpdate(item);
		if (update !== null) {
			updates.push(update);
		}
	}
	ExecuteUpdates(actor, updates);
//	log("Completed updating " + actor.name);
}

function UpdateItem(actor, item) {
//	log("Updating " + item.name + " for " + actor.name);
	let updates = [];
	  
	let update = GetImageUpdate(item);
	if (update !== null) {
		updates.push(update);
	}
	
	ExecuteUpdates(actor, updates);
//	log("Completed updating " + item.name + " for " + actor.name);
}

function GetImageUpdate(item) {
	let imageArr = item.img.split("/");
	let imageName = imageArr[imageArr.length-1];
	  
	if (imageName == "mystery-man.svg") {
		// Splitting on parentheses and trimming white space handles cases such as "(Hybrid Form Only)" as well as D&D Beyond additions such as "(Costs 2 Actions)".
		let itemName = item.name.split("(")[0].trim(); 
		
		if (itemName in iconDict) {
			return {_id: item._id, img: iconDict[itemName]};
		}
	}
	return null;
}

function ExecuteUpdates(actor, updates) {
	if (updates.length > 0) {
		if(actor.can(game.user, 'update')){
			actor.updateEmbeddedEntity("OwnedItem", updates);
			log("Updated " + updates.length + " item icons for " + actor.name + ".")
		}
		else {
			log("User lacks permission to update " + actor.name + ". This message may display for a player when non-owned characters are being updated by others.");
		}
	};
}
