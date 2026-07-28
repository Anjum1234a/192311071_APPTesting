package com.smartdental.care.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.net.Uri
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Software renderer that reads an STL file and produces a 2D orthographic
 * projection Bitmap — giving users a real visual preview of their 3D dental scan.
 *
 * Rendering technique:
 *   • Orthographic top-down (XZ plane) projection
 *   • Triangles shaded by face normal Z component (basic lighting)
 *   • Fits geometry into the output image with padding
 */
object StlRenderer {

    private const val IMG_SIZE = 512   // output bitmap size in pixels
    private const val PADDING  = 32    // pixels of padding around geometry

    private data class Triangle(
        val v1x: Float, val v1y: Float, val v1z: Float,
        val v2x: Float, val v2y: Float, val v2z: Float,
        val v3x: Float, val v3y: Float, val v3z: Float,
        val nx: Float,  val ny: Float,  val nz: Float   // face normal
    )

    /**
     * Parse the STL bytes and render a Bitmap preview.
     * @param bytes  raw bytes of the STL file
     * @param colorFrom  gradient start colour (deep blue-teal for dental)
     * @param colorTo    gradient end colour   (light cyan)
     * @return  rendered Bitmap, or null if the file cannot be parsed
     */
    fun render(bytes: ByteArray, colorFrom: Int = 0xFF0D47A1.toInt(), colorTo: Int = 0xFF4FC3F7.toInt()): Bitmap? {
        if (bytes.size < 84) return null

        val triangles = try {
            if (isAscii(bytes)) parseAscii(bytes) else parseBinary(bytes)
        } catch (e: Exception) {
            return null
        }

        if (triangles.isEmpty()) return null

        // ── Bounding box ───────────────────────────────────────────────────────
        var minX = Float.MAX_VALUE; var maxX = -Float.MAX_VALUE
        var minZ = Float.MAX_VALUE; var maxZ = -Float.MAX_VALUE
        for (t in triangles) {
            listOf(t.v1x, t.v2x, t.v3x).forEach { x -> if (x < minX) minX = x; if (x > maxX) maxX = x }
            listOf(t.v1z, t.v2z, t.v3z).forEach { z -> if (z < minZ) minZ = z; if (z > maxZ) maxZ = z }
        }

        // If Z range is very small (flat model), fall back to X-Y plane
        val useY = (maxZ - minZ) < 0.1f
        if (useY) {
            var minY2 = Float.MAX_VALUE; var maxY2 = -Float.MAX_VALUE
            for (t in triangles) {
                listOf(t.v1y, t.v2y, t.v3y).forEach { y -> if (y < minY2) minY2 = y; if (y > maxY2) maxY2 = y }
            }
            minZ = minY2; maxZ = maxY2
        }

        val rangeX = if (maxX - minX > 0) maxX - minX else 1f
        val rangeZ = if (maxZ - minZ > 0) maxZ - minZ else 1f
        val scale  = (IMG_SIZE - 2 * PADDING) / max(rangeX, rangeZ)

        // ── Create Bitmap & Canvas ─────────────────────────────────────────────
        val bitmap = Bitmap.createBitmap(IMG_SIZE, IMG_SIZE, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(0xFFF5F5F5.toInt())   // light grey background

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        val path  = android.graphics.Path()

        // ── Sort triangles back-to-front (painter's algorithm) ─────────────────
        val sorted = triangles.sortedByDescending { t ->
            if (useY) (t.v1y + t.v2y + t.v3y) / 3f
            else      (t.v1y + t.v2y + t.v3y) / 3f   // depth on Y axis
        }

        // ── Render each triangle ───────────────────────────────────────────────
        fun project(px: Float, pz: Float): Pair<Float, Float> {
            val sx = PADDING + (px - minX) * scale
            val sy = PADDING + (if (useY) 0f else (pz - minZ)) * scale
            return Pair(sx, sy)
        }

        for (t in sorted) {
            path.reset()

            val (x1, y1) = project(t.v1x, if (useY) t.v1y else t.v1z)
            val (x2, y2) = project(t.v2x, if (useY) t.v2y else t.v2z)
            val (x3, y3) = project(t.v3x, if (useY) t.v3y else t.v3z)

            path.moveTo(x1, y1)
            path.lineTo(x2, y2)
            path.lineTo(x3, y3)
            path.close()

            // Lighting: normal Y component drives brightness (0.3 – 1.0)
            val lightIntensity = ((t.ny + 1f) / 2f).coerceIn(0.3f, 1.0f)

            // Interpolate colour between colorFrom and colorTo
            val r = (Color.red(colorFrom)   + (Color.red(colorTo)   - Color.red(colorFrom))   * lightIntensity).toInt()
            val g = (Color.green(colorFrom) + (Color.green(colorTo) - Color.green(colorFrom)) * lightIntensity).toInt()
            val b = (Color.blue(colorFrom)  + (Color.blue(colorTo)  - Color.blue(colorFrom))  * lightIntensity).toInt()

            paint.style = Paint.Style.FILL
            paint.color = Color.rgb(r.coerceIn(0, 255), g.coerceIn(0, 255), b.coerceIn(0, 255))
            canvas.drawPath(path, paint)

            // Subtle edge lines
            paint.style = Paint.Style.STROKE
            paint.strokeWidth = 0.3f
            paint.color = Color.argb(40, 0, 0, 0)
            canvas.drawPath(path, paint)
        }

        return bitmap
    }

    /** Convenience overload: render directly from a Uri */
    fun render(context: Context, uri: Uri, colorFrom: Int = 0xFF0D47A1.toInt(), colorTo: Int = 0xFF4FC3F7.toInt()): Bitmap? {
        val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return null
        return render(bytes, colorFrom, colorTo)
    }

    // ── Parsers ───────────────────────────────────────────────────────────────

    private fun isAscii(bytes: ByteArray): Boolean {
        if (bytes.size < 84) return false
        val triangleCount = ByteBuffer.wrap(bytes, 80, 4).order(ByteOrder.LITTLE_ENDIAN).int
        val expected = 84L + triangleCount.toLong() * 50L
        return bytes.size.toLong() != expected
    }

    private fun parseBinary(bytes: ByteArray): List<Triangle> {
        val count = ByteBuffer.wrap(bytes, 80, 4).order(ByteOrder.LITTLE_ENDIAN).int
        val list  = ArrayList<Triangle>(count)
        for (i in 0 until count) {
            val off = 84 + i * 50
            if (off + 48 > bytes.size) break
            val buf = ByteBuffer.wrap(bytes, off, 48).order(ByteOrder.LITTLE_ENDIAN)
            val nx = buf.float; val ny = buf.float; val nz = buf.float
            val v1x = buf.float; val v1y = buf.float; val v1z = buf.float
            val v2x = buf.float; val v2y = buf.float; val v2z = buf.float
            val v3x = buf.float; val v3y = buf.float; val v3z = buf.float
            list.add(Triangle(v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z, nx, ny, nz))
        }
        return list
    }

    private fun parseAscii(bytes: ByteArray): List<Triangle> {
        val text  = String(bytes)
        val lines = text.lines()
        val list  = mutableListOf<Triangle>()

        var nx = 0f; var ny = 0f; var nz = 0f
        val verts = mutableListOf<FloatArray>()

        for (line in lines) {
            val t = line.trim()
            when {
                t.startsWith("facet normal") -> {
                    val p = t.split("\\s+".toRegex())
                    if (p.size >= 5) { nx = p[2].toFloatOrNull() ?: 0f; ny = p[3].toFloatOrNull() ?: 0f; nz = p[4].toFloatOrNull() ?: 0f }
                }
                t.startsWith("vertex") -> {
                    val p = t.split("\\s+".toRegex())
                    if (p.size >= 4) verts.add(floatArrayOf(p[1].toFloat(), p[2].toFloat(), p[3].toFloat()))
                }
                t.startsWith("endfacet") -> {
                    if (verts.size >= 3) {
                        list.add(Triangle(verts[0][0], verts[0][1], verts[0][2], verts[1][0], verts[1][1], verts[1][2], verts[2][0], verts[2][1], verts[2][2], nx, ny, nz))
                    }
                    verts.clear()
                }
            }
        }
        return list
    }
}
