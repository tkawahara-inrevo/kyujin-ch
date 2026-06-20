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
    val prefectures: Set<String> = emptySet(),
    val category: String? = null,
    val employmentType: String? = null,
    val sort: String = "new",
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

    fun setQuery(q: String) { _ui.value = _ui.value.copy(query = q) }
    fun togglePrefecture(p: String) {
        val current = _ui.value.prefectures
        _ui.value = _ui.value.copy(
            prefectures = if (p in current) current - p else current + p,
        )
    }
    fun setCategory(v: String?) { _ui.value = _ui.value.copy(category = v) }
    fun setEmploymentType(v: String?) { _ui.value = _ui.value.copy(employmentType = v) }
    fun setSort(v: String) { _ui.value = _ui.value.copy(sort = v) }

    fun clearFilters() {
        _ui.value = _ui.value.copy(
            prefectures = emptySet(),
            category = null,
            employmentType = null,
        )
    }

    fun search() {
        val s = _ui.value
        viewModelScope.launch {
            _ui.value = s.copy(isLoading = true, error = null, hasSearched = true)
            runCatching {
                api.jobs(
                    q = s.query.trim().ifBlank { null },
                    prefectures = s.prefectures.takeIf { it.isNotEmpty() }?.joinToString(","),
                    category = s.category,
                    employmentType = s.employmentType,
                    sort = s.sort,
                    pageSize = 30,
                )
            }
                .onSuccess { paged ->
                    _ui.value = _ui.value.copy(isLoading = false, jobs = paged.items)
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
