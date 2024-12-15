const p = Player.getPlayer()

while (1==1)
{
        x = p.getPos().x
        z = p.getPos().z
        Time.sleep(350)
        x2 = p.getPos().x
        z2 = p.getPos().z
        Chat.actionbar("Railmonitor Running")
        if (x == x2 && z == z2)
        {
            Time.sleep(500)
            World.playSound("entity.ghast.scream", 100, 0);
            Time.sleep(1000)
        }
}