/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/
var scores, roundScore, activePlayer, gamePlaying;
//call init() when the game started
init();

/*
EVENT LISTENER
*/
//Click event on ROLL DICE button
document.querySelector('.btn-roll').addEventListener('click', function() {
    //state control
    if (!gamePlaying) {
        return;
    }
    //get random number
    dice = Math.floor(Math.random() * 6 + 1);

    //Display the dice number
    var diceDOM = document.querySelector('.dice');
    diceDOM.style.display = 'block';
    diceDOM.src = 'dice-' + dice + '.png';

    //Update the round score if the number is not 1    
    if (dice == 1) {
        changePlayer();
    } else {
        roundScore += dice
        document.querySelector('#current-' + activePlayer).textContent = roundScore
    }
});

//Click event on HOLD button
document.querySelector('.btn-hold').addEventListener('click', function(){
    //state control
    if (!gamePlaying) {
        return;
    }

    //update total score by adding current round score
    scores[activePlayer] += roundScore;
    document.getElementById('score-' + activePlayer).textContent = scores[activePlayer];
    document.querySelector('#current-' + activePlayer).textContent = 0;

    
    if (scores[activePlayer] >= 100) {
        //this player wins
        document.querySelector('#name-' + activePlayer).textContent = 'winner!';
        document.querySelector('.dice').style.display = 'none';
        //game is finished
        gamePlaying = false;

        //change style
        document.querySelector('.player-' + activePlayer +'-panel').classList.add('winner');
        document.querySelector('.player-' + activePlayer +'-panel').classList.remove('active');

    } else {
        //game continue
        changePlayer();
    }

});

//Click event on NEW GAME button
document.querySelector('.btn-new').addEventListener('click', init);

/*
FUNCTIONS
*/

//initialization
function init(){
    //all set 0
    scores = [0,0];
    roundScore = 0;
    activePlayer = 0;  
    gamePlaying = true;

    //initialize stats
    document.getElementById('score-0').textContent = 0;
    document.getElementById('score-1').textContent = 0;
    document.querySelector('.dice').style.display = 'none';

    //Player name
    document.getElementById('name-0').textContent = 'player 1';
    document.getElementById('name-1').textContent = 'player 2';

    //Set PLAYER1 active
    document.querySelector('.player-0-panel').classList.remove('winner');
    document.querySelector('.player-1-panel').classList.remove('winner');
    document.querySelector('.player-0-panel').classList.remove('active');
    document.querySelector('.player-0-panel').classList.add('active');
    document.querySelector('.player-1-panel').classList.remove('active');
}

//Switch active player
function changePlayer() {
        //set current score 0
        document.querySelector('#current-' + activePlayer).textContent = 0;

        //change active player
        activePlayer = activePlayer == 1 ? 0 : 1;
        roundScore = 0;

        //toggle the active mark
        document.querySelector('.player-0-panel').classList.toggle('active');
        document.querySelector('.player-1-panel').classList.toggle('active');

        //hide dice
        document.querySelector('.dice').style.display = 'none';

};