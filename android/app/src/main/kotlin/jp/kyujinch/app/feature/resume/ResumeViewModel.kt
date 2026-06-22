package jp.kyujinch.app.feature.resume

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.Certification
import jp.kyujinch.app.core.network.Education
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.ResumePatchRequest
import jp.kyujinch.app.core.network.WorkExperience
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ResumeUiState(
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null,
    val educations: List<Education> = emptyList(),
    val workExperiences: List<WorkExperience> = emptyList(),
    val certifications: List<Certification> = emptyList(),
    val prText: String = "",
    val jobPreference: String = "",
)

@HiltViewModel
class ResumeViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(ResumeUiState())
    val ui: StateFlow<ResumeUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.resume() }
                .onSuccess { r ->
                    _ui.value = ResumeUiState(
                        isLoading = false,
                        educations = r.educations,
                        workExperiences = r.workExperiences,
                        certifications = r.certifications,
                        prText = r.prText.orEmpty(),
                        jobPreference = r.jobPreference.orEmpty(),
                    )
                }
                .onFailure { e ->
                    _ui.value = ResumeUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "取得失敗",
                    )
                }
        }
    }

    // ===== 学歴 =====
    fun addEducation() {
        _ui.update { it.copy(educations = it.educations + emptyEducation()) }
    }
    fun removeEducation(index: Int) {
        _ui.update { it.copy(educations = it.educations.filterIndexed { i, _ -> i != index }) }
    }
    fun updateEducation(index: Int, edu: Education) {
        _ui.update {
            it.copy(
                educations = it.educations.mapIndexed { i, e -> if (i == index) edu else e },
            )
        }
    }

    // ===== 職歴 =====
    fun addWorkExperience() {
        _ui.update { it.copy(workExperiences = it.workExperiences + emptyWorkExperience()) }
    }
    fun removeWorkExperience(index: Int) {
        _ui.update { it.copy(workExperiences = it.workExperiences.filterIndexed { i, _ -> i != index }) }
    }
    fun updateWorkExperience(index: Int, w: WorkExperience) {
        _ui.update {
            it.copy(
                workExperiences = it.workExperiences.mapIndexed { i, e -> if (i == index) w else e },
            )
        }
    }

    // ===== 資格 =====
    fun addCertification() {
        _ui.update { it.copy(certifications = it.certifications + emptyCertification()) }
    }
    fun removeCertification(index: Int) {
        _ui.update { it.copy(certifications = it.certifications.filterIndexed { i, _ -> i != index }) }
    }
    fun updateCertification(index: Int, c: Certification) {
        _ui.update {
            it.copy(
                certifications = it.certifications.mapIndexed { i, e -> if (i == index) c else e },
            )
        }
    }

    // ===== テキスト =====
    fun setPrText(v: String) { _ui.value = _ui.value.copy(prText = v) }
    fun setJobPreference(v: String) { _ui.value = _ui.value.copy(jobPreference = v) }

    // ===== 保存 =====
    fun save() {
        val s = _ui.value
        viewModelScope.launch {
            _ui.value = s.copy(isSaving = true, error = null)
            runCatching {
                api.updateResume(
                    ResumePatchRequest(
                        educations = s.educations.filter { it.schoolName.isNotBlank() && it.schoolType.isNotBlank() },
                        workExperiences = s.workExperiences.filter { it.companyName.isNotBlank() },
                        certifications = s.certifications.filter { it.name.isNotBlank() },
                        prText = s.prText.ifBlank { null },
                        jobPreference = s.jobPreference.ifBlank { null },
                    ),
                )
            }
                .onSuccess { _ui.value = _ui.value.copy(isSaving = false, saved = true) }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSaving = false,
                        error = e.localizedMessage ?: "保存失敗",
                    )
                }
        }
    }
}

private fun emptyEducation() = Education(
    schoolType = "大学",
    schoolName = "",
    faculty = null,
    status = "卒業",
    year = 2024,
    month = 3,
)
private fun emptyWorkExperience() = WorkExperience(
    companyName = "",
    startYear = 2024,
    startMonth = 4,
)
private fun emptyCertification() = Certification(
    name = "",
    year = 2024,
    month = 1,
)
