package jp.kyujinch.app.core.network

import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * ネットワークエラー・5xx 時に最大 2 回まで自動リトライ。
 * GET 系のみリトライ (POST/PATCH 等は副作用避けるためリトライしない)。
 */
@Singleton
class RetryInterceptor @Inject constructor() : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        // 副作用のない GET のみリトライ対象
        if (request.method != "GET") return chain.proceed(request)

        var attempt = 0
        var lastException: IOException? = null
        var lastResponse: Response? = null

        while (attempt < MAX_ATTEMPTS) {
            attempt++
            try {
                lastResponse?.close()
                val response = chain.proceed(request)
                if (response.isSuccessful || response.code in NON_RETRY_CODES) {
                    return response
                }
                lastResponse = response
            } catch (e: IOException) {
                lastException = e
            }

            if (attempt < MAX_ATTEMPTS) {
                // exponential backoff: 300ms, 600ms
                try {
                    Thread.sleep(300L * (1L shl (attempt - 1)))
                } catch (ignored: InterruptedException) {
                    Thread.currentThread().interrupt()
                }
            }
        }

        return lastResponse ?: throw (lastException ?: IOException("リトライ上限到達"))
    }

    companion object {
        private const val MAX_ATTEMPTS = 3 // 初回 + 2 リトライ
        // 401, 403, 404 などはリトライしても結果変わらないので除外
        private val NON_RETRY_CODES = setOf(400, 401, 403, 404, 409, 422)
    }
}
