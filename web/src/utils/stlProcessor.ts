export interface StlMetrics {
  fileName: string;
  fileSizeKb: number;
  triangleCount: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  volumeMm3: number;
  surfaceAreaMm2: number;
}

export function parseStl(arrayBuffer: ArrayBuffer, fileName: string): StlMetrics {
  const dataView = new DataView(arrayBuffer);
  
  // Heuristic to detect binary vs ASCII
  const isBinary = (arrayBuffer.byteLength >= 84) && (() => {
    const triangleCount = dataView.getUint32(80, true);
    const expectedSize = 84 + triangleCount * 50;
    return arrayBuffer.byteLength === expectedSize;
  })();

  if (isBinary) {
    return parseBinary(dataView, arrayBuffer.byteLength, fileName);
  } else {
    return parseAscii(new TextDecoder().decode(arrayBuffer), arrayBuffer.byteLength, fileName);
  }
}

function parseBinary(view: DataView, totalBytes: number, fileName: string): StlMetrics {
  const triangleCount = view.getUint32(80, true);
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let signedVolume = 0.0;
  let surfaceArea = 0.0;

  for (let i = 0; i < triangleCount; i++) {
    const offset = 84 + i * 50;
    if (offset + 48 > totalBytes) break;

    // Normal (skip 12 bytes)
    // Vertices
    const v1x = view.getFloat32(offset + 12, true);
    const v1y = view.getFloat32(offset + 16, true);
    const v1z = view.getFloat32(offset + 20, true);
    
    const v2x = view.getFloat32(offset + 24, true);
    const v2y = view.getFloat32(offset + 28, true);
    const v2z = view.getFloat32(offset + 32, true);
    
    const v3x = view.getFloat32(offset + 36, true);
    const v3y = view.getFloat32(offset + 40, true);
    const v3z = view.getFloat32(offset + 44, true);

    // Bounding Box
    const xs = [v1x, v2x, v3x];
    const ys = [v1y, v2y, v3y];
    const zs = [v1z, v2z, v3z];

    minX = Math.min(minX, ...xs); maxX = Math.max(maxX, ...xs);
    minY = Math.min(minY, ...ys); maxY = Math.max(maxY, ...ys);
    minZ = Math.min(minZ, ...zs); maxZ = Math.max(maxZ, ...zs);

    // Surface Area via cross product
    const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z;
    const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z;
    const cx = ay * bz - az * by;
    const cy = az * bx - ax * bz;
    const cz = ax * by - ay * bx;
    surfaceArea += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);

    // Signed volume (divergence theorem)
    signedVolume += (v1x * (v2y * v3z - v3y * v2z) +
                     v2x * (v3y * v1z - v1y * v3z) +
                     v3x * (v1y * v2z - v2y * v1z)) / 6.0;
  }

  return {
    fileName,
    fileSizeKb: Math.round(totalBytes / 1024),
    triangleCount,
    widthMm: parseFloat(Math.abs(maxX - minX).toFixed(1)),
    heightMm: parseFloat(Math.abs(maxY - minY).toFixed(1)),
    depthMm: parseFloat(Math.abs(maxZ - minZ).toFixed(1)),
    volumeMm3: Math.abs(signedVolume),
    surfaceAreaMm2: surfaceArea
  };
}

function parseAscii(text: string, totalBytes: number, fileName: string): StlMetrics {
  const lines = text.split('\n');
  const verts: [number, number, number][] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('vertex ')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 4) {
        verts.push([
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        ]);
      }
    }
  }

  const triangleCount = Math.floor(verts.length / 3);
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let signedVolume = 0.0;
  let surfaceArea = 0.0;

  for (const [x, y, z] of verts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }

  for (let i = 0; i < triangleCount; i++) {
    const base = i * 3;
    const [v1x, v1y, v1z] = verts[base];
    const [v2x, v2y, v2z] = verts[base + 1];
    const [v3x, v3y, v3z] = verts[base + 2];

    const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z;
    const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z;
    const cx = ay * bz - az * by;
    const cy = az * bx - ax * bz;
    const cz = ax * by - ay * bx;
    surfaceArea += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);

    signedVolume += (v1x * (v2y * v3z - v3y * v2z) +
                     v2x * (v3y * v1z - v1y * v3z) +
                     v3x * (v1y * v2z - v2y * v1z)) / 6.0;
  }

  return {
    fileName,
    fileSizeKb: Math.round(totalBytes / 1024),
    triangleCount,
    widthMm: parseFloat(Math.abs(maxX - minX).toFixed(1)),
    heightMm: parseFloat(Math.abs(maxY - minY).toFixed(1)),
    depthMm: parseFloat(Math.abs(maxZ - minZ).toFixed(1)),
    volumeMm3: Math.abs(signedVolume),
    surfaceAreaMm2: surfaceArea
  };
}

