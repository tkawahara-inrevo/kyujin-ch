package jp.kyujinch.app.feature.applications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.Application
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ApplicationsListUiState(
    val isLoading: Boolean = true,
    val applications: List<Application> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class ApplicationsListViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(ApplicationsListUiState())
    val ui: StateFlow<ApplicationsListUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.applications() }
                .onSuccess {
                    _ui.value = ApplicationsListUiState(isLoading = false, applications = it)
                }
                .onFailure { e ->
                    _ui.value = ApplicationsListUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "応募一覧取得失敗",
                    )
                }
        }
    }
}
