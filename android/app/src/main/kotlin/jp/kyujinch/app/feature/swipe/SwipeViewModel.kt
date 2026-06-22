package jp.kyujinch.app.feature.swipe

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.ApplyRequest
import jp.kyujinch.app.core.network.JobDetail
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SwipeUiState(
    val isLoading: Boolean = true,
    val cards: List<JobDetail> = emptyList(),
    val error: String? = null,
    val isApplying: Boolean = false,
    val applied: List<String> = emptyList(),
    val profileIncomplete: Boolean = false,
    val missingFields: List<String> = emptyList(),
    val pendingJobId: String? = null,
)

@HiltViewModel
class SwipeViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(SwipeUiState())
    val ui: StateFlow<SwipeUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching {
                val summaries = api.recommendedJobs()
                // 詳細も並列で取得 (タグ情報のため)
                summaries.map { runCatching { api.jobDetail(it.id) }.getOrNull() }
                    .filterNotNull()
                    .filterNot { it.hasApplied }
            }
                .onSuccess { details ->
                    _ui.value = _ui.value.copy(isLoading = false, cards = details)
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "取得失敗",
                    )
                }
        }
    }

    /** スワイプ左 = やめる (カードを除去) */
    fun reject(jobId: String) {
        _ui.update { it.copy(cards = it.cards.filterNot { c -> c.id == jobId }) }
    }

    /** スワイプ右 = 応募。プロフィール未完なら誘導 */
    fun apply(jobId: String) {
        viewModelScope.launch {
            // プロフィール完全性チェック
            val profile = runCatching { api.me() }.getOrNull()
            if (profile == null) {
                _ui.value = _ui.value.copy(error = "プロフィール取得失敗")
                return@launch
            }
            val missing = mutableListOf<String>()
            if (profile.firstName.isNullOrBlank() && profile.lastName.isNullOrBlank()) missing.add("氏名")
            if (profile.phone.isNullOrBlank()) missing.add("電話番号")
            if (profile.prefecture.isNullOrBlank()) missing.add("都道府県")
            if (missing.isNotEmpty()) {
                _ui.value = _ui.value.copy(
                    profileIncomplete = true,
                    missingFields = missing,
                    pendingJobId = jobId,
                )
                return@launch
            }
            executeApply(jobId)
        }
    }

    private suspend fun executeApply(jobId: String) {
        _ui.value = _ui.value.copy(isApplying = true)
        runCatching { api.apply(ApplyRequest(jobId = jobId, motivation = null)) }
            .onSuccess {
                _ui.update {
                    it.copy(
                        isApplying = false,
                        cards = it.cards.filterNot { c -> c.id == jobId },
                        applied = it.applied + jobId,
                    )
                }
            }
            .onFailure { e ->
                _ui.value = _ui.value.copy(
                    isApplying = false,
                    error = e.localizedMessage ?: "応募失敗",
                )
            }
    }

    fun dismissProfileIncomplete() {
        _ui.value = _ui.value.copy(
            profileIncomplete = false,
            missingFields = emptyList(),
            pendingJobId = null,
        )
    }
}
