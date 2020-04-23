import { Challenge } from '../models/challenge.model';
import { ChallengeService } from '../services/challenge.service';
import { ChallengeView } from '../views/challenge.view';
import { UserService } from '../services/user.service';
// import { UPDATE_PRIORITY } from 'pixi.js';

export type HandleStartChallenge 
  = typeof ChallengeController.prototype.handleStartChallenge;

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
export class ChallengeController {
  constructor(
      private session_id: string,
      private userService: UserService,
      private challengeService: ChallengeService, 
      private challengeView: ChallengeView
  ) {
    // Add user to challengers
    this.update();

    // Explicit this binding
    this.challengeService.bindUserListChanged(this.onUserListChanged);

    // First "real" Code blitz handler... :)
    this.challengeView.bindStartChallenge(this.handleStartChallenge);

    // Useful examples refactored from original MVC template...
    // (Renamed from contact/user application to Code Blitz/challenge
    //  but may be further modified (or removed)...)
    this.challengeView.bindAddUser(this.handleAddUser);
    this.challengeView.bindEditUser(this.handleEditUser);
    this.challengeView.bindChallengeUser(this.handleChallengeUser);
    //this.challengeView.bindToggleUser(this.handleToggleUser);

    // Display initial users
    this.onUserListChanged(this.challengeService.users);

    setInterval(() => this.update(), 2000);
  }

  update = () => {
    this.userService.updateChallengers(this.session_id)
    .then(res =>{
      let active = []
      if(res)
      {
        res.forEach(user => {
          active.push(user._id);

          let challenger: Challenge = {
            id: user._id, 
            name: user.name, 
            winLossRecord: user.wins + '/' + user.losses,
            challenged: user.challenged 
          }
          this.challengeService.add(challenger);
        });
        this.challengeService.delete(active);
      }
    })
  }

  onUserListChanged = (challenge: Challenge[]) => {
    this.challengeView.displayUsers(challenge);
  };

  handleStartChallenge = (challenge : Challenge) => {
    // TODO: call this.challengeService to 
    // initialize and record (in Mongo) the 
    // start of a challenge, e.g...
    //this.challengeService.startChallenge(challenge)...

    // And route to game play page...
    const { origin, pathname } = location;
    location.replace(origin+pathname+'?page=game&session_id='+this.session_id);    
  }

  handleAddUser = (challenge: Challenge) => {
    this.challengeService.add(challenge);
  };

  handleChallengeUser = (id: string) => {
    this.userService.updateChallengers(this.session_id, id)
  }

  handleAcceptChallenge = () => {
    
  }

  handleEditUser = (id: string, challenge: Challenge) => {
    this.challengeService.edit(id, challenge);
  };

  handleToggleUser = (id: string) => {
    this.challengeService.toggle(id);
  };
}
