package jp.kyujinch.app.feature.jobs

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.FavoriteRequest
import jp.kyujinch.app.core.network.JobDetail
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class JobDetailUiState(
    val isLoading: Boolean = true,
    val job: JobDetail? = null,
    val error: String? = null,
)

@HiltViewModel
class JobDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val api: KyujinchApi,
) : ViewModel() {

    private val jobId: String = savedStateHandle["id"] ?: error("jobId required")

    private val _ui = MutableStateFlow(JobDetailUiState())
    val ui: StateFlow<JobDetailUiState> = _ui.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            runCatching { api.trackView(jobId) }
        }
    }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.jobDetail(jobId) }
                .onSuccess { _ui.value = JobDetailUiState(isLoading = false, job = it) }
                .onFailure { _ui.value = JobDetailUiState(isLoading = false, error = it.localizedMessage ?: "取得失敗") }
        }
    }

    fun toggleFavorite() {
        val current = _ui.value.job ?: return
        viewModelScope.launch {
            val nowFav = !current.isFavorite
            _ui.update { it.copy(job = current.copy(isFavorite = nowFav)) }
            val res = runCatching {
                if (nowFav) api.addFavorite(FavoriteRequest(current.id))
                else api.removeFavorite(current.id)
            }
            if (res.isFailure) {
                _ui.update { it.copy(job = current.copy(isFavorite = !nowFav)) }
            }
        }
    }
}
