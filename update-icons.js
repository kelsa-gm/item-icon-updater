import { iconDict } from './icon-dictionary-0.7.js';
import { log } from './helper.js';
let combinedDict = {};

Hooks.on('init', () => {
    game.settings.register("item-icon-updater", "customDictionaryPath", {
        name: "Custom Icon Dictionary",
        hint: "If specified, this dictionary will be searched for item icons prior to searching default locations. Takes effect after the next page refresh. See ReadMe on GitHub for more information.",
        scope: "world",
        config: true,
		default: '',
		type: String // Generic file pickers in the settings are not yet supported, and the custom settings-extender.js by @Azzurite currently only supports image, video, audio, or directory.
    });
});

Hooks.on("ready", function() {
	// This code runs once core initialization is ready and game data is available.
	UpdateDictionary();
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
	log("Update All Actors triggered.");
	for (let actorCount = 0; actorCount < game.data.actors.length; actorCount++) {
		const actor = game.actors.get(game.data.actors[actorCount]._id);
		UpdateActor(actor);
	}
	log("Completed updating all actors.")
}

function UpdateActor(actor) {
	//log("Updating " + actor.name);
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
		let altItemName = GetAlternateItemName(itemName);
		
		if (itemName in combinedDict) {
			return {_id: item._id, img: combinedDict[itemName]};
		}
		else if (altItemName in combinedDict) {
			return {_id: item._id, img: combinedDict[altItemName]};
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
	return item.name.split("(")[0].trim().toLowerCase(); 
}

function GetAlternateItemName(itemName) {
	// D&D Beyond sometimes names items such as "Crossbow, Light" where the Compendium is "Light Crossbow"
	let splitName = itemName.split(", ");
	if (splitName.length == 2) {
		return splitName[1] + " " + splitName[0];
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

async function UpdateDictionary() {
	log("Building dictionary.")
	
	// Load Custom Dictionary
	let customDictPath = game.settings.get('item-icon-updater', 'customDictionaryPath');

	if (customDictPath) {
		log("Loading custom dictionary: " + customDictPath);
		try {
			let { customDict } = await import ("../../" + customDictPath);
			for (let key in customDict) {
				combinedDict[key.toLowerCase()] = customDict[key];
			}
		}
		catch(err) {
			log("Error loading custom dictionary. Defaults will be used. " + err.message);
		}
	}
	
	// Load Default Dictionary
	for (let key in iconDict) {
		combinedDict[key.toLowerCase()] = iconDict[key];
	}
	
	// Search all custom game items the user has access to.
	// TODO: This filter does not seem to work - players can update icons using item names they do not have access to.
	// TODO: I think there is a bug with classes. For now filtering class items out.
	let gameItems = game.data.items.filter(i=>(game.user.isGM || !i.private) && i.type != "class")
	gameItems.forEach(item => AddItemToDictionary(item));
	
	// Search all Item compendiums the user has access to.
	// TODO: This filter does not seem to work - players can update icons using compendiums they do not have access to.
	let packs = game.packs.filter(p=>(game.user.isGM || !p.private) && p.entity === "Item");
	for (let pack of packs) {
		//log("Adding " + pack.metadata.label + " to dictionary.");
		let packContent = await pack.getContent();
		for (let item of packContent) {
			// TODO: I think there is a bug with classes. For now filtering class items out.
			if (item.type != "class") {
				AddItemToDictionary(item);
			}
		}
	}
	UpdateAllActors();
}

function AddItemToDictionary (item) {
	let imageName = GetImageName(item);
	if (imageName == "mystery-man.svg") {return;}
	
	let itemName = GetCleanedItemName(item);
	if (!(itemName in combinedDict)){
		combinedDict[itemName.toLowerCase()] = item.img;
	}
}
