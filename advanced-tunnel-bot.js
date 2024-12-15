/*
    ADVANCED TUNNEL BOT
    By yodabird19

    This bot mines an arbitrary tunnel pattern in a specified cardinal or
    intercardinal direction at a constant y-level. It decides which parts of each
    block to look at to ensure it mines the right block, it automatically corrects 
    y-level deviation, and can deposit the contents of its inventory into chests when 
    full if desired. This bot aborts if its tool is almost broken, if it cannot
    correct a deviated y-level, or can be manually aborted at any time by pressing 
    the set abortKey (default is "s").
    
    To configure this bot:
    - Enter a pattern in the 9x4 grid provided in the PATTERN TO MINE section. 
      The constants feetplus3, feetplus2, feetplus1, and feetplus0 are parsed
      to determine which blocks should be mined on each layer, with "O"s corresponding
      to blocks that will be mined, and "X"s to blocks that will not be.
    - Choose one of 12 orientations to mine in; valid options are listed in a comment
      above the const orientation declaration. Intercardinal orientations (northeast,
      southeast, southwest, northwest) have two options corresponding to different
      directions for the pattern layers to face.
    - Determine how long (in ticks, 1/20 of a second) the bot should mine each block
      for via blockMineTicks.
    - Set layersToMine to the number of layers the bot should mine before ending.
    - If the bot should deposit the contents of its inventory into chests along the
      tunnel when its inventory is full, set doChestItems = true. If it should not
      do this, set doChestItems = false.
    - Set the version variable to either "fabric" or "forge", depending on what
      version of JsMacros you are running.
      
    Please ensure that configuration options correspond to reasonable tunnel mining
    parameters, as the space of possible configurations on this bot exceeds the space
    of physically executable tunnel mining jobs.
*/

/////////////////////////////////////////////////////////////////////////////////////////

// PATTERN TO MINE
const feetplus3 = "XXXXOXXXX"
const feetplus2 = "XXXOOOXXX"
const feetplus1 = "XXXOOOXXX"
const feetplus0 = "XXXOOOXXX"
//  player stands here ^

/////////////////////////////////////////////////////////////////////////////////////////

// Config variables - CHANGE THESE

// The orientation the bot should mine in, taking into account both the relationship
// of each layer to the previous (north, northeast, east, southeast, south, southwest,
// west, northwest) and the direction the pattern is facing (north, east, south, west).
// Valid options: "north", "northeast-facenorth", "northeast-faceeast", "east",
// "southeast-faceeast", "southeast-facesouth", "south", "southwest-facesouth",
// "southwest-facewest", "west", "northwest-facewest", "northwest-facenorth"
const orientation = "east"

// The amount of time to mine each block for; the bot isn't allowed to know
// which blocks are which, so it has to be a constant amount of time. 
// This may lead to odd behavior around unusually quickly- or slowly-mined blocks,
// which is unfortunately unavoidable. Err on the side of caution.
const blockMineTicks = 10

// Blocks that the bot is allowed to place down out of your hotbar, in case
// it falls. If no blocks are allowed, bot will always quit upon falling.
const placeableBlocks = ["minecraft:cobbled_deepslate","minecraft:deepslate",
"minecraft:calcite","minecraft:tuff","minecraft:cobblestone","minecraft:stone",
"minecraft:diorite","minecraft:andesite","minecraft:granite","minecraft:prismarine",
"minecraft:dripstone_block","minecraft:raw_gold","minecraft:raw_iron","minecraft:redstone","minecraft:lapis_lazuli"]

// The number of layers of tunnel the bot should mine before terminating.
const layersToMine = 500

// If this is set to true, the bot will place chests from the hotbar and fill them
// up when its inventory is full. If the bot cannot find a chest in the hotbar, it
// will terminate.
// If this is set to false, the bot will not place chests, and may lose mining
// products once its hotbar is full.
const doChestItems = false

