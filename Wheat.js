
const p = Player.getPlayer()
const abortKey = "s"
minFoodLevel = 14
mainSlot = 1


// config vars
xMin = -4575 // Western boundary of farm
zMin = -4904 // Northern boundary of farm
// northwest

xMax = -4428 // Eastern boundary of farm
zMax = -4797 // Southern boundary of farm


botMode = "mainEast"


centerBot()
face()

function Tick()
{
    if (botMode == "mainWest")
    {
        //smooth_turn(90,15)
        //p.lookAt(90,15)
        checkRowEnd()
    }
    if (botMode == "mainEast")
    {
        //smooth_turn(-90,15)
        //p.lookAt(-90,15)
        checkRowStart()
    }
    checkManualAbort()
    eatCheck()
    Time.sleep(100)
    KeyBind.keyBind("key.forward", true);
    KeyBind.keyBind("key.use", true);
}


while (botMode != "terminate")
{
    Tick()
    Time.sleep(10)
}


function checkRowEnd() {
    x = getX()
    if (x < xMin && botMode == "mainWest")
    {
        KeyBind.keyBind("key.forward", true)
        Chat.log("ROW ENDED")
        dropSeeds()
        smooth_turn(0,0)
        //p.lookAt(0,0)
        z = p.getPos().z
        z1 = z + 1

        centerBotGoal(x,z1)

        z = p.getPos().z
        if (z >= zMax)
        {
            terminateReason = "end of farm"
            botMode = "terminate"
        }
        else
        {
           botMode = "mainEast" 
        }
        botMode = "mainEast"
        centerBot()
        face()
    }
}

function centerBotGoal(x,z) 
{
    Chat.log("centering on goal")
    KeyBind.keyBind("key.attack", false);
    KeyBind.keyBind("key.sprint", false);
    centerAttempt = 0
    do {
        KeyBind.keyBind("key.sneak", true);
        KeyBind.keyBind("key.forward", true);
        Player.getPlayer().lookAt(x, Player.getPlayer().getY() + 1, z);
        Time.sleep(50)
        checkManualAbort()
        centerAttempt = centerAttempt + 1
        if (centerAttempt > 100)
        {
            KeyBind.keyBind("key.sneak", false)
            Time.sleep(300)
            KeyBind.keyBind("key.use", true)
            Time.sleep(100)
            KeyBind.keyBind("key.use", false)
            Time.sleep(300)
            KeyBind.keyBind("key.sneak", true)
        }
    } while (Math.abs(p.getX() - x) > 0.075 || Math.abs(p.getZ() - z) > 0.075 && botMode != "terminate")
    Chat.say("/cardinal")
    KeyBind.keyBind("key.forward", false);
    centerAttempt = 0
    KeyBind.keyBind("key.sneak", false);
    smooth_turn(90,15)
    Time.sleep(1000)
}



function checkRowStart() {
    x = p.getPos().x
    if (x > xMax)
    {
        Chat.log("E")
        Time.sleep(500)
        dropWheat()
        Time.sleep(500)
        smooth_turn(0,0)
        //p.lookAt(0,0)
        z = p.getPos().z
        z1 = z + 1

        centerBotGoal(x,z1)

        z = p.getPos().z
        if (z >= zMax)
        {
            terminateReason = "end of farm"
            botMode = "terminate"
        }
        else
        {
           botMode = "mainWest" 
        }
    }
}

function centerBot() 
{
    KeyBind.keyBind("key.attack", false);
    centerAttempt = 0
    x = Math.floor(p.getX())+.5
    z = Math.floor(p.getZ())+.5
    do {
        KeyBind.keyBind("key.sneak", true);
        KeyBind.keyBind("key.forward", true);
        Player.getPlayer().lookAt(x, Player.getPlayer().getY() + 1, z);
        Time.sleep(1)
        centerAttempt = centerAttempt + 1
        checkManualAbort()
        if (centerAttempt > 300)
        {
            KeyBind.keyBind("key.sneak", false);
            centerAttempt = 0
        }
    } while (Math.abs(Player.getPlayer().getX() - x) > 0.075 || Math.abs(Player.getPlayer().getZ() - z) > 0.075 && botMode != "terminate")
    KeyBind.keyBind("key.forward", false);
    centerAttempt = 0
    KeyBind.keyBind("key.sneak", false);
    Time.sleep(500)
}

