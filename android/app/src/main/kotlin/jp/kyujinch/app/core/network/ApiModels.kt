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
    val notifyMessages: Boolean = true,
    val notifyApplications: Boolean = true,
    val notifyMarketing: Boolean = false,
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

@Serializable
data class Education(
    val id: String? = null,
    val schoolType: String,
    val schoolName: String,
    val faculty: String? = null,
    val status: String,
    val year: Int,
    val month: Int,
)

@Serializable
data class WorkExperience(
    val id: String? = null,
    val companyName: String,
    val department: String? = null,
    val jobType: String? = null,
    val startYear: Int,
    val startMonth: Int,
    val endYear: Int? = null,
    val endMonth: Int? = null,
    val isCurrent: Boolean = false,
    val description: String? = null,
)

@Serializable
data class Certification(
    val id: String? = null,
    val name: String,
    val year: Int,
    val month: Int,
)

@Serializable
data class Resume(
    val basic: UserProfile,
    val educations: List<Education> = emptyList(),
    val workExperiences: List<WorkExperience> = emptyList(),
    val certifications: List<Certification> = emptyList(),
    val prText: String? = null,
    val jobPreference: String? = null,
)

@Serializable
data class Application(
    val id: String,
    val jobId: String,
    val job: JobSummary,
    val motivation: String? = null,
    val status: String,
    val createdAt: String,
)

@Serializable
data class LatestMessage(
    val body: String,
    val createdAt: String,
    val senderType: String,
)

@Serializable
data class MessageThread(
    val id: String,
    val title: String,
    val companyName: String,
    val latestMessage: LatestMessage? = null,
    val unreadCount: Int = 0,
    val updatedAt: String,
)

@Serializable
data class MessageAttachment(
    val url: String,
    val type: String = "",
    val name: String = "",
)

@Serializable
data class MessageItem(
    val id: String,
    val threadId: String,
    val senderId: String,
    val senderType: String,
    val senderName: String = "",
    val body: String,
    val attachments: List<MessageAttachment> = emptyList(),
    val createdAt: String,
    val readAt: String? = null,
)

@Serializable
data class ThreadDetailResponse(
    val thread: MessageThread,
    val messages: List<MessageItem>,
    val hasMore: Boolean = false,
)

@Serializable
data class JobDetail(
    val id: String,
    val title: String,
    val description: String? = null,
    val companyId: String? = null,
    val companyName: String? = null,
    val companyLogoUrl: String? = null,
    val location: String? = null,
    val region: String? = null,
    val officeDetail: String? = null,
    val salaryMin: Int? = null,
    val salaryMax: Int? = null,
    val salaryType: String? = null,
    val salaryNote: String? = null,
    val annualSalary: String? = null,
    val monthlySalary: String? = null,
    val employmentType: String? = null,
    val targetType: String? = null,
    val categoryTag: String? = null,
    val tags: List<String> = emptyList(),
    val imageUrl: String? = null,
    val requirements: String? = null,
    val recommendedFor: String? = null,
    val benefits: List<String> = emptyList(),
    val benefitNote: String? = null,
    val selectionProcess: String? = null,
    val workingHours: String? = null,
    val holidayType: String? = null,
    val holidayPolicy: String? = null,
    val holidayNote: String? = null,
    val annualHolidayCount: Int? = null,
    val publishedAt: String? = null,
    val viewCount: Int? = null,
    val isFavorite: Boolean = false,
    val hasApplied: Boolean = false,
)

