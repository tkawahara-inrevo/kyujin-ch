package jp.kyujinch.app.core.auth

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.authDataStore by preferencesDataStore(name = "auth_tokens")

@Singleton
class AuthTokenStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val keyAccess = stringPreferencesKey("access_token")
    private val keyRefresh = stringPreferencesKey("refresh_token")

    val accessTokenFlow: Flow<String?> = context.authDataStore.data.map { it[keyAccess] }
    val refreshTokenFlow: Flow<String?> = context.authDataStore.data.map { it[keyRefresh] }

    suspend fun save(access: String, refresh: String) {
        context.authDataStore.edit {
            it[keyAccess] = access
            it[keyRefresh] = refresh
        }
    }

    suspend fun saveAccess(access: String) {
        context.authDataStore.edit { it[keyAccess] = access }
    }

    suspend fun clear() {
        context.authDataStore.edit { it.clear() }
    }
}
