import { Request, Response } from 'express';
import { Singleton } from '../utils/singleton';

const singleton = Singleton.getInstance();

export class GameController
{
  public updateGameStatus (req: Request, res: Response)
  {
    res.json( req.body ); // just reflect stats for now for testing...
  }
}