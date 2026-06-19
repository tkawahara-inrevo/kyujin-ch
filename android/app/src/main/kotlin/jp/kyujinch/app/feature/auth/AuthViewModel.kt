package jp.kyujinch.app.feature.auth

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.auth.AuthRepository
import jp.kyujinch.app.core.notification.FcmTokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository,
    private val fcm: FcmTokenManager,
) : ViewModel() {

    val isLoggedIn: StateFlow<Boolean> = repo.isLoggedIn
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun setEmail(v: String) {
        _uiState.value = _uiState.value.copy(email = v, error = null)
    }

    fun setPassword(v: String) {
        _uiState.value = _uiState.value.copy(password = v, error = null)
    }

    fun login() {
        val s = _uiState.value
        if (s.email.isBlank() || s.password.isBlank()) {
            _uiState.value = s.copy(error = "メールアドレスとパスワードを入力してください")
            return
        }
        viewModelScope.launch {
            _uiState.value = s.copy(isLoading = true, error = null)
            runCatching { repo.login(s.email.trim(), s.password) }
                .onSuccess {
                    _uiState.value = _uiState.value.copy(isLoading = false, success = true)
                    // ログイン成功後に FCM トークンを登録 (失敗してもログインは成功扱い)
                    launch {
                        fcm.registerCurrentToken()
                            .onFailure { e -> Log.w("AuthViewModel", "FCM 登録失敗", e) }
                    }
                }
                .onFailure { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "ログインに失敗しました",
                    )
                }
        }
    }

    fun logout() {
        viewModelScope.launch { repo.logout() }
    }
}
