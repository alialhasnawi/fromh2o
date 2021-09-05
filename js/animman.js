export class AnimMan {
    /**
     * Incremental animation manager with target support.
     */

    #EPSILON;
    #DELTA;
    #origins;
    #targets;
    #functions;

    /**
     * 
     * @param {Number} epsilon boundary of value change
     * @param {Number} delta change increment
     */
    constructor(epsilon=0.01, delta=0.05) {
        this.#EPSILON = epsilon;
        this.#DELTA = delta;
        this.#origins = {};
        this.#targets = {};
        this.#functions = {};
    }

    /**
     * Add an origin object of what to be updated.
     * @param {String} name id of animation origin
     * @param {Vector3} vector origin vector3 {x, y, z} object
     */
    origin(name, vector, func=undefined) {
        this.#origins[name] = vector;
        if (func) {
            this.#functions[name] = func;
        }
    }

    /**
     * Add a target for an origin object to increment.
     * @param {String} name id of animation target
     * @param {Vector3} vector target vector3 {x, y, z} object
     */
    target(name, vector) {
        this.#targets[name] = normalize(vector);
    }
    
    /**
     * Increment all targets.
     */
    tick() {
        for (const name in this.#targets) {
            const target = this.#targets[name];
            const origin = this.#origins[name];

            let dx = target.x - origin.x;
            let dy = target.y - origin.y;
            let dz = target.z - origin.z;

            if (Math.abs(dx) < this.#EPSILON) {
                origin.x = target.x;
            } else {
                origin.x += this.#DELTA * (target.x - origin.x);
            }

            if (Math.abs(dy) < this.#EPSILON) {
                origin.y = target.y;
            } else {
                origin.y += this.#DELTA * (target.y - origin.y);
            }

            if (Math.abs(dz) < this.#EPSILON) {
                origin.z = target.z;
            } else {
                origin.z += this.#DELTA * (target.z - origin.z);
            }

            if (origin.x == target.x && origin.y == target.y && origin.z == target.z) {
                delete this.#targets[name];
            }

            if (this.#functions[name]) {
                this.#functions[name](origin);
            }
        }
    }
}

/**
 * Sanitize and parseFloat
 * @param {Vector3} vector vector3 object
 */
function normalize(vector) {
    let nv = {};

    if (Array.isArray(vector)){
        nv.x = parseFloat(vector[0]);
        nv.y = parseFloat(vector[1]);
        nv.z = parseFloat(vector[2]);
    } else {
        nv.x = parseFloat(vector.x);
        nv.y = parseFloat(vector.y);
        nv.z = parseFloat(vector.z);
    }

    return nv;
}