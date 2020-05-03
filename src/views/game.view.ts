import { html } from './game.view.html';
import { GameToken, Location, locations } from '../models/client.game.model';
import { HandleMoveToken } from '../services/game.service';
import { 
  TokenOrMarkup,
  codeTokensFormatter
} from './game.view.format.logic';

export const newlineMarkup = '<br/>';
export const cursorPlaceholderMarkup = '|';
const indentMarkup = '&nbsp;&nbsp;&nbsp;&nbsp;|';

export class GameView 
{
  private app: HTMLElement;
  private dynamicStyles : HTMLStyleElement;
  private animateConveyor : AnimateConveyor;

  private ulTokens : {
    [location:string/*Location*/] : HTMLUListElement
  } = {};

  // Default to 'null' insertion point, which will flag our
  // service to insert new code-editor tokens at the end (last)...
  private codeCursorTokenIndex : number = null; 

  private formattedCodeTokens : TokenOrMarkup[];

  constructor() {
    this.app = document.getElementById('root');

    this.app.innerHTML = html; 
    this.dynamicStyles = 
      document.getElementById('dynamic-styles') as HTMLStyleElement;

    locations.forEach((location)=>{
      this.ulTokens[location] 
        = document.getElementById(
          location.replace(' ','_') // (spaces not valid in HTML IDs)
        ) as HTMLUListElement;
    })

    // Initialize timer and popup code
    this.initializePopup(this.initializeTimer());

    // Animate conveyor
    this.animateConveyor = new AnimateConveyor(this.ulTokens['conveyor'],10);
//    this.animateConveyor.setDelayIn10thSeconds(0); 
  }

  // Primarily calls service handler() to move tokens between
  // location container in model; but also handles updating
  // 'code cursor' if we are updating the code-editor window...
  public bindMoveToken(handler: HandleMoveToken) {
    locations.forEach((location) => {
      this.ulTokens[location].addEventListener('click', 
      event => 
      {
        const targ = (event.target as HTMLUListElement);
        // All LI elements contain tokens and trigger model updates,
        // any other element types are markup which do not update the model...
        if (targ.tagName.toLowerCase()==='li') 
        {
          let index : number;
          // if coming from token bank, then increment cursor after insert
          switch (location) {
            case 'token bank':
              handler(targ.id,1,this.codeCursorTokenIndex);
              index = this.findFormattedIndexOfToken(targ.id);
              // Relies on current fact that every token is followed by 
              // a cursor placholder...
              index++;
              break;
            case 'code':
              index = this.findFormattedIndexOfToken(targ.id);
              let removingOpenBracket 
                = this.formattedCodeTokens[index].gameToken.token === '{';
              handler(targ.id,1,this.codeCursorTokenIndex);
              // Relies on current fact that every token is preceeded by 
              // a cursor placholder...
              index--;
              // TODO: Review this hack to adjust cursor position after '{' removal
              if (removingOpenBracket) index-=2; 
              break;
            case 'conveyor':
              handler(targ.id,1,this.codeCursorTokenIndex);
              return; // we're done, get out
          }

          this.placeCursor(index); 
        }
      });
    });
  }

