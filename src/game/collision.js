/**
 * Check collision between a bullet and a fruit
 * Uses circle-rectangle collision detection
 * @param {Object} bullet - Bullet object
 * @param {Object} fruit - Fruit object
 * @returns {boolean} - Whether collision occurred
 */
export const checkCollision = (bullet, fruit) => {
  // Treat fruit as a circle centered at (fruit.x, fruit.y)
  const fruitRadius = fruit.size / 2;

  // Treat bullet as a rectangle
  const bulletLeft = bullet.x - bullet.width / 2;
  const bulletRight = bullet.x + bullet.width / 2;
  const bulletTop = bullet.y - bullet.height / 2;
  const bulletBottom = bullet.y + bullet.height / 2;

  // Find closest point on rectangle to circle center
  const closestX = Math.max(bulletLeft, Math.min(fruit.x, bulletRight));
  const closestY = Math.max(bulletTop, Math.min(fruit.y, bulletBottom));

  // Calculate distance from closest point to circle center
  const distanceX = fruit.x - closestX;
  const distanceY = fruit.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < fruitRadius * fruitRadius;
};

/**
 * Process all collisions between bullets and fruits
 * @param {Array} bullets - Array of bullet objects
 * @param {Array} fruits - Array of fruit objects
 * @returns {Object} - { remainingBullets, remainingFruits, destroyedFruits }
 */
export const processCollisions = (bullets, fruits) => {
  const bulletsToRemove = new Set();
  const destroyedFruits = [];

  for (const bullet of bullets) {
    for (const fruit of fruits) {
      if (checkCollision(bullet, fruit)) {
        bulletsToRemove.add(bullet.id);
        fruit.currentHits++;

        if (fruit.currentHits >= fruit.hits) {
          destroyedFruits.push(fruit);
        }
        break; // Each bullet can only hit one fruit
      }
    }
  }

  const remainingBullets = bullets.filter((b) => !bulletsToRemove.has(b.id));
  const remainingFruits = fruits.filter(
    (f) => !destroyedFruits.some((d) => d.id === f.id)
  );

  return {
    remainingBullets,
    remainingFruits,
    destroyedFruits,
  };
};
