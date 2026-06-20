package jp.kyujinch.app.feature.blocks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.BlockedUser
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BlocksUiState(
    val isLoading: Boolean = true,
    val blocks: List<BlockedUser> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class BlocksViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(BlocksUiState())
    val ui: StateFlow<BlocksUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.blocks() }
                .onSuccess { _ui.value = BlocksUiState(isLoading = false, blocks = it) }
                .onFailure { e ->
                    _ui.value = BlocksUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "取得失敗",
                    )
                }
        }
    }

    fun unblock(userId: String) {
        viewModelScope.launch {
            _ui.update { state -> state.copy(blocks = state.blocks.filterNot { it.userId == userId }) }
            runCatching { api.unblockUser(userId) }
        }
    }
}
