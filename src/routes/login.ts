import { Router } from 'express';

import config from '../utils/config';
const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN } = config;

const router = Router();


router.post("/", (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) {
    res.status(400).json({error: "Username or password missing"});
  }

  if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.status(200).json({token: ADMIN_TOKEN});
  }
  else {
    res.status(401).json({error: "Invalid username or password"});
  }

})

export default router;