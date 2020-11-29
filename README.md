# Item Icon Updater
A Foundry VTT Module for updating icons with missing images based on the D&amp;D5e SRD icons.

Updates some icons for actions and other items with missing icons. This is particularly useful in conjunction with VTTA D&D Beyond Integration. Searches all items from all actors in the current world for missing icons. These item names are compared first to a curated list of images, then to user-defined items in the game, and finally across all compendiums in the game. If a matching name is found, the item icon will be updated.

Icons for tokens already existing on the map are not updated - a new token must be brought in from the actor.

The updates happen automatically when the page reloads, when a new Actor is created, and when an Item is created or has its name updated.

## Installation
1. Copy this link and use it in Foundry's Module Manager to install the Module

    > https://raw.githubusercontent.com/kelsa-gm/item-icon-updater/main/module.json
    
2. Enable the Module in your Worlds Module Settings

## Usage
Create new items. If the name is recognized, the icon will automatically be assigned:
![](new_actor.gif)

Icons are automatically updated when importing from D&D Beyond using the VTTA module:
![](beyond.gif)

## Custom Dictionary
The user may optionally specify a custom dictionary of item names and icon files. If specified, these will override the default icons. Default icons will still be used for items not included in the custom dictionary. 

Updates to the custom dictionary in the module settings take effect after the next page refresh. 

Item names are case sensitive (so "Bite" works, but "bite" does not). Any suffix in parentheses is ignored, such as "(Hybrid Form Only)" or "(Costs 2 Actions)".

The custom dictionary should be a text file in the following format:

```
export let customDict = {
    "Item Name 1": "path/to/icon1.jpg", 
    "Item Name 2": "path/to/icon2.jpg"
}
```

## Future Work
1. Create an updated icon dictionary using the new icons provided in Core 0.7x. 
2. Make the lookup values case insensitive.

## Acknowledgements
Thanks to [VanceCole](https://github.com/VanceCole) for the helpful suggestions.


## Collaboration
Anyone who wants to use this as a starting point for a more robust module is welcome to!