// Enter "fabric" or "forge". This distinction determines which version of the
// grabMouse() function is run, as this function is sensitive to version (specifically,
// deobfuscated function naming schemes).
const version = "fabric"

// If this key is pressed at any time, the bot will immediately terminate.
const abortKey = "s"

/////////////////////////////////////////////////////////////////////////////////////////

// Tracking variables - DO NOT CHANGE
shouldTerminate = false // When this variable is set to true, the bot stops
const p = Player.getPlayer()
const facing = getFacing(orientation) // N, E, S, W
const targetFeetY = getY() // Record starting tunnel height to correct deviations later

// Main function. Validates pattern, then alternates mineOneLayer() and transition()
// calls layersToMine times, unless shouldTerminate is set to true.
function mine() {
    // Validate pattern
    if (validatePattern() && !shouldTerminate) {
        chatLog("Starting tunnel job for " + layersToMine + " layers.")
        // Alternate mineOneLayer() and transition(), check for bot termination
        for (iter = 0; iter < layersToMine; iter++) {
            mineOneLayer() // mine the next layer
            if (shouldTerminate) {break} // check for bot termination
            transition() // transition to the next layer
            if (shouldTerminate) {break} // check for bot termination
            
            // Send success message if end has been reached
            if (iter == layersToMine - 1) {
                Chat.actionbar("\u00A79Finished tunnel job", false)
                chatLog("Finished tunnel job.")
                shouldTerminate = true
            }
        }
    }
    // Disable all keys when bot terminates
    KeyBind.keyBind("key.attack", false)
    KeyBind.keyBind("key.use", false)
    KeyBind.keyBind("key.forward", false)
    KeyBind.keyBind("key.jump", false)
}

// Function to handle transtioning from mining one layer to mining the next layer.
// This function should be called between mineOneLayer() calls in order to put the
// player in the right position to start mining more.        
function transition() {
    // There are eight directions the bot may need to move in. Unfortunately,
    // there are conditionals for all of them.
    // Pray there is not a bug here.
    if (orientation == "north") {
        goTo(getX() + 0.5, targetFeetY, getZ() - 0.7)
    }
    if (orientation == "northeast-facenorth" || orientation == "northeast-faceeast") {
        goTo(getX() + 1.7, targetFeetY, getZ() - 0.7)
    }
    if (orientation == "east") {
        goTo(getX() + 1.7, targetFeetY, getZ() + 0.5)
    }
    if (orientation == "southeast-faceeast" || orientation == "southeast-facesouth") {
        goTo(getX() + 1.7, targetFeetY, getZ() + 1.7)
    }
    if (orientation == "south") {
        goTo(getX() + 0.5, targetFeetY, getZ() + 1.7)
    }
    if (orientation == "southwest-facesouth" || orientation == "southwest-facewest") {
        goTo(getX() - 0.7, targetFeetY, getZ() + 1.7)
    }
    if (orientation == "west") {
        goTo(getX() - 0.7, targetFeetY, getZ() + 0.5)
    }
    if (orientation == "northwest-facewest" || orientation == "northwest-facenorth") {
        goTo(getX() - 0.7, targetFeetY, getZ() - 0.7)
    }
}

// Function that mines a "layer" of the tunnel - IE, mines the pattern once in the
// right direction. Function assumes that player is in the right position, so
// be wary of drift.
function mineOneLayer() {
    // Runs a special function to grab the mouse, in order to prevent issues with
    // mouse handling. Sensitive to which JsMacros version (fabric or forge) the 
    // player is using. 
    // Credit for this function is given at its definition.
    grabMouse()
    // Make sure we are holding pickaxe
    grabPickaxe()
    // Mine top-down, center-out, to minimize problems from unpredicted circumstances.
    for (const i of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
        for (j = 3; j >= 0; j--) {
            mineBlock(i, j)
            checkTool() // check that tool is not almost broken
            checkManualAbort() // check if player wants to abort the bot
            if (shouldTerminate) {break} // check for bot termination
        }
        if (shouldTerminate) {break} // check for bot termination
    }
    // If bot is meant to chest items when inventory is full, and inventory
    // is indeed full, chest items before moving on.
    if (!shouldTerminate && doChestItems && isInvFull()) { chestItems() }
}

