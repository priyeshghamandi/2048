export default class Tile {
    #tileElement;
    #x;
    #y;
    #value;
    constructor (tileContainer, value = Math.random() > .5 ? 2 : 4) {
        this.#tileElement = document.createElement('div');
        this.#tileElement.classList.add('tile');
        tileContainer.append(this.#tileElement);
        this.value = value;
    }

    get value () {
        return this.#value;
    }

    set value(val) {
        this.#value = val;
        this.#tileElement.textContent = val;
        const power =  Math.log2(val);
        const lightness = 100 - power * 9;
        this.#tileElement.style.setProperty('--bg-lightness', `${lightness}%`);
        this.#tileElement.style.setProperty('--color-lightness', `${lightness <= 50? 90 : 10}%`);
    }

    set x(value) {
        this.#x = value;
        this.#tileElement.style.setProperty('--x', value);
    }

    set y(value) {
        this.#y = value;
        this.#tileElement.style.setProperty('--y', value);
    }

    waitForTranstion(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.addEventListener(animation ? 'animationend' :'transitionend', resolve, {once: true});
        })
    }

    remove() {
        this.#tileElement.remove();
    }
}