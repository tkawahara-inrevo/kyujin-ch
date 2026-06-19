package jp.kyujinch.app.core.notification

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * FCM プッシュ受信。
 * - 新しいトークンが発行された時にサーバーへ登録
 * - メッセージ受信時に通知表示 (TODO)
 */
@AndroidEntryPoint
class PushService : FirebaseMessagingService() {

    @Inject lateinit var tokenManager: FcmTokenManager

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "新しい FCM トークン取得: ${token.take(12)}...")
        scope.launch {
            tokenManager.registerCurrentToken()
                .onFailure { Log.w(TAG, "FCM 登録失敗（未ログインの可能性）", it) }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "FCM メッセージ受信: ${message.data}")
        // TODO: NotificationCompat で通知表示
    }

    companion object {
        private const val TAG = "PushService"
    }
}
