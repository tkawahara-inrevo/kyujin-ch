package jp.kyujinch.app.core.auth

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.biometricDataStore by preferencesDataStore(name = "biometric_pref")

@Singleton
class BiometricStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val keyEnabled = booleanPreferencesKey("enabled")

    val enabledFlow: Flow<Boolean> = context.biometricDataStore.data.map { it[keyEnabled] ?: false }

    suspend fun setEnabled(enabled: Boolean) {
        context.biometricDataStore.edit { it[keyEnabled] = enabled }
    }
}
