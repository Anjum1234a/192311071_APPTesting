package com.smartdental.care.util

import android.content.Context
import java.io.File
import java.io.FileOutputStream

object SampleStlGenerator {

    fun getBeforeStl(context: Context): File {
        val file = File(context.cacheDir, "sample_before_scan.stl")
        if (!file.exists()) {
            writeStlCube(file, 10.0f)
        }
        return file
    }

    fun getAfterStl(context: Context): File {
        val file = File(context.cacheDir, "sample_after_scan.stl")
        if (!file.exists()) {
            writeStlCube(file, 12.0f) // Slightly larger "restored" tooth
        }
        return file
    }

    private fun writeStlCube(file: File, size: Float) {
        val fos = FileOutputStream(file)
        
        // 80 byte header
        val header = ByteArray(80) { 0 }
        fos.write(header)
        
        // Number of triangles (12 for a cube)
        val numTriangles = 12
        fos.write(intToBytes(numTriangles))
        
        // We will just write dummy triangles for the bounding box
        // A real cube has 12 triangles (2 per face)
        val vertices = arrayOf(
            floatArrayOf(0f, 0f, 0f),
            floatArrayOf(size, 0f, 0f),
            floatArrayOf(size, size, 0f),
            floatArrayOf(0f, size, 0f),
            floatArrayOf(0f, 0f, size),
            floatArrayOf(size, 0f, size),
            floatArrayOf(size, size, size),
            floatArrayOf(0f, size, size)
        )
        
        val faces = arrayOf(
            intArrayOf(0, 1, 2), intArrayOf(0, 2, 3), // Bottom
            intArrayOf(4, 5, 6), intArrayOf(4, 6, 7), // Top
            intArrayOf(0, 1, 5), intArrayOf(0, 5, 4), // Front
            intArrayOf(1, 2, 6), intArrayOf(1, 6, 5), // Right
            intArrayOf(2, 3, 7), intArrayOf(2, 7, 6), // Back
            intArrayOf(3, 0, 4), intArrayOf(3, 4, 7)  // Left
        )
        
        for (face in faces) {
            // Normal (dummy)
            fos.write(floatToBytes(0f))
            fos.write(floatToBytes(0f))
            fos.write(floatToBytes(0f))
            
            // Vertex 1
            fos.write(floatToBytes(vertices[face[0]][0]))
            fos.write(floatToBytes(vertices[face[0]][1]))
            fos.write(floatToBytes(vertices[face[0]][2]))
            
            // Vertex 2
            fos.write(floatToBytes(vertices[face[1]][0]))
            fos.write(floatToBytes(vertices[face[1]][1]))
            fos.write(floatToBytes(vertices[face[1]][2]))
            
            // Vertex 3
            fos.write(floatToBytes(vertices[face[2]][0]))
            fos.write(floatToBytes(vertices[face[2]][1]))
            fos.write(floatToBytes(vertices[face[2]][2]))
            
            // Attribute byte count
            fos.write(byteArrayOf(0, 0))
        }
        
        fos.close()
    }
    
    private fun intToBytes(value: Int): ByteArray {
        return byteArrayOf(
            (value and 0xFF).toByte(),
            ((value shr 8) and 0xFF).toByte(),
            ((value shr 16) and 0xFF).toByte(),
            ((value shr 24) and 0xFF).toByte()
        )
    }
    
    private fun floatToBytes(value: Float): ByteArray {
        return intToBytes(java.lang.Float.floatToIntBits(value))
    }
}
