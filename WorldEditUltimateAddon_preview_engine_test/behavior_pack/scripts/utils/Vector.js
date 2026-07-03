/**
 * Vector3 - Represents a 3D position
 * Immutable vector operations
 */
export class Vector3 {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.z = Math.floor(z);
  }

  /**
   * Create vector from Location object
   * @param {Location} location
   * @returns {Vector3}
   */
  static fromLocation(location) {
    return new Vector3(location.x, location.y, location.z);
  }

  /**
   * Get min/max bounds of two vectors
   * @param {Vector3} other
   * @returns {{min: Vector3, max: Vector3}}
   */
  getBounds(other) {
    return {
      min: new Vector3(
        Math.min(this.x, other.x),
        Math.min(this.y, other.y),
        Math.min(this.z, other.z)
      ),
      max: new Vector3(
        Math.max(this.x, other.x),
        Math.max(this.y, other.y),
        Math.max(this.z, other.z)
      )
    };
  }

  /**
   * Get distance to another vector
   * @param {Vector3} other
   * @returns {number}
   */
  distance(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get absolute distance (manhattan distance)
   * @param {Vector3} other
   * @returns {number}
   */
  absDistance(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
  }

  /**
   * Add vector
   * @param {Vector3} other
   * @returns {Vector3}
   */
  add(other) {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /**
   * Subtract vector
   * @param {Vector3} other
   * @returns {Vector3}
   */
  subtract(other) {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  /**
   * Multiply by scalar
   * @param {number} scalar
   * @returns {Vector3}
   */
  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Clone vector
   * @returns {Vector3}
   */
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return `${this.x}, ${this.y}, ${this.z}`;
  }

  /**
   * Check equality
   * @param {Vector3} other
   * @returns {boolean}
   */
  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
}
