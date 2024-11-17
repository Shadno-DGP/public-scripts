
const p = Player.getPlayer()

const abortKey = "s"

groupname = "shadnobot"
discordID = "96706920664006656"

minFoodLevel = 14
mainSlot = 1

minZ = -5530
maxZ = -5422

minX = -2338
maxX = -2218

botMode = "mainSouth"

/* Bot Requirements:

Sufficient Diamond Axes
Sufficient Spruce Saplings
Sufficient Food 

Starting:

Start on any row of the farm
Hold AbortKey to terminate

Recommended to type /ctb prior to starting to avoid any bugs breaking blocks in the farm

*/






mainSlot = mainSlot+35
function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        Chat.log("Player has pressed abort key. Terminating.")
        terminateReason = "Player has pressed abort key."
        botMode = "terminate"
    }
}

function chopSouth()
{
        dropWood()
        Chat.log("ChopSouth")
        grabAxe()
        attemptwalk = 0
        p.lookAt(-35,60)
        Time.sleep(500)
        p.lookAt(0,0)
        Time.sleep(1000)
        targetFeetZ = getZ()
        feetZGoal = targetFeetZ + 1;
        while (targetFeetZ < feetZGoal)
        {
            KeyBind.keyBind("key.forward", true)
            Time.sleep(5)
            targetFeetZ = getZ()
            KeyBind.keyBind("key.forward", false)
            attemptwalk++;
            if (attemptwalk > 600)
            {
                feetZGoal = targetFeetZ;
                attemptwalk = 0
            }
        }

    p.lookAt(0,-90)
    Time.sleep(2500)

    p.lookAt(0,90)
    KeyBind.keyBind("key.attack", false);
    grabSapling()
    KeyBind.keyBind("key.use", true);
    Time.sleep(300)
    KeyBind.keyBind("key.use", false);

    p.lookAt(0,0)
}

function checkFell() {
    y = getY()
    if (y < 72)
    {
        terminateReason = "bot fell"
        botMode = "terminate"
    }
}

function dropWood() {
    p.lookAt(-133,60)
    depositableItems= ["minecraft:spruce_log","minecraft:stick","minecraft:spruce_leaves"]
    for (let v = 10; v <= 45; v++) { // Loop over whole inventory
        while (depositableItems.includes(Player.openInventory().getSlot(v).getItemId())) {
            //Player.openInventory().dropSlot(v)
            Time.sleep(30)
            const inv = Player.openInventory();
            inv.click(v);
            inv.click(-999)
        }
    }
}


function getX() 
{
    return Math.floor(p.getPos().x)
}

function getY() 
{
    return Math.floor(p.getPos().y)
}

function getZ() 
{
    return Math.floor(p.getPos().z)
}

function checkRowEnd() {
    z = getZ()
    if (z >= maxZ && botMode == "mainSouth")
    {
        KeyBind.keyBind("key.forward", false)
        Chat.log("ROW ENDED")
        botMode = "mainNorth"
    }
}

function checkRowStart() {
    z = p.getPos().z
    if (z <= minZ)
    {
        while (z > -5533.5)
        {
            KeyBind.keyBind("key.forward", true)
            KeyBind.keyBind("key.sneak", true)
            Time.sleep(10)
            z = p.getPos().z
        }
        p.lookAt(-90,0)
        x = getX()
        x4 = x+4
        while (x < x4)
        {
            KeyBind.keyBind("key.forward", true)
            KeyBind.keyBind("key.sneak", true)
            Time.sleep(10)
            x = getX()
        }
        KeyBind.keyBind("key.sneak", false)
        x = getX()
        if (x >= maxX)
        {
            terminateReason = "end of farm"
            botMode = "terminate"
        }
        else
        {
           botMode = "mainSouth" 
        }
        
    }
}

function checkMove() {
    move = true
    x = p.getPos().x
    z = p.getPos().z
    Time.sleep(600)
    x2 = p.getPos().x
    z2 = p.getPos().z
    if (x == x2 && z == z2)
    {
        move = false
    }
    
}

