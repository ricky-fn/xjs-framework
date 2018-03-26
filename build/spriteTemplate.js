let _baseSize = 1;
let unit = 'px';
// let useRem = false;

const templateFunction = (data) => {
    if (data.sprites.length === 0) {
        return "";
    }
    let shared = `.icon { background-image: url(I); background-size: W${unit} H${unit}; background-repeat: no-repeat;}`
        .replace('I', data.sprites[0].image)
        .replace('W', data.sprites[0].total_width / _baseSize)
        .replace('H', data.sprites[0].total_height / _baseSize);

    let perSprite = data.sprites.map(function (sprite) {
        return `.icon-N { width: W${unit}; height: H${unit}; background-position: X${unit} Y${unit}; }`
            .replace('N', sprite.name)
            .replace('W', sprite.width / _baseSize)
            .replace('H', sprite.height / _baseSize)
            .replace('X', sprite.offset_x / _baseSize)
            .replace('Y', sprite.offset_y / _baseSize);
    }).join('\n');

    return shared + '\n' + perSprite;
};

module.exports = (useRem, baseSize) => {
    if (useRem == true) {
        _baseSize = baseSize;
        unit = 'rem';
    }
    return templateFunction;
};