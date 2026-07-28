package com.smartdental.care.util

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Parses binary and ASCII STL files from a Uri and returns geometric metrics
 * used for AI-powered dental scan comparison.
 */
object StlParser {

    data class StlMetrics(
        val fileName:          String,
        val fileSizeKb:        Long,
        val triangleCount:     Int,
        val minX: Float,  val maxX: Float,
        val minY: Float,  val maxY: Float,
        val minZ: Float,  val maxZ: Float,
        val volumeMm3:         Double,
        val surfaceAreaMm2:    Double
    ) {
        val widthMm:  Float get() = abs(maxX - minX)
        val heightMm: Float get() = abs(maxY - minY)
        val depthMm:  Float get() = abs(maxZ - minZ)
    }

    /** Main entry point — auto-detects binary vs ASCII STL */
    fun parse(context: Context, uri: Uri): StlMetrics {
        val fileName = resolveFileName(context, uri)
        val fileSize = resolveFileSize(context, uri)

        val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            ?: throw Exception("Cannot open file: $fileName")

        return if (isAsciiStl(bytes)) {
            parseAscii(fileName, fileSize, bytes)
        } else {
            parseBinary(fileName, fileSize, bytes)
        }
    }

    // ── Binary STL ────────────────────────────────────────────────────────────
    // Layout: 80-byte header | 4-byte triangle count | N × 50-byte triangles
    private fun parseBinary(fileName: String, fileSizeKb: Long, bytes: ByteArray): StlMetrics {
        if (bytes.size < 84) throw Exception("File too small — not a valid STL")

        val triangleCount = ByteBuffer.wrap(bytes, 80, 4)
            .order(ByteOrder.LITTLE_ENDIAN).int

        var minX =  Float.MAX_VALUE;  var maxX = -Float.MAX_VALUE
        var minY =  Float.MAX_VALUE;  var maxY = -Float.MAX_VALUE
        var minZ =  Float.MAX_VALUE;  var maxZ = -Float.MAX_VALUE
        var signedVolume   = 0.0
        var surfaceArea    = 0.0

        for (i in 0 until triangleCount) {
            val offset = 84 + i * 50
            if (offset + 48 > bytes.size) break

            val buf = ByteBuffer.wrap(bytes, offset, 48).order(ByteOrder.LITTLE_ENDIAN)
            // Skip normal vector
            buf.float; buf.float; buf.float

            val v1x = buf.float; val v1y = buf.float; val v1z = buf.float
            val v2x = buf.float; val v2y = buf.float; val v2z = buf.float
            val v3x = buf.float; val v3y = buf.float; val v3z = buf.float

            // Bounding box
            if (v1x < minX) minX = v1x; if (v1x > maxX) maxX = v1x
            if (v2x < minX) minX = v2x; if (v2x > maxX) maxX = v2x
            if (v3x < minX) minX = v3x; if (v3x > maxX) maxX = v3x
            if (v1y < minY) minY = v1y; if (v1y > maxY) maxY = v1y
            if (v2y < minY) minY = v2y; if (v2y > maxY) maxY = v2y
            if (v3y < minY) minY = v3y; if (v3y > maxY) maxY = v3y
            if (v1z < minZ) minZ = v1z; if (v1z > maxZ) maxZ = v1z
            if (v2z < minZ) minZ = v2z; if (v2z > maxZ) maxZ = v2z
            if (v3z < minZ) minZ = v3z; if (v3z > maxZ) maxZ = v3z

            // Triangle surface area via cross product
            val ax = (v2x - v1x).toDouble(); val ay = (v2y - v1y).toDouble(); val az = (v2z - v1z).toDouble()
            val bx = (v3x - v1x).toDouble(); val by = (v3y - v1y).toDouble(); val bz = (v3z - v1z).toDouble()
            val cx = ay * bz - az * by
            val cy = az * bx - ax * bz
            val cz = ax * by - ay * bx
            surfaceArea += 0.5 * sqrt(cx * cx + cy * cy + cz * cz)

            // Signed volume (divergence theorem — only correct for watertight/closed mesh)
            signedVolume += (v1x.toDouble() * (v2y.toDouble() * v3z - v3y.toDouble() * v2z) +
                             v2x.toDouble() * (v3y.toDouble() * v1z - v1y.toDouble() * v3z) +
                             v3x.toDouble() * (v1y.toDouble() * v2z - v2y.toDouble() * v1z)) / 6.0
        }

        return StlMetrics(
            fileName, fileSizeKb, triangleCount,
            minX, maxX, minY, maxY, minZ, maxZ,
            abs(signedVolume), surfaceArea
        )
    }

