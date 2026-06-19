package jp.kyujinch.app.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.auth.AuthRepository
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val isLoading: Boolean = true,
    val user: UserProfile? = null,
    val error: String? = null,
    val loggedOut: Boolean = false,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val api: KyujinchApi,
    private val authRepo: AuthRepository,
) : ViewModel() {

    private val _ui = MutableStateFlow(ProfileUiState())
    val ui: StateFlow<ProfileUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.me() }
                .onSuccess { _ui.value = ProfileUiState(isLoading = false, user = it) }
                .onFailure { e ->
                    _ui.value = ProfileUiState(
                        isLoading = false,
                        error = e.localizedMessage ?: "プロフィール取得失敗",
                    )
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepo.logout()
            _ui.value = _ui.value.copy(loggedOut = true)
        }
    }

    fun deleteAccount() {
        viewModelScope.launch {
            runCatching { api.deleteMe() }
            authRepo.logout()
            _ui.value = _ui.value.copy(loggedOut = true)
        }
    }
}
