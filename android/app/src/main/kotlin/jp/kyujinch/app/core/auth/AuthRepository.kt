package jp.kyujinch.app.core.auth

import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.LoginRequest
import jp.kyujinch.app.core.network.RefreshRequest
import jp.kyujinch.app.core.network.RegisterRequest
import jp.kyujinch.app.core.network.UserProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: KyujinchApi,
    private val tokenStore: AuthTokenStore,
) {
    val isLoggedIn: Flow<Boolean> = tokenStore.accessTokenFlow.map { !it.isNullOrEmpty() }

    suspend fun login(email: String, password: String): UserProfile {
        val res = api.login(LoginRequest(email, password))
        tokenStore.save(res.accessToken, res.refreshToken)
        return res.user
    }

    suspend fun register(email: String, password: String, name: String): UserProfile {
        val res = api.register(
            RegisterRequest(
                email = email,
                password = password,
                name = name,
                agreedTerms = true,
                agreedPrivacy = true,
            ),
        )
        tokenStore.save(res.accessToken, res.refreshToken)
        return res.user
    }

    suspend fun logout() {
        val refresh = tokenStore.refreshTokenFlow.firstOrNull()
        if (!refresh.isNullOrEmpty()) {
            runCatching { api.logout(RefreshRequest(refresh)) }
        }
        tokenStore.clear()
    }
}