    // ── ASCII STL ─────────────────────────────────────────────────────────────
    private fun parseAscii(fileName: String, fileSizeKb: Long, bytes: ByteArray): StlMetrics {
        val text   = String(bytes)
        val lines  = text.lines()
        val verts  = mutableListOf<Triple<Float, Float, Float>>()

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed.startsWith("vertex ")) {
                val parts = trimmed.split("\\s+".toRegex())
                if (parts.size >= 4) {
                    verts.add(Triple(parts[1].toFloat(), parts[2].toFloat(), parts[3].toFloat()))
                }
            }
        }

        if (verts.isEmpty()) throw Exception("No vertices found in ASCII STL")

        val triangleCount = verts.size / 3
        var minX =  Float.MAX_VALUE;  var maxX = -Float.MAX_VALUE
        var minY =  Float.MAX_VALUE;  var maxY = -Float.MAX_VALUE
        var minZ =  Float.MAX_VALUE;  var maxZ = -Float.MAX_VALUE
        var signedVolume = 0.0
        var surfaceArea  = 0.0

        for ((x, y, z) in verts) {
            if (x < minX) minX = x; if (x > maxX) maxX = x
            if (y < minY) minY = y; if (y > maxY) maxY = y
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
        }

        for (i in 0 until triangleCount) {
            val base = i * 3
            val (v1x, v1y, v1z) = verts[base]
            val (v2x, v2y, v2z) = verts[base + 1]
            val (v3x, v3y, v3z) = verts[base + 2]

            val ax = (v2x - v1x).toDouble(); val ay = (v2y - v1y).toDouble(); val az = (v2z - v1z).toDouble()
            val bx = (v3x - v1x).toDouble(); val by = (v3y - v1y).toDouble(); val bz = (v3z - v1z).toDouble()
            val cx = ay * bz - az * by; val cy = az * bx - ax * bz; val cz = ax * by - ay * bx
            surfaceArea += 0.5 * sqrt(cx * cx + cy * cy + cz * cz)

            signedVolume += (v1x.toDouble() * (v2y.toDouble() * v3z - v3y.toDouble() * v2z) +
                             v2x.toDouble() * (v3y.toDouble() * v1z - v1y.toDouble() * v3z) +
                             v3x.toDouble() * (v1y.toDouble() * v2z - v2y.toDouble() * v1z)) / 6.0
        }

        return StlMetrics(
            fileName, fileSizeKb, triangleCount,
            minX, maxX, minY, maxY, minZ, maxZ,
            abs(signedVolume), surfaceArea
        )
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private fun isAsciiStl(bytes: ByteArray): Boolean {
        // Binary STL can also start with "solid" so we do a heuristic:
        // If the file size matches 84 + (triangleCount * 50) it's binary.
        if (bytes.size < 84) return false
        val triangleCount = ByteBuffer.wrap(bytes, 80, 4).order(ByteOrder.LITTLE_ENDIAN).int
        val expectedSize  = 84L + triangleCount.toLong() * 50L
        return bytes.size.toLong() != expectedSize
    }

    private fun resolveFileName(context: Context, uri: Uri): String {
        var name = "scan.stl"
        val cursor: Cursor? = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val idx = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (idx >= 0) name = it.getString(idx)
            }
        }
        return name
    }

    private fun resolveFileSize(context: Context, uri: Uri): Long {
        var size = 0L
        val cursor: Cursor? = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val idx = it.getColumnIndex(OpenableColumns.SIZE)
                if (idx >= 0) size = it.getLong(idx) / 1024L
            }
        }
        return size
    }
}
