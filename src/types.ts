import { Request } from "express";
import { PlayerInterface } from "./models/player";
import { Document, Types } from "mongoose";

export interface ExtendedRequest extends Request {
  player?: Document<unknown, any, PlayerInterface> & PlayerInterface & {
    _id: Types.ObjectId;
}
}