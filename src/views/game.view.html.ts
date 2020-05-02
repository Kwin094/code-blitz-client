export const html = 
`
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
