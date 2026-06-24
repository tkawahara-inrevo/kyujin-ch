package jp.kyujinch.app.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.ForgotPasswordRequest
import jp.kyujinch.app.core.network.KyujinchApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ForgotPasswordUiState(
    val email: String = "",
    val isSubmitting: Boolean = false,
    val sent: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(ForgotPasswordUiState())
    val ui: StateFlow<ForgotPasswordUiState> = _ui.asStateFlow()

    fun setEmail(v: String) { _ui.value = _ui.value.copy(email = v, error = null) }

    fun submit() {
        val email = _ui.value.email.trim()
        if (email.isBlank() || !email.contains("@")) {
            _ui.value = _ui.value.copy(error = "メールアドレスを入力してください")
            return
        }
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isSubmitting = true, error = null)
            runCatching { api.forgotPassword(ForgotPasswordRequest(email)) }
                .onSuccess { _ui.value = _ui.value.copy(isSubmitting = false, sent = true) }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSubmitting = false,
                        error = e.localizedMessage ?: "送信に失敗しました",
                    )
                }
        }
    }
}
