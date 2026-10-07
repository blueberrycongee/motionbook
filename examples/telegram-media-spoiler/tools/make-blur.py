"""Requires Pillow. Regenerates only the original artwork's concealed static asset."""
from pathlib import Path
from PIL import Image, ImageFilter
assets = Path(__file__).resolve().parents[1] / 'assets'
Image.open(assets / 'original-still-life.png').filter(ImageFilter.GaussianBlur(76)).save(assets / 'original-still-life-blurred.png')
