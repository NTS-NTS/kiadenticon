SCALE = 0

function hex_to_rgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}

function hex_to_binary(hex) {
    var bigint = parseInt(hex, 16);
    var binary = bigint.toString(2);
    return binary;
}

function get_color(value) {
    var r = value[0] + "0";
    var g = value[1] + "0";
    var b = value[2] + "0";
    return hex_to_rgb(r + g + b);
}

function shift_color(color, value_red, value_green, value_blue) {
    var blue, green, new_blue, new_green, new_red, red;
    console.log("original color: " + color);
    red = color[0] + value_red;
    green = color[1] + value_green;
    blue = color[2] + value_blue;
    new_red = Math.min(Math.max(red, 0), 255);
    new_green = Math.min(Math.max(green, 0), 255);
    new_blue = Math.min(Math.max(blue, 0), 255);
    console.log("new color: " + [new_red, new_green, new_blue]);
    return [new_red, new_green, new_blue];
}  

function update_edge(available, edge, new_list, width) {
    var new_available = available.concat(new_list);
    var new_edge = edge.concat(new_list);
    
    for (var i = 0; i < new_list.length; i++) {
        var adjacent = [
            new_list[i] - 1,
            new_list[i] + 1,
            new_list[i] - width,
            new_list[i] + width
        ]

        for (var j = 0; j < adjacent.length; j++) {
            if (new_edge.includes(adjacent[j])) {
                new_edge.splice(new_edge.indexOf(adjacent[j]), 1);
            }
        }
    }

    return [new_available, new_edge];
}

function draw_background(ctx, value, color) {
    var available_tile = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 14,15,
        16,17,22,23,
        24,25,30,31,
        32,33,38,39,
    ];

    var color1 = color;
    var color2 = shift_color(color, 32, 64, -52);
    var color3 = shift_color(color, 64, -32, 16);

    // iterate available_tile
    for (var i = 0; i < available_tile.length; i++) {
        var tile = available_tile[i];
        color = color1;
        
        if (tile % 8 === 0 || (tile + 1) % 8 === 0) {
            color = color2;
        } else if (tile < 8 || tile > 32) {
            color = color3;
        }
        
        let x = tile % 8;
        let y = Math.floor(tile / 8);
        draw_tile(ctx, x, y, value[i], color);
    }
}

function draw_tile(ctx, x, y, value, color) {
    value = hex_to_binary(value);
    scale = SCALE;
    x = x*scale*2;
    y = y*scale*2;

    for (var i = 0; i < 4; i++) {
        if (value[i] === "1") {
            let row = Math.floor(i / 2) * scale;
            let col = (i % 2) * scale;
            
            ctx.beginPath();
            ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
            ctx.roundRect(x + col, y + row, scale, scale, scale/4)
            ctx.fill();
        }
    }
}

function draw_face(ctx, value, color) {
    value = hex_to_binary(value);
    scale = SCALE;

    var x = scale*5
    var y = scale*3

    var available_tile = [
        2, 3,
        7, 8, 9, 10,
        12, 13, 14, 15, 16, 17,
        18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29,
        31, 32, 33, 34,
        38, 39,
    ];

    var edge_tile = [
        2, 3, 
        7, 10,
        12, 17,
        24, 29,
        31, 34,
        38, 39,
    ];

    var top_addition = [
        [1, 4],
        [6, 11],
        [0, 5],
    ];

    var bottom_addition = [
        [37, 40],
        [30, 35],
        [36, 41],
    ];

    var top_value = parseInt(value.slice(0, 2), 2);
    for (var i = 0; i < top_value; i++) {
        updated_list = update_edge(available_tile, edge_tile, top_addition[i], 6);
        available_tile = updated_list[0];
        edge_tile = updated_list[1];
    }
    
    var bottom_value = parseInt(value.slice(2, 4), 2);
    for (var i = 0; i < bottom_value; i++) {
        updated_list = update_edge(available_tile, edge_tile, bottom_addition[i], 6);
        available_tile = updated_list[0];
        edge_tile = updated_list[1];
    }

    for (var i = 0; i < available_tile.length; i++) {
        var tile = available_tile[i];
        let row = Math.floor(tile / 6) * scale;
        let col = (tile % 6) * scale;

        ctx.beginPath();
        ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        if (edge_tile.includes(tile)) {
            var x_tile = (Math.floor(col/scale) < 3) ? x + col : x + col -  scale;
            var y_tile = (Math.floor(row/scale) < 3) ? y + row : y + row - scale;

            ctx.roundRect(x_tile, y_tile, scale*2, scale*2, scale/4)
            ctx.fill();

        } else {
            ctx.rect(x + col, y + row, scale, scale, scale/4)
            ctx.fill();
        }
        draw_tile(ctx, x + col, y + row, value[i], color);
    }
}

function draw_body(ctx, value, color) {
    value = parseInt(value, 16);
    color = shift_color(color, 32, 32, -52);
    scale = SCALE

    var tile_addition = [
        [5, 8],
        [56, 69],
        [43, 54],
        [30, 39],
        [42, 55],
        [29, 40],
        [17, 24],
        [28, 41],
        [16, 25],
        [4, 9],
        [3, 10],
        [15, 26],
        [2, 11],
        [14, 27],
        [1, 12],
        [0, 13],
    ];

    var x = scale*1;
    var y = scale*11;

    var available_tile = [
        6, 7,
        18, 19, 20, 21, 22, 23,
        31, 32, 33, 34, 35, 36, 37, 38,
        44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
        57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68
    ];

    var edge_tile = [
        6, 7,
        18, 23,
        31, 38,
        44, 53,
        57, 68
    ];

    for (var i = 0; i < value; i++) {
        updated_list = update_edge(available_tile, edge_tile, tile_addition[i], 14);
        available_tile = updated_list[0];
        edge_tile = updated_list[1];
    }

    for (var i = 0; i < available_tile.length; i++) {
        var tile = available_tile[i];
        let row = Math.floor(tile / 14) * scale;
        let col = (tile % 14) * scale;

        ctx.beginPath();
        ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        if (edge_tile.includes(tile)) {
            var x_tile = (Math.floor(col/scale) < 7) ? x + col : x + col -  scale;

            ctx.roundRect(x_tile, y + row, scale*2, scale*2, scale/4)
            ctx.fill();

        } else {
            ctx.rect(x + col, y + row, scale, scale, scale/4)
            ctx.fill();
        }
        draw_tile(ctx, x + col, y + row, value[i], color);
    }
}

function main() {
    var edittext = document.getElementById("id");
    var canvas = document.getElementById("canvas");
    SCALE = canvas.width / 16;
    var ctx = canvas.getContext("2d");
    edittext.addEventListener("keydown", function(event) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        var id = edittext.value;
        var hash = md5(id);
        
        
        var bgColor = get_color(hash.slice(0, 3));
        var fgColor = get_color(hash.slice(3, 6));
        draw_face(ctx, hash.slice(6, 7), fgColor);
        draw_body(ctx, hash.slice(7, 8), fgColor);
        draw_background(ctx, hash.slice(8, 32), bgColor);
    });
}