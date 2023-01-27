import player from "../models/player";
import { Router } from "express";
const router = Router()


router.put("/updatePlayer", async (req,res) => {
  const body = req.body;

  try {
    await new player(body).validate()
    const findPlayer = await player.findOneAndUpdate({discordId: body.discordId}, body, {new: true, upsert: false})

    if(findPlayer === null) return res.status(404).json({error: "Player not found"})
    else return res.status(200).json(findPlayer)
  } catch (error) {
    if(error instanceof Error){
      return res.status(400).json({error: error.message})
    }
  }
})

export default router;