// Automatically determines mining style ("front" or "center") based on adjacent
// pattern blocks, then forwards this function request to the main mineBlockStyled
// function.
function mineBlock(leftright, updown) {
    // This function does nothing at all (and takes up no time) if the specified
    // block is not meant to be mined
        if (shouldMine(leftright, updown)) {
        // If the block is on the left and the block to the left of it is not
        // to be mined, look at center, otherwise front
        if (leftright < 0) {
            if (shouldMine(leftright-1, updown)) {
                mineBlockStyled(leftright, updown, "front")
            } else {
                mineBlockStyled(leftright, updown, "side")
            }
        }
        // If the block is on the right and the block to the right of it is not
        // to be mined, look at center, otherwise front
        else if (leftright > 0) {
            if (shouldMine(leftright+1, updown)) {
                mineBlockStyled(leftright, updown, "front")
            } else {
                mineBlockStyled(leftright, updown, "side")
            }
        }
        // If the block is in the center column, just look at the front
        else {
            mineBlockStyled(leftright, updown, "front")
        }
    }
}

// Mine a single specified block in the pattern. Assumes player is in the right 
// position. 
// The style argument should be either "front", "center", or "side", which determines
// which part of the block is looked at (to make it easier to avoid accidentally 
// mining another block in front of the intended one).
// This function is separated in order to quarantine the ugly direction
// conditional handling.
// This function assumes that the pattern block provided is meant to be mined, in order
// to save on runtime (a shouldMine() check should happen *before* this is called).
function mineBlockStyled(leftright, updown, style) {
    // Initializing the variables which will be set to the actual absolute
    // coordinates of the block to be mined. y can be determined immediately,
    // x and z are initialized as 0 by default (this will be changed later on).
    x = 0
    y = getY() + updown + 0.5 // Look at the middle of the block, not the bottom
    z = 0
    
    // Depending on the orientation of the pattern, the translation from
    // relative to absolute coordinates varies. These conditionals handle
    // that
    // The extra additions on the end are to make it so you look at the
    // "front" face of the block, to prevent accidentally looking behind
    // other blocks and mining them instead.
    // If there is a bug here, woe be upon ye.
    
    // "front" style - look at the front of the block (IE the face open
    // towards the already-dug portions of the tunnel)
    if (style == "front") {
        if (facing == "N") {
            x = getX() + leftright   + 0.5
            z = getZ() - 1           + 0.99
        }
        if (facing == "E") {
            x = getX() + 1           + 0.01
            z = getZ() + leftright   + 0.5
        }
        if (facing == "S") {
            x = getX() - leftright   + 0.5
            z = getZ() + 1           + 0.01
        }
        if (facing == "W") {
            x = getX() - 1           + 0.99
            z = getZ() - leftright   + 0.5
        }
    } 
    // "center" style - look at the center of the block
    else if (style == "center") {
        if (facing == "N") {
            x = getX() + leftright   + 0.5
            z = getZ() - 1           + 0.5
        }
        if (facing == "E") {
            x = getX() + 1           + 0.5
            z = getZ() + leftright   + 0.5
        }
        if (facing == "S") {
            x = getX() - leftright   + 0.5
            z = getZ() + 1           + 0.5
        }
        if (facing == "W") {
            x = getX() - 1           + 0.5
            z = getZ() - leftright   + 0.5
        }
    } 
    // "side" style - look at the side of the block (IE the side facing
    // towards the center of the current layer (calculating this is *terrible*))
    else if (style == "side") {
        if (facing == "N") {
            if (leftright > 0) {
                x = getX() + leftright   + 0.01
                z = getZ() - 1           + 0.5
            }
            if (leftright < 0) {
                x = getX() + leftright   + 0.99
                z = getZ() - 1           + 0.5
            }
        }
        if (facing == "E") {
            if (leftright > 0) {
                x = getX() + 1           + 0.5
                z = getZ() + leftright   + 0.01
            }
            if (leftright < 0) {
                x = getX() + 1           + 0.5
                z = getZ() + leftright   + 0.99
            }
        }
        if (facing == "S") {
            if (leftright > 0) {
                x = getX() - leftright   + 0.99
                z = getZ() + 1           + 0.5
            }
            if (leftright < 0) {
                x = getX() - leftright   + 0.01
                z = getZ() + 1           + 0.5
            }
        }
        if (facing == "W") {
            if (leftright > 0) {
                x = getX() - 1           + 0.5
                z = getZ() - leftright   + 0.99
            }
            if (leftright < 0) {
                x = getX() - 1           + 0.5
                z = getZ() - leftright   + 0.01
            }
        }
    } 
    else {
        chatError("Cannot mine block with style \"" + style + "\". Terminating.")
        shouldTerminate = true // Something is wrong, bot should terminate
    }
    
    // Actually mine the block
    Chat.actionbar("\u00A79Mining block at \u00A7f" + Math.floor(x) 
                   + "\u00A79,\u00A7f" + Math.floor(y) + "\u00A79,\u00A7f" 
                   + Math.floor(z), false) // Log in actionbar
    p.lookAt(x, y, z)
    KeyBind.keyBind("key.attack", true)
    Client.waitTick(blockMineTicks)
    KeyBind.keyBind("key.attack", false)
}

