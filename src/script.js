import Grid from './Grid';
import Tile from './Tile';

const gameBoard = document.getElementById('game-board');
const grid = new Grid(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

setupInput();
function setupInput() {
    window.addEventListener('keydown', handleInput, {once: true});
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchmove', handleTouchMove, false);
    window.addEventListener('touchend', handleTouchEnd, false);

    window.addEventListener('swiped-left',  handleLeft, {once: true});
    window.addEventListener('swiped-right',  hadnleRight, {once: true});
    window.addEventListener('swiped-up',  hadnleUp, {once: true});
    window.addEventListener('swiped-down',  hadnleDown, {once: true});

}

async function handleLeft() {  
     handleInput({key: 'ArrowLeft'})
}

async function hadnleRight() {
    handleInput({key: 'ArrowRight'})
}

async function hadnleUp() { 
    handleInput({key: 'ArrowUp'})
}

async function hadnleDown() { 
    handleInput({key: 'ArrowDown'})
}



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

let xDown = null;
let yDown = null;
let xDiff = null;
let yDiff = null;
let timeDown = null;
let startEl = null;

function handleTouchEnd(e) {
    if (startEl !== e.target) return;

    let swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10); // default 20px
    let swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);    // default 500ms
    let timeDiff = Date.now() - timeDown;
    let eventType = '';
    let changedTouches = e.changedTouches || e.touches || [];

    if (Math.abs(xDiff) > Math.abs(yDiff)) { 
        if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (xDiff > 0) {
                eventType = 'swiped-left';
            }
            else {
                eventType = 'swiped-right';
            }
        }
    }
    else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (yDiff > 0) {
            eventType = 'swiped-up';
        }
        else {
            eventType = 'swiped-down';
        }
    }

    if (eventType !== '') {

        let eventData = {
            dir: eventType.replace(/swiped-/, ''),
            touchType: (changedTouches[0] || {}).touchType || 'direct',
            xStart: parseInt(xDown, 10),
            xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
            yStart: parseInt(yDown, 10),
            yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
        };
        
        startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));
        startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
    }

    // reset values
    xDown = null;
    yDown = null;
    timeDown = null;
}

function handleTouchStart(e) {
    if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

    startEl = e.target;

    timeDown = Date.now();
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
    xDiff = 0;
    yDiff = 0;
}
function handleTouchMove(e) {
    if (!xDown || !yDown) return;

    let xUp = e.touches[0].clientX;
    let yUp = e.touches[0].clientY;

    xDiff = xDown - xUp;
    yDiff = yDown - yUp;
}

function getNearestAttribute(el, attributeName, defaultValue) {
    while (el && el !== document.documentElement) {

        let attributeValue = el.getAttribute(attributeName);

        if (attributeValue) {
            return attributeValue;
        }

        el = el.parentNode;
    }

    return defaultValue;
}

