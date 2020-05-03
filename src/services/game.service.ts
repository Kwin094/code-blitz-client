import { GameToken, GameTokens, Location, locations } 
  from '../models/client.game.model';
import { Fetch } from '../utils/Fetch';
// import { sampleGameTokens } from '../models/client.game.mock';
import { TokenID, ExerciseToken, Exercise } from '../models/exercise.model';

type Direction = 1 | -1;

export type HandleMoveToken = typeof GameService.prototype.moveToken;
export type HandleSubmitCode = typeof GameService.prototype.checkCode;

type OnTokenArrayChanged = (x : GameToken[]) => (void);

/**
 * @class Service
 *
 * Manages the data of the application.
 */
export class GameService {
  private tokens : GameTokens = {};
  private exercise : Exercise;
  private tokenLocationArray : {
    [location:string/*Location*/] : TokenID[]
  } = {};

  private onExerciseLoaded : (exercise: Exercise) => (void);

  private onTokenLocationChanged : {
    [location:string/*Location*/] : OnTokenArrayChanged
  } = {};

  constructor() {
    // Initialize location arrays...
    locations.forEach((location)=> {
      this.tokenLocationArray[location] = []; // initialize arrays
    });
    // Read exercise data from server and load it
    Fetch('/exercise') 
      .then(res => res && res.json())
      // quick adjustment to fetch tokens from first exercise...
      .then(res => res) 
      .then( this.loadExercise.bind(this) );
  }

  private loadExercise(exercises:Exercise[])
  {
    //
    // TODO:
    // Introduce exercise-picking algorithm here (could be random to start)...
    // Right now, I'm just hard coding to the first exercise in Mongo collection!
    //
    this.exercise = exercises[0];
    const exerciseTokens:Array<ExerciseToken> = this.exercise.tokens;

    // One-time load/refresh of view now that we've got the 
    // selected exercise data...
    this.onExerciseLoaded(this.exercise);

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

  public bindExerciseLoaded(
    callback: (exercise: Exercise) => (void)
  ) {
    this.onExerciseLoaded = callback;
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

  public checkCode(title: string, code: string)
  { 
      /*Code used for testing, left in temporarily if you needed something to verify with as well
        var Prologue = "var start = 9; var end = 15; var output = [];";
        var Epilogue = "console.log(output);";
        var middle = "while (start <= end) {output.push(start); start++;}";
        code = Prologue + middle + Epilogue;*/
    return Fetch('/exercise', {
      method: 'POST',
      body: JSON.stringify({_title: title, _code: code})
  })
  .then(res => res && res.json());
  }
}