// Walks the player straight and exactly towards the given coordinates in x and z.
// Then calls correctElevation() in case player deviated from intended y.
// y should be an integer, x, and z can be whatever.
function goTo(x, y, z) {
    if (shouldTerminate) {return}
    // Continue walking until within 0.05 of intended coordinates
    while (Math.abs(p.getPos().x - x) > 0.05
        || Math.abs(p.getPos().z - z) > 0.05) {
        // Look straight at intended x and z, at eye level
        p.lookAt(x, (p.getPos().y+1.62), z)
        KeyBind.keyBind("key.forward", true)
        Chat.actionbar("\u00A79Walking to \u00A7f" + x  + "\u00A79,\u00A7f" + y 
                       + "\u00A79,\u00A7f" + z, false) // Log in actionbar
        checkManualAbort() // check if player wants to abort the bot
        if (shouldTerminate) {break} // check for bot termination
        Client.waitTick(1)
    }
    KeyBind.keyBind("key.forward", false) // stop walking
    
    Client.waitTick(10) // kill momentum before potentially jumping

    // If the player is not at the intended y level, correct this. Then run goTo
    // on these same coordinates again, to make sure that x and z were not disrupted
    // in the process of y correction (which can happen).
    if (getY() != y) {
        correctElevation(y)
        goTo(x, y, z)
    }
}

