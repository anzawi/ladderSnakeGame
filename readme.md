

## to generate Game

```html
<div id="myGame"></div>
```

```js
$("#myGame").LadderSnake();
```

by default generated game will be (4 rows & 6 columns).

### to customize game size: 

```js
$("#myGame").LadderSnake({
    rows: 10,
    columns: 10
})
```

> pleas note minimum values (rows => 4, columns => 6)
>
> and maximum values (rows => 10, columns => 10)



## Ladders & Snakes :

by default ladders and snakes will be like this:

#### Ladders

| Start | End  |
| :---: | :--: |
|   3   |  10  |
|   7   |  14  |
|  13   |  22  |

#### Snakes

| Start | End  |
| :---: | :--: |
|  11   |  2   |
|  16   |  8   |
|  23   |  5   |



### Customize Ladders & Stake

to customize ladders and snakes , send positions start and end as option (array of objects)

```js
$("#myGame").LadderSnake({
    ladders: [
        {
            start: square_start_number,
            end  : square_end_number,
        },
         {
            start: square_start_number_2,
            end  : square_end_number_2,
        },
		// ... etc
    ],
    snakes: [
         {
            start: square_start_number,
            end  : square_end_number,
        },
         {
            start: square_start_number_2,
            end  : square_end_number_2,
        },
		// ... etc
    ]
});
```



### Square Size

by default square size (80px * 80px)

to customize square size

```js
$("#myGame").LadderSnake({
    squareSize: 100, // 100px * 100px
})
```

### Save Game
by default the game is Savable, 
##### to disable savable
 ```js
$("#myGame").LadderSnake({
    savable: false
})
```
##### to save game
```js
let myGame = $("#myGame").LadderSnake();
const currentGameInfo = myGame.getToSave();
```
`getToSave()` method returns an object contain game data
the retruns values
```json
{
  "player_1_location":"1",
  "player_2_location":"1",
  "last_player_1_location":"1",
  "last_player_2_location":"1",
  "total_dice_rolls":"0",
  "player_round":"0"
}
``` 



### Load Saved Game

```js
$("#myGame").LadderSnake({
    savedGame: {
        totalDice: 0, // total dice roll
        playerRound: 0, // current player round
        playerOnePosition: 1, // player_1 location
        playerTowPosition: 1, // // player_2 location
        playerOneLastPosition: 1, // player_1 prevuse location
        playerTowLastPosition: 1 // player_2 prevuse location
})
```

