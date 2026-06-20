package jp.kyujinch.app.feature.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.MessageThread
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ThreadsListUiState(
    val isLoading: Boolean = true,
    val threads: List<MessageThread> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class ThreadsListViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(ThreadsListUiState())
    val ui: StateFlow<ThreadsListUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.threads() }
                .onSuccess { _ui.value = ThreadsListUiState(isLoading = false, threads = it) }
                .onFailure { e ->
                    _ui.value = ThreadsListUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "スレッド取得失敗",
                    )
                }
        }
    }
}
