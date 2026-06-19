package jp.kyujinch.app.feature.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.JobSummary
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchUiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val jobs: List<JobSummary> = emptyList(),
    val error: String? = null,
    val hasSearched: Boolean = false,
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(SearchUiState())
    val ui: StateFlow<SearchUiState> = _ui.asStateFlow()

    fun setQuery(q: String) {
        _ui.value = _ui.value.copy(query = q)
    }

    fun search() {
        val q = _ui.value.query.trim()
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null, hasSearched = true)
            runCatching {
                api.jobs(q = if (q.isEmpty()) null else q, pageSize = 30)
            }
                .onSuccess { paged ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        jobs = paged.items,
                    )
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "検索失敗",
                    )
                }
        }
    }
}
