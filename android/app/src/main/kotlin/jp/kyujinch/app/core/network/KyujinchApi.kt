package jp.kyujinch.app.core.network

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface KyujinchApi {
    // ===== 認証 =====
    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): AuthTokens

    @POST("auth/register")
    suspend fun register(@Body req: RegisterRequest): AuthTokens

    @POST("auth/refresh")
    suspend fun refresh(@Body req: RefreshRequest): AuthTokens

    @POST("auth/logout")
    suspend fun logout(@Body req: RefreshRequest)

    // ===== プロフィール =====
    @GET("me")
    suspend fun me(): UserProfile

    @PATCH("me")
    suspend fun updateMe(@Body req: UpdateProfileRequest): UserProfile

    @DELETE("me")
    suspend fun deleteMe()

    // ===== 求人 =====
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

    @GET("jobs/{id}")
    suspend fun jobDetail(@Path("id") id: String): JobDetail

    @POST("jobs/{id}/view")
    suspend fun trackView(@Path("id") id: String)

    @GET("jobs/recommended")
    suspend fun recommendedJobs(): List<JobSummary>

    // ===== 応募 =====
    @GET("applications")
    suspend fun applications(@Query("status") status: String? = null): List<Application>

    @POST("applications")
    suspend fun apply(@Body req: ApplyRequest): Application

    @GET("applications/{id}")
    suspend fun applicationDetail(@Path("id") id: String): Application

    // ===== メッセージ =====
    @GET("messages/threads")
    suspend fun threads(): List<MessageThread>

    @GET("messages/threads/{id}")
    suspend fun threadDetail(
        @Path("id") id: String,
        @Query("before") before: String? = null,
    ): ThreadDetailResponse

    @POST("messages/threads/{id}/messages")
    suspend fun sendMessage(
        @Path("id") id: String,
        @Body req: SendMessageRequest,
    ): MessageItem

    @POST("messages/threads/{id}/read")
    suspend fun markThreadRead(@Path("id") id: String)

    // ===== お気に入り =====
    @GET("favorites")
    suspend fun favorites(): List<JobSummary>

    @POST("favorites")
    suspend fun addFavorite(@Body req: FavoriteRequest)

    @DELETE("favorites/{jobId}")
    suspend fun removeFavorite(@Path("jobId") jobId: String)

    // ===== マスタ =====
    @GET("master/prefectures")
    suspend fun prefectures(): List<String>

    @GET("master/categories")
    suspend fun categories(): List<String>

    @GET("master/employment-types")
    suspend fun employmentTypes(): List<EmploymentTypeOption>

    // ===== Push =====
    @POST("me/devices")
    suspend fun registerDevice(@Body req: RegisterDeviceRequest)
}

@kotlinx.serialization.Serializable
data class RegisterDeviceRequest(
    val token: String,
    val platform: String = "android",
    val deviceId: String,
)

@kotlinx.serialization.Serializable
data class FavoriteRequest(val jobId: String)

@kotlinx.serialization.Serializable
data class UpdateProfileRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val firstNameKana: String? = null,
    val lastNameKana: String? = null,
    val birthDate: String? = null,
    val gender: String? = null,
    val phone: String? = null,
    val postalCode: String? = null,
    val prefecture: String? = null,
    val cityTown: String? = null,
    val addressLine: String? = null,
    val notificationsEnabled: Boolean? = null,
)

@kotlinx.serialization.Serializable
data class EmploymentTypeOption(val value: String, val label: String)

@kotlinx.serialization.Serializable
data class ApplyRequest(val jobId: String, val motivation: String? = null)

@kotlinx.serialization.Serializable
data class SendMessageRequest(val body: String)
