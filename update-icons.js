import { iconDict } from './icon-dictionary-0.6.6.js';
import { log } from './helper.js';

Hooks.on("ready", function() {
	// This code runs once core initialization is ready and game data is available.
	UpdateAllActors();
	UpdateDictionary();
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
	let imageName = GetImageName(item);
	  
	if (imageName == "mystery-man.svg") {
		let itemName = GetCleanedItemName(item); 
		
		if (itemName in iconDict) {
			return {_id: item._id, img: iconDict[itemName]};
		}
	}
	return null;
}

function GetImageName(item) {
	let imageArr = item.img.split("/");
	return imageArr[imageArr.length-1];
}

function GetCleanedItemName(item) {
	// Splitting on parentheses and trimming white space handles cases such as "(Hybrid Form Only)" as well as D&D Beyond additions such as "(Costs 2 Actions)".
	return item.name.split("(")[0].trim(); 
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

async function UpdateDictionary() {
	log("Building dictionary.")
	// Search all custom game items the user has access to.
	let gameItems = game.data.items.filter(i=>(game.user.isGM || !i.private))
	gameItems.forEach(item => AddItemToDictionary(item));
	
	// Search all Item compendiums the user has access to.
	let packs = game.packs.filter(p=>(game.user.isGM || !p.private) && p.entity === "Item");
	for (let pack of packs) {
		//log("Adding " + pack.metadata.label + " to dictionary.");
		let packContent = await pack.getContent();
		for (let item of packContent) {
			AddItemToDictionary(item);
		}
	}
}

function AddItemToDictionary (item) {
	let imageName = GetImageName(item);
	if (imageName == "mystery-man.svg") {return;}
	
	let itemName = GetCleanedItemName(item);
	if (!(itemName in iconDict)){
		iconDict[itemName] = item.img;
	}
}
