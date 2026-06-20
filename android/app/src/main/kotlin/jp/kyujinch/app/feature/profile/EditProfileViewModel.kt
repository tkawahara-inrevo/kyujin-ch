package jp.kyujinch.app.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.UpdateProfileRequest
import jp.kyujinch.app.core.network.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class EditProfileUiState(
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null,
    val firstName: String = "",
    val lastName: String = "",
    val firstNameKana: String = "",
    val lastNameKana: String = "",
    val phone: String = "",
    val postalCode: String = "",
    val prefecture: String = "",
    val cityTown: String = "",
    val addressLine: String = "",
    val notificationsEnabled: Boolean = true,
)

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val api: KyujinchApi,
) : ViewModel() {

    private val _ui = MutableStateFlow(EditProfileUiState())
    val ui: StateFlow<EditProfileUiState> = _ui.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            runCatching { api.me() }
                .onSuccess { applyFromServer(it) }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "取得失敗",
                    )
                }
        }
    }

    private fun applyFromServer(u: UserProfile) {
        _ui.value = _ui.value.copy(
            isLoading = false,
            firstName = u.firstName.orEmpty(),
            lastName = u.lastName.orEmpty(),
            firstNameKana = u.firstNameKana.orEmpty(),
            lastNameKana = u.lastNameKana.orEmpty(),
            phone = u.phone.orEmpty(),
            postalCode = u.postalCode.orEmpty(),
            prefecture = u.prefecture.orEmpty(),
            cityTown = u.cityTown.orEmpty(),
            addressLine = u.addressLine.orEmpty(),
            notificationsEnabled = u.notificationsEnabled,
        )
    }

    fun setLastName(v: String) { _ui.value = _ui.value.copy(lastName = v) }
    fun setFirstName(v: String) { _ui.value = _ui.value.copy(firstName = v) }
    fun setLastNameKana(v: String) { _ui.value = _ui.value.copy(lastNameKana = v) }
    fun setFirstNameKana(v: String) { _ui.value = _ui.value.copy(firstNameKana = v) }
    fun setPhone(v: String) { _ui.value = _ui.value.copy(phone = v) }
    fun setPostalCode(v: String) { _ui.value = _ui.value.copy(postalCode = v) }
    fun setPrefecture(v: String) { _ui.value = _ui.value.copy(prefecture = v) }
    fun setCityTown(v: String) { _ui.value = _ui.value.copy(cityTown = v) }
    fun setAddressLine(v: String) { _ui.value = _ui.value.copy(addressLine = v) }
    fun setNotifications(v: Boolean) { _ui.value = _ui.value.copy(notificationsEnabled = v) }

    fun save() {
        val s = _ui.value
        viewModelScope.launch {
            _ui.value = s.copy(isSaving = true, error = null)
            runCatching {
                api.updateMe(
                    UpdateProfileRequest(
                        firstName = s.firstName.ifBlank { null },
                        lastName = s.lastName.ifBlank { null },
                        firstNameKana = s.firstNameKana.ifBlank { null },
                        lastNameKana = s.lastNameKana.ifBlank { null },
                        phone = s.phone.ifBlank { null },
                        postalCode = s.postalCode.ifBlank { null },
                        prefecture = s.prefecture.ifBlank { null },
                        cityTown = s.cityTown.ifBlank { null },
                        addressLine = s.addressLine.ifBlank { null },
                        notificationsEnabled = s.notificationsEnabled,
                    ),
                )
            }
                .onSuccess {
                    _ui.value = _ui.value.copy(isSaving = false, saved = true)
                }
                .onFailure { e ->
                    _ui.value = _ui.value.copy(
                        isSaving = false,
                        error = e.localizedMessage ?: "保存失敗",
                    )
                }
        }
    }
}