// Function to correct if player has deviated from intended Y.
// If player is too low, it columns up (unless it runs out of blocks).
// If player is too high, it digs down.
// This function assumes that targetY is an integer.
function correctElevation(targetY) {
    if (shouldTerminate) {return}
    // TOO LOW case
    if (getY() < targetY) {
        // Continue until at right y level or out of placeable blocks
        while (getY() < targetY && grabPlaceableBlock()) {
            Chat.actionbar("\u00A79Correcting elevation. \u00A7f" + getY() 
                           + " \u00A79-> \u00A7f" + targetY, false) // Log in actionbar
            // Look down
            p.lookAt(0, 90)
            // Column up
            KeyBind.keyBind("key.use", true)
            KeyBind.keyBind("key.jump", true)
            checkManualAbort() // check if player wants to abort the bot
            if (shouldTerminate) {break} // check for bot termination
            Client.waitTick(2)
        }
        // End
        Client.waitTick(5) // Delay to place final block
        KeyBind.keyBind("key.use", false)
        KeyBind.keyBind("key.jump", false)
        if (getY() == targetY) { 
            Chat.actionbar("\u00A79Elevation corrected.", false) // Log in actionbar
        } else {
            chatError("Failed to correct elevation. Terminating.")
            shouldTerminate = true // If elevation correction has failed, bot terminates
            World.playSound("entity.ghast.scream", 50, 0);
        }
    }
    
    // TOO HIGH case
    if (getY() > targetY) {
        // Continue until at right y level or out of placeable blocks
        while (getY() > targetY) {
            Chat.actionbar("\u00A79Correcting elevation. \u00A7f" + getY() 
                           + " \u00A79-> \u00A7f" + targetY, false) // Log in actionbar
            // Look down
            p.lookAt(0, 90)
            // Dig down
            KeyBind.keyBind("key.attack", true)
            checkManualAbort() // check if player wants to abort the bot
            if (shouldTerminate) {break} // check for bot termination
            Client.waitTick(2)
        }
        // End
        KeyBind.keyBind("key.attack", false)
        if (getY() == targetY) { 
            Chat.actionbar("\u00A79Elevation corrected.", false) // Log in actionbar
        } else {
            chatError("Failed to correct elevation. Terminating.")
            shouldTerminate = true // If elevation correction has failed, bot terminates
        }
    }
}

// Function to deposit items into chest
function chestItems() {
    // List of mining products the bot will deposit.
    depositableItems= ["minecraft:cobbled_deepslate","minecraft:deepslate",
    "minecraft:calcite","minecraft:tuff","minecraft:cobblestone","minecraft:stone",
    "minecraft:diorite","minecraft:andesite","minecraft:granite","minecraft:coal",
    "minecraft:redstone",
    "minecraft:lapis_lazuli","minecraft:diamond","minecraft:raw_copper",
    "minecraft:prismarine_shard","minecraft:coal_ore","minecraft:copper_ore",
    "minecraft:gold_ore","minecraft:redstone_ore","minecraft:lapis_ore",
    "minecraft:diamond_ore","minecraft:deepslate_coal_ore",
    "minecraft:deepslate_copper_ore","minecraft:deepslate_gold_ore",
    "minecraft:deepslate_redstone_ore","minecraft:deepslate_lapis_ore",
    "minecraft:deepslate_diamond_ore","minecraft:iron_ore",
    "minecraft:deepslate_iron_ore","minecraft:magma_block","minecraft:prismarine",
    "minecraft:dripstone_block","minecraft:smooth_basalt"]
    
    // Log actions
    chatLog("Inventory is full. Depositing items in chest.")
    
    // Go back a block, so the chest isn't in the way
    if (orientation == "north") {
        goTo(getX() + 0.5, targetFeetY, getZ() + 1.5)
    }
    if (orientation == "northeast-facenorth" || orientation == "northeast-faceeast") {
        goTo(getX() - 0.5, targetFeetY, getZ() + 1.5)
    }
    if (orientation == "east") {
        goTo(getX() - 0.5, targetFeetY, getZ() + 0.5)
    }
    if (orientation == "southeast-faceeast" || orientation == "southeast-facesouth") {
        goTo(getX() - 0.5, targetFeetY, getZ() - 0.5)
    }
    if (orientation == "south") {
        goTo(getX() + 0.5, targetFeetY, getZ() - 0.5)
    }
    if (orientation == "southwest-facesouth" || orientation == "southwest-facewest") {
        goTo(getX() + 1.5, targetFeetY, getZ() - 0.5)
    }
    if (orientation == "west") {
        goTo(getX() + 1.5, targetFeetY, getZ() + 0.5)
    }
    if (orientation == "northwest-facewest" || orientation == "northwest-facenorth") {
        goTo(getX() + 1.5, targetFeetY, getZ() + 1.5)
    }    
    // Grab a chest
    grabChest()
    if (shouldTerminate) {return}
    // Look down
    p.lookAt(0, 90)
    // Jump up and place chest
    KeyBind.keyBind("key.jump", true)
    KeyBind.keyBind("key.sneak", true)
    KeyBind.keyBind("key.use", true)
    Client.waitTick(7)
    grabPickaxe()
    KeyBind.keyBind("key.jump", false)
    KeyBind.keyBind("key.use", false)
    KeyBind.keyBind("key.sneak", false)
    // Right click
    Client.waitTick(10)
    KeyBind.keyBind("key.use", true)
    Client.waitTick(2)
    KeyBind.keyBind("key.use", false)
    Client.waitTick(10)
    // Deposit items
    for (let v = 27; v <= 62; v++) { // Loop over whole inventory
        if (depositableItems.includes(Player.openInventory().getSlot(v).getItemId())) {
            // Transfer depositable items to chest
            Player.openInventory().quick(v) 
        }
        Client.waitTick(1)
    }
    Player.openInventory().close()
    Client.waitTick(10)
}

