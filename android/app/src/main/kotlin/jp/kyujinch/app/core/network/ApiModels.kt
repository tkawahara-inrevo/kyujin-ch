package jp.kyujinch.app.core.network

import kotlinx.serialization.Serializable

@Serializable
data class AuthTokens(
    val accessToken: String,
    val refreshToken: String,
    val user: UserProfile,
)

@Serializable
data class UserProfile(
    val id: String,
    val email: String,
    val name: String,
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
    val avatarUrl: String? = null,
    val notificationsEnabled: Boolean = true,
    val createdAt: String,
)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val agreedTerms: Boolean,
    val agreedPrivacy: Boolean,
)

@Serializable
data class RefreshRequest(val refreshToken: String)

@Serializable
data class JobSummary(
    val id: String,
    val title: String,
    val companyName: String,
    val location: String? = null,
    val salaryMin: Int? = null,
    val salaryMax: Int? = null,
    val salaryType: String? = null,
    val employmentType: String,
    val targetType: String,
    val imageUrl: String? = null,
    val tags: List<String> = emptyList(),
    val publishedAt: String? = null,
    val isFavorite: Boolean = false,
)

@Serializable
data class PagedJobs(
    val items: List<JobSummary>,
    val total: Int,
    val page: Int,
    val pageSize: Int,
    val hasMore: Boolean,
)

@Serializable
data class ApiError(
    val message: String,
    val code: String? = null,
)
