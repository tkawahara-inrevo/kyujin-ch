package jp.kyujinch.app.feature.applications

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
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
)

@HiltViewModel
class ApplyViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val api: KyujinchApi,
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
            runCatching {
                api.apply(ApplyRequest(jobId = jobId, motivation = current.motivation.ifBlank { null }))
            }
                .onSuccess { _ui.value = _ui.value.copy(isSubmitting = false, submitted = true) }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSubmitting = false,
                        error = e.localizedMessage ?: "応募に失敗しました",
                    )
                }
        }
    }
}