// Function that returns whether or not the inventory is full
function isInvFull() {
    toReturn = true
    let inv = Player.openInventory()
    for (let v = 9; v <= 44; v++) { // Loop over whole inventory
        if (inv.getSlot(v).getItemId() == "minecraft:air") { // Check if there is any air
            toReturn = false
        }
    }
    return toReturn
}

// Function that translates one of the 12 orientations into one of the 4 pattern
// facing directions (just N, E, S, or W)
function getFacing(orientation) {
    // Condense three orientations to one
    if (orientation == "north" 
     || orientation == "northeast-facenorth" 
     || orientation == "northwest-facenorth") {
        return "N"
    }
    else if (orientation == "east" 
     || orientation == "northeast-faceeast" 
     || orientation == "southeast-faceeast") {
        return "E"
    }
    else if (orientation == "south" 
     || orientation == "southeast-facesouth" 
     || orientation == "southwest-facesouth") {
        return "S"
    }
    else if (orientation == "west" 
     || orientation == "southwest-facewest" 
     || orientation == "southwest-facewest") {
        return "W"
    }
    // Filter for invalid orientation
    else {
        chatError("\"" + orientation + "\" is not a valid orientation.")
        chatError("Valid orientations are: \"north\", \"northeast-facenorth\", \"northeast-faceeast\", \"east\", \"southeast-faceeast\", \"southeast-facesouth\", \"south\", \"southwest-facesouth\", \"southwest-facewest\", \"west\", \"northwest-facewest\", \"northwest-facenorth\".")
        shouldTerminate = true // terminate the bot
        return "."
    }
}

// Function to get whether a block in the pattern should be mined or not.
// "Coordinates" are in the pattern, and are orientation-agnostic (IE this
// function solely draws information from the PATTERN TO MINE section at the
// top).
function shouldMine(leftright, updown) {
    // Filter invalid "coordinates"
    if (Math.abs(leftright) > 4 || updown > 3 || updown < 0) {
        return false
    } 
    // Return whether the specified section of the pattern is meant to be mined
    else {
        if (updown == 3) {
            return feetplus3.charAt(leftright + 4) == "O"
        }
        if (updown == 2) {
            return feetplus2.charAt(leftright + 4) == "O"
        }
        if (updown == 1) {
            return feetplus1.charAt(leftright + 4) == "O"
        }
        if (updown == 0) {
            return feetplus0.charAt(leftright + 4) == "O"
        }
    }
}

// Function that checks if the player's tool is almost broken, and terminates
// the bot (via shouldTerminate = true) if so.
function checkTool() {
    if (Chat.getHistory().getRecvLine(0).getText().getString() 
    == "Your tool is almost broken") {
        shouldTerminate = true
        chatError("Tool durability low. Terminating.")
        World.playSound("entity.ghast.scream", 50, 0);
    }
}

