from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "transparent_assets.png"
OUT = ROOT / "assets" / "transparent_elements"


ASSETS = {
    "characters/main_idle_01.png": (24, 56, 82, 134),
    "characters/main_run_01.png": (134, 56, 96, 134),
    "characters/main_run_02.png": (248, 56, 92, 134),
    "characters/main_run_03.png": (364, 56, 92, 134),
    "characters/main_walk_01.png": (28, 228, 86, 142),
    "characters/main_walk_02.png": (145, 228, 88, 142),
    "characters/main_jump_01.png": (256, 228, 92, 142),
    "characters/main_crouch_01.png": (372, 258, 92, 112),
    "skills/skill_logical_reasoning.png": (510, 70, 86, 86),
    "skills/skill_computational_thinking.png": (624, 70, 86, 86),
    "skills/skill_physics.png": (734, 70, 86, 86),
    "skills/skill_experimentation.png": (846, 70, 86, 86),
    "skills/skill_spatial_visualization.png": (510, 242, 86, 86),
    "skills/skill_problem_solving.png": (624, 242, 86, 86),
    "skills/skill_collaboration.png": (734, 242, 86, 86),
    "skills/skill_knowledge_management.png": (846, 242, 86, 86),
    "doors/door_double_glass.png": (974, 86, 124, 150),
    "doors/door_wood_01.png": (1122, 92, 82, 142),
    "doors/door_wood_02.png": (1226, 92, 82, 142),
    "doors/door_green.png": (1338, 92, 82, 142),
    "doors/wall_switch.png": (1418, 148, 24, 40),
    "windows/window_single.png": (980, 286, 72, 106),
    "windows/window_double.png": (1082, 286, 88, 106),
    "windows/window_with_plant.png": (1209, 286, 90, 106),
    "windows/door_double_blue.png": (1344, 286, 124, 136),
    "npcs/character_scientist.png": (28, 458, 92, 166),
    "npcs/character_worker.png": (138, 458, 94, 166),
    "npcs/character_woman.png": (286, 456, 96, 168),
    "npcs/character_student_black.png": (360, 456, 86, 168),
    "ui/heart_01.png": (508, 488, 38, 34),
    "ui/heart_02.png": (552, 488, 38, 34),
    "ui/heart_03.png": (596, 488, 38, 34),
    "ui/score_panel.png": (682, 470, 78, 70),
    "ui/mission_dialogue_box.png": (506, 546, 294, 74),
    "plants/plant_potted_brown.png": (918, 472, 88, 118),
    "plants/plant_potted_gray.png": (1022, 466, 72, 126),
    "wall_objects/fire_extinguisher.png": (1136, 490, 48, 84),
    "wall_objects/fire_extinguisher_sign.png": (1194, 506, 38, 50),
    "wall_objects/electrical_panel.png": (1244, 500, 38, 70),
    "decor/certificate_frame.png": (1308, 498, 88, 88),
    "decor/notice_board.png": (1396, 496, 124, 96),
    "lab_office/computer_cabinet.png": (20, 700, 92, 116),
    "lab_office/computer_tower.png": (108, 720, 52, 86),
    "lab_office/office_desk_computer.png": (164, 704, 154, 110),
    "lab_office/office_chair.png": (316, 690, 70, 126),
    "lab_office/desk_lamp.png": (390, 696, 72, 110),
    "lab_office/lab_flask_01.png": (452, 690, 46, 112),
    "lab_office/test_tubes.png": (490, 690, 90, 112),
    "lab_office/lab_flask_02.png": (556, 690, 56, 112),
    "lab_office/lab_flask_03.png": (602, 690, 60, 112),
    "lab_office/tube_01.png": (636, 704, 18, 90),
    "lab_office/whiteboard.png": (660, 680, 114, 106),
    "lab_office/bookshelf.png": (784, 680, 96, 138),
    "signs/universidade_porto_main_sign.png": (936, 694, 164, 112),
    "signs/universidade_porto_sign.png": (1134, 700, 132, 92),
    "signs/fire_extinguisher_sign.png": (1308, 696, 56, 54),
    "signs/down_arrow_sign.png": (1308, 754, 56, 54),
    "scene/floor_tile_strip.png": (20, 902, 390, 104),
    "scene/wall_tile_panel.png": (436, 890, 184, 112),
    "scene/wall_pipe_panel.png": (632, 890, 274, 112),
    "effects/sparkle_blue.png": (940, 892, 28, 28),
    "effects/sparkle_green.png": (1022, 892, 28, 28),
    "effects/sparkle_purple.png": (1102, 892, 28, 28),
    "effects/sparkle_orange.png": (1186, 892, 28, 28),
    "effects/sparkle_cyan.png": (1268, 892, 28, 28),
    "effects/sparkle_red.png": (1350, 892, 28, 28),
    "effects/sparkle_pink.png": (1432, 892, 28, 28),
    "ui/button_play.png": (924, 948, 60, 52),
    "ui/button_black_01.png": (1006, 948, 60, 52),
    "ui/button_black_02.png": (1088, 948, 60, 52),
    "ui/button_black_03.png": (1170, 948, 60, 52),
    "ui/button_black_04.png": (1252, 948, 60, 52),
    "ui/button_empty_dashed.png": (1334, 948, 60, 52),
}


def trim_alpha(image):
    bbox = image.getbbox()
    if not bbox:
        return image
    return image.crop(bbox)


def main():
    source = Image.open(SOURCE).convert("RGBA")
    OUT.mkdir(parents=True, exist_ok=True)

    for name, (x, y, width, height) in ASSETS.items():
        crop = source.crop((x, y, x + width, y + height))
        crop = trim_alpha(crop)
        target = OUT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        crop.save(target)

    manifest = OUT / "manifest.txt"
    manifest.write_text("\n".join(sorted(str(path.relative_to(OUT)) for path in OUT.rglob("*.png"))) + "\n")
    print(f"extracted {len(ASSETS)} assets")
    print(f"output: {OUT}")


if __name__ == "__main__":
    main()
