/**
 * @package Ladders&Snakes Classic Game!
 * @author Mohammad Anzawi <m.anzawi2013@gmail.com>
 * @link https://github.com/anzawi/ladders-snake
 * @description
 *  This plugin was created as a solution to an assignment entrusted to me by a company in interview,
 *  and I wanted to share it to those who are interested in using it, developing it or even learning.
 */

(function ($) {

    "use strict";

    $.fn.extend({
        // Initialize Plugin
        LadderSnake: function (options) {
            // create random id for the game div
            const id = "LadderSnake_" + Math.random().toString(36).substr(2, 9);

            // set default options
            this.defaultOptions = {
                rows: 4, // game rows --> minimum 4 // maximum 10
                columns: 6, // game columns --> minimum 6 // maximum 10
                squareSize: 80, // game square height & width
                savable: true, // can user save the game?
                savedGame: { // load saved game
                    totalDice: 0, // total dice rolled
                    playerRound: 0, // current player round
                    playerOnePosition: 1, // player_1 position
                    playerTowPosition: 1, // player_2 position
                    playerOneLastPosition: 1, // player_1 last position
                    playerTowLastPosition: 1 // // player_2 last position
                },
                // setup ladders and snakes
                /**
                 * start: start square number
                 * end  : where player to go ?
                 */
                ladders: [{
                    start: 3,
                    end: 10
                }, {
                    start: 7,
                    end: 14
                }, {
                    start: 13,
                    end: 22
                }],
                snakes: [{
                    start: 16,
                    end: 8
                }, {
                    start: 23,
                    end: 5
                }, {
                    start: 11,
                    end: 2
                }],
            }
            // setup options, user options or default
            const settings = $.extend({}, this.defaultOptions, options);

            // get all game squares count --> maximum 100 square
            const count = (settings.rows * settings.columns) - 1;

            // create game aria
            return this.each(function () {
                /**
                 * Startup Validation (Initial Validation)
                 */
                    // get Save button
                let saveGameBtn = $("#saveGame");
                // check if save button is not initialized log Error
                if (settings.savable && saveGameBtn.val() === undefined) {
                    console.error('if you want to allows players to save game, you must declare "saveGameBtn" Button');
                    console.table({'element': '<button>', 'id': 'saveGame'});
                    return false;
                }
                // check if all square more than 100 or rows & columns more than 10
                // then console error
                if (count > 100 || settings.rows > 10 || settings.columns > 10) {
                    console.error('Game Cant Be more than 100 square !', "(10 rows & 10 columns) is maximum")
                    return false;
                }
                // check if rows & columns are less than minimum values
                if (settings.rows < 4 || settings.columns < 6) {
                    console.error('Game Cant Be less than 24 square !', "(4 rows & 6 columns) is minimum")
                    return false;
                }

                /**
                 * Setup Players
                 * @type {({color: string, name: string, lastPosition: number, position: number, id: string}|{color: string, name: string, lastPosition: number, position: number, id: string})[]}
                 */
                const players = [
                    {
                        name: "Player 1", // player 1 name
                        position: settings.savedGame.playerOnePosition - 1, // player 1 position
                        lastPosition: settings.savedGame.playerOneLastPosition - 1, // player 1 last position
                        color: "#fa6f6f", // player one color
                        id: 'player_0' // player 1 id
                    },
                    {
                        name: "Player 2", // player 2 name
                        position: settings.savedGame.playerTowPosition - 1, // player 2 position
                        lastPosition: settings.savedGame.playerTowLastPosition - 1, // player 2 last position
                        color: "#0d684d", // player one color
                        id: "player_1" // player 2 id
                    }
                ];

                // by default current player round is player 1
                let currentRound = settings.savedGame.playerRound;

                /**
                 * create reference from $(this)
                 * @type {*|jQuery|HTMLElement}
                 */
                const self = $(this);
                /**
                 * General Options
                 * @type {{diceResult: number, totalDice: number}}
                 */
                const vars = {
                    totalDice: 0, // total dice roll
                    diceResult: 0 // current dice roll result
                };

                /**
                 * Set Some Methods
                 * @type {{Init: Init, RollDice: RollDice, Render: Render, isOdd: (function(*): boolean)}}
                 */
                const methods = {
                    /**
                     * Setup the game HTML structure
                     * @function
                     */
                    Init: () => {
                        let html = `<h4>Total Dice Rolls ( <span id="totalRolls_${id}">${settings.savedGame.totalDice}</span> )</h4>
                                <div class="board-aria" id="${id}"></div><hr>
                        <div class="alert alert-warning" role="alert">
                            <button id="${id}-btn" type="button" class="btn btn-primary">
                                Roll Dice <span id="rollResult_${id}" class="badge badge-light">0</span>
                            </button>
                        </div>
                        <dialog id="msg" class="modal" open></dialog>
                        <div>
                            <form id="gameData" method="post" class="hide">
                                <input type="hidden" name="player_1_location" value="${settings.savedGame.playerOnePosition}">
                                <input type="hidden" name="player_2_location" value="${settings.savedGame.playerTowPosition}">
                                <input type="hidden" name="last_player_1_location" value="${settings.savedGame.playerOneLastPosition}">
                                <input type="hidden" name="last_player_2_location" value="${settings.savedGame.playerTowLastPosition}">
                                <input type="hidden" name="total_dice_rolls" value="${settings.savedGame.totalDice}">
                                <input type="hidden" name="player_round" value="${settings.savedGame.playerRound}">
                            </form>
                        </div>`
                        self.html(html);
                    },
                    /**
                     * render or re-render the game
                     * @function
                     */
                    Render: () => {
                        render(); // call render function
                        // fix game aria size
                        gameBoard.css({
                            'max-width': settings.rows * settings.squareSize + "px",
                            'min-height': settings.columns * settings.squareSize + 100 + "px"
                        })
                    },

                    /**
                     * start rolling dice
                     * @function
                     */
                    RollDice: () => {
                        // increase total dice rolls
                        vars.totalDice += 1;
                        // update display
                        $("#totalRolls_" + id).text(vars.totalDice);
                        // rolling the dice
                        // dice cant be less than 1 or more than 6
                        // so get random number from 1-6 and get number cill
                        // we dont need decimal number
                        vars.diceResult = Math.ceil(Math.random() * 6);
                        // update display
                        $("#rollResult_" + id).text(vars.diceResult);
                        showModal(`Walk ${vars.diceResult} steps forward`);

                        /**
                         * get current player
                         * @type {{color: string, name: string, lastPosition: number, position: number, id: string}}
                         */
                        let currentPlayer = players[currentRound];
                        // change current player position to increase dice result to his position
                        currentPlayer.position += vars.diceResult;

                        // check if player stop on ladder
                        settings.ladders.forEach(ladder => {
                            if (currentPlayer.position + 1 === ladder.start) {
                                currentPlayer.position = ladder.end - 1;
                                showModal("Haaaaaay, Nice Roll, you stop on ladder  now you well up to " + (currentPlayer.position + 1))
                            }
                        })
                        // check if player stop on snake
                        settings.snakes.forEach(snake => {
                            if (currentPlayer.position + 1 === snake.start) {
                                currentPlayer.position = snake.end - 1;
                                showModal("Oops, Bad Luck, you stop on Snake now you well down to " + (currentPlayer.position + 1))
                            }
                        })
                        // re-rendering
                        methods.Render();
                        // change player
                        currentRound = 1 - currentRound;
                        // update player name on screen
                        $("#playerRoundIs").text(players[currentRound].name)
                    },
                    /**
                     * check if number is odd or not
                     * @function isOdd
                     * @param position {number}
                     * @returns {boolean}
                     */
                    isOdd: (position) => {
                        return (position % 2 === 0);
                    }
                };

                // Initialize the game
                methods.Init();
                // set generated unique id
                let gameBoard = $("#" + id);
                // first render
                methods.Render();

                /**
                 * init our game board
                 * @function createBoard
                 * @returns {[]}
                 */
                function createBoard() {
                    /**
                     * init board aria
                     * @type {*[]}
                     */
                    const boardAria = [];
                    /**
                     * default start position
                     * @type {number}
                     */
                    let position = 0;
                    /**
                     * loop to create columns
                     */
                    for (let y = settings.columns; y > 0; y--) {
                        /**
                         * init rows
                         * @type {*[]}
                         */
                        let row = [];
                        // put row into board aria
                        boardAria.push(row);
                        /**
                         * loop to create rows
                         */
                        for (let x = 0; x < settings.rows; x++) {
                            // setup the rows information (details)
                            row.push({x, y, occupied: null, position, left: true})
                            position++; // increase position
                        }
                    }
                    /**
                     * return generated game board
                     */
                    return boardAria;
                }

                /**
                 * check if position we need in array of objects or not!
                 * @param elem
                 * @param arr
                 * @returns {boolean}
                 */
                function itsInArray(elem, arr) {
                    return arr.some(function (element) {
                        return element.start === elem;
                    });
                }

                /**
                 * render or re-render the game every round
                 * @function render
                 */
                function render() {
                    /**
                     *
                     * @type {*[]}
                     */
                    let boardAria = createBoard();
                    /**
                     *
                     * @type {string}
                     */
                    let html = ``;
                    /**
                     *
                     * @type {number}
                     */
                    let x = 0;
                    /**
                     *
                     * @type {number}
                     */
                    let y = 1;
                    boardAria.forEach(row => { // loop the board
                        row.forEach(plate => { // loop rows inside our board
                            /**
                             * itsDown, itUp
                             * @type {boolean}
                             * to know if the a ladder or snake!
                             */
                            let itsDown = false, itsUp = false;
                            // where player to go if there was a ladder or a snake
                            let to;

                            // check if square is snake
                            if (itsInArray(y, settings.snakes)) {
                                itsDown = true // set itsDown to true to set our style on it
                                // set square number to go var
                                to = settings.snakes.find(x => {
                                    return x.start === y
                                }).end
                                // check if square is ladder
                            } else if (itsInArray(y, settings.ladders)) {
                                itsUp = true // set itsUp to true to set our style on it
                                // set square number to go var
                                to = settings.ladders.find(x => {
                                    return x.start === y
                                }).end
                            }

                            /*
                            ladder & snake game board must be like this

                            |-42-|-41-|-40-|-39-|-38-|-37-|
                            |-31-|-32-|-33-|-34-|-35-|-36-|
                            |-30-|-29-|-28-|-27-|-26-|-25-|
                            |-19-|-20-|-21-|-22-|-23-|-24-|
                            |-18-|-17-|-16-|-15-|-14-|-13-|
                            |-07-|-08-|-09-|-10-|-11-|-12-|
                            |-01-|-02-|-03-|-04-|-05-|-06-|

                            to achieve that squares position we want to create
                            odd rows from left to right
                            and even rows from right to left
                             */
                            if (x % 2 === 0) {
                                html += `<div class="plate${itsUp ? ' up' : ''}${itsDown ? ' down' : ''}"
                                            data-to="${to}"
                                            style="position: absolute;
                                            top: ${plate.y * settings.squareSize}px;
                                            left: ${plate.x * settings.squareSize}px;
                                            width: ${settings.squareSize}px;
                                            height: ${settings.squareSize}px
                                            "><span>${y}</span></div>`
                            } else {
                                plate.left = false;
                                html += `<div class="plate${itsUp ? ' up' : ''}${itsDown ? ' down' : ''}" 
                                            data-to="${to}"
                                            style="position: absolute;
                                            top: ${plate.y * settings.squareSize}px;
                                            right: ${plate.x * settings.squareSize}px;
                                            width: ${settings.squareSize}px;
                                            height: ${settings.squareSize}px
                                            "><span>${y}</span></div>`
                            }
                            y += 1;
                        });
                        x += 1;
                    });

                    // bind generated HTML to our man game <div>
                    gameBoard.html(html);

                    // loop players no change positions
                    players.forEach(player => {
                        let plate = null;
                        boardAria.forEach(row => {
                            row.forEach(plate => {
                                RenderPlayer(player, plate, boardAria)
                            })
                        })

                    })
                }

                /**
                 * re-render players to change there positions
                 * @param player
                 * @param plate
                 * @param boardAria
                 * @function
                 */
                function RenderPlayer(player, plate, boardAria) {
                    /**
                     * init html
                     * @type {string}
                     */
                    let playersHtml = ``;
                    let isLeft = plate.left;
                    // check if current player position is same other player position
                    // we want to apply of the rules of the game
                    /**
                     * to know game rules visit
                     * @link:
                     */
                    if (plate.position === player.position) {
                        player.lastPosition = player.position;

                        playersHtml += `<div class="player" id="${player.id}" 
                                style="top:${plate.y * settings.squareSize}px;
                                ${isLeft ? 'left:' : 'right:'} ${plate.x * settings.squareSize}px;
                                background-color: ${player.color};
                                ${isLeft ? 'transform: translate(50%,50%);' : 'transform: translate(-50%,50%);'}"></div>`;
                        gameBoard.append(playersHtml);

                        const pos = plate.position;
                        if (players[1].position === players[0].position && pos !== 0) {
                            showModal("Oops,, You stopped in the same place as the other player!\n" +
                                "An unfair procedure is taking Now")

                            let back = 5;
                            if (pos < 5)
                                back = 1
                            let temp = null;
                            boardAria.forEach(row => {
                                const e = row.find(x => x.position === (pos - back));
                                if (e !== undefined) {
                                    temp = e;
                                    return false;
                                }
                            })

                            if (methods.isOdd(pos)) {
                                players[0].position -= back;
                                $(`#${players[0].id}`).remove()
                                const player1 = `<div class="player" id="${players[0].id}" style="top:${temp.y * settings.squareSize}px;${temp.left ? 'left:' : 'right:'} ${temp.x * settings.squareSize}px; background-color: ${players[0].color}"></div>`;
                                gameBoard.append(player1);

                            } else {
                                players[1].position -= back;
                                $(`#${players[1].id}`).remove()
                                const player2 = `<div class="player" id="${players[1].id}" style="top:${temp.y * settings.squareSize}px;${temp.left ? 'left:' : 'right:'} ${temp.x * settings.squareSize}px; background-color: ${players[1].color}"></div>`;
                                gameBoard.append(player2);
                            }
                        }

                        if (player.position === count) {
                            showModal(`${players[currentRound].name} Won this Game!! <br> Press Start New Game.`);
                            $(`#${id}-btn`).html('Start New Game').attr('id', `#${id}-btn_reload`).on('click', () => {
                                const mainDiv = $(`#${id}`).parent();
                                mainDiv.load('*');
                            });
                        }
                    } else if (player.position > count) {
                        player.position = player.lastPosition;
                        showModal('Oops, Bad luck, the dice did not help you this time, it has stopped in an area outside the of the game, you will remain in your place and the role will be transferred to the other player.')
                    }
                }

                $(`#${id}-btn`).on('click', () => {
                    methods.RollDice();
                    const gameData = $("#gameData");
                    gameData.find('[name="player_1_location"]').val(players[0].position + 1);
                    gameData.find('[name="player_2_location"]').val(players[1].position + 1);
                    gameData.find('[name="last_player_1_location"]').val(players[0].lastPosition + 1);
                    gameData.find('[name="last_player_2_location"]').val(players[1].lastPosition + 1);
                    gameData.find('[name="total_dice_rolls"]').val(vars.totalDice);
                    gameData.find('[name="player_round"]').val(currentRound);
                });


                function showModal(msg) {
                    const modal = $("#msg");
                    modal.html(msg)
                }

                $.fn.getToSave = () => {
                    const data = {};
                    $("#gameData").serializeArray().map(function(x){data[x.name] = x.value;})
                    return JSON.stringify(data);
                }
            });
        }
    })

})(jQuery)