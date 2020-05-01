import { html } from './game.view.html';
import { GameToken, Location, locations } from '../models/client.game.model';
import { HandleMoveToken } from '../services/game.service';
import { 
  newlineMarkup, 
  TokenOrMarkup,
  cursorPlaceholderMarkup,
  codeTokensFormatter
} from './game.view.format.logic';

export class GameView {
  protected app: HTMLElement;

  private ulTokens : {
    [location:string/*Location*/] : HTMLUListElement
  } = {};

  constructor() {
    this.app = document.getElementById('root');

    this.app.innerHTML = html; 

    //POP UP CODE START:
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span : HTMLSpanElement = document.getElementsByClassName("close") as any;

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    //END POP UP CODE.

    locations.forEach((location)=>{
      this.ulTokens[location] 
        = document.getElementById(
          location.replace(' ','_') // spaces not valid in HTML IDs
        ) as HTMLUListElement;
    })
  }

  public bindMoveToken(handler: HandleMoveToken) {
    locations.forEach((location) => {
      this.ulTokens[location].addEventListener('click', 
      event => {
        const targ = (event.target as HTMLUListElement);
        // All LI elements contain tokens and trigger model updates,
        // any other element types are markup which do not update the model...
        if (targ.tagName.toLowerCase()==='li') 
          handler(targ.id,1);
      });
    });
  }
  
  public display(location : Location, tokens : GameToken[]) 
  {
    let formattedTokens : TokenOrMarkup[];
    const indentMarkup = '&nbsp;&nbsp;&nbsp;&nbsp;|';

    // clear any prior tokens
    this.ulTokens[location].innerText = '';

    if (location!=='code')
      formattedTokens = tokens.map( token =>
        ({ gameToken: token }) );
    else
      formattedTokens = codeTokensFormatter(tokens);

    //
    // Render / Add tokens and markup to DOM...
    //
    formattedTokens.forEach((tokenOrMarkup,index) => {
      // Render game tokens...
      if (tokenOrMarkup.gameToken)
        tokenMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.gameToken
        );
      // Render newlines with indentation...
      else if (tokenOrMarkup.markUp === newlineMarkup) { 
        spanMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.markUp
        );
        for (let indent = (tokenOrMarkup.indentationLevel||0); indent--; )
          spanMarkup(this.ulTokens[location], indentMarkup);
      // Render other markup, like cursor placeholders...
      } else {
        spanMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.markUp,
          index
        );
      }
    });
  }
}

function placeCursor(ev: MouseEvent)
{
  const targ = ev.target as HTMLSpanElement;
  const dynamicStyles = 
    document.getElementById('dynamic-styles') as HTMLStyleElement;
  dynamicStyles.innerText = `
    div.code-editor span.${targ.className.split(' ').join('.')} 
    {
      color: red;
      font-weight: bold;
    }
  `;
}

function spanMarkup(parent: HTMLUListElement, markup: string, index = 0)
{ 
  const elem = (document.createElement('span') as HTMLSpanElement);
  elem.innerHTML = markup;

  // Make cursor placeholders active in the UI
  if (markup===cursorPlaceholderMarkup) {
    elem.className = ('cursor index-'+index);
    elem.addEventListener("click", placeCursor);
  }
  parent.appendChild(elem);
}

function tokenMarkup(el: HTMLUListElement, token : GameToken)
{
  const li = document.createElement('li') as HTMLLIElement;
  li.id = token.id;
  li.innerHTML = token.token;
  li.classList.add(token.type);
  el.appendChild(li);
}
