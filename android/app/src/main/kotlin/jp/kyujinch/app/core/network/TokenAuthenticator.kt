package jp.kyujinch.app.core.network

import jp.kyujinch.app.core.auth.AuthTokenStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

/**
 * 401 を受けたら refresh token で access token を更新してリトライ。
 * リフレッシュも失敗した場合はトークンをクリアしてログイン画面へ。
 *
 * Note: KyujinchApi は循環依存になるので Provider で遅延注入する。
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenStore: AuthTokenStore,
    private val apiProvider: Provider<KyujinchApi>,
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? = synchronized(this) {
        // 同じリクエストを何度もリトライしないよう、リトライ回数をカウント
        if (responseCount(response) >= 2) {
            // 2回目の 401 → リフレッシュ後もダメ → 諦め
            runBlocking { tokenStore.clear() }
            return null
        }

        val refresh = runBlocking { tokenStore.refreshTokenFlow.firstOrNull() }
        if (refresh.isNullOrEmpty()) {
            runBlocking { tokenStore.clear() }
            return null
        }

        // refresh API を叩いて新しいトークンを取得
        val newTokens = runCatching {
            runBlocking { apiProvider.get().refresh(RefreshRequest(refresh)) }
        }.getOrNull()

        if (newTokens == null) {
            runBlocking { tokenStore.clear() }
            return null
        }

        runBlocking { tokenStore.save(newTokens.accessToken, newTokens.refreshToken) }

        return response.request.newBuilder()
            .header("Authorization", "Bearer ${newTokens.accessToken}")
            .build()
    }

    private fun responseCount(response: Response): Int {
        var r = response.priorResponse
        var count = 1
        while (r != null) {
            count++
            r = r.priorResponse
        }
        return count
    }
}
