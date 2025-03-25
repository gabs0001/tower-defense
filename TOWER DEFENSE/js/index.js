const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const placementTilesData2D = []

for(let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []
placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if(symbol === 14) {
            //adicionar construções aqui
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            )
        }
    })
})

const image = new Image()
image.onload = () => animate()
image.src = 'img/gameMap.png'

const enemies = []

const spawnEnemies = spawnCount => {
    for(let i = 1; i < spawnCount + 1; i++) {
        const xOffset = i * 150
        enemies.push(
            new Enemy({
                position: {
                    x: waypoints[0].x - xOffset,
                    y: waypoints[0].y
                }
            })
        )
    }
}

const buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 100
const explosions = []
spawnEnemies(enemyCount)

const animate = () => {
    const animationId = requestAnimationFrame(animate)
    
    c.drawImage(image, 0, 0)
    
    for(let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.updateEnemy()
        //verifica se o inimigo chegou ao final do caminho e o remove
        if(enemy.position.x > canvas.width) {
            hearts -= 1
            enemies.splice(i, 1)
            document.getElementById('hearts').innerHTML = hearts
            if(hearts === 0) {
                console.log('game over')
                cancelAnimationFrame(animationId)
                document.getElementById('gameOver').style.display = "flex"
            }
        }
    }

    //gerando as explosões
    for(let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]
        explosion.draw()
        explosion.update()
        if(explosion.frames.current >= explosion.frames.max - 1) explosions.splice(i, 1)
    }

    //gerando inimigos na tela
    if(enemies.length === 0) {
        enemyCount += 2
        spawnEnemies(enemyCount)
    }

    placementTiles.forEach(tile => tile.update(mouse))

    buildings.forEach(building => {
        building.updateBuilding()
        building.target = null
        const validEnemies = enemies.filter(enemy => {
            //colisão do prédio com o inimigo dentro do seu raio de ação
            const xDifference = enemy.center.x - building.center.x
            const yDifference = enemy.center.y - building.center.y
            const distance = Math.hypot(xDifference, yDifference)
            return distance < enemy.radius + building.radius
        })
        building.target = validEnemies[0]

        for(let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i]
            projectile.update()

            //cálculo da distância entre o inimigo e o projétil
            const xDifference = projectile.enemy.center.x - projectile.position.x
            const yDifference = projectile.enemy.center.y - projectile.position.y
            const distance = Math.hypot(xDifference, yDifference)

            //colisão do projétil com o inimigo
            if(distance < projectile.enemy.radius + projectile.radius) {
                projectile.enemy.health -= 20
                if(projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex(enemy => {
                        return projectile.enemy === enemy
                    })
                    if(enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1)
                        coins += 25
                        document.getElementById('coins').innerHTML = coins
                    }
                }
                
                explosions.push(
                    new Sprite({
                        position: {
                            x: projectile.position.x,
                            y: projectile.position.y
                        },
                        imageSrc: './img/explosion.png',
                        frames: { max: 4 },
                        offset: {
                            x: 0,
                            y: 0
                        }
                    })
                )

                building.projectiles.splice(i, 1)
            }
        }
    })
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', () => {
    if(activeTile && !activeTile.isOccupied && coins - 50 >= 0) {
        coins -= 50
        document.getElementById('coins').innerHTML = coins
        buildings.push(
            new Building({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
            })
        )
        activeTile.isOccupied = true
        buildings.sort((a, b) => { return a.position.y - b.position.y })
    }
})