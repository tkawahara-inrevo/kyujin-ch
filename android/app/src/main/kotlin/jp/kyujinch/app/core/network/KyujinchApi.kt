package jp.kyujinch.app.core.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface KyujinchApi {
    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): AuthTokens

    @POST("auth/register")
    suspend fun register(@Body req: RegisterRequest): AuthTokens

    @POST("auth/refresh")
    suspend fun refresh(@Body req: RefreshRequest): AuthTokens

    @POST("auth/logout")
    suspend fun logout(@Body req: RefreshRequest)

    @GET("me")
    suspend fun me(): UserProfile

    @GET("jobs")
    suspend fun jobs(
        @Query("q") q: String? = null,
        @Query("prefectures") prefectures: String? = null,
        @Query("category") category: String? = null,
        @Query("employmentType") employmentType: String? = null,
        @Query("salary") salary: String? = null,
        @Query("sort") sort: String = "new",
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 20,
    ): PagedJobs

    @GET("jobs/recommended")
    suspend fun recommendedJobs(): List<JobSummary>

    @POST("me/devices")
    suspend fun registerDevice(@Body req: RegisterDeviceRequest)
}

@kotlinx.serialization.Serializable
data class RegisterDeviceRequest(
    val token: String,
    val platform: String = "android",
    val deviceId: String,
)
