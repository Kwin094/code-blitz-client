import { GameToken, Location, locations } from '../models/client.game.model';
import { HandleMoveToken } from '../services/game.service';
import { Ellipse } from 'pixi.js';
import { setMaxListeners } from 'cluster';
import { setInterval } from 'timers';


export class GameView {
    private app: HTMLElement;

    private ulTokens : {
        [location:string/*Location*/] : HTMLUListElement
    } = {};


    constructor() {
        this.app = document.getElementById('root');

        const html = `
            <div class='game-page'>
                <div class='flex5'>
                    <div id='prompt'>PROMPT: Write a program to print out 10 numbers</div>
                    <div id='language'> Javascript </div> 
                    <div id='timeName'> TIME </div>
                    <div id='timer'> </div>
                </div>
                <div class='conveyor-container'>
                    <ul id='conveyor' />
                </div>
                <div class='flex2'>
                    <div class='flex3'>
                        <div class='code-editor'>
                            <ul id='code' />
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
        //TIMER, COUNTDOWN
        const startMin = 1;
        let time = startMin *60
        
        setInterval(function(){
            if(time>=0){
                const countDownEl = document.getElementById('timer');
                const minutes = Math.floor(time / 60);
                let seconds = time % 60;
                //timer won't go negative zero
                seconds = seconds < 0 ? '0' + seconds : seconds;
                countDownEl.innerHTML = `${minutes}: ${seconds}`;
                time--;
            }
          
        }, 1000);
        

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
    
    public display(location : Location, tokens : GameToken[]) {
        // clear any prior tokens
        this.ulTokens[location].innerText = '';
        let indentationLevel = 0;
        tokens.forEach((token) => {
            const li = document.createElement('li') as HTMLLIElement;
            li.id = token.id;
            li.innerHTML = token.token;
            li.classList.add(token.type);
            switch (token.token) {
                case '{':
                    indentationLevel++;
                    li.classList.add('open-curly-bracket');
                    break;
                case '}':
                    indentationLevel--;
                    li.classList.add('close-curly-bracket');
                    break;
            } 
            li.classList.add('indent-'+indentationLevel.toString());
            this.ulTokens[location].appendChild(li);
        });   
    }
   
}