// Function that checks if the player is pressing the abort key, and terminates
// the bot (via shouldTerminate = true) if so.
function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        shouldTerminate = true
        chatLog("Player has pressed abort key. Terminating.")
    }
}

// Function that searches through the hotbar for a block that can be placed down
// (IE nothing valuable)
function grabPlaceableBlock() {
    // Has the bot found a placeable block yet?
    blockFound = false
    // Loop through hotbar, stop if end reached or block is found
    let inv = Player.openInventory()
    for (i = 0; i <= 8 && !blockFound; i++) {
        // If a placeable block is found in the hotbar, select it and terminate loop
        if (placeableBlocks.includes(inv.getSlot(i+36).getItemId())) {
            blockFound = true
            inv.setSelectedHotbarSlotIndex(i);
        }
    }
    if (!blockFound) {
        chatError("Could not find placeable block in hotbar.")
    }
    // if no block was found, bot needs to terminate
    if (!shouldTerminate) {shouldTerminate = !blockFound} 
    // Return whether or not a block was found
    return blockFound
}

// Function that searches through the hotbar for a pickaxe to be used in mining
// the tunnel (diamond or netherite).
function grabPickaxe() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:diamond_pickaxe", "minecraft:netherite_pickaxe"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    for (i = 0; i <= 8 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())&&inv.getSlot(i+36).getDamage()<1510) {
            pickFound = true
            inv.setSelectedHotbarSlotIndex(i);
        }
    }
    if (!pickFound) {
        chatError("Could not find pickaxe in hotbar. Terminating.")
    }
    // if no pickaxe was found, bot needs to terminate
    if (!shouldTerminate) {shouldTerminate = !pickFound} 
    // Return whether or not a pickaxe was found
    return pickFound
}

// Function that searches through the hotbar for a chest to place
function grabChest() {
    // Has the bot found a chest yet?
    chestFound = false
    // Loop through hotbar, stop if end reached or chest is found
    let inv = Player.openInventory()
    for (i = 0; i <= 8 && !chestFound; i++) {
        // If a chest is found in the hotbar, select it and terminate loop
        if (inv.getSlot(i+36).getItemId() == "minecraft:chest") {
            chestFound = true
            inv.setSelectedHotbarSlotIndex(i);
        }
    }
    if (!chestFound) {
        chatError("Could not find chest in hotbar. Terminating.")
    }
    // if no chest was found, bot needs to terminate
    if (!shouldTerminate) {shouldTerminate = !chestFound} 
    // Return whether or not a chest was found
    return chestFound
}

// Literally just chat logs an example mining pattern, in case a bot user is confused
// as to how to set one. This is string monkeying, so it is quarantined here.
function chatPatternExample() {
    Chat.log("           \u00A76const \u00A7ffeetplus3 = \u00A72\""
             + "\u00A78XXX\u00A77OOO\u00A78XXX\u00A72\"")
    Chat.log("           \u00A76const \u00A7ffeetplus2 = \u00A72\""
             + "\u00A78XX\u00A77OOOOO\u00A78XX\u00A72\"")
    Chat.log("           \u00A76const \u00A7ffeetplus1 = \u00A72\""
             + "\u00A78XX\u00A77OOOOO\u00A78XX\u00A72\"")
    Chat.log("           \u00A76const \u00A7ffeetplus0 = \u00A72\""
             + "\u00A78XX\u00A77OOOOO\u00A78XX\u00A72\"")
}

