addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY

    activeTile = null
    for(let i = 0; i < placementTiles.length; i++){
        const tile = placementTiles[i]
        if
        (
            mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size
        )
        {
            activeTile = tile
            break
        }
    }
})