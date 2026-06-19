package jp.kyujinch.app.core.network

import jp.kyujinch.app.core.auth.AuthTokenStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Authorization: Bearer ヘッダーをリクエストに自動付与する。
 * トークンがない or 認証不要のエンドポイント（auth/*）はそのまま通す。
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenStore: AuthTokenStore,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val req = chain.request()
        // /auth/* は認証ヘッダー不要（login, register, refresh）
        if (req.url.encodedPath.contains("/auth/")) {
            return chain.proceed(req)
        }
        val token = runBlocking { tokenStore.accessTokenFlow.firstOrNull() }
        val newReq = if (token.isNullOrEmpty()) req
        else req.newBuilder().addHeader("Authorization", "Bearer $token").build()
        return chain.proceed(newReq)
    }
}
