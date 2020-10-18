# Item Icon Updater
A Foundry VTT Module for updating icons with missing images based on the D&amp;D5e SRD icons.

Updates some icons for actions and other items with missing icons. This is particularly useful in conjunction with VTTA D&D Beyond Integration. Searches all items from all actors in the current world for missing icons, and checks a curated list based on the SRD. Icons for tokens already existing on the map are not updated - a new token must be brought in from the actor.

The updates happen automatically when the page reloads, when a new Actor is created, and when an Item is created or updated.

Names are case sensitive (so "Bite" works, but "bite" does not).

## Installation
1. Copy this link and use it in Foundry's Module Manager to install the Module

    > https://raw.githubusercontent.com/kelsa-gm/item-icon-updater/main/module.json
    
2. Enable the Module in your Worlds Module Settings

## Future Work
1. Create an updated icon dictionary using the new icons provided in Core 0.7x. 
2. Make the lookup values case insensitive.

## Acknowledgements
Thanks to [VanceCole](https://github.com/VanceCole) for the helpful suggestions.


## Collaboration
Anyone who wants to use this as a starting point for a more robust module is welcome to!
