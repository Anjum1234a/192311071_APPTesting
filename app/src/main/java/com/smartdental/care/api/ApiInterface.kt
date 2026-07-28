package com.smartdental.care.api

import com.smartdental.care.model.FirebaseTokenRequest
import com.smartdental.care.model.LoginRequest
import com.smartdental.care.model.NodeLoginRequest
import com.smartdental.care.model.NodeLoginResponse
import com.smartdental.care.model.NodePatientListResponse
import com.smartdental.care.model.NodeRegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiInterface {

    // ── Node.js Backend endpoints (clinident/backend) ──────────────────────────

    /** Login with email + password → returns JWT token */
    @POST("auth/login")
    suspend fun nodeLogin(@Body request: NodeLoginRequest): Response<NodeLoginResponse>

    /** Register a new doctor account */
    @POST("auth/register")
    suspend fun nodeRegister(@Body request: NodeRegisterRequest): Response<NodeLoginResponse>

    /**
     * Exchange a Firebase ID token for a Clinident JWT.
     * Use this after Firebase signInWithEmailAndPassword().
     */
    @POST("auth/firebase-token")
    suspend fun exchangeFirebaseToken(@Body request: FirebaseTokenRequest): Response<NodeLoginResponse>

    /** Get all patients — requires "Bearer <token>" header */
    @GET("patients")
    suspend fun getNodePatients(
        @Header("Authorization") bearerToken: String
    ): Response<NodePatientListResponse>

    /** Health-check — no auth needed */
    @GET("health")
    suspend fun healthCheck(): Response<Map<String, Any>>
}