// Returns true if the pattern is valid, false otherwise
function validatePattern() {
    toReturn = true
    if (toReturn) {
        // Is the pattern of the right dimensions?
        if (feetplus3.length != 9 || feetplus2.length != 9 || feetplus1.length !=9 || feetplus0.length !=9) {
            chatError("Mining pattern must be recorded in a 9x4 grid, example:")
            chatPatternExample()
            toReturn = false
        } 
    }
    if (toReturn) {
        // Does the pattern consist only of Xs and Os?
        for (c = 0; c < 9; c++) {
            if (feetplus3.charAt(c) != "X" && feetplus3.charAt(c) != "O") {
                toReturn = false
            }
            if (feetplus2.charAt(c) != "X" && feetplus2.charAt(c) != "O") {
                toReturn = false
            }
            if (feetplus1.charAt(c) != "X" && feetplus1.charAt(c) != "O") {
                toReturn = false
            }
            if (feetplus0.charAt(c) != "X" && feetplus0.charAt(c) != "O") {
                toReturn = false
            }
        }
        if (!toReturn) {
            chatError("Mining pattern must consist only of \"X\" and \"O\", example:")
            chatPatternExample()
        }
    }
    return toReturn
}

// Function that grabs ahold of the mouse in order to avoid an issue with resuming
// mining after depositing inventory into a chest. 
// Due to different class naming schemes, Fabric and Forge require slightly different
// functions. Code is duplicated rather than abstracted for clarity.
// Credit Hampus Toft#2389 for writing original function.
// Credit citylion for updating function for forge.
// Credit Gjum for updating function for fabric.
function grabMouse() {
    // Run function with forge mappings if player version is forge
    if (version == "forge") {
        // Client Class
        let minecraftClass = Reflection.getClass("net.minecraft.client.Minecraft");
        // Mouse Handler Field
        let mouseHandlerField = Reflection.getDeclaredField(minecraftClass, "f_91067_");
        mouseHandlerField.setAccessible(true);
        //Use reflection to grab mouse:
        let clientInstance = Client.getMinecraft();
        // Mouse Handler
        let mouseHandlerObj = mouseHandlerField.get(clientInstance);
        // Mouse Handler Class
        let mouseClass = Reflection.getClass("net.minecraft.client.MouseHandler");
        // Lock Mouse / grab Mouse Boolean Field
        let lockMouse = Reflection.getDeclaredField(mouseClass, "f_91520_");
        lockMouse.setAccessible(true);
        // Grab mouse
        lockMouse.setBoolean(mouseHandlerObj, true);
    }
    // Run function with fabric mappings if player version is fabric
    else if (version == "fabric") {
        // Client Class
        let minecraftClass = Reflection.getClass("net.minecraft.class_310");
        // Mouse Handler Field
        let mouseHandlerField = Reflection.getDeclaredField(minecraftClass, "field_1729");
        mouseHandlerField.setAccessible(true);
        //Use reflection to grab mouse:
        let clientInstance = Client.getMinecraft();
        // Mouse Handler
        let mouseHandlerObj = mouseHandlerField.get(clientInstance);
        // Mouse Handler Class
        let mouseClass = Reflection.getClass("net.minecraft.class_312");
        // Lock Mouse / grab Mouse Boolean Field
        let lockMouse = Reflection.getDeclaredField(mouseClass, "field_1783");
        lockMouse.setAccessible(true);
        // Grab mouse
        lockMouse.setBoolean(mouseHandlerObj, true);
    }
    // Player has not specified a valid version, abort
    else {
        chatError("Invalid JsMacros version \"" + version + "\".")
        shouldTerminate = true
        return
    }
}

// Simple getter functions for rounded player coordinates
function getX() {
    return Math.floor(p.getPos().x)
}
function getY() {
    return Math.floor(p.getPos().y)
}
function getZ() {
    return Math.floor(p.getPos().z)
}

// Standardized logging format; messages are white text, errors are red text
function chatLog(message) {
    Chat.log("\u00A79\u00A7lTunnel Bot: \u00A7r" + message)
}
function chatError(errorMessage) {
    Chat.log("\u00A79\u00A7lTunnel Bot: \u00A7r\u00A7c" + errorMessage)
}

// Call main function
mine()
