package jp.kyujinch.app.feature.applications

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.analytics.Analytics
import jp.kyujinch.app.core.network.ApplyRequest
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ApplyUiState(
    val motivation: String = "",
    val isSubmitting: Boolean = false,
    val submitted: Boolean = false,
    val error: String? = null,
    val profileIncomplete: Boolean = false,
    val missingFields: List<String> = emptyList(),
)

@HiltViewModel
class ApplyViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val api: KyujinchApi,
    private val analytics: Analytics,
) : ViewModel() {

    private val jobId: String = savedStateHandle["id"] ?: error("jobId required")

    private val _ui = MutableStateFlow(ApplyUiState())
    val ui: StateFlow<ApplyUiState> = _ui.asStateFlow()

    fun setMotivation(v: String) {
        _ui.value = _ui.value.copy(motivation = v, error = null)
    }

    fun submit() {
        val current = _ui.value
        viewModelScope.launch {
            _ui.value = current.copy(isSubmitting = true, error = null)
            // プロフィール完全性チェック
            val profile = runCatching { api.me() }.getOrNull()
            if (profile == null) {
                _ui.value = current.copy(isSubmitting = false, error = "プロフィール取得失敗")
                return@launch
            }
            val missing = mutableListOf<String>()
            if (profile.firstName.isNullOrBlank() && profile.lastName.isNullOrBlank()) missing.add("氏名")
            if (profile.phone.isNullOrBlank()) missing.add("電話番号")
            if (profile.prefecture.isNullOrBlank()) missing.add("都道府県")
            if (missing.isNotEmpty()) {
                _ui.value = current.copy(
                    isSubmitting = false,
                    profileIncomplete = true,
                    missingFields = missing,
                )
                return@launch
            }
            runCatching {
                api.apply(ApplyRequest(jobId = jobId, motivation = current.motivation.ifBlank { null }))
            }
                .onSuccess {
                    _ui.value = _ui.value.copy(isSubmitting = false, submitted = true)
                    analytics.logApply(jobId, source = "detail")
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSubmitting = false,
                        error = e.localizedMessage ?: "応募に失敗しました",
                    )
                }
        }
    }

    fun dismissProfileIncomplete() {
        _ui.value = _ui.value.copy(profileIncomplete = false)
    }
}
