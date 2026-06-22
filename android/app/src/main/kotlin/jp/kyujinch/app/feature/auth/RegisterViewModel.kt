package jp.kyujinch.app.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.auth.AuthRepository
import jp.kyujinch.app.core.notification.FcmTokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RegisterUiState(
    val email: String = "",
    val password: String = "",
    val passwordConfirm: String = "",
    val name: String = "",
    val agreed: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
)

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val repo: AuthRepository,
    private val fcm: FcmTokenManager,
) : ViewModel() {

    private val _ui = MutableStateFlow(RegisterUiState())
    val ui: StateFlow<RegisterUiState> = _ui.asStateFlow()

    fun setEmail(v: String) { _ui.value = _ui.value.copy(email = v, error = null) }
    fun setPassword(v: String) { _ui.value = _ui.value.copy(password = v, error = null) }
    fun setPasswordConfirm(v: String) { _ui.value = _ui.value.copy(passwordConfirm = v, error = null) }
    fun setName(v: String) { _ui.value = _ui.value.copy(name = v, error = null) }
    fun setAgreed(v: Boolean) { _ui.value = _ui.value.copy(agreed = v, error = null) }

    fun submit() {
        val s = _ui.value
        when {
            s.email.isBlank() || s.password.isBlank() || s.name.isBlank() ->
                return showError("すべての項目を入力してください")
            s.password.length < 8 ->
                return showError("パスワードは8文字以上で入力してください")
            s.password != s.passwordConfirm ->
                return showError("パスワードが一致しません")
            !s.agreed ->
                return showError("利用規約・プライバシーポリシーへの同意が必要です")
        }

        viewModelScope.launch {
            _ui.value = s.copy(isLoading = true, error = null)
            runCatching { repo.register(s.email.trim(), s.password, s.name.trim()) }
                .onSuccess {
                    _ui.value = _ui.value.copy(isLoading = false, success = true)
                    launch {
                        fcm.registerCurrentToken()
                    }
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "登録に失敗しました",
                    )
                }
        }
    }

    private fun showError(msg: String) {
        _ui.value = _ui.value.copy(error = msg)
    }
}
