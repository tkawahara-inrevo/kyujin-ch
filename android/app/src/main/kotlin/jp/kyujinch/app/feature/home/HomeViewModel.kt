package jp.kyujinch.app.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.JobSummary
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val featured: List<JobSummary> = emptyList(),
    val new: List<JobSummary> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(HomeUiState())
    val ui: StateFlow<HomeUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching {
                val featuredDeferred = async { api.jobs(sort = "pv", pageSize = 6) }
                val newDeferred = async { api.jobs(sort = "new", pageSize = 6) }
                awaitAll(featuredDeferred, newDeferred)
            }
                .onSuccess { results ->
                    @Suppress("UNCHECKED_CAST")
                    val list = results as List<Any>
                    val featuredPaged = list[0] as jp.kyujinch.app.core.network.PagedJobs
                    val newPaged = list[1] as jp.kyujinch.app.core.network.PagedJobs
                    val featuredIds = featuredPaged.items.map { it.id }.toSet()
                    val newFiltered = newPaged.items.filterNot { it.id in featuredIds }
                    _ui.value = HomeUiState(
                        isLoading = false,
                        featured = featuredPaged.items,
                        new = newFiltered,
                    )
                }
                .onFailure { e ->
                    _ui.value = HomeUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "取得失敗",
                    )
                }
        }
    }
}
