export class VTool {
    /**
     * Volume manager.
     */
    #CONTAINERS;
    #currentID;
    #gal;
    #m3;
    #currentHeight;

    /**
     * 
     * @param {List[Volume]} containers all container sizes.
     */
    constructor (containers) {
        this.#CONTAINERS = containers;
        this.#CONTAINERS.sort((a,b)=>{a.max - b.max});
        this.#gal = 0;
        this.#m3 = 0;
        this.#currentHeight = 0;

        this.capacity = 0;
    }

    set volume (gal) {
        this.#gal = gal;
        this.#m3 = GaltoM3(gal);

        for (let i = 0; i < this.#CONTAINERS.length; i++) {
            const container = this.#CONTAINERS[i];

            if (container.max > this.#m3) {
                this.#currentID = container.id;
                container.volume = this.#m3;
                this.#currentHeight = container.height;

                this.capacity = this.#m3 / container.max;

                break;
            }
        }
    }

    get volume () {
        return this.#gal;
    }

    get id () {
        return this.#currentID;
    }

    get height() {
        return this.#currentHeight;
    }
}

export class Volume {
    #ID;  // string or int doesn't matter
    #AREA;  // in m2
    #height;  // in m
    #volume;  // in m3
    #MAXVOLUME; // in m3

    /**
     * Create a volume object
     * @param {String} id unique id
     * @param {Number} a area in m2
     * @param {Number} maxh max height in m
     * @param {Number} v inital volume in m3
     */
    constructor (id, a, maxh, v=0) {
        this.#ID = id;
        this.#AREA = a;
        this.#volume = v;
        // this.#MAXVOLUME = M3toGal(max * a);
        this.#MAXVOLUME = maxh * a;
    }

    set volume (v) {  // inputted is always m3
        this.#volume = v;
        this.#height = v / this.#AREA;
    }

    get volume () {
        return this.#volume;
    }

    get height () {
        return this.#height;
    }

    get max () {
        return this.#MAXVOLUME;
    }

    get id () {
        return this.#ID;
    }
}

/**
 * Format number and truncate decimals
 * @param {Number} volume volume in gallons
 * @returns 
 */
export function format(volume, unit='US gallons') {
    let denom;
    let three;

    if (volume < 1000) {
        denom = '';
        three = volume;
    } else if (volume < 1000000) {
        denom = 'thousand';
        three = volume / 1000;
    } else if (volume < 1000000000) {
        denom = 'million';
        three = volume / 1000000;
    } else if (volume < 1000000000000) {
        denom = 'billion';
        three = volume / 1000000000;
    } else if (volume < 1000000000000000) {
        denom = 'trillion';
        three = volume / 1000000000000;
    } else if (volume < 1000000000000000000) {
        denom = 'quadrillion';
        three = volume / 1000000000000000;
    }

    let value = parseFloat(three).toPrecision(3).split('e')[0];

    return `${value} ${denom} ${unit}`;
}

export const GaltoL = gal => 3.78541 * gal;
const GaltoM3 = gal => 0.00378541 * gal;
const M3toGal = m3 => 264.172 * m3;