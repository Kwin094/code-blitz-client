import { GameToken, Location, locations } from '../models/client.game.model';
import { HandleMoveToken } from '../services/game.service';

export class GameView {
  protected app: HTMLElement;

  private ulTokens : {
    [location:string/*Location*/] : HTMLUListElement
  } = {};

  constructor() {
    this.app = document.getElementById('root');

    const html = `
      <div class='game-page'>
        <style id='dynamic-styles'>
        </style>
        <div class='flex5'>
          <div id='prompt'>PROMPT: Write a program to print out 10 numbers</div>
          <div id='language'>Javascript</div>                    
          <div id='timer'>TIMER &nbsp;<b>3:07</b></div>
        </div>
        <div class='conveyor-container'>
          <ul id='conveyor' />
        </div>
        <div class='flex2'>
          <div class='flex3'>
            <div class='code-editor'>
              <ul style='display: block' id='code' />
            </div>
            <div id='label'>Token Bank</div>
            <div class='token-container'>
              <ul id='token_bank' />
            </div> 
          </div>
          <div class='flex4'>
            <div class="stats-container">
              <div class='flex9'>
              <div id='stats'><b>MY STATS</b><br><BR>CREDIT: $5.12<br>TOKENS PLACED: 9<BR>LINES OF CODE: 2<BR>AVG COST PER LINE: $0.85<br>SUBMIT ATTEMPTS: 0</div>
              </div>
              <div class='flex9'>
              <div id='stats'><b>OPPONENT STATS</b><br><BR>CREDIT: $4.78<br>TOKENS PLACED: 12<BR>LINES OF CODE: 3<BR>AVG COST PER LINE: $0.72<br>SUBMIT ATTEMPTS: 1</div>
              </div>
            </div>
            <div class='opponentCode'>
            </div>

            <button id="myBtn"><div class='submitButton'><div class='submit'>SUBMIT CODE</div>
            </div></button>
            <div id="myModal" class="modal">
              <div class="modal-content">
                <span class="close">&times;</span>
                <p>YOU WIN!</p>
              </div>
            </div>

            <div class='flex6'>
              <div class='flex7'>
                <div id='label'>Return Token</div>
                <div class='sellBack'>
                </div>
              </div>
              <div class='flex8'>
                <div id='label2'>Budget</div>                            
                <div class='credit'><br><br>CREDIT<br>$ 5.12
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
        handler((event.target as HTMLUListElement).id,1);
      });
    });
  }
  
  public display(location : Location, tokens : GameToken[]) 
  {
    interface TokenOrMarkup {
      gameToken ?: GameToken,
      markUp ?: string,
      indentationLevel ?: number
    }
    let formattedTokens : TokenOrMarkup[];

    // clear any prior tokens
    this.ulTokens[location].innerText = '';

    const newlineMarkup = '<br/>';
    const indentMarkup = '&nbsp;&nbsp;&nbsp;&nbsp;|';
    const cursorPlaceholderMarkup = 'I';

    let parenNesting = 0;
    let indentationLevel = 0;

    const placeCursor = (ev: MouseEvent) =>
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

    const spanMarkup = (parent: HTMLUListElement, markup: string, index = 0) =>
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

    const tokenMarkup = (el: HTMLUListElement, token : GameToken) =>
    {
      const li = document.createElement('li') as HTMLLIElement;
      li.id = token.id;
      li.innerHTML = token.token;
      li.classList.add(token.type);
      el.appendChild(li);
    }

    const codeTokensFormatter = () =>
    {
      return tokens.reduce( (prev, token, index) => 
        {
          // Default assumptions to speed test logic;
          // see comments below about these variables...
          let detectCodeBlock = 0;  
          let detectPostNewline = false;

          // Track paranethesis nesting, newlines and code blocks
          // may not start within parenthesis at present...
          parenNesting += [0,1,-1]['()'.indexOf(token.token)+1];
          if (parenNesting===0) {
            // 0 = no new block, 1 = open, 2 = close
            detectCodeBlock = [0, 1, -1]['{}'.indexOf(token.token)+1];
            // newlines follow code blocks and ';'
            detectPostNewline = detectCodeBlock !== 0 || token.token === ';';
          }

          if (detectCodeBlock === 1) {
            prev.push({markUp:newlineMarkup, indentationLevel});
            prev.push({markUp: cursorPlaceholderMarkup, indentationLevel});
            indentationLevel++;
            prev.push({ gameToken: token, indentationLevel });
            prev.push({markUp: cursorPlaceholderMarkup, indentationLevel});
            prev.push({markUp:newlineMarkup, indentationLevel});
            detectPostNewline = false;
          } else
            prev.push({ gameToken: token, indentationLevel });

          // Peek ahead one for close of block,
          // so that we can reduce indentation level now
          // before presenting the close block ('}')
          if ((index+1)<tokens.length && tokens[index+1].token === '}')
            indentationLevel--;

          prev.push({markUp: cursorPlaceholderMarkup, indentationLevel});
          if (detectPostNewline) {
            prev.push({markUp:newlineMarkup, indentationLevel});
            prev.push({markUp: cursorPlaceholderMarkup, indentationLevel});
          }

          return prev;
        },
        // Start out all code markup with a cursor placeholder
        [ 
          {markUp: cursorPlaceholderMarkup},
          {markUp: newlineMarkup}, 
          {markUp: cursorPlaceholderMarkup}
        ] as TokenOrMarkup[]
      );
    }

    if (location!=='code')
      formattedTokens = tokens.map( token =>
        ({ gameToken: token }) );
    else
      formattedTokens = codeTokensFormatter();

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
