import { Challenge } from '../models/challenge.model';

/**
 * @class Service
 *
 * Manages the data of the application.
 */
export class ChallengeService {
  public users: Challenge[];
  private onUserListChanged: Function;

  constructor() {
    const users: Challenge[] = [];
    this.users = users.map(user => new Challenge(user)); // REVIEW: noop
  }

  bindUserListChanged(callback: Function) {
    this.onUserListChanged = callback;
  }

  _commit(users: Challenge[]) {
    this.onUserListChanged(users);
    //localStorage.setItem('users', JSON.stringify(users));
  }

  add(user: Challenge) {
  	// Find user if already in model
    let usr = this.users.find(({ id}) => id === user.id)
    
    // If user is not in model, then add user to model
    if (usr === undefined)
    {
      this.users.push(new Challenge(user));
      this._commit(this.users);
    }
    else 
    // If the user is already in the model, update user record to latest...
    if (usr.challenged !== user.challenged)
    {
      this.edit(usr.id, user);
    }
  }

  delete(_id: string[]) { // REVIEW: What is this for?
    this.users = this.users.filter(({ id }) => _id.includes(id));
    this._commit(this.users);
  }

  challenge(id: string) {
    
  }

  edit(id: string, userToEdit: Challenge) {
    let user = this.users
      .find(({id:user_id})=>user_id===id);
    Object.assign(user,userToEdit);

    this._commit(this.users);
  }

  toggle(_id: string) {
    this.users = this.users.map(user =>
      user.id === _id ? new Challenge({ ...user }) : user
    );

    this._commit(this.users);
  }
}