function dropSeeds() {
    KeyBind.keyBind("key.forward", false)
    smooth_turn(180,-16)
    //p.lookAt(180,-16)
    depositableItems= ["minecraft:wheat_seeds"]
    for (let v = 10; v <= 45; v++) { // Loop over whole inventory
        while (depositableItems.includes(Player.openInventory().getSlot(v).getItemId())) {
            //Player.openInventory().dropSlot(v)
            Time.sleep(60)
            const inv = Player.openInventory();
            inv.click(v);
            inv.click(-999)
        }
    }
    KeyBind.keyBind("key.forward", true)
}

//FUNCTION TO TURN SMOOTHLY

function smooth_turn(resulting_yaw,resulting_pitch){
    KeyBind.keyBind("key.forward", false)
    let current_yaw = Math.round(p.getYaw()*10)/10;
    let current_pitch = Math.round(p.getPitch()*10)/10;
    p.lookAt(current_yaw, current_pitch);
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
    if(current_pitch>resulting_pitch+6){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_pitch-=5;
            current_pitch=Math.round(current_pitch*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch+6 >= current_pitch){
                break;
            }
        }
    }
    else if(current_pitch<resulting_pitch-6){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_pitch+=5;
            current_pitch=Math.round(current_pitch*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch-6 <= current_pitch){
                break;
            }
        }
    }

    if(current_yaw>resulting_yaw+6){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_yaw-=5;
            current_yaw=Math.round(current_yaw*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw<=resulting_yaw+6){
                break;
            }
        }
    }
    else if(current_yaw<resulting_yaw-6){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_yaw+=5;
            current_yaw=Math.round(current_yaw*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw>=resulting_yaw-6){
                break;
            }
        }
    }
    smooth_turn2(resulting_yaw,resulting_pitch)
}

//FUNCTION TO TURN SMOOTHLY

function smooth_turn2(resulting_yaw,resulting_pitch){
    KeyBind.keyBind("key.forward", false)
    let current_yaw = Math.round(p.getYaw()*10)/10;
    let current_pitch = Math.round(p.getPitch()*10)/10;
    p.lookAt(current_yaw, current_pitch);
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
    if(current_pitch>resulting_pitch+1){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_pitch-=1;
            current_pitch=Math.round(current_pitch*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch+1 >= current_pitch){
                break;
            }
        }
    }
    else if(current_pitch<resulting_pitch-1){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_pitch+=1;
            current_pitch=Math.round(current_pitch*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch-1 <= current_pitch){
                break;
            }
        }
    }

    if(current_yaw>resulting_yaw+1){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_yaw-=1;
            current_yaw=Math.round(current_yaw*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw<=resulting_yaw+1){
                break;
            }
        }
    }
    else if(current_yaw<resulting_yaw-1){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            //Client.waitTick();
            Time.sleep(20)
            current_yaw+=1;
            current_yaw=Math.round(current_yaw*10)/10;
            //Client.waitTick();
            Time.sleep(20)
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw>=resulting_yaw-1){
                break;
            }
        }
    }
    smooth_turn3(resulting_yaw,resulting_pitch)
}

