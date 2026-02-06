// Generate PNG icons from pure JavaScript (no dependencies)
// Uses a minimal PNG encoder

const fs = require('fs');
const path = require('path');

function createPNG(width, height, drawFn) {
    const pixels = new Uint8Array(width * height * 4);
    drawFn(pixels, width, height);

    // Build PNG
    const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    function crc32(buf) {
        let crc = -1;
        for (let i = 0; i < buf.length; i++) {
            crc = (crc >>> 8) ^ crc32Table[(crc ^ buf[i]) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    }

    const crc32Table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crc32Table[i] = c;
    }

    function chunk(type, data) {
        const typeBytes = Buffer.from(type);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length, 0);
        const combined = Buffer.concat([typeBytes, data]);
        const crcVal = crc32(combined);
        const crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crcVal, 0);
        return Buffer.concat([len, combined, crcBuf]);
    }

    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    // IDAT - raw pixel data with filter byte
    const rawData = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        rawData[y * (1 + width * 4)] = 0; // filter: none
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            const dstIdx = y * (1 + width * 4) + 1 + x * 4;
            rawData[dstIdx] = pixels[srcIdx];
            rawData[dstIdx + 1] = pixels[srcIdx + 1];
            rawData[dstIdx + 2] = pixels[srcIdx + 2];
            rawData[dstIdx + 3] = pixels[srcIdx + 3];
        }
    }

    const zlib = require('zlib');
    const compressed = zlib.deflateSync(rawData);

    // IEND
    const iend = Buffer.alloc(0);

    return Buffer.concat([
        SIGNATURE,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', iend),
    ]);
}

function setPixel(pixels, w, x, y, r, g, b, a) {
    if (x < 0 || x >= w || y < 0 || y >= w) return;
    x = Math.floor(x);
    y = Math.floor(y);
    const idx = (y * w + x) * 4;
    // Alpha blend
    const srcA = a / 255;
    const dstA = pixels[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
        pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA);
        pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
        pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
        pixels[idx + 3] = Math.round(outA * 255);
    }
}

function drawIcon(pixels, w, h) {
    const cx = w / 2;
    const cy = h / 2;

    // Draw rounded rect background
    const radius = w * 0.18;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let inside = false;
            // Check if inside rounded rect
            if (x >= radius && x <= w - radius) inside = true;
            else if (y >= radius && y <= h - radius) inside = true;
            else {
                // Check corners
                const corners = [
                    [radius, radius],
                    [w - radius, radius],
                    [radius, h - radius],
                    [w - radius, h - radius]
                ];
                for (const [cx2, cy2] of corners) {
                    const dx = x - cx2;
                    const dy = y - cy2;
                    if (dx * dx + dy * dy <= radius * radius) {
                        inside = true;
                        break;
                    }
                }
            }

            if (inside) {
                // Gradient from #1a1a2e to #0a0a0f
                const t = (x + y) / (w + h);
                const r = Math.round(26 * (1 - t) + 10 * t);
                const g = Math.round(26 * (1 - t) + 10 * t);
                const b = Math.round(46 * (1 - t) + 15 * t);
                setPixel(pixels, w, x, y, r, g, b, 255);
            }
        }
    }

    // Draw 4-point star
    const outerR = w * 0.35;
    const innerR = w * 0.1;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > outerR) continue;

            const angle = Math.atan2(dy, dx);
            // 4-point star shape
            const starAngle = ((angle + Math.PI / 2) % (Math.PI / 2) + Math.PI / 2) % (Math.PI / 2);
            const t = Math.abs(starAngle - Math.PI / 4) / (Math.PI / 4); // 0 at 45°, 1 at 0° or 90°
            const starR = innerR + (outerR - innerR) * (1 - t);

            if (dist <= starR) {
                // Gradient #8b5cf6 to #6366f1
                const gt = (x + y) / (w + h);
                const r = Math.round(139 * (1 - gt) + 99 * gt);
                const g = Math.round(92 * (1 - gt) + 102 * gt);
                const b = Math.round(246 * (1 - gt) + 241 * gt);
                const alpha = Math.min(255, Math.round(255 * (1 - (dist / starR) * 0.1)));
                setPixel(pixels, w, x, y, r, g, b, alpha);
            }
        }
    }

    // Center dot
    const dotR = w * 0.06;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= dotR) {
                setPixel(pixels, w, x, y, 226, 232, 240, 255);
            }
        }
    }
}

const sizes = [16, 48, 128];
const dir = path.dirname(__filename);

sizes.forEach(size => {
    const png = createPNG(size, size, drawIcon);
    const filePath = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(filePath, png);
    console.log(`✓ Created ${filePath} (${png.length} bytes)`);
});
