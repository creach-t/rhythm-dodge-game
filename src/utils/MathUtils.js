/**
 * Utilitaires mathématiques pour le jeu
 */

// Conversion degrés vers radians
export const degToRad = (degrees) => (degrees * Math.PI) / 180;

// Conversion radians vers degrés
export const radToDeg = (radians) => (radians * 180) / Math.PI;

// Clamp une valeur entre min et max
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Interpolation linéaire
export const lerp = (start, end, factor) => start + (end - start) * factor;

// Distance entre deux points 2D
export const distance2D = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Distance entre deux points 3D
export const distance3D = (p1, p2) => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2) + 
    Math.pow(p2.z - p1.z, 2)
  );
};

// Position sur un cercle
export const circlePosition = (centerX, centerZ, radius, angleRad) => ({
  x: centerX + radius * Math.cos(angleRad),
  z: centerZ + radius * Math.sin(angleRad)
});

// Normalise un vecteur 3D
export const normalize3D = (vector) => {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
};

// Génère un nombre aléatoire entre min et max
export const randomRange = (min, max) => Math.random() * (max - min) + min;

// Génère un entier aléatoire entre min et max (inclus)
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Choisit un élément aléatoire dans un tableau
export const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Smoothstep function pour les animations
export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Easing functions
export const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
export const easeIn = (t) => t * t;
export const easeOut = (t) => t * (2 - t);

// Vérifie si un point est dans un cercle
export const isPointInCircle = (pointX, pointZ, centerX, centerZ, radius) => {
  return distance2D(pointX, pointZ, centerX, centerZ) <= radius;
};