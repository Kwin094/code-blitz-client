import { GameToken, locations } from '../models/client.game.model';
import { GameService, HandleMoveToken, HandleSubmitCode } from '../services/game.service';
import { GameView } from '../views/game.view';

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
export class GameController {

  // Use the constructor shortcut 'private' feature instead...
  //  private gameService : HandleMoveToken;

  constructor(
    private session_id: string,
    private challeng_id: string,
    private gameService: GameService,
    private gameView: GameView
    ) {
    // TODO: Study: Are constructor parameters added to 'this' class instance?
    this.gameView.bindSubmitCode(this.handleSubmitCode);

    this.gameService.bindExerciseLoaded((exercise)=>{
      this.gameView.initialize(exercise);
    });

    locations.forEach((location)=>{
      this.gameService.bindTokenLocationChanged(location,
        (tokens: GameToken[]) => {
          this.gameView.display(location,tokens);
        });
    });

    // NOTE: Cannot directly call this.gameService.moveToken()
    // from here because context is NOT properly conveyed
    // to service method.  We MUST call handleMoveToken below.
    // (REVIEW: THIS PATTERN)
    this.gameView.bindMoveToken(this.handleMoveToken);   
  }

  handleMoveToken : HandleMoveToken = (tokenID,direction,codeCursorTokenIndex:number) => {
    let budget = this.gameService.changeBudget(tokenID);
    this.gameView.setBudget(budget);
    this.gameService.moveToken(tokenID,direction,codeCursorTokenIndex);
  }

  handleSubmitCode = (title: string, code: string) => {
    this.gameService.checkCode(title, code.replace(/\|/g,''))
    .then(res => {
      this.gameView.submitResult(res['result']);
    });
  }
}