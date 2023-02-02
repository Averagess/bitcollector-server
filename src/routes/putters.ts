import { Player } from "../models";
import { Router } from "express";
const router = Router()

router.put("/updatePlayer", async (req,res) => {
  const body = req.body;

  if(!body.discordId || Object.keys(body).length === 0) return res.status(400).json({error: "Missing or invalid body"})

  try {
  const player = await Player.findOneAndUpdate({discordId: body.discordId}, body, {new: true})
  if(!player) return res.status(404).json({error: "Player not found"})
  else return res.status(200).json({message: "Player updated"})
  } catch (error) {
    if(error instanceof Error){
      return res.status(400).json({error: error.message})
    }
  }
})

export default router;