//FUNCTION TO TURN SMOOTHLY3
function smooth_turn3(resulting_yaw,resulting_pitch){
    let current_yaw = Math.round(p.getYaw()*10)/10;
    let current_pitch = Math.round(p.getPitch()*10)/10;
    p.lookAt(current_yaw, current_pitch);
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
    if(current_pitch>resulting_pitch){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            Client.waitTick();
            current_pitch-=.1;
            current_pitch=Math.round(current_pitch*10)/10;
            Client.waitTick();
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch==current_pitch){
                break;
            }
        }
    }
    else if(current_pitch<resulting_pitch){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            Client.waitTick();
            current_pitch+=.1;
            current_pitch=Math.round(current_pitch*10)/10;
            Client.waitTick();
            p.lookAt(current_yaw, current_pitch);
            if(resulting_pitch==current_pitch){
                break;
            }
        }
    }

    if(current_yaw>resulting_yaw){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            Client.waitTick();
            current_yaw-=.1;
            current_yaw=Math.round(current_yaw*10)/10;
            Client.waitTick();
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw==resulting_yaw){
                break;
            }
        }
    }
    else if(current_yaw<resulting_yaw){
        while(true)
        {
            /*Chat.log(resulting_pitch);
            Chat.log(resulting_yaw);
            Chat.log(current_pitch);
            Chat.log(current_yaw);
            */
            Client.waitTick();
            current_yaw+=.1;
            current_yaw=Math.round(current_yaw*10)/10;
            Client.waitTick();
            p.lookAt(current_yaw, current_pitch);
            if(current_yaw==resulting_yaw){
                break;
            }
        }
    }

}

function dropWheat() {
    KeyBind.keyBind("key.forward", false)
    depositableItems= ["minecraft:wheat"]
    for (let v = 10; v <= 45; v++) { // Loop over whole inventory
        while (depositableItems.includes(Player.openInventory().getSlot(v).getItemId())) {
            //Player.openInventory().dropSlot(v)
            Time.sleep(30)
            const inv = Player.openInventory();
            inv.click(v);
            inv.click(-999)
        }
    }
    Time.sleep(100)
    KeyBind.keyBind("key.forward", true)
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
        Chat.say("/g" + groupname + " shadnobot")//Patar15 was here 12/27/2023
        Chat.say("/g "+ groupname + " <@" + discordID + "> bot terminated. Reason: " + terminateReason)//Patar15 was here 12/27/2023
    }
    if (terminateReason = "Player has pressed abort key.")
    {
        Chat.log("Bot manually terminated")
    }
    World.playSound("entity.ghast.scream", 100, 0);
}



function checkManualAbort() {
    if (KeyBind.getPressedKeys().contains("key.keyboard." + abortKey)) {
        Chat.log("Player has pressed abort key. Terminating.")
        terminateReason = "Player has pressed abort key."
        botMode = "terminate"
    }
}

function grabShears() {
    // List of items the bot registers as pickaxes.
    pickaxeItems = ["minecraft:shears"]
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

function checkMove() {
    move = true
    x = p.getPos().x
    z = p.getPos().z
    Time.sleep(40)
    x2 = p.getPos().x
    z2 = p.getPos().z
    if (x == x2 && z == z2)
    {
        move = false
    }
    
}

function grabFood() {
    // Has the bot found a placeable block yet?
    foodFound = false
    // Loop through hotbar, stop if end reached or block is found
    let inv = Player.openInventory()
    validFood = ["minecraft:bread","minecraft:cooked_porkchop","minecraft:cooked_mutton","minecraft:cooked_salmon","minecraft:cooked_beef",
"minecraft:baked_potato","minecraft:melon_slice","minecraft:carrot","minecraft:cooked_chicken","minecraft:cooked_cod",
"minecraft:cooked_rabbit","minecraft:cookie","minecraft:potato","minecraft:pumpkin_pie","minecraft:glow_berries","minecraft:tropical_fish"
,"minecraft:sweet_berries","minecraft:golden_carrot"]
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



function eatCheck(){
if (p.getFoodLevel() < minFoodLevel) {
            Chat.log("Food level low, auto eating");
            grabFood()
            Client.waitTick(10);
            KeyBind.key("key.mouse.right",true)
            Client.waitTick(33);
            KeyBind.key("key.mouse.right",false)
        }
}




function face() {
    if (botMode == "mainWest")
    {
        smooth_turn(90,15)
        //p.lookAt(90,15)
        checkRowEnd()
    }
    if (botMode == "mainEast")
    {
        smooth_turn(-90,15)
        //p.lookAt(-90,15)
        checkRowStart()
    }
    if (botMode == "MainSouth")
    {
        smooth_turn(0,0)
        //p.lookAt(0,0)
    }

    if (botMode == "MainNorth")
    {
        smooth_turn(180,0)
        //p.lookAt(180,0)
    }
}
