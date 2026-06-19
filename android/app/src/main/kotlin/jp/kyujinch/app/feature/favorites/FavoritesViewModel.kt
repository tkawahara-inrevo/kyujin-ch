package jp.kyujinch.app.feature.favorites

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.JobSummary
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FavoritesUiState(
    val isLoading: Boolean = true,
    val jobs: List<JobSummary> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(FavoritesUiState())
    val ui: StateFlow<FavoritesUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.favorites(pageSize = 50) }
                .onSuccess { paged ->
                    _ui.value = FavoritesUiState(isLoading = false, jobs = paged.items)
                }
                .onFailure { e ->
                    _ui.value = FavoritesUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "お気に入り取得失敗",
                    )
                }
        }
    }

    fun removeFavorite(jobId: String) {
        viewModelScope.launch {
            _ui.update { state -> state.copy(jobs = state.jobs.filterNot { it.id == jobId }) }
            runCatching { api.removeFavorite(jobId) }
        }
    }
}
