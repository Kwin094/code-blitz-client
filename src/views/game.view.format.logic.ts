import { GameToken } from '../models/client.game.model';

export const newlineMarkup = '<br/>';
export const cursorPlaceholderMarkup = 'I';

export interface TokenOrMarkup {
  gameToken ?: GameToken,
  markUp ?: string,
  indentationLevel ?: number
}

export function codeTokensFormatter(tokens : GameToken[])
{
  let parenNesting = 0;
  let indentationLevel = 0;  
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
