from pathlib import Path
from PIL import Image

src = Image.open(r"D:\backup pc\workspace\labellaflor\public\img\instagram-ref.jpg").convert("RGB")
out = Path(r"D:\backup pc\workspace\labellaflor\public\img")

left, right, top = 43, 934, 145
inner = right - left
gutter = 2
tile = (inner - 2 * gutter) // 3

posts = []
for i in range(3):
    x0 = left + i * (tile + gutter)
    post = src.crop((x0, top, x0 + tile, top + tile)).resize((1200, 1200), Image.Resampling.LANCZOS)
    posts.append(post)
    post.save(out / f"_post{i + 1}.jpg", quality=93)

# Split each IG collage post into quadrants for cleaner singles
names = ["p1.jpg", "p2.jpg", "p3.jpg", "p4.jpg", "p5.jpg", "p6.jpg", "p7.jpg", "p8.jpg"]
idx = 0
for post in posts:
    w, h = post.size
    quads = [
        (0, 0, w // 2, h // 2),
        (w // 2, 0, w, h // 2),
        (0, h // 2, w // 2, h),
        (w // 2, h // 2, w, h),
    ]
    for box in quads:
        if idx >= len(names):
            break
        q = post.crop(box).resize((1020, 1020), Image.Resampling.LANCZOS)
        q.save(out / names[idx], quality=93)
        print("saved", names[idx])
        idx += 1

# Hero: professional black set (usually top-left of first post)
posts[0].crop((0, 0, 600, 600)).resize((1400, 1400), Image.Resampling.LANCZOS).save(
    out / "hero.jpg", quality=94
)
Image.open(out / "p1.jpg").save(out / "ch3.jpg", quality=92)
Image.open(out / "p5.jpg").save(out / "ch1.jpg", quality=92)
Image.open(out / "p2.jpg").save(out / "ch2.jpg", quality=92)
Image.open(out / "p7.jpg").save(out / "detail.jpg", quality=92)
print("hero ok")