export function renderStl(arrayBuffer: ArrayBuffer, canvas: HTMLCanvasElement, colorFrom: string, colorTo: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dataView = new DataView(arrayBuffer);
  const isBinary = (arrayBuffer.byteLength >= 84) && (() => {
    const triangleCount = dataView.getUint32(80, true);
    return arrayBuffer.byteLength === 84 + triangleCount * 50;
  })();

  const triangles: { v1: number[]; v2: number[]; v3: number[]; n: number[] }[] = [];
  
  if (isBinary) {
    const count = dataView.getUint32(80, true);
    for (let i = 0; i < count; i++) {
      const off = 84 + i * 50;
      if (off + 48 > arrayBuffer.byteLength) break;
      triangles.push({
        n: [dataView.getFloat32(off, true), dataView.getFloat32(off + 4, true), dataView.getFloat32(off + 8, true)],
        v1: [dataView.getFloat32(off + 12, true), dataView.getFloat32(off + 16, true), dataView.getFloat32(off + 20, true)],
        v2: [dataView.getFloat32(off + 24, true), dataView.getFloat32(off + 28, true), dataView.getFloat32(off + 32, true)],
        v3: [dataView.getFloat32(off + 36, true), dataView.getFloat32(off + 40, true), dataView.getFloat32(off + 44, true)]
      });
    }
  } else {
    // Parse ASCII Vertices
    const text = new TextDecoder().decode(arrayBuffer);
    const lines = text.split('\n');
    let nx = 0, ny = 0, nz = 0;
    let tempVerts: number[][] = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('facet normal')) {
        const p = t.split(/\s+/);
        nx = parseFloat(p[2]); ny = parseFloat(p[3]); nz = parseFloat(p[4]);
      } else if (t.startsWith('vertex')) {
        const p = t.split(/\s+/);
        tempVerts.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
      } else if (t.startsWith('endfacet')) {
        if (tempVerts.length >= 3) {
          triangles.push({ n: [nx, ny, nz], v1: tempVerts[0], v2: tempVerts[1], v3: tempVerts[2] });
        }
        tempVerts = [];
      }
    }
  }

  if (triangles.length === 0) return;

  // Bounding Box
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  for (const t of triangles) {
    [t.v1[0], t.v2[0], t.v3[0]].forEach(x => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
    [t.v1[2], t.v2[2], t.v3[2]].forEach(z => { minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); });
  }

  const useY = Math.abs(maxZ - minZ) < 0.1;
  if (useY) {
    let minY = Infinity, maxY = -Infinity;
    for (const t of triangles) {
      [t.v1[1], t.v2[1], t.v3[1]].forEach(y => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    }
    minZ = minY; maxZ = maxY;
  }

  const rangeX = maxX - minX || 1;
  const rangeZ = maxZ - minZ || 1;
  const padding = 24;
  const scale = (canvas.width - 2 * padding) / Math.max(rangeX, rangeZ);

  // Painter's algorithm
  triangles.sort((a, b) => (b.v1[1] + b.v2[1] + b.v3[1]) / 3 - (a.v1[1] + a.v2[1] + a.v3[1]) / 3);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const parseHex = (hex: string) => {
    const num = parseInt(hex.replace('#', ''), 16);
    return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
  };

  const cFrom = parseHex(colorFrom);
  const cTo = parseHex(colorTo);

  for (const t of triangles) {
    ctx.beginPath();
    const x1 = padding + (t.v1[0] - minX) * scale;
    const y1 = padding + ((useY ? t.v1[1] : t.v1[2]) - minZ) * scale;
    const x2 = padding + (t.v2[0] - minX) * scale;
    const y2 = padding + ((useY ? t.v2[1] : t.v2[2]) - minZ) * scale;
    const x3 = padding + (t.v3[0] - minX) * scale;
    const y3 = padding + ((useY ? t.v3[1] : t.v3[2]) - minZ) * scale;

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    const light = Math.max(0.3, Math.min(1.0, (t.n[1] + 1) / 2));
    const r = Math.round(cFrom[0] + (cTo[0] - cFrom[0]) * light);
    const g = Math.round(cFrom[1] + (cTo[1] - cFrom[1]) * light);
    const b = Math.round(cFrom[2] + (cTo[2] - cFrom[2]) * light);

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();
  }
}
