package jp.kyujinch.app.core.notification

import android.content.Context
import android.provider.Settings
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.qualifiers.ApplicationContext
import jp.kyujinch.app.core.network.KyujinchApi
import jp.kyujinch.app.core.network.RegisterDeviceRequest
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 起動時 or ログイン直後に呼び出して、現在の FCM トークンを取得し
 * バックエンドに登録する。
 */
@Singleton
class FcmTokenManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: KyujinchApi,
) {
    private val deviceId: String by lazy {
        Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown-android"
    }

    /**
     * 現在の FCM トークンを取得してサーバーに登録する。
     * 認証されていない場合は失敗するので、ログイン後に呼び出すこと。
     */
    suspend fun registerCurrentToken(): Result<String> = runCatching {
        val token = FirebaseMessaging.getInstance().token.await()
        api.registerDevice(RegisterDeviceRequest(token = token, deviceId = deviceId))
        token
    }
}
