import Grid from './Grid';
import Tile from './Tile';

const gameBoard = document.getElementById('game-board');
const grid = new Grid(gameBoard);
let xDown = null;                                                        
let yDown = null;
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

setupInput();
function setupInput() {
    window.addEventListener('keydown', handleInput, {once: true});
    document.addEventListener('touchstart', handleTouchStart, false);        
    document.addEventListener('touchmove', handleTouchMove, false);
}

function getTouches(evt) {
    return evt.touches ||             // browser API
           evt.originalEvent.touches; // jQuery
  }  

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};  


function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) {
            if(!canMoveRight()) {
                setupInput();
                return;                
            }
            await moveRight();
            break;
        } else {
            if(!canMoveLeft()) {
                setupInput();
                return;                
            }
            await moveLeft();
            break;
        }                       
    } else {
        if ( yDiff > 0 ) {
            if(!canMoveDown()) {
                setupInput();
                return;                
            }
            await moveDown();
            break;
        } else { 
            if(!canMoveUp()) {
                setupInput();
                return;                
            }
            await moveUp();
            break;
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

async function handleInput(e) {
    switch (e.key) {
        case 'ArrowUp':
            if(!canMoveUp()) {
                setupInput();
                return;                
            }
            await moveUp();
            break;
        case 'ArrowDown':
            if(!canMoveDown()) {
                setupInput();
                return;                
            }
            await moveDown();
            break;
        case 'ArrowLeft':
            if(!canMoveLeft()) {
                setupInput();
                return;                
            }
            await moveLeft();
            break;
        case 'ArrowRight':
            if(!canMoveRight()) {
                setupInput();
                return;                
            }
            await moveRight();
            break;
        default:
            setupInput();
            break;                
    }

    grid.cells.forEach(cell => cell.mergeTiles());
    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTranstion(true).then(() => {
            alert('You Lose!');
            window.location.href = '/';
        });
        return;
    }
    setupInput();
}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function canMoveUp() {
    return canMove(grid.cellsByColumn);
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()));
}

function canMoveLeft() {
    return canMove(grid.cellsByRow);
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()));
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false;
            if (cell.tile == null)  return false;
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        })
    })
}


function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = [];
            for(let i=0; i < group.length; i++) {
                const cell = group[i];
                if(cell.tile == null) continue;
                let lastValidCell;
                for(let j=i-1; j >= 0; j--) {
                    const moveToCell = group[j];
                    if(!moveToCell.canAccept(cell.tile)) break;
                    lastValidCell = moveToCell;
                }
                if(lastValidCell != null) {
                    promises.push(cell.tile.waitForTranstion())
                    if(lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile;
                    } else {
                        lastValidCell.tile = cell.tile;
                    }
                    cell.tile = null;
                }
            }
            return promises;
        })

    )


    
}