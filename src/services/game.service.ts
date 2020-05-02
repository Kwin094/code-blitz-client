import { GameToken, GameTokens, Location, locations } 
  from '../models/client.game.model';
import { Fetch } from '../utils/Fetch';
// import { sampleGameTokens } from '../models/client.game.mock';
import { TokenID, ExerciseToken, Exercise } from '../models/exercise.model';

type Direction = 1 | -1;

export type HandleMoveToken = typeof GameService.prototype.moveToken;

type OnTokenArrayChanged = (x : GameToken[]) => (void);

/**
 * @class Service
 *
 * Manages the data of the application.
 */
export class GameService {
  private tokens : GameTokens = {};
  private tokenLocationArray : {
    [location:string/*Location*/] : TokenID[]
  } = {};

  private onTokenLocationChanged : {
    [location:string/*Location*/] : OnTokenArrayChanged
  } = {};

  constructor() {
    // Initialize location arrays...
    locations.forEach((location)=> {
      this.tokenLocationArray[location] = []; // initialize arrays
    });
    // Read exercise data from server and load it
    Fetch('/token')
      .then(res => res && res.json())

      .then(res => {
        return Promise.resolve(
      [
        {"_id":"5e86247d2d041148f0fd8d8a","id":"001","token":"for","type":"keyword","cost":0.15},
        {"_id":"5e86247d2d041148f0fd8d8b","id":"002","token":"(","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d8c","id":"003","token":"x","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d8d","id":"004","token":"=","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d8e","id":"005","token":"1","type":"literal","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d8f","id":"006","token":";","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d90","id":"007","token":"x","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d91","id":"008","token":"<=","type":"operator","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d92","id":"009","token":"10","type":"literal","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d93","id":"010","token":";","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d94","id":"011","token":"x","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d95","id":"012","token":"++","type":"operator","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d96","id":"013","token":")","type":"symbol","cost":0.05},

        {"_id":"5e86247d2d041148f0fd8d96","id":"022","token":"{","type":"symbol","cost":0.05},

        {"_id":"5e86247d2d041148f0fd8d97","id":"014","token":"console","type":"keyword","cost":0.15},
        {"_id":"5e86247d2d041148f0fd8d98","id":"015","token":".","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d99","id":"017","token":"log","type":"keyword","cost":0.15},
        {"_id":"5e86247d2d041148f0fd8d9a","id":"018","token":"(","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d9b","id":"019","token":"x","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d9c","id":"020","token":")","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d9d","id":"021","token":";","type":"symbol","cost":0.05},

        {"_id":"5e86247d2d041148f0fd8d9d","id":"028","token":"for","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d9d","id":"029","token":"(","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d8c","id":"030","token":"y","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d8d","id":"031","token":"=","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d8e","id":"032","token":"1","type":"literal","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d8f","id":"033","token":";","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d90","id":"034","token":"y","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d91","id":"035","token":"<=","type":"operator","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d92","id":"036","token":"10","type":"literal","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d93","id":"037","token":";","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d94","id":"048","token":"y","type":"identifier","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d95","id":"039","token":"++","type":"operator","cost":0.1},
        {"_id":"5e86247d2d041148f0fd8d9d","id":"040","token":")","type":"symbol","cost":0.05},


        {"_id":"5e86247d2d041148f0fd8d96","id":"050","token":"{","type":"symbol","cost":0.05},

        {"_id":"5e86247d2d041148f0fd8d9d","id":"051","token":"debugger","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d9d","id":"052","token":";","type":"symbol","cost":0.05},

        {"_id":"5e86247d2d041148f0fd8d96","id":"060","token":"}","type":"symbol","cost":0.05},
        {"_id":"5e86247d2d041148f0fd8d96","id":"070","token":"}","type":"symbol","cost":0.05},
        
      ] )

    })


      .then( this.loadExercise.bind(this) );
  }

  private loadExercise(exerciseTokens:Array<ExerciseToken>)
  {
    // Load all game tokens to
    // the central game token storage object
    // with a location setting of conveyor...
    this.tokens = exerciseTokens.reduce(
      (result,exerciseToken,index) => {
        result[exerciseToken.id] 
          = { ...exerciseToken, 
              location: 'code' // 'conveyor'
            }
        return result;
      }, {} as GameTokens
    );
    this.refreshLocationArrays(null);
    this.commit(locations);
  }

  public bindTokenLocationChanged(
    tokenLocation: Location, 
    callback: OnTokenArrayChanged
  ) {
    this.onTokenLocationChanged[tokenLocation] = callback;
    // Trigger view refresh on bind
    this.commit([tokenLocation]);
  }

  private refreshLocationArrays(codeCursorTokenIndex:number) {
    let allIDsToProcess = new Set(Object.keys(this.tokens));

    // Remove any location array entries that have moved
    locations.forEach((location) => {
      // Check existing entries for removal or confirmation
      [...this.tokenLocationArray[location]].forEach( (tokenID,index) => {
        if (this.tokens[tokenID].location===location) {
          // Token is confirmed in proper location, so do nothing 
          // except remove from to-process set
          if (!allIDsToProcess.delete(tokenID))
            // Hopefully the following will never occur,
            // even though our algorithm is 'self healing' in that
            // it guarantees we will be restored to a valid state.
            alert(`Assertion that tokens should be in only one location FAILED for id ${tokenID}!`)
        } else {
          // Token must have moved, so remove from this (obsolete) location
          this.tokenLocationArray[location].splice(index,1);
        }
      });
    });
 
    // Add any unconfirmed IDs to their proper location arrays
    allIDsToProcess.forEach((tokenID) => {
      const location = this.tokens[tokenID].location;
      const localTokenArray = this.tokenLocationArray[location];
      if (location!=='code' || codeCursorTokenIndex===null
          || codeCursorTokenIndex >= localTokenArray.length) // safeguard
        // Move tokens to end of location collection (for now)
        // for conveyor and token bank, and for code-editor 
        // if cursor index is null (default placement at end)...
        localTokenArray.push(tokenID);
      else
        // Inset token to location of cursor if location is code-editor
        // and codeCursorTokenIndex is not null...
        localTokenArray.splice(codeCursorTokenIndex,0,tokenID);
    });
  }

  public moveToken(tokenID : TokenID, direction : Direction, codeCursorTokenIndex:number)
  {
    const oldLocation = this.tokens[tokenID].location;
    let newPos = locations.indexOf(oldLocation) + direction;

    // Check boundaries
    if (newPos < 0 || newPos >= locations.length)
//      alert('Assertion FAILED that tokens not be moved beyond location positions'
//      +` 0, 1, and 2; tried to move token ID ${tokenID} to position #${newPos}`);
      newPos = locations.indexOf(oldLocation) - direction; // help w/ testing...
//    else { ...
      // Boundary checks out OK, proceed to move
      const newLocation = locations[newPos];
      // alert(`tokenID=${tokenID}, direction=${direction}, from=${oldLocation} to ${newLocation}`);
      this.tokens[tokenID].location = newLocation;
      this.refreshLocationArrays(codeCursorTokenIndex);
      this.commit([oldLocation,newLocation]); 
//    } ...
    return;
  }

  private commit(locations : Location[]) {
    locations.forEach((location : Location) => {
      this.onTokenLocationChanged[location](
        this.tokenLocationArray[location].map(tokenID=>this.tokens[tokenID])
      );
    });
  }
}