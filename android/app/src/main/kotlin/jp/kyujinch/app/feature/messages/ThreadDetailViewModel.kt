package jp.kyujinch.app.feature.messages

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.MessageItem
import jp.kyujinch.app.core.network.MessageThread
import jp.kyujinch.app.core.network.SendMessageRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ThreadDetailUiState(
    val isLoading: Boolean = true,
    val thread: MessageThread? = null,
    val messages: List<MessageItem> = emptyList(),
    val draft: String = "",
    val isSending: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class ThreadDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val api: KyujinchApi,
) : ViewModel() {

    private val threadId: String = savedStateHandle["id"] ?: error("threadId required")

    private val _ui = MutableStateFlow(ThreadDetailUiState())
    val ui: StateFlow<ThreadDetailUiState> = _ui.asStateFlow()

    init {
        load()
        markRead()
    }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.threadDetail(threadId) }
                .onSuccess { res ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        thread = res.thread,
                        messages = res.messages.reversed(), // 古い→新しい順
                    )
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "メッセージ取得失敗",
                    )
                }
        }
    }

    private fun markRead() {
        viewModelScope.launch {
            runCatching { api.markThreadRead(threadId) }
        }
    }

    fun setDraft(v: String) {
        _ui.value = _ui.value.copy(draft = v)
    }

    fun send() {
        val body = _ui.value.draft.trim()
        if (body.isEmpty() || _ui.value.isSending) return
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isSending = true)
            runCatching { api.sendMessage(threadId, SendMessageRequest(body)) }
                .onSuccess { newMsg ->
                    _ui.update { state ->
                        state.copy(
                            isSending = false,
                            draft = "",
                            messages = state.messages + newMsg,
                        )
                    }
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSending = false,
                        error = e.localizedMessage ?: "送信失敗",
                    )
                }
        }
    }
}