  //
  // Display() gets called whenver our model changes...
  //
  public display(location : Location, tokens : GameToken[]) 
  {
    let formattedTokens : TokenOrMarkup[];

    // clear any prior tokens
    this.ulTokens[location].innerText = '';

    if (location!=='code')
      formattedTokens = tokens.map( token =>
        ({ gameToken: token }) );
    else {
      formattedTokens = codeTokensFormatter(tokens);
      // Save formatted code tokens in class member,
      // for later usage to associate insertion locations...
      this.formattedCodeTokens = formattedTokens;
    }

    //
    // Render / Add tokens and markup to DOM...
    //
    formattedTokens.forEach((tokenOrMarkup,index) => {
      // Render game tokens...
      if (tokenOrMarkup.gameToken)
        this.tokenMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.gameToken
        );
      // Render newlines with indentation...
      else if (tokenOrMarkup.markUp === newlineMarkup) { 
        this.spanMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.markUp
        );
        if ((tokenOrMarkup.indentationLevel||0) > 0)
          for (let indent = (tokenOrMarkup.indentationLevel); indent--; )
            this.spanMarkup(this.ulTokens[location], indentMarkup);
      // Render other markup, like cursor placeholders...
      } else {
        this.spanMarkup(
          this.ulTokens[location], 
          tokenOrMarkup.markUp,
          index
        );
      }
    });
  }

  public findFormattedIndexOfToken(tokenID:string)
  {
    // Convert from token location back to formatted content location...
    const index = this.formattedCodeTokens
      .findIndex( (item) => (item.gameToken?.id === tokenID) );
    return index;
  }

  private placeCursor(index: number)
  {
    // Convert and store formattedTokens index into tokens index, since
    // we may need the tokens index to pass our 'insertion point' 
    // to the model service for token placement in the code-editor...
    this.codeCursorTokenIndex = null;
    for ( let i=index; this.codeCursorTokenIndex===null 
            && i < this.formattedCodeTokens.length; i++ ) 
      if (this.formattedCodeTokens[i].gameToken) 
        this.codeCursorTokenIndex = 
          // NOTE: First valid tokenIndex is 0 which is why 
          // we test for presence of 'gameToken' above...
          this.formattedCodeTokens[i].tokenIndex; 
    this.highlightCursor(index);
  }

  private highlightCursor(index:number)
  {
    // Highlight insertion point by creating a css selector
    // with the same same css classes as the insertion placeholder
    // selected via 'click' event....
    this.dynamicStyles.innerText = `
      div.code-editor span.${this.cursorCSSclasses(index).replace(/[ ]/g,'.')} 
      {
        color: red;
        font-weight: bold;
      }
    `;
  }

  private spanMarkup(parent: HTMLUListElement, markup: string, index = 0)
  { 
    const elem = (document.createElement('span') as HTMLSpanElement);
    elem.innerHTML = markup;

    // Make cursor placeholders active in the UI
    if (markup===cursorPlaceholderMarkup) {
      elem.className = (this.cursorCSSclasses(index));
      elem.addEventListener("click", 
        this.placeCursor.bind(this,index) 
      );
    }
    parent.appendChild(elem);
  }

  private cursorCSSclasses(index:number)
  {
    return 'cursor index-'+index;
  }

  private tokenMarkup(el: HTMLUListElement, token : GameToken)
  {
    const li = document.createElement('li') as HTMLLIElement;
    li.id = token.id;
    li.innerHTML = token.token;
    li.classList.add(token.type);
    el.appendChild(li);
  }

  private initializePopup(intervalID) 
  {
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span : HTMLSpanElement = document.getElementsByClassName("close") as any;

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
      modal.style.display = "block";
      clearInterval(intervalID);
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
  }

  private initializeTimer()
  {
       //TIMER
        //Define vars to hold time values
        let seconds = 0;
        let minutes = 0;
    
        //Define vars to hold "display" value
        let displaySeconds : string;
        let displayMinutes : string;
        
        //Stopwatch function (logic to determine when to increment next value, etc.)
        function stopWatch(){
            seconds++;
            //Logic to determine when to increment next value
            if(seconds / 60 === 1){
                seconds = 0;
                 minutes++;
            }

            // If seconds/minutes/hours are only one digit, 
            // add a leading 0 to the value
            if(seconds < 10)
                displaySeconds = "0" + seconds.toString();
            else
                displaySeconds = seconds.toString();
            
            if(minutes < 10)
                displayMinutes = "0" + minutes.toString();
            else
                displayMinutes = minutes.toString();
            
            //Display updated time values to user
            document.getElementById("timer").innerHTML 
              = displayMinutes + ":" + displaySeconds;
        }
        return window.setInterval(stopWatch, 1000);    
  }
}

class AnimateConveyor
{
  // TODO:
  // This could be animate for smooth motion,
  // there are many tutorials, e.g. 
  //   https://www.sarasoueidan.com/blog/creative-list-effects/
  //

  private conveyorTimer = null;

  private tick = 0; // 10 = 1 second

  constructor(
    private ulConveyor:HTMLUListElement, 
    private ticksPerRotation?:number
  ) {
    console.log(this.ulConveyor);
    console.log(this.ticksPerRotation);
    this.conveyorTimer = setInterval(
      this.rotateTokens.bind(this), 100);
  }

  public setDelayIn10thSeconds(ticksPerRotation)
  {
    this.ticksPerRotation = ticksPerRotation;
  }

  private rotateTokens()
  {     
    console.log(this.tick);
    console.log(this.ticksPerRotation);

    if ( this.ulConveyor?.children?.length > 1
      && this.ticksPerRotation > 0 // use 0 to pause!
      && (this.tick++ % this.ticksPerRotation) === 0 ) 
    {
      const LI = this.ulConveyor.children[this.ulConveyor.children.length-1];
      this.ulConveyor.removeChild(LI);
      this.ulConveyor.insertBefore(LI,this.ulConveyor.children[0]);
    } 
  }
}

