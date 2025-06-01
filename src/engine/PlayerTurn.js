export function handlePlayerTurn({ player, enemyGroup, onComplete }) {
  const maxHealth = player.userData.maxHealth || 100;

  const healPlayer = () => {
    const healAmount = 20;
    player.userData.health = Math.min(maxHealth, player.userData.health + healAmount);
    console.log(`Le joueur se soigne (+${healAmount} HP). Vie actuelle : ${player.userData.health}`);
  };

  const damageEnemy = (enemy) => {
    const damage = 25;
    enemy.userData.health -= damage;
    console.log(`Le joueur attaque un ennemi (-${damage} HP). Vie restante : ${enemy.userData.health}`);

    if (enemy.userData.health <= 0) {
      enemyGroup.remove(enemy);
      console.log("L'ennemi est vaincu !");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'h') {
      healPlayer();
      endTurn();
    } else if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      const enemy = enemyGroup.children[index];
      if (enemy) {
        damageEnemy(enemy);
        endTurn();
      } else {
        console.log("Aucun ennemi à cet index.");
      }
    }
  };

  const endTurn = () => {
    window.removeEventListener('keydown', onKeyDown);
    onComplete();
  };

  console.log("Tour du joueur : appuie sur 'h' pour te soigner, ou '1'-'9' pour attaquer un ennemi.");
  window.addEventListener('keydown', onKeyDown);
}