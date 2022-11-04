from PIL import Image, ImageDraw, ImageShow
from Crypto.Hash import MD5
import argparse
import random

SCALE = 64

def hex_to_rgb(value):
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

def hex_to_bin(value):
    return bin(int(value, 16))[2:].zfill(8)

def get_color(value):
    red = value[0] + "0"
    green = value[1] + "0"
    blue = value[2] + "0"
    return hex_to_rgb(red + green + blue)

def shift_color(color, value_red, value_green, value_blue):

    red = color[0] + value_red
    green = color[1] + value_green
    blue = color[2] + value_blue

    new_red = red if (red <= 255 or red >= 0) else (255 if red > 255 else 0)
    new_green = green if (green <= 255 or green >= 0) else (255 if green > 255 else 0)
    new_blue = blue if (blue <= 255 or blue >= 0) else (255 if blue > 255 else 0)

    return (new_red, new_green, new_blue)

def update_edge(available, edge, new, width):
    available += new
    edge += new

    for n in new:
        adjacent = [
            n - 1,
            n + 1,
            n - width,
            n + width,
        ]

        for adj in adjacent:
            if adj in edge:
                edge.remove(adj)

def draw_body(image, value, color):
    value = int(value, 16)
    draw = ImageDraw.Draw(image)
    color = shift_color(color, 32, 32, -52)
    scale = SCALE

    tile_addition = [
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
    ]

    x = scale*1
    y = scale*11

    available_tile = [
        6, 7,
        18, 19, 20, 21, 22, 23,
        31, 32, 33, 34, 35, 36, 37, 38,
        44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
        57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68
    ]

    edge_tile = [
        6, 7,
        18, 23,
        31, 38,
        44, 53,
        57, 68
    ]

    for i in range(0, value):
        update_edge(available_tile, edge_tile, tile_addition[i], 14)

    for tile in available_tile:
        row = (tile // 14) * scale
        col = (tile % 14) * scale
        if tile in edge_tile:
            x_tile = x + col if (col // scale < 7) else x + col - scale
            
            draw.rounded_rectangle(
                (x_tile, y + row, x_tile+scale*2, y+row+scale*2),
                fill=color,
                radius=scale/4
            )
        else:
            draw.rectangle(
                (x + col, y + row, x+col+scale, y+row+scale),
                fill=color,
            )

def draw_face(image, value, color):
    value = int(value, 16)
    value = hex_to_bin(str(value))[4:]
    draw = ImageDraw.Draw(image)
    scale = SCALE

    x = scale*5
    y = scale*3

    available_tile = [
        2, 3,
        7, 8, 9, 10,
        12, 13, 14, 15, 16, 17,
        18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29,
        31, 32, 33, 34,
        38, 39,
    ]

    edge_tile = [
        2, 3, 
        7, 10,
        12, 17,
        24, 29,
        31, 34,
        38, 39,
    ]

    top_addition = [
        [1, 4],
        [6, 11],
        [0, 5],
    ]

    bottom_addition = [
        [37, 40],
        [30, 35],
        [36, 41],
    ]

    top_value = int(value[0:2], 2)
    for i in range(0, top_value):
        update_edge(available_tile, edge_tile, top_addition[i], 6)

    bottom_value = int(value[2:4], 2)
    for i in range(0, bottom_value):
        update_edge(available_tile, edge_tile, bottom_addition[i], 6)

    for tile in available_tile:
        row = (tile // 6) * scale
        col = (tile % 6) * scale

        if tile in edge_tile:
            x_tile = x + col if (col // scale < 3) else x + col - scale
            y_tile = y + row if (row // scale < 3) else y + row - scale

            draw.rounded_rectangle(
                (x_tile, y_tile, x_tile+scale*2, y_tile+scale*2),
                fill=color,
                radius=scale/4
            )
        else:
            draw.rectangle(
                (x + col, y + row, x+col+scale, y+row+scale),
                fill=color,
            )

def draw_tile(draw, x, y, value, color):
    value = hex_to_bin(value)[4:]
    scale = SCALE
    x = x*scale*2
    y = y*scale*2

    for i in range(4):
        if value[i] == '1':
            row = (i // 2) * scale
            col = (i % 2) * scale
            draw.rounded_rectangle(
                (x + col, y + row, x+col+scale, y+row+scale),
                fill=color,
                radius=scale//4
            )

def draw_background(image, value, color):
    draw = ImageDraw.Draw(image)
    valueIndex = 0
    available_tile = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 14,15,
        16,17,22,23,
        24,25,30,31,
        32,33,38,39,
    ]

    color1 = color
    color2 = shift_color(color, 32, 64, -52)
    color3 = shift_color(color, 64, -32, 16)

    for tile in available_tile:
        color = color1

        if tile % 8 == 0 or (tile + 1) % 8 == 0:
            color = color2
        elif tile < 8 or tile > 32:
            color = color3

        x = tile % 8
        y = tile // 8
        draw_tile(draw, x, y, value[valueIndex], color)
        valueIndex += 1


if __name__=="__main__":
    # get cli arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=False)
    args = parser.parse_args()

    # get id
    id = args.id if (args.id) else str(random.randint(0, 2**64-1))
    hash = MD5.new(id.encode('utf-8')).hexdigest()

    bgColor = get_color(hash[0:3])
    fgColor = get_color(hash[3:6])

    img = Image.new('RGB', (16 * SCALE, 16 * SCALE), color = "white")
    draw_face(img, hash[6:7], fgColor)
    draw_body(img, hash[7:8], fgColor)
    draw_background(img, hash[8:32], bgColor)

    viewer = ImageShow.WindowsViewer()
    viewer.show(img)
