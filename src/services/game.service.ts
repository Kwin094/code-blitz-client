import { GameToken, GameTokens, Location, locations } 
  from '../models/client.game.model';
import { sampleGameTokens } from '../models/client.game.mock';
import { TokenID } from '../models/exercise.model';

type Direction = 1 | -1;

export type HandleMoveToken = typeof GameService.prototype.moveToken;

type OnTokenArrayChanged = (x : GameToken[]) => (void);

/**
 * @class Service
 *
 * Manages the data of the application.
 */
export class GameService {
  private tokens : GameTokens;
  private tokenLocationArray : {
    [location:string/*Location*/] : TokenID[]
  } = {};

  private onTokenLocationChanged : {
    [location:string/*Location*/] : OnTokenArrayChanged
  } = {};

  private stuff = 'stuff!'

  constructor() {
    // Initially load of all game tokens to 
    // the central game token storage object
    // with a location setting of conveyor...
    this.tokens = sampleGameTokens.reduce(
      (result,exerciseToken,index) => {
        result[exerciseToken.id] 
          = { ...exerciseToken, 
              location: //'conveyor'
              locations[ ((index%4)?0:2) / (index%8?2:1) ] // test: distribute using modulus 
            }
        return result;
      }, {} as GameTokens);

    // ... and reference all tokens in the ordered location arrays...
    locations.forEach((location)=> {
      this.tokenLocationArray[location] = []; // initialize arrays
    });
    // Compute location arrays for initial tokens state...
    this.refreshLocationArrays();
  }

  public bindTokenLocationChanged(
    tokenLocation: Location, 
    callback: OnTokenArrayChanged
  ) {
    this.onTokenLocationChanged[tokenLocation] = callback;
    // Trigger view refresh on bind
    this.commit([tokenLocation]);
  }

  private refreshLocationArrays() {
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
          console.log(`--- location: ${location}`);
          console.log(this.tokenLocationArray[location].join());
          this.tokenLocationArray[location].splice(index,1);
          console.log(this.tokenLocationArray[location].join());
        }
      });
    });
 
    // Add any unconfirmed IDs to their proper location arrays (append to end)
    allIDsToProcess.forEach((tokenID) => {
      this.tokenLocationArray[this.tokens[tokenID].location].push(tokenID);
      // allIDsToProcess.delete(tokenID); -- not needed since we process all, and we are done
    });
  }

  public moveToken(tokenID : TokenID, direction : Direction)
  {
    const oldLocation = this.tokens[tokenID].location;
    const newPos = locations.indexOf(oldLocation) + direction;

    // Check boundaries
    if (newPos < 0 || newPos >= locations.length)
      alert('Assertion FAILED that tokens not be moved beyond location positions'
      +` 0, 1, and 2; tried to move token ID ${tokenID} to position #${newPos}`);
    else {
      // Boundary checks out OK, proceed to move
      const newLocation = locations[newPos];
      // alert(`tokenID=${tokenID}, direction=${direction}, from=${oldLocation} to ${newLocation}`);
      this.tokens[tokenID].location = newLocation;
      this.refreshLocationArrays();
      this.commit([oldLocation,newLocation]);
    }
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