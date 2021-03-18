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

	game.settings.register("item-icon-updater", "forceUpdate", {
		name: "Force Update Icons",
		hint: "If enabled, icons will be updated even if an icon is already set for an Item.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});

Hooks.on("ready", function () {
	// This code runs once core initialization is ready and game data is available.
	UpdateDictionary();
});

Hooks.on("updateOwnedItem", function (actor, item, updateData, options, userId) {
	if (updateData.name) {
		//		log("Update Item triggered.");
		UpdateItem(actor, item);
	}
});

Hooks.on("createOwnedItem", function (actor, item) {
	//	log("Create Item triggered.");
	UpdateItem(actor, item);
});

Hooks.on("createActor", function (actor) {
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
	// TODO: There is currently a bug where class items cannot be updated. Skipping them for now.
	if (item.type == "class") { return null }

	let imageName = GetImageName(item);

	let forceUpdate = game.settings.get('item-icon-updater', 'forceUpdate');

	if (imageName == null || imageName == "mystery-man.svg" || forceUpdate) {
		let itemName = GetCleanedItemName(item);
		let altItemName = GetAlternateItemName(itemName);

		if (itemName in combinedDict) {
			return { _id: item._id, img: combinedDict[itemName] };
		}
		else if (altItemName in combinedDict) {
			return { _id: item._id, img: combinedDict[altItemName] };
		}
	}
	return null;
}

function GetImageName(item) {
	let imageArr = null;
	try {
		imageArr = item.img.split("/");
	}
	catch {
		return imageArr;
	}
	return imageArr[imageArr.length - 1];
}

function GetCleanedItemName(item) {
	// Splitting on parentheses and trimming white space handles cases such as "(Hybrid Form Only)" as well as D&D Beyond additions such as "(Costs 2 Actions)".
	// Also remove the three types of single quotes that can get mixed up.
	return item.name.replace(/(\'|\‘|\’)/gm, "").split("(")[0].trim().toLowerCase();
}

function GetAlternateItemName(itemName) {
	// Try parsing the name according to some common patterns that may be used by D&D Beyond or other item creation tools.

	// Remove any +x modifiers, following two different patterns (with or without comma)
	let newName = itemName.split(", +")[0];
	newName = newName.split(" +")[0];

	// Convert comma inverted names: "Crossbow, Light" to "Light Crossbow"
	let splitName = newName.split(", ");
	if (splitName.length == 2) {
		return splitName[1] + " " + splitName[0];
	}
	return newName;
}

function ExecuteUpdates(actor, updates) {
	if (updates.length > 0) {
		if (actor.can(game.user, 'update')) {
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
			let { customDict } = await import("../../" + customDictPath);
			for (let key in customDict) {
				combinedDict[key.replace(/(\'|\‘|\’)/gm, "").toLowerCase()] = customDict[key];
			}
		}
		catch (err) {
			log("Error loading custom dictionary. Defaults will be used. " + err.message);
		}
	}

	// Load Default Dictionary
	for (let key in iconDict) {
		combinedDict[key.replace(/(\'|\‘|\’)/gm, "").toLowerCase()] = iconDict[key];
	}

	// Search all custom game items the user has access to.
	// TODO: This filter does not seem to work - players can update icons using item names they do not have access to.
	let gameItems = game.data.items.filter(i => (game.user.isGM || !i.private) && i.type)
	gameItems.forEach(item => AddItemToDictionary(item));

	// Search all Item compendiums the user has access to.
	// TODO: This filter does not seem to work - players can update icons using compendiums they do not have access to.
	let packs = game.packs.filter(p => (game.user.isGM || !p.private) && p.entity === "Item");
	for (let pack of packs) {
		//log("Adding " + pack.metadata.label + " to dictionary.");
		let packContent = await pack.getContent();
		for (let item of packContent) {
			AddItemToDictionary(item);
		}
	}
	UpdateAllActors();
}

function AddItemToDictionary(item) {
	let imageName = GetImageName(item);
	if (imageName == "mystery-man.svg") { return; }

	let itemName = GetCleanedItemName(item);
	if (!(itemName in combinedDict)) {
		combinedDict[itemName.replace(/(\'|\‘|\’)/gm, "").toLowerCase()] = item.img;
	}
}