function grabAxe() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:diamond_axe"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    

    for (i = 0; i <= 9 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())&&inv.getSlot(i+36).getDamage()<1510) {
                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
        }
    }
    for (i = 9; i <= 34 && !pickFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a pickaxe block is found in the inventory, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i).getItemId())&&inv.getSlot(i).getDamage()<1510) {

                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
            
            pickFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!pickFound) {
        terminateReason = 'Could not find shears in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}


function grabSapling() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:spruce_sapling"]
    // Has the bot found a pickaxe yet?
    pickFound = false
    // Loop through hotbar, stop if end reached or pickaxe is found
    let inv = Player.openInventory()
    
    for (i = 0; i <= 9 && !pickFound; i++) {
        // If a pickaxe is found in the hotbar, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i+36).getItemId())) {
                pickFound = true
                inv.setSelectedHotbarSlotIndex(i);
        }
    }
    for (i = 9; i <= 34 && !pickFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a pickaxe block is found in the inventory, select it and terminate loop
        if (pickaxeItems.includes(inv.getSlot(i).getItemId())) {

            pickFound = true
            inv.setSelectedHotbarSlotIndex(i);
            
            pickFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!pickFound) {
        terminateReason = 'Could not find shears in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}

validFood = ['minecraft:bread',"minecraft:cooked_porkchop","minecraft:cooked_mutton","minecraft:cooked_salmon","minecraft:cooked_beef",
"minecraft:baked_potato","minecraft:melon_slice","minecraft:carrot","minecraft:cooked_chicken","minecraft:cooked_cod",
"minecraft:cooked_rabbit","minecraft:cookie","minecraft:potato","minecraft:pumpkin_pie","minecraft:glow_berries","minecraft:tropical_fish"
,"minecraft:sweet_berries","minecraft:golden_carrot"]

function grabFood() {
    // Has the bot found a placeable block yet?
    foodFound = false
    // Loop through hotbar, stop if end reached or block is found
    let inv = Player.openInventory()
    for (i = 0; i <= 9 && !foodFound; i++) { //Patar15 was here 12/27/2023 Now checks off hand for food
        // If a placeable block is found in the hotbar, select it and terminate loop
        if (validFood.includes(inv.getSlot(i+36).getItemId())) {
            foodFound = true
            inv.setSelectedHotbarSlotIndex(i);
        }
    }
        for (i = 9; i <= 34 && !foodFound; i++) {//Patar15 was here 12/27/2023 Now checks off hand for block
        // If a placeable block is found in the inventory, select it and terminate loop
        if (validFood.includes(inv.getSlot(i).getItemId())) {
            foodFound = true
            inv.swap(i,mainSlot)
        }
    }
    if (!foodFound) {
        teminateReason = 'Could not find validFood in inventory.'//Patar15 was here 12/27/2023
        botMode = "terminate"
    }
}





function eatCheck(){
if (p.getFoodLevel() < minFoodLevel) {
            KeyBind.keyBind("key.attack", false);
            Chat.log("Food level low, auto eating");
            grabFood()
            Client.waitTick(10);
            KeyBind.keyBind("key.use", true);
            Client.waitTick(33);
            KeyBind.keyBind("key.use", false);
            KeyBind.keyBind("key.attack", true);
        }
}



function face() {
    if (botMode == "MainSouth")
    {
        p.lookAt(0,0)
    }

    if (botMode == "MainNorth")
    {
        p.lookAt(180,0)
    }
}

function tickSouth()
{
    p.lookAt(0,0)
    grabAxe()
    KeyBind.keyBind("key.forward", true)
    KeyBind.keyBind("key.attack", true)
    checkMove()
    Chat.log("MAAAAAIN")
    if (move == false)
    {
        KeyBind.keyBind("key.forward", false)
        chopSouth()
        Chat.log("CHOOOP")
    }
}

function tickNorth()
{
    p.lookAt(180,0)
    KeyBind.keyBind("key.forward", true)
    KeyBind.keyBind("key.attack", false)
    checkRowStart()
}


function Tick()
{
    checkFell()
    checkRowEnd()
    Time.sleep(100)
    checkManualAbort()
    eatCheck()
    if (botMode == "mainSouth")
    {
        tickSouth()
    }
    if (botMode == "mainNorth")
    {
        tickNorth()
    }
}


while (botMode != "terminate")
{
    Tick()
    Time.sleep(10)
}

if (botMode = "terminate")
{
    KeyBind.keyBind("key.forward", false);
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sneak", false);
    KeyBind.keyBind("key.use", false);
    
    if (terminateReason != "Player has pressed abort key.")
    {
        Chat.say("/logout")
        Chat.say("/g " + groupname + " shadnobot")//Patar15 was here 12/27/2023
        Chat.say("/g "+ groupname + " <@" + discordID + "> bot terminated. Reason: " + terminateReason)//Patar15 was here 12/27/2023
    }
    if (terminateReason = "Player has pressed abort key.")
    {
        Chat.log("Bot manually terminated")
    }
    World.playSound("entity.ghast.scream", 100, 0);